import {
    decodeRaceSnapshot,
    PROTOCOL_VERSION,
    parseServerMessage,
    type ClientMessage,
    type RoomState,
} from '../../protocol/messages';
import { RACE, type RaceMap, type RaceSnapshot } from '../../simulation/types';
import type { JoinCredential, JoinOperation } from './MultiplayerClient';

export type MultiplayerConnectionPhase =
    | 'idle'
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'disconnected'
    | 'closed'
    | 'failed';

export interface MultiplayerConnectionSnapshot {
    phase: MultiplayerConnectionPhase;
    playerId: string | null;
    room: RoomState | null;
    map: RaceMap | null;
    race: RaceSnapshot | null;
    raceHistory: readonly RaceSnapshot[];
    receivedAtMs: number | null;
    serverTimeMs: number | null;
    latencyMs: number | null;
    instanceRunId: string | null;
    processGeneration: string | null;
    warning: { reason: 'shutdown' | 'deployment'; remainingMs: number } | null;
    message: string;
}

interface WebSocketLike {
    readonly readyState: number;
    onopen: ((_event: Event) => void) | null;
    onmessage: ((_event: MessageEvent<unknown>) => void) | null;
    onerror: ((_event: Event) => void) | null;
    onclose: ((_event: CloseEvent) => void) | null;
    send(_data: string): void;
    close(_code?: number, _reason?: string): void;
}

export interface ConnectRoomRequest {
    credential: JoinCredential;
    operation: JoinOperation;
    roomCode?: string;
    expectedInstanceRunId: string;
    expectedProcessGeneration: string;
}

const INITIAL_SNAPSHOT: MultiplayerConnectionSnapshot = {
    phase: 'idle',
    playerId: null,
    room: null,
    map: null,
    race: null,
    raceHistory: [],
    receivedAtMs: null,
    serverTimeMs: null,
    latencyMs: null,
    instanceRunId: null,
    processGeneration: null,
    warning: null,
    message: '',
};
const SOCKET_OPEN = 1;

/** Owns one authenticated browser WebSocket and validates every inbound message. */
export class MultiplayerSocketClient {
    private socket: WebSocketLike | null = null;
    private state: MultiplayerConnectionSnapshot = INITIAL_SNAPSHOT;
    private readonly listeners = new Set<() => void>();
    private uiState: MultiplayerConnectionSnapshot = INITIAL_SNAPSHOT;
    private readonly uiListeners = new Set<() => void>();
    private heartbeat: ReturnType<typeof globalThis.setInterval> | null = null;
    private inputSequence = 0;
    private requestedRoom: Omit<ConnectRoomRequest, 'credential'> | null = null;

    constructor(
        private readonly createSocket: (_url: string) => WebSocketLike = (url) => new WebSocket(url)
    ) {}

    readonly subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    readonly getSnapshot = (): MultiplayerConnectionSnapshot => this.state;

    /** Subscribes React consumers only to values that can change visible multiplayer UI. */
    readonly subscribeUi = (listener: () => void): (() => void) => {
        this.uiListeners.add(listener);
        return () => this.uiListeners.delete(listener);
    };

    /** Returns the referentially stable snapshot paired with `subscribeUi`. */
    readonly getUiSnapshot = (): MultiplayerConnectionSnapshot => this.uiState;

