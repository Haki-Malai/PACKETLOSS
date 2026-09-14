import { afterEach, describe, expect, it, vi } from 'vitest';
import { WorldState } from '../game/domain/world/WorldState';
import { DebugOverlaySystem } from '../game/systems/DebugOverlaySystem';
import { EMPTY_DEBUG } from '../game/shared/events/DebugSnapshot';

function createWorld(): WorldState {
  const emptyCollision = {
    collides: false,
    up: false,
    right: false,
    down: false,
    left: false,
    penGate: false,
    portal: null,
  };

  return {
    collisionDebugEnabled: false,
    hoveredDebugTile: null,
    pointerScreen: null,
    debugPanelText: '',
    tileSize: 16,
    map: {
      width: 1,
      height: 1,
      tiles: [
        [
          {
            x: 0,
            y: 0,
            rawGid: 1,
            gid: 1,
            localId: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
            collision: emptyCollision,
          },
        ],
      ],
    },
    collisionGrid: {
      getTileAt: () => emptyCollision,
    },
    packet: {
      tile: { x: 0, y: 0 },
    },
    enemies: [],
  } as unknown as WorldState;
}

describe('DebugOverlaySystem', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('publishes cleared diagnostics when diagnostics mode is disabled', () => {
    const world = createWorld();
    world.debugPanelText = 'stale';
    const camera = {
      screenToWorld: () => ({ x: 0, y: 0 }),
    };
    const publish = vi.fn();
    const system = new DebugOverlaySystem(world, camera, publish);

    system.start();
    system.render();

    expect(publish).toHaveBeenLastCalledWith(EMPTY_DEBUG);
    expect(world.debugPanelText).toBe('');
  });

  it('shows FPS and frame time while diagnostics mode is enabled', () => {
    const world = createWorld();
    world.collisionDebugEnabled = true;
    const camera = {
      screenToWorld: () => ({ x: 0, y: 0 }),
    };
    const publish = vi.fn();
    const system = new DebugOverlaySystem(world, camera, publish);
    const nowSpy = vi
      .spyOn(performance, 'now')
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(116);

    system.start();
    system.render();
    system.render();

    nowSpy.mockRestore();

    expect(publish).toHaveBeenLastCalledWith({ enabled: true, collisionText: 'Collision Debug\nmove mouse over a block to inspect', runtimeText: 'Runtime Diagnostics\nfps: 62.5\nframe: 16.00 ms' });
  });

  it('clears diagnostics on destroy', () => {
    const world = createWorld();
    const camera = {
      screenToWorld: () => ({ x: 0, y: 0 }),
    };
    const publish = vi.fn();
    const system = new DebugOverlaySystem(world, camera, publish);

    system.start();
    world.collisionDebugEnabled = true;
    system.render();
    system.destroy();
    expect(publish).toHaveBeenLastCalledWith(EMPTY_DEBUG);
    expect(world.debugPanelText).toBe('');
  });
});
