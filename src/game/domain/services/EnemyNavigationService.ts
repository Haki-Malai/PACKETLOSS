import { Direction, DIRECTION_VECTORS } from '../valueObjects/Direction';
import { TilePosition } from '../valueObjects/TilePosition';
import { CollisionGrid } from '../world/CollisionGrid';
import { canMove } from './MovementRules';
import { PortalService } from './PortalService';
import { GhostJailBounds } from '../world/WorldState';

export const NAVIGATION_DIRECTIONS: readonly Direction[] = ['up', 'right', 'down', 'left'];

export interface NavigationStep {
  readonly tile: TilePosition;
  readonly direction: Direction;
  readonly destination: TilePosition;
  readonly cost: number;
}

interface NavigationPath {
  steps: NavigationStep[];
  targetIndex: number;
}

function tileKey(tile: TilePosition): string {
  return `${tile.x},${tile.y}`;
}

export class EnemyNavigationService {
  constructor(
    private readonly grid: CollisionGrid,
    private readonly tileSize: number,
    private readonly portals: PortalService,
    private readonly mode: 'normal' | 'returning' = 'normal',
    private readonly jailBounds?: GhostJailBounds,
  ) {}

  getSteps(tile: TilePosition): NavigationStep[] {
    const collision = this.grid.getTilesAt(tile);
    const steps: NavigationStep[] = [];
    for (const direction of NAVIGATION_DIRECTIONS) {
      const delta = DIRECTION_VECTORS[direction];
      const destination = { x: tile.x + delta.dx, y: tile.y + delta.dy };
      const portal = this.mode === 'normal' ? this.portals.getTransition(tile, direction, this.grid) : null;
      if (portal) {
        steps.push({ tile: { ...tile }, direction, destination: portal, cost: 0.5 });
      } else if (this.isJailReturnEdge(tile, destination) ||
        canMove(direction, 0, 0, collision, this.tileSize, this.mode === 'returning' ? 'ghostRelease' : 'ghost')) {
        steps.push({ tile: { ...tile }, direction, destination, cost: 1 });
      }
    }
    return steps;
  }

  private isJailReturnEdge(from: TilePosition, to: TilePosition): boolean {
    const bounds = this.jailBounds;
    if (this.mode !== 'returning' || !bounds || from.x < bounds.minX || from.x > bounds.maxX ||
      to.x < bounds.minX || to.x > bounds.maxX) return false;
    // Authored prison rails have fully blocked tiles. Match the release corridor only.
    return (from.y === bounds.y && to.y === bounds.y) ||
      (from.x === to.x && from.y === bounds.y - 1 && to.y === bounds.y);
  }

  findPath(start: TilePosition, target: TilePosition): NavigationStep[] | null {
    return this.findPathToAny(start, [target])?.steps ?? null;
  }

  findPathToAny(start: TilePosition, targets: readonly TilePosition[]): NavigationPath | null {
    const targetIndices = new Map<string, number>();
    targets.forEach((tile, index) => {
      if (!targetIndices.has(tileKey(tile))) targetIndices.set(tileKey(tile), index);
    });
    const startKey = tileKey(start);
    const costs = new Map([[startKey, 0]]);
    const parents = new Map<string, NavigationStep>();
    const queue = [{ tile: start, cost: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = tileKey(current.tile);
      if (costs.get(key) !== current.cost) continue;
      const targetIndex = targetIndices.get(key);
      if (targetIndex !== undefined) {
        const steps: NavigationStep[] = [];
        let cursor = key;
        while (cursor !== startKey) {
          const step = parents.get(cursor)!;
          steps.push(step);
          cursor = tileKey(step.tile);
        }
        return { steps: steps.reverse(), targetIndex };
      }

      for (const step of this.getSteps(current.tile)) {
        const nextKey = tileKey(step.destination);
        const cost = current.cost + step.cost;
        if (cost >= (costs.get(nextKey) ?? Infinity)) continue;
        costs.set(nextKey, cost);
        parents.set(nextKey, step);
        // Insert after equal costs to preserve the authored up/right/down/left tie order.
        let low = 0;
        let high = queue.length;
        while (low < high) {
          const middle = (low + high) >>> 1;
          if (queue[middle].cost <= cost) low = middle + 1;
          else high = middle;
        }
        queue.splice(low, 0, { tile: step.destination, cost });
      }
    }
    return null;
  }

  createPatrol(start: TilePosition, heading: Direction): NavigationStep[] {
    const seen = new Map<string, number>();
    const route: NavigationStep[] = [];
    let tile = { ...start };
    let direction = heading;
    while (true) {
      const stateKey = `${tileKey(tile)},${direction}`;
      const repeatedAt = seen.get(stateKey);
      if (repeatedAt !== undefined) return route.slice(repeatedAt);
      seen.set(stateKey, route.length);
      const steps = this.getSteps(tile);
      const headingIndex = NAVIGATION_DIRECTIONS.indexOf(direction);
      const turnOrder = [1, 0, 3, 2];
      const next = turnOrder.map((offset) => NAVIGATION_DIRECTIONS[(headingIndex + offset) % 4])
        .map((candidate) => steps.find((step) => step.direction === candidate))
        .find((step) => step !== undefined);
      if (!next) return route;
      route.push(next);
      tile = next.destination;
      direction = next.direction;
    }
  }
}