    connect(request: ConnectRoomRequest): void {
        this.disconnect(false);
        this.requestedRoom = {
            operation: request.operation,
            roomCode: request.roomCode,
            expectedInstanceRunId: request.expectedInstanceRunId,
            expectedProcessGeneration: request.expectedProcessGeneration,
        };
        this.inputSequence = 0;
        this.publish({ ...INITIAL_SNAPSHOT, phase: 'connecting' });
        const socket = this.createSocket(request.credential.websocketUrl);
        this.socket = socket;
        socket.onopen = () => {
            if (this.socket !== socket) return;
            this.send({
                type: 'authenticate',
                version: PROTOCOL_VERSION,
                ticket: request.credential.ticket,
            });
        };
        socket.onmessage = (event) => {
            if (this.socket !== socket) return;
            if (typeof event.data !== 'string') {
                this.fail('The server sent an unsupported message.');
                return;
            }
            const message = parseServerMessage(event.data);
            if (!message) {
                this.fail('The server sent an invalid message.');
                return;
            }
            switch (message.type) {
                case 'authenticated':
                    if (
                        message.instanceRunId !== this.requestedRoom?.expectedInstanceRunId ||
                        message.processGeneration !== this.requestedRoom.expectedProcessGeneration
                    ) {
                        this.fail('The game server restarted. Recheck availability and reconnect.');
                        return;
                    }
                    this.publish({
                        ...this.state,
                        phase: 'connected',
                        playerId: message.playerId,
                        instanceRunId: message.instanceRunId,
                        processGeneration: message.processGeneration,
                    });
                    if (this.requestedRoom?.operation === 'create') this.send({ type: 'create' });
                    else if (this.requestedRoom?.roomCode) {
                        this.send({ type: 'join', code: this.requestedRoom.roomCode });
                    }
                    this.startHeartbeat();
                    break;
                case 'room':
                    this.publish({
                        ...this.state,
                        room: message.room,
                        ...(message.room.phase === 'lobby'
                            ? { race: null, raceHistory: [], receivedAtMs: null }
                            : {}),
                        message: '',
                    });
                    break;
                case 'map':
                    this.publish({ ...this.state, map: message.map });
                    break;
                case 'snapshot':
                    {
                        if (
                            message.instanceRunId !== this.state.instanceRunId ||
                            message.processGeneration !== this.state.processGeneration
                        ) {
                            this.fail('A stale game-server snapshot was rejected. Reconnect to continue.');
                            return;
                        }
                        const snapshot = this.state.map
                            ? decodeRaceSnapshot(this.state.map, message.snapshot)
                            : null;
                        if (!snapshot) {
                            this.fail('The server sent a snapshot for an unknown map.');
                            return;
                        }
                        const acknowledged = snapshot.players.find(
                            (player) => player.id === this.state.playerId
                        )?.acknowledgedInput;
                        if (acknowledged !== undefined) {
                            this.inputSequence = Math.max(this.inputSequence, acknowledged);
                        }
                        const history =
                            this.state.race?.matchId === snapshot.matchId
                                && this.state.race.shrinkStage === snapshot.shrinkStage
                                ? [...this.state.raceHistory, snapshot].slice(-8)
                                : [snapshot];
                    this.publish({
                        ...this.state,
                        race: snapshot,
                        raceHistory: history,
                        receivedAtMs: performance.now(),
                        serverTimeMs: message.serverTimeMs,
                    });
                    break;
                    }
                case 'warning':
                    this.publish({ ...this.state, warning: message });
                    break;
                case 'error':
                    if (this.requestedRoom?.operation === 'reconnect' && !this.state.room) {
                        this.publish({ ...this.state, phase: 'closed', message: message.message });
                        this.disconnect(false);
                    } else this.publish({ ...this.state, message: message.message });
                    break;
                case 'pong':
                    this.publish({
                        ...this.state,
                        serverTimeMs: message.serverTimeMs,
                        latencyMs: Math.max(0, performance.now() - message.sentAt),
                    });
                    break;
                case 'left':
                    this.disconnect(true);
                    break;
            }
        };
        socket.onerror = () => {
            if (this.socket === socket) this.fail('The multiplayer connection failed.');
        };
        socket.onclose = () => {
            if (this.socket !== socket) return;
            this.stopHeartbeat();
            this.socket = null;
            if (this.state.phase !== 'failed' && this.state.phase !== 'closed') {
                this.publish({ ...this.state, phase: 'disconnected', message: 'Connection lost.' });
            }
        };
    }

    setReady(ready: boolean): void {
        this.send({ type: 'ready', ready });
    }

    startMatch(): void {
        this.send({ type: 'start' });
    }

    rematch(): void {
        this.send({ type: 'rematch' });
    }

    sendDirection(direction: 'up' | 'right' | 'down' | 'left'): number {
        const matchId = this.state.race?.matchId;
        const localPlayer = this.state.race?.players.find(
            (player) => player.id === this.state.playerId
        );
        if (!matchId || this.state.race?.phase === 'finished'
            || localPlayer?.eliminatedAtTick !== null) return this.inputSequence;
        this.inputSequence += 1;
        this.send({ type: 'input', matchId, sequence: this.inputSequence, direction });
        return this.inputSequence;
    }

