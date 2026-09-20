import { useSyncExternalStore } from 'react';
import { GameEvent, gameEvents, getGameState, getScoreBonusStatus } from '../../state/gameState';
import type { DebugStore } from './debugStore';
import { MenuButton } from './MenuPanel';

/**
 * Subscribes the HUD to score changes without subscribing to the entire game state.
 *
 * @returns A cleanup function that removes the score listener.
 */
const subscribeScore = (listener: () => void) => {
    gameEvents.on(GameEvent.ScoreChanged, listener);
    return () => gameEvents.off(GameEvent.ScoreChanged, listener);
};
/**
 * Subscribes the HUD to life-count changes.
 *
 * @returns A cleanup function that removes the lives listener.
 */
const subscribeLives = (listener: () => void) => {
    gameEvents.on(GameEvent.LivesChanged, listener);
    return () => gameEvents.off(GameEvent.LivesChanged, listener);
};
/** Subscribes the HUD to discrete multiplier status changes. */
const subscribeBonus = (listener: () => void) => {
    gameEvents.on(GameEvent.BonusChanged, listener);
    return () => gameEvents.off(GameEvent.BonusChanged, listener);
};
/** Reads a primitive score snapshot so unrelated state updates do not rerender the HUD. */
const getScore = () => getGameState().score;
/** Reads a nonnegative whole life count as a stable primitive snapshot. */
const getLives = () => Math.max(0, Math.floor(getGameState().lives));

export function Hud({ onPause }: { onPause: () => void }) {
    // HUD is event-driven through game state events.
    const score = useSyncExternalStore(subscribeScore, getScore);
    const lives = useSyncExternalStore(subscribeLives, getLives);
    const bonus = useSyncExternalStore(subscribeBonus, getScoreBonusStatus);
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
