import { describe, expect, it } from 'vitest';
import { createHarness, pointer } from './fixtures/inputFixtures';

describe('InputSystem', () => {
  it('commits swipe direction only after threshold and axis lock', () => {
    const { input, world, togglePause } = createHarness();

    input.emitPointerDown(pointer({ x: 10, y: 10 }));

    input.emitPointerMove(pointer({ x: 24, y: 14 }));
    expect(world.pacman.direction.next).toBe('left');

    input.emitPointerMove(pointer({ x: 29, y: 26 }));
    expect(world.pacman.direction.next).toBe('left');

    input.emitPointerMove(pointer({ x: 40, y: 15 }));
    expect(world.pacman.direction.next).toBe('right');

    input.emitPointerUp(pointer({ x: 40, y: 15 }));
    expect(togglePause).toHaveBeenCalledTimes(0);
  });

  it('maps vertical swipes to up/down direction', () => {
    const { input, world } = createHarness();

    input.emitPointerDown(pointer({ x: 20, y: 40 }));
    input.emitPointerMove(pointer({ x: 24, y: 70 }));
    expect(world.pacman.direction.next).toBe('down');

    input.emitPointerUp(pointer({ x: 24, y: 70 }));
    input.emitPointerDown(pointer({ pointerId: 2, x: 24, y: 70 }));
    input.emitPointerMove(pointer({ pointerId: 2, x: 20, y: 42 }));
    expect(world.pacman.direction.next).toBe('up');
  });

  it('toggles pause on touch tap to pause', () => {
    const { input, togglePause } = createHarness();

    input.emitPointerDown(pointer({ x: 12, y: 12 }));
    input.emitPointerUp(pointer({ x: 14, y: 13 }));

    expect(togglePause).toHaveBeenCalledTimes(1);
  });

  it('toggles pause on touch tap to resume', () => {
    const { input, world, togglePause } = createHarness();
    world.isMoving = false;

    input.emitPointerDown(pointer({ x: 30, y: 30 }));
    input.emitPointerUp(pointer({ x: 33, y: 31 }));

    expect(togglePause).toHaveBeenCalledTimes(1);
  });

  it('resumes paused touch input immediately on pointer down', () => {
    const { input, world, togglePause } = createHarness();
    world.isMoving = false;

    input.emitPointerDown(pointer({ x: 30, y: 30 }));
    expect(togglePause).toHaveBeenCalledTimes(1);

    input.emitPointerUp(pointer({ x: 31, y: 31 }));
    expect(togglePause).toHaveBeenCalledTimes(1);
  });

  it('never toggles pause for swipe gestures', () => {
    const { input, world, togglePause } = createHarness();

    input.emitPointerDown(pointer({ x: 20, y: 20 }));
    input.emitPointerMove(pointer({ x: 48, y: 22 }));
    input.emitPointerUp(pointer({ x: 48, y: 22 }));

    expect(world.pacman.direction.next).toBe('right');
    expect(togglePause).toHaveBeenCalledTimes(0);
  });

  it('cleans up touch gesture state on pointer cancel', () => {
    const { input, togglePause } = createHarness();

    input.emitPointerDown(pointer({ pointerId: 11, x: 20, y: 20 }));
    input.emitPointerCancel(pointer({ pointerId: 11, x: 22, y: 21 }));
    input.emitPointerUp(pointer({ pointerId: 11, x: 22, y: 21 }));

    expect(togglePause).toHaveBeenCalledTimes(0);

    input.emitPointerDown(pointer({ pointerId: 12, x: 30, y: 30 }));
    input.emitPointerUp(pointer({ pointerId: 12, x: 31, y: 31 }));

    expect(togglePause).toHaveBeenCalledTimes(1);
  });

  it('gives keyboard directional input priority over swipe until keys are released', () => {
    const { input, world } = createHarness();

    input.setKeyDown('ArrowUp', true);
    input.emitPointerDown(pointer({ x: 10, y: 10 }));
    input.emitPointerMove(pointer({ x: 10, y: 60 }));
    expect(world.pacman.direction.next).toBe('left');

    input.setKeyDown('ArrowUp', false);
    input.emitPointerMove(pointer({ x: 10, y: 60 }));
    expect(world.pacman.direction.next).toBe('down');
  });

  it('keeps desktop pointerdown pause toggle behavior unchanged', () => {
    const { input, togglePause } = createHarness();

    input.emitPointerDown(pointer({ pointerType: 'mouse', isPrimary: true }));
    expect(togglePause).toHaveBeenCalledTimes(1);

    input.emitPointerUp(pointer({ pointerType: 'mouse', isPrimary: true }));
    expect(togglePause).toHaveBeenCalledTimes(1);
  });
});
