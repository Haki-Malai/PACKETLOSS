import { type Direction, type Edge, type Movement, type RaceMap, type ScheduledInput } from './types';
import { advanceEntity, getDistanceToCenter, resolveBufferedDirection } from '../domain/services/MovementRules';
import { DIRECTION_VECTORS, OPPOSITE_DIRECTION } from '../domain/valueObjects/Direction';
import { PORTAL_TRAVEL_FRACTION } from '../domain/services/PortalService';

/** Creates a fully serializable centered actor, including its buffered turn. */
export function createMovement(cell: number, direction: Direction = 'right'): Movement {
  return { cell, to: null, progress: 0, direction, queued: direction };
}

/** Returns the direction pointing back along a corridor. */
export function opposite(direction: Direction): Direction {
  return OPPOSITE_DIRECTION[direction];
}

/** Reads the occupied edge independently of an actor reversing along a portal mouth. */
export function movementEdge(map: RaceMap, actor: Movement): Edge | null {
  return actor.to === null ? null : map.cells[actor.cell].edges.find((edge) => edge.to === actor.to
    && (edge.portal || edge.direction === actor.direction)) ?? null;
}

/** Adapts serializable graph movement to the same buffered-turn and corridor travel rules as solo play. */
export function move(map: RaceMap, actor: Movement, distance: number, portals = true,
  onCenter?: (_actor: Movement) => boolean | void, onTeleport?: () => void): void {
  if (!Number.isFinite(distance) || distance <= 0) return;
  let remaining = distance;
  if (actor.to !== null && actor.progress < 1e-9) actor.to = null;
  if (actor.to !== null) {
    const edge = movementEdge(map, actor);
    const direction = resolveBufferedDirection(actor.direction, actor.queued, false, () => false);
    if (edge && !edge.portal && direction !== actor.direction) {
      [actor.cell, actor.to] = [actor.to, actor.cell];
      actor.progress = 1 - actor.progress;
    }
    actor.direction = direction;
  }
  while (remaining > 1e-9) {
    if (actor.to === null) {
      if (onCenter?.(actor) === false) return;
      const edges = map.cells[actor.cell].edges.filter((edge) => portals || !edge.portal);
      actor.direction = resolveBufferedDirection(actor.direction, actor.queued, true,
        (direction) => edges.some((edge) => edge.direction === direction));
      const edge = edges.find((candidate) => candidate.direction === actor.direction);
      if (!edge) return;
      actor.to = edge.to;
    }
    const edge = movementEdge(map, actor);
    if (!edge) return;
    const length = edge.portal ? PORTAL_TRAVEL_FRACTION : 1;
    const vector = DIRECTION_VECTORS[edge.direction];
    const segment = { tile: { x: 0, y: 0 }, moved: {
      x: vector.dx * actor.progress * length, y: vector.dy * actor.progress * length,
    } };
    const travel = Math.min(remaining, getDistanceToCenter(segment.moved, actor.direction, length));
    advanceEntity(segment, actor.direction, travel, length);
    remaining -= travel;
    actor.progress = Math.hypot(segment.moved.x, segment.moved.y) / length;
    if (segment.tile.x !== 0 || segment.tile.y !== 0 || actor.progress < 1e-9) {
      if (actor.direction === edge.direction) {
        actor.cell = actor.to;
        if (edge.portal) onTeleport?.();
      }
      actor.to = null;
      actor.progress = 0;
    }
  }
}

/** Returns an actor's world position in tile units, preserving portal mouth travel. */
export function position(map: RaceMap, actor: Movement): { x: number; y: number } {
  const cell = map.cells[actor.cell];
  if (actor.to === null) return { x: cell.x, y: cell.y };
  const edge = movementEdge(map, actor);
  if (edge?.portal) {
    const vector = DIRECTION_VECTORS[edge.direction];
    return { x: cell.x + vector.dx * actor.progress * PORTAL_TRAVEL_FRACTION,
      y: cell.y + vector.dy * actor.progress * PORTAL_TRAVEL_FRACTION };
  }
  const next = map.cells[actor.to];
  return { x: cell.x + (next.x - cell.x) * actor.progress, y: cell.y + (next.y - cell.y) * actor.progress };
}

/** Finds a deterministic physical corridor route, excluding teleport edges. */
export function physicalPath(map: RaceMap, from: number, to: number): number[] | null {
  if (from === to) return [];
  const previous = new Map<number, number>([[from, from]]);
  const queue = [from];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    for (const edge of map.cells[queue[cursor]].edges) {
      if (edge.portal || previous.has(edge.to)) continue;
      previous.set(edge.to, queue[cursor]);
      if (edge.to === to) {
        const path = [to];
        while (previous.get(path[0]) !== from) path.unshift(previous.get(path[0])!);
        return path;
      }
      queue.push(edge.to);
    }
  }
  return null;
}

/** Selects the newest consumed intent; repeated commands in one tick cannot create extra travel. */
export function applyScheduledDirection(movement: Movement, inputs: readonly ScheduledInput[],
  tick: number, acknowledgedInput: number): number {
  let latest: ScheduledInput | undefined;
  for (const input of inputs) {
    if (input.targetTick <= tick && input.sequence > acknowledgedInput
      && (!latest || input.sequence > latest.sequence)) latest = input;
  }
  if (latest) movement.queued = latest.direction;
  return latest?.sequence ?? acknowledgedInput;
}
