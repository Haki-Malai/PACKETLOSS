import fs from 'node:fs';
import path from 'node:path';
import { expect } from 'vitest';
import { getObjectNumberProperty } from '../../game/domain/services/GhostJailService';
import { TilePosition } from '../../game/domain/valueObjects/TilePosition';
import { CollisionGrid, CollisionTile, createEmptyCollisionTile } from '../../game/domain/world/CollisionGrid';
import { WorldMapData, WorldTile } from '../../game/domain/world/WorldState';
import { TiledMap, parseTiledMap } from '../../game/infrastructure/map/TiledParser';

export function createCollisionTile(overrides: Partial<CollisionTile> = {}): CollisionTile {
  return {
    ...createEmptyCollisionTile(),
    ...overrides,
  };
}

export function createMapFixture(collisionRows: CollisionTile[][], rawGidRows?: number[][]): {
  map: WorldMapData;
  collisionGrid: CollisionGrid;
} {
  const height = collisionRows.length;
  const width = collisionRows[0]?.length ?? 0;

  const tiles: WorldTile[][] = collisionRows.map((row, y) => {
    return row.map((collision, x) => {
      const rawGid = rawGidRows?.[y]?.[x] ?? 1;
      const gid = rawGid > 0 ? rawGid : null;

      return {
        x,
        y,
        rawGid,
        gid,
        localId: gid,
        imagePath: gid === null ? '(empty)' : 'tile.png',
        rotation: 0,
        flipX: false,
        flipY: false,
        collision: { ...collision },
      };
    });
  });

  const collisionByGid = new Map<number, CollisionTile>();
  tiles.forEach((row) => {
    row.forEach((tile) => {
      if (tile.gid === null || collisionByGid.has(tile.gid)) {
        return;
      }
      collisionByGid.set(tile.gid, { ...tile.collision });
    });
  });

  const map: WorldMapData = {
    width,
    height,
    tileWidth: 16,
    tileHeight: 16,
    widthInPixels: width * 16,
    heightInPixels: height * 16,
    tiles,
    collisionByGid,
    imageByGid: new Map(),
    spawnObjects: [],
  };

  const collisionGrid = new CollisionGrid(collisionRows.map((row) => row.map((tile) => ({ ...tile }))));

  return {
    map,
    collisionGrid,
  };
}

export function toTileKey(tile: TilePosition): string {
  return `${tile.x},${tile.y}`;
}

export function loadProductionMazeFixture(): {
  map: WorldMapData;
  collisionGrid: CollisionGrid;
  startTile: TilePosition;
} {
  const mazePath = path.resolve(process.cwd(), 'public/assets/mazes/default/maze.json');
  const tiledMap = JSON.parse(fs.readFileSync(mazePath, 'utf8')) as TiledMap;
  const map = parseTiledMap(tiledMap);
  const collisionGrid = new CollisionGrid(map.tiles.map((row) => row.map((tile) => ({ ...tile.collision }))));

  const spawnX = getObjectNumberProperty(map.packetSpawn, 'gridX');
  const spawnY = getObjectNumberProperty(map.packetSpawn, 'gridY');
  expect(typeof spawnX).toBe('number');
  expect(typeof spawnY).toBe('number');

  return {
    map,
    collisionGrid,
    startTile: { x: spawnX as number, y: spawnY as number },
  };
}
