// @vitest-environment jsdom
import { StrictMode, Profiler } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Hud, DebugOverlay } from '../game/ui/GameOverlays';
import { createDebugStore } from '../game/ui/debugStore';
import { EMPTY_DEBUG } from '../game/shared/events/DebugSnapshot';
import { addScore, gameEvents, resetGameState, setLives, setScoreBonusStatus } from '../state/gameState';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('React game overlays', () => {
    it('displays live score/lives, pauses through its control, and releases subscriptions', () => {
        resetGameState(50, 3);
        const subscribe = vi.spyOn(gameEvents, 'on');
        const unsubscribe = vi.spyOn(gameEvents, 'off');
        const onPause = vi.fn();
        const page = render(
            <StrictMode>
                <Hud onPause={onPause} />
            </StrictMode>
        );
        expect(page.container.querySelector('[data-hud-score-value]')?.textContent).toBe('50');
        expect(page.container.querySelector('[data-hud-lives-value]')?.textContent).toBe('3');
        fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
        expect(onPause).toHaveBeenCalledOnce();
        act(() => {
            addScore(120);
            setLives(2);
        });
        expect(page.container.querySelector('[data-hud-score-value]')?.textContent).toBe('170');
        expect(page.container.querySelector('[data-hud-lives-value]')?.textContent).toBe('2');
        act(() => setScoreBonusStatus({ kind: 'bug', multiplier: 1.5, seconds: 45, phase: 'available' }));
        expect(page.container.querySelector('[data-hud-bonus="available"]')?.textContent).toContain('×1.5 · 45s');
        act(() => setScoreBonusStatus({ kind: 'bug', multiplier: 1.5, seconds: 15, phase: 'active' }));
        expect(page.container.querySelector('[data-hud-bonus="active"]')?.textContent).toContain('×1.5 · 15s');
        act(() => setScoreBonusStatus(null));
        expect(page.container.querySelector('[data-hud-bonus]')).toBeNull();
        act(() => setLives(-0.5));
        expect(page.container.querySelector('[data-hud-lives-value]')?.textContent).toBe('0');
        page.unmount();
        expect(unsubscribe.mock.calls).toEqual(subscribe.mock.calls);
    });

    it('updates only diagnostics, retains unchanged snapshots, and clears them between runs', () => {
        const store = createDebugStore();
        const commits = vi.fn();
        const page = render(
            <Profiler id="shell" onRender={commits}>
                <DebugOverlay store={store} />
            </Profiler>
        );
        const initial = commits.mock.calls.length;
        act(() =>
            store.publish({
                enabled: true,
                collisionText: 'tile: (2, 3)',
                runtimeText: 'fps: 60.0',
            })
        );
        expect(screen.getByText('tile: (2, 3)').hidden).toBe(false);
        expect(screen.getByText('fps: 60.0').hidden).toBe(false);
        const previous = store.getSnapshot();
        act(() => store.publish({ ...previous }));
        expect(store.getSnapshot()).toBe(previous);
        expect(commits).toHaveBeenCalledTimes(initial + 1);
        act(() => store.publish(EMPTY_DEBUG));
        expect(page.container.querySelector('pre')?.hidden).toBe(true);
        expect(page.container.textContent).toBe('');
    });
});
