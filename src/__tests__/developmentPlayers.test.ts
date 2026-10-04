import { afterEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Duplex } from 'node:stream';
import { setImmediate } from 'node:timers/promises';
import { DevelopmentPlayers, pickupDirection } from '../../server/DevelopmentPlayers';
import { MemoryResultStore, MemoryTickets, RoomService } from '../../server/RoomService';
import { createGameServer } from '../../server/httpServer';
import { DataRace } from '../game/simulation/DataRace';
import { RACE } from '../game/simulation/types';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

const disposers: (() => void)[] = [];
afterEach(() => {
    disposers
        .splice(0)
        .reverse()
        .forEach((dispose) => dispose());
});

/** Binds a fixture HTTP listener to an ephemeral local port. */
async function listen(server: Server): Promise<number> {
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    return (server.address() as AddressInfo).port;
}

/** Uses real HTTP guest/ticket calls and WebSockets with a controllable simulation clock. */
async function fixture(count = 2) {
    let now = 0,
        serial = 0;
    const results = new MemoryResultStore(),
        tickets = new MemoryTickets(() => Date.now());
    const rooms = new RoomService({
        map: dataRaceFixture(),
        results,
        now: () => now,
        instanceRunId: 'run',
        processGeneration: 'process',
        epochNow: () => Date.now(),
        randomId: () => `match-${++serial}`,
        randomCode: () => 'ABC234',
        randomSeed: () => 4,
    });
    const messages = vi.spyOn(rooms, 'handle');
    const game = createGameServer({
        rooms,
        tickets,
        allowedOrigins: ['http://127.0.0.1:5173'],
        adminToken: 'x'.repeat(32),
        instanceRunId: 'run',
        processGeneration: 'process',
    });
    disposers.push(() => game.dispose());
    const port = await listen(game.server);
    const sockets: Duplex[] = [];
    // Capture server peers only to simulate an actual dropped bot connection.
    game.server.on('upgrade', (_request, socket) => {
        sockets.push(socket);
    });
    const identities = new Map<string, { id: string; name: string }>();
    const requests: string[] = [];
    const api = express();
    api.use(express.json());
    api.post('/v1/auth/guest', (request, response) => {
        const id = `bot-${++serial}`;
        const body = request.body as { nickname: string };
        identities.set(id, { id, name: body.nickname });
        requests.push('guest');
        response.json({ accessToken: id });
    });
    api.post('/v1/multiplayer/join-credentials', (request, response) => {
        const identity = identities.get(
            request.headers.authorization?.replace('Bearer ', '') ?? ''
        );
        if (!identity) {
            response.sendStatus(401);
            return;
        }
        const body = request.body as { operation: 'join' | 'reconnect'; roomCode: string };
        const ticket = `ticket-${++serial}`;
        tickets.issue(
            ticket,
            {
                playerId: identity.id,
                name: identity.name,
                operation: body.operation,
                roomCode: body.roomCode,
            },
            Date.now() + 60000
        );
        requests.push(body.operation);
        response.json({ ticket, processGeneration: 'process' });
    });
    const http = createServer(api);
    disposers.push(() => {
        http.closeAllConnections();
        http.close();
        sockets.forEach((socket) => socket.destroy());
    });
    const apiPort = await listen(http);
    const options = {
        count,
        apiOrigin: `http://127.0.0.1:${apiPort}`,
        websocketUrl: `ws://127.0.0.1:${port}/ws`,
        siteOrigin: 'http://127.0.0.1:5173',
        rooms: () => rooms.roomStates(),
    };
    const bots = new DevelopmentPlayers(options);
    disposers.push(() => bots.dispose());
    const human = { playerId: 'human', name: 'Human', operation: 'create' as const };
    /** Creates a human room through its public authenticated command. */
    const create = (): void => {
        rooms.handle('human-peer', human, { type: 'create' }, () => undefined);
    };
    /** Advances fixed ticks without triggering overload or changing match duration. */
    const ticks = (count: number): void => {
        for (let index = 0; index < count; index += 1) {
            now += RACE.stepMs;
            rooms.pump();
        }
    };
    return { rooms, results, messages, requests, options, bots, create, ticks, human, sockets };
}

