import { FIREWALL_MIN_PATROL_STEPS } from '../../../config/constants';
import { RandomSource } from '../../shared/random/RandomSource';
import { EnemyEntity } from '../entities/EnemyEntity';
import { Direction, OPPOSITE_DIRECTION } from '../valueObjects/Direction';
import { TilePosition } from '../valueObjects/TilePosition';
import { CollisionGrid, CollisionTile, CollisionTiles } from '../world/CollisionGrid';
import { advanceEntity, canMove, getAvailableDirections } from './MovementRules';
import { EnemyNavigationService, NavigationStep } from './EnemyNavigationService';

export interface EnemySimulationState {
  tile: TilePosition;
  moved: { x: number; y: number };
  direction: Direction;
}

export interface EnemySimulationConfig {
  collisionGrid: CollisionGrid | CollisionTile[][];
  steps: number;
  rng: RandomSource;
  tileSize: number;
  speed?: number;
  startTile: TilePosition;
  startDirection: Direction;
}

export interface FirewallPatrolSelection {
  readonly target: TilePosition;
  readonly routeLength: number;
}

export class EnemyDecisionService {
  private patrols = new WeakMap<EnemyEntity, {
    target: TilePosition;
    route: NavigationStep[];
    index: number;
    joined: boolean;
  }>();

  /** Discards cached patrol progress so restored enemies restart from their jail placement. */
  reset(): void {
    this.patrols = new WeakMap();
  }

  /** Chooses and caches a reachable long patrol for Firewall's next release. */
  prepareFirewallPatrol(
    enemy: EnemyEntity,
    origin: TilePosition,
    navigation: EnemyNavigationService,
    rng: RandomSource,
  ): FirewallPatrolSelection | null {
    if (enemy.key !== 'firewall') return null;
    const options = navigation.findPatrolOptions(origin, FIREWALL_MIN_PATROL_STEPS);
    const option = options[rng.int(options.length)];
    if (!option) {
      throw new Error(
        `Firewall requires a reachable patrol loop of at least ${FIREWALL_MIN_PATROL_STEPS} steps from ` +
        `(${origin.x}, ${origin.y}).`,
      );
    }
    const heading = option.headings[rng.int(option.headings.length)];
    if (!heading) {
      throw new Error(`Firewall patrol target (${option.target.x}, ${option.target.y}) has no usable route.`);
    }
    const route = navigation.createPatrol(option.target, heading);
    this.patrols.set(enemy, {
      target: { ...option.target },
      route: [...route],
      index: 0,
      joined: false,
    });
    return { target: { ...option.target }, routeLength: route.length };
  }

  /** Pursues an assigned Trojan ambush tile through the same legal steps as normal movement. */
  chooseEnemyDirection(
    enemy: EnemyEntity,
    playerTile: TilePosition,
    navigation: EnemyNavigationService,
    rng: RandomSource,
  ): Direction | null {
    if (!enemy.state.scared && enemy.key === 'firewall') {
      return this.choosePatrolDirection(enemy, navigation, rng);
    }
    const target = enemy.key === 'virus' ? playerTile
      : enemy.key === 'ping' ? enemy.pingTarget
        : enemy.key === 'trojan' ? enemy.ambushTarget : null;
    if (!enemy.state.scared && target) {
      const path = navigation.findPath(enemy.tile, target);
      if (path?.length) return path[0].direction;
      if (path?.length === 0 && enemy.key === 'ping') enemy.pingTarget = null;
      if (path?.length === 0 && enemy.key === 'virus') return null;
      if (path?.length === 0 && enemy.key === 'trojan') return null;
    }
    const steps = navigation.getSteps(enemy.tile);
    const forward = steps.filter((step) => step.direction !== OPPOSITE_DIRECTION[enemy.direction]);
    const choices = forward.length > 0 ? forward : steps;
    return choices.length > 0 ? choices[rng.int(choices.length)].direction : null;
  }

