// @vitest-environment jsdom
import { act, cleanup, render, renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
    AccountApi,
    CloudProfile,
    SignupDetails,
} from '../game/infrastructure/adapters/AccountClient';
import { AccountClientError } from '../game/infrastructure/adapters/AccountClient';
import {
    LocalProfileStore,
    type LocalRunRecord,
} from '../game/infrastructure/adapters/LocalProfileStore';
import { GameShell } from '../game/ui/GameShell';
import { useAccountSession } from '../game/ui/useAccountSession';

vi.mock('../game/ui/TitleWordmark', () => ({ mountTitleWordmark: vi.fn() }));

class FakeAccountApi implements AccountApi {
    localDevelopment = false;
    guest = vi.fn((nickname: string) => {
        this.profile = { accountId: 'guest-1', nickname, avatar: 'packet' };
        return Promise.resolve();
    });
    profile: CloudProfile | null = null;
    records: LocalRunRecord[] = [];
    signup = vi.fn((_details: SignupDetails) => Promise.resolve());
    confirmSignup = vi.fn((_email: string, _code: string) => Promise.resolve());
    resendConfirmation = vi.fn((_email: string) => Promise.resolve());
    login = vi.fn((_email: string, _password: string) => Promise.resolve());
    refresh = vi.fn(() => {
        if (!this.profile)
            return Promise.reject(new AccountClientError('SESSION_EXPIRED', 'Expired.', 401));
        return Promise.resolve();
    });
    logout = vi.fn(() => Promise.resolve());
    forgotPassword = vi.fn((_email: string) => Promise.resolve());
    resetPassword = vi.fn((_email: string, _code: string, _password: string) => Promise.resolve());
    getProfile = vi.fn(
        (): Promise<CloudProfile> =>
            Promise.resolve(this.profile ?? { nickname: 'PLAYER', avatar: 'packet' })
    );
    updateProfile = vi.fn((profile: CloudProfile) => Promise.resolve(profile));
    getRecords = vi.fn((): Promise<LocalRunRecord[]> => Promise.resolve(this.records));
    putRecords = vi.fn((records: readonly LocalRunRecord[]) => Promise.resolve([...records]));
    clearRecords = vi.fn(() => Promise.resolve());
}

