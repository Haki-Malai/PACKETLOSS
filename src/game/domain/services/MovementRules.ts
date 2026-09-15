import { CollisionTile, CollisionTiles } from '../world/CollisionGrid';
import { Direction, DIRECTIONS, DIRECTION_VECTORS, MovementActor, OPPOSITE_DIRECTION } from '../valueObjects/Direction';
import { MovementProgress } from '../valueObjects/MovementProgress';
import { TilePosition } from '../valueObjects/TilePosition';

export const DEFAULT_TILE_SIZE = 16;
export const MOVEMENT_STEP_MS = 1000 / 60;

export interface BufferedEntity {
  moved: MovementProgress;
  direction: {
    current: Direction;
    next: Direction;
  };
}

export interface MovableEntity {
  tile: TilePosition;
  moved: MovementProgress;
}

export interface PositionedEntity extends MovableEntity {
  x: number;
  y: number;
}

export type CanMoveFn = (
  _direction: Direction,
  _movedY: number,
  _movedX: number,
  _collisionTiles: CollisionTiles,
  _tileSize?: number,
  _actor?: MovementActor,
) => boolean;

/** Checks whether an actor may continue its corridor or leave its current tile center. */
export function canMove(
  direction: Direction,
  movedY: number,
  movedX: number,
  collisionTiles: CollisionTiles,
  tileSize: number = DEFAULT_TILE_SIZE,
  actor: MovementActor = 'packet',
): boolean {
  const vertical = direction === 'up' || direction === 'down';
  const axisOffset = vertical ? movedY : movedX;
  const perpendicularOffset = vertical ? movedX : movedY;
  if (perpendicularOffset !== 0) return false;
  if (axisOffset !== 0) return Math.abs(axisOffset) <= tileSize;

  const bypassPenGate = actor === 'enemyRelease';

  const blocksEdge = (tile: CollisionTile, blocked: boolean): boolean => {
    if (!blocked) {
      return false;
    }
    if (bypassPenGate && tile.penGate) {
      return false;
    }
    return true;
  };

  const edges = {
    up: { current: collisionTiles.current.up, neighbor: collisionTiles.up.down, tile: collisionTiles.up },
    down: { current: collisionTiles.current.down, neighbor: collisionTiles.down.up, tile: collisionTiles.down },
    left: { current: collisionTiles.current.left, neighbor: collisionTiles.left.right, tile: collisionTiles.left },
    right: { current: collisionTiles.current.right, neighbor: collisionTiles.right.left, tile: collisionTiles.right },
  }[direction];
  return !blocksEdge(collisionTiles.current, edges.current) && !blocksEdge(edges.tile, edges.neighbor);
}

export function getAvailableDirections(
  collisionTiles: CollisionTiles,
  currentDirection: Direction,
  tileSize: number = DEFAULT_TILE_SIZE,
  actor: MovementActor = 'packet',
): Direction[] {
  const directions = DIRECTIONS.filter((direction) => {
    if (direction === OPPOSITE_DIRECTION[currentDirection]) {
      return false;
    }
    return canMove(direction, 0, 0, collisionTiles, tileSize, actor);
  });

  if (!directions.length) {
    const fallback = OPPOSITE_DIRECTION[currentDirection];
    if (canMove(fallback, 0, 0, collisionTiles, tileSize, actor)) {
      directions.push(fallback);
    }
  }

  return directions;
}

/** Applies a queued center turn or an immediate reversal without changing position. */
export function applyBufferedDirection(
  entity: BufferedEntity,
  collisionTiles: CollisionTiles,
  tileSize: number = DEFAULT_TILE_SIZE,
  canMoveFn: CanMoveFn = canMove,
): Direction {
  const { current, next } = entity.direction;
  if (next === current) {
    return current;
  }

  if (entity.moved.x !== 0 || entity.moved.y !== 0) {
    if (next === OPPOSITE_DIRECTION[current]) entity.direction.current = next;
    return entity.direction.current;
  }

  if (canMoveFn(next, entity.moved.y, entity.moved.x, collisionTiles, tileSize, 'packet')) {
    entity.direction.current = next;
    if (next === 'left' || next === 'right') {
      entity.moved.x = 0;
    } else {
      entity.moved.y = 0;
    }
  }

  return entity.direction.current;
}

/** Advances by at most one center, leaving boundary handling to the caller. */
export function advanceEntity(entity: MovableEntity, direction: Direction, distance: number, tileSize: number): void {
  const delta = DIRECTION_VECTORS[direction];
  const distanceToCenter = getDistanceToCenter(entity.moved, direction, tileSize);
  // Discard any remainder at a center so speed changes cannot skip turns or pickups.
  const travelled = Math.min(distance, distanceToCenter);
  entity.moved.x += delta.dx * travelled;
  entity.moved.y += delta.dy * travelled;

  while (entity.moved.x >= tileSize) {
    entity.tile.x += 1;
    entity.moved.x -= tileSize;
  }

  while (entity.moved.x <= -tileSize) {
    entity.tile.x -= 1;
    entity.moved.x += tileSize;
  }

  while (entity.moved.y >= tileSize) {
    entity.tile.y += 1;
    entity.moved.y -= tileSize;
  }

  while (entity.moved.y <= -tileSize) {
    entity.tile.y -= 1;
    entity.moved.y += tileSize;
  }
}

