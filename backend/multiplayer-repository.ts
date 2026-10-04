import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { DynamoStore, attributes } from './dynamo';
import { ApiError, errorIs, profileSchema, ticketRecordSchema } from './models';
import type {
    ControlRecord,
    MatchRecord,
    MatchResult,
    MatchStart,
    Phase,
    Profile,
    Region,
    TicketRecord,
} from './models';
import type { MultiplayerSettings } from './config';

type MultiplayerTables = Pick<
    MultiplayerSettings,
    'controlTable' | 'ticketsTable' | 'resultsTable'
> & Partial<Pick<MultiplayerSettings, 'profileTable'>>;

export interface MultiplayerRepository {
    getControl(): Promise<ControlRecord | undefined>;
    replaceControl(revision: number, state: Omit<ControlRecord, 'revision'>): Promise<boolean>;
    failStart(runId: string): Promise<void>;
    limit(key: string, limit: number, window: number, now: number): Promise<void>;
    getProfile(subject: string): Promise<Profile>;
    putTicket(token: string, item: TicketRecord): Promise<void>;
    getMatch(matchId: string): Promise<MatchRecord | undefined>;
    operatorPhase(
        expected: ControlRecord,
        phase: Phase,
        now: number,
        force: boolean
    ): Promise<ControlRecord>;
}
/** Store only the SHA-256 digest of bearer credentials. */
export function tokenHash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}
/** Implement conditional lifecycle, single-use ticket, and immutable match contracts. */
export class DynamoMultiplayerRepository implements MultiplayerRepository {
    /** Keep production and local table selection separate from shared transaction semantics. */
    constructor(
        readonly store: DynamoStore,
        readonly settings: MultiplayerTables
    ) {}
    /** Read current central ownership consistently. */
    getControl(): Promise<ControlRecord | undefined> {
        return this.store.get(this.settings.controlTable, { pk: 'SERVER' });
    }
    /** Claim exactly one lifecycle revision under concurrent starts and reloads. */
    async replaceControl(
        revision: number,
        state: Omit<ControlRecord, 'revision'>
    ): Promise<boolean> {
        try {
            await this.store.put(
                this.settings.controlTable,
                { ...state, pk: 'SERVER', revision: revision + 1 },
                {
                    ConditionExpression: revision ? 'revision = :old' : 'attribute_not_exists(pk)',
                    ...(revision ? { ExpressionAttributeValues: { ':old': revision } } : {}),
                }
            );
            return true;
        } catch (error) {
            if (errorIs(error, 'ConditionalCheckFailedException')) return false;
            throw error;
        }
    }
    /** Preserve a failed or ambiguous start's regional reservation. */
    async failStart(runId: string): Promise<void> {
        try {
            await this.store.update(
                this.settings.controlTable,
                { pk: 'SERVER' },
                {
                    UpdateExpression: 'SET #phase = :failed ADD revision :one',
                    ConditionExpression: 'instanceRunId = :run AND #phase = :starting',
                    ExpressionAttributeNames: { '#phase': 'lifecycle' },
                    ExpressionAttributeValues: {
                        ':failed': 'failed',
                        ':starting': 'starting',
                        ':run': runId,
                        ':one': 1,
                    },
                }
            );
        } catch (error) {
            if (!errorIs(error, 'ConditionalCheckFailedException')) throw error;
        }
    }
    /** Fence operator transitions to instance, run, generation, region, and previous phase. */
    async operatorPhase(
        expected: ControlRecord,
        phase: Phase,
        now: number,
        force: boolean
    ): Promise<ControlRecord> {
        try {
            const result = await this.store.update<ControlRecord>(
                this.settings.controlTable,
                { pk: 'SERVER' },
                {
                    UpdateExpression:
                        'SET #phase = :phase, stopRequestedAt = :now, stopForced = :force ADD revision :one',
                    ConditionExpression:
                        'instanceId = :instance AND instanceRunId = :run AND processGeneration = :generation AND activeRegion = :region AND #phase = :previous',
                    ExpressionAttributeNames: { '#phase': 'lifecycle' },
                    ExpressionAttributeValues: {
                        ':phase': phase,
                        ':now': now,
                        ':force': force,
                        ':one': 1,
                        ':instance': expected.instanceId,
                        ':run': expected.instanceRunId,
                        ':generation': expected.processGeneration,
                        ':region': expected.activeRegion,
                        ':previous': expected.lifecycle,
                    },
                    ReturnValues: 'ALL_NEW',
                }
            );
            if (!result) throw new Error('Missing updated ownership');
            return result;
        } catch (error) {
            if (errorIs(error, 'ConditionalCheckFailedException'))
                throw new ApiError(
                    409,
                    'LIFECYCLE_CHANGED',
                    'Server ownership changed; inspect again.'
                );
            throw error;
        }
    }
    /** Increment a bounded fixed-window counter whose key does not disclose identity. */
    async limit(key: string, limit: number, window: number, now: number): Promise<void> {
        try {
            await this.store.update(
                this.settings.controlTable,
                { pk: `RATE#${tokenHash(key)}#${Math.floor(now / window)}` },
                {
                    UpdateExpression: 'SET expiresAt = :expiry ADD #count :one',
                    ConditionExpression: 'attribute_not_exists(#count) OR #count < :limit',
                    ExpressionAttributeNames: { '#count': 'count' },
                    ExpressionAttributeValues: {
                        ':expiry': now + 2 * window,
                        ':one': 1,
                        ':limit': limit,
                    },
                }
            );
        } catch (error) {
            if (errorIs(error, 'ConditionalCheckFailedException'))
                throw new ApiError(429, 'RATE_LIMITED', 'Try again shortly.', window);
            throw error;
        }
    }
    /** Read the trusted account profile without granting the control Lambda write access. */
    async getProfile(subject: string): Promise<Profile> {
        if (!this.settings.profileTable) throw new Error('Profile table is not configured.');
        const item = await this.store.get<Profile>(this.settings.profileTable, {
            pk: `USER#${subject}`,
            sk: 'PROFILE',
        });
        return profileSchema.parse({
            nickname: item?.nickname ?? 'PLAYER',
            avatar: item?.avatar ?? 'packet',
        });
    }
    /** Store no plaintext ticket secret. */
    async putTicket(token: string, item: TicketRecord): Promise<void> {
        await this.store.put(
            this.settings.ticketsTable,
            { ...item, pk: tokenHash(token), used: false },
            { ConditionExpression: 'attribute_not_exists(pk)' }
        );
    }
    /** Validate immutable ticket data before consuming it under the authoritative generation fence. */
    async consumeTicket(
        token: string,
        region: Region,
        runId: string,
        generation: string,
        now: number
    ): Promise<TicketRecord> {
        const key = { pk: tokenHash(token) },
            parsed = ticketRecordSchema.safeParse(
                await this.store.get<unknown>(this.settings.ticketsTable, key)
            );
        if (!parsed.success)
            throw new ApiError(401, 'INVALID_TICKET', 'The join credential is invalid or expired.');
        const item = parsed.data;
        try {
            await this.store.transact([
                {
                    ConditionCheck: {
                        TableName: this.settings.controlTable,
                        Key: attributes({ pk: 'SERVER' }),
                        ConditionExpression:
                            'instanceRunId = :run AND processGeneration = :generation AND activeRegion = :region AND #phase IN (:ready, :allowed) AND heartbeatAt > :fresh AND uptimeDeadline > :now',
                        ExpressionAttributeNames: { '#phase': 'lifecycle' },
                        ExpressionAttributeValues: attributes({
                            ':run': runId,
                            ':generation': generation,
                            ':region': region,
                            ':ready': 'ready',
                            ':allowed': item.operation === 'reconnect' ? 'draining' : 'ready',
                            ':fresh': now - 30,
                            ':now': now,
                        }),
                    },
                },
                {
                    Update: {
                        TableName: this.settings.ticketsTable,
                        Key: attributes(key),
                        UpdateExpression: 'SET #used = :true, consumedAt = :now',
                        ConditionExpression:
                            '#used = :false AND expiresAt > :now AND #region = :region AND instanceRunId = :run AND processGeneration = :generation',
                        ExpressionAttributeNames: { '#used': 'used', '#region': 'region' },
                        ExpressionAttributeValues: attributes({
                            ':true': true,
                            ':false': false,
                            ':now': now,
                            ':region': region,
                            ':run': runId,
                            ':generation': generation,
                        }),
                    },
                },
            ]);
        } catch (error) {
            if (errorIs(error, 'TransactionCanceledException'))
                throw new ApiError(
                    401,
                    'INVALID_TICKET',
                    'The join credential is invalid or expired.'
                );
            throw error;
        }
        return item;
    }
    /** Read an immutable match identity and its optional final result. */
    getMatch(matchId: string): Promise<MatchRecord | undefined> {
        return this.store.get(this.settings.resultsTable, { pk: matchId });
    }
    /** Permit exact outbox replays while rejecting replacement of a registered roster. */
    async putMatchStart(item: MatchStart): Promise<void> {
        if (
            item.participants.length < 2 ||
            item.participants.length > 4 ||
            new Set(item.participants).size !== item.participants.length
        )
            throw new ApiError(
                422,
                'INVALID_REQUEST',
                'A match must have two to four unique authenticated participants'
            );
        const identity = [
            'matchId',
            'roomId',
            'region',
            'instanceRunId',
            'processGeneration',
            'participants',
            'startedAt',
        ] as const;
        const record = Object.fromEntries(identity.map((key) => [key, item[key]]));
        try {
            await this.store.put(
                this.settings.resultsTable,
                { ...record, pk: item.matchId, lifecycle: 'started' },
                { ConditionExpression: 'attribute_not_exists(pk)' }
            );
        } catch (error) {
            if (!errorIs(error, 'ConditionalCheckFailedException')) throw error;
            const existing = await this.getMatch(item.matchId);
            if (!existing || identity.some((key) => !isDeepStrictEqual(existing[key], item[key])))
                throw new ApiError(409, 'MATCH_CONFLICT', 'The match identity already exists.');
        }
    }
    /** Publish one result matching the immutable roster, accepting only identical final replays. */
    async finishMatch(result: MatchResult, runId: string, generation: string): Promise<void> {
        const existing = await this.getMatch(result.matchId);
        if (
            !existing ||
            existing.instanceRunId !== runId ||
            existing.processGeneration !== generation ||
            existing.roomId !== result.roomId ||
            existing.region !== result.region ||
            existing.startedAt !== result.startedAt
        )
            throw new ApiError(409, 'MATCH_CONFLICT', 'The match identity does not match.');
        const players = result.standings.map((entry) => entry.playerId);
        if (
            result.outcome === 'completed' &&
            (new Set(players).size !== players.length ||
                players.length !== existing.participants.length ||
                players.some((player) => !existing.participants.includes(player)))
        )
            throw new ApiError(
                422,
                'INVALID_REQUEST',
                'Completed standings must contain the immutable participant roster'
            );
        if (result.outcome === 'aborted' && players.length)
            throw new ApiError(422, 'INVALID_REQUEST', 'Aborted matches cannot declare winners');
        try {
            await this.store.update(
                this.settings.resultsTable,
                { pk: result.matchId },
                {
                    UpdateExpression: 'SET #phase = :outcome, #result = :result',
                    ConditionExpression:
                        '#phase = :started AND instanceRunId = :run AND processGeneration = :generation',
                    ExpressionAttributeNames: { '#phase': 'lifecycle', '#result': 'result' },
                    ExpressionAttributeValues: {
                        ':outcome': result.outcome,
                        ':result': result,
                        ':started': 'started',
                        ':run': runId,
                        ':generation': generation,
                    },
                }
            );
        } catch (error) {
            if (!errorIs(error, 'ConditionalCheckFailedException')) throw error;
            if (!isDeepStrictEqual((await this.getMatch(result.matchId))?.result, result))
                throw new ApiError(409, 'MATCH_CONFLICT', 'The match already has a final outcome.');
        }
    }
}
