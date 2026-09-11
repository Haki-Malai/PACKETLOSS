import { describe, expect, it, vi } from 'vitest';
import { GHOST_JAIL_RELEASE_DELAY_MS, GHOST_JAIL_RELEASE_INTERVAL_MS } from '../../config/constants';
import { GhostEntity } from '../../game/domain/entities/GhostEntity';
import { GhostJailService } from '../../game/domain/services/GhostJailService';
import { MovementRules } from '../../game/domain/services/MovementRules';
import { WorldState } from '../../game/domain/world/WorldState';
import { TimerSchedulerAdapter } from '../../game/infrastructure/adapters/TimerSchedulerAdapter';
import { GhostReleaseSystem } from '../../game/systems/GhostReleaseSystem';
import { SeededRandom } from '../../game/shared/random/SeededRandom';
import { MechanicsDomainHarness } from '../helpers/mechanicsDomainHarness';
import { openTile } from '../fixtures/collisionFixtures';

describe('ghost release system coverage', () => {
  it('moves through side staging then crosses the jail gate before becoming free', () => {
    const harness = new MechanicsDomainHarness({ seed: 1919, fixture: 'default-map', ghostCount: 1, autoStartSystems: false });

    try {
      const ghost = harness.world.ghosts[0];
      if (!ghost) {
        throw new Error('expected one ghost for phased release coverage');
      }

      harness.ghostReleaseSystem.start();
      harness.scheduler.update(GHOST_JAIL_RELEASE_DELAY_MS);
      expect(harness.world.ghostsExitingJail.has(ghost)).toBe(true);

      const sideTargetX = harness.world.ghostJailBounds.minX;
      let reachedSideTarget = false;
      for (let tick = 0; tick < 800 && !ghost.state.free; tick += 1) {
        harness.ghostReleaseSystem.update();
        if (ghost.tile.x === sideTargetX && ghost.moved.x === 0) {
          reachedSideTarget = true;
        }
      }

      expect(reachedSideTarget).toBe(true);
      expect(ghost.state.free).toBe(true);
      expect(ghost.tile.y).toBe(harness.world.ghostJailBounds.y - 1);
      expect(harness.world.ghostsExitingJail.has(ghost)).toBe(false);
    } finally {
      harness.destroy();
    }
  });

  it('alternates release-side direction deterministically (left first, then right)', () => {
    const harness = new MechanicsDomainHarness({ seed: 2020, fixture: 'default-map', ghostCount: 2, autoStartSystems: false });

    try {
      const [firstGhost, secondGhost] = harness.world.ghosts;
      if (!firstGhost || !secondGhost) {
        throw new Error('expected two ghosts for side alternation test');
      }

      const centerX =
        harness.world.ghostJailBounds.minX +
        Math.floor((harness.world.ghostJailBounds.maxX - harness.world.ghostJailBounds.minX) / 2);
      harness.movementRules.setEntityTile(firstGhost, { x: centerX, y: harness.world.ghostJailBounds.y });
      harness.movementRules.setEntityTile(secondGhost, { x: centerX, y: harness.world.ghostJailBounds.y });

      harness.ghostReleaseSystem.start();
      harness.scheduler.update(GHOST_JAIL_RELEASE_DELAY_MS);
      harness.ghostReleaseSystem.update();
      expect(firstGhost.direction).toBe('left');

      for (let tick = 0; tick < 800 && !firstGhost.state.free; tick += 1) {
        harness.ghostReleaseSystem.update();
      }
      expect(firstGhost.state.free).toBe(true);

      harness.scheduler.update(GHOST_JAIL_RELEASE_INTERVAL_MS);
      harness.ghostReleaseSystem.update();
      expect(secondGhost.direction).toBe('right');
    } finally {
      harness.destroy();
    }
  });

  it('cleans up exiting state when a ghost deactivates mid-release phase', () => {
    const harness = new MechanicsDomainHarness({ seed: 2121, fixture: 'default-map', ghostCount: 1, autoStartSystems: false });

    try {
      const ghost = harness.world.ghosts[0];
      if (!ghost) {
        throw new Error('expected one ghost for deactivation cleanup test');
      }

      harness.ghostReleaseSystem.start();
      harness.scheduler.update(GHOST_JAIL_RELEASE_DELAY_MS);
      harness.ghostReleaseSystem.update();
      expect(harness.world.ghostsExitingJail.has(ghost)).toBe(true);
      ghost.active = false;

      harness.ghostReleaseSystem.update();

      expect(harness.world.ghostsExitingJail.has(ghost)).toBe(false);
      expect(ghost.state.free).toBe(false);
    } finally {
      harness.destroy();
    }
  });

  it('covers release path target helpers for residual offsets and direction resolution', () => {
    const ghost = new GhostEntity({
      key: 'pinky',
      tile: { x: 1, y: 1 },
      direction: 'left',
      speed: 1,
      displayWidth: 10,
      displayHeight: 10,
    });

    const world = {
      ghosts: [ghost],
      ghostsExitingJail: new Set<GhostEntity>(),
      ghostJailBounds: { minX: 0, maxX: 2, y: 1 },
      pacman: { tile: { x: 0, y: 0 } },
      map: { width: 3, height: 3 },
      collisionGrid: {
        getTilesAt: vi.fn(() => ({
          current: openTile(),
          up: openTile(),
          down: openTile(),
          left: openTile(),
          right: openTile(),
        })),
      },
      tileSize: 16,
    } as unknown as WorldState;

    const syncEntityPositionMock = vi.fn();
    const movementRules = {
      canMove: vi.fn(() => true),
      advanceEntity: vi.fn(),
      syncEntityPosition: syncEntityPositionMock,
      setEntityTile: vi.fn(),
    } as unknown as MovementRules;
    const jailService = { moveGhostInJail: vi.fn() } as unknown as GhostJailService;
    const system = new GhostReleaseSystem(world, movementRules, jailService, new TimerSchedulerAdapter(), new SeededRandom(13));
    const internals = system as unknown as {
      moveGhostTowardTarget: (targetGhost: GhostEntity, targetTile: { x: number; y: number }) => 'moved' | 'reached';
      resolveGateScanColumns: (side: 'left' | 'right') => number[];
    };

    ghost.moved = { x: 0.5, y: -0.5 };
    expect(internals.moveGhostTowardTarget(ghost, { x: 1, y: 1 })).toBe('reached');
    expect(ghost.moved).toEqual({ x: 0, y: 0 });
    expect(syncEntityPositionMock).toHaveBeenCalled();

    const cases: Array<{ tile: { x: number; y: number }; moved: { x: number; y: number }; target: { x: number; y: number }; direction: string }> = [
      { tile: { x: 1, y: 0 }, moved: { x: 0, y: 0 }, target: { x: 1, y: 1 }, direction: 'down' },
      { tile: { x: 1, y: 2 }, moved: { x: 0, y: 0 }, target: { x: 1, y: 1 }, direction: 'up' },
      { tile: { x: 1, y: 1 }, moved: { x: 0, y: 2 }, target: { x: 1, y: 1 }, direction: 'up' },
      { tile: { x: 1, y: 1 }, moved: { x: 0, y: -2 }, target: { x: 1, y: 1 }, direction: 'down' },
      { tile: { x: 0, y: 1 }, moved: { x: 0, y: 0 }, target: { x: 1, y: 1 }, direction: 'right' },
      { tile: { x: 2, y: 1 }, moved: { x: 0, y: 0 }, target: { x: 1, y: 1 }, direction: 'left' },
      { tile: { x: 1, y: 1 }, moved: { x: 2, y: 0 }, target: { x: 1, y: 1 }, direction: 'left' },
      { tile: { x: 1, y: 1 }, moved: { x: -2, y: 0 }, target: { x: 1, y: 1 }, direction: 'right' },
    ];

    cases.forEach((entry) => {
      ghost.tile = { ...entry.tile };
      ghost.moved = { ...entry.moved };
      internals.moveGhostTowardTarget(ghost, entry.target);
      expect(ghost.direction).toBe(entry.direction);
    });

    expect(internals.resolveGateScanColumns('left')).toEqual([0, 1, 2]);
    expect(internals.resolveGateScanColumns('right')).toEqual([2, 1, 0]);
  });
});
