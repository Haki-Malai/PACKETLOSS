import { useCallback, useSyncExternalStore } from 'react';
import {
    GameEvent,
    getDefaultGameStateStore,
    type GameStateStore,
} from '../../state/gameState';
import type { DebugStore } from './debugStore';
import { MenuButton } from './MenuPanel';

export function Hud({
    onPause,
    gameState = getDefaultGameStateStore(),
}: {
    onPause: () => void;
    gameState?: GameStateStore;
}) {
    const subscribeScore = useCallback((listener: () => void) => {
        gameState.on(GameEvent.ScoreChanged, listener);
        return () => gameState.off(GameEvent.ScoreChanged, listener);
    }, [gameState]);
    const subscribeLives = useCallback((listener: () => void) => {
        gameState.on(GameEvent.LivesChanged, listener);
        return () => gameState.off(GameEvent.LivesChanged, listener);
    }, [gameState]);
    const subscribeBonus = useCallback((listener: () => void) => {
        gameState.on(GameEvent.BonusChanged, listener);
        return () => gameState.off(GameEvent.BonusChanged, listener);
    }, [gameState]);
    const getScore = useCallback(() => gameState.getSnapshot().score, [gameState]);
    const getLives = useCallback(
        () => Math.max(0, Math.floor(gameState.getSnapshot().lives)),
        [gameState]
    );
    const getBonus = useCallback(() => gameState.getScoreBonusStatus(), [gameState]);
    // HUD is event-driven through game state events.
    const score = useSyncExternalStore(subscribeScore, getScore);
    const lives = useSyncExternalStore(subscribeLives, getLives);
    const bonus = useSyncExternalStore(subscribeBonus, getBonus);
    // HUD is rendered in DOM overlay; no canvas draw required.
    return (
        <div
            className="packet-hud absolute inset-x-0 bottom-0 flex items-center justify-between gap-4"
            data-game-hud="true"
        >
            <div className="packet-hud-section flex flex-col gap-1" data-hud-score="true">
                <span className="packet-hud-label">Score</span>
                <span className="packet-hud-score" data-hud-score-value="true">
                    {score}
                </span>
            </div>
            {bonus && (
                <div className="packet-hud-section flex flex-col gap-1" data-hud-bonus={bonus.phase}>
                    <span className="packet-hud-label">{bonus.phase === 'active' ? 'Boost' : 'Pickups'}</span>
                    <span className="packet-hud-score" aria-label={bonus.phase === 'active'
                        ? `${bonus.kind} boost, ${bonus.multiplier} times, ${bonus.seconds} seconds active`
                        : `${bonus.count} multiplier pickups available`}>
                        {bonus.phase === 'active' ? `×${bonus.multiplier} · ${bonus.seconds}s` : `${bonus.count} available`}
                    </span>
                </div>
            )}
            <div className="packet-hud-section flex flex-col gap-1" data-hud-lives="true">
                <span className="packet-hud-label">Lives</span>
                <span className="packet-hud-lives" data-hud-lives-value="true">
                    {lives}
                </span>
            </div>
            <MenuButton
                layout="compact"
                className="packet-hud-pause"
                data-hud-pause="true"
                onClick={onPause}
            >
                Pause
            </MenuButton>
        </div>
    );
}

export function DebugOverlay({ store }: { store: DebugStore }) {
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
    const classes =
        'pointer-events-none fixed left-[max(8px,env(safe-area-inset-left))] z-[9999] m-0 max-w-[calc(100%-16px)] overflow-hidden border border-packet-line bg-packet-void/90 px-2 py-1.5 font-mono text-xs leading-[1.35] whitespace-pre text-packet-text';
    return (
        <>
            <pre
                id="runtime-debug-panel"
                className={`${classes} top-[max(8px,env(safe-area-inset-top))]`}
                hidden={!snapshot.enabled}
            >
                {snapshot.runtimeText}
            </pre>
            <pre
                id="collision-debug-panel"
                className={`${classes} top-[calc(52px+env(safe-area-inset-top))]`}
                hidden={!snapshot.enabled}
            >
                {snapshot.collisionText}
            </pre>
        </>
    );
}
