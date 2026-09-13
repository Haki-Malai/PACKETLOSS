import { SeededRandom } from '../../shared/random/SeededRandom';
import { DIRECTION_VECTORS, DIRECTIONS } from '../valueObjects/Direction';
import { TilePosition } from '../valueObjects/TilePosition';
import { canMove } from './MovementRules';
import { EnemyJailService } from './EnemyJailService';
import { CollisionGrid } from '../world/CollisionGrid';
import { WorldMapData } from '../world/WorldState';

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

export const DEFAULT_POWER_POINT_RATIO = 1 / 180;

export interface PointLayout {
  basePoints: TilePosition[];
  powerPoints: TilePosition[];
  seed: number;
}

export interface PointLayoutOptions {
  powerPointRatio?: number;
  minPowerPoints?: number;
  maxPowerPoints?: number;
  seed?: number;
}

export interface BuildPointLayoutParams {
  map: WorldMapData;
  collisionGrid: CollisionGrid;
  startTile: TilePosition;
  tileSize: number;
  options?: PointLayoutOptions;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function toTileKey(tile: TilePosition): string {
  return `${tile.x},${tile.y}`;
}

function compareTiles(a: TilePosition, b: TilePosition): number {
  if (a.y !== b.y) {
    return a.y - b.y;
  }
  return a.x - b.x;
}

function isWithinBounds(map: WorldMapData, tile: TilePosition): boolean {
  return tile.x >= 0 && tile.x < map.width && tile.y >= 0 && tile.y < map.height;
}

function isMapVoidTile(map: WorldMapData, tile: TilePosition): boolean {
  if (!isWithinBounds(map, tile)) {
    return false;
  }

  const mapTile = map.tiles[tile.y]?.[tile.x];
  return !mapTile || mapTile.gid === null;
}

function hasOpenEdgeToVoid(map: WorldMapData, tile: TilePosition): boolean {
  if (!isTraversalPlayableTile(map, tile)) {
    return false;
  }

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
    const delta = DIRECTION_VECTORS[direction];
    const neighbor = { x: tile.x + delta.dx, y: tile.y + delta.dy };

    if (!isMapVoidTile(map, neighbor)) {
      return false;
    }

    return !isEdgeBlocked(direction);
  });
}

function isTraversalPlayableTile(map: WorldMapData, tile: TilePosition): boolean {
  if (!isWithinBounds(map, tile)) {
    return false;
  }

  const mapTile = map.tiles[tile.y]?.[tile.x];
  return Boolean(mapTile && mapTile.gid !== null && !mapTile.collision.penGate);
}

function isPointPlayableTile(
  map: WorldMapData,
  _collisionGrid: CollisionGrid,
  tile: TilePosition,
  _tileSize: number,
): boolean {
  if (!isTraversalPlayableTile(map, tile)) {
    return false;
  }

  return !hasOpenEdgeToVoid(map, tile);
}

function getNavigablePlayableNeighbors(
  map: WorldMapData,
  collisionGrid: CollisionGrid,
  tile: TilePosition,
  tileSize: number,
): TilePosition[] {
  if (!isTraversalPlayableTile(map, tile)) {
    return [];
  }

  const collisionTiles = collisionGrid.getTilesAt(tile);
  const neighbors: TilePosition[] = [];

  DIRECTIONS.forEach((direction) => {
    const delta = DIRECTION_VECTORS[direction];
    const candidate = { x: tile.x + delta.dx, y: tile.y + delta.dy };

    if (!isTraversalPlayableTile(map, candidate)) {
      return;
    }

    if (!canMove(direction, 0, 0, collisionTiles, tileSize, 'packet')) {
      return;
    }

    neighbors.push(candidate);
  });

  return neighbors;
}

function isPointSpawnableTile(
  map: WorldMapData,
  collisionGrid: CollisionGrid,
  tile: TilePosition,
  tileSize: number,
): boolean {
  return getNavigablePlayableNeighbors(map, collisionGrid, tile, tileSize).length > 0;
}

function resolveTraversalStartTile(
  map: WorldMapData,
  collisionGrid: CollisionGrid,
  preferredStart: TilePosition,
  tileSize: number,
): TilePosition | null {
  if (isPointSpawnableTile(map, collisionGrid, preferredStart, tileSize)) {
    return preferredStart;
  }

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const candidate = { x, y };
      if (isPointSpawnableTile(map, collisionGrid, candidate, tileSize)) {
        return candidate;
      }
    }
  }

  return null;
}

function collectReachableTiles(
  map: WorldMapData,
  collisionGrid: CollisionGrid,
  startTile: TilePosition,
  tileSize: number,
): TilePosition[] {
  const queue: TilePosition[] = [startTile];
  const visited = new Set<string>();
  const reachable: TilePosition[] = [];

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const key = toTileKey(current);

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);

    const neighbors = getNavigablePlayableNeighbors(map, collisionGrid, current, tileSize);
    if (!neighbors.length) {
      continue;
    }

    reachable.push(current);
    neighbors.forEach((neighbor) => {
      queue.push(neighbor);
    });
  }

  reachable.sort(compareTiles);
  return reachable;
}

