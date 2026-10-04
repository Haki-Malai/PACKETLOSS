import { useEffect, useRef, useState } from 'react';
import type {
    AccountApi,
    AccountClientError,
    CloudProfile,
    SignupDetails,
} from '../infrastructure/adapters/AccountClient';
import {
    retainRunRecords,
    type LocalProfileStore,
    type LocalRunRecord,
} from '../infrastructure/adapters/LocalProfileStore';

interface AccountState {
    checking: boolean;
    busy: boolean;
    profile: CloudProfile | null;
    records: LocalRunRecord[];
    message: string;
    errorCode: string;
    retryAt: number;
    pendingEmail: string;
    pendingRecords: LocalRunRecord[];
}

const ANONYMOUS_STATE: AccountState = {
    checking: false,
    busy: false,
    profile: null,
    records: [],
    message: '',
    errorCode: '',
    retryAt: 0,
    pendingEmail: '',
    pendingRecords: [],
};

/** Owns the optional account session while keeping access tokens inside the API adapter. */
export function useAccountSession(client: AccountApi | null, store: LocalProfileStore) {
    const [state, setState] = useState<AccountState>(() => ({
        ...ANONYMOUS_STATE,
        checking: client !== null,
    }));
    const current = useRef(state);
    const resendAfter = useRef(0);
    const sessionGeneration = useRef(0);

    /** Applies an account-state patch immediately and schedules its React update. */
    function update(patch: Partial<AccountState>): void {
        current.current = { ...current.current, ...patch };
        setState(current.current);
    }

    /** Reports whether an asynchronous completion still belongs to the active account session. */
    function isCurrentSession(generation: number): boolean {
        return sessionGeneration.current === generation;
    }

    /** Loads profile and record data after Cognito has supplied an in-memory token. */
    async function loadAccount(generation: number): Promise<void> {
        if (!client) return;
        // Dev permits one Lambda invocation, so account reads must not overlap.
        const profile = await client.getProfile();
        if (!isCurrentSession(generation)) return;
        const records = await client.getRecords();
        if (!isCurrentSession(generation)) return;
        store.setNickname(profile.nickname);
        update({ profile, records, message: '', errorCode: '', retryAt: 0 });
    }

    useEffect(() => {
        if (!client) return;
        const apiClient = client;
        let active = true;
        const generation = sessionGeneration.current;
        /** Restores a prior cookie session once when the game shell mounts. */
        async function restore(): Promise<void> {
            try {
                await apiClient.refresh();
                if (!active || !isCurrentSession(generation)) return;
                await loadAccount(generation);
            } catch (error) {
                if (!active || !isCurrentSession(generation)) return;
                if (isAccountError(error) && error.status === 401) {
                    update({ ...ANONYMOUS_STATE });
                } else {
                    applyError(error, 'Accounts are temporarily unavailable.');
                }
            } finally {
                if (active && isCurrentSession(generation)) update({ checking: false });
            }
        }
        void restore();
        return () => {
            active = false;
        };
        // The API client and local store are stable for the shell lifetime.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, store]);

    /** Converts an API failure into the message and retry boundary shown by menu forms. */
    function applyError(error: unknown, fallback: string): void {
        if (isAccountError(error)) {
            update({
                busy: false,
                message: error.message,
                errorCode: error.code,
                retryAt:
                    !client?.localDevelopment && error.retryAfterMs
                        ? Date.now() + error.retryAfterMs
                        : 0,
            });
        } else {
            update({ busy: false, message: fallback, errorCode: 'SERVICE_UNAVAILABLE' });
        }
    }

    /** Runs a menu action unless the server's Retry-After boundary is still active. */
    async function perform(
        action: (_generation: number) => Promise<void>,
        fallback: string,
        beginSession = false
    ): Promise<boolean> {
        if (!client || current.current.busy) return false;
        if (!client.localDevelopment && current.current.retryAt > Date.now()) {
            const seconds = Math.max(1, Math.ceil((current.current.retryAt - Date.now()) / 1000));
            update({ message: `Please wait ${seconds} seconds before trying again.` });
            return false;
        }
        const generation = beginSession ? ++sessionGeneration.current : sessionGeneration.current;
        update({ busy: true, message: '', errorCode: '' });
        try {
            await action(generation);
            if (!isCurrentSession(generation)) return false;
            update({ busy: false, message: '', errorCode: '', retryAt: 0 });
            return true;
        } catch (error) {
            if (!isCurrentSession(generation)) return false;
            applyError(error, fallback);
            return false;
        }
    }

    /** Starts email verification for a new account. */
    async function signup(details: SignupDetails): Promise<boolean> {
        const success = await perform(() => client!.signup(details), 'Signup is unavailable.');
        if (success) update({ pendingEmail: details.email.trim().toLowerCase() });
        return success;
    }

    /** Confirms the email code for the pending account. */
    async function confirmSignup(email: string, code: string): Promise<boolean> {
        return perform(
            () => client!.confirmSignup(email.trim().toLowerCase(), code.trim()),
            'Email confirmation is unavailable.'
        );
    }

    /** Resends verification with a production cooldown without delaying code confirmation. */
    async function resendConfirmation(email: string): Promise<boolean> {
        if (!client?.localDevelopment && resendAfter.current > Date.now()) {
            const seconds = Math.ceil((resendAfter.current - Date.now()) / 1000);
            update({ message: `Please wait ${seconds} seconds before requesting another code.` });
            return false;
        }
        const success = await perform(
            () => client!.resendConfirmation(email.trim().toLowerCase()),
            'Email confirmation is unavailable.'
        );
        if (success) {
            resendAfter.current = client?.localDevelopment ? 0 : Date.now() + 60_000;
            update({
                pendingEmail: email.trim().toLowerCase(),
                message: client?.localDevelopment
                    ? 'Local confirmation code: 000000.'
                    : 'New code sent. Check your email.',
            });
        }
        return success;
    }

    /** Logs in and loads the account's profile and records. */
    async function login(email: string, password: string): Promise<boolean> {
        return perform(
            async (generation) => {
                await client!.login(email.trim().toLowerCase(), password);
                if (!isCurrentSession(generation)) return;
                await loadAccount(generation);
            },
            'Login is unavailable.',
            true
        );
    }

    /** Establishes a local guest session and loads its independently persisted profile. */
    async function guest(nickname: string): Promise<boolean> {
        if (!client?.localDevelopment || !client.guest) return false;
        return perform(
            async (generation) => {
                await client.guest!(nickname.trim());
                if (!isCurrentSession(generation)) return;
                await loadAccount(generation);
            },
            'Guest play is unavailable.',
            true
        );
    }

    /** Logs out and returns to anonymous local play even if remote revocation fails. */
    async function logout(): Promise<void> {
        const generation = ++sessionGeneration.current;
        update({ ...ANONYMOUS_STATE, busy: client !== null });
        try {
            if (client) await client.logout();
        } catch {
            // Clearing the client token still makes this browser session anonymous.
        } finally {
            if (isCurrentSession(generation)) update({ busy: false });
        }
    }

    /** Requests an emailed password recovery code. */
    async function forgotPassword(email: string): Promise<boolean> {
        const normalized = email.trim().toLowerCase();
        const success = await perform(
            () => client!.forgotPassword(normalized),
            'Password recovery is unavailable.'
        );
        if (success) {
            update({ pendingEmail: normalized, message: 'Recovery code sent. Check your email.' });
        }
        return success;
    }

    /** Applies a new password using an emailed recovery code. */
    async function resetPassword(email: string, code: string, password: string): Promise<boolean> {
        return perform(
            () => client!.resetPassword(email.trim().toLowerCase(), code.trim(), password),
            'Password recovery is unavailable.'
        );
    }

    /** Replaces the cloud profile and mirrors its nickname for anonymous fallback play. */
    async function updateProfile(profile: CloudProfile): Promise<boolean> {
        return perform(async (generation) => {
            const saved = await client!.updateProfile(profile);
            if (!isCurrentSession(generation)) return;
            store.setNickname(saved.nickname);
            update({ profile: saved });
        }, 'Profile saving is unavailable.');
    }

    /** Saves a completed run once; failures stay local for an explicit retry. */
    async function saveRecords(records: readonly LocalRunRecord[]): Promise<void> {
        if (!client || !current.current.profile || records.length === 0) return;
        const generation = sessionGeneration.current;
        const optimistic = retainRunRecords([...current.current.records, ...records]);
        update({ records: optimistic });
        try {
            const saved = await client.putRecords(records);
            if (!isCurrentSession(generation)) return;
            const completed = new Set(records.map((record) => record.id));
            update({
                records: saved,
                pendingRecords: current.current.pendingRecords.filter(
                    (record) => !completed.has(record.id)
                ),
                message: '',
                errorCode: '',
            });
        } catch (error) {
            if (!isCurrentSession(generation)) return;
            const pending = retainRunRecords([...current.current.pendingRecords, ...records]);
            update({ pendingRecords: pending });
            applyError(error, 'Cloud save failed.');
            update({
                message: `${current.current.message} The run is saved on this device.`,
            });
        }
    }

    /** Retries only cloud saves that previously failed, without importing other local history. */
    async function retryPendingRecords(): Promise<boolean> {
        const pending = current.current.pendingRecords;
        if (pending.length === 0) return true;
        return perform(async (generation) => {
            const saved = await uploadInChunks(pending, generation);
            if (!isCurrentSession(generation)) return;
            update({ records: saved, pendingRecords: [] });
        }, 'Cloud save is still unavailable. Your records remain on this device.');
    }

    /** Imports retained local history only after the player explicitly chooses it. */
    async function importLocalRecords(): Promise<boolean> {
        const records = store.getRecords();
        if (records.length === 0) return true;
        return perform(async (generation) => {
            const saved = await uploadInChunks(records, generation);
            if (!isCurrentSession(generation)) return;
            store.replaceRecords(saved);
            update({ records: saved, pendingRecords: [] });
        }, 'Local records could not be imported. They remain on this device.');
    }

    /** Clears both cloud and local records after the shared confirmation screen. */
    async function clearRecords(): Promise<boolean> {
        if (!current.current.profile) {
            store.clearRecords();
            return true;
        }
        return perform(async (generation) => {
            await client!.clearRecords();
            if (!isCurrentSession(generation)) return;
            store.clearRecords();
            update({ records: [], pendingRecords: [] });
        }, 'Records could not be cleared.');
    }

    /** Uploads bounded chunks so fixed DynamoDB capacity can drain a local import. */
    async function uploadInChunks(
        records: readonly LocalRunRecord[],
        generation: number
    ): Promise<LocalRunRecord[]> {
        let saved = current.current.records;
        for (let index = 0; index < records.length; index += 4) {
            if (!isCurrentSession(generation)) return saved;
            saved = await client!.putRecords(records.slice(index, index + 4));
            if (!isCurrentSession(generation)) return saved;
        }
        return saved;
    }

    const cloudIds = new Set(state.records.map((record) => record.id));
    const hasLocalImport =
        state.profile !== null && store.getRecords().some((record) => !cloudIds.has(record.id));

    return {
        available: client !== null,
        localDevelopment: client?.localDevelopment === true,
        guest,
        state,
        hasLocalImport,
        signup,
        confirmSignup,
        resendConfirmation,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        saveRecords,
        retryPendingRecords,
        importLocalRecords,
        clearRecords,
    };
}

/** Narrows an unknown request failure to the typed account API error. */
function isAccountError(error: unknown): error is AccountClientError {
    return (
        error instanceof Error && 'code' in error && 'status' in error && 'retryAfterMs' in error
    );
}

export type AccountSession = ReturnType<typeof useAccountSession>;
