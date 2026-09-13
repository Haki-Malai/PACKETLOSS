import { describe, expect, it, vi } from 'vitest';
import type { WorldState } from '../game/domain/world/WorldState';
import { createHarness } from './fixtures/inputFixtures';

describe('InputSystem', () => {
  it.each(['paused', 'lost', 'cleared'] as const)('ignores movement, pause and debug keys while %s', (state) => {
    const { input, world, togglePause, system } = createHarness();
    if (state === 'paused') world.isMoving = false;
    else world.outcome = state;
    input.setKeyDown('ArrowUp', true);
    system.update();
    const preventDefault = vi.fn();
    for (const code of ['Space', 'Escape', 'KeyH', 'KeyC']) {
      input.emitKeyDown({ code, key: code, altKey: true, preventDefault } as unknown as KeyboardEvent);
    }
    expect(world.packet.direction.next).toBe('left');
    expect(world.collisionDebugEnabled).toBe(false);
    expect(togglePause).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
    system.destroy();
  });

  it('ignores keys consumed by the shell or originating on interactive controls', () => {
    const { input, togglePause, system } = createHarness();
    const preventDefault = vi.fn();
    input.emitKeyDown({ code: 'Space', defaultPrevented: true, preventDefault } as unknown as KeyboardEvent);
    input.emitKeyDown({
      code: 'Space', target: { closest: () => ({}) }, preventDefault,
    } as unknown as KeyboardEvent);
    expect(togglePause).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
    system.destroy();
  });

  it('toggles pause on keyboard Space code and legacy Spacebar key', () => {
    const { input, togglePause } = createHarness();

    const spacePreventDefault = vi.fn();
    input.emitKeyDown({
      code: 'Space',
      key: ' ',
      repeat: false,
      preventDefault: spacePreventDefault,
    } as unknown as KeyboardEvent);

    const legacySpacePreventDefault = vi.fn();
    input.emitKeyDown({
      code: 'Unidentified',
      key: 'Spacebar',
      repeat: false,
      preventDefault: legacySpacePreventDefault,
    } as unknown as KeyboardEvent);

    expect(togglePause).toHaveBeenCalledTimes(2);
    expect(spacePreventDefault).toHaveBeenCalledTimes(1);
    expect(legacySpacePreventDefault).toHaveBeenCalledTimes(1);
  });

  it('prevents default browser behavior for directional arrow keys', () => {
    const { input, togglePause } = createHarness();

    const preventDefault = vi.fn();
    input.emitKeyDown({
      code: 'ArrowUp',
      key: 'ArrowUp',
      repeat: false,
      preventDefault,
    } as unknown as KeyboardEvent);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(togglePause).toHaveBeenCalledTimes(0);
  });

  it('toggles diagnostics mode on Option+KeyC and clears debug state when disabling', () => {
    const { input, world } = createHarness();

    const enablePreventDefault = vi.fn();
    input.emitKeyDown({
      code: 'KeyC',
      key: 'c',
      altKey: true,
      shiftKey: false,
      repeat: false,
      preventDefault: enablePreventDefault,
    } as unknown as KeyboardEvent);

    expect(enablePreventDefault).toHaveBeenCalledTimes(1);
    expect(world.collisionDebugEnabled).toBe(true);

    world.hoveredDebugTile = { x: 2, y: 3 } as WorldState['hoveredDebugTile'];
    world.debugPanelText = 'debug text';

    const disablePreventDefault = vi.fn();
    input.emitKeyDown({
      code: 'KeyC',
      key: 'c',
      altKey: true,
      shiftKey: false,
      repeat: false,
      preventDefault: disablePreventDefault,
    } as unknown as KeyboardEvent);

    expect(disablePreventDefault).toHaveBeenCalledTimes(1);
    expect(world.collisionDebugEnabled).toBe(false);
    expect(world.hoveredDebugTile).toBeNull();
    expect(world.debugPanelText).toBe('');
  });

  it('does not toggle diagnostics mode on plain KeyC', () => {
    const { input, world } = createHarness();
    world.collisionDebugEnabled = false;
    const preventDefault = vi.fn();

    input.emitKeyDown({
      code: 'KeyC',
      key: 'c',
      altKey: false,
      shiftKey: false,
      repeat: false,
      preventDefault,
    } as unknown as KeyboardEvent);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(world.collisionDebugEnabled).toBe(false);
  });

  it('keeps Shift+KeyC debug copy path active without toggling diagnostics mode', async () => {
    const { input, world } = createHarness();
    world.debugPanelText = 'Collision Debug\nsample';
    const clipboardWrite = vi.fn().mockResolvedValue(undefined);
    const originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { clipboard: { writeText: clipboardWrite } },
    });

    try {
      const preventDefault = vi.fn();
      input.emitKeyDown({
        code: 'KeyC',
        key: 'c',
        altKey: false,
        shiftKey: true,
        repeat: false,
        preventDefault,
      } as unknown as KeyboardEvent);

      await Promise.resolve();

      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(clipboardWrite).toHaveBeenCalledWith('Collision Debug\nsample');
      expect(world.collisionDebugEnabled).toBe(false);
    } finally {
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: originalNavigator,
      });
    }
  });
});
