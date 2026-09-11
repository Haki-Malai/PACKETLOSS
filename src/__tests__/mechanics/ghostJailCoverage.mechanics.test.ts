import { describe, expect, it, vi } from 'vitest';
import { GhostEntity } from '../../game/domain/entities/GhostEntity';
import { GhostJailService, getObjectNumberProperty } from '../../game/domain/services/GhostJailService';
import { MovementRules } from '../../game/domain/services/MovementRules';
import { CollisionGrid } from '../../game/domain/world/CollisionGrid';
import { openTile, wallTile } from '../fixtures/collisionFixtures';
import { TILE_SIZE, rngWith, makeMap, makeOpenMap, markPenGateRun, markSameLocalIdRun, markSequentialLocalIdRun } from '../fixtures/ghostServiceFixtures';

describe('ghost jail service coverage', () => {
  it('covers spawn resolution branches and numeric property helper', () => {
    const service = new GhostJailService();
    const map = makeMap([
      [openTile(), openTile(), openTile(), openTile(), openTile()],
      [openTile(), openTile(), openTile(), openTile(), openTile()],
      [openTile(), openTile(), openTile(), openTile(), openTile()],
      [openTile(), openTile(), openTile(), openTile(), openTile()],
      [openTile(), openTile(), openTile(), openTile(), openTile()],
    ]);

    expect(getObjectNumberProperty(undefined, 'gridX')).toBeUndefined();
    expect(getObjectNumberProperty({ properties: [{ name: 'gridX', value: 'nope' }] }, 'gridX')).toBeUndefined();

    const fromGrid = service.resolveSpawnTile(
      {
        properties: [
          { name: 'gridX', value: 2 },
          { name: 'gridY', value: 3 },
        ],
      },
      { x: 0, y: 0 },
      map,
    );

    const fromPixels = service.resolveSpawnTile(
      {
        x: 70,
        y: 50,
      },
      { x: 0, y: 0 },
      map,
    );

    const fromFallback = service.resolveSpawnTile(undefined, { x: -1, y: 99 }, map);

    expect(fromGrid).toEqual({ x: 2, y: 3 });
    expect(fromPixels).toEqual({ x: 4, y: 3 });
    expect(fromFallback).toEqual({ x: 0, y: 4 });
  });

  it('covers jail bounds resolution branches', () => {
    const service = new GhostJailService();

    const mapWithGridY = makeMap(
      Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => openTile())),
      {
        type: 'ghost-home',
        properties: [
          { name: 'startX', value: 4 },
          { name: 'endX', value: 1 },
          { name: 'gridY', value: 2 },
        ],
      },
    );

    const mapWithPixelY = makeMap(
      Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => openTile())),
      {
        type: 'ghost-home',
        y: 48,
        properties: [
          { name: 'startX', value: 1 },
          { name: 'endX', value: 3 },
        ],
      },
    );

    const mapFallback = makeMap(Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => openTile())), undefined);
    mapFallback.ghostHome = undefined;

    expect(service.resolveGhostJailBounds(mapWithGridY, { x: 2, y: 1 })).toEqual({ minX: 1, maxX: 4, y: 2 });
    expect(service.resolveGhostJailBounds(mapWithPixelY, { x: 2, y: 1 })).toEqual({ minX: 1, maxX: 3, y: 3 });
    expect(service.resolveGhostJailBounds(mapFallback, { x: 2, y: 1 })).toEqual({ minX: 2, maxX: 2, y: 1 });
  });

  it('infers jail bounds from qualifying pen-gate runs before structural fallback', () => {
    const service = new GhostJailService();
    const map = makeOpenMap(7, 7, undefined);
    map.ghostHome = undefined;

    markPenGateRun(map, 1, 1, 2);
    markPenGateRun(map, 2, 1, 3);
    markPenGateRun(map, 3, 2, 4);
    markPenGateRun(map, 4, 3, 5);
    markPenGateRun(map, 5, 1, 5);

    expect(service.resolveGhostJailBounds(map, { x: 0, y: 0 })).toEqual({ minX: 1, maxX: 5, y: 6 });
    expect(service.resolveSpawnTile(undefined, { x: 0, y: 0 }, map)).toEqual({ x: 3, y: 5 });
  });

  it('infers jail and fallback spawn from structural map geometry', () => {
    const service = new GhostJailService();
    const map = makeOpenMap(7, 8, undefined);
    map.ghostHome = undefined;

    markSameLocalIdRun(map, 2, 1, 3, 3);
    markSequentialLocalIdRun(map, 1, 1, 3, 20);
    markSequentialLocalIdRun(map, 2, 2, 4, 30);
    markSequentialLocalIdRun(map, 3, 1, 5, 40);
    markSequentialLocalIdRun(map, 4, 2, 4, 50);
    markSameLocalIdRun(map, 5, 2, 4, 9);
    markSameLocalIdRun(map, 6, 1, 5, 11);

    expect(service.resolveGhostJailBounds(map, { x: 0, y: 0 })).toEqual({ minX: 2, maxX: 4, y: 5 });
    expect(service.resolveSpawnTile(undefined, { x: 0, y: 0 }, map)).toEqual({ x: 3, y: 4 });

    const tinyMap = makeOpenMap(2, 2, undefined);
    tinyMap.ghostHome = undefined;
    expect(service.resolveGhostJailBounds(tinyMap, { x: 9, y: 9 })).toEqual({ minX: 1, maxX: 1, y: 1 });
  });

  it('covers release tile candidate selection branches', () => {
    const service = new GhostJailService();
    const movementRules = new MovementRules(TILE_SIZE);

    const openGrid = new CollisionGrid(Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => openTile())));
    const blockedGrid = new CollisionGrid(Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => wallTile())));

    const map = makeMap(Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => openTile())));

    const noCandidates = service.findReleaseTile({
      currentTile: { x: -2, y: 4 },
      avoidTile: { x: 2, y: 2 },
      bounds: { minX: 1, maxX: 3, y: 3 },
      map,
      collisionGrid: blockedGrid,
      movementRules,
      rng: rngWith([0.2]),
    });

    const nearbyCandidates = service.findReleaseTile({
      currentTile: { x: 2, y: 4 },
      avoidTile: { x: 2, y: 2 },
      bounds: { minX: 1, maxX: 3, y: 3 },
      map,
      collisionGrid: openGrid,
      movementRules,
      rng: rngWith([0.1]),
    });

    const customGridRows = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => wallTile()));
    customGridRows[2][0] = openTile();
    customGridRows[2][4] = openTile();
    customGridRows[1][4] = openTile();
    const nearestGrid = new CollisionGrid(customGridRows);

    const nearestCandidates = service.findReleaseTile({
      currentTile: { x: 2, y: 4 },
      avoidTile: { x: 99, y: 99 },
      bounds: { minX: 0, maxX: 4, y: 3 },
      map,
      collisionGrid: nearestGrid,
      movementRules,
      rng: rngWith([0.8]),
    });

    expect(noCandidates).toEqual({ x: 0, y: 2 });
    expect(nearbyCandidates).toEqual({ x: 1, y: 2 });
    expect(nearestCandidates).toEqual({ x: 4, y: 2 });
  });

  it('uses deterministic tie-breaking and respects preferred release direction without RNG sorting side-effects', () => {
    const service = new GhostJailService();
    const movementRules = new MovementRules(TILE_SIZE);
    const openGrid = new CollisionGrid(Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => openTile())));
    const map = makeMap(Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => openTile())));

    const rngInt = vi.fn(() => 1);
    const rng = {
      next: () => 0,
      int: rngInt,
    };

    const neutral = service.findReleaseTile({
      currentTile: { x: 2, y: 4 },
      avoidTile: { x: 2, y: 2 },
      bounds: { minX: 1, maxX: 3, y: 3 },
      map,
      collisionGrid: openGrid,
      movementRules,
      rng,
    });

    const preferLeft = service.findReleaseTile({
      currentTile: { x: 2, y: 4 },
      avoidTile: { x: 2, y: 2 },
      bounds: { minX: 1, maxX: 3, y: 3 },
      map,
      collisionGrid: openGrid,
      movementRules,
      rng,
      preferDirection: 'left',
    });

    const preferRight = service.findReleaseTile({
      currentTile: { x: 2, y: 4 },
      avoidTile: { x: 2, y: 2 },
      bounds: { minX: 1, maxX: 3, y: 3 },
      map,
      collisionGrid: openGrid,
      movementRules,
      rng,
      preferDirection: 'right',
    });

    expect(neutral).toEqual({ x: 3, y: 2 });
    expect(preferLeft).toEqual({ x: 1, y: 2 });
    expect(preferRight).toEqual({ x: 3, y: 2 });
    expect(rngInt).toHaveBeenCalledTimes(1);
  });

  it('covers moveGhostInJail direction initialization, edge bounce, and clamping', () => {
    const service = new GhostJailService();
    const rules = new MovementRules(TILE_SIZE);
    const ghost = new GhostEntity({
      key: 'inky',
      tile: { x: 1, y: 0 },
      direction: 'up',
      speed: 1,
      displayWidth: 10,
      displayHeight: 10,
    });

    rules.setEntityTile(ghost, { x: 1, y: 0 });
    ghost.moved.y = 1;

    service.moveGhostInJail(ghost, { minX: 1, maxX: 2, y: 2 }, rules, rngWith([0.2]), 1);
    expect(ghost.tile.y).toBe(2);
    expect(['left', 'right']).toContain(ghost.direction);

    ghost.direction = 'right';
    rules.setEntityTile(ghost, { x: 2, y: 2 });
    ghost.moved.x = 1;
    service.moveGhostInJail(ghost, { minX: 1, maxX: 2, y: 2 }, rules, rngWith([0.2]), TILE_SIZE + 4);

    expect(ghost.tile.x).toBe(2);
    expect(ghost.direction).toBe('left');

    ghost.direction = 'left';
    rules.setEntityTile(ghost, { x: 1, y: 2 });
    ghost.moved.x = -1;
    service.moveGhostInJail(ghost, { minX: 1, maxX: 2, y: 2 }, rules, rngWith([0.2]), TILE_SIZE + 4);

    expect(ghost.tile.x).toBe(1);
    expect(ghost.direction).toBe('right');
  });
});
