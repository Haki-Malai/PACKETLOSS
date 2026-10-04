import { mkdir, open, readFile, readdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import type { RaceSnapshot } from '../src/game/simulation/types';
import type { AuthenticatedPlayer, ResultStore, RoomStatus, TicketConsumer } from './RoomService';

export interface DevelopmentAdapterOptions {
    apiOrigin: string;
    internalToken: string;
    instanceRunId: string;
    processGeneration: string;
    outboxDirectory: string;
    fetch?: typeof fetch;
    now?: () => Date;
}

const identitySchema = z
    .object({
        playerId: z.string().min(1).max(128),
        name: z.string().min(1).max(32),
        operation: z.enum(['create', 'join', 'reconnect']),
        roomCode: z
            .string()
            .regex(/^[A-Z2-9]{6}$/)
            .optional(),
    })
    .strict();
const startSchema = z
    .object({
        matchId: z.string().min(1).max(128),
        roomId: z.string().min(1).max(128),
        instanceRunId: z.string().min(1).max(128),
        processGeneration: z.string().min(1).max(128),
        participants: z.array(z.string().min(1).max(128)).min(2).max(4),
        startedAt: z.string(),
    })
    .strict();
const resultSchema = z
    .object({
        matchId: z.string().min(1).max(128),
        roomId: z.string().min(1).max(128),
        startedAt: z.string(),
        completedAt: z.string().nullable(),
        outcome: z.enum(['completed', 'aborted']),
        reason: z.string().nullable(),
        standings: z
            .array(
                z
                    .object({
                        playerId: z.string().min(1).max(128),
                        nickname: z.string().min(1).max(32),
                        color: z.string().regex(/^#[0-9a-f]{6}$/i),
                        score: z.number().int().nonnegative(),
                        rank: z.number().int().min(1).max(4),
                        connected: z.boolean(),
                    })
                    .strict()
            )
            .max(4),
    })
    .strict();
const outboxSchema = z
    .object({ start: startSchema, result: resultSchema.optional(), delivered: z.boolean() })
    .strict();
type OutboxRecord = z.infer<typeof outboxSchema>;

/** Connects the local game process to the loopback-only development API. */
export class DevelopmentAdapters implements TicketConsumer, ResultStore {
    private readonly apiOrigin: string;
    private readonly request: typeof fetch;
    private readonly now: () => Date;

    constructor(private readonly options: DevelopmentAdapterOptions) {
        const origin = new URL(options.apiOrigin);
        if (
            origin.protocol !== 'http:' ||
            origin.hostname !== '127.0.0.1' ||
            origin.pathname !== '/'
        ) {
            throw new Error('The development API must use the loopback HTTP origin.');
        }
        if (options.internalToken.length < 32)
            throw new Error('The development internal token is too short.');
        this.apiOrigin = origin.origin;
        this.request = options.fetch ?? globalThis.fetch;
        this.now = options.now ?? (() => new Date());
    }

    /** Registers a fresh process generation before replaying results or admitting players. */
    async register(): Promise<void> {
        const response = await this.post('/internal/dev/process/register', {
            instanceRunId: this.options.instanceRunId,
            processGeneration: this.options.processGeneration,
        });
        if (response.status !== 204)
            throw new Error(`Development process registration failed with HTTP ${response.status}.`);
    }

    /** Publishes local process status and returns whether this generation owns active admission. */
    async heartbeat(status: RoomStatus): Promise<boolean> {
        const response = await this.post('/internal/dev/heartbeat', {
            instanceRunId: this.options.instanceRunId,
            processGeneration: this.options.processGeneration,
            status,
        });
        if (!response.ok)
            throw new Error(`Development heartbeat failed with HTTP ${response.status}.`);
        return z
            .object({ active: z.boolean() })
            .strict()
            .parse(await response.json()).active;
    }

    /** Atomically consumes one opaque credential through the local control API. */
    async consume(ticket: string): Promise<AuthenticatedPlayer | null> {
        const response = await this.post('/internal/dev/tickets/consume', {
            ticket,
            instanceRunId: this.options.instanceRunId,
            processGeneration: this.options.processGeneration,
        });
        if (response.status === 401 || response.status === 404) return null;
        if (!response.ok)
            throw new Error(`Development ticket consumption failed with HTTP ${response.status}.`);
        return identitySchema.parse(await response.json());
    }

    /** Persists the immutable participant roster before a countdown can be announced. */
    async start(snapshot: RaceSnapshot, roomId: string): Promise<void> {
        const record: OutboxRecord = {
            start: {
                matchId: snapshot.matchId,
                roomId,
                instanceRunId: this.options.instanceRunId,
                processGeneration: this.options.processGeneration,
                participants: snapshot.players.map((player) => player.id),
                startedAt: this.now().toISOString(),
            },
            delivered: false,
        };
        await this.write(record);
        await this.putStart(record.start);
    }

    /** Writes a terminal result to the disk outbox before publishing it to the local API. */
    async save(snapshot: RaceSnapshot): Promise<void> {
        const record = await this.read(snapshot.matchId);
        record.result ??= this.result(record, snapshot);
        await this.write(record);
        await this.deliver(record);
    }

    /** Replays terminal results and aborts starts left unfinished by an earlier local process. */
    async recover(): Promise<void> {
        await mkdir(this.options.outboxDirectory, { recursive: true, mode: 0o700 });
        const filenames = (await readdir(this.options.outboxDirectory)).filter((name) =>
            name.endsWith('.json')
        );
        const records = await Promise.all(
            filenames.map(async (name) =>
                outboxSchema.parse(
                    JSON.parse(
                        await readFile(join(this.options.outboxDirectory, name), 'utf8')
                    ) as unknown
                )
            )
        );
        records.sort((left, right) => Number(!!right.result) - Number(!!left.result));
        for (const record of records) {
            if (record.delivered) continue;
            if (!record.result) {
                const registered = await this.putStart(record.start, true);
                if (!registered) {
                    record.delivered = true;
                    await this.write(record);
                    continue;
                }
                record.result = {
                    matchId: record.start.matchId,
                    roomId: record.start.roomId,
                    startedAt: record.start.startedAt,
                    completedAt: this.now().toISOString(),
                    outcome: 'aborted',
                    reason: 'process_restart',
                    standings: [],
                };
                await this.write(record);
            }
            await this.deliver(record);
        }
    }

    /** Produces the public result shape while retaining its immutable start identity. */
    private result(record: OutboxRecord, snapshot: RaceSnapshot): z.infer<typeof resultSchema> {
        return {
            matchId: snapshot.matchId,
            roomId: record.start.roomId,
            startedAt: record.start.startedAt,
            completedAt: this.now().toISOString(),
            outcome: snapshot.phase === 'finished' ? 'completed' : 'aborted',
            reason: snapshot.abortReason,
            standings:
                snapshot.phase === 'finished'
                    ? snapshot.rankings.map((ranking) => {
                          const player = snapshot.players.find(
                              (candidate) => candidate.id === ranking.playerId
                          );
                          if (!player) throw new Error('A ranking references an unknown player.');
                          return {
                              playerId: ranking.playerId,
                              nickname: ranking.name,
                              color: player.color,
                              score: ranking.score,
                              rank: ranking.rank,
                              connected: player.connected,
                          };
                      })
                    : [],
        };
    }

    /** Publishes an idempotent match start through the private local route. */
    private async putStart(
        start: OutboxRecord['start'],
        acceptMissingRegistration = false
    ): Promise<boolean> {
        const response = await this.post('/internal/dev/matches/start', start);
        if (acceptMissingRegistration && response.status === 404) {
            const error = z
                .object({ code: z.string() })
                .passthrough()
                .safeParse(await response.json().catch(() => null));
            if (error.success && error.data.code === 'MATCH_START_NOT_FOUND') return false;
        }
        if (response.status !== 204)
            throw new Error(`Development match start failed with HTTP ${response.status}.`);
        return true;
    }

    /** Publishes one terminal result and records successful delivery durably. */
    private async deliver(record: OutboxRecord): Promise<void> {
        if (!record.result || record.delivered) return;
        await this.putStart(record.start);
        const response = await this.post('/internal/dev/matches/finish', {
            instanceRunId: record.start.instanceRunId,
            processGeneration: record.start.processGeneration,
            result: record.result,
        });
        if (response.status !== 204)
            throw new Error(`Development match finalization failed with HTTP ${response.status}.`);
        record.delivered = true;
        await this.write(record);
    }

    /** Sends a bounded authenticated JSON request only to the validated loopback origin. */
    private async post(path: string, body: unknown): Promise<Response> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
            return await this.request(`${this.apiOrigin}${path}`, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${this.options.internalToken}`,
                    'content-type': 'application/json',
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeout);
        }
    }

    /** Reads one server-generated match record without accepting path traversal. */
    private async read(matchId: string): Promise<OutboxRecord> {
        return outboxSchema.parse(
            JSON.parse(await readFile(this.path(matchId), 'utf8')) as unknown
        );
    }

    /** Resolves a safe outbox path for one generated match identifier. */
    private path(matchId: string): string {
        if (!/^[A-Za-z0-9_-]{1,128}$/.test(matchId)) throw new Error('Invalid result identifier.');
        return join(this.options.outboxDirectory, `${matchId}.json`);
    }

    /** Atomically replaces and fsyncs one local outbox record. */
    private async write(record: OutboxRecord): Promise<void> {
        await mkdir(this.options.outboxDirectory, { recursive: true, mode: 0o700 });
        const filename = this.path(record.start.matchId);
        const temporary = `${filename}.tmp`;
        const file = await open(temporary, 'w', 0o600);
        try {
            await file.writeFile(JSON.stringify(record));
            await file.sync();
        } finally {
            await file.close();
        }
        await rename(temporary, filename);
        const directory = await open(this.options.outboxDirectory, 'r');
        try {
            await directory.sync();
        } finally {
            await directory.close();
        }
    }
}
