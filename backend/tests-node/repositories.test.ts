import { describe, expect, it, vi } from 'vitest';
import { PROTOCOL_VERSION } from '../../src/game/protocol/version';
import { DynamoDBClient, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoStore, attributes, localClient } from '../dynamo';
import { DynamoProfileRepository, retainRecords } from '../profile-repository';
import { DynamoMultiplayerRepository, tokenHash } from '../multiplayer-repository';
import { LocalRepository } from '../local-repository';
import type { MatchRecord, MatchResult, RoomStatus, TicketRecord } from '../models';
import { multiplayerSettings, ready, runRecord } from './fixtures';

/** Provide an inert SDK transport while preserving the actual serialization and commands. */
function storeFixture() {
    const client = new DynamoDBClient({
        region: 'us-east-1',
        credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
    });
    const send = vi
        .spyOn(client as unknown as { send(command: unknown): Promise<unknown> }, 'send')
        .mockResolvedValue({ $metadata: {} });
    return { client, send, store: new DynamoStore(client) };
}
/** Reproduce a provider conditional failure without contacting a remote database. */
function conditional(name = 'ConditionalCheckFailedException'): Error {
    return Object.assign(new Error(name), { name });
}
const match: MatchRecord = {
    matchId: 'match',
    roomId: 'room',
    region: 'eu',
    instanceRunId: 'run',
    processGeneration: 'generation',
    participants: ['alice', 'bob'],
    startedAt: 'start',
    lifecycle: 'started',
};
const result: MatchResult = {
    matchId: 'match',
    roomId: 'room',
    region: 'eu',
    startedAt: 'start',
    completedAt: 'end',
    outcome: 'completed',
    reason: null,
    standings: [
        {
            playerId: 'alice',
            nickname: 'ALICE',
            color: '#123456',
            score: 10,
            rank: 1,
            connected: true,
        },
        { playerId: 'bob', nickname: 'BOB', color: '#654321', score: 5, rank: 2, connected: false },
    ],
};
const ticket: TicketRecord = {
    subject: 'alice',
    nickname: 'ALICE',
    avatar: 'packet',
    region: 'eu',
    instanceRunId: 'run',
    processGeneration: 'generation',
    operation: 'join',
    roomCode: 'ABCDEF',
    issuedAt: 1000,
    expiresAt: 1060,
};

describe('account DynamoDB persistence', () => {
    it('marshals transaction values once and never expires the lifetime counter', async () => {
        const { store, send } = storeFixture();
        await new DynamoProfileRepository(store, 'profiles').reserveSignup('a@b.com', 30, 1000);
        const command = send.mock.calls[0][0];
        expect(command).toBeInstanceOf(TransactWriteItemsCommand);
        const items = (command as TransactWriteItemsCommand).input.TransactItems!;
        expect(unmarshall(items[0].Put!.Item!)).toMatchObject({
            pk: `SIGNUP#${tokenHash('a@b.com')}`,
            sk: 'RESERVATION',
        });
        expect(unmarshall(items[1].Update!.ExpressionAttributeValues!)).toMatchObject({
            ':limit': 30,
            ':one': 1,
        });
        expect(unmarshall(items[2].Update!.ExpressionAttributeValues!)).toEqual({
            ':limit': 1000,
            ':zero': 0,
            ':one': 1,
        });
        expect(items[2].Update!.ExpressionAttributeNames).not.toHaveProperty('#expires');
    });
    it('retains the union of best and newest records independently per mode', () => {
        const records = Array.from({ length: 30 }, (_, index) => ({
            ...runRecord,
            id: `r${index}`,
            score: 100 - index,
            completedAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
        }));
        records.push({ ...runRecord, id: 'endless', mode: 'endless', score: 0 });
        const retained = retainRecords(records);
        expect(retained.map((record) => record.id).sort()).toEqual(
            [
                'endless',
                ...Array.from({ length: 10 }, (_, index) => `r${index}`),
                ...Array.from({ length: 10 }, (_, index) => `r${index + 20}`),
            ].sort()
        );
    });
    it('does not delete records added after the retention snapshot or replace an existing ID', async () => {
        const { store } = storeFixture(),
            repository = new DynamoProfileRepository(store, 'profiles');
        const snapshot = Array.from({ length: 21 }, (_, index) => ({
            ...runRecord,
            id: `r${index}`,
            score: index,
            completedAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
        }));
        const put = vi.spyOn(store, 'put').mockRejectedValueOnce(conditional()),
            query = vi
                .spyOn(store, 'query')
                .mockResolvedValue(
                    snapshot.map((record) => ({ sk: `RECORD#${record.id}`, record }))
                );
        const remove = vi.spyOn(store, 'delete').mockResolvedValue();
        const retained = await repository.saveRecords('alice', [
            { ...runRecord, id: 'r20', score: 99999 },
        ]);
        expect(put).toHaveBeenCalledWith('profiles', expect.anything(), {
            ConditionExpression: 'attribute_not_exists(sk)',
        });
        expect(retained.find((record) => record.id === 'r20')?.score).toBe(20);
        expect(query).toHaveBeenCalledTimes(1);
        expect(remove.mock.calls.map((call) => call[1].sk)).toEqual(
            Array.from({ length: 11 }, (_, index) => `RECORD#r${index}`)
        );
        expect(remove).not.toHaveBeenCalledWith('profiles', {
            pk: 'USER#alice',
            sk: 'RECORD#concurrent',
        });
    });
    it('follows pagination while retaining strongly consistent account reads', async () => {
        const { store, send } = storeFixture();
        send.mockResolvedValueOnce({
            $metadata: {},
            Items: [attributes({ pk: 'USER#a', sk: 'RECORD#first' })],
            LastEvaluatedKey: attributes({ pk: 'USER#a', sk: 'RECORD#first' }),
        }).mockResolvedValueOnce({
            $metadata: {},
            Items: [attributes({ pk: 'USER#a', sk: 'RECORD#second' })],
        });
        expect(await store.query('profiles', 'USER#a')).toEqual([
            { pk: 'USER#a', sk: 'RECORD#first' },
            { pk: 'USER#a', sk: 'RECORD#second' },
        ]);
        expect(send).toHaveBeenCalledTimes(2);
    });
});

