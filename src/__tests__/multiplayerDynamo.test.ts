import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DynamoDBClient, GetItemCommand, PutItemCommand, TransactWriteItemsCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoAdapters } from '../../server/DynamoAdapters';
import { PROTOCOL_VERSION } from '../game/protocol/version';
import { DataRace } from '../game/simulation/DataRace';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

const temporary: string[] = [];
afterEach(async () => { vi.restoreAllMocks(); await Promise.all(temporary.splice(0).map((path) => rm(path, { recursive: true, force: true }))); });

/** Builds an AWS boundary retaining match writes and a real temporary durable outbox. */
async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'packetloss-outbox-')); temporary.push(directory);
  const client = new DynamoDBClient({ region: 'us-east-1' });
  // Select the promise overload for the mocked transport; the SDK's last overload uses callbacks.
  const send = vi.spyOn(client, 'send') as unknown as Mock<(command: GetItemCommand | PutItemCommand
    | TransactWriteItemsCommand | UpdateItemCommand) => Promise<Record<string, unknown>>>;
  const records = new Map<string, Record<string, unknown>>();
  send.mockImplementation((command) => {
    if (command instanceof TransactWriteItemsCommand || command.input.TableName !== 'results') return Promise.resolve({});
    if (command instanceof PutItemCommand) {
      const item = unmarshall(command.input.Item!), key = String(item.pk);
      if (records.has(key)) throw Object.assign(new Error('Already exists'), { name: 'ConditionalCheckFailedException' });
      records.set(key, item);
    } else if (command instanceof GetItemCommand) {
      const item = records.get(String(unmarshall(command.input.Key!).pk));
      return Promise.resolve(item ? { Item: marshall(item) } : {});
    } else if (command instanceof UpdateItemCommand) {
      const key = String(unmarshall(command.input.Key!).pk), values = unmarshall(command.input.ExpressionAttributeValues!);
      const item = records.get(key);
      if (item?.lifecycle !== 'started') throw Object.assign(new Error('Already finished'), { name: 'ConditionalCheckFailedException' });
      records.set(key, { ...item, lifecycle: values[':outcome'], result: values[':result'] });
    }
    return Promise.resolve({});
  });
  const adapter = new DynamoAdapters({ client, region: 'eu', controlTable: 'control', ticketsTable: 'tickets',
    resultsTable: 'results', instanceId: 'i-test', instanceRunId: 'run', processGeneration: 'process', outboxDirectory: directory });
  return { adapter, send, directory };
}

const storedTicket = { subject: 'alice', nickname: 'Alice', avatar: 'packet', region: 'eu',
  instanceRunId: 'run', processGeneration: 'process', operation: 'reconnect', roomCode: 'ABC234',
  issuedAt: 1000, expiresAt: 1060, used: false };

