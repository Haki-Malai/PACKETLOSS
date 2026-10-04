import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CloudProfile } from '../infrastructure/adapters/AccountClient';
import type {
    GameRegion,
    JoinOperation,
    MultiplayerApi,
} from '../infrastructure/adapters/MultiplayerClient';
import {
    MultiplayerSocketClient,
    type ConnectRoomRequest,
} from '../infrastructure/adapters/MultiplayerSocketClient';
import { useMultiplayerAvailability } from './useMultiplayerAvailability';
import { MultiplayerRecovery, type RecoveryResult, type RecoveryState } from '../infrastructure/adapters/MultiplayerRecovery';
import { PROTOCOL_VERSION } from '../protocol/version';

const RESERVED_ROOM_KEY = 'packetloss.multiplayer.reserved-room';
const RESERVED_ROOM_STORAGE_MS = 11 * 60_000;

interface ReservedRoom {
    code: string;
    accountId: string;
    instanceRunId: string;
    processGeneration: string;
    expiresAt: number;
}

/** Restores one bounded, generation-specific room record from this tab's browser session. */
function loadReservedRoom(): ReservedRoom | null {
    try {
        const raw = globalThis.sessionStorage?.getItem(RESERVED_ROOM_KEY);
        const value = raw ? (JSON.parse(raw) as Partial<ReservedRoom>) : null;
        if (
            value &&
            typeof value.code === 'string' &&
            /^[A-Z2-9]{6}$/.test(value.code) &&
            typeof value.accountId === 'string' &&
            typeof value.instanceRunId === 'string' &&
            typeof value.processGeneration === 'string' &&
            typeof value.expiresAt === 'number' &&
            value.expiresAt > Date.now()
        ) {
            return value as ReservedRoom;
        }
        globalThis.sessionStorage?.removeItem(RESERVED_ROOM_KEY);
        return null;
    } catch {
        return null;
    }
}

/** Keeps refresh recovery local to this tab and clears it on an authoritative room exit. */
function storeReservedRoom(room: ReservedRoom | null): void {
    try {
        if (room) globalThis.sessionStorage?.setItem(RESERVED_ROOM_KEY, JSON.stringify(room));
        else globalThis.sessionStorage?.removeItem(RESERVED_ROOM_KEY);
    } catch {
        // Storage can be unavailable in restricted browsing contexts; in-memory recovery still works.
    }
}

