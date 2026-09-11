import fs from 'node:fs';
import path from 'node:path';
import { expect } from 'vitest';
import { getObjectNumberProperty } from '../../game/domain/services/GhostJailService';
import { canMove } from '../../game/domain/services/MovementRules';
import { DIRECTIONS, DIRECTION_VECTORS } from '../../game/domain/valueObjects/Direction';
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

function compareTiles(a: TilePosition, b: TilePosition): number {
  if (a.y !== b.y) {
    return a.y - b.y;
  }

  return a.x - b.x;
}

export function hasCollisionBoundary(collision: CollisionTile): boolean {
  return collision.collides || collision.up || collision.down || collision.left || collision.right || collision.portal;
}

function isMapVoidTile(map: WorldMapData, tile: TilePosition): boolean {
  if (tile.x < 0 || tile.x >= map.width || tile.y < 0 || tile.y >= map.height) {
    return false;
  }

  const mapTile = map.tiles[tile.y]?.[tile.x];
  return !mapTile || mapTile.gid === null;
}

function hasOpenEdgeToVoid(map: WorldMapData, tile: TilePosition): boolean {
  const collision = map.tiles[tile.y]?.[tile.x]?.collision;
  if (!collision) {
    return false;
  }

  const isEdgeBlocked = (direction: (typeof DIRECTIONS)[number]): boolean => {
    if (direction === 'up') {
      return collision.up;
    }
    if (direction === 'down') {
      return collision.down;
    }
    if (direction === 'left') {
      return collision.left;
    }
    return collision.right;
  };

  return DIRECTIONS.some((direction) => {
    const vector = DIRECTION_VECTORS[direction];
    const neighbor = { x: tile.x + vector.dx, y: tile.y + vector.dy };

    if (!isMapVoidTile(map, neighbor)) {
      return false;
    }

    return !isEdgeBlocked(direction);
  });
}

function isTraversalCandidateTile(map: WorldMapData, tile: TilePosition): boolean {
  if (tile.x < 0 || tile.x >= map.width || tile.y < 0 || tile.y >= map.height) {
    return false;
  }

  const mapTile = map.tiles[tile.y]?.[tile.x];
  return Boolean(mapTile && mapTile.gid !== null && !mapTile.collision.penGate);
}

function isPointCandidateTile(
  map: WorldMapData,
  _collisionGrid: CollisionGrid,
  tile: TilePosition,
  _tileSize: number,
): boolean {
  if (!isTraversalCandidateTile(map, tile)) {
    return false;
  }

  return !hasOpenEdgeToVoid(map, tile);
}

function getExpectedNavigableNeighbors(
  map: WorldMapData,
  collisionGrid: CollisionGrid,
  tile: TilePosition,
  tileSize: number,
): TilePosition[] {
  if (!isTraversalCandidateTile(map, tile)) {
    return [];
  }

  const collisionTiles = collisionGrid.getTilesAt(tile);
  const neighbors: TilePosition[] = [];

  DIRECTIONS.forEach((direction) => {
    const vector = DIRECTION_VECTORS[direction];
    const candidate = { x: tile.x + vector.dx, y: tile.y + vector.dy };

    if (!isTraversalCandidateTile(map, candidate)) {
      return;
    }

    if (!canMove(direction, 0, 0, collisionTiles, tileSize, 'pacman')) {
      return;
    }

    neighbors.push(candidate);
  });

  return neighbors;
}

function resolveExpectedTraversalStart(
  map: WorldMapData,
  collisionGrid: CollisionGrid,
  preferredStart: TilePosition,
  tileSize: number,
): TilePosition | null {
  if (getExpectedNavigableNeighbors(map, collisionGrid, preferredStart, tileSize).length > 0) {
    return preferredStart;
  }

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const candidate = { x, y };
      if (getExpectedNavigableNeighbors(map, collisionGrid, candidate, tileSize).length > 0) {
        return candidate;
      }
    }
  }

  return null;
}

export function collectExpectedReachableTiles(
  map: WorldMapData,
  collisionGrid: CollisionGrid,
  preferredStart: TilePosition,
  tileSize: number,
): TilePosition[] {
  const start = resolveExpectedTraversalStart(map, collisionGrid, preferredStart, tileSize);
  if (!start) {
    return [];
  }

  const queue: TilePosition[] = [start];
  const visited = new Set<string>();
  const expected: TilePosition[] = [];

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const key = toTileKey(current);

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);

    const neighbors = getExpectedNavigableNeighbors(map, collisionGrid, current, tileSize);
    if (!neighbors.length) {
      continue;
    }

    if (isPointCandidateTile(map, collisionGrid, current, tileSize)) {
      expected.push(current);
    }

    neighbors.forEach((neighbor) => {
      queue.push(neighbor);
    });
  }

  expected.sort(compareTiles);
  return expected;
}

export function collectVoidBoundaryForbiddenTiles(
  map: WorldMapData,
  _collisionGrid: CollisionGrid,
  _tileSize: number,
): TilePosition[] {
  const forbidden: TilePosition[] = [];

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const candidate = { x, y };
      if (!isTraversalCandidateTile(map, candidate)) {
        continue;
      }

      if (hasOpenEdgeToVoid(map, candidate)) {
        forbidden.push(candidate);
      }
    }
  }

  forbidden.sort(compareTiles);
  return forbidden;
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

  const spawnX = getObjectNumberProperty(map.pacmanSpawn, 'gridX');
  const spawnY = getObjectNumberProperty(map.pacmanSpawn, 'gridY');
  expect(typeof spawnX).toBe('number');
  expect(typeof spawnY).toBe('number');

  return {
    map,
    collisionGrid,
    startTile: { x: spawnX as number, y: spawnY as number },
  };
}
