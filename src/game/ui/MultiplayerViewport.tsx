import { useEffect, useRef, useState } from 'react';
import { RACE, type Direction } from '../simulation/types';
import { buttonLayout } from './MenuPanel';
import { MultiplayerPresentationSession } from './MultiplayerPresentation';
import type { GameSession } from './useGameSession';
import { BrowserInputAdapter } from '../infrastructure/adapters/BrowserInputAdapter';
import { DirectionalInput } from '../infrastructure/adapters/DirectionalInput';

/** Renders the authoritative Data Race while predicting only the local player's movement. */
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

    return (
        <section
            ref={root}
            className="packet-multiplayer absolute inset-0 touch-none"
            aria-label="Data Race"
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
                        </span>
                        <strong>{player.score.toLocaleString()}</strong>
                    </li>
                ))}
            </ol>
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