/** Owns availability, ticket acquisition, and one room socket without affecting local runs. */
export function useMultiplayerSession(
    api: MultiplayerApi | null,
    profile: CloudProfile | null,
    availabilityVisible: boolean
) {
    const [socket] = useState(() => new MultiplayerSocketClient());
    const connection = useSyncExternalStore(socket.subscribeUi, socket.getUiSnapshot);
    const availability = useMultiplayerAvailability(
        api,
        availabilityVisible,
        profile !== null
    );
    const [region, setRegion] = useState<GameRegion>('eu');
    const [joining, setJoining] = useState(false);
    const [message, setMessage] = useState('');
    const [reservedRoom, setReservedRoom] = useState(loadReservedRoom);
    const mounted = useRef(false);
    const joinGeneration = useRef(0);
    const accountId = profile?.accountId ?? null;
    const [recoveryState, setRecoveryState] = useState<RecoveryState>({ phase: 'idle', attempt: 0 });
    const [recovery] = useState(() => new MultiplayerRecovery(setRecoveryState));
    const terminalAdmission = useRef(false);
    const recoveryDeadline = useRef<number | null>(null);
    const recoveryAttempt = useRef<(_signal: AbortSignal) => Promise<RecoveryResult>>(() => Promise.resolve('stop'));

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            joinGeneration.current += 1;
            recovery.cancel();
            socket.cancelPendingJoin();
        };
    }, [socket, recovery, accountId]);
    useEffect(() => {
        const code = connection.room?.code ?? null;
        if (
            connection.phase !== 'closed' && code &&
            accountId &&
            connection.instanceRunId &&
            connection.processGeneration
        ) {
            const room = {
                code,
                accountId,
                instanceRunId: connection.instanceRunId,
                processGeneration: connection.processGeneration,
                expiresAt: connection.phase === 'connected' ? Date.now() + RESERVED_ROOM_STORAGE_MS
                    : recoveryDeadline.current ?? Date.now() + 30_000,
            };
            setReservedRoom(room);
            storeReservedRoom(room);
        } else if (connection.phase === 'closed') {
            setReservedRoom(null);
            storeReservedRoom(null);
        }
    }, [
        connection.instanceRunId,
        connection.phase,
        connection.processGeneration,
        connection.room,
        accountId,
    ]);
    useEffect(() => {
        if (!reservedRoom) return;
        if (
            accountId &&
            reservedRoom.accountId !== accountId
        ) {
            setReservedRoom(null);
            storeReservedRoom(null);
            return;
        }
        const remaining = reservedRoom.expiresAt - Date.now();
        if (remaining <= 0) {
            setReservedRoom(null);
            storeReservedRoom(null);
            return;
        }
        const timer = globalThis.setTimeout(() => {
            setReservedRoom(null);
            storeReservedRoom(null);
        }, remaining);
        return () => globalThis.clearTimeout(timer);
    }, [accountId, reservedRoom]);

    /** Acquires a ticket only after rechecking readiness, then authenticates the socket. */
    async function enterRoom(operation: JoinOperation, roomCode?: string, signal?: AbortSignal): Promise<boolean> {
        if (!api || !profile || joining) {
            setMessage(profile ? 'Multiplayer is unavailable.' : 'Log in to play multiplayer.');
            return false;
        }
        terminalAdmission.current = false;
        const generation = ++joinGeneration.current;
        const cancel = () => {
            if (joinGeneration.current !== generation) return;
            joinGeneration.current += 1;
            socket.cancelPendingJoin();
            setJoining(false);
        };
        signal?.addEventListener('abort', cancel, { once: true });
        const isCurrent = () => mounted.current && joinGeneration.current === generation;
        setJoining(true);
        setMessage('');
        try {
            if (signal?.aborted) { cancel(); return false; }
            const status = await api.getMultiplayerStatus();
            if (!isCurrent()) return false;
            const reconnectingDuringDrain =
                operation === 'reconnect' && status.phase === 'draining';
            if (
                (status.phase !== 'ready' && !reconnectingDuringDrain) ||
                !status.activeRegion ||
                !status.websocketUrl ||
                !status.instanceRunId ||
                !status.processGeneration ||
                status.protocolVersion !== PROTOCOL_VERSION
            ) {
                terminalAdmission.current = status.protocolVersion !== null && status.protocolVersion !== PROTOCOL_VERSION;
                setMessage(status.phase === 'starting' ? 'The server is still starting.' : 'The server is offline.');
                return false;
            }
            if (
                operation === 'reconnect' &&
                reservedRoom &&
                (reservedRoom.instanceRunId !== status.instanceRunId ||
                    reservedRoom.processGeneration !== status.processGeneration)
            ) {
                setReservedRoom(null);
                storeReservedRoom(null);
                terminalAdmission.current = true;
                setMessage('The previous room reservation has expired.');
                return false;
            }
            const requestRegion = status.activeRegion;
            const normalizedCode = roomCode?.trim().toUpperCase();
            const credential = await api.createJoinCredential({
                operation,
                region: requestRegion,
                ...(normalizedCode ? { roomCode: normalizedCode } : {}),
            });
            if (!isCurrent()) return false;
            if (
                credential.websocketUrl !== status.websocketUrl ||
                credential.processGeneration !== status.processGeneration
            ) {
                terminalAdmission.current = true;
                setMessage('The game server changed while joining. Recheck availability and try again.');
                return false;
            }
            const request: ConnectRoomRequest = {
                credential,
                operation,
                expectedInstanceRunId: status.instanceRunId,
                expectedProcessGeneration: status.processGeneration,
                ...(normalizedCode ? { roomCode: normalizedCode } : {}),
            };
            socket.connect(request);
            setRegion(requestRegion);
            return true;
        } catch (error) {
            if (isCurrent()) {
                terminalAdmission.current = typeof error === 'object' && error !== null && 'status' in error
                    && (error.status === 401 || error.status === 403);
                setMessage(error instanceof Error ? error.message : 'Unable to join multiplayer.');
            }
            return false;
        } finally {
            signal?.removeEventListener('abort', cancel);
            if (isCurrent()) setJoining(false);
        }
    }

    recoveryAttempt.current = async (signal) => {
        const code = socket.getSnapshot().room?.code ?? reservedRoom?.code;
        if (!code || !await enterRoom('reconnect', code, signal)) {
            return terminalAdmission.current || !code ? 'stop' : 'retry';
        }
        return waitForAdmission(socket, signal);
    };

    useEffect(() => {
        if (!['disconnected', 'failed'].includes(connection.phase)) return;
        if (!connection.recoverable || !accountId || !(connection.room?.code ?? reservedRoom?.code)) return;
        recoveryDeadline.current ??= Date.now() + 30_000;
        recovery.start(recoveryDeadline.current, (signal) => recoveryAttempt.current(signal));
    }, [connection.phase, connection.recoverable, connection.room, accountId, reservedRoom, recovery]);
    useEffect(() => {
        if (isAdmitted(connection)) recoveryDeadline.current = null;
    }, [connection]);

    /** Invalidates pending HTTP and socket admission while retaining reconnectable room metadata. */
    function cancelPendingJoin(): void {
        recovery.cancel();
        recoveryDeadline.current = null;
        joinGeneration.current += 1;
        setJoining(false);
        setMessage('');
        socket.cancelPendingJoin();
    }

    return {
        availability,
        connection,
        getConnectionSnapshot: socket.getSnapshot,
        synchronization: socket.synchronization,
        recovery: recoveryState,
        region,
        setRegion,
        joining,
        hasReservation:
            reservedRoom !== null &&
            accountId !== null &&
            reservedRoom.accountId === accountId,
        message: recoveryState.phase === 'waiting' || recoveryState.phase === 'connecting'
            ? `Reconnecting (attempt ${recoveryState.attempt} of 5)…`
            : recoveryState.phase === 'manual' ? 'Automatic reconnection stopped. Retry manually.' : connection.message || message,
        createRoom: () => enterRoom('create'),
        joinRoom: (roomCode: string) => enterRoom('join', roomCode),
        reconnect: () => {
            recovery.cancel();
            const code = connection.room?.code ?? reservedRoom?.code;
            return code ? enterRoom('reconnect', code) : Promise.resolve(false);
        },
        setReady: (ready: boolean) => socket.setReady(ready),
        startMatch: () => socket.startMatch(),
        closeNextWall: () => socket.closeNextWall(),
        rematch: () => socket.rematch(),
        sendDirection: (direction: 'up' | 'right' | 'down' | 'left') =>
            socket.sendDirection(direction),
        cancelPendingJoin,
        leave: () => {
            recovery.cancel();
            recoveryDeadline.current = null;
            joinGeneration.current += 1;
            setJoining(false);
            setReservedRoom(null);
            storeReservedRoom(null);
            socket.leave();
        },
    };
}

