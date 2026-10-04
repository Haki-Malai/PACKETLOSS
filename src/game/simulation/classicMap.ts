import { DIRECTIONS, type RaceMap } from './types';
import { canMove } from '../domain/services/MovementRules';
import { PortalService } from '../domain/services/PortalService';
import { DIRECTION_VECTORS } from '../domain/valueObjects/Direction';
import { CollisionGrid, type CollisionTile } from '../domain/world/CollisionGrid';

interface ParsedTile {
  localId: number | null;
  collision: CollisionTile;
}
export interface ParsedClassicMap {
  width: number;
  height: number;
  tiles: ParsedTile[][];
  portalPairs?: { from: { x: number; y: number }; to: { x: number; y: number } }[];
}

/** Adapts the existing parsed Classic geometry without importing browser runtime types. */
export function createClassicRaceMap(source: ParsedClassicMap): RaceMap {
  if (source.width !== 49 || source.height !== 49) throw new Error('Data Race alpha requires the default 49 × 49 Classic map.');
  const index = (x: number, y: number): number => y * source.width + x;
  const grid = new CollisionGrid(source.tiles.map((row) => row.map((tile) => tile.collision)));
  const portals = new PortalService(grid, source.portalPairs);
  const cells = source.tiles.flatMap((row, y) => row.map((_tile, x) => ({ x, y, edges:
    DIRECTIONS.flatMap((direction) => {
      const portal = portals.getTransition({ x, y }, direction, grid);
      if (portal) return [{ direction, to: index(portal.x, portal.y), portal: true }];
      if (!canMove(direction, 0, 0, grid.getTilesAt({ x, y }))) return [];
      const { dx, dy } = DIRECTION_VECTORS[direction];
      return [{ direction, to: index(x + dx, y + dy), portal: false }];
    }) })));
  const enemyHome = index(24, 25);
  const reachable = new Set([enemyHome]);
  const queue = [enemyHome];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    for (const edge of cells[queue[cursor]].edges) if (!reachable.has(edge.to)) { reachable.add(edge.to); queue.push(edge.to); }
  }
  const cores = new Set([[1, 1], [47, 1], [22, 3], [26, 3], [11, 10], [37, 10], [3, 24], [45, 24],
    [10, 36], [38, 36], [1, 47], [47, 47]].map(([x, y]) => index(x, y)));
  const spawns = [[11, 21], [37, 21], [11, 30], [37, 30]].map(([x, y]) => index(x, y));
  if ([...spawns, ...cores].some((cell) => !reachable.has(cell))) throw new Error('Race metadata contains unreachable cells.');
  return { id: 'classic-data-race-v1', width: source.width, height: source.height, cells, spawns, enemyHome,
    pickups: [...reachable].sort((a, b) => a - b).map((cell) => ({ id: cell, cell, kind: cores.has(cell) ? 'core' : 'bit' })) };
}
