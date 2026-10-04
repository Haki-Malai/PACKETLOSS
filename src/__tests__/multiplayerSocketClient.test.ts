// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { MultiplayerSocketClient } from '../game/infrastructure/adapters/MultiplayerSocketClient';
import { encodeRaceSnapshot, parseClientMessage, PROTOCOL_VERSION } from '../game/protocol/messages';
import type { RaceMap, RaceSnapshot } from '../game/simulation/types';

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

    message(value: unknown): void {
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
    phase: 'playing',
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
            chain: 0,
            acknowledgedInput: 0,
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
            chain: 0,
            acknowledgedInput: 0,
        },
    ],
    enemies: [],
    pickups: map.pickups,
    refill: 0,
    randomState: 1,
    rankings: [],
    abortReason: null,
};
const wireSnapshot = encodeRaceSnapshot(map, snapshot);

describe('MultiplayerSocketClient', () => {
    it('authenticates first and sends only sequenced direction intent during play', () => {
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
            direction: 'left',
        });
        expect(inputMessage).not.toContain('score');
        expect(inputMessage).not.toContain('position');
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
