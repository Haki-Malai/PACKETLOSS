import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DevelopmentAdapters } from '../../server/DevelopmentAdapters';
import type { RoomStatus } from '../../server/RoomService';
import { DataRace } from '../game/simulation/DataRace';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

const temporary: string[] = [];
afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all(
        temporary.splice(0).map((path) => rm(path, { recursive: true, force: true }))
    );
});

/** Builds a loopback adapter with deterministic time and an inspectable HTTP boundary. */
async function fixture() {
    const directory = await mkdtemp(join(tmpdir(), 'packetloss-dev-outbox-'));
    temporary.push(directory);
    const request = vi.fn<typeof fetch>();
    const adapter = new DevelopmentAdapters({
        apiOrigin: 'http://127.0.0.1:8787',
        internalToken: 'a'.repeat(64),
        instanceRunId: 'local-run',
        processGeneration: 'local-process',
        outboxDirectory: directory,
        fetch: request,
        now: () => new Date('2026-10-03T12:00:00.000Z'),
    });
    return { adapter, request, directory };
}

/** Reads the JSON request body captured by the fetch mock. */
function body(request: Mock<typeof fetch>, index: number): Record<string, unknown> {
    const raw = request.mock.calls[index][1]?.body;
    if (typeof raw !== 'string') throw new Error('Missing JSON request body.');
    return JSON.parse(raw) as Record<string, unknown>;
}