    leave(): void {
        this.send({ type: 'leave' });
        this.disconnect(true);
    }

    /** Cancels an in-flight admission without discarding a recoverable room reservation. */
    cancelPendingJoin(): void {
        this.disconnect(false);
        this.inputSequence = 0;
        this.publish(INITIAL_SNAPSHOT);
    }

    disconnect(closed = true): void {
        this.stopHeartbeat();
        this.requestedRoom = null;
        const socket = this.socket;
        this.socket = null;
        if (socket) {
            socket.onopen = null;
            socket.onmessage = null;
            socket.onerror = null;
            socket.onclose = null;
            socket.close(1000, 'client closed');
        }
        if (closed) this.publish({ ...INITIAL_SNAPSHOT, phase: 'closed' });
    }

    private send(message: ClientMessage): void {
        if (!this.socket || this.socket.readyState !== SOCKET_OPEN) return;
        this.socket.send(JSON.stringify(message));
    }

    /** Measures latency immediately for prediction, then keeps the connection alive. */
    private startHeartbeat(): void {
        this.stopHeartbeat();
        this.send({ type: 'ping', sentAt: performance.now() });
        this.heartbeat = globalThis.setInterval(() => {
            this.send({ type: 'ping', sentAt: performance.now() });
        }, 10_000);
    }

    private stopHeartbeat(): void {
        if (this.heartbeat !== null) globalThis.clearInterval(this.heartbeat);
        this.heartbeat = null;
    }

    private fail(message: string): void {
        this.publish({ ...this.state, phase: 'failed', message });
        this.disconnect(false);
    }

    private publish(state: MultiplayerConnectionSnapshot): void {
        this.state = state;
        this.listeners.forEach((listener) => listener());
        if (sameUiSnapshot(this.uiState, state)) return;
        this.uiState = state;
        this.uiListeners.forEach((listener) => listener());
    }
}

/** Compares only values rendered by React menus and the multiplayer HUD. */
function sameUiSnapshot(
    current: MultiplayerConnectionSnapshot,
    next: MultiplayerConnectionSnapshot
): boolean {
    return (
        current.phase === next.phase &&
        current.playerId === next.playerId &&
        current.map === next.map &&
        current.room === next.room &&
        sameRaceUi(current.race, next.race) &&
        current.latencyMs === next.latencyMs &&
        current.instanceRunId === next.instanceRunId &&
        current.processGeneration === next.processGeneration &&
        current.message === next.message &&
        current.warning?.reason === next.warning?.reason &&
        current.warning?.remainingMs === next.warning?.remainingMs
    );
}

/** Compares the bounded race projection consumed by React rather than movement-frame data. */
function sameRaceUi(current: RaceSnapshot | null, next: RaceSnapshot | null): boolean {
    if (current === next) return true;
    if (!current || !next) return false;
    if (
        current.matchId !== next.matchId ||
        current.mapId !== next.mapId ||
        current.phase !== next.phase ||
        current.shrinkStage !== next.shrinkStage ||
        displayedSecond(current) !== displayedSecond(next) ||
        current.abortReason !== next.abortReason ||
        current.players.length !== next.players.length ||
        current.rankings.length !== next.rankings.length
    ) {
        return false;
    }
    const playersMatch = current.players.every((player, index) => {
        const candidate = next.players[index];
        return (
            player.id === candidate.id &&
            player.name === candidate.name &&
            player.color === candidate.color &&
            player.slot === candidate.slot &&
            player.connected === candidate.connected &&
            player.eliminatedAtTick === candidate.eliminatedAtTick &&
            (player.deathMs > 0) === (candidate.deathMs > 0) &&
            player.score === candidate.score
        );
    });
    return (
        playersMatch &&
        current.rankings.every((ranking, index) => {
            const candidate = next.rankings[index];
            return (
                ranking.playerId === candidate.playerId &&
                ranking.name === candidate.name &&
                ranking.score === candidate.score &&
                ranking.rank === candidate.rank
            );
        })
    );
}

/** Returns the whole second shown by the multiplayer match clock. */
function displayedSecond(snapshot: RaceSnapshot): number {
    return Math.ceil(Math.max(0, RACE.matchTicks - snapshot.playTicks) / 60);
}
