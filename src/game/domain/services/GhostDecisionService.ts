import { RandomSource } from '../../shared/random/RandomSource';
import { GhostEntity } from '../entities/GhostEntity';
import { Direction, OPPOSITE_DIRECTION } from '../valueObjects/Direction';
import { TilePosition } from '../valueObjects/TilePosition';
import { CollisionGrid, CollisionTile, CollisionTiles } from '../world/CollisionGrid';
import { advanceEntity, canMove, getAvailableDirections } from './MovementRules';
import { EnemyNavigationService, NavigationStep } from './EnemyNavigationService';

export interface GhostSimulationState {
  tile: TilePosition;
  moved: { x: number; y: number };
  direction: Direction;
}

export interface GhostSimulationConfig {
  collisionGrid: CollisionGrid | CollisionTile[][];
  steps: number;
  rng: RandomSource;
  tileSize: number;
  speed?: number;
  startTile: TilePosition;
  startDirection: Direction;
}

export class GhostDecisionService {
  private readonly patrols = new WeakMap<GhostEntity, { route: NavigationStep[]; index: number }>();

  chooseEnemyDirection(
    ghost: GhostEntity,
    playerTile: TilePosition,
    navigation: EnemyNavigationService,
    rng: RandomSource,
  ): Direction | null {
    if (!ghost.state.scared && ghost.key === 'firewall') return this.choosePatrolDirection(ghost, navigation);
    const target = ghost.key === 'virus' ? playerTile : ghost.key === 'ping' ? ghost.pingTarget : null;
    if (!ghost.state.scared && target) {
      const path = navigation.findPath(ghost.tile, target);
      if (path?.length) return path[0].direction;
      if (path?.length === 0 && ghost.key === 'ping') ghost.pingTarget = null;
      if (path?.length === 0 && ghost.key === 'virus') return null;
    }
    const steps = navigation.getSteps(ghost.tile);
    const forward = steps.filter((step) => step.direction !== OPPOSITE_DIRECTION[ghost.direction]);
    const choices = forward.length > 0 ? forward : steps;
    return choices.length > 0 ? choices[rng.int(choices.length)].direction : null;
  }

  private choosePatrolDirection(ghost: GhostEntity, navigation: EnemyNavigationService): Direction | null {
    let patrol = this.patrols.get(ghost);
    if (!patrol) {
      patrol = { route: navigation.createPatrol(ghost.tile, ghost.direction), index: 0 };
      this.patrols.set(ghost, patrol);
    }
    if (patrol.route.length === 0) return null;
    let step = patrol.route[patrol.index];
    if (step.tile.x !== ghost.tile.x || step.tile.y !== ghost.tile.y) {
      const rejoin = navigation.findPathToAny(ghost.tile, patrol.route.map((entry) => entry.tile));
      if (!rejoin) return null;
      if (rejoin.steps.length > 0) return rejoin.steps[0].direction;
      patrol.index = rejoin.targetIndex;
      step = patrol.route[patrol.index];
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
    const options = getAvailableDirections(collisionTiles, currentDirection, tileSize, 'ghost');
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

    const options = perpendicular.filter((direction) => canMove(direction, movedY, movedX, collisionTiles, tileSize, 'ghost'));
    if (options.length > 0) {
      return options[rng.int(options.length)] ?? currentDirection;
    }

    const fallback = OPPOSITE_DIRECTION[currentDirection];
    if (canMove(fallback, movedY, movedX, collisionTiles, tileSize, 'ghost')) {
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

export function simulateGhostMovement(config: GhostSimulationConfig): GhostSimulationState[] {
  const speed = config.speed ?? 1;
  const state: GhostSimulationState = {
    tile: { ...config.startTile },
    moved: { x: 0, y: 0 },
    direction: config.startDirection,
  };

  const collisionGrid = toCollisionGrid(config.collisionGrid);
  const decisions = new GhostDecisionService();
  const snapshots: GhostSimulationState[] = [];

  for (let step = 0; step < config.steps; step += 1) {
    const collisionTiles = collisionGrid.getTilesAt(state.tile);
    const canMoveCurrent = canMove(state.direction, state.moved.y, state.moved.x, collisionTiles, config.tileSize, 'ghost');

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
