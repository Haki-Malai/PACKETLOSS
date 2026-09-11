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
  it('covers update filtering for free and exiting ghosts', () => {
    const harness = new MechanicsDomainHarness({ seed: 707, fixture: 'default-map', ghostCount: 2, autoStartSystems: false });

    try {
      const moveGhostInJail = vi.spyOn(harness.jailService, 'moveGhostInJail');
      const [first, second] = harness.world.ghosts;
      if (!first || !second) {
        throw new Error('expected two ghosts for filter coverage test');
      }

      second.state.free = true;
      harness.world.ghostsExitingJail.add(first);
      harness.ghostReleaseSystem.update();
      expect(moveGhostInJail).not.toHaveBeenCalled();

      harness.world.ghostsExitingJail.clear();
      harness.ghostReleaseSystem.update();
      expect(moveGhostInJail).toHaveBeenCalledTimes(1);
    } finally {
      harness.destroy();
    }
  });

  it('covers inactive branches before release and during release cleanup', () => {
    const harness = new MechanicsDomainHarness({ seed: 808, fixture: 'default-map', ghostCount: 1, autoStartSystems: false });

    try {
      const ghost = harness.world.ghosts[0];
      if (!ghost) {
        throw new Error('expected one ghost');
      }

      ghost.active = false;
      harness.ghostReleaseSystem.start();
      harness.scheduler.update(GHOST_JAIL_RELEASE_DELAY_MS);
      expect(harness.world.ghostsExitingJail.size).toBe(0);
      expect(ghost.state.free).toBe(false);

      harness.ghostReleaseSystem.destroy();

      ghost.active = true;
      harness.ghostReleaseSystem.start();
      harness.scheduler.update(GHOST_JAIL_RELEASE_DELAY_MS - 1);
      expect(harness.world.ghostsExitingJail.has(ghost)).toBe(false);
      harness.scheduler.update(1);
      expect(harness.world.ghostsExitingJail.has(ghost)).toBe(true);

      ghost.active = false;
      harness.ghostReleaseSystem.update();
      expect(harness.world.ghostsExitingJail.has(ghost)).toBe(false);
      expect(ghost.state.free).toBe(false);
    } finally {
      harness.destroy();
    }
  });

  it('stages ghost releases using delay plus per-ghost interval timing', () => {
    const harness = new MechanicsDomainHarness({ seed: 1818, fixture: 'default-map', ghostCount: 3, autoStartSystems: false });

    try {
      const releaseGhostSpy = vi.spyOn(
        harness.ghostReleaseSystem as unknown as { releaseGhost: (ghost: GhostEntity, ghostIndex: number) => void },
        'releaseGhost',
      );

      harness.ghostReleaseSystem.start();

      harness.scheduler.update(GHOST_JAIL_RELEASE_DELAY_MS - 1);
      expect(releaseGhostSpy).not.toHaveBeenCalled();

      harness.scheduler.update(1);
      expect(releaseGhostSpy).toHaveBeenCalledTimes(1);

      harness.scheduler.update(GHOST_JAIL_RELEASE_INTERVAL_MS - 1);
      expect(releaseGhostSpy).toHaveBeenCalledTimes(1);

      harness.scheduler.update(1);
      expect(releaseGhostSpy).toHaveBeenCalledTimes(2);

      harness.scheduler.update(GHOST_JAIL_RELEASE_INTERVAL_MS);
      expect(releaseGhostSpy).toHaveBeenCalledTimes(3);
    } finally {
      harness.destroy();
    }
  });

  it('covers GhostReleaseSystem with explicit mocked dependencies', () => {
    const ghost = new GhostEntity({
      key: 'inky',
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
      map: {
        width: 3,
        height: 3,
      },
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

    ghost.x = 24;
    ghost.y = 24;

    const canMoveMock = vi.fn(() => true);
    const advanceEntityMock = vi.fn((entity: GhostEntity, direction: 'up' | 'down' | 'left' | 'right') => {
      if (direction === 'left') {
        entity.tile.x -= 1;
      } else if (direction === 'right') {
        entity.tile.x += 1;
      } else if (direction === 'up') {
        entity.tile.y -= 1;
      } else {
        entity.tile.y += 1;
      }
      entity.moved = { x: 0, y: 0 };
    });
    const syncEntityPositionMock = vi.fn();
    const setEntityTileMock = vi.fn();
    const movementRules = {
      canMove: canMoveMock,
      advanceEntity: advanceEntityMock,
      syncEntityPosition: syncEntityPositionMock,
      setEntityTile: setEntityTileMock,
    } as unknown as MovementRules;

    const jailService = {
      moveGhostInJail: vi.fn(),
    } as unknown as GhostJailService;

    const scheduler = new TimerSchedulerAdapter();
    const system = new GhostReleaseSystem(world, movementRules, jailService, scheduler, new SeededRandom(11));

    system.start();
    scheduler.update(GHOST_JAIL_RELEASE_DELAY_MS);
    for (let tick = 0; tick < 8; tick += 1) {
      system.update();
    }

    expect(canMoveMock).toHaveBeenCalled();
    expect(advanceEntityMock).toHaveBeenCalled();
    expect(setEntityTileMock).toHaveBeenCalledWith(ghost, { x: 0, y: 0 });
    system.destroy();
  });

  it('covers release timer replacement, release guards, and clamped release rows', () => {
    const ghost = new GhostEntity({
      key: 'inky',
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

    const movementRules = {
      canMove: vi.fn(() => true),
      advanceEntity: vi.fn(),
      syncEntityPosition: vi.fn(),
      setEntityTile: vi.fn(),
    } as unknown as MovementRules;
    const jailService = { moveGhostInJail: vi.fn() } as unknown as GhostJailService;
    const scheduler = new TimerSchedulerAdapter();
    const system = new GhostReleaseSystem(world, movementRules, jailService, scheduler, new SeededRandom(12));
    const internals = system as unknown as {
      releaseGhost: (targetGhost: GhostEntity, ghostIndex: number) => void;
      releaseProgressByGhost: Map<GhostEntity, { releaseY: number }>;
    };

    system.queueGhostRelease(ghost, 1000);
    system.queueGhostRelease(ghost, 1000);
    ghost.active = false;
    system.update();
    scheduler.update(1000);
    internals.releaseGhost(ghost, 0);
    expect(world.ghostsExitingJail.has(ghost)).toBe(false);

    ghost.active = true;
    ghost.state.free = false;
    ghost.state.soonFree = true;
    world.ghostJailBounds.y = 0;
    internals.releaseGhost(ghost, 0);
    expect(internals.releaseProgressByGhost.get(ghost)?.releaseY).toBe(0);

    world.ghostsExitingJail.clear();
    internals.releaseProgressByGhost.clear();
    ghost.state.soonFree = true;
    world.ghostJailBounds.y = 99;
    internals.releaseGhost(ghost, 0);
    expect(internals.releaseProgressByGhost.get(ghost)?.releaseY).toBe(2);
  });
});
