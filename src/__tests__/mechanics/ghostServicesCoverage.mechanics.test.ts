import { describe, expect, it } from 'vitest';
import { GhostDecisionService, simulateGhostMovement } from '../../game/domain/services/GhostDecisionService';
import { CollisionGrid } from '../../game/domain/world/CollisionGrid';
import { SeededRandom } from '../../game/shared/random/SeededRandom';
import { createSimulationGrid, openTile, wallTile } from '../fixtures/collisionFixtures';
import { TILE_SIZE, rngWith } from '../fixtures/ghostServiceFixtures';

describe('ghost decision service coverage', () => {
  it('covers center and blocked direction fallbacks', () => {
    const service = new GhostDecisionService();

    const blockedAll = {
      current: openTile({ up: true, down: true, left: true, right: true }),
      up: openTile({ down: true }),
      down: openTile({ up: true }),
      left: openTile({ right: true }),
      right: openTile({ left: true }),
    };

    expect(service.chooseDirectionAtCenter('up', blockedAll, TILE_SIZE, rngWith([0.5]))).toBe('up');
    expect(service.chooseDirectionWhenBlocked('up', 0, 0, blockedAll, TILE_SIZE, rngWith([0.5]))).toBe('up');

    const fallbackOnly = {
      current: openTile({ up: true, left: true, right: true, down: false }),
      up: openTile({ down: true }),
      down: openTile({ up: false }),
      left: openTile({ right: true }),
      right: openTile({ left: true }),
    };

    expect(service.chooseDirectionWhenBlocked('up', 0, 0, fallbackOnly, TILE_SIZE, rngWith([0.5]))).toBe('down');

    const outOfRangeRng = {
      next: () => 0,
      int: () => 99,
    };

    expect(
      service.chooseDirectionAtCenter(
        'up',
        {
          current: openTile(),
          up: openTile(),
          down: openTile(),
          left: openTile(),
          right: openTile(),
        },
        TILE_SIZE,
        outOfRangeRng,
      ),
    ).toBe('up');

    expect(
      service.chooseDirectionWhenBlocked(
        'right',
        0,
        0,
        {
          current: openTile({ right: true, up: false, down: true, left: true }),
          up: openTile({ down: false }),
          down: openTile({ up: true }),
          left: openTile({ right: true }),
          right: openTile({ left: true }),
        },
        TILE_SIZE,
        outOfRangeRng,
      ),
    ).toBe('right');
  });

  it('covers simulateGhostMovement for array and CollisionGrid inputs', () => {
    const gridArray = createSimulationGrid(7);
    const gridObject = new CollisionGrid(gridArray);

    const arrayRun = simulateGhostMovement({
      collisionGrid: gridArray,
      steps: 20,
      rng: new SeededRandom(101),
      tileSize: TILE_SIZE,
      startTile: { x: 3, y: 3 },
      startDirection: 'left',
      speed: 2,
    });

    const objectRun = simulateGhostMovement({
      collisionGrid: gridObject,
      steps: 20,
      rng: new SeededRandom(101),
      tileSize: TILE_SIZE,
      startTile: { x: 3, y: 3 },
      startDirection: 'left',
      speed: 2,
    });

    expect(arrayRun).toEqual(objectRun);
    expect(arrayRun.length).toBe(20);
  });

  it('covers blocked-at-center branch in simulation', () => {
    const grid = new CollisionGrid([
      [wallTile(), wallTile(), wallTile()],
      [wallTile(), openTile({ left: true }), openTile()],
      [wallTile(), wallTile(), wallTile()],
    ]);

    const run = simulateGhostMovement({
      collisionGrid: grid,
      steps: 1,
      rng: new SeededRandom(5),
      tileSize: TILE_SIZE,
      startTile: { x: 1, y: 1 },
      startDirection: 'left',
    });

    expect(run[0]?.direction).not.toBe('left');
  });
});