describe('multiplayer DynamoDB fencing', () => {
    it('stores ticket digests and atomically binds consumption to current control state', async () => {
        const { store } = storeFixture(),
            repository = new DynamoMultiplayerRepository(store, multiplayerSettings);
        const put = vi.spyOn(store, 'put').mockResolvedValue();
        await repository.putTicket('secret-ticket', ticket);
        expect(put).toHaveBeenCalledWith(
            multiplayerSettings.ticketsTable,
            { ...ticket, pk: tokenHash('secret-ticket'), used: false },
            { ConditionExpression: 'attribute_not_exists(pk)' }
        );
        vi.spyOn(store, 'get').mockResolvedValue(ticket);
        const transaction = vi.spyOn(store, 'transact').mockResolvedValue();
        expect(
            await repository.consumeTicket('secret-ticket', 'eu', 'run', 'generation', 1000)
        ).toEqual(ticket);
        const items = transaction.mock.calls[0][0],
            guard = items[0].ConditionCheck!,
            consume = items[1].Update!;
        expect(guard.ConditionExpression).toContain(
            'heartbeatAt > :fresh AND uptimeDeadline > :now'
        );
        expect(unmarshall(guard.ExpressionAttributeValues!)).toEqual({
            ':run': 'run',
            ':generation': 'generation',
            ':region': 'eu',
            ':ready': 'ready',
            ':allowed': 'ready',
            ':fresh': 970,
            ':now': 1000,
        });
        expect(consume.ConditionExpression).toBe(
            '#used = :false AND expiresAt > :now AND #region = :region AND instanceRunId = :run AND processGeneration = :generation'
        );
        transaction.mockRejectedValueOnce(conditional('TransactionCanceledException'));
        await expect(
            repository.consumeTicket('secret-ticket', 'eu', 'run', 'generation', 1000)
        ).rejects.toMatchObject({ code: 'INVALID_TICKET' });
    });
    it('permits only reconnect ticket consumption through a drain fence', async () => {
        const { store } = storeFixture(),
            repository = new DynamoMultiplayerRepository(store, multiplayerSettings);
        vi.spyOn(store, 'get').mockResolvedValue({ ...ticket, operation: 'reconnect' });
        const transaction = vi.spyOn(store, 'transact').mockResolvedValue();
        await repository.consumeTicket('secret', 'eu', 'run', 'generation', 1000);
        expect(
            unmarshall(transaction.mock.calls[0][0][0].ConditionCheck!.ExpressionAttributeValues!)
        ).toHaveProperty(':allowed', 'draining');
    });
    it('losing conditional ownership cannot silently claim a lifecycle or stop', async () => {
        const { store } = storeFixture(),
            repository = new DynamoMultiplayerRepository(store, multiplayerSettings);
        vi.spyOn(store, 'put').mockRejectedValue(conditional());
        expect(await repository.replaceControl(1, ready)).toBe(false);
        vi.spyOn(store, 'update').mockRejectedValue(conditional());
        await expect(
            repository.operatorPhase(ready, 'stopping', 1000, false)
        ).rejects.toMatchObject({ code: 'LIFECYCLE_CHANGED' });
    });
    it('accepts exact match start replays but rejects different identities and duplicate participants', async () => {
        const { store } = storeFixture(),
            repository = new DynamoMultiplayerRepository(store, multiplayerSettings);
        vi.spyOn(store, 'put').mockRejectedValue(conditional());
        vi.spyOn(store, 'get').mockResolvedValue(match);
        await expect(repository.putMatchStart(match)).resolves.toBeUndefined();
        await expect(
            repository.putMatchStart({ ...match, processGeneration: 'other' })
        ).rejects.toMatchObject({ code: 'MATCH_CONFLICT' });
        await expect(
            repository.putMatchStart({ ...match, participants: ['alice', 'alice'] })
        ).rejects.toMatchObject({ statusCode: 422 });
    });
    it('preserves final results and enforces generation, region, and immutable roster', async () => {
        const { store } = storeFixture(),
            repository = new DynamoMultiplayerRepository(store, multiplayerSettings);
        const get = vi.spyOn(store, 'get').mockResolvedValue(match),
            update = vi.spyOn(store, 'update').mockResolvedValue(undefined);
        await repository.finishMatch(result, 'run', 'generation');
        expect(update).toHaveBeenCalledOnce();
        await expect(repository.finishMatch(result, 'run', 'other')).rejects.toMatchObject({
            code: 'MATCH_CONFLICT',
        });
        await expect(
            repository.finishMatch({ ...result, region: 'na' }, 'run', 'generation')
        ).rejects.toMatchObject({ code: 'MATCH_CONFLICT' });
        await expect(
            repository.finishMatch(
                { ...result, standings: result.standings.slice(0, 1) },
                'run',
                'generation'
            )
        ).rejects.toMatchObject({ statusCode: 422 });
        await expect(
            repository.finishMatch({ ...result, outcome: 'aborted' }, 'run', 'generation')
        ).rejects.toMatchObject({ statusCode: 422 });
        update.mockRejectedValue(conditional());
        get.mockResolvedValue({ ...match, result });
        await expect(repository.finishMatch(result, 'run', 'generation')).resolves.toBeUndefined();
        await expect(
            repository.finishMatch(
                {
                    ...result,
                    standings: result.standings.map((player) => ({ ...player, score: 999 })),
                },
                'run',
                'generation'
            )
        ).rejects.toMatchObject({ code: 'MATCH_CONFLICT' });
    });
});