describe('local automated network players', () => {
    it('joins and readies as separate guests, sends movement, rematches, and leaves with the human', async () => {
        const game = await fixture(3);
        await new Promise((resolve) => setTimeout(resolve, 250));
        expect(game.requests).toEqual([]); // Never creates a bot-only room.
        game.create();
        await vi.waitFor(
            () =>
                expect(
                    game.rooms.roomStates()[0]?.players.filter((player) => player.ready)
                ).toHaveLength(3),
            { timeout: 4000 }
        );
        const roster = game.rooms.roomStates()[0];
        expect(roster.players).toHaveLength(4);
        expect(roster.ownerId).toBe('human');
        expect(roster.phase).toBe('lobby');
        expect(game.requests.filter((entry) => entry === 'guest')).toHaveLength(3);
        expect(roster.players.slice(1).every((player) => player.name.startsWith('BOT '))).toBe(
            true
        );
        game.rooms.handle(
            'human-peer',
            game.human,
            { type: 'ready', ready: true },
            () => undefined
        );
        game.rooms.handle('human-peer', game.human, { type: 'start' }, () => undefined);
        await Promise.resolve();
        expect(game.results.starts.size).toBe(1);
        game.ticks(183);
        expect(game.rooms.roomStates()[0].phase).toBe('playing');
        expect(game.rooms.status().connectedPlayers).toBe(4);
        await vi.waitFor(
            () =>
                expect(
                    new Set(
                        game.messages.mock.calls
                            .filter((call) => call[2].type === 'input')
                            .map((call) => call[1].playerId)
                    ).size
                ).toBe(3),
            { timeout: 2000 }
        );
        const inputs = game.messages.mock.calls.filter((call) => call[2].type === 'input');
        expect(new Set(inputs.map((call) => call[1].playerId)).size).toBe(3);
        expect(inputs.every((call) => call[2].type === 'input' && call[2].sequence > 0)).toBe(true);
        // Yield to real sockets instead of manufacturing three minutes of backpressure in one turn.
        for (let ticks = 0; ticks < RACE.matchTicks; ticks += 60) {
            game.ticks(60);
            await setImmediate();
        }
        await Promise.resolve();
        expect([...game.results.results.values()][0].rankings).toHaveLength(4);
        game.rooms.handle('human-peer', game.human, { type: 'rematch' }, () => undefined);
        await vi.waitFor(() =>
            expect(
                game.rooms.roomStates()[0].players.filter((player) => player.ready)
            ).toHaveLength(3)
        );
        expect(
            game.rooms.roomStates()[0].players.find((player) => player.id === 'human')?.ready
        ).toBe(false);
        game.rooms.handle('human-peer', game.human, { type: 'leave' }, () => undefined);
        await vi.waitFor(() => expect(game.rooms.status().rooms).toBe(0), { timeout: 3000 });
        expect(game.rooms.status().connectedPlayers).toBe(0);
    });

    it('keeps a human reservation, restores human lobby ownership, and clears abandoned bots', async () => {
        const game = await fixture(1);
        game.create();
        await vi.waitFor(() => expect(game.rooms.status().connectedPlayers).toBe(2), {
            timeout: 3000,
        });
        game.rooms.disconnect('human-peer', 'human');
        await new Promise((resolve) => setTimeout(resolve, 700));
        expect(game.rooms.roomStates()[0].players).toHaveLength(2);
        expect(game.rooms.status().connectedPlayers).toBe(1);
        game.rooms.handle(
            'new-peer',
            { ...game.human, operation: 'reconnect', roomCode: 'ABC234' },
            { type: 'join', code: 'ABC234' },
            () => undefined
        );
        await vi.waitFor(() => expect(game.rooms.roomStates()[0].ownerId).toBe('human'), {
            timeout: 3000,
        });
        await vi.waitFor(() => expect(game.rooms.status().connectedPlayers).toBe(2), {
            timeout: 3000,
        });
        game.rooms.disconnect('new-peer', 'human');
        game.ticks(1801);
        await vi.waitFor(() => expect(game.rooms.status().rooms).toBe(0), { timeout: 3000 });
    });

    it('supports manual-only rooms and rejects remote endpoints', async () => {
        const game = await fixture(0);
        game.create();
        await new Promise((resolve) => setTimeout(resolve, 700));
        expect(game.requests).toEqual([]);
        expect(game.rooms.status().connectedPlayers).toBe(1);
        expect(
            () => new DevelopmentPlayers({ ...game.options, apiOrigin: 'https://example.com' })
        ).toThrow('loopback');
    });

    it('reconnects a dropped socket with the same guest and a fresh reserved ticket', async () => {
        const game = await fixture(1);
        game.create();
        await vi.waitFor(() => expect(game.rooms.status().connectedPlayers).toBe(2), {
            timeout: 3000,
        });
        const botId = game.rooms.roomStates()[0].players[1].id;
        game.sockets[0].destroy();
        await vi.waitFor(() => expect(game.requests).toContain('reconnect'), { timeout: 4000 });
        await vi.waitFor(() =>
            expect(
                game.rooms.roomStates()[0].players.find((entry) => entry.id === botId)
            ).toMatchObject({ connected: true, ready: true })
        );
        expect(game.requests.filter((entry) => entry === 'guest')).toHaveLength(1);
    });

    it('chooses a reachable pickup beyond a corner and does not drive dead players', () => {
        const map = dataRaceFixture();
        const race = new DataRace(
            map,
            'route',
            [
                { id: 'a', name: 'A' },
                { id: 'b', name: 'B' },
            ],
            1
        );
        const snapshot = race.snapshot();
        const player = snapshot.players[0];
        player.movement = { cell: 3, to: 4, progress: 0.5, direction: 'right', queued: 'right' };
        snapshot.pickups = [{ id: 8, cell: 8, kind: 'bit' }];
        expect(pickupDirection(map, snapshot, player.id, () => 0.5)).toBe('down');
        player.deathMs = 900;
        expect(pickupDirection(map, snapshot, player.id, () => 0.5)).toBeNull();
    });

    it('plans from the near mouth while a Packet backs out of a portal', () => {
        const map = dataRaceFixture();
        map.cells[0].edges.push({ to: 4, direction: 'left', portal: true });
        map.cells[4].edges.push({ to: 0, direction: 'right', portal: true });
        const race = new DataRace(map, 'portal-route', [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 1);
        const snapshot = race.snapshot();
        const player = snapshot.players[0];
        player.movement = { cell: 0, to: 4, progress: 0.25, direction: 'right', queued: 'down' };
        snapshot.pickups = [{ id: 15, cell: 15, kind: 'bit' }];
        expect(pickupDirection(map, snapshot, player.id, () => 0.5)).toBe('down');
    });
});
