import { Direction, DIRECTION_VECTORS } from '../valueObjects/Direction';
import { TilePosition } from '../valueObjects/TilePosition';
import { CollisionGrid } from '../world/CollisionGrid';
import { canMove } from './MovementRules';
import { PortalService } from './PortalService';
import { EnemyJailBounds } from '../world/WorldState';

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

export interface PatrolOption {
  readonly target: TilePosition;
  readonly headings: readonly Direction[];
}

interface PatrolState {
  readonly tile: TilePosition;
  readonly heading: Direction;
}

interface PatrolOutcome {
  readonly entry: TilePosition | null;
  readonly length: number;
}

function tileKey(tile: TilePosition): string {
  return `${tile.x},${tile.y}`;
}

export class EnemyNavigationService {
  private readonly patrolOptions = new Map<string, readonly PatrolOption[]>();
  private readonly patrolOutcomes = new Map<string, PatrolOutcome>();

  /** Uses physical mode for portal-free pursuit and returning mode for jail ingress. */
  constructor(
    private readonly grid: CollisionGrid,
    private readonly tileSize: number,
    private readonly portals: PortalService,
    private readonly mode: 'normal' | 'physical' | 'returning' = 'normal',
    private readonly jailBounds?: EnemyJailBounds,
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
        canMove(direction, 0, 0, collision, this.tileSize, this.mode === 'returning' ? 'enemyRelease' : 'enemy')) {
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

  /** Finds the cheapest target with stable direction ties using half-tile cost buckets. */
  findPathToAny(start: TilePosition, targets: readonly TilePosition[]): NavigationPath | null {
    const targetIndices = new Map<string, number>();
    targets.forEach((tile, index) => {
      if (!targetIndices.has(tileKey(tile))) targetIndices.set(tileKey(tile), index);
    });
    const startKey = tileKey(start);
    const costs = new Map([[startKey, 0]]);
    const parents = new Map<string, NavigationStep>();
    const buckets: Array<Array<{ tile: TilePosition; cost: number }> | undefined> = [
      [{ tile: start, cost: 0 }],
    ];

    for (let bucketCost = 0; bucketCost < buckets.length; bucketCost += 1) {
      const bucket = buckets[bucketCost];
      if (!bucket) continue;
      for (const current of bucket) {
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
          const cost = current.cost + step.cost * 2;
          if (cost >= (costs.get(nextKey) ?? Infinity)) continue;
          costs.set(nextKey, cost);
          parents.set(nextKey, step);
          // Appending preserves up/right/down/left order for equal-cost paths.
          (buckets[cost] ??= []).push({ tile: step.destination, cost });
        }
      }
    }
    return null;
  }

  /** Finds reachable patrol targets whose right-hand loops meet the minimum travel length. */
  findPatrolOptions(origin: TilePosition, minimumSteps: number): readonly PatrolOption[] {
    const requiredSteps = Math.max(1, Math.ceil(minimumSteps));
    const cacheKey = `${tileKey(origin)}:${requiredSteps}`;
    const cached = this.patrolOptions.get(cacheKey);
    if (cached) return cached;

    const reachableTiles = new Map<string, TilePosition>();
    const queue = [{ ...origin }];
    for (let head = 0; head < queue.length; head += 1) {
      const tile = queue[head];
      const key = tileKey(tile);
      if (reachableTiles.has(key)) continue;
      reachableTiles.set(key, tile);
      this.getSteps(tile).forEach((step) => {
        if (!reachableTiles.has(tileKey(step.destination))) queue.push(step.destination);
      });
    }

    const options: PatrolOption[] = [];
    reachableTiles.forEach((target) => {
      const headings = NAVIGATION_DIRECTIONS.filter((heading) => {
        const outcome = this.resolvePatrolOutcome({ tile: target, heading });
        return outcome.length >= requiredSteps && outcome.entry?.x === target.x && outcome.entry.y === target.y;
      });
      if (headings.length > 0) {
        options.push({ target: { ...target }, headings });
      }
    });
    this.patrolOptions.set(cacheKey, options);
    return options;
  }

  /** Creates a repeatable right-hand patrol from one tile and heading. */
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
      const next = this.getPatrolStep(tile, direction);
      if (!next) return route;
      route.push(next);
      tile = next.destination;
      direction = next.direction;
    }
  }

  /** Resolves one deterministic right-hand transition from a patrol state. */
  private getPatrolStep(tile: TilePosition, heading: Direction): NavigationStep | undefined {
    const steps = this.getSteps(tile);
    const headingIndex = NAVIGATION_DIRECTIONS.indexOf(heading);
    const turnOrder = [1, 0, 3, 2];
    return turnOrder.map((offset) => NAVIGATION_DIRECTIONS[(headingIndex + offset) % 4])
      .map((candidate) => steps.find((step) => step.direction === candidate))
      .find((step) => step !== undefined);
  }

  /** Finds and memoizes the eventual patrol cycle reached from one tile and heading. */
  private resolvePatrolOutcome(start: PatrolState): PatrolOutcome {
    const startKey = `${tileKey(start.tile)},${start.heading}`;
    const cached = this.patrolOutcomes.get(startKey);
    if (cached) return cached;

    const path: PatrolState[] = [];
    const indices = new Map<string, number>();
    let state: PatrolState | null = start;
    while (state) {
      const stateKey = `${tileKey(state.tile)},${state.heading}`;
      const known = this.patrolOutcomes.get(stateKey);
      if (known) {
        path.forEach((entry) => this.patrolOutcomes.set(`${tileKey(entry.tile)},${entry.heading}`, known));
        return this.patrolOutcomes.get(startKey) ?? known;
      }

      const repeatedAt = indices.get(stateKey);
      if (repeatedAt !== undefined) {
        const cycle = path.slice(repeatedAt);
        cycle.forEach((entry) => {
          this.patrolOutcomes.set(`${tileKey(entry.tile)},${entry.heading}`, {
            entry: { ...entry.tile },
            length: cycle.length,
          });
        });
        const transientOutcome = { entry: { ...cycle[0].tile }, length: cycle.length };
        path.slice(0, repeatedAt).forEach((entry) => {
          this.patrolOutcomes.set(`${tileKey(entry.tile)},${entry.heading}`, transientOutcome);
        });
        return this.patrolOutcomes.get(startKey) ?? transientOutcome;
      }

      indices.set(stateKey, path.length);
      path.push(state);
      const step = this.getPatrolStep(state.tile, state.heading);
      state = step ? { tile: step.destination, heading: step.direction } : null;
    }

    const noPatrol = { entry: null, length: 0 };
    path.forEach((entry) => this.patrolOutcomes.set(`${tileKey(entry.tile)},${entry.heading}`, noPatrol));
    return noPatrol;
  }
}