/** Requires authoritative admission, not merely an open/authenticated WebSocket. */
function isAdmitted(state: ReturnType<MultiplayerSocketClient['getSnapshot']>): boolean {
    return state.phase === 'connected' && state.room !== null && (state.room.phase === 'lobby'
        || state.map !== null && state.race !== null && state.race.matchId === state.room.matchId
            && state.race.mapId === state.map.id);
}

/** Waits for room state and an active match snapshot, releasing subscription on every exit. */
function waitForAdmission(socket: MultiplayerSocketClient, signal: AbortSignal): Promise<RecoveryResult> {
    return new Promise((resolve) => {
        const finish = (result: RecoveryResult) => {
            unsubscribe(); signal.removeEventListener('abort', cancel); resolve(result);
        };
        const cancel = () => { socket.cancelPendingJoin(); finish('retry'); };
        const inspect = () => {
            const state = socket.getSnapshot();
            if (isAdmitted(state)) finish('connected');
            else if (state.phase === 'closed' || !state.recoverable) finish('stop');
            else if (state.phase === 'disconnected' || state.phase === 'failed') finish('retry');
        };
        const unsubscribe = socket.subscribe(inspect);
        signal.addEventListener('abort', cancel, { once: true });
        if (signal.aborted) cancel(); else inspect();
    });
}