describe('local development multiplayer boundary', () => {
    it('registers its process generation and refuses a rejected startup', async () => {
        const { adapter, request } = await fixture();
        request.mockResolvedValueOnce(new Response(null, { status: 204 }));
        await expect(adapter.register()).resolves.toBeUndefined();
        expect(request.mock.calls[0][0]).toBe('http://127.0.0.1:8787/internal/dev/process/register');
        expect(new Headers(request.mock.calls[0][1]?.headers).get('authorization')).toBe(
            `Bearer ${'a'.repeat(64)}`
        );
        expect(body(request, 0)).toEqual({
            instanceRunId: 'local-run', processGeneration: 'local-process',
        });

        request.mockResolvedValueOnce(new Response(null, { status: 409 }));
        await expect(adapter.register()).rejects.toThrow('registration failed with HTTP 409');
    });

    it('publishes the complete room status under the configured generation fence', async () => {
        const { adapter, request } = await fixture();
        request.mockResolvedValue(
            new Response(JSON.stringify({ active: true }), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            })
        );
        const status: RoomStatus = {
            ready: false,
            draining: false,
            activeMatches: 1,
            connectedPlayers: 3,
            rooms: 1,
            idleMs: 0,
            pendingResults: 0,
            currentTickDebtMs: 4,
            maximumTickDebtMs: 8,
        };

        await expect(adapter.heartbeat(status)).resolves.toBe(true);
        expect(request.mock.calls[0][0]).toBe('http://127.0.0.1:8787/internal/dev/heartbeat');
        expect(request.mock.calls[0][1]?.method).toBe('POST');
        expect(new Headers(request.mock.calls[0][1]?.headers).get('authorization')).toBe(
            `Bearer ${'a'.repeat(64)}`
        );
        expect(body(request, 0)).toEqual({
            instanceRunId: 'local-run',
            processGeneration: 'local-process',
            status,
        });
    });

    it('returns only validated single-use identities and treats rejected tickets as absent', async () => {
        const { adapter, request } = await fixture();
        request.mockResolvedValueOnce(new Response(null, { status: 401 }));
        await expect(adapter.consume('expired')).resolves.toBeNull();
        request.mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    playerId: 'alice',
                    name: 'Alice',
                    operation: 'reconnect',
                    roomCode: 'ABC234',
                }),
                { status: 200, headers: { 'content-type': 'application/json' } }
            )
        );
        await expect(adapter.consume('live')).resolves.toEqual({
            playerId: 'alice',
            name: 'Alice',
            operation: 'reconnect',
            roomCode: 'ABC234',
        });
        expect(body(request, 1)).toEqual({
            ticket: 'live',
            instanceRunId: 'local-run',
            processGeneration: 'local-process',
        });
    });

    it('retains a terminal result until the local persistence API accepts it', async () => {
        const { adapter, request, directory } = await fixture();
        request.mockResolvedValue(new Response(null, { status: 204 }));
        const race = new DataRace(
            dataRaceFixture(),
            'match-1',
            [
                { id: 'alice', name: 'Alice' },
                { id: 'bob', name: 'Bob' },
            ],
            1
        );
        await adapter.start(race.snapshot(), 'ABC234');
        race.abort('operator_stop');
        request.mockResolvedValueOnce(new Response(null, { status: 204 }));
        request.mockResolvedValueOnce(new Response(null, { status: 503 }));
        await expect(adapter.save(race.snapshot())).rejects.toThrow('finalization failed');
        const filename = join(directory, 'match-1.json');
        const pending = JSON.parse(await readFile(filename, 'utf8')) as {
            delivered: boolean;
            result: { completedAt: string };
        };
        expect(pending.delivered).toBe(false);

        request.mockResolvedValue(new Response(null, { status: 204 }));
        await adapter.save(race.snapshot());
        const delivered = JSON.parse(await readFile(filename, 'utf8')) as typeof pending;
        expect(delivered.delivered).toBe(true);
        expect(delivered.result.completedAt).toBe(pending.result.completedAt);
        const finish = body(request, request.mock.calls.length - 1);
        expect(finish).toMatchObject({
            instanceRunId: 'local-run',
            processGeneration: 'local-process',
            result: { matchId: 'match-1', roomId: 'ABC234', outcome: 'aborted' },
        });
    });

    it('replays terminal results before marking an unfinished start interrupted', async () => {
        const { adapter, request, directory } = await fixture();
        const completedStart = {
            matchId: 'z-completed',
            roomId: 'ABC234',
            instanceRunId: 'old-run',
            processGeneration: 'old-process',
            participants: ['alice', 'bob'],
            startedAt: '2026-10-03T10:00:00.000Z',
        };
        await writeFile(
            join(directory, 'z-completed.json'),
            JSON.stringify({
                start: completedStart,
                result: {
                    matchId: completedStart.matchId,
                    roomId: completedStart.roomId,
                    startedAt: completedStart.startedAt,
                    completedAt: '2026-10-03T10:03:03.000Z',
                    outcome: 'completed',
                    reason: null,
                    standings: [
                        {
                            playerId: 'alice',
                            nickname: 'Alice',
                            color: '#38bdf8',
                            score: 100,
                            rank: 1,
                            connected: true,
                        },
                        {
                            playerId: 'bob',
                            nickname: 'Bob',
                            color: '#fb7185',
                            score: 50,
                            rank: 2,
                            connected: true,
                        },
                    ],
                },
                delivered: false,
            })
        );
        await writeFile(
            join(directory, 'old-match.json'),
            JSON.stringify({
                start: {
                    matchId: 'old-match',
                    roomId: 'ABC234',
                    instanceRunId: 'old-run',
                    processGeneration: 'old-process',
                    participants: ['alice', 'bob'],
                    startedAt: '2026-10-03T11:00:00.000Z',
                },
                delivered: false,
            })
        );
        request.mockResolvedValue(new Response(null, { status: 204 }));

        await adapter.recover();

        expect(body(request, 1)).toMatchObject({
            instanceRunId: 'old-run',
            processGeneration: 'old-process',
            result: { matchId: 'z-completed', outcome: 'completed' },
        });
        expect(body(request, 4)).toEqual({
            instanceRunId: 'old-run',
            processGeneration: 'old-process',
            result: {
                matchId: 'old-match',
                roomId: 'ABC234',
                startedAt: '2026-10-03T11:00:00.000Z',
                completedAt: '2026-10-03T12:00:00.000Z',
                outcome: 'aborted',
                reason: 'process_restart',
                standings: [],
            },
        });
    });

    it('discards an outbox start that never reached the persistence API', async () => {
        const { adapter, request, directory } = await fixture();
        const filename = join(directory, 'orphaned-start.json');
        await writeFile(
            filename,
            JSON.stringify({
                start: {
                    matchId: 'orphaned-start',
                    roomId: 'ABC234',
                    instanceRunId: 'old-run',
                    processGeneration: 'old-process',
                    participants: ['alice', 'bob'],
                    startedAt: '2026-10-03T11:30:00.000Z',
                },
                delivered: false,
            })
        );
        request.mockResolvedValue(
            new Response(
                JSON.stringify({
                    code: 'MATCH_START_NOT_FOUND',
                    message: 'The match start was not registered before the process stopped.',
                }),
                { status: 404, headers: { 'content-type': 'application/json' } }
            )
        );

        await expect(adapter.recover()).resolves.toBeUndefined();

        expect(request).toHaveBeenCalledTimes(1);
        const record = JSON.parse(await readFile(filename, 'utf8')) as {
            delivered: boolean;
            result?: unknown;
        };
        expect(record).toEqual(expect.objectContaining({ delivered: true }));
        expect(record.result).toBeUndefined();
    });

    it('refuses to send the internal bearer token to a non-loopback origin', () => {
        expect(
            () =>
                new DevelopmentAdapters({
                    apiOrigin: 'https://api.example.test',
                    internalToken: 'a'.repeat(64),
                    instanceRunId: 'run',
                    processGeneration: 'process',
                    outboxDirectory: '/tmp/unused',
                })
        ).toThrow('loopback');
    });
});
