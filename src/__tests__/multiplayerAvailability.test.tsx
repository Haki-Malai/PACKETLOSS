// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
    AccountApi,
    CloudProfile,
} from '../game/infrastructure/adapters/AccountClient';
import type { LocalRunRecord } from '../game/infrastructure/adapters/LocalProfileStore';
import type {
    JoinCredential,
    MultiplayerApi,
    MultiplayerStatus,
} from '../game/infrastructure/adapters/MultiplayerClient';
import { useGameSession, type GameSession } from '../game/ui/useGameSession';
import { useMultiplayerAvailability } from '../game/ui/useMultiplayerAvailability';
import { useMultiplayerSession } from '../game/ui/useMultiplayerSession';
import { PROTOCOL_VERSION } from '../game/protocol/version';

class FakeSocket {
    readyState = 1;
    onopen: ((_event: Event) => void) | null = null;
    onmessage: ((_event: MessageEvent<unknown>) => void) | null = null;
    onerror: ((_event: Event) => void) | null = null;
    onclose: ((_event: CloseEvent) => void) | null = null;
    readonly sent: string[] = [];

    constructor(readonly url: string) {
        sockets.push(this);
    }

    send(data: string): void {
        this.sent.push(data);
    }

    close(): void {
        this.readyState = 3;
    }

    open(): void {
        this.onopen?.(new Event('open'));
    }

    message(value: unknown): void {
        this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(value) }));
    }

    serverClose(): void {
        this.readyState = 3;
        this.onclose?.(new Event('close') as CloseEvent);
    }
}

const sockets: FakeSocket[] = [];

const readyStatus: MultiplayerStatus = {
    phase: 'ready',
    activeRegion: 'eu',
    instanceRunId: 'run-1',
    processGeneration: 'generation-1',
    websocketUrl: 'wss://eu.game.example/ws',
    protocolVersion: PROTOCOL_VERSION,
    regions: {
        eu: {
            region: 'eu',
            phase: 'ready',
            ready: true,
            hostname: 'eu.game.example',
            updatedAt: new Date().toISOString(),
        },
        na: {
            region: 'na',
            phase: 'stopped',
            ready: false,
            hostname: 'na.game.example',
            updatedAt: new Date().toISOString(),
        },
    },
};

/** Creates a controllable promise for admission-race tests. */
function deferred<T>() {
    let resolve!: (_value: T) => void;
    const promise = new Promise<T>((done) => {
        resolve = done;
    });
    return { promise, resolve };
}

/** Supplies an already-authenticated account to the shell integration tests. */
function authenticatedAccount(profile: CloudProfile): AccountApi {
    return {
        signup: vi.fn(async () => {}),
        confirmSignup: vi.fn(async () => {}),
        resendConfirmation: vi.fn(async () => {}),
        login: vi.fn(async () => {}),
        refresh: vi.fn(async () => {}),
        logout: vi.fn(async () => {}),
        forgotPassword: vi.fn(async () => {}),
        resetPassword: vi.fn(async () => {}),
        getProfile: vi.fn(() => Promise.resolve(profile)),
        updateProfile: vi.fn((next: CloudProfile) => Promise.resolve(next)),
        getRecords: vi.fn((): Promise<LocalRunRecord[]> => Promise.resolve([])),
        putRecords: vi.fn((records: readonly LocalRunRecord[]) => Promise.resolve([...records])),
        clearRecords: vi.fn(async () => {}),
    };
}

/** Creates a ready control API whose room credential remains pending. */
function multiplayerApi(credential: Promise<JoinCredential>) {
    return {
        getMultiplayerStatus: vi.fn(() => Promise.resolve(readyStatus)),
        getMultiplayerCapabilities: vi.fn(() => Promise.resolve({ canStart: false })),
        startMultiplayerServer: vi.fn(() => Promise.reject(new Error('not used'))),
        createJoinCredential: vi.fn(() => credential),
        getMultiplayerMatch: vi.fn(() => Promise.reject(new Error('not used'))),
    } satisfies MultiplayerApi;
}

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    globalThis.sessionStorage?.clear();
    sockets.length = 0;
});

