import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveMapPathsForVariant, resolveMapVariantFromEnv, SCORE_BONUS_TILES } from '../game/app/mapRuntimeConfig';
import { EnemyNavigationService } from '../game/domain/services/EnemyNavigationService';
import { buildPointLayout } from '../game/domain/services/PointLayoutService';
import { PortalService } from '../game/domain/services/PortalService';
import { CollisionGrid } from '../game/domain/world/CollisionGrid';
import { parseTiledMap, type TiledMap } from '../game/infrastructure/map/TiledParser';
import { loadProductionMazeFixture } from './fixtures/pointLayoutFixtures';

describe('mapRuntimeConfig', () => {
  it('resolves DEMO env to demo map variant', () => {
    expect(resolveMapVariantFromEnv('DEMO')).toBe('demo');
  });

  it('resolves non-DEMO env values to default map variant', () => {
    expect(resolveMapVariantFromEnv(undefined)).toBe('default');
    expect(resolveMapVariantFromEnv('demo')).toBe('default');
    expect(resolveMapVariantFromEnv('PROD')).toBe('default');
  });

  it('resolves runtime paths for default variant', () => {
    expect(resolveMapPathsForVariant('default')).toEqual({
      mapJsonPath: 'assets/mazes/default/maze.json',
    });
  });

  it('resolves runtime paths for demo variant', () => {
    expect(resolveMapPathsForVariant('demo')).toEqual({
      mapJsonPath: 'assets/mazes/default/demo.json',
    });
  });

  it('places five distinct bonus icons on packet-reachable symmetric tiles in each authored map', () => {
    const defaultMaze = loadProductionMazeFixture();
    const demoJson = JSON.parse(fs.readFileSync(path.resolve('public/assets/mazes/default/demo.json'), 'utf8')) as TiledMap;
    const demoMap = parseTiledMap(demoJson);
    const demoMaze = {
      map: demoMap,
      collisionGrid: new CollisionGrid(demoMap.tiles.map((row) => row.map((tile) => ({ ...tile.collision })))),
      startTile: { x: 6, y: 7 },
    };
    for (const [variant, { map, collisionGrid, startTile }] of [
      ['default', defaultMaze],
      ['demo', demoMaze],
    ] as const) {
      const reachable = new Set(buildPointLayout({ map, collisionGrid, startTile, tileSize: map.tileWidth })
        .basePoints.map((tile) => `${tile.x},${tile.y}`));
      const positions = SCORE_BONUS_TILES[variant].map((tile) => `${tile.x},${tile.y}`);
      const portals = new Set((map.portalPairs ?? []).flatMap((pair) => [
        `${pair.from.x},${pair.from.y}`, `${pair.to.x},${pair.to.y}`,
      ]));
      expect(new Set(positions).size).toBe(5);
      expect(positions.every((position) => reachable.has(position))).toBe(true);
      expect(positions.filter((position) => portals.has(position))).toEqual([]);
      const [first, second, middle, fourth, fifth] = SCORE_BONUS_TILES[variant];
      expect(first.x + second.x).toBe(map.width - 1);
      expect(first.y).toBe(second.y);
      expect(middle.x).toBe(Math.floor(map.width / 2));
      expect(fourth.x + fifth.x).toBe(map.width - 1);
      expect(fourth.y).toBe(fifth.y);
      expect(SCORE_BONUS_TILES[variant].every((tile) =>
        Math.abs(tile.x - startTile.x) + Math.abs(tile.y - startTile.y) >= Math.floor(map.width / 3)))
        .toBe(true);
      const navigation = new EnemyNavigationService(collisionGrid, map.tileWidth,
        new PortalService(collisionGrid, map.portalPairs ?? []), 'physical');
      expect(navigation.findPath(first, second)?.length).toBeLessThanOrEqual(50);
      expect(navigation.findPath(fourth, fifth)?.length).toBeLessThanOrEqual(50);
    }
  });
});
