import { CollisionTile } from '../../game/domain/world/CollisionGrid';
import { WorldMapData } from '../../game/domain/world/WorldState';
import { openTile } from './collisionFixtures';

export const TILE_SIZE = 16;

export function makeMap(grid: CollisionTile[][], ghostHome?: WorldMapData['ghostHome']): WorldMapData {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;

  const defaultGhostHome =
    ghostHome ??
    ({
      type: 'ghost-home',
      y: 48,
      properties: [
        { name: 'startX', value: 1 },
        { name: 'endX', value: 3 },
        { name: 'gridY', value: 3 },
        { name: 'ghostCount', value: 1 },
      ],
    } as const);

  return {
    width,
    height,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    widthInPixels: width * TILE_SIZE,
    heightInPixels: height * TILE_SIZE,
    tiles: grid.map((row, y) =>
      row.map((collision, x) => ({
        x,
        y,
        rawGid: 0,
        gid: null,
        localId: null,
        imagePath: '(empty)',
        rotation: 0,
        flipX: false,
        flipY: false,
        collision,
      })),
    ),
    collisionByGid: new Map(),
    imageByGid: new Map(),
    spawnObjects: [],
    packetSpawn: {
      type: 'packet',
      properties: [
        { name: 'gridX', value: 2 },
        { name: 'gridY', value: 2 },
      ],
    },
    ghostHome: defaultGhostHome,
  };
}

export function makeOpenMap(width: number, height: number, ghostHome?: WorldMapData['ghostHome']): WorldMapData {
  return makeMap(Array.from({ length: height }, () => Array.from({ length: width }, () => openTile())), ghostHome);
}

export function markPenGateRun(map: WorldMapData, y: number, minX: number, maxX: number): void {
  for (let x = minX; x <= maxX; x += 1) {
    map.tiles[y][x].collision.penGate = true;
  }
}

export function markSameLocalIdRun(map: WorldMapData, y: number, minX: number, maxX: number, localId: number): void {
  for (let x = minX; x <= maxX; x += 1) {
    map.tiles[y][x].localId = localId;
  }
}

export function markSequentialLocalIdRun(map: WorldMapData, y: number, minX: number, maxX: number, startLocalId: number): void {
  for (let x = minX; x <= maxX; x += 1) {
    map.tiles[y][x].localId = startLocalId + x - minX;
  }
}

export function rngWith(values: number[]) {
  let index = 0;
  return {
    next: () => {
      const value = values[index % values.length] ?? 0;
      index += 1;
      return value;
    },
    int: (maxExclusive: number) => {
      if (maxExclusive <= 0) {
        return 0;
      }
      const value = values[index % values.length] ?? 0;
      index += 1;
      return Math.floor(value * maxExclusive) % maxExclusive;
    },
  };
}