describe('useMultiplayerAvailability', () => {
    it('refuses a version-one server before issuing a ticket or opening a socket', async () => {
        vi.stubGlobal('WebSocket', FakeSocket);
        const api = multiplayerApi(deferred<JoinCredential>().promise);
        api.getMultiplayerStatus.mockResolvedValue({ ...readyStatus, protocolVersion: 1 });
        const { result, unmount } = renderHook(() =>
            useMultiplayerSession(api, { accountId: 'player-1', nickname: 'PLAYER', avatar: 'packet' }, false)
        );
        await act(async () => {
            expect(await result.current.createRoom()).toBe(false);
        });
        expect(api.createJoinCredential).not.toHaveBeenCalled();
        expect(sockets).toHaveLength(0);
        unmount();
    });

    it('polls readiness without ever invoking the owner start operation', async () => {
        vi.useFakeTimers();
        const startMultiplayerServer = vi.fn(() => Promise.resolve({
            phase: 'starting' as const,
            region: 'eu' as const,
            operationId: 'operation-1',
        }));
        const api = {
            getMultiplayerStatus: vi.fn(() => Promise.resolve(readyStatus)),
            getMultiplayerCapabilities: vi.fn(() => Promise.resolve({ canStart: true })),
            startMultiplayerServer,
            createJoinCredential: vi.fn(() => Promise.reject(new Error('not used'))),
            getMultiplayerMatch: vi.fn(() => Promise.reject(new Error('not used'))),
        } satisfies MultiplayerApi;
        const { result, unmount } = renderHook(() =>
            useMultiplayerAvailability(api, true, true)
        );
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(result.current.state.label).toBe('Ready');
        expect(startMultiplayerServer).not.toHaveBeenCalled();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(15_000);
        });
        expect(api.getMultiplayerStatus).toHaveBeenCalledTimes(2);
        expect(startMultiplayerServer).not.toHaveBeenCalled();
        unmount();
    });

    it('requests a reserved reconnect while the server is draining', async () => {
        vi.stubGlobal('WebSocket', FakeSocket);
        let status = readyStatus;
        const createJoinCredential = vi.fn(() => Promise.resolve({
            ticket: 'ticket',
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
            websocketUrl: readyStatus.websocketUrl!,
            processGeneration: readyStatus.processGeneration!,
        }));
        const api = {
            getMultiplayerStatus: vi.fn(() => Promise.resolve(status)),
            getMultiplayerCapabilities: vi.fn(() => Promise.resolve({ canStart: false })),
            startMultiplayerServer: vi.fn(() => Promise.reject(new Error('not used'))),
            createJoinCredential,
            getMultiplayerMatch: vi.fn(() => Promise.reject(new Error('not used'))),
        } satisfies MultiplayerApi;
        const { result, unmount } = renderHook(() =>
            useMultiplayerSession(api, { accountId: 'player-1', nickname: 'PLAYER', avatar: 'packet' }, false)
        );

        await act(async () => {
            expect(await result.current.createRoom()).toBe(true);
        });
        const first = sockets[0];
        act(() => {
            first.open();
            first.message({
                type: 'authenticated',
                version: PROTOCOL_VERSION,
                playerId: 'player-1',
                instanceRunId: 'run-1',
                processGeneration: 'generation-1',
            });
            first.message({
                type: 'room',
                room: {
                    code: 'ABC234',
                    ownerId: 'player-1',
                    phase: 'playing',
                    matchId: 'match-1',
                    canStart: false,
                    players: [{
                        id: 'player-1',
                        name: 'PLAYER',
                        color: '#38bdf8',
                        ready: true,
                        connected: true,
                        reservedUntilMs: null,
                    }],
                },
            });
            first.serverClose();
        });
        status = {
            ...readyStatus,
            phase: 'draining',
            regions: {
                ...readyStatus.regions,
                eu: { ...readyStatus.regions.eu, phase: 'draining', ready: false },
            },
        };

        await act(async () => {
            expect(await result.current.reconnect()).toBe(true);
        });
        expect(createJoinCredential).toHaveBeenLastCalledWith({
            operation: 'reconnect',
            region: 'eu',
            roomCode: 'ABC234',
        });
        expect(sockets).toHaveLength(2);
        act(() => sockets[1].serverClose());
        await act(async () => {
            expect(await result.current.reconnect()).toBe(true);
        });
        expect(sockets).toHaveLength(3);
        expect(createJoinCredential).toHaveBeenLastCalledWith({
            operation: 'reconnect',
            region: 'eu',
            roomCode: 'ABC234',
        });

        act(() => sockets[2].onerror?.(new Event('error')));
        await act(async () => {
            expect(await result.current.reconnect()).toBe(true);
        });
        expect(sockets).toHaveLength(4);

        act(() => result.current.leave());
        await act(async () => {
            expect(await result.current.reconnect()).toBe(false);
        });
        expect(sockets).toHaveLength(4);
        unmount();
    });

    it('restores the reserved room after a page-level session remount', async () => {
        vi.stubGlobal('WebSocket', FakeSocket);
        const createJoinCredential = vi.fn(() => Promise.resolve({
            ticket: 'ticket',
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
            websocketUrl: readyStatus.websocketUrl!,
            processGeneration: readyStatus.processGeneration!,
        }));
        const api = {
            getMultiplayerStatus: vi.fn(() => Promise.resolve(readyStatus)),
            getMultiplayerCapabilities: vi.fn(() => Promise.resolve({ canStart: false })),
            startMultiplayerServer: vi.fn(() => Promise.reject(new Error('not used'))),
            createJoinCredential,
            getMultiplayerMatch: vi.fn(() => Promise.reject(new Error('not used'))),
        } satisfies MultiplayerApi;
        const profile = { accountId: 'player-1', nickname: 'PLAYER', avatar: 'packet' } as const;
        const first = renderHook(() => useMultiplayerSession(api, profile, false));
        await act(async () => {
            expect(await first.result.current.createRoom()).toBe(true);
        });
        act(() => {
            sockets[0].message({
                type: 'authenticated', version: PROTOCOL_VERSION, playerId: 'player-1',
                instanceRunId: 'run-1', processGeneration: 'generation-1',
            });
            sockets[0].message({
                type: 'room',
                room: {
                    code: 'ABC234', ownerId: 'player-1', phase: 'playing', matchId: 'match-1',
                    canStart: false, players: [],
                },
            });
        });
        expect(first.result.current.hasReservation).toBe(true);
        first.unmount();

        const second = renderHook(() => useMultiplayerSession(api, profile, false));
        expect(second.result.current.hasReservation).toBe(true);
        await act(async () => {
            expect(await second.result.current.reconnect()).toBe(true);
        });
        expect(createJoinCredential).toHaveBeenLastCalledWith({
            operation: 'reconnect', region: 'eu', roomCode: 'ABC234',
        });
        act(() => sockets[1].message({
            type: 'error', code: 'room_error', message: 'The reservation expired.',
        }));
        expect(second.result.current.hasReservation).toBe(false);
        second.unmount();
    });

    it('does not open a socket when navigation cancels a pending ticket request', async () => {
        vi.stubGlobal('WebSocket', FakeSocket);
        let resolveCredential!: (credential: {
            ticket: string;
            expiresAt: string;
            websocketUrl: string;
            processGeneration: string;
        }) => void;
        const credential = new Promise<Parameters<typeof resolveCredential>[0]>((resolve) => {
            resolveCredential = resolve;
        });
        const api = {
            getMultiplayerStatus: vi.fn(() => Promise.resolve(readyStatus)),
            getMultiplayerCapabilities: vi.fn(() => Promise.resolve({ canStart: false })),
            startMultiplayerServer: vi.fn(() => Promise.reject(new Error('not used'))),
            createJoinCredential: vi.fn(() => credential),
            getMultiplayerMatch: vi.fn(() => Promise.reject(new Error('not used'))),
        } satisfies MultiplayerApi;
        const { result, unmount } = renderHook(() =>
            useMultiplayerSession(api, { accountId: 'player-1', nickname: 'PLAYER', avatar: 'packet' }, false)
        );
        let attempt!: Promise<boolean>;
        act(() => {
            attempt = result.current.createRoom();
        });
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(api.createJoinCredential).toHaveBeenCalledOnce();
        act(() => result.current.cancelPendingJoin());
        resolveCredential({
            ticket: 'late-ticket', expiresAt: new Date(Date.now() + 60_000).toISOString(),
            websocketUrl: readyStatus.websocketUrl!, processGeneration: 'generation-1',
        });
        await act(async () => {
            expect(await attempt).toBe(false);
        });
        expect(sockets).toHaveLength(0);
        unmount();
    });

    it('renews stored recovery when an authoritative rematch room update arrives', async () => {
        vi.useFakeTimers();
        vi.stubGlobal('WebSocket', FakeSocket);
        const api = {
            getMultiplayerStatus: vi.fn(() => Promise.resolve(readyStatus)),
            getMultiplayerCapabilities: vi.fn(() => Promise.resolve({ canStart: false })),
            startMultiplayerServer: vi.fn(() => Promise.reject(new Error('not used'))),
            createJoinCredential: vi.fn(() => Promise.resolve({
                ticket: 'ticket', expiresAt: new Date(Date.now() + 60_000).toISOString(),
                websocketUrl: readyStatus.websocketUrl!, processGeneration: 'generation-1',
            })),
            getMultiplayerMatch: vi.fn(() => Promise.reject(new Error('not used'))),
        } satisfies MultiplayerApi;
        const { result, rerender, unmount } = renderHook(() => useMultiplayerSession(
            api, { accountId: 'player-1', nickname: 'PLAYER', avatar: 'packet' }, false
        ));
        await act(async () => {
            expect(await result.current.createRoom()).toBe(true);
        });
        const room = {
            code: 'ABC234', ownerId: 'player-1', phase: 'lobby' as const, matchId: null,
            canStart: false, players: [],
        };
        act(() => {
            sockets[0].message({
                type: 'authenticated', version: PROTOCOL_VERSION, playerId: 'player-1',
                instanceRunId: 'run-1', processGeneration: 'generation-1',
            });
            sockets[0].message({ type: 'room', room });
        });
        rerender();
        expect(sockets[0].readyState).toBe(1);
        expect(result.current.connection.room?.code).toBe('ABC234');
        await act(async () => vi.advanceTimersByTimeAsync(9 * 60_000));
        act(() => sockets[0].message({ type: 'room', room: { ...room } }));
        await act(async () => vi.advanceTimersByTimeAsync(3 * 60_000));
        expect(result.current.hasReservation).toBe(true);
        act(() => result.current.leave());
        unmount();
    });
});