describe('DynamoDB multiplayer boundary', () => {
  it('atomically fences ticket consumption against live control state and current process identity', async () => {
    const { adapter, send } = await fixture();
    send.mockResolvedValueOnce({ Item: marshall(storedTicket) });
    send.mockResolvedValueOnce({});
    expect(await adapter.consume('opaque-secret')).toEqual({ playerId: 'alice', name: 'Alice', operation: 'reconnect', roomCode: 'ABC234' });
    const command = send.mock.calls[1][0];
    expect(command).toBeInstanceOf(TransactWriteItemsCommand);
    if (!(command instanceof TransactWriteItemsCommand)) throw new Error('Missing ticket transaction.');
    const control = command.input.TransactItems![0].ConditionCheck!;
    const ticket = command.input.TransactItems![1].Update!;
    expect(control.ConditionExpression).toContain('heartbeatAt > :fresh');
    expect(unmarshall(control.ExpressionAttributeValues!)).toMatchObject({ ':run': 'run', ':generation': 'process', ':allowed': 'draining' });
    expect(ticket.ConditionExpression).toContain('#used = :false');
    expect(unmarshall(ticket.Key!)).not.toEqual({ pk: 'opaque-secret' });
  });

  it.each([{ nickname: '' }, { operation: 'create' }, { roomCode: null }, { expiresAt: 'forever' }])(
    'rejects malformed persisted ticket %j before consuming it', async (invalid) => {
      const { adapter, send } = await fixture();
      send.mockResolvedValueOnce({ Item: marshall({ ...storedTicket, ...invalid }) });
      expect(await adapter.consume('opaque-secret')).toBeNull();
      expect(send).toHaveBeenCalledTimes(1);
    });

  it('maps a rejected shared ticket transaction to denied authentication without hiding storage failures', async () => {
    const { adapter, send } = await fixture();
    send.mockResolvedValueOnce({ Item: marshall(storedTicket) })
      .mockRejectedValueOnce(Object.assign(new Error('Consumed'), { name: 'TransactionCanceledException' }));
    expect(await adapter.consume('opaque-secret')).toBeNull();
    send.mockRejectedValueOnce(new Error('network unavailable'));
    await expect(adapter.consume('opaque-secret')).rejects.toThrow('network unavailable');
  });

  it('rejects stopping claims and publishes the new protocol without resetting a draining run deadline', async () => {
    const { adapter, send } = await fixture();
    send.mockResolvedValueOnce({ Item: marshall({ revision: 2, lifecycle: 'stopping' }) });
    await expect(adapter.claim()).rejects.toThrow('does not permit');
    send.mockResolvedValueOnce({ Item: marshall({ revision: 3, lifecycle: 'draining', protocolVersion: 1,
      instanceRunId: 'run', uptimeDeadline: 9999999999 }) });
    send.mockResolvedValueOnce({ Attributes: marshall({ uptimeDeadline: 9999999999 }) });
    expect(await adapter.claim()).toEqual({ deadline: 9999999999000, draining: true });
    const command = send.mock.calls[2][0];
    if (!(command instanceof UpdateItemCommand)) throw new Error('Missing process claim.');
    expect(command.input.ConditionExpression).toContain('#phase IN (:oldStarting, :oldReady, :oldDraining)');
    expect(command.input.UpdateExpression).toContain('protocolVersion = :protocol');
    expect(command.input.UpdateExpression).not.toMatch(/instanceRunId|uptimeDeadline/);
    expect(unmarshall(command.input.ExpressionAttributeValues!)).toMatchObject({ ':starting': 'draining', ':revision': 3,
      ':run': 'run', ':protocol': PROTOCOL_VERSION });

    send.mockResolvedValueOnce({});
    await adapter.resume();
    const resume = send.mock.calls[3][0];
    if (!(resume instanceof UpdateItemCommand)) throw new Error('Missing resume fence.');
    expect(resume.input.UpdateExpression).toContain('ADD revision :one');
    expect(unmarshall(resume.input.ExpressionAttributeValues!)).toMatchObject({ ':ready': 'ready', ':one': 1 });
  });

  it('keeps a terminal outbox record through cloud failure and retries its immutable timestamp', async () => {
    const { adapter, send, directory } = await fixture();
    const game = new DataRace(dataRaceFixture(), 'match-1', [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 1);
    await adapter.start(game.snapshot(), 'ABC234'); game.abort('operator_stop');
    send.mockRejectedValueOnce(new Error('network unavailable'));
    await expect(adapter.save(game.snapshot())).rejects.toThrow('network unavailable');
    const pending = JSON.parse(await readFile(join(directory, 'match-1.json'), 'utf8')) as { delivered: boolean; result: { completedAt: string } };
    expect(pending.delivered).toBe(false);
    await adapter.save(game.snapshot());
    const delivered = JSON.parse(await readFile(join(directory, 'match-1.json'), 'utf8')) as typeof pending;
    expect(delivered.delivered).toBe(true); expect(delivered.result.completedAt).toBe(pending.result.completedAt);
  });

  it('recovers completed outcomes before converting interrupted starts to aborted records', async () => {
    const { adapter, send, directory } = await fixture();
    const base = { roomId: 'ABC234', region: 'eu', instanceRunId: 'old-run', processGeneration: 'old-process',
      participants: ['alice', 'bob'], startedAt: '2026-10-03T00:00:00.000Z' };
    const completed = { start: { ...base, matchId: 'z-completed' }, delivered: false,
      result: { matchId: 'z-completed', roomId: base.roomId, region: 'eu', startedAt: base.startedAt,
        completedAt: '2026-10-03T00:03:03.000Z', outcome: 'completed', reason: null, standings: [
          { playerId: 'alice', nickname: 'Alice', color: '#123456', score: 10, rank: 1, connected: true },
          { playerId: 'bob', nickname: 'Bob', color: '#654321', score: 5, rank: 2, connected: false },
        ] } };
    await writeFile(join(directory, 'a-started.json'), JSON.stringify({ start: { ...base, matchId: 'a-started' }, delivered: false }));
    await writeFile(join(directory, 'z-completed.json'), JSON.stringify(completed));
    await adapter.recover();
    const updates = send.mock.calls.map(([command]) => command).filter((command) => command instanceof UpdateItemCommand);
    expect(updates.map((command) => {
      const key: Record<string, unknown> = unmarshall(command.input.Key!); return key.pk;
    })).toEqual(['z-completed', 'a-started']);
    expect(unmarshall(updates[1].input.ExpressionAttributeValues!)).toMatchObject({ ':outcome': 'aborted', ':generation': 'old-process' });
  });

  it('keeps an invalid final roster pending instead of publishing it through the server path', async () => {
    const { adapter, send, directory } = await fixture();
    const game = new DataRace(dataRaceFixture(), 'match-roster', [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 1);
    await adapter.start(game.snapshot(), 'ABC234');
    const path = join(directory, 'match-roster.json');
    const record = JSON.parse(await readFile(path, 'utf8')) as { start: { startedAt: string }; delivered: boolean };
    await writeFile(path, JSON.stringify({ ...record, result: {
      matchId: 'match-roster', roomId: 'ABC234', region: 'eu', startedAt: record.start.startedAt,
      completedAt: '2026-10-03T00:03:03.000Z', outcome: 'completed', reason: null, standings: [
        { playerId: 'alice', nickname: 'Alice', color: '#123456', score: 10, rank: 1, connected: true },
        { playerId: 'mallory', nickname: 'Mallory', color: '#654321', score: 5, rank: 2, connected: true },
      ],
    } }));
    await expect(adapter.recover()).rejects.toThrow('immutable participant roster');
    expect(send.mock.calls.some(([command]) => command instanceof UpdateItemCommand)).toBe(false);
    expect(JSON.parse(await readFile(path, 'utf8')) as unknown).toMatchObject({ delivered: false });
  });
});