/** Returns travel distance to the next tile center in the requested corridor direction. */
export function getDistanceToCenter(moved: MovementProgress, direction: Direction, tileSize: number): number {
  const delta = DIRECTION_VECTORS[direction];
  const offset = delta.dx !== 0 ? moved.x * delta.dx : moved.y * delta.dy;
  return offset < 0 ? -offset : tileSize - offset;
}

/** Converts a legacy per-step movement speed into distance for an elapsed duration. */
export function movementDistance(speed: number, deltaMs: number): number {
  const elapsed = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
  return speed * elapsed / MOVEMENT_STEP_MS;
}

export function toWorldPosition(tile: TilePosition, moved: MovementProgress, tileSize: number): { x: number; y: number } {
  const tileCenterOffset = tileSize / 2;
  return {
    x: tile.x * tileSize + tileCenterOffset + moved.x,
    y: tile.y * tileSize + tileCenterOffset + moved.y,
  };
}

export function syncEntityPosition(entity: PositionedEntity, tileSize: number): void {
  const world = toWorldPosition(entity.tile, entity.moved, tileSize);
  entity.x = world.x;
  entity.y = world.y;
}

export function setEntityTile(entity: PositionedEntity, tile: TilePosition, tileSize: number): void {
  entity.tile = { ...tile };
  entity.moved = { x: 0, y: 0 };
  syncEntityPosition(entity, tileSize);
}

export class MovementRules {
  private readonly pendingDistance = new WeakMap<MovableEntity, number>();

  constructor(private readonly tileSize: number = DEFAULT_TILE_SIZE) {}

  canMove(
    direction: Direction,
    movedY: number,
    movedX: number,
    collisionTiles: CollisionTiles,
    actor: MovementActor = 'packet',
  ): boolean {
    return canMove(direction, movedY, movedX, collisionTiles, this.tileSize, actor);
  }

  getAvailableDirections(collisionTiles: CollisionTiles, currentDirection: Direction, actor: MovementActor): Direction[] {
    return getAvailableDirections(collisionTiles, currentDirection, this.tileSize, actor);
  }

  /** Applies player input, optionally admitting an authored portal exit through a blocked map edge. */
  applyBufferedDirection(
    entity: BufferedEntity,
    collisionTiles: CollisionTiles,
    canUseBlockedDirection?: (_direction: Direction) => boolean,
  ): Direction {
    return applyBufferedDirection(entity, collisionTiles, this.tileSize,
      (direction, movedY, movedX, tiles, tileSize, actor) =>
        canMove(direction, movedY, movedX, tiles, tileSize, actor) || canUseBlockedDirection?.(direction) === true);
  }

  /** Advances toward one center or boundary and carries unused distance into the next simulation slice. */
  advanceEntity(entity: MovableEntity, direction: Direction, distance: number, boundaryDistance = Infinity): void {
    if (!Number.isFinite(distance) || distance <= 0) return;
    const available = distance + (this.pendingDistance.get(entity) ?? 0);
    const distanceToCenter = getDistanceToCenter(entity.moved, direction, this.tileSize);
    const travelled = Math.min(available, distanceToCenter, Math.max(0, boundaryDistance));
    advanceEntity(entity, direction, travelled, this.tileSize);
    const remaining = available - travelled;
    if (remaining > Number.EPSILON) this.pendingDistance.set(entity, remaining);
    else this.pendingDistance.delete(entity);
  }

  /** Converts an entity speed into the distance available for this simulation slice. */
  movementDistance(speed: number, deltaMs: number): number {
    return movementDistance(speed, deltaMs);
  }

  /** Converts a travel distance at the supplied speed into simulation milliseconds. */
  timeForDistance(distance: number, speed: number): number {
    return speed > 0 ? distance / speed * MOVEMENT_STEP_MS : Infinity;
  }

  /** Returns travel distance to the next center along an entity's requested direction. */
  getDistanceToCenter(entity: MovableEntity, direction: Direction): number {
    return getDistanceToCenter(entity.moved, direction, this.tileSize);
  }

  /** Drops deferred distance when a wall or state transition prevents further travel. */
  discardPendingDistance(entity: MovableEntity): void {
    this.pendingDistance.delete(entity);
  }

  syncEntityPosition(entity: PositionedEntity): void {
    syncEntityPosition(entity, this.tileSize);
  }

  setEntityTile(entity: PositionedEntity, tile: TilePosition): void {
    this.pendingDistance.delete(entity);
    setEntityTile(entity, tile, this.tileSize);
  }
}