  /** Rejoins the authored loop and takes legal detours while temporary walls interrupt it. */
  private choosePatrolDirection(
    enemy: EnemyEntity,
    navigation: EnemyNavigationService,
    rng: RandomSource,
  ): Direction | null {
    let patrol = this.patrols.get(enemy);
    if (!patrol) {
      this.prepareFirewallPatrol(enemy, enemy.tile, navigation, rng);
      patrol = this.patrols.get(enemy);
    }
    if (!patrol || patrol.route.length === 0) return null;
    if (!patrol.joined) {
      if (patrol.target.x !== enemy.tile.x || patrol.target.y !== enemy.tile.y) {
        return navigation.findPath(enemy.tile, patrol.target)?.[0]?.direction ?? null;
      }
      patrol.joined = true;
      patrol.index = 0;
    }
    let step = patrol.route[patrol.index];
    if (step.tile.x !== enemy.tile.x || step.tile.y !== enemy.tile.y) {
      const rejoin = navigation.findPathToAny(enemy.tile, patrol.route.map((entry) => entry.tile));
      if (!rejoin) return null;
      if (rejoin.steps.length > 0) return rejoin.steps[0].direction;
      patrol.index = rejoin.targetIndex;
      step = patrol.route[patrol.index];
    }
    const available = navigation.getSteps(enemy.tile);
    if (!available.some((candidate) => candidate.direction === step.direction)) {
      const forward = available.filter((candidate) => candidate.direction !== OPPOSITE_DIRECTION[enemy.direction]);
      const choices = forward.length > 0 ? forward : available;
      return choices.length > 0 ? choices[rng.int(choices.length)].direction : null;
    }
    patrol.index = (patrol.index + 1) % patrol.route.length;
    return step.direction;
  }

  chooseDirectionAtCenter(
    currentDirection: Direction,
    collisionTiles: CollisionTiles,
    tileSize: number,
    rng: RandomSource,
  ): Direction {
    const options = getAvailableDirections(collisionTiles, currentDirection, tileSize, 'enemy');
    if (!options.length) {
      return currentDirection;
    }
    return options[rng.int(options.length)] ?? currentDirection;
  }

  chooseDirectionWhenBlocked(
    currentDirection: Direction,
    movedY: number,
    movedX: number,
    collisionTiles: CollisionTiles,
    tileSize: number,
    rng: RandomSource,
  ): Direction {
    const perpendicular: Direction[] =
      currentDirection === 'left' || currentDirection === 'right' ? ['up', 'down'] : ['left', 'right'];

    const options = perpendicular.filter((direction) => canMove(direction, movedY, movedX, collisionTiles, tileSize, 'enemy'));
    if (options.length > 0) {
      return options[rng.int(options.length)] ?? currentDirection;
    }

    const fallback = OPPOSITE_DIRECTION[currentDirection];
    if (canMove(fallback, movedY, movedX, collisionTiles, tileSize, 'enemy')) {
      return fallback;
    }

    return currentDirection;
  }
}

function toCollisionGrid(source: CollisionGrid | CollisionTile[][]): CollisionGrid {
  if (source instanceof CollisionGrid) {
    return source;
  }
  return new CollisionGrid(source);
}

export function simulateEnemyMovement(config: EnemySimulationConfig): EnemySimulationState[] {
  const speed = config.speed ?? 1;
  const state: EnemySimulationState = {
    tile: { ...config.startTile },
    moved: { x: 0, y: 0 },
    direction: config.startDirection,
  };

  const collisionGrid = toCollisionGrid(config.collisionGrid);
  const decisions = new EnemyDecisionService();
  const snapshots: EnemySimulationState[] = [];

  for (let step = 0; step < config.steps; step += 1) {
    const collisionTiles = collisionGrid.getTilesAt(state.tile);
    const canMoveCurrent = canMove(state.direction, state.moved.y, state.moved.x, collisionTiles, config.tileSize, 'enemy');

    if (canMoveCurrent) {
      if (state.moved.x === 0 && state.moved.y === 0) {
        state.direction = decisions.chooseDirectionAtCenter(state.direction, collisionTiles, config.tileSize, config.rng);
      }
      advanceEntity(state, state.direction, speed, config.tileSize);
    } else if (state.moved.x === 0 && state.moved.y === 0) {
      state.direction = decisions.chooseDirectionWhenBlocked(
        state.direction,
        state.moved.y,
        state.moved.x,
        collisionTiles,
        config.tileSize,
        config.rng,
      );
    }

    snapshots.push({
      tile: { ...state.tile },
      moved: { ...state.moved },
      direction: state.direction,
    });
  }

  return snapshots;
}
