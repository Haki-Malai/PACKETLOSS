import { useEffect, useRef, useState } from 'react';
import { IS_DEV } from '../../config/environment';
import { RACE, type Direction } from '../simulation/types';
import { buttonLayout } from './MenuPanel';
import { MultiplayerPresentationSession } from './MultiplayerPresentation';
import type { GameSession } from './useGameSession';
import { BrowserInputAdapter } from '../infrastructure/adapters/BrowserInputAdapter';
import { DirectionalInput } from '../infrastructure/adapters/DirectionalInput';

/** Renders the authoritative Battle Royale while predicting only the local survivor's movement. */
export function MultiplayerViewport({ session }: { session: GameSession }) {
    const { connection } = session.multiplayer;
    const raceMap = connection.map;
    const root = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const presentation = useRef<MultiplayerPresentationSession | null>(null);
    const sessionRef = useRef(session);
    const sendDirectionRef = useRef<(_direction: Direction) => void>(() => undefined);
    const input = useRef<BrowserInputAdapter | null>(null);
    const [presentationError, setPresentationError] = useState('');
    sessionRef.current = session;
    sendDirectionRef.current = (direction) => {
        const multiplayer = sessionRef.current.multiplayer;
        const latest = multiplayer.getConnectionSnapshot();
        const race = latest.race;
        if (!race || !['countdown', 'playing'].includes(race.phase)) return;
        const localPlayer = race.players.find((player) => player.id === latest.playerId);
        if (!localPlayer || localPlayer.eliminatedAtTick !== null) return;
        const sequence = multiplayer.sendDirection(direction);
        presentation.current?.recordInput(sequence, direction);
    };

    useEffect(() => {
        presentation.current?.reset();
        input.current?.reset();
    }, [connection.race?.matchId, connection.phase]);

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
            if (!IS_DEV || !sessionRef.current.developmentMultiplayer || document.hidden
                || event.code !== 'KeyC' || event.repeat || event.altKey || event.ctrlKey
                || event.metaKey || event.shiftKey) return;
            event.preventDefault();
            sessionRef.current.multiplayer.closeNextWall();
        });
        adapter.onKeyUp(keyboardIntent);
        adapter.onPointerDown((pointer) => { if (!document.hidden) directions.start(pointer); });
        adapter.onPointerMove((pointer) => {
            if (document.hidden) return;
            const direction = directions.move(pointer);
            if (direction) sendDirectionRef.current(direction);
        });
        adapter.onPointerUp((pointer) => directions.end(pointer));
        adapter.onPointerCancel((pointer) => directions.cancel(pointer.pointerId));
        adapter.onReset(() => { directions.reset(); sentKeyboard = null; });
        /** Drops pending input on visibility changes without pausing the authoritative match. */
        const resetInput = () => adapter.reset();
        document.addEventListener('visibilitychange', resetInput);
        return () => {
            document.removeEventListener('visibilitychange', resetInput);
            if (input.current === adapter) input.current = null;
            adapter.destroy();
        };
    }, []);

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
    }, [raceMap, session.multiplayer.getConnectionSnapshot]);

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
    const localPlayer = race?.players.find((player) => player.id === connection.playerId);

    return (
        <section
            ref={root}
            className="packet-multiplayer absolute inset-0 touch-none"
            aria-label="Battle Royale"
        >
            <canvas ref={canvas} className="block h-full w-full" tabIndex={-1} />
            {presentationError && (
                <p className="packet-multiplayer-alert" role="alert">
                    {presentationError}
                </p>
            )}
            <div className="packet-race-status" role="status" aria-live="polite">
                <span>
                    {connection.phase === 'connected'
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
