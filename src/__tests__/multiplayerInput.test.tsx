// @vitest-environment jsdom
import { MultiplayerSynchronization } from '../game/simulation/MultiplayerSynchronization';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataRace } from '../game/simulation/DataRace';
import { MultiplayerViewport } from '../game/ui/MultiplayerViewport';
import type { GameSession } from '../game/ui/useGameSession';
import type { Direction } from '../game/domain/valueObjects/Direction';
import type { BoostAction } from '../game/simulation/types';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

vi.mock('../game/ui/MultiplayerPresentation', () => ({
  MultiplayerPresentationSession: class {
    ready = Promise.resolve();
    reset() {}
    recordInput() {}
    dispose() {}
  },
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

/** Mounts only the input boundary, leaving Three.js presentation stubbed. */
function mount(developmentMultiplayer = false) {
  const map = dataRaceFixture();
  const race = new DataRace(map, 'input', [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 4).snapshot();
  race.players[0].score = 100;
  const connection = { map, race, playerId: race.players[0].id,
    phase: 'connected', stalled: false, latencyMs: null, warning: null };
  const sendDirection = vi.fn<(_direction: Direction) => number>(() => 1);
  const sendBoost = vi.fn<(_boost: BoostAction) => number | null>(() => 1);
  const closeNextWall = vi.fn();
  const session = { developmentMultiplayer,
    multiplayer: { synchronization: new MultiplayerSynchronization(), connection, sendDirection, sendBoost, closeNextWall, getConnectionSnapshot: () => connection },
    leaveMultiplayer: vi.fn() } as unknown as GameSession;
  const mounted = render(<MultiplayerViewport session={session} />);
  return { ...mounted, canvas: mounted.container.querySelector('canvas')!, sendDirection, sendBoost,
    closeNextWall, connection, session };
}

/** Dispatches complete touch-pointer state in jsdom, which does not implement PointerEvent. */
function pointer(target: Element | Window, type: string, x: number, y: number, pointerId = 1): void {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, { clientX: x, clientY: y, pointerId, pointerType: 'touch', isPrimary: true, buttons: 1 });
  fireEvent(target, event);
}

describe('multiplayer shared input', () => {
  it('sends one Space tap and ignores repeat, modified, prevented, and focused-control presses', () => {
    const { sendBoost } = mount();
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    fireEvent.keyDown(window, { code: 'Space', repeat: true });
    fireEvent.keyUp(window, { code: 'Space' });
    fireEvent.keyDown(window, { code: 'Space', ctrlKey: true });
    fireEvent.keyUp(window, { code: 'Space' });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Leave' }), { code: 'Space' });
    const field = document.createElement('input');
    document.body.append(field);
    fireEvent.keyDown(field, { code: 'Space' });
    field.remove();
    const prevented = new KeyboardEvent('keydown', { code: 'Space', cancelable: true });
    prevented.preventDefault();
    fireEvent(window, prevented);
    expect(sendBoost.mock.calls.map(([action]) => action)).toEqual(['press', 'release']);
  });

  it('captures a touch hold alongside swipe steering and releases only when every source ends', () => {
    const { canvas, sendDirection, sendBoost } = mount();
    const button = screen.getByRole('button', { name: 'Boost' });
    const capture = vi.fn();
    Object.assign(button, { setPointerCapture: capture, hasPointerCapture: () => true,
      releasePointerCapture: vi.fn() });
    pointer(button, 'pointerdown', 100, 100);
    expect(capture).toHaveBeenCalledWith(1);
    pointer(canvas, 'pointerdown', 0, 0, 2);
    pointer(canvas, 'pointermove', 30, 0, 2);
    fireEvent.keyDown(window, { code: 'Space' });
    pointer(button, 'pointerup', 120, 100);
    fireEvent.click(button, { detail: 1 });
    expect(sendBoost.mock.calls.map(([action]) => action)).toEqual(['press']);
    expect(sendDirection).toHaveBeenCalledExactlyOnceWith('right');
    fireEvent.keyUp(window, { code: 'Space' });
    expect(sendBoost.mock.calls.map(([action]) => action)).toEqual(['press', 'release']);
  });

  it('supports focused-button holds and assistive clicks without buying a duplicate burst', () => {
    const { sendBoost } = mount();
    const button = screen.getByRole('button', { name: 'Boost' });
    button.focus();
    fireEvent.keyDown(button, { code: 'Space' });
    fireEvent.keyDown(button, { code: 'Space', repeat: true });
    fireEvent.keyUp(button, { code: 'Space' });
    fireEvent.click(button, { detail: 0 });
    expect(sendBoost.mock.calls.map(([action]) => action)).toEqual(['press', 'release', 'press', 'release']);
  });

  it('cancels taps on blur and holds on lost capture, visibility loss, and unmount', () => {
    const { sendBoost, unmount } = mount();
    const button = screen.getByRole('button', { name: 'Boost' });
    fireEvent.keyDown(window, { code: 'Space' });
    fireEvent.keyUp(window, { code: 'Space' });
    fireEvent.blur(window);
    expect(sendBoost).toHaveBeenLastCalledWith('cancel');
    pointer(button, 'pointerdown', 0, 0);
    pointer(button, 'lostpointercapture', 0, 0);
    expect(sendBoost).toHaveBeenLastCalledWith('cancel');
    pointer(button, 'pointerdown', 0, 0);
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    expect(sendBoost).toHaveBeenLastCalledWith('cancel');
    const sent = sendBoost.mock.calls.length;
    fireEvent.keyDown(window, { code: 'Space', repeat: true });
    expect(sendBoost).toHaveBeenCalledTimes(sent);
    hidden.mockReturnValue(false);
    fireEvent.keyDown(window, { code: 'Space' });
    unmount();
    expect(sendBoost).toHaveBeenLastCalledWith('cancel');
    fireEvent.keyDown(window, { code: 'Space' });
    expect(sendBoost).toHaveBeenCalledTimes(sent + 2);
  });

  it('falls back to cancellation if an ordinary release cannot be sent', () => {
    const { sendBoost } = mount();
    sendBoost.mockReturnValueOnce(1).mockReturnValueOnce(null).mockReturnValueOnce(3);
    fireEvent.keyDown(window, { code: 'Space' });
    fireEvent.keyUp(window, { code: 'Space' });
    expect(sendBoost.mock.calls.map(([action]) => action)).toEqual(['press', 'release', 'cancel']);
  });

  it('disables unfunded and stalled controls and clears held input across a new match', () => {
    const { sendBoost, connection, session, rerender } = mount();
    const button = screen.getByRole('button', { name: 'Boost' });
    connection.race.players[0].score = 0;
    rerender(<MultiplayerViewport session={session} />);
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.keyDown(window, { code: 'Space' });
    expect(sendBoost).not.toHaveBeenCalled();
    fireEvent.keyUp(window, { code: 'Space' });
    connection.race.players[0].score = 10;
    rerender(<MultiplayerViewport session={session} />);
    fireEvent.keyDown(window, { code: 'Space' });
    connection.stalled = true;
    rerender(<MultiplayerViewport session={session} />);
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(sendBoost).toHaveBeenLastCalledWith('cancel');
    connection.stalled = false;
    connection.race.matchId = 'next-match';
    rerender(<MultiplayerViewport session={session} />);
    fireEvent.keyDown(window, { code: 'Space', repeat: true });
    expect(sendBoost.mock.calls.map(([action]) => action)).toEqual(['press', 'cancel']);
    fireEvent.keyUp(window, { code: 'Space' });
    fireEvent.keyDown(window, { code: 'Space' });
    expect(sendBoost).toHaveBeenLastCalledWith('press');
  });

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
