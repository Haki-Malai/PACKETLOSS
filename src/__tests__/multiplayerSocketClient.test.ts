import { createPowerupCombatState } from '../game/simulation/PowerupCombat';
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryResultStore, RoomService, type AuthenticatedPlayer } from '../../server/RoomService';
import { dataRaceFixture } from './fixtures/dataRaceFixture';
import { MultiplayerSocketClient } from '../game/infrastructure/adapters/MultiplayerSocketClient';
import { encodeRaceSnapshot, parseClientMessage, PROTOCOL_VERSION } from '../game/protocol/messages';
import { RACE, type RaceMap, type RaceSnapshot } from '../game/simulation/types';

class FakeSocket {
    readyState = 1;
    onopen: ((_event: Event) => void) | null = null;
    onmessage: ((_event: MessageEvent<unknown>) => void) | null = null;
    onerror: ((_event: Event) => void) | null = null;
    onclose: ((_event: CloseEvent) => void) | null = null;
    readonly sent: string[] = [];
    readonly close = vi.fn(() => {
        this.readyState = 3;
    });

    send(data: string): void {
        this.sent.push(data);
    }

    open(): void {
        this.onopen?.(new Event('open'));
    }

    private publication = 0;

    message(value: unknown): void {
        if (value && typeof value === 'object' && 'type' in value && value.type === 'snapshot') {
            value = { publication: ++this.publication, ...value };
        }
        this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(value) }));
    }
}

const map: RaceMap = {
    id: 'race-map',
    width: 2,
    height: 2,
    cells: [
        { x: 0, y: 0, edges: [{ to: 1, direction: 'right' }] },
        { x: 1, y: 0, edges: [{ to: 0, direction: 'left' }] },
    ],
    spawns: [0, 1, 0, 1],
    enemyHome: 0,
    pickups: [{ id: 1, cell: 1, kind: 'bit' }],
};

const movement = {
    cell: 0,
    to: null,
    progress: 0,
    direction: 'right' as const,
    queued: 'right' as const,
};

const snapshot: RaceSnapshot = {
    matchId: 'match-1',
    mapId: map.id,
    tick: 181,
    playTicks: 1,
    shrinkStage: 0,
    phase: 'playing',
    movementEnabled: true,
    players: [
        {
            id: 'player-1',
            name: 'ONE',
            color: '#38bdf8',
            slot: 0,
            connected: true,
            score: 0,
            movement,
            huntMs: 0,
            protectionMs: 0,
            deathMs: 0,
            eliminatedAtTick: null,
            chain: 0,
            acknowledgedInput: 0,
            acknowledgedPowerup: 0, heldPowerup: null, deathPosition: null,
            boosting: false, boostHeld: false, boostTicks: 0, boostCostTicks: 0,
        },
        {
            id: 'player-2',
            name: 'TWO',
            color: '#fb7185',
            slot: 1,
            connected: true,
            score: 0,
            movement: { ...movement, cell: 1 },
            huntMs: 0,
            protectionMs: 0,
            deathMs: 0,
            eliminatedAtTick: null,
            chain: 0,
            acknowledgedInput: 0,
            acknowledgedPowerup: 0, heldPowerup: null, deathPosition: null,
            boosting: false, boostHeld: false, boostTicks: 0, boostCostTicks: 0,
        },
    ],
    enemies: [],
    pickups: map.pickups,
    refill: 0,
    randomState: 1,
    rankings: [],
    abortReason: null,
    combat: createPowerupCombatState(),
};
const wireSnapshot = encodeRaceSnapshot(map, snapshot);

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