describe('multiplayer navigation cancellation', () => {
    it.each([
        ['header Back', (session: GameSession) => session.back()],
        ['footer Back', (session: GameSession) => session.mainMenu('[data-action="multiplayer"]')],
    ])('cancels delayed room admission through %s', async (_label, exit) => {
        vi.stubGlobal('WebSocket', FakeSocket);
        const pending = deferred<JoinCredential>();
        const api = multiplayerApi(pending.promise);
        const account = authenticatedAccount({
            accountId: 'player-1',
            nickname: 'PLAYER',
            avatar: 'packet',
        });
        const session = renderHook(() =>
            useGameSession({
                mapVariant: 'default',
                accountClient: account,
                multiplayerClient: api,
            })
        );
        await waitFor(() => expect(session.result.current.state.screen).toBe('title'));
        act(() => session.result.current.openMultiplayer());
        let admission!: Promise<boolean>;
        act(() => {
            admission = session.result.current.multiplayer.createRoom();
        });
        await waitFor(() => expect(api.createJoinCredential).toHaveBeenCalledOnce());

        act(() => exit(session.result.current));
        pending.resolve({
            ticket: 'late-ticket',
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
            websocketUrl: readyStatus.websocketUrl!,
            processGeneration: readyStatus.processGeneration!,
        });
        await act(async () => {
            expect(await admission).toBe(false);
        });

        expect(session.result.current.state.screen).toBe('title');
        expect(sockets).toHaveLength(0);
        session.unmount();
    });

    it('keeps a delayed reconnect from replacing a newly started solo run', async () => {
        vi.stubGlobal('WebSocket', FakeSocket);
        const pending = deferred<JoinCredential>();
        const api = multiplayerApi(pending.promise);
        const account = authenticatedAccount({
            accountId: 'player-1',
            nickname: 'PLAYER',
            avatar: 'packet',
        });
        sessionStorage.setItem(
            'packetloss.multiplayer.reserved-room',
            JSON.stringify({
                code: 'ABC234',
                accountId: 'player-1',
                instanceRunId: 'run-1',
                processGeneration: 'generation-1',
                expiresAt: Date.now() + 60_000,
            })
        );
        const game = {
            start: vi.fn(async () => {}),
            pause: vi.fn(),
            resume: vi.fn(),
            continueLevel: vi.fn(),
            destroy: vi.fn(),
        };
        const session = renderHook(() =>
            useGameSession({
                mapVariant: 'default',
                accountClient: account,
                multiplayerClient: api,
                createGame: () => game,
            })
        );
        await waitFor(() => expect(session.result.current.state.screen).toBe('title'));
        let reconnect!: Promise<boolean>;
        act(() => {
            reconnect = session.result.current.multiplayer.reconnect();
        });
        await waitFor(() => expect(api.createJoinCredential).toHaveBeenCalledOnce());

        act(() => session.result.current.submenu('mode'));
        act(() => session.result.current.startRun(undefined, 'classic'));
        pending.resolve({
            ticket: 'late-ticket',
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
            websocketUrl: readyStatus.websocketUrl!,
            processGeneration: readyStatus.processGeneration!,
        });
        await act(async () => {
            expect(await reconnect).toBe(false);
            await Promise.resolve();
        });

        expect(game.start).toHaveBeenCalledOnce();
        expect(session.result.current.state.screen).toBe('playing');
        expect(sockets).toHaveLength(0);
        session.unmount();
    });
});