describe('local process lifecycle', () => {
    it('rejects remote DynamoDB endpoints without consulting ambient AWS credentials', async () => {
        expect(() => localClient('https://dynamodb.us-east-1.amazonaws.com')).toThrow(
            'must be local'
        );
        expect(() => localClient('http://user:secret@localhost:8000')).toThrow('must be local');
        const client = localClient('http://localhost:8000');
        await expect(client.config.region()).resolves.toBe('us-east-1');
        client.destroy();
    });
    it('publishes the replacement protocol without resetting the run deadline and rejects stale heartbeats', async () => {
        const { store } = storeFixture(),
            repository = new LocalRepository('http://localhost:8000', store);
        vi.spyOn(repository, 'getControl').mockResolvedValue({ ...ready, protocolVersion: 1 });
        const replace = vi.spyOn(repository, 'replaceControl').mockResolvedValue(true);
        expect(await repository.registerProcess('run', 'replacement')).toBe(true);
        expect(replace).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                processGeneration: 'replacement',
                protocolVersion: PROTOCOL_VERSION,
                instanceRunId: 'run',
                uptimeDeadline: 15000,
                lifecycle: 'starting',
                heartbeatAt: 0,
            })
        );
        expect(await repository.registerProcess('old-run', 'replacement')).toBe(false);
        expect(await repository.heartbeat('run', 'old-generation', {} as RoomStatus, 1000)).toBe(
            false
        );
        replace.mockResolvedValue(false);
        expect(await repository.registerProcess('run', 'replacement')).toBe(false);
    });
    it('accepts registered outbox replay but rejects an orphan from an old process', async () => {
        const { store } = storeFixture(),
            repository = new LocalRepository('http://localhost:8000', store);
        vi.spyOn(repository, 'getControl').mockResolvedValue({
            ...ready,
            processGeneration: 'replacement',
        });
        const get = vi.spyOn(repository, 'getMatch').mockResolvedValue(undefined),
            put = vi.spyOn(repository, 'putMatchStart').mockResolvedValue();
        await expect(repository.localMatchStart(match)).rejects.toMatchObject({
            code: 'MATCH_START_NOT_FOUND',
        });
        get.mockResolvedValue(match);
        await repository.localMatchStart(match);
        expect(put).toHaveBeenCalledWith(match);
    });
});
