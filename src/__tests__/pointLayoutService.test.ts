import { describe, expect, it } from 'vitest';
import { DEFAULT_POWER_POINT_RATIO, buildPointLayout } from '../game/domain/services/PointLayoutService';
import {
  createCollisionTile,
  createMapFixture,
  toTileKey,
  hasCollisionBoundary,
  collectExpectedReachableTiles,
  collectVoidBoundaryForbiddenTiles,
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

  it('keeps power-point placement deterministic per map build seed', () => {
    const collisionRows = Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }, () => createCollisionTile({ collides: true })),
    );

    const firstFixture = createMapFixture(collisionRows);
    const firstLayout = buildPointLayout({
      map: firstFixture.map,
      collisionGrid: firstFixture.collisionGrid,
      startTile: { x: 0, y: 0 },
      tileSize: 16,
    });

    const secondLayout = buildPointLayout({
      map: firstFixture.map,
      collisionGrid: firstFixture.collisionGrid,
      startTile: { x: 0, y: 0 },
      tileSize: 16,
    });

    expect(firstLayout.basePoints).toHaveLength(100);
    expect(firstLayout.powerPoints).toHaveLength(Math.round(100 * DEFAULT_POWER_POINT_RATIO));
    expect(firstLayout.powerPoints).toEqual(secondLayout.powerPoints);

    const basePointKeys = new Set(firstLayout.basePoints.map((tile) => toTileKey(tile)));
    expect(firstLayout.powerPoints.every((tile) => basePointKeys.has(toTileKey(tile)))).toBe(true);

    const rawGids = Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => 1));
    rawGids[0][0] = 2;
    const changedFixture = createMapFixture(collisionRows, rawGids);

    const changedLayout = buildPointLayout({
      map: changedFixture.map,
      collisionGrid: changedFixture.collisionGrid,
      startTile: { x: 0, y: 0 },
      tileSize: 16,
    });

    expect(changedLayout.powerPoints).not.toEqual(firstLayout.powerPoints);
  });

  it('matches the production maze reachable movement topology (including non-colliding path connectors)', () => {
    const { map, collisionGrid, startTile } = loadProductionMazeFixture();

    const layout = buildPointLayout({
      map,
      collisionGrid,
      startTile,
      tileSize: map.tileWidth,
    });

    const expectedBasePoints = collectExpectedReachableTiles(map, collisionGrid, startTile, map.tileWidth);
    const expectedKeys = expectedBasePoints.map((tile) => toTileKey(tile));
    const actualKeys = layout.basePoints.map((tile) => toTileKey(tile));

    expect(new Set(actualKeys).size).toBe(actualKeys.length);
    expect([...actualKeys].sort()).toEqual([...expectedKeys].sort());

    const includesReachableNonCollidingTile = layout.basePoints.some((tile) => {
      const mapTile = map.tiles[tile.y]?.[tile.x];
      return Boolean(mapTile && !mapTile.collision.collides);
    });

    expect(includesReachableNonCollidingTile).toBe(true);

    layout.basePoints.forEach((tile) => {
      const mapTile = map.tiles[tile.y]?.[tile.x];
      expect(mapTile?.gid).not.toBeNull();
      expect(mapTile?.collision.penGate).toBe(false);
    });
  });

  it('keeps every production-maze point tile within map bounds', () => {
    const { map, collisionGrid, startTile } = loadProductionMazeFixture();

    const layout = buildPointLayout({
      map,
      collisionGrid,
      startTile,
      tileSize: map.tileWidth,
    });

    layout.basePoints.forEach((tile) => {
      expect(tile.x).toBeGreaterThanOrEqual(0);
      expect(tile.x).toBeLessThan(map.width);
      expect(tile.y).toBeGreaterThanOrEqual(0);
      expect(tile.y).toBeLessThan(map.height);
    });

    layout.powerPoints.forEach((tile) => {
      expect(tile.x).toBeGreaterThanOrEqual(0);
      expect(tile.x).toBeLessThan(map.width);
      expect(tile.y).toBeGreaterThanOrEqual(0);
      expect(tile.y).toBeLessThan(map.height);
    });
  });

  it('keeps production-maze point distribution anchored at known tiles without helper-derived traversal expectations', () => {
    const { map, collisionGrid, startTile } = loadProductionMazeFixture();

    const layout = buildPointLayout({
      map,
      collisionGrid,
      startTile,
      tileSize: map.tileWidth,
    });

    const basePointKeys = new Set(layout.basePoints.map((tile) => toTileKey(tile)));
    const expectedPowerCount = Math.round(layout.basePoints.length * DEFAULT_POWER_POINT_RATIO);

    expect(layout.basePoints.length).toBeGreaterThan(1500);
    expect(layout.powerPoints.length).toBe(expectedPowerCount);
    expect(basePointKeys.has(toTileKey(startTile))).toBe(true);

    const hasPortalBasePoint = layout.basePoints.some((tile) => map.tiles[tile.y]?.[tile.x]?.collision.portal);
    expect(hasPortalBasePoint).toBe(true);

    const hasVoidTilePoint = layout.basePoints.some((tile) => map.tiles[tile.y]?.[tile.x]?.gid === null);
    expect(hasVoidTilePoint).toBe(false);
  });

  it('excludes production-maze border tiles whose collision topology opens directly into map void', () => {
    const { map, collisionGrid, startTile } = loadProductionMazeFixture();

    const layout = buildPointLayout({
      map,
      collisionGrid,
      startTile,
      tileSize: map.tileWidth,
    });

    const forbiddenTiles = collectVoidBoundaryForbiddenTiles(map, collisionGrid, map.tileWidth);
    const forbiddenKeys = new Set(forbiddenTiles.map((tile) => toTileKey(tile)));
    const basePointKeys = new Set(layout.basePoints.map((tile) => toTileKey(tile)));

    const leakedForbiddenPoints = [...forbiddenKeys].filter((key) => basePointKeys.has(key));
    expect(leakedForbiddenPoints).toEqual([]);

    const interiorNonCollidingConnector = layout.basePoints.find((tile) => {
      const mapTile = map.tiles[tile.y]?.[tile.x];
      return Boolean(mapTile && !hasCollisionBoundary(mapTile.collision) && !forbiddenKeys.has(toTileKey(tile)));
    });

    expect(interiorNonCollidingConnector).toBeDefined();
  });

  it('keeps production-maze power points as a deterministic subset of base points', () => {
    const { map, collisionGrid, startTile } = loadProductionMazeFixture();

    const firstLayout = buildPointLayout({
      map,
      collisionGrid,
      startTile,
      tileSize: map.tileWidth,
    });

    const secondLayout = buildPointLayout({
      map,
      collisionGrid,
      startTile,
      tileSize: map.tileWidth,
    });

    const baseKeys = new Set(firstLayout.basePoints.map((tile) => toTileKey(tile)));
    const powerKeys = firstLayout.powerPoints.map((tile) => toTileKey(tile));

    expect(firstLayout.powerPoints).toEqual(secondLayout.powerPoints);
    expect(new Set(powerKeys).size).toBe(powerKeys.length);
    expect(powerKeys.every((key) => baseKeys.has(key))).toBe(true);
  });
});
