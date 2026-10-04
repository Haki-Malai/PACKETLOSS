import { applyScheduledDirection, move, movementEdge, opposite, position } from './movement';
import { isBattleArenaCellActive } from './BattleArenaMap';
import { RACE, SYNCHRONIZATION, type Movement, type RaceMap, type RacePlayer, type RaceSnapshot, type ScheduledInput } from './types';

export type Point = { x: number; y: number };
type Axis = keyof Point;
const EPSILON = 1e-8;

/** Advances a clone from completed authoritative ticks using the server's input boundary convention. */
export function reconcileMovement(map: RaceMap, player: RacePlayer, authoritativeTick: number,
  predictedTick: number, pending: readonly ScheduledInput[]): Movement {
  const movement = { ...player.movement };
  if (!player.connected || player.eliminatedAtTick !== null || player.deathMs > 0) return movement;
  const target = Math.min(predictedTick, authoritativeTick + SYNCHRONIZATION.maxPredictionTicks);
  for (let tick = authoritativeTick; tick < target; tick += 1) {
    applyScheduledDirection(movement, pending, tick + 1, player.acknowledgedInput);
    move(map, movement, RACE.playerSpeed * RACE.stepMs / 1000 * Math.min(1, target - tick));
  }
  return movement;
}

/** Keeps one monotonic tick clock independent of snapshot arrival and rendering cadence. */
export class RacePresentationClock {
  private tick = 0;
  private frameMs: number | null = null;

  /** Rebases only at an explicit session or visibility boundary. */
  reset(): void { this.frameMs = null; }

  /** Filters arrival jitter with a 50 ms deadband and at most two percent clock-speed correction. */
  sample(race: RaceSnapshot, receivedAtMs: number, nowMs: number, leadMs = 0): number {
    const limit = race.tick + SYNCHRONIZATION.maxPredictionTicks;
    const target = Math.min(limit, race.tick + Math.max(0, nowMs - receivedAtMs + leadMs) / RACE.stepMs);
    if (this.frameMs === null || race.tick > this.tick + SYNCHRONIZATION.maxPredictionTicks) this.tick = target;
    else {
      const advance = Math.max(0, nowMs - this.frameMs) / RACE.stepMs;
      const error = target - this.tick - advance;
      const drift = Math.sign(error) * Math.max(0, Math.abs(error) - 3);
      const correction = Math.max(-advance * 0.02, Math.min(advance * 0.02, drift));
      this.tick = Math.max(race.tick, Math.min(limit, this.tick + advance + correction));
    }
    this.frameMs = nowMs;
    return this.tick;
  }
}

/** Returns the axis of a physical corridor, including endpoint centers. */
function movementAxis(map: RaceMap, movement: Movement): Axis | null {
  const edge = movementEdge(map, movement) ?? map.cells[movement.cell].edges.find((candidate) => !candidate.portal
    && (candidate.direction === movement.direction || candidate.direction === opposite(movement.direction)));
  if (!edge || edge.portal) return null;
  const from = map.cells[movement.cell], to = map.cells[edge.to];
  return from.y === to.y && from.x !== to.x ? 'x' : from.x === to.x && from.y !== to.y ? 'y' : null;
}

/** Applies visual error only along a traversable straight corridor, clamping at walls. */
export function correctedPoint(map: RaceMap, movement: Movement, point: Point, offset: Point): Point | null {
  const axis: Axis | null = Math.abs(offset.x) > EPSILON ? 'x'
    : Math.abs(offset.y) > EPSILON ? 'y' : movementAxis(map, movement);
  if (!axis || movementAxis(map, movement) !== axis || movementEdge(map, movement)?.portal) return null;
  const perpendicular: Axis = axis === 'x' ? 'y' : 'x';
  if (Math.abs(offset[perpendicular]) > EPSILON) return null;
  const amount = offset[axis];
  if (Math.abs(amount) <= EPSILON) return point;
  const corrected = { ...movement, queued: axis === 'x' ? amount > 0 ? 'right' as const : 'left' as const
    : amount > 0 ? 'down' as const : 'up' as const };
  move(map, corrected, Math.abs(amount), false);
  if (movementEdge(map, corrected)?.portal) return null;
  const result = position(map, corrected);
  const traveled = result[axis] - point[axis];
  if (Math.abs(result[perpendicular] - point[perpendicular]) > EPSILON
    || Math.sign(traveled) !== Math.sign(amount) || Math.abs(traveled) > Math.abs(amount) + EPSILON) return null;
  return result;
}

/** Detects actual portal destinations rather than classifying ordinary corrections as camera snaps. */
export function crossedPortal(map: RaceMap, before: Movement, after: Movement): boolean {
  if (before.cell === after.cell) return false;
  return map.cells[before.cell].edges.some((edge) => edge.portal && (edge.to === after.cell || edge.to === after.to));
}

