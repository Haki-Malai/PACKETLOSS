import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { IS_DEV } from '../../config/environment';
import { RACE, type BoostAction, type Direction } from '../simulation/types';
import { BOOST } from '../simulation/boost';
import { buttonLayout } from './MenuPanel';
import { MultiplayerPresentationSession } from './MultiplayerPresentation';
import type { GameSession } from './useGameSession';
import { BrowserInputAdapter } from '../infrastructure/adapters/BrowserInputAdapter';
import { DirectionalInput } from '../infrastructure/adapters/DirectionalInput';
import type { MultiplayerSynchronization } from '../simulation/MultiplayerSynchronization';

/** Renders the authoritative Battle Royale while predicting only the local survivor's movement. */
export function MultiplayerViewport({ session }: { session: GameSession }) {
    const { connection } = session.multiplayer;
    const raceMap = connection.map;
    const localPlayer = connection.race?.players.find((player) => player.id === connection.playerId);
    const canBoost = connection.phase === 'connected' && !connection.stalled
        && connection.race?.movementEnabled && localPlayer?.connected
        && localPlayer.eliminatedAtTick === null && localPlayer.score > 0;
    const root = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const presentation = useRef<MultiplayerPresentationSession | null>(null);
    const sessionRef = useRef(session);
    const sendDirectionRef = useRef<(_direction: Direction) => void>(() => undefined);
    const input = useRef<BrowserInputAdapter | null>(null);
    const boostSources = useRef(new Set<string>());
    const boostPointer = useRef<number | null>(null);
    const boostRequested = useRef(false);
    const [presentationError, setPresentationError] = useState('');
    sessionRef.current = session;
    sendDirectionRef.current = (direction) => {
        const multiplayer = sessionRef.current.multiplayer;
        const latest = multiplayer.getConnectionSnapshot();
        const race = latest.race;
        if (!race || !['countdown', 'playing'].includes(race.phase)) return;
        const localPlayer = race.players.find((player) => player.id === latest.playerId);
        if (!localPlayer || localPlayer.eliminatedAtTick !== null) return;
        multiplayer.sendDirection(direction);
    };

    /** Reads current authority rather than a rendered HUD snapshot when publishing boost edges. */
    const sendBoost = useCallback((action: BoostAction) => {
        const multiplayer = sessionRef.current.multiplayer;
        const latest = multiplayer.getConnectionSnapshot();
        const player = latest.race?.players.find((candidate) => candidate.id === latest.playerId);
        if (latest.phase !== 'connected' || !latest.race?.movementEnabled
            || !player?.connected || player.eliminatedAtTick !== null) return null;
        if (action === 'press' && (document.hidden || latest.stalled || player.score <= 0)) return null;
        return multiplayer.sendBoost(action);
    }, []);

    /** Cancels even a released tap whose minimum burst may still be queued or active on the server. */
    const cancelBoostControl = useCallback(() => {
        if (boostRequested.current) sendBoost('cancel');
        boostRequested.current = false;
        boostSources.current.clear();
        boostPointer.current = null;
    }, [sendBoost]);

    /** Combines keyboard and pointer holds without buying multiple overlapping boosts. */
    const startBoost = useCallback((source: string): boolean => {
        if (boostSources.current.has(source)) return false;
        if (boostSources.current.size === 0) {
            if (sendBoost('press') === null) return false;
            boostRequested.current = true;
        }
        boostSources.current.add(source);
        return true;
    }, [sendBoost]);

    /** Releases only the owning source; failed releases fall back to stale-safe cancellation. */
    const releaseBoost = useCallback((source: string) => {
        if (!boostSources.current.delete(source) || boostSources.current.size > 0) return;
        if (sendBoost('release') === null) cancelBoostControl();
    }, [sendBoost, cancelBoostControl]);

    /** Captures the boost finger while the canvas independently accepts a steering swipe. */
    function boostPointerDown(event: ReactPointerEvent<HTMLButtonElement>): void {
        if (boostPointer.current !== null || event.pointerType !== 'touch' && event.button !== 0) return;
        event.preventDefault();
        if (!startBoost('pointer')) return;
        boostPointer.current = event.pointerId;
        event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    /** Completes an ordinary tap/hold without cancelling its minimum burst. */
    function boostPointerUp(event: ReactPointerEvent<HTMLButtonElement>): void {
        if (boostPointer.current !== event.pointerId) return;
        event.preventDefault();
        boostPointer.current = null;
        releaseBoost('pointer');
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    }

    /** Immediately cancels an interrupted capture instead of retaining an unattended hold. */
    function boostPointerCancel(event: ReactPointerEvent<HTMLButtonElement>): void {
        if (boostPointer.current === event.pointerId) cancelBoostControl();
    }

    /** Gives a focused Boost button normal Space/Enter accessibility with the same held behavior. */
    function boostKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>): void {
        if (!['Space', 'Enter'].includes(event.code) || event.altKey || event.ctrlKey || event.metaKey) return;
        event.preventDefault();
        if (!event.repeat) startBoost(`button-${event.code}`);
    }

    /** Releases a focused keyboard control while suppressing a duplicate native click. */
    function boostKeyUp(event: ReactKeyboardEvent<HTMLButtonElement>): void {
        if (!['Space', 'Enter'].includes(event.code)) return;
        event.preventDefault();
        releaseBoost(`button-${event.code}`);
    }

    useEffect(() => {
        presentation.current?.reset();
        input.current?.reset();
    }, [connection.race?.matchId, connection.phase, connection.race?.movementEnabled,
        connection.stalled, localPlayer?.eliminatedAtTick]);

    useEffect(() => {
        if (!canBoost) cancelBoostControl();
    }, [canBoost, cancelBoostControl]);

    useEffect(() => {
        const target = canvas.current;
        if (!target) return;
        const adapter = new BrowserInputAdapter(target);
        const directions = new DirectionalInput((code) => adapter.isKeyDown(code));
        input.current = adapter;
        let sentKeyboard: Direction | null = null;
        /** Publishes changed held intent using the same key priority as solo play. */
        function keyboardIntent(event: KeyboardEvent) {
            if (document.hidden) return;
            const direction = directions.keyboardDirection();
            if (direction) event.preventDefault();
            if (direction && direction !== sentKeyboard) sendDirectionRef.current(direction);
            sentKeyboard = direction;
        }
        adapter.onKeyDown(keyboardIntent);
        adapter.onKeyDown((event) => {
            if (event.code !== 'Space' || document.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
            event.preventDefault();
            if (!event.repeat) startBoost('space');
        });
        adapter.onKeyDown((event) => {
            if (!IS_DEV || !sessionRef.current.developmentMultiplayer || document.hidden
                || event.code !== 'KeyC' || event.repeat || event.altKey || event.ctrlKey
                || event.metaKey || event.shiftKey) return;
            event.preventDefault();
            sessionRef.current.multiplayer.closeNextWall();
        });
        adapter.onKeyUp(keyboardIntent);
        adapter.onKeyUp((event) => { if (event.code === 'Space') releaseBoost('space'); });
        adapter.onPointerDown((pointer) => { if (!document.hidden) directions.start(pointer); });
        adapter.onPointerMove((pointer) => {
            if (document.hidden) return;
            const direction = directions.move(pointer);
            if (direction) sendDirectionRef.current(direction);
        });
        adapter.onPointerUp((pointer) => directions.end(pointer));
        adapter.onPointerCancel((pointer) => directions.cancel(pointer.pointerId));
        adapter.onReset(() => { directions.reset(); sentKeyboard = null; cancelBoostControl(); });
        /** Drops pending input on visibility changes without pausing the authoritative match. */
        const resetInput = () => adapter.reset();
        document.addEventListener('visibilitychange', resetInput);
        return () => {
            document.removeEventListener('visibilitychange', resetInput);
            cancelBoostControl();
            if (input.current === adapter) input.current = null;
            adapter.destroy();
        };
    }, [startBoost, releaseBoost, cancelBoostControl]);

    useEffect(() => {
        const targetCanvas = canvas.current;
        const targetRoot = root.current;
        if (!raceMap || !targetCanvas || !targetRoot) return;
        let active = true;
        const current = new MultiplayerPresentationSession({
            canvas: targetCanvas,
            root: targetRoot,
            map: raceMap,
            getConnectionSnapshot: session.multiplayer.getConnectionSnapshot,
            synchronization: session.multiplayer.synchronization,
            isReducedMotion: () => {
                const motion = sessionRef.current.store.getMotion();
                return motion === 'reduced' || motion === 'system'
                    && (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
            },
            onError: (error) => {
                if (active) setPresentationError(formatPresentationError(error));
            },
        });
        presentation.current = current;
        setPresentationError('');
        void current.ready.catch((error: unknown) => {
            if (active && !isAbortError(error)) {
                setPresentationError(formatPresentationError(error));
            }
        });
        return () => {
            active = false;
            if (presentation.current === current) presentation.current = null;
            current.dispose();
        };
    }, [raceMap, session.multiplayer.getConnectionSnapshot, session.multiplayer.synchronization]);

    const race = connection.race;
    const remainingTicks = race ? Math.max(0, RACE.matchTicks - race.playTicks) : 0;
    const remainingSeconds = Math.ceil(remainingTicks / 60);
    const shrinkTicks = race && race.shrinkStage < RACE.maxShrinkStage
        ? Math.max(1, RACE.shrinkEveryTicks - race.playTicks % RACE.shrinkEveryTicks)
        : 0;
    const shrinkSeconds = Math.ceil(shrinkTicks / 60);
    const shrinkProgress = shrinkTicks > 0
        ? 1 - shrinkTicks / RACE.shrinkEveryTicks
        : 1;
    const arenaSize = race ? 49 - race.shrinkStage * 2 : 49;

    return (
        <section
            ref={root}
            className="packet-multiplayer absolute inset-0 touch-none"
            aria-label="Battle Royale"
        >
            <canvas ref={canvas} className="block h-full w-full" tabIndex={-1} />
            {IS_DEV && <MultiplayerSyncDiagnostics synchronization={session.multiplayer.synchronization} />}
            {presentationError && (
                <p className="packet-multiplayer-alert" role="alert">
                    {presentationError}
                </p>
            )}
            <div className="packet-race-status" role="status" aria-live="polite">
                <span>
                    {connection.stalled ? 'CONNECTION UNSTABLE' : connection.phase === 'connected'
                        ? 'CONNECTED'
                        : connection.phase.toUpperCase()}
                </span>
                <strong>{formatClock(remainingSeconds)}</strong>
                <span>{arenaSize} × {arenaSize}</span>
                {connection.latencyMs !== null && (
                    <span>{Math.round(connection.latencyMs)} MS</span>
                )}
            </div>
            <ol className="packet-race-scores" aria-label="Player scores">
                {race?.players.map((player) => (
                    <li key={player.id} data-local={player.id === connection.playerId || undefined}>
                        <span className="packet-race-player">
                            <i style={{ backgroundColor: player.color }} />
                            {player.name}
                            {!player.connected && ' · disconnected'}
                            {player.eliminatedAtTick !== null && ' · eliminated'}
                        </span>
                        <strong>{player.score.toLocaleString()}</strong>
                    </li>
                ))}
            </ol>
            {shrinkTicks > 0 && race?.phase === 'playing' && (
                <p
                    className="packet-arena-warning"
                    role="status"
                    aria-live="polite"
                    style={{
                        animationDuration: `${2 - shrinkProgress * 1.6}s`,
                        borderColor: `hsl(${38 - shrinkProgress * 34} 92% 62%)`,
                        color: `hsl(${38 - shrinkProgress * 34} 92% 72%)`,
                    }}
                >
                    WALL CLOSURE · {shrinkSeconds}s
                </p>
            )}
            {localPlayer && localPlayer.eliminatedAtTick !== null && localPlayer.deathMs <= 0
                && race?.phase === 'playing' && (
                <p className="packet-spectating" role="status">SPECTATING</p>
            )}
            {connection.warning && (
                <p className="packet-race-warning" role="alert">
                    Server {connection.warning.reason} in{' '}
                    {Math.ceil(connection.warning.remainingMs / 60_000)} min
                </p>
            )}
            <button
                type="button"
                className={`packet-button packet-race-boost min-h-11 px-3 py-2 ${buttonLayout}`}
                aria-label="Boost"
                aria-describedby="packet-boost-help"
                aria-pressed={localPlayer?.boosting ?? false}
                disabled={!canBoost}
                onPointerDown={boostPointerDown}
                onPointerUp={boostPointerUp}
                onPointerCancel={boostPointerCancel}
                onLostPointerCapture={boostPointerCancel}
                onKeyDown={boostKeyDown}
                onKeyUp={boostKeyUp}
                onBlur={cancelBoostControl}
                onClick={(event) => {
                    if (event.detail === 0 && startBoost('activate')) releaseBoost('activate');
                }}
            >
                <span>Boost</span>
                <span className="text-packet-text-muted text-xs">
                    Space · {Math.round(1000 / (RACE.stepMs * BOOST.ticksPerPoint))} pts/s
                </span>
            </button>
            <p id="packet-boost-help" className="sr-only">
                Tap for a 125 millisecond burst, or hold to move twice as fast while spending 40 points per second only while moving.
            </p>
            <button
                type="button"
                className={`packet-button packet-race-leave min-h-11 px-3 py-2 ${buttonLayout}`}
                onClick={session.leaveMultiplayer}
            >
                Leave
            </button>
        </section>
    );
}

function formatClock(seconds: number): string {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatPresentationError(error: unknown): string {
    return error instanceof Error ? error.message : 'Unable to render the multiplayer maze.';
}

function isAbortError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
}

/** Displays bounded diagnostic samples without subscribing React to movement frames. */
function MultiplayerSyncDiagnostics({ synchronization }: { synchronization: MultiplayerSynchronization }) {
    const [diagnostics, setDiagnostics] = useState(() => ({ ...synchronization.diagnostics }));
    useEffect(() => {
        const timer = globalThis.setInterval(() => setDiagnostics({ ...synchronization.diagnostics }), 1000);
        return () => globalThis.clearInterval(timer);
    }, [synchronization]);
    return (
        <pre
            aria-label="Network diagnostics"
            className="pointer-events-none absolute bottom-3 left-3 z-20 m-0 border border-packet-line bg-packet-void/90 px-2 py-1.5 font-mono text-xs leading-normal whitespace-pre text-packet-text"
        >
            {`SYNC age ${Math.round(diagnostics.snapshotAgeMs)} ms · pending ${diagnostics.pendingInputs} · buffer misses ${diagnostics.interpolationUnderruns}\nCorrection ${diagnostics.correctionMagnitude.toFixed(3)} tiles · ${diagnostics.correctionReason}`}
        </pre>
    );
}
