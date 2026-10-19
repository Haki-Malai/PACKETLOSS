// @vitest-environment jsdom
import { StrictMode, Profiler } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Hud, DebugOverlay } from '../game/ui/GameOverlays';
import { createDebugStore } from '../game/ui/debugStore';
import { EMPTY_DEBUG } from '../game/shared/events/DebugSnapshot';
import { addScore, gameEvents, resetGameState, setLives, setScoreBonusStatus, GameStateStore } from '../state/gameState';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('React game overlays', () => {
    it('shows one held weapon and disables the shared touch control while casting or empty', () => {
        const store = new GameStateStore();
        const onActivate = vi.fn();
        const page = render(<Hud onPause={vi.fn()} gameState={store} onActivatePowerup={onActivate} />);
        expect(screen.getByRole('button', { name: 'Weapon inventory empty' }).hasAttribute('disabled')).toBe(true);
        act(() => store.setPowerupStatus({ kind: 'missile', casting: false }));
        const use = screen.getByRole('button', { name: 'Use Trace' });
        fireEvent.click(use);
        expect(onActivate).toHaveBeenCalledOnce();
        act(() => store.setPowerupStatus({ kind: 'laser', casting: true }));
        expect(screen.queryByRole('button', { name: 'Use Trace' })).toBeNull();
        const laser = screen.getByRole('button', { name: 'Use Laser' });
        expect(laser.hasAttribute('disabled')).toBe(true);
        fireEvent.click(laser);
        expect(onActivate).toHaveBeenCalledOnce();
        page.unmount();
    });
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
        act(() => setScoreBonusStatus({ phase: 'available', count: 5 }));
        expect(page.container.querySelector('[data-hud-bonus="available"]')?.textContent).toContain('5 available');
        act(() => setScoreBonusStatus({ kind: 'key', multiplier: 3, seconds: 15, phase: 'active' }));
        expect(page.container.querySelector('[data-hud-bonus="active"]')?.textContent).toContain('×3 · 15s');
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