export interface ActorSample {
  player: RacePlayer;
  point: Point;
  discontinuity: boolean;
  moving: boolean;
}

/** Ages confirmed visual timers without predicting scores, pickups, or elimination. */
export function samplePlayerEffects(player: RacePlayer, elapsedTicks: number): RacePlayer {
  const elapsedMs = Math.max(0, elapsedTicks) * RACE.stepMs;
  return { ...player, huntMs: Math.max(0, player.huntMs - elapsedMs),
    protectionMs: Math.max(0, player.protectionMs - elapsedMs),
    portalBlinkMs: Math.max(0, (player.portalBlinkMs ?? 0) - elapsedMs),
    deathMs: Math.max(0, player.deathMs - elapsedMs) };
}

/** Interpolates a physical segment or adjacent corridor corner, never inventing a route through a wall. */
function corridorPoint(map: RaceMap, first: Movement, second: Movement, alpha: number): { point: Point; direction: Movement['direction'] } | null {
  const from = position(map, first), to = position(map, second);
  const firstEdge = movementEdge(map, first), secondEdge = movementEdge(map, second);
  if (first.to !== null && !firstEdge || second.to !== null && !secondEdge) return null;
  if (firstEdge?.portal || secondEdge?.portal) {
    if (first.cell !== second.cell || first.to !== second.to) return null;
  }
  const firstCells = [first.cell, ...(first.to === null ? [] : [first.to])];
  const secondCells = [second.cell, ...(second.to === null ? [] : [second.to])];
  const shared = firstCells.find((cell) => secondCells.includes(cell));
  if (shared === undefined) return null;
  const collinear = Math.abs(from.x - to.x) < EPSILON || Math.abs(from.y - to.y) < EPSILON;
  if (collinear) return { point: { x: from.x + (to.x - from.x) * alpha, y: from.y + (to.y - from.y) * alpha }, direction: second.direction };
  const corner = map.cells[shared];
  const firstLength = Math.hypot(corner.x - from.x, corner.y - from.y);
  const secondLength = Math.hypot(to.x - corner.x, to.y - corner.y);
  const travel = (firstLength + secondLength) * alpha;
  const a = travel <= firstLength ? from : corner, b = travel <= firstLength ? corner : to;
  const fraction = travel <= firstLength ? travel / firstLength : (travel - firstLength) / secondLength;
  return { point: { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction },
    direction: travel < firstLength ? first.direction : second.direction };
}

/** Samples remote movement and effects at one buffered time; holds endpoints across unsafe gaps. */
export function sampleRemoteActor(history: readonly RaceSnapshot[], targetTick: number,
  id: string, map: RaceMap): ActorSample | null {
  let start = 0;
  const latest = history[history.length - 1];
  if (!latest) return null;
  for (let index = history.length - 2; index >= 0; index -= 1) {
    const player = history[index].players.find((candidate) => candidate.id === id);
    if (player && (player.movement.to !== null && !movementEdge(map, player.movement)
      || player.eliminatedAtTick === null && !isBattleArenaCellActive(map, player.movement.cell, latest.shrinkStage))) {
      start = index + 1;
      break;
    }
  }
  let before = history[start], after = latest;
  if (!before || !after) return null;
  for (let index = start; index < history.length; index += 1) {
    const snapshot = history[index];
    if (snapshot.tick <= targetTick) before = snapshot;
    if (snapshot.tick > targetTick) { after = snapshot; break; }
  }
  const first = before.players.find((player) => player.id === id);
  const second = after.players.find((player) => player.id === id);
  if (!first || !second) return null;
  const tick = Math.max(before.tick, Math.min(targetTick, after.tick));
  const player = samplePlayerEffects(first, tick - before.tick);
  const moving = before.movementEnabled && first.connected && first.eliminatedAtTick === null
    && first.deathMs <= 0 && (first.movement.to !== null || first.movement.cell !== second.movement.cell
      || first.movement.progress !== second.movement.progress);
  if (before.tick === after.tick) return { player, point: position(map, player.movement), discontinuity: false, moving };
  const alpha = (tick - before.tick) / (after.tick - before.tick);
  const travel = corridorPoint(map, first.movement, second.movement, alpha);
  if (!travel || first.eliminatedAtTick !== second.eliminatedAtTick || first.connected !== second.connected) {
    return { player, point: position(map, first.movement), discontinuity: false, moving: false };
  }
  return { player: { ...player, movement: { ...first.movement, direction: travel.direction } },
    point: travel.point, discontinuity: false, moving };
}
