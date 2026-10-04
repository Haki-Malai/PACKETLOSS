// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataRace } from '../game/simulation/DataRace';
import { MultiplayerViewport } from '../game/ui/MultiplayerViewport';
import type { GameSession } from '../game/ui/useGameSession';
import type { Direction } from '../game/domain/valueObjects/Direction';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

vi.mock('../game/ui/MultiplayerPresentation', () => ({
  MultiplayerPresentationSession: class {
    ready = Promise.resolve();
    reset() {}
    recordInput() {}
    dispose() {}
  },
}));

afterEach(cleanup);

/** Mounts only the input boundary, leaving Three.js presentation stubbed. */
function mount(developmentMultiplayer = false) {
  const map = dataRaceFixture();
  const race = new DataRace(map, 'input', [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 4).snapshot();
  const connection = { map, race, playerId: race.players[0].id,
    phase: 'connected', latencyMs: null, warning: null };
  const sendDirection = vi.fn<(_direction: Direction) => number>(() => 1);
  const closeNextWall = vi.fn();
  const session = { developmentMultiplayer,
    multiplayer: { connection, sendDirection, closeNextWall, getConnectionSnapshot: () => connection },
    leaveMultiplayer: vi.fn() } as unknown as GameSession;
  const mounted = render(<MultiplayerViewport session={session} />);
  return { ...mounted, canvas: mounted.container.querySelector('canvas')!, sendDirection, closeNextWall };
}

/** Dispatches complete touch-pointer state in jsdom, which does not implement PointerEvent. */
function pointer(target: Element | Window, type: string, x: number, y: number): void {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, { clientX: x, clientY: y, pointerId: 1, pointerType: 'touch', isPrimary: true, buttons: 1 });
  fireEvent(target, event);
}

describe('multiplayer shared input', () => {
  it('closes one wall per C press only in instant development and ignores repeats or focused controls', () => {
    const regular = mount();
    fireEvent.keyDown(window, { code: 'KeyC' });
    expect(regular.closeNextWall).not.toHaveBeenCalled();
    regular.unmount();
    const development = mount(true);
    fireEvent.keyDown(window, { code: 'KeyC' });
    fireEvent.keyDown(window, { code: 'KeyC', repeat: true });
    fireEvent.keyUp(window, { code: 'KeyC' });
    fireEvent.keyDown(window, { code: 'KeyC', ctrlKey: true });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Leave' }), { code: 'KeyC' });
    expect(development.closeNextWall).toHaveBeenCalledTimes(1);
    fireEvent.keyUp(window, { code: 'KeyC' });
    fireEvent.keyDown(window, { code: 'KeyC' });
    expect(development.closeNextWall).toHaveBeenCalledTimes(2);
    development.unmount();
    fireEvent.keyDown(window, { code: 'KeyC' });
    expect(development.closeNextWall).toHaveBeenCalledTimes(2);
  });
  it('commits one axis-locked swipe before release and drops cancelled or blurred gestures', () => {
    const { canvas, sendDirection, unmount } = mount();
    pointer(canvas, 'pointerdown', 0, 0);
    pointer(canvas, 'pointermove', 19, 16);
    expect(sendDirection).not.toHaveBeenCalled();
    pointer(canvas, 'pointermove', 30, 5);
    expect(sendDirection).toHaveBeenCalledExactlyOnceWith('right');
    pointer(canvas, 'pointermove', 0, -40);
    pointer(window, 'pointerup', 0, -40);
    expect(sendDirection).toHaveBeenCalledTimes(1);
    pointer(canvas, 'pointerdown', 0, 0);
    pointer(window, 'pointercancel', 0, 0);
    pointer(canvas, 'pointermove', 0, -30);
    pointer(canvas, 'pointerdown', 0, 0);
    fireEvent.blur(window);
    pointer(canvas, 'pointermove', 0, -30);
    expect(sendDirection).toHaveBeenCalledTimes(1);
    unmount();
    fireEvent.keyDown(window, { code: 'ArrowUp' });
    expect(sendDirection).toHaveBeenCalledTimes(1);
  });

  it('uses solo held-key priority, restores held intent on release, and ignores focused controls', () => {
    const { canvas, sendDirection } = mount();
    fireEvent.keyDown(window, { code: 'ArrowUp' });
    fireEvent.keyDown(window, { code: 'ArrowLeft' });
    fireEvent.keyDown(window, { code: 'ArrowDown' });
    pointer(canvas, 'pointerdown', 0, 0);
    pointer(canvas, 'pointermove', 30, 0);
    expect(sendDirection.mock.calls.map(([direction]) => direction)).toEqual(['up', 'left']);
    fireEvent.keyUp(window, { code: 'ArrowLeft' });
    fireEvent.keyUp(window, { code: 'ArrowUp' });
    fireEvent.keyUp(window, { code: 'ArrowDown' });
    expect(sendDirection.mock.calls.map(([direction]) => direction)).toEqual(['up', 'left', 'up', 'down']);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Leave' }), { code: 'ArrowRight' });
    const prevented = new KeyboardEvent('keydown', { code: 'KeyD', cancelable: true });
    prevented.preventDefault();
    fireEvent(window, prevented);
    expect(sendDirection).toHaveBeenCalledTimes(4);
  });
});