/** Creates one retained run for account-session race tests. */
function runRecord(id: string, nickname: string, score: number): LocalRunRecord {
    return {
        id,
        completedAt: '2026-01-01T00:00:00.000Z',
        map: 'default',
        nickname,
        outcome: 'lost',
        score,
        lives: 0,
        elapsedMs: 1000,
        pointsCollected: 1,
        totalPoints: 10,
        levelsCleared: 0,
        mode: 'classic',
    };
}

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('account menu flow', () => {
    it('offers name-only play in the local stack and loads the guest profile', async () => {
        const accountClient = new FakeAccountApi();
        accountClient.localDevelopment = true;
        const page = render(<GameShell mapVariant="default" accountClient={accountClient} />);
        await waitFor(() =>
            expect(
                (page.getByRole('button', { name: 'Play as guest' }) as HTMLButtonElement).disabled
            ).toBe(false)
        );
        await userEvent.clear(page.getByLabelText('Player name'));
        await userEvent.type(page.getByLabelText('Player name'), 'FRIEND');
        await userEvent.click(page.getByRole('button', { name: 'Play as guest' }));
        await waitFor(() => expect(accountClient.guest).toHaveBeenCalledWith('FRIEND'));
        expect(page.getByRole('heading', { name: 'MULTIPLAYER' })).toBeTruthy();
        expect(accountClient.signup).not.toHaveBeenCalled();
    });

    it('does not make a local guest wait after an earlier rate-limit response', async () => {
        const client = new FakeAccountApi();
        client.localDevelopment = true;
        client.login.mockRejectedValueOnce(
            new AccountClientError('RATE_LIMITED', 'Try later.', 429, 60000)
        );
        const store = new LocalProfileStore();
        const session = renderHook(() => useAccountSession(client, store));
        await waitFor(() => expect(session.result.current.state.checking).toBe(false));
        await act(async () => {
            await session.result.current.login('bad@example.com', 'x');
        });
        await act(async () => {
            expect(await session.result.current.guest('FRIEND')).toBe(true);
        });
        expect(client.guest).toHaveBeenCalledWith('FRIEND');
        expect(session.result.current.state.profile?.nickname).toBe('FRIEND');
        expect(session.result.current.state.retryAt).toBe(0);
        await act(async () => {
            await session.result.current.resendConfirmation('local@example.com');
        });
        await act(async () => {
            await session.result.current.resendConfirmation('local@example.com');
        });
        expect(client.resendConfirmation).toHaveBeenCalledTimes(2);
    });

    it('uses a one-character minimum only for local signup', async () => {
        const accountClient = new FakeAccountApi();
        accountClient.localDevelopment = true;
        const page = render(<GameShell mapVariant="default" accountClient={accountClient} />);
        await waitFor(() =>
            expect(
                (page.getByRole('button', { name: 'Signup' }) as HTMLButtonElement).disabled
            ).toBe(false)
        );
        await userEvent.click(page.getByRole('button', { name: 'Signup' }));
        expect((page.getByLabelText(/^Password/) as HTMLInputElement).minLength).toBe(1);
        await userEvent.type(page.getByLabelText('Email'), 'simple@example.com');
        await userEvent.type(page.getByLabelText(/^Password/), 'a');
        await userEvent.click(page.getByRole('button', { name: 'Create account' }));
        expect(accountClient.signup).toHaveBeenCalledWith(
            expect.objectContaining({ password: 'a' })
        );
    });

    it('allows Skip while session restoration is stalled', async () => {
        const accountClient = new FakeAccountApi();
        let finishRefresh!: () => void;
        accountClient.refresh.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    finishRefresh = resolve;
                })
        );
        const page = render(<GameShell mapVariant="default" accountClient={accountClient} />);

        expect(page.getByText('Checking for an existing session…')).toBeTruthy();
        await userEvent.click(page.getByRole('button', { name: 'Skip' }));
        expect(
            (page.getByRole('button', { name: 'Start game' }) as HTMLButtonElement).disabled
        ).toBe(false);
        await act(async () => {
            finishRefresh();
            await Promise.resolve();
        });
        expect(page.getByRole('button', { name: 'Start game' })).toBeTruthy();
    });

    it('loads account records only after the profile request completes', async () => {
        const accountClient = new FakeAccountApi();
        accountClient.profile = { nickname: 'PACKET', avatar: 'packet' };
        let finishProfile!: (_profile: CloudProfile) => void;
        accountClient.getProfile.mockImplementation(
            () =>
                new Promise<CloudProfile>((resolve) => {
                    finishProfile = resolve;
                })
        );
        const page = render(<GameShell mapVariant="default" accountClient={accountClient} />);

        await waitFor(() => expect(accountClient.getProfile).toHaveBeenCalledOnce());
        expect(accountClient.getRecords).not.toHaveBeenCalled();
        await act(async () => {
            finishProfile({ nickname: 'PACKET', avatar: 'packet' });
            await Promise.resolve();
        });
        expect(accountClient.getRecords).toHaveBeenCalledOnce();
        expect(page.getByRole('button', { name: 'Start game' })).toBeTruthy();
    });

    it('resends an expired signup code and allows confirmation during the resend cooldown', async () => {
        const accountClient = new FakeAccountApi();
        accountClient.confirmSignup.mockRejectedValueOnce(
            new AccountClientError('INVALID_CODE', 'The confirmation code has expired.', 400)
        );
        const page = render(<GameShell mapVariant="default" accountClient={accountClient} />);
        await waitFor(() =>
            expect(
                (page.getByRole('button', { name: 'Login' }) as HTMLButtonElement).disabled
            ).toBe(false)
        );
        await userEvent.click(page.getByRole('button', { name: 'Login' }));
        await userEvent.click(page.getByRole('button', { name: 'Enter signup code' }));
        await userEvent.type(page.getByLabelText('Email'), 'Player@Example.com');
        await userEvent.type(page.getByLabelText('Verification code'), '123456');
        await userEvent.click(page.getByRole('button', { name: 'Confirm email' }));
        expect(page.getByText('The confirmation code has expired.')).toBeTruthy();
        await userEvent.click(page.getByRole('button', { name: 'Resend code' }));
        expect(accountClient.resendConfirmation).toHaveBeenCalledWith('player@example.com');
        expect(page.getByText('New code sent. Check your email.')).toBeTruthy();
        await userEvent.click(page.getByRole('button', { name: 'Resend code' }));
        expect(accountClient.resendConfirmation).toHaveBeenCalledOnce();
        await userEvent.click(page.getByRole('button', { name: 'Confirm email' }));
        expect(page.getByRole('heading', { name: 'LOGIN' })).toBeTruthy();
    });

    it('offers Signup, Login, and Skip before anonymous local play', async () => {
        const accountClient = new FakeAccountApi();
        const page = render(
            <StrictMode>
                <GameShell mapVariant="default" accountClient={accountClient} />
            </StrictMode>
        );

        await waitFor(() =>
            expect(
                (page.getByRole('button', { name: 'Signup' }) as HTMLButtonElement).disabled
            ).toBe(false)
        );
        expect(page.queryByRole('button', { name: 'Play as guest' })).toBeNull();
        expect((page.getByRole('button', { name: 'Login' }) as HTMLButtonElement).disabled).toBe(
            false
        );
        expect((page.getByRole('button', { name: 'Skip' }) as HTMLButtonElement).disabled).toBe(
            false
        );

        await userEvent.click(page.getByRole('button', { name: 'Skip' }));
        expect(
            (page.getByRole('button', { name: 'Start game' }) as HTMLButtonElement).disabled
        ).toBe(false);
        await userEvent.click(page.getByRole('button', { name: 'Login' }));
        await userEvent.click(page.getByRole('button', { name: 'Enter signup code' }));
        expect(page.getByRole('heading', { name: 'CONFIRM EMAIL' })).toBeTruthy();
        await userEvent.click(page.getByRole('button', { name: 'Back' }));
        await userEvent.click(page.getByRole('button', { name: 'Signup' }));
        await userEvent.type(page.getByLabelText('Email'), 'player@example.com');
        await userEvent.type(page.getByLabelText(/^Password/), 'LongPassword1');
        await userEvent.clear(page.getByLabelText('Player name'));
        await userEvent.type(page.getByLabelText('Player name'), 'PACKET');
        await userEvent.click(page.getByRole('button', { name: 'Create account' }));

        await waitFor(() => expect(accountClient.signup).toHaveBeenCalledOnce());
        expect(page.getByRole('heading', { name: 'CONFIRM EMAIL' })).toBeTruthy();
    });

    it('restores an existing cookie session directly to the title', async () => {
        const accountClient = new FakeAccountApi();
        accountClient.profile = { nickname: 'VIRUS', avatar: 'virus' };
        accountClient.records = [
            {
                id: 'cloud-run',
                completedAt: '2026-01-01T00:00:00.000Z',
                map: 'default',
                nickname: 'VIRUS',
                outcome: 'lost',
                score: 9000,
                lives: 0,
                elapsedMs: 1000,
                pointsCollected: 1,
                totalPoints: 10,
                levelsCleared: 0,
                mode: 'classic',
            },
        ];
        const values = new Map<string, string>();
        const store = new LocalProfileStore({
            getItem: (key) => values.get(key) ?? null,
            setItem: (key, value) => {
                values.set(key, value);
            },
        });
        const page = render(
            <GameShell mapVariant="default" accountClient={accountClient} store={store} />
        );

        await waitFor(() => expect(page.getByText('VIRUS · VIRUS')).toBeTruthy());
        expect(page.getByText('BEST 9,000')).toBeTruthy();
        expect(store.getNickname()).toBe('VIRUS');
        expect(
            (page.getByRole('button', { name: 'Start game' }) as HTMLButtonElement).disabled
        ).toBe(false);
    });

    it('ignores a save response from an account that logged out before it completed', async () => {
        const accountClient = new FakeAccountApi();
        const firstRecord = runRecord('first-run', 'FIRST', 100);
        const secondRecord = runRecord('second-run', 'SECOND', 200);
        accountClient.profile = { accountId: 'first', nickname: 'FIRST', avatar: 'packet' };
        let finishSave!: (_records: LocalRunRecord[]) => void;
        accountClient.putRecords.mockImplementation(
            () =>
                new Promise<LocalRunRecord[]>((resolve) => {
                    finishSave = resolve;
                })
        );
        const values = new Map<string, string>();
        const store = new LocalProfileStore({
            getItem: (key) => values.get(key) ?? null,
            setItem: (key, value) => {
                values.set(key, value);
            },
        });
        const session = renderHook(() => useAccountSession(accountClient, store));
        await waitFor(() => expect(session.result.current.state.profile?.accountId).toBe('first'));

        let saving!: Promise<void>;
        act(() => {
            saving = session.result.current.saveRecords([firstRecord]);
        });
        await act(async () => session.result.current.logout());
        accountClient.profile = { accountId: 'second', nickname: 'SECOND', avatar: 'virus' };
        accountClient.records = [secondRecord];
        await act(async () => {
            await session.result.current.login('second@example.com', 'password');
        });
        await act(async () => {
            finishSave([firstRecord]);
            await saving;
        });

        expect(session.result.current.state.profile?.accountId).toBe('second');
        expect(session.result.current.state.records).toEqual([secondRecord]);
    });

    it('blocks login until the preceding logout request finishes', async () => {
        const accountClient = new FakeAccountApi();
        accountClient.profile = { accountId: 'first', nickname: 'FIRST', avatar: 'packet' };
        let finishLogout!: () => void;
        accountClient.logout.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    finishLogout = resolve;
                })
        );
        const store = new LocalProfileStore();
        const session = renderHook(() => useAccountSession(accountClient, store));
        await waitFor(() => expect(session.result.current.state.profile?.accountId).toBe('first'));

        let loggingOut!: Promise<void>;
        act(() => {
            loggingOut = session.result.current.logout();
        });
        expect(session.result.current.state).toMatchObject({ profile: null, busy: true });
        await expect(session.result.current.login('second@example.com', 'password')).resolves.toBe(
            false
        );
        expect(accountClient.login).not.toHaveBeenCalled();

        await act(async () => {
            finishLogout();
            await loggingOut;
        });
        expect(session.result.current.state.busy).toBe(false);
    });
});
