import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WorldState } from '../game/domain/world/WorldState';
import { createHarness } from './fixtures/inputFixtures';
import { EnemyEntity } from '../game/domain/entities/EnemyEntity';
import type { BrowserInputAdapter } from '../game/infrastructure/adapters/BrowserInputAdapter';
import { InputSystem } from '../game/systems/InputSystem';
import { PACKET_PORTAL_BLINK } from '../config/constants';

const environment = vi.hoisted(() => ({ isDev: true }));
vi.mock('../config/environment', () => ({ get IS_DEV() { return environment.isDev; } }));
afterEach(() => {
  environment.isDev = true;
  vi.unstubAllGlobals();
});

describe('InputSystem', () => {
  it('ignores development shortcuts in production while movement and pause work', () => {
    environment.isDev = false;
    const { input, world, togglePause, system } = createHarness();
    world.levelMultiplier = 1;
    world.packet.portalBlinkRemainingMs = 0;
    const enemy = new EnemyEntity({
      key: 'lag', tile: { x: 2, y: 2 }, direction: 'right', speed: 0.5,
      displayWidth: 11, displayHeight: 11,
    });
    world.enemies = [enemy];
    const copy = vi.fn();
    vi.stubGlobal('navigator', { clipboard: { writeText: copy } });
    world.debugPanelText = 'stale diagnostics';
    const preventDefault = vi.fn();
    for (const event of [
      { code: 'KeyF', key: 'f' },
      { code: 'KeyV', key: 'v' },
      { code: 'KeyC', key: 'c' },
      { code: 'KeyH', key: 'h' },
      { code: 'KeyC', key: 'c', altKey: true },
      { code: 'KeyC', key: 'C', shiftKey: true },
    ]) input.emitKeyDown({ ...event, preventDefault } as unknown as KeyboardEvent);
    expect(world.debugFrozen).toBe(false);
    expect(world.levelMultiplier).toBe(1);
    expect(world.packet.portalBlinkRemainingMs).toBe(0);
    expect(world.collisionDebugEnabled).toBe(false);
    expect(enemy.state.scared).toBe(false);
    expect(copy).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();

    input.setKeyDown('ArrowUp', true);
    system.update();
    expect(world.packet.direction.next).toBe('up');
    input.emitKeyDown({ code: 'Escape', key: 'Escape', preventDefault } as unknown as KeyboardEvent);
    expect(togglePause).toHaveBeenCalledOnce();
    system.destroy();
  });

  it.each([true, false])('enables debug power only when its shortcut is allowed (%s)', (allowPowerShortcut) => {
    const { input, world, system: original } = createHarness();
    original.destroy();
    const togglePause = vi.fn<() => void>();
    const enemy = new EnemyEntity({
      key: 'lag', tile: { x: 2, y: 2 }, direction: 'right', speed: 0.5,
      displayWidth: 11, displayHeight: 11,
    });
    enemy.state.free = true;
    world.enemies = [enemy];
    world.enemyScaredTimers = new Map();
    world.enemyScaredWarnings = new Map();
    world.lagZones = [{ tile: { x: 1, y: 2 }, x: 24, y: 40, radius: 8, ageMs: 0, durationMs: 4000 }];
    const system = new InputSystem(input as unknown as BrowserInputAdapter, world, { togglePause }, allowPowerShortcut);
    system.start();
    input.emitKeyDown({ code: 'KeyH', key: 'h', preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(enemy.state.scared).toBe(allowPowerShortcut);
    expect(world.debugPowerOverrideEnabled).toBe(allowPowerShortcut);
    expect(world.enemyScaredTimers.get(enemy)).toBe(
      allowPowerShortcut ? Number.POSITIVE_INFINITY : undefined,
    );
    expect(world.lagZones).toHaveLength(allowPowerShortcut ? 0 : 1);
    input.emitKeyDown({ code: 'KeyH', key: 'h', preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(enemy.state.scared).toBe(false);
    expect(world.debugPowerOverrideEnabled).toBe(false);
    expect(world.enemyScaredTimers.has(enemy)).toBe(false);
    input.emitKeyDown({ code: 'Escape', key: 'Escape', preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(togglePause).toHaveBeenCalledOnce();
    system.destroy();
  });

  it.each(['paused', 'lost', 'cleared'] as const)('ignores movement, pause and debug keys while %s', (state) => {
    const { input, world, togglePause, system } = createHarness();
    world.levelMultiplier = 1;
    world.packet.portalBlinkRemainingMs = 0;
    if (state === 'paused') world.isMoving = false;
    else world.outcome = state;
    input.setKeyDown('ArrowUp', true);
    system.update();
    const preventDefault = vi.fn();
    for (const code of ['Space', 'Escape', 'KeyH', 'KeyC', 'KeyF', 'KeyV']) {
      input.emitKeyDown({ code, key: code, preventDefault } as unknown as KeyboardEvent);
    }
    expect(world.packet.direction.next).toBe('left');
    expect(world.collisionDebugEnabled).toBe(false);
    expect(world.levelMultiplier).toBe(1);
    expect(world.packet.portalBlinkRemainingMs).toBe(0);
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

  it('toggles diagnostics mode on plain KeyC and clears debug state when disabling', () => {
    const { input, world } = createHarness();

    const enablePreventDefault = vi.fn();
    input.emitKeyDown({
      code: 'KeyC',
      key: 'c',
      altKey: false,
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
      altKey: false,
      shiftKey: false,
      repeat: false,
      preventDefault: disablePreventDefault,
    } as unknown as KeyboardEvent);

    expect(disablePreventDefault).toHaveBeenCalledTimes(1);
    expect(world.collisionDebugEnabled).toBe(false);
    expect(world.hoveredDebugTile).toBeNull();
    expect(world.debugPanelText).toBe('');
  });

  it('does not toggle diagnostics mode on Alt+KeyC', () => {
    const { input, world } = createHarness();
    world.collisionDebugEnabled = false;
    const preventDefault = vi.fn();

    input.emitKeyDown({
      code: 'KeyC',
      key: 'c',
      altKey: true,
      shiftKey: false,
      repeat: false,
      preventDefault,
    } as unknown as KeyboardEvent);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(world.collisionDebugEnabled).toBe(false);
  });

  it('compounds speed without resetting the active run and retains freeze on Shift+F', () => {
    const { input, world, togglePause } = createHarness();
    const preventDefault = vi.fn();
    world.levelMultiplier = 1;
    world.tick = 17;
    const packet = world.packet;
    const enemies = world.enemies;

    input.emitKeyDown({
      code: 'KeyF', key: 'f', repeat: false, preventDefault,
    } as unknown as KeyboardEvent);
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(world.levelMultiplier).toBe(1.25);
    expect(world.debugFrozen).toBe(false);
    expect(world.isMoving).toBe(true);
    expect(world.tick).toBe(17);
    expect(world.packet).toBe(packet);
    expect(world.enemies).toBe(enemies);
    expect(togglePause).not.toHaveBeenCalled();

    input.emitKeyDown({
      code: 'KeyF', key: 'f', repeat: false, preventDefault,
    } as unknown as KeyboardEvent);
    expect(preventDefault).toHaveBeenCalledTimes(2);
    expect(world.levelMultiplier).toBe(1.5625);

    input.emitKeyDown({
      code: 'KeyF', key: 'F', shiftKey: true, repeat: false, preventDefault,
    } as unknown as KeyboardEvent);
    expect(world.debugFrozen).toBe(true);
    expect(world.levelMultiplier).toBe(1.5625);
    input.emitKeyDown({
      code: 'KeyF', key: 'F', shiftKey: true, repeat: false, preventDefault,
    } as unknown as KeyboardEvent);
    expect(world.debugFrozen).toBe(false);
    expect(world.isMoving).toBe(true);
    expect(togglePause).not.toHaveBeenCalled();
  });

  it('toggles persistent portal blinking and protection with V', () => {
    const { input, world, togglePause } = createHarness();
    const preventDefault = vi.fn();
    world.packet.portalBlinkRemainingMs = PACKET_PORTAL_BLINK.durationMs;
    world.packet.portalBlinkElapsedMs = 240;

    input.emitKeyDown({ code: 'KeyV', key: 'v', repeat: false, preventDefault } as unknown as KeyboardEvent);
    expect(world.packet.portalBlinkRemainingMs).toBe(Infinity);
    expect(world.packet.portalBlinkElapsedMs).toBe(0);
    world.packet.portalBlinkElapsedMs = 1300;

    input.emitKeyDown({ code: 'KeyV', key: 'v', repeat: false, preventDefault } as unknown as KeyboardEvent);
    expect(world.packet.portalBlinkRemainingMs).toBe(0);
    expect(world.packet.portalBlinkElapsedMs).toBe(0);
    input.emitKeyDown({ code: 'KeyV', key: 'v', repeat: false, preventDefault } as unknown as KeyboardEvent);
    expect(world.packet.portalBlinkRemainingMs).toBe(Infinity);
    expect(preventDefault).toHaveBeenCalledTimes(3);
    expect(togglePause).not.toHaveBeenCalled();
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