function fnv1aMix(hash: number, value: number): number {
  const mixed = (hash ^ (value >>> 0)) >>> 0;
  return Math.imul(mixed, FNV_PRIME) >>> 0;
}

function computeMapBuildSeed(map: WorldMapData, startTile: TilePosition): number {
  let hash = FNV_OFFSET_BASIS;
  hash = fnv1aMix(hash, map.width);
  hash = fnv1aMix(hash, map.height);
  hash = fnv1aMix(hash, startTile.x);
  hash = fnv1aMix(hash, startTile.y);

  map.tiles.forEach((row) => {
    row.forEach((tile) => {
      hash = fnv1aMix(hash, tile.rawGid);
    });
  });

  return hash >>> 0;
}

function pickPowerPoints(
  basePoints: TilePosition[],
  count: number,
  seed: number,
  map: WorldMapData,
  collisionGrid: CollisionGrid,
  startTile: TilePosition,
  tileSize: number,
): TilePosition[] {
  if (count <= 0 || basePoints.length === 0) return [];

  const distanceSquared = (a: TilePosition, b: TilePosition): number => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  const entrances = map.tiles.flat().filter((tile) => tile.collision.portal || tile.collision.penGate);
  const jail = new EnemyJailService().resolveEnemyJailBounds(map, startTile);
  const safeTiles = basePoints.filter((tile) => distanceSquared(tile, startTile) >= 9 &&
    (tile.x < jail.minX - 2 || tile.x > jail.maxX + 2 || Math.abs(tile.y - jail.y) > 2) &&
    entrances.every((entrance) => distanceSquared(tile, entrance) > 4));
  const bends = safeTiles.filter((tile) => {
    const neighbors = getNavigablePlayableNeighbors(map, collisionGrid, tile, tileSize);
    return neighbors.length === 1 || (neighbors.length === 2 &&
      neighbors[0].x !== neighbors[1].x && neighbors[0].y !== neighbors[1].y);
  });
  // Prefer recognizable bends; tiny maps or explicit high counts can use other floor tiles.
  const candidates = [...(bends.length >= count ? bends : safeTiles.length >= count ? safeTiles : basePoints)];
  const random = new SeededRandom(seed);
  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const swapIndex = random.int(i + 1);
    [candidates[i], candidates[swapIndex]] = [candidates[swapIndex], candidates[i]];
  }

  const minX = Math.min(...basePoints.map((tile) => tile.x));
  const maxX = Math.max(...basePoints.map((tile) => tile.x));
  const minY = Math.min(...basePoints.map((tile) => tile.y));
  const maxY = Math.max(...basePoints.map((tile) => tile.y));
  const corners = [
    { x: minX, y: minY }, { x: maxX, y: maxY },
    { x: maxX, y: minY }, { x: minX, y: maxY },
  ].filter((corner, index, all) => all.findIndex((other) => distanceSquared(corner, other) === 0) === index);
  const selected: TilePosition[] = [];
  while (selected.length < count) {
    const corner = corners[selected.length];
    let bestIndex = 0;
    let bestScore = -Infinity;
    for (const [index, tile] of candidates.entries()) {
      // Anchor the perimeter first, then spread powerups across routes away from the spawn.
      const score = corner ? -distanceSquared(tile, corner)
        : Math.min(distanceSquared(tile, startTile), ...selected.map((point) => distanceSquared(tile, point)));
      if (score > bestScore) {
        bestIndex = index;
        bestScore = score;
      }
    }
    selected.push(candidates.splice(bestIndex, 1)[0]);
  }
  return selected.sort(compareTiles);
}

export function buildPointLayout(params: BuildPointLayoutParams): PointLayout {
  const { map, collisionGrid, startTile, tileSize, options } = params;

  const traversalStart = resolveTraversalStartTile(map, collisionGrid, startTile, tileSize);
  if (!traversalStart) {
    return {
      basePoints: [],
      powerPoints: [],
      seed: 0,
    };
  }

  const reachableTiles = collectReachableTiles(map, collisionGrid, traversalStart, tileSize);
  const basePoints = reachableTiles.filter((tile) => isPointPlayableTile(map, collisionGrid, tile, tileSize));
  const ratio = Math.max(0, options?.powerPointRatio ?? DEFAULT_POWER_POINT_RATIO);

  const maxPowerPoints = Math.min(basePoints.length, Math.max(0, options?.maxPowerPoints ?? 12));
  const minPowerPoints = Math.min(maxPowerPoints, Math.max(0, options?.minPowerPoints ?? 4));
  const requestedPowerPoints = Math.round(basePoints.length * ratio);
  const powerPointCount = clamp(requestedPowerPoints, minPowerPoints, maxPowerPoints);

  const seed = (options?.seed ?? computeMapBuildSeed(map, traversalStart)) >>> 0;
  const powerPoints = pickPowerPoints(basePoints, powerPointCount, seed, map, collisionGrid, traversalStart, tileSize);

  return {
    basePoints,
    powerPoints,
    seed,
  };
}
