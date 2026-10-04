import { PROTOCOL_VERSION } from '../src/game/protocol/version';
import { DynamoStore, LOCAL_TABLES, attributes, localClient } from './dynamo';
import { DynamoProfileRepository } from './profile-repository';
import type { ProfileRepository } from './profile-repository';
import { DynamoMultiplayerRepository, tokenHash } from './multiplayer-repository';
import { ApiError, errorIs, resultSchema } from './models';
import type { MatchResult, MatchStart, Profile, RoomStatus, RunRecord } from './models';
import type { MultiplayerSettings } from './config';

export interface Identity {
    subject: string;
    email: string;
    password_salt: Uint8Array;
    password_hash: Uint8Array;
    confirmed: boolean;
    confirmation_code: string | null;
    reset_code: string | null;
    session_version: number;
}
export interface IdentityRepository {
    identityForSubject(subject: string): Promise<Identity | undefined>;
    identityForEmail(email: string): Promise<Identity | undefined>;
    createIdentity(
        subject: string,
        email: string,
        salt: Uint8Array,
        hash: Uint8Array,
        code: string | null
    ): Promise<void>;
    seedIdentity(
        subject: string,
        email: string,
        salt: Uint8Array,
        hash: Uint8Array,
        profile: Profile
    ): Promise<void>;
    confirmIdentity(email: string, code: string): Promise<void>;
    setConfirmationCode(email: string, code: string): Promise<void>;
    setResetCode(email: string, code: string): Promise<void>;
    replacePassword(email: string, code: string, salt: Uint8Array, hash: Uint8Array): Promise<void>;
    putRefreshSession(hash: string, subject: string, expiresAt: number): Promise<void>;
    refreshSubject(hash: string, now: number): Promise<string | undefined>;
    revokeRefreshSession(hash: string): Promise<void>;
}
/** Configure logical local regions and isolated production-shaped tables. */
export function localMultiplayerSettings(
    origin: string,
    websocketUrl: string
): MultiplayerSettings {
    return {
        stage: 'development',
        controlTable: LOCAL_TABLES.control,
        ticketsTable: LOCAL_TABLES.tickets,
        resultsTable: LOCAL_TABLES.results,
        profileTable: LOCAL_TABLES.profiles,
        controlRegion: 'us-east-1',
        ownerSub: 'dev-owner',
        siteOrigin: origin,
        regions: {
            eu: { awsRegion: 'local', instanceId: 'local-eu', websocketUrl },
            na: { awsRegion: 'local', instanceId: 'local-na', websocketUrl },
        },
        heartbeatMaxAge: 30,
        startupTimeout: 180,
        maximumUptime: 14400,
    };
}
/** Add local identities and process registration to the production persistence implementations. */
export class LocalRepository
    extends DynamoMultiplayerRepository
    implements ProfileRepository, IdentityRepository
{
    readonly profiles: DynamoProfileRepository;
    /** Use explicit local credentials, with an injectable store for boundary tests. */
    constructor(endpoint: string, store = new DynamoStore(localClient(endpoint))) {
        super(store, localMultiplayerSettings('http://127.0.0.1:5173', 'ws://127.0.0.1:8080/ws'));
        this.profiles = new DynamoProfileRepository(store, LOCAL_TABLES.profiles);
    }
    /** Retain passwords and profiles when bootstrap encounters existing seeded accounts. */
    async seedIdentity(
        subject: string,
        email: string,
        salt: Uint8Array,
        hash: Uint8Array,
        profile: Profile
    ): Promise<void> {
        if (await this.identityForSubject(subject)) return;
        try {
            await this.createIdentity(subject, email, salt, hash, null);
        } catch (error) {
            if (error instanceof ApiError && error.code === 'ACCOUNT_EXISTS') return;
            throw error;
        }
        await this.putProfile(subject, profile);
    }
    /** Reserve an email and identity together, storing only a derived password hash. */
    async createIdentity(
        subject: string,
        email: string,
        salt: Uint8Array,
        hash: Uint8Array,
        code: string | null
    ): Promise<void> {
        try {
            await this.store.transact([
                {
                    Put: {
                        TableName: LOCAL_TABLES.auth,
                        Item: attributes({
                            pk: `USER#${subject}`,
                            subject,
                            email,
                            password_salt: salt,
                            password_hash: hash,
                            confirmed: code === null,
                            confirmation_code: code,
                            reset_code: null,
                            session_version: 0,
                        }),
                        ConditionExpression: 'attribute_not_exists(pk)',
                    },
                },
                {
                    Put: {
                        TableName: LOCAL_TABLES.auth,
                        Item: attributes({ pk: `EMAIL#${email}`, subject }),
                        ConditionExpression: 'attribute_not_exists(pk)',
                    },
                },
            ]);
        } catch (error) {
            if (errorIs(error, 'TransactionCanceledException'))
                throw new ApiError(409, 'ACCOUNT_EXISTS', 'An account already exists.');
            throw error;
        }
    }
    /** Resolve an email through its unique identity mapping. */
    async identityForEmail(email: string): Promise<Identity | undefined> {
        const item = await this.store.get<{ subject: string }>(LOCAL_TABLES.auth, {
            pk: `EMAIL#${email}`,
        });
        return item ? this.identityForSubject(item.subject) : undefined;
    }
    /** Read existing binary salts and hashes without changing their encoding. */
    identityForSubject(subject: string): Promise<Identity | undefined> {
        return this.store.get(LOCAL_TABLES.auth, { pk: `USER#${subject}` });
    }
    /** Apply a guarded identity change without creating absent users. */
    private async changeIdentity(
        email: string,
        expression: string,
        values: Record<string, unknown>,
        condition = 'attribute_exists(pk)'
    ): Promise<void> {
        const identity = await this.identityForEmail(email);
        if (!identity)
            throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
        try {
            await this.store.update(
                LOCAL_TABLES.auth,
                { pk: `USER#${identity.subject}` },
                {
                    UpdateExpression: expression,
                    ConditionExpression: condition,
                    ExpressionAttributeValues: values,
                }
            );
        } catch (error) {
            if (errorIs(error, 'ConditionalCheckFailedException'))
                throw new ApiError(400, 'INVALID_CODE', 'The confirmation code is invalid.');
            throw error;
        }
    }
    /** Consume a confirmation code exactly once. */
    confirmIdentity(email: string, code: string): Promise<void> {
        return this.changeIdentity(
            email,
            'SET confirmed = :yes REMOVE confirmation_code',
            { ':yes': true, ':code': code },
            'confirmation_code = :code'
        );
    }
    /** Reset confirmation only while the account is unconfirmed. */
    setConfirmationCode(email: string, code: string): Promise<void> {
        return this.changeIdentity(
            email,
            'SET confirmation_code = :code',
            { ':code': code, ':no': false },
            'confirmed = :no'
        );
    }
    /** Set a recovery code for an existing account. */
    setResetCode(email: string, code: string): Promise<void> {
        return this.changeIdentity(email, 'SET reset_code = :code', { ':code': code });
    }
    /** Replace credentials and invalidate older refresh sessions atomically. */
    replacePassword(
        email: string,
        code: string,
        salt: Uint8Array,
        hash: Uint8Array
    ): Promise<void> {
        return this.changeIdentity(
            email,
            'SET password_salt = :salt, password_hash = :hash REMOVE reset_code ADD session_version :one',
            { ':salt': salt, ':hash': hash, ':one': 1, ':code': code },
            'reset_code = :code'
        );
    }
    /** Bind an opaque refresh token digest to the current password version. */
    async putRefreshSession(hash: string, subject: string, expiresAt: number): Promise<void> {
        const identity = await this.identityForSubject(subject);
        if (!identity) throw new ApiError(401, 'AUTH_REQUIRED', 'Log in to continue.');
        await this.store.put(LOCAL_TABLES.auth, {
            pk: `REFRESH#${hash}`,
            subject,
            expiresAt,
            session_version: identity.session_version,
        });
    }
    /** Resolve only live sessions belonging to the current account version. */
    async refreshSubject(hash: string, now: number): Promise<string | undefined> {
        const item = await this.store.get<{
            subject: string;
            expiresAt: number;
            session_version: number;
        }>(LOCAL_TABLES.auth, { pk: `REFRESH#${hash}` });
        if (!item || item.expiresAt <= now) return undefined;
        const identity = await this.identityForSubject(item.subject);
        return identity?.session_version === item.session_version ? item.subject : undefined;
    }
    /** Revoke only one browser's session. */
    revokeRefreshSession(hash: string): Promise<void> {
        return this.store.delete(LOCAL_TABLES.auth, { pk: `REFRESH#${hash}` });
    }
    /** Local accounts have no paid-service quota but preserve duplicate-email conflicts. */
    async reserveSignup(email: string): Promise<string> {
        if (await this.identityForEmail(email))
            throw new ApiError(409, 'ACCOUNT_EXISTS', 'An account already exists.');
        return tokenHash(email);
    }
    /** Local signup reserves no paid-service capacity. */
    async releaseSignup(): Promise<void> {
        /* No local quota to release. */
    }
    /** Local HTTP requests have no control-plane cooldown; socket limits remain unchanged. */
    override async limit(): Promise<void> {
        /* No paid-service throttling locally. */
    }
    /** Reuse production account profile writes. */
    putProfile(subject: string, profile: Profile): Promise<void> {
        return this.profiles.putProfile(subject, profile);
    }
    /** Reuse production profile fallback behavior. */
    override getProfile(subject: string): Promise<Profile> {
        return this.profiles.getProfile(subject);
    }
    /** Reuse production solo record retention. */
    getRecords(subject: string): Promise<RunRecord[]> {
        return this.profiles.getRecords(subject);
    }
    /** Reuse production immutable record writes. */
    saveRecords(subject: string, records: RunRecord[]): Promise<RunRecord[]> {
        return this.profiles.saveRecords(subject, records);
    }
    /** Clear solo records without deleting the identity. */
    clearRecords(subject: string): Promise<void> {
        return this.profiles.clearRecords(subject);
    }
    /** Initialize one launcher run; Lambda cold starts never call this operation. */
    async resetRuntime(runId: string, generation: string, now: number): Promise<void> {
        const old = await this.getControl();
        if (
            !(await this.replaceControl(old?.revision ?? 0, {
                activeRegion: 'eu',
                instanceId: 'local-eu',
                instanceRunId: runId,
                processGeneration: generation,
                lifecycle: 'starting',
                startedAt: now,
                heartbeatAt: 0,
                uptimeDeadline: now + 7 * 86400,
                protocolVersion: PROTOCOL_VERSION,
            }))
        )
            throw new ApiError(409, 'PROCESS_CONFLICT', 'The local server run has changed.');
    }
    /** CAS-register a replacement's protocol while preserving its run and uptime deadline. */
    async registerProcess(runId: string, generation: string): Promise<boolean> {
        const current = await this.getControl();
        if (!current || current.instanceRunId !== runId) return false;
        if (current.processGeneration === generation) return true;
        return this.replaceControl(current.revision, {
            ...current,
            processGeneration: generation,
            protocolVersion: PROTOCOL_VERSION,
            lifecycle: 'starting',
            heartbeatAt: 0,
            activeMatches: 0,
            connectedPlayers: 0,
            pendingResults: 0,
            rooms: 0,
        });
    }
    /** Publish readiness only for the current run and process generation. */
    async heartbeat(
        runId: string,
        generation: string,
        status: RoomStatus,
        now: number
    ): Promise<boolean> {
        const current = await this.getControl();
        if (!current || current.instanceRunId !== runId || current.processGeneration !== generation)
            return false;
        return this.replaceControl(current.revision, {
            ...current,
            lifecycle: status.draining ? 'draining' : 'ready',
            heartbeatAt: now,
            activeMatches: status.activeMatches,
            connectedPlayers: status.connectedPlayers,
            pendingResults: status.pendingResults,
            rooms: status.rooms,
        });
    }
    /** Reject orphaned old-process starts while allowing exact registered outbox replays. */
    async localMatchStart(item: Omit<MatchStart, 'region'>): Promise<void> {
        const existing = await this.getMatch(item.matchId),
            control = await this.getControl();
        if (
            !existing &&
            (!control ||
                control.instanceRunId !== item.instanceRunId ||
                control.processGeneration !== item.processGeneration ||
                !['ready', 'draining'].includes(control.lifecycle))
        )
            throw new ApiError(404, 'MATCH_START_NOT_FOUND', 'The old match was not registered.');
        await this.putMatchStart({ ...item, region: existing?.region ?? 'eu' });
    }
    /** Bind development results to the region persisted in their immutable start. */
    async localMatchFinish(
        runId: string,
        generation: string,
        result: Omit<MatchResult, 'region'>
    ): Promise<void> {
        const existing = await this.getMatch(result.matchId);
        if (!existing)
            throw new ApiError(409, 'MATCH_CONFLICT', 'The match identity does not match.');
        await this.finishMatch(
            resultSchema.parse({ ...result, region: existing.region }),
            runId,
            generation
        );
    }
}