/** Admits a live player so watchdog tests exercise an actual validated gameplay stream. */
function activeSocket() {
    const socket = new FakeSocket();
    const client = new MultiplayerSocketClient(() => socket);
    client.connect({ credential: { ticket: 'ticket', expiresAt: new Date(Date.now() + 60_000).toISOString(),
        websocketUrl: 'wss://game.example/ws', processGeneration: 'generation-1' }, operation: 'create',
        expectedInstanceRunId: 'run-1', expectedProcessGeneration: 'generation-1' });
    socket.open();
    socket.message({ type: 'authenticated', version: PROTOCOL_VERSION, playerId: 'player-1',
        instanceRunId: 'run-1', processGeneration: 'generation-1' });
    socket.message({ type: 'map', map });
    socket.message({ type: 'snapshot', publication: 1, snapshot: wireSnapshot, serverTimeMs: 1000,
        instanceRunId: 'run-1', processGeneration: 'generation-1' });
    return { socket, client };
}

describe('MultiplayerSocketClient', () => {
    it('signals a 400 ms stall and closes a silent game stream even if pongs keep arriving', () => {
        vi.useFakeTimers();
        let now = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => now);
        const { socket, client } = activeSocket();
        now = 400; vi.advanceTimersByTime(400);
        expect(client.getSnapshot().stalled).toBe(true);
        expect(client.sendDirection('left')).toBeNull();
        for (const next of [2000, 4000, 6000]) {
            socket.message({ type: 'pong', sentAt: now, serverTimeMs: now });
            const elapsed = next - now; now = next; vi.advanceTimersByTime(elapsed);
        }
        expect(client.getSnapshot()).toMatchObject({ phase: 'failed', recoverable: true });
        expect(socket.close).toHaveBeenCalledOnce();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('does not predict failed sends and preserves newer same-tick authoritative updates', () => {
        const { socket, client } = activeSocket();
        socket.readyState = 3;
        expect(client.sendDirection('left')).toBeNull();
        expect(client.synchronization.diagnostics.pendingInputs).toBe(0);
        socket.readyState = 1;
        const frozen = { ...wireSnapshot, movementEnabled: false };
        socket.message({ type: 'snapshot', publication: 2, snapshot: frozen, serverTimeMs: 1000,
            instanceRunId: 'run-1', processGeneration: 'generation-1' });
        socket.message({ type: 'snapshot', publication: 1, snapshot: wireSnapshot, serverTimeMs: 1000,
            instanceRunId: 'run-1', processGeneration: 'generation-1' });
        expect(client.getSnapshot().race?.movementEnabled).toBe(false);
        expect(client.sendDirection('left')).toBeNull();
        client.disconnect();
    });
    it('authenticates first and sends only sequenced gameplay intent during play', () => {
        const socket = new FakeSocket();
        const client = new MultiplayerSocketClient(() => socket);
        client.connect({
            credential: {
                ticket: 'opaque-ticket',
                expiresAt: new Date(Date.now() + 60_000).toISOString(),
                websocketUrl: 'wss://game.example/ws',
                processGeneration: 'generation-1',
            },
            operation: 'create',
            expectedInstanceRunId: 'run-1',
            expectedProcessGeneration: 'generation-1',
        });

        socket.open();
        expect(JSON.parse(socket.sent[0])).toEqual({
            type: 'authenticate',
            version: PROTOCOL_VERSION,
            ticket: 'opaque-ticket',
        });
        socket.message({
            type: 'authenticated',
            version: PROTOCOL_VERSION,
            playerId: 'player-1',
            instanceRunId: 'run-1',
            processGeneration: 'generation-1',
        });
        expect(JSON.parse(socket.sent[1])).toEqual({ type: 'create' });
        expect(parseClientMessage(socket.sent[2])?.type).toBe('ping');
        socket.message({ type: 'map', map });
        socket.message({
            type: 'snapshot',
            snapshot: wireSnapshot,
            serverTimeMs: 1_000,
            instanceRunId: 'run-1',
            processGeneration: 'generation-1',
        });

        expect(client.sendDirection('left')).toBe(1);
        expect(client.getSnapshot().race?.pickups).toEqual(map.pickups);
        const inputMessage = socket.sent[socket.sent.length - 1];
        expect(JSON.parse(inputMessage)).toEqual({
            type: 'input',
            matchId: 'match-1',
            sequence: 1,
            targetTick: expect.any(Number) as number,
            direction: 'left',
        });
        expect(inputMessage).not.toContain('score');
        expect(inputMessage).not.toContain('position');
        for (const [index, boost] of (['press', 'release', 'cancel'] as const).entries()) {
            expect(client.sendBoost(boost)).toBe(index + 2);
            expect(parseClientMessage(socket.sent[socket.sent.length - 1])).toEqual({
                type: 'input', matchId: 'match-1', sequence: index + 2,
                targetTick: expect.any(Number) as number, boost,
            });
        }
        client.closeNextWall();
        expect(parseClientMessage(socket.sent[socket.sent.length - 1]))
            .toEqual({ type: 'development-close-wall', matchId: 'match-1' });
        client.disconnect();
        expect(client.getSnapshot()).toMatchObject({
            phase: 'closed',
            room: null,
            race: null,
            map: null,
        });
    });

    it('continues authoritative input sequencing after a reserved reconnect', () => {
        const socket = new FakeSocket();
        const client = new MultiplayerSocketClient(() => socket);
        client.connect({
            credential: {
                ticket: 'reconnect-ticket',
                expiresAt: new Date(Date.now() + 60_000).toISOString(),
                websocketUrl: 'wss://game.example/ws',
                processGeneration: 'generation-1',
            },
            operation: 'reconnect',
            roomCode: 'ABC234',
            expectedInstanceRunId: 'run-1',
            expectedProcessGeneration: 'generation-1',
        });
        socket.open();
        socket.message({
            type: 'authenticated',
            version: PROTOCOL_VERSION,
            playerId: 'player-1',
            instanceRunId: 'run-1',
            processGeneration: 'generation-1',
        });
        socket.message({ type: 'map', map });
        const resumed = structuredClone(snapshot);
        resumed.players[0].acknowledgedInput = 7;
        socket.message({
            type: 'snapshot',
            snapshot: encodeRaceSnapshot(map, resumed),
            serverTimeMs: 1_000,
            instanceRunId: 'run-1',
            processGeneration: 'generation-1',
        });

        expect(client.sendDirection('left')).toBe(8);
        expect(JSON.parse(socket.sent[socket.sent.length - 1])).toMatchObject({
            type: 'input',
            sequence: 8,
        });
        client.disconnect();
    });

    it('restores authority on reconnect and drops pending powerups without firing twice', async () => {
        vi.useFakeTimers();
        let now = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => now);
        const rooms = new RoomService({
            createMap: () => ({ ...dataRaceFixture(), pickups: [{ id: 2, cell: 2, kind: 'bit' }] }),
            results: new MemoryResultStore(), now: () => now, epochNow: () => now,
            randomId: () => 'match-1', randomCode: () => 'ABC234', randomSeed: () => 4,
            instanceRunId: 'run-1', processGeneration: 'generation-1', developmentPowerups: true,
        });
        const alice: AuthenticatedPlayer = { playerId: 'alice', name: 'Alice', operation: 'create' };
        const bob: AuthenticatedPlayer = { playerId: 'bob', name: 'Bob', operation: 'join', roomCode: 'ABC234' };
        const ignore = (): void => {};
        rooms.handle('alice', alice, { type: 'create' }, ignore);
        rooms.handle('bob', bob, { type: 'join', code: 'ABC234' }, ignore);
        rooms.handle('alice', alice, { type: 'ready', ready: true }, ignore);
        rooms.handle('bob', bob, { type: 'ready', ready: true }, ignore);
        rooms.handle('alice', alice, { type: 'start' }, ignore);
        await Promise.resolve();
        rooms.handle('alice', alice, { type: 'activate-powerup', matchId: 'match-1', sequence: 7, targetTick: 1 }, ignore);
        rooms.handle('bob', bob, { type: 'development-equip-powerup', matchId: 'match-1', kind: 'blast' }, ignore);
        rooms.handle('bob', bob, { type: 'activate-powerup', matchId: 'match-1', sequence: 1, targetTick: 1 }, ignore);
        /** Steps the real authority without advancing the unrelated socket watchdog timers. */
        const advance = (count: number): void => {
            for (let index = 0; index < count; index += 1) { now += RACE.stepMs; rooms.pump(); }
        };
        advance(30);
        rooms.handle('alice', alice, { type: 'development-equip-powerup', matchId: 'match-1', kind: 'missile' }, ignore);
        rooms.disconnect('alice', 'alice');

        const sockets: FakeSocket[] = [];
        const returning: AuthenticatedPlayer = { ...alice, operation: 'reconnect', roomCode: 'ABC234' };
        const client = new MultiplayerSocketClient(() => {
            const socket = new FakeSocket();
            sockets.push(socket);
            const peer = 'alice-client-' + sockets.length;
            vi.spyOn(socket, 'send').mockImplementation((data) => {
                socket.sent.push(data);
                const message = parseClientMessage(data);
                if (!message) throw new Error('Invalid client message.');
                if (message.type === 'authenticate') {
                    socket.message({ type: 'authenticated', version: PROTOCOL_VERSION, playerId: 'alice',
                        instanceRunId: 'run-1', processGeneration: 'generation-1' });
                } else rooms.handle(peer, returning, message, (reply) => socket.message(reply));
            });
            return socket;
        });
        /** Admits a new transport generation through the actual client connection lifecycle. */
        const reconnect = (): FakeSocket => {
            client.connect({ credential: { ticket: 'reconnect-ticket',
                expiresAt: new Date(Date.now() + 60_000).toISOString(), websocketUrl: 'wss://game.example/ws',
                processGeneration: 'generation-1' }, operation: 'reconnect', roomCode: 'ABC234',
                expectedInstanceRunId: 'run-1', expectedProcessGeneration: 'generation-1' });
            const socket = sockets[sockets.length - 1];
            socket.open();
            return socket;
        };
        const firstSocket = reconnect();
        const before = client.getSnapshot().race!;
        expect(before.players.find((player) => player.id === 'alice'))
            .toMatchObject({ heldPowerup: 'missile', acknowledgedPowerup: 7 });
        const released = before.combat.casts.find((cast) => cast.ownerId === 'bob')!;
        expect(released.origin).not.toBeNull();
        const blast = before.combat.effects.find((effect) => effect.ownerId === 'bob' && effect.role === 'attack')!;
        expect(blast.radius).toBeGreaterThan(0);
        expect(client.activatePowerup()).toBe(8);
        expect(client.activatePowerup()).toBeNull();
        const abandoned = firstSocket.sent.find((message) => parseClientMessage(message)?.type === 'activate-powerup')!;
        client.disconnect();
        rooms.disconnect('alice-client-1', 'alice');
        advance(6); // The abandoned activation's target tick passes while its transport is disconnected.

        const secondSocket = reconnect();
        const restored = client.getSnapshot().race!;
        expect(restored.players.find((player) => player.id === 'alice'))
            .toMatchObject({ connected: true, heldPowerup: 'missile', acknowledgedPowerup: 7 });
        expect(restored.combat.casts.find((cast) => cast.id === released.id)?.elapsedMs).toBeGreaterThan(released.elapsedMs);
        expect(restored.combat.effects.find((effect) => effect.id === blast.id)?.elapsedMs).toBeGreaterThan(blast.elapsedMs);
        expect(secondSocket.sent.some((message) => parseClientMessage(message)?.type === 'activate-powerup')).toBe(false);
        expect(client.activatePowerup()).toBe(8);
        advance(6);
        const fired = client.getSnapshot().race!;
        expect(fired.players.find((player) => player.id === 'alice'))
            .toMatchObject({ heldPowerup: null, acknowledgedPowerup: 8 });
        const ownCasts = fired.combat.casts.filter((cast) => cast.ownerId === 'alice');
        expect(ownCasts).toHaveLength(1);
        secondSocket.send(abandoned); // A delayed duplicate from the old connection cannot consume or restart a cast.
        advance(6);
        expect(client.getSnapshot().race?.combat.casts.filter((cast) => cast.ownerId === 'alice'))
            .toEqual([expect.objectContaining({ id: ownCasts[0].id })]);
        client.disconnect();
    });

    it('keeps raw movement current without publishing unchanged React UI snapshots', () => {
        const socket = new FakeSocket();
        const client = new MultiplayerSocketClient(() => socket);
        const rawListener = vi.fn();
        const uiListener = vi.fn();
        client.subscribe(rawListener);
        client.subscribeUi(uiListener);
        client.connect({
            credential: {
                ticket: 'opaque-ticket',
                expiresAt: new Date(Date.now() + 60_000).toISOString(),
                websocketUrl: 'wss://game.example/ws',
                processGeneration: 'generation-1',
            },
            operation: 'create',
            expectedInstanceRunId: 'run-1',
            expectedProcessGeneration: 'generation-1',
        });
        socket.open();
        socket.message({
            type: 'authenticated',
            version: PROTOCOL_VERSION,
            playerId: 'player-1',
            instanceRunId: 'run-1',
            processGeneration: 'generation-1',
        });
        socket.message({ type: 'map', map });
        socket.message({
            type: 'snapshot',
            snapshot: wireSnapshot,
            serverTimeMs: 1_000,
            instanceRunId: 'run-1',
            processGeneration: 'generation-1',
        });
        const firstUiSnapshot = client.getUiSnapshot();
        rawListener.mockClear();
        uiListener.mockClear();

        const moved = structuredClone(snapshot);
        moved.tick += 1;
        moved.playTicks += 1;
        moved.players[0].movement.progress = 0.25;
        socket.message({
            type: 'snapshot',
            snapshot: encodeRaceSnapshot(map, moved),
            serverTimeMs: 1_017,
            instanceRunId: 'run-1',
            processGeneration: 'generation-1',
        });

        expect(rawListener).toHaveBeenCalledOnce();
        expect(client.getSnapshot().race?.tick).toBe(moved.tick);
        expect(client.getUiSnapshot()).toBe(firstUiSnapshot);
        expect(uiListener).not.toHaveBeenCalled();

        const nextSecond = structuredClone(moved);
        nextSecond.tick += 59;
        nextSecond.playTicks = 61;
        socket.message({
            type: 'snapshot',
            snapshot: encodeRaceSnapshot(map, nextSecond),
            serverTimeMs: 2_000,
            instanceRunId: 'run-1',
            processGeneration: 'generation-1',
        });
        expect(uiListener).toHaveBeenCalledOnce();
        expect(client.getUiSnapshot().race?.playTicks).toBe(61);

        uiListener.mockClear();
        const scored = structuredClone(nextSecond);
        scored.tick += 1;
        scored.playTicks += 1;
        scored.players[0].score = 100;
        socket.message({
            type: 'snapshot',
            snapshot: encodeRaceSnapshot(map, scored),
            serverTimeMs: 2_017,
            instanceRunId: 'run-1',
            processGeneration: 'generation-1',
        });
        expect(uiListener).toHaveBeenCalledOnce();
        expect(client.getUiSnapshot().race?.players[0].score).toBe(100);

        uiListener.mockClear();
        const boosted = structuredClone(scored);
        boosted.tick += 1;
        boosted.playTicks += 1;
        Object.assign(boosted.players[0], { boosting: true, boostHeld: true, boostTicks: 6.5, boostCostTicks: 1 });
        socket.message({ type: 'snapshot', snapshot: encodeRaceSnapshot(map, boosted), serverTimeMs: 2_034,
            instanceRunId: 'run-1', processGeneration: 'generation-1' });
        expect(uiListener).toHaveBeenCalledOnce();
        expect(client.getUiSnapshot().race?.players[0].boosting).toBe(true);

        uiListener.mockClear();
        const contracted = structuredClone(boosted);
        contracted.tick += 1;
        contracted.playTicks += 1;
        contracted.shrinkStage = 1;
        socket.message({
            type: 'snapshot',
            snapshot: encodeRaceSnapshot(map, contracted),
            serverTimeMs: 2_051,
            instanceRunId: 'run-1',
            processGeneration: 'generation-1',
        });
        expect(uiListener).toHaveBeenCalledOnce();
        expect(client.getSnapshot().raceHistory.length).toBeGreaterThan(1);

        uiListener.mockClear();
        const eliminated = structuredClone(contracted);
        eliminated.tick += 1;
        eliminated.playTicks += 1;
        eliminated.players[0].eliminatedAtTick = eliminated.playTicks;
        eliminated.players[0].deathMs = RACE.deathMs;
        Object.assign(eliminated.players[0], { boosting: false, boostHeld: false, boostTicks: 0 });
        socket.message({
            type: 'snapshot',
            snapshot: encodeRaceSnapshot(map, eliminated),
            serverTimeMs: 2_068,
            instanceRunId: 'run-1',
            processGeneration: 'generation-1',
        });
        expect(uiListener).toHaveBeenCalledOnce();
        expect(client.sendDirection('up')).toBeNull();
        client.disconnect();
    });

    it('ignores callbacks retained from a cancelled socket admission', () => {
        const socket = new FakeSocket();
        const client = new MultiplayerSocketClient(() => socket);
        client.connect({
            credential: {
                ticket: 'opaque-ticket',
                expiresAt: new Date(Date.now() + 60_000).toISOString(),
                websocketUrl: 'wss://game.example/ws',
                processGeneration: 'generation-1',
            },
            operation: 'create',
            expectedInstanceRunId: 'run-1',
            expectedProcessGeneration: 'generation-1',
        });
        const lateMessage = socket.onmessage;

        client.cancelPendingJoin();
        lateMessage?.(
            new MessageEvent('message', {
                data: JSON.stringify({
                    type: 'authenticated',
                    version: PROTOCOL_VERSION,
                    playerId: 'player-1',
                    instanceRunId: 'run-1',
                    processGeneration: 'generation-1',
                }),
            })
        );

        expect(socket.close).toHaveBeenCalledOnce();
        expect(client.getSnapshot()).toMatchObject({
            phase: 'idle',
            playerId: null,
            room: null,
        });
        expect(socket.sent).toEqual([]);
    });

    it('closes on malformed authoritative data and rejects forged client fields', () => {
        const socket = new FakeSocket();
        const client = new MultiplayerSocketClient(() => socket);
        client.connect({
            credential: {
                ticket: 'opaque-ticket',
                expiresAt: new Date(Date.now() + 60_000).toISOString(),
                websocketUrl: 'wss://game.example/ws',
                processGeneration: 'generation-1',
            },
            operation: 'join',
            roomCode: 'ABC234',
            expectedInstanceRunId: 'run-1',
            expectedProcessGeneration: 'generation-1',
        });
        socket.open();
        socket.message({
            type: 'snapshot',
            snapshot: { ...wireSnapshot, forged: true },
            serverTimeMs: 1,
            instanceRunId: 'run-1',
            processGeneration: 'generation-1',
        });
        expect(client.getSnapshot().phase).toBe('failed');
        expect(socket.close).toHaveBeenCalled();
        expect(
            parseClientMessage(
                JSON.stringify({
                    type: 'input',
                    matchId: 'match-1',
                    sequence: 2,
                    direction: 'up',
                    score: 999_999,
                })
            )
        ).toBeNull();
    });

    it('rejects authentication and snapshots from a stale server process', () => {
        const socket = new FakeSocket();
        const client = new MultiplayerSocketClient(() => socket);
        client.connect({
            credential: {
                ticket: 'opaque-ticket',
                expiresAt: new Date(Date.now() + 60_000).toISOString(),
                websocketUrl: 'wss://game.example/ws',
                processGeneration: 'generation-1',
            },
            operation: 'create',
            expectedInstanceRunId: 'run-1',
            expectedProcessGeneration: 'generation-1',
        });
        socket.open();
        socket.message({
            type: 'authenticated',
            version: PROTOCOL_VERSION,
            playerId: 'player-1',
            instanceRunId: 'run-1',
            processGeneration: 'stale-generation',
        });

        expect(client.getSnapshot().phase).toBe('failed');
        expect(socket.close).toHaveBeenCalled();
    });
});
