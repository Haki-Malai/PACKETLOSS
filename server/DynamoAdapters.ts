import { mkdir, open, readFile, readdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { z } from 'zod';
import { DynamoStore } from '../backend/dynamo';
import { ApiError, matchStartSchema, regionSchema, resultSchema } from '../backend/models';
import { DynamoMultiplayerRepository } from '../backend/multiplayer-repository';
import { PROTOCOL_VERSION } from '../src/game/protocol/version';
import type { RaceSnapshot } from '../src/game/simulation/types';
import type { AuthenticatedPlayer, ResultStore, TicketConsumer } from './RoomService';

export interface DynamoAdapterOptions {
  client: DynamoDBClient;
  controlTable: string;
  ticketsTable: string;
  resultsTable: string;
  region: 'eu' | 'na';
  instanceId: string;
  instanceRunId: string;
  processGeneration: string;
  outboxDirectory: string;
}
const outboxSchema = z.object({ start: matchStartSchema.extend({ region: regionSchema }),
  result: resultSchema.optional(), delivered: z.boolean() });
type OutboxRecord = z.infer<typeof outboxSchema>;

/** Shares persisted multiplayer contracts with the control service while owning process fencing and the durable outbox. */
export class DynamoAdapters implements TicketConsumer, ResultStore {
  private readonly repository: DynamoMultiplayerRepository;

  /** Uses the instance profile; no AWS credentials are accepted from browser messages. */
  constructor(private readonly options: DynamoAdapterOptions) {
    this.repository = new DynamoMultiplayerRepository(new DynamoStore(options.client), options);
  }

  /** Claims a generation and its wire version while retaining the original instance run and uptime deadline. */
  async claim(): Promise<{ deadline: number; draining: boolean }> {
    const now = Math.floor(Date.now() / 1000);
    const previous = await this.options.client.send(new GetItemCommand({ TableName: this.options.controlTable,
      Key: marshall({ pk: 'SERVER' }), ConsistentRead: true }));
    const before: Record<string, unknown> = previous.Item ? unmarshall(previous.Item) : {};
    if (typeof before.revision !== 'number' || !['starting', 'ready', 'draining'].includes(String(before.lifecycle))) {
      throw new Error('Control state does not permit process startup.');
    }
    const draining = before.lifecycle === 'draining';
    const result = await this.options.client.send(new UpdateItemCommand({ TableName: this.options.controlTable,
      Key: marshall({ pk: 'SERVER' }), UpdateExpression: 'SET processGeneration = :generation, protocolVersion = :protocol, heartbeatAt = :now, #phase = :starting ADD revision :one',
      ConditionExpression: 'instanceId = :instance AND instanceRunId = :run AND activeRegion = :region AND uptimeDeadline > :now AND revision = :revision AND #phase IN (:oldStarting, :oldReady, :oldDraining)',
      ExpressionAttributeNames: { '#phase': 'lifecycle' }, ExpressionAttributeValues: marshall({
        ':generation': this.options.processGeneration, ':protocol': PROTOCOL_VERSION,
        ':now': now, ':starting': draining ? 'draining' : 'starting', ':one': 1, ':revision': before.revision,
        ':oldStarting': 'starting', ':oldReady': 'ready', ':oldDraining': 'draining',
        ':instance': this.options.instanceId, ':run': this.options.instanceRunId, ':region': this.options.region }), ReturnValues: 'ALL_NEW' }));
    const record: Record<string, unknown> = result.Attributes ? unmarshall(result.Attributes) : {};
    if (typeof record.uptimeDeadline !== 'number') throw new Error('Missing authoritative uptime deadline.');
    return { deadline: record.uptimeDeadline * 1000, draining };
  }

  /** Publishes a fenced heartbeat; losing ownership must drain the local process. */
  async heartbeat(status: { draining: boolean; activeMatches: number; connectedPlayers: number; pendingResults: number; rooms: number }): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.options.client.send(new UpdateItemCommand({ TableName: this.options.controlTable, Key: marshall({ pk: 'SERVER' }),
      UpdateExpression: 'SET heartbeatAt = :now, #phase = :phase, activeMatches = :active, connectedPlayers = :connected, pendingResults = :pending, #rooms = :rooms ADD revision :one',
      ConditionExpression: 'instanceId = :instance AND instanceRunId = :run AND processGeneration = :generation AND activeRegion = :region AND uptimeDeadline > :now AND #phase IN (:starting, :ready, :allowed)',
      ExpressionAttributeNames: { '#phase': 'lifecycle', '#rooms': 'rooms' }, ExpressionAttributeValues: marshall({ ':now': now,
        ':phase': status.draining ? 'draining' : 'ready', ':starting': 'starting', ':ready': 'ready', ':allowed': status.draining ? 'draining' : 'ready',
        ':active': status.activeMatches, ':connected': status.connectedPlayers, ':pending': status.pendingResults, ':rooms': status.rooms,
        ':one': 1, ':instance': this.options.instanceId,
        ':run': this.options.instanceRunId, ':generation': this.options.processGeneration, ':region': this.options.region }) }));
  }

  /** Distinguishes an externally requested drain from a lost generation or stop fence. */
  async ownership(): Promise<'draining' | 'owned' | 'lost'> {
    const response = await this.options.client.send(new GetItemCommand({ TableName: this.options.controlTable,
      Key: marshall({ pk: 'SERVER' }), ConsistentRead: true }));
    const record: Record<string, unknown> = response.Item ? unmarshall(response.Item) : {};
    if (record.instanceRunId !== this.options.instanceRunId || record.processGeneration !== this.options.processGeneration
      || record.activeRegion !== this.options.region || typeof record.uptimeDeadline !== 'number'
      || record.uptimeDeadline <= Date.now() / 1000 || ['stopping', 'failed', 'stopped'].includes(String(record.lifecycle))) return 'lost';
    return record.lifecycle === 'draining' ? 'draining' : 'owned';
  }

  /** Explicit protected resume is the only operation allowed to clear a central drain fence. */
  async resume(): Promise<void> {
    await this.options.client.send(new UpdateItemCommand({ TableName: this.options.controlTable, Key: marshall({ pk: 'SERVER' }),
      UpdateExpression: 'SET #phase = :ready ADD revision :one',
      ConditionExpression: 'instanceRunId = :run AND processGeneration = :generation AND activeRegion = :region AND #phase IN (:draining, :ready) AND uptimeDeadline > :now',
      ExpressionAttributeNames: { '#phase': 'lifecycle' }, ExpressionAttributeValues: marshall({ ':run': this.options.instanceRunId,
        ':generation': this.options.processGeneration, ':region': this.options.region, ':draining': 'draining', ':ready': 'ready',
        ':one': 1, ':now': Date.now() / 1000 }) }));
  }

  /** Atomically consumes one current-generation ticket after reading its immutable authorization. */
  async consume(token: string): Promise<AuthenticatedPlayer | null> {
    try {
      const ticket = await this.repository.consumeTicket(token, this.options.region, this.options.instanceRunId,
        this.options.processGeneration, Math.floor(Date.now() / 1000));
      return { playerId: ticket.subject, name: ticket.nickname, operation: ticket.operation,
        ...(ticket.roomCode ? { roomCode: ticket.roomCode } : {}) };
    } catch (error) {
      if (error instanceof ApiError && error.code === 'INVALID_TICKET') return null;
      throw error;
    }
  }

  /** Records a durable immutable start before acknowledging the countdown to participants. */
  async start(snapshot: RaceSnapshot, roomId: string): Promise<void> {
    const record: OutboxRecord = { start: { matchId: snapshot.matchId, roomId, region: this.options.region,
      instanceRunId: this.options.instanceRunId, processGeneration: this.options.processGeneration,
      participants: snapshot.players.map((player) => player.id), startedAt: new Date().toISOString() }, delivered: false };
    await this.write(record);
    await this.repository.putMatchStart(record.start);
  }

  /** Saves the terminal summary locally first, then publishes one immutable authoritative outcome. */
  async save(snapshot: RaceSnapshot): Promise<void> {
    const record = await this.read(snapshot.matchId);
    record.result ??= { matchId: snapshot.matchId, roomId: record.start.roomId, region: record.start.region,
      startedAt: record.start.startedAt, completedAt: new Date().toISOString(),
      outcome: snapshot.phase === 'finished' ? 'completed' : 'aborted', reason: snapshot.abortReason,
      standings: snapshot.phase === 'finished' ? snapshot.rankings.map((rank) => {
        const player = snapshot.players.find((candidate) => candidate.id === rank.playerId)!;
        return { playerId: rank.playerId, nickname: rank.name, score: rank.score, rank: rank.rank,
          color: player.color, connected: player.connected };
      }) : [] };
    await this.write(record);
    await this.deliver(record);
  }

  /** Replays terminal outbox records and aborts unfinished old-process starts without awarding winners. */
  async recover(): Promise<void> {
    await mkdir(this.options.outboxDirectory, { recursive: true, mode: 0o700 });
    const records = await Promise.all((await readdir(this.options.outboxDirectory)).filter((filename) => filename.endsWith('.json'))
      .map(async (filename) => outboxSchema.parse(JSON.parse(await readFile(join(this.options.outboxDirectory, filename), 'utf8')) as unknown)));
    records.sort((a, b) => Number(!!b.result) - Number(!!a.result));
    for (const record of records) {
      if (record.delivered) continue;
      record.result ??= { matchId: record.start.matchId, roomId: record.start.roomId, region: record.start.region,
        startedAt: record.start.startedAt, completedAt: new Date().toISOString(), outcome: 'aborted',
        reason: 'process_restart', standings: [] };
      await this.write(record); await this.deliver(record);
    }
  }

  /** Publishes a durable terminal result with its original run/generation fencing. */
  private async deliver(record: OutboxRecord): Promise<void> {
    if (!record.result || record.delivered) return;
    await this.repository.putMatchStart(record.start);
    await this.repository.finishMatch(record.result, record.start.instanceRunId, record.start.processGeneration);
    record.delivered = true; await this.write(record);
  }

  /** Reads only a server-generated UUID record inside the durable outbox. */
  private async read(matchId: string): Promise<OutboxRecord> {
    return outboxSchema.parse(JSON.parse(await readFile(this.path(matchId), 'utf8')) as unknown);
  }

  /** Rejects path separators even if a future caller accidentally forwards an untrusted identifier. */
  private path(matchId: string): string {
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(matchId)) throw new Error('Invalid result identifier.');
    return join(this.options.outboxDirectory, `${matchId}.json`);
  }

  /** Atomically replaces and fsyncs an outbox record before any cloud write or result acknowledgment. */
  private async write(record: OutboxRecord): Promise<void> {
    await mkdir(this.options.outboxDirectory, { recursive: true, mode: 0o700 });
    const filename = this.path(record.start.matchId), temporary = `${filename}.tmp`;
    const file = await open(temporary, 'w', 0o600);
    try { await file.writeFile(JSON.stringify(record)); await file.sync(); } finally { await file.close(); }
    await rename(temporary, filename);
    const directory = await open(this.options.outboxDirectory, 'r');
    try { await directory.sync(); } finally { await directory.close(); }
  }
}
