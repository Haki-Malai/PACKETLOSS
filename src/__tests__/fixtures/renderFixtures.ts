import fs from 'node:fs';
import path from 'node:path';
import { expect } from 'vitest';
import { Camera2D } from '../../engine/camera';
import { getObjectNumberProperty } from '../../game/domain/services/GhostJailService';
import { DIRECTIONS, DIRECTION_VECTORS } from '../../game/domain/valueObjects/Direction';
import { RenderSystem } from '../../game/systems/RenderSystem';
import { CanvasRendererAdapter } from '../../game/infrastructure/adapters/CanvasRendererAdapter';
import { AssetCatalog } from '../../game/infrastructure/assets/AssetCatalog';
import { TiledMap, parseTiledMap } from '../../game/infrastructure/map/TiledParser';
import { CollisionGrid, CollisionTile, createEmptyCollisionTile } from '../../game/domain/world/CollisionGrid';
import { WorldMapData, WorldState, WorldTile } from '../../game/domain/world/WorldState';

export function createCollisionTile(overrides: Partial<CollisionTile> = {}): CollisionTile {
  return {
    ...createEmptyCollisionTile(),
    ...overrides,
  };
}

export function createMapFixture(collisionRows: CollisionTile[][]): {
  map: WorldMapData;
  collisionGrid: CollisionGrid;
} {
  const height = collisionRows.length;
  const width = collisionRows[0]?.length ?? 0;

  const tiles: WorldTile[][] = collisionRows.map((row, y) =>
    row.map((collision, x) => ({
      x,
      y,
      rawGid: 1,
      gid: 1,
      localId: 1,
      imagePath: 'tile.png',
      rotation: 0,
      flipX: false,
      flipY: false,
      collision: { ...collision },
    })),
  );

  const map: WorldMapData = {
    width,
    height,
    tileWidth: 16,
    tileHeight: 16,
    widthInPixels: width * 16,
    heightInPixels: height * 16,
    tiles,
    collisionByGid: new Map([[1, createCollisionTile()]]),
    imageByGid: new Map([[1, 'tile.png']]),
    spawnObjects: [],
  };

  return {
    map,
    collisionGrid: new CollisionGrid(collisionRows.map((row) => row.map((tile) => ({ ...tile })))),
  };
}

interface RenderHarnessOptions {
  collisionRows?: CollisionTile[][];
  pacmanTile?: { x: number; y: number };
}

export function toTileCenter(tile: { x: number; y: number }, tileSize = 16): { x: number; y: number } {
  return {
    x: tile.x * tileSize + tileSize / 2,
    y: tile.y * tileSize + tileSize / 2,
  };
}

function isMapVoidTile(map: WorldMapData, tile: { x: number; y: number }): boolean {
  if (tile.x < 0 || tile.x >= map.width || tile.y < 0 || tile.y >= map.height) {
    return false;
  }

  const mapTile = map.tiles[tile.y]?.[tile.x];
  return !mapTile || mapTile.gid === null;
}

function hasOpenEdgeToVoid(map: WorldMapData, tile: { x: number; y: number }): boolean {
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

export function collectVoidBoundaryForbiddenTiles(
  map: WorldMapData,
  _collisionGrid: CollisionGrid,
  _tileSize: number,
): Array<{ x: number; y: number }> {
  const forbidden: Array<{ x: number; y: number }> = [];

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const tile = map.tiles[y]?.[x];
      if (!tile || tile.gid === null || tile.collision.penGate) {
        continue;
      }

      if (hasOpenEdgeToVoid(map, { x, y })) {
        forbidden.push({ x, y });
      }
    }
  }

  return forbidden;
}

export function createWorld(map: WorldMapData, collisionGrid: CollisionGrid, pacmanTile: { x: number; y: number }): WorldState {
  const center = toTileCenter(pacmanTile, map.tileWidth);

  return {
    map,
    tileSize: map.tileWidth,
    collisionGrid,
    pacmanAnimation: {
      frame: 0,
      elapsedMs: 0,
      sequenceIndex: 0,
      active: false,
    },
      pacman: {
        tile: { ...pacmanTile },
        moved: { x: 0, y: 0 },
        x: center.x,
        y: center.y,
      displayWidth: 10,
      displayHeight: 10,
      angle: 0,
      flipX: false,
        flipY: false,
        portalBlinkRemainingMs: 0,
        portalBlinkElapsedMs: 0,
        deathRecoveryRemainingMs: 0,
        deathRecoveryElapsedMs: 0,
        deathRecoveryNextToggleAtMs: 0,
        deathRecoveryVisible: true,
      },
      ghosts: [],
      ghostScaredTimers: new Map(),
      ghostScaredWarnings: new Map(),
      ghostAnimations: new Map(),
    } as unknown as WorldState;
}

export function createRenderHarness(options: RenderHarnessOptions = {}): {
  world: WorldState;
  renderSystem: RenderSystem;
  center: { x: number; y: number };
} {
  const collisionRows =
    options.collisionRows ?? [[createCollisionTile({ collides: true, left: true }), createCollisionTile({ collides: true, right: true })]];
  const pacmanTile = options.pacmanTile ?? { x: 0, y: 0 };
  const { map, collisionGrid } = createMapFixture(collisionRows);
  const center = toTileCenter(pacmanTile, map.tileWidth);

  const world = createWorld(map, collisionGrid, pacmanTile);

  const renderer = {
    clear: () => {
      // no-op for unit tests
    },
    beginWorld: () => {
      // no-op for unit tests
    },
    endWorld: () => {
      // no-op for unit tests
    },
    drawImageCentered: () => {
      // no-op for unit tests
    },
    drawSpriteFrame: () => {
      // no-op for unit tests
    },
    context: {
      save: () => {
        // no-op for unit tests
      },
      restore: () => {
        // no-op for unit tests
      },
      drawImage: () => {
        // no-op for unit tests
      },
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D,
  } as unknown as CanvasRendererAdapter;

  const assets = {
    getCollectibleImage: () => null,
    getTileImage: () => null,
    getSpriteSheet: () => null,
  } as unknown as AssetCatalog;

  const renderSystem = new RenderSystem(world, renderer, {} as Camera2D, assets);

  return {
    world,
    renderSystem,
    center,
  };
}

export function loadProductionMazeFixture(): {
  map: WorldMapData;
  collisionGrid: CollisionGrid;
  startTile: { x: number; y: number };
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
