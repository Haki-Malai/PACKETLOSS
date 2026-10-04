import { createHash } from 'node:crypto';
import type { TransactWriteItem } from '@aws-sdk/client-dynamodb';
import { DynamoStore, attributes, storageError } from './dynamo';
import { ApiError, errorIs, profileSchema, recordSchema } from './models';
import type { Profile, RunRecord } from './models';

export interface ProfileRepository {
    reserveSignup(email: string, daily: number, total: number): Promise<string>;
    releaseSignup(reservation: string): Promise<void>;
    putProfile(subject: string, profile: Profile): Promise<void>;
    getProfile(subject: string): Promise<Profile>;
    getRecords(subject: string): Promise<RunRecord[]>;
    saveRecords(subject: string, records: RunRecord[]): Promise<RunRecord[]>;
    clearRecords(subject: string): Promise<void>;
}
/** Retain the union of ten best and ten recent records separately for each map and mode. */
export function retainRecords(records: RunRecord[]): RunRecord[] {
    const byId = new Map(records.map((record) => [record.id, record]));
    const retained = new Map<string, RunRecord>();
    for (const [map, mode] of [
        ['default', 'classic'],
        ['demo', 'classic'],
        ['default', 'endless'],
    ]) {
        const group = [...byId.values()].filter(
            (record) => record.map === map && record.mode === mode
        );
        const recent = (a: RunRecord, b: RunRecord) =>
            Date.parse(b.completedAt) - Date.parse(a.completedAt);
        for (const record of [
            ...[...group].sort((a, b) => b.score - a.score || recent(a, b)).slice(0, 10),
            ...[...group].sort(recent).slice(0, 10),
        ])
            retained.set(record.id, record);
    }
    return [...retained.values()].sort(
        (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt)
    );
}
/** Own account partitions and bounded, immutable single-player history. */
export class DynamoProfileRepository implements ProfileRepository {
    /** Share one typed SDK boundary with local and deployed callers. */
    constructor(
        readonly store: DynamoStore,
        readonly table: string
    ) {}
    /** Atomically reserve one email and bounded daily/lifetime account capacity. */
    async reserveSignup(email: string, daily: number, total: number): Promise<string> {
        const reservation = createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
        const day = new Date().toISOString().slice(0, 10);
        try {
            await this.store.transact([
                {
                    Put: {
                        TableName: this.table,
                        Item: attributes({ pk: `SIGNUP#${reservation}`, sk: 'RESERVATION', day }),
                        ConditionExpression: 'attribute_not_exists(pk)',
                    },
                },
                this.counter(`SIGNUPS#${day}`, daily, Math.floor(Date.now() / 1000) + 3 * 86400),
                this.counter('SIGNUPS#TOTAL', total),
            ]);
        } catch (error) {
            if (errorIs(error, 'TransactionCanceledException', 'ConditionalCheckFailedException'))
                throw new ApiError(
                    429,
                    'REGISTRATION_FULL',
                    'Registration is full for now. Try again later.',
                    3600
                );
            storageError(error);
        }
        return reservation;
    }
    /** Release only failed pre-identity reservations without hiding the original auth error. */
    async releaseSignup(reservation: string): Promise<void> {
        try {
            const key = { pk: `SIGNUP#${reservation}`, sk: 'RESERVATION' };
            const item = await this.store.get<{ day: string }>(this.table, key);
            if (!item) return;
            await this.store.transact([
                {
                    Delete: {
                        TableName: this.table,
                        Key: attributes(key),
                        ConditionExpression: 'attribute_exists(pk)',
                    },
                },
                ...[`SIGNUPS#${item.day}`, 'SIGNUPS#TOTAL'].map((sk) => ({
                    Update: {
                        TableName: this.table,
                        Key: attributes({ pk: 'SYSTEM', sk }),
                        UpdateExpression: 'ADD #count :minus',
                        ConditionExpression: '#count > :zero',
                        ExpressionAttributeNames: { '#count': 'count' },
                        ExpressionAttributeValues: attributes({ ':minus': -1, ':zero': 0 }),
                    },
                })),
            ]);
        } catch {
            /* A failed cleanup must not hide the original Cognito error. */
        }
    }
    /** Persist one account profile without touching records or authentication. */
    async putProfile(subject: string, profile: Profile): Promise<void> {
        try {
            await this.store.put(this.table, { pk: `USER#${subject}`, sk: 'PROFILE', ...profile });
        } catch (error) {
            storageError(error);
        }
    }
    /** Create the historical default only when the account has no profile. */
    async getProfile(subject: string): Promise<Profile> {
        try {
            const item = await this.store.get<Profile>(this.table, {
                pk: `USER#${subject}`,
                sk: 'PROFILE',
            });
            if (item) return profileSchema.parse({ nickname: item.nickname, avatar: item.avatar });
            const profile = profileSchema.parse({ nickname: 'PLAYER' });
            await this.putProfile(subject, profile);
            return profile;
        } catch (error) {
            storageError(error);
        }
    }
    /** Load records once so pruning cannot delete an unobserved concurrent upload. */
    private async loadRecords(subject: string): Promise<RunRecord[]> {
        try {
            return (
                await this.store.query<{ sk: string; record?: unknown }>(
                    this.table,
                    `USER#${subject}`
                )
            )
                .filter((item) => item.sk.startsWith('RECORD#'))
                .map((item) => recordSchema.parse(item.record));
        } catch (error) {
            storageError(error);
        }
    }
    /** Return only the canonical bounded record set. */
    async getRecords(subject: string): Promise<RunRecord[]> {
        return retainRecords(await this.loadRecords(subject));
    }
    /** Preserve the first upload for each ID and prune only this retention snapshot. */
    async saveRecords(subject: string, records: RunRecord[]): Promise<RunRecord[]> {
        for (const record of records) {
            try {
                await this.store.put(
                    this.table,
                    { pk: `USER#${subject}`, sk: `RECORD#${record.id}`, record },
                    { ConditionExpression: 'attribute_not_exists(sk)' }
                );
            } catch (error) {
                if (!errorIs(error, 'ConditionalCheckFailedException')) storageError(error);
            }
        }
        const snapshot = await this.loadRecords(subject),
            retained = retainRecords(snapshot),
            keep = new Set(retained.map((record) => record.id));
        try {
            for (const record of snapshot)
                if (!keep.has(record.id))
                    await this.store.delete(this.table, {
                        pk: `USER#${subject}`,
                        sk: `RECORD#${record.id}`,
                    });
        } catch (error) {
            storageError(error);
        }
        return retained;
    }
    /** Clear account records while retaining its profile and identity. */
    async clearRecords(subject: string): Promise<void> {
        try {
            const items = await this.store.query<{ sk: string }>(this.table, `USER#${subject}`);
            for (const item of items)
                if (item.sk.startsWith('RECORD#'))
                    await this.store.delete(this.table, { pk: `USER#${subject}`, sk: item.sk });
        } catch (error) {
            storageError(error);
        }
    }
    /** Build a bounded signup-counter update; the lifetime counter never expires. */
    private counter(sk: string, limit: number, expiry?: number): TransactWriteItem {
        return {
            Update: {
                TableName: this.table,
                Key: attributes({ pk: 'SYSTEM', sk }),
                UpdateExpression: `SET #count = if_not_exists(#count, :zero) + :one${expiry ? ', #expires = :expires' : ''}`,
                ConditionExpression: 'attribute_not_exists(#count) OR #count < :limit',
                ExpressionAttributeNames: {
                    '#count': 'count',
                    ...(expiry ? { '#expires': 'expires_at' } : {}),
                },
                ExpressionAttributeValues: attributes({
                    ':zero': 0,
                    ':one': 1,
                    ':limit': limit,
                    ...(expiry ? { ':expires': expiry } : {}),
                }),
            },
        };
    }
}
