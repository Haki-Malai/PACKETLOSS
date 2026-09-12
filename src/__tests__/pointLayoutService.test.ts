import { describe, expect, it } from 'vitest';
import { DEFAULT_POWER_POINT_RATIO, buildPointLayout } from '../game/domain/services/PointLayoutService';
import {
  createCollisionTile,
  createMapFixture,
  toTileKey,
  loadProductionMazeFixture,
} from './fixtures/pointLayoutFixtures';

describe('buildPointLayout', () => {
  it('marks navigable colliding tiles as base-point tiles when movement allows it', () => {
    const row = [
      createCollisionTile({ collides: true, left: true }),
      createCollisionTile({ collides: true }),
      createCollisionTile({ collides: true, right: true }),
    ];

    const { map, collisionGrid } = createMapFixture([row]);
    const layout = buildPointLayout({
      map,
      collisionGrid,
      startTile: { x: 1, y: 0 },
      tileSize: 16,
      options: { powerPointRatio: 0, minPowerPoints: 0 },
    });

    expect(layout.basePoints).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  it('includes non-colliding connector tiles and keeps traversal connected through them', () => {
    const row = [
      createCollisionTile({ collides: true, left: true }),
      createCollisionTile(),
      createCollisionTile({ collides: true }),
      createCollisionTile({ collides: true, right: true }),
    ];

    const { map, collisionGrid } = createMapFixture([row]);
    const layout = buildPointLayout({
      map,
      collisionGrid,
      startTile: { x: 0, y: 0 },
      tileSize: 16,
      options: { powerPointRatio: 0, minPowerPoints: 0 },
    });

    expect(layout.basePoints).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);
  });

  it('only emits base points for tiles reachable from the traversal start', () => {
    const row = [
      createCollisionTile({ left: true }),
      createCollisionTile({ right: true }),
      createCollisionTile({ left: true }),
      createCollisionTile({ right: true }),
    ];

    const { map, collisionGrid } = createMapFixture([row]);
    const layout = buildPointLayout({
      map,
      collisionGrid,
      startTile: { x: 0, y: 0 },
      tileSize: 16,
      options: { powerPointRatio: 0, minPowerPoints: 0 },
    });

    expect(layout.basePoints).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
  });

  it('does not place points on gid-null tiles or on tiles that open directly into a gid-null void tile', () => {
    const collisionRows = [
      [createCollisionTile({ collides: true }), createCollisionTile({ collides: true })],
      [createCollisionTile({ collides: true }), createCollisionTile({ collides: true })],
    ];

    const { map, collisionGrid } = createMapFixture(collisionRows, [
      [1, 1],
      [1, 0],
    ]);

    const layout = buildPointLayout({
      map,
      collisionGrid,
      startTile: { x: 0, y: 0 },
      tileSize: 16,
      options: { powerPointRatio: 0, minPowerPoints: 0 },
    });

    expect(layout.basePoints).toEqual([{ x: 0, y: 0 }]);
    expect(layout.basePoints).not.toContainEqual({ x: 1, y: 0 });
    expect(layout.basePoints).not.toContainEqual({ x: 0, y: 1 });
    expect(layout.basePoints).not.toContainEqual({ x: 1, y: 1 });
  });

  it('ignores isolated fallback candidates that are not connected to a playable neighbor tile', () => {
    const row = [
      createCollisionTile({ right: true }),
      createCollisionTile({ left: true }),
      createCollisionTile({ right: true }),
    ];

    const { map, collisionGrid } = createMapFixture([row]);
    const layout = buildPointLayout({
      map,
      collisionGrid,
      startTile: { x: 99, y: 99 },
      tileSize: 16,
      options: { powerPointRatio: 0, minPowerPoints: 0 },
    });

    expect(layout.basePoints).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  it.each([
    { seed: 0, options: { powerPointRatio: 0, minPowerPoints: 0 }, expected: 0 },
    { seed: 42, options: { powerPointRatio: 0.5 }, expected: 4 },
    { seed: 0xffffffff, options: { powerPointRatio: 1, maxPowerPoints: 3 }, expected: 3 },
    { seed: 17, options: { powerPointRatio: 0, minPowerPoints: 20 }, expected: 8 },
  ])('selects $expected unique playable power points with seed $seed and count limits', ({ seed, options, expected }) => {
    const { map, collisionGrid } = createMapFixture([
      Array.from({ length: 4 }, () => createCollisionTile()),
      Array.from({ length: 4 }, () => createCollisionTile()),
    ]);
    const originalMap = structuredClone(map);
    const layout = buildPointLayout({ map, collisionGrid, startTile: { x: 0, y: 0 }, tileSize: 16, options: { ...options, seed } });
    const baseKeys = new Set(layout.basePoints.map(toTileKey));
    const powerKeys = layout.powerPoints.map(toTileKey);

    expect(baseKeys.size).toBe(8);
    expect(powerKeys).toHaveLength(expected);
    expect(new Set(powerKeys).size).toBe(expected);
    expect(powerKeys.every((key) => baseKeys.has(key))).toBe(true);
    expect(map).toEqual(originalMap);
  });

  it('keeps production points unique, within playable tiles, and includes spawn, portals, and open connectors', () => {
    const { map, collisionGrid, startTile } = loadProductionMazeFixture();
    const layout = buildPointLayout({ map, collisionGrid, startTile, tileSize: map.tileWidth });
    const baseKeys = new Set(layout.basePoints.map(toTileKey));
    const powerKeys = layout.powerPoints.map(toTileKey);

    expect(baseKeys.size).toBe(layout.basePoints.length);
    expect(baseKeys.has(toTileKey(startTile))).toBe(true);
    expect(powerKeys).toHaveLength(Math.round(layout.basePoints.length * DEFAULT_POWER_POINT_RATIO));
    expect(new Set(powerKeys).size).toBe(powerKeys.length);
    expect(powerKeys.every((key) => baseKeys.has(key))).toBe(true);
    expect(layout.basePoints.some(({ x, y }) => map.tiles[y][x].collision.portal)).toBe(true);
    expect(layout.basePoints.some(({ x, y }) => !map.tiles[y][x].collision.collides)).toBe(true);

    for (const { x, y } of layout.basePoints) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(map.width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(map.height);
      expect(map.tiles[y][x].gid).not.toBeNull();
      expect(map.tiles[y][x].collision.penGate).toBe(false);
    }
  });
});
