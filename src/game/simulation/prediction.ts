import { move, movementEdge, opposite, position } from './movement';
import {
  RACE,
  type Direction,
  type Movement,
  type RaceMap,
  type RacePlayer,
  type RaceSnapshot,
} from './types';

/** Records intent at its exact fractional presentation tick, never as client-authoritative movement. */
export interface PredictedInput { sequence: number; tick: number; direction: Direction }
type Point = { x: number; y: number };
type Axis = keyof Point;
interface MovementProjection {
  movement: Movement;
  point: Point;
  complete: boolean;
}
interface PreviousLocalSample {
  race: RaceSnapshot;
  player: RacePlayer;
  tick: number;
  projection: MovementProjection;
  nowMs: number;
}
export interface LocalMovementSample {
  movement: Movement;
  point: Point;
  discontinuity: boolean;
}
// Covers 200 ms RTT plus snapshot spacing/jitter while still bounding disconnected prediction.
const MAX_PREDICTION_TICKS = 24;
// One 20 Hz snapshot interval is timing noise, not a change in local movement speed.
const CLOCK_JITTER_TICKS = 3;
const CLOCK_CORRECTION_RATE = 0.02;
const POSITION_EPSILON = 1e-9;

/** Maps elapsed presentation time to the bounded local simulation tick used for prediction. */
export function localPredictionTick(authoritativeTick: number, receivedAtMs: number | null,
  nowMs: number): number {
  if (receivedAtMs === null) return authoritativeTick;
  const elapsedTicks = Math.max(0, nowMs - receivedAtMs) / RACE.stepMs;
  return authoritativeTick + Math.min(MAX_PREDICTION_TICKS, elapsedTicks);
}

/** Keeps snapshot arrival jitter out of the render clock, with bounded catch-up after stalls. */
export class RacePresentationClock {
  private matchId: string | null = null;
  private phase: RaceSnapshot['phase'] | null = null;
  private tick = 0;
  private frameMs: number | null = null;

  /** Drops stale timing on visibility, connection, and match transitions. */
  reset(): void { this.frameMs = null; }

  /** Runs at real-time speed through arrival jitter, gently correcting sustained clock drift. */
  sample(race: RaceSnapshot, receivedAtMs: number | null, nowMs: number, leadMs = 0): number {
    const target = localPredictionTick(race.tick, receivedAtMs, nowMs + Math.max(0, leadMs));
    const elapsed = this.frameMs === null ? 0 : Math.max(0, nowMs - this.frameMs);
    if (this.frameMs === null || this.matchId !== race.matchId || this.phase !== race.phase
      || race.phase !== 'playing' || elapsed > 250
      || race.tick - this.tick > 6) {
      this.tick = target;
    } else {
      const advance = elapsed / RACE.stepMs;
      const error = target - (this.tick + advance);
      // Local input may lead by one RTT to include its trip to the server. Neither
      // individual packet delays nor small ping changes should pulse that timeline.
      const drift = Math.sign(error) * Math.max(0, Math.abs(error) - CLOCK_JITTER_TICKS);
      const correction = Math.max(-advance * CLOCK_CORRECTION_RATE,
        Math.min(advance * CLOCK_CORRECTION_RATE, drift));
      this.tick = Math.max(this.tick, Math.min(race.tick + MAX_PREDICTION_TICKS,
        this.tick + advance + correction));
    }
    this.matchId = race.matchId;
    this.phase = race.phase;
    this.frameMs = nowMs;
    return this.tick;
  }
}

/** Returns the axis of a physical corridor, including its endpoint centers. */
function movementAxis(map: RaceMap, movement: Movement): Axis | null {
  const occupied = movementEdge(map, movement);
  const edge = occupied ?? map.cells[movement.cell].edges.find((candidate) => !candidate.portal
    && (candidate.direction === movement.direction
      || candidate.direction === opposite(movement.direction)));
  if (!edge || edge.portal) return null;
  const from = map.cells[movement.cell], to = map.cells[edge.to];
  return from.y === to.y && from.x !== to.x ? 'x'
    : from.x === to.x && from.y !== to.y ? 'y' : null;
}

/** Replays one authoritative base and records whether it reached the requested presentation tick. */
function projectMovement(map: RaceMap, player: RacePlayer, authoritativeTick: number,
  predictedTick: number, pending: readonly PredictedInput[]): MovementProjection {
  const movement = { ...player.movement };
  const cappedTick = authoritativeTick + MAX_PREDICTION_TICKS;
  const target = Math.max(authoritativeTick, Math.min(predictedTick, cappedTick));
  const complete = predictedTick >= authoritativeTick - POSITION_EPSILON
    && predictedTick <= cappedTick + POSITION_EPSILON;
  if (!player.connected || player.eliminatedAtTick !== null || player.deathMs > 0) {
    return { movement, point: position(map, movement), complete };
  }

  const inputs = pending.filter((input) => input.sequence > player.acknowledgedInput)
    .sort((a, b) => a.tick - b.tick || a.sequence - b.sequence);
  let cursor = authoritativeTick;
  for (const input of inputs) {
    if (input.tick > target) break;
    const untilInput = Math.max(cursor, input.tick);
    move(map, movement, RACE.playerSpeed / 60 * (untilInput - cursor));
    movement.queued = input.direction;
    cursor = untilInput;
  }
  move(map, movement, RACE.playerSpeed / 60 * Math.max(0, target - cursor));
  return { movement, point: position(map, movement), complete };
}

/** Replays travel up to each exact input time; pickups, damage, enemies, and scores remain authoritative. */
export function reconcileMovement(map: RaceMap, player: RacePlayer, authoritativeTick: number,
  predictedTick: number, pending: readonly PredictedInput[]): Movement {
  return projectMovement(map, player, authoritativeTick, predictedTick, pending).movement;
}

/** Moves a clone by one scalar correction while rejecting turns and portal travel. */
function correctedPoint(map: RaceMap, movement: Movement, point: Point, offset: Point): Point | null {
  const axis: Axis | null = Math.abs(offset.x) > POSITION_EPSILON ? 'x'
    : Math.abs(offset.y) > POSITION_EPSILON ? 'y' : movementAxis(map, movement);
  if (!axis || movementAxis(map, movement) !== axis || movementEdge(map, movement)?.portal) return null;
  const amount = offset[axis];
  if (Math.abs(amount) <= POSITION_EPSILON) return point;
  const corrected = { ...movement };
  corrected.queued = axis === 'x' ? amount > 0 ? 'right' : 'left'
    : amount > 0 ? 'down' : 'up';
  move(map, corrected, Math.abs(amount), false);
  if (movementEdge(map, corrected)?.portal) return null;
  const result = position(map, corrected);
  const perpendicular: Axis = axis === 'x' ? 'y' : 'x';
  const traveled = result[axis] - point[axis];
  if (Math.abs(result[perpendicular] - point[perpendicular]) > POSITION_EPSILON
    || Math.sign(traveled) !== Math.sign(amount)
    || Math.abs(traveled) > Math.abs(amount) + POSITION_EPSILON) return null;
  return result;
}

/** Returns a correction only when shared movement can reach it along one physical corridor. */
function safeCorrection(map: RaceMap, previous: MovementProjection,
  current: MovementProjection): Point | null {
  if (!previous.complete || !current.complete) return null;
  const correction = {
    x: previous.point.x - current.point.x,
    y: previous.point.y - current.point.y,
  };
  if (Math.hypot(correction.x, correction.y) > 1
    || Math.abs(correction.x) > POSITION_EPSILON
      && Math.abs(correction.y) > POSITION_EPSILON) return null;
  const result = correctedPoint(map, current.movement, current.point, correction);
  return result && Math.hypot(result.x - previous.point.x, result.y - previous.point.y)
    <= POSITION_EPSILON ? correction : null;
}

/** Detects completion of a portal traversal between adjacent presentation samples. */
function completedPortal(map: RaceMap, previous: Movement, current: Movement): boolean {
  const edge = movementEdge(map, previous);
  if (!edge?.portal) return false;
  const stillTraversing = current.cell === previous.cell && current.to === previous.to
    && current.direction === previous.direction && movementEdge(map, current)?.portal === true;
  return !stillTraversing && current.cell !== previous.cell;
}

/** Eases small authoritative corrections without delaying new local input or smoothing teleports. */
export class LocalMovementPresentation {
  private previous: PreviousLocalSample | null = null;
  private offset: Point = { x: 0, y: 0 };

  /** Clears presentation error after focus loss, reconnects, or a fresh match. */
  reset(): void { this.previous = null; this.offset = { x: 0, y: 0 }; }

  /** Returns predicted movement, a corridor-safe correction, and whether camera state must snap. */
  sample(map: RaceMap, race: RaceSnapshot, player: RacePlayer, predictedTick: number,
    pending: readonly PredictedInput[], nowMs: number): LocalMovementSample {
    const presentationTick = Math.max(race.tick, predictedTick);
    const projection = race.phase === 'playing'
      ? projectMovement(map, player, race.tick, presentationTick, pending)
      : projectMovement(map, player, race.tick, race.tick, []);
    const { movement, point } = projection;
    const previous = this.previous;
    let discontinuity = previous === null;
    if (previous) {
      discontinuity ||= previous.race.matchId !== race.matchId
        || previous.race.mapId !== race.mapId || race.tick < previous.race.tick
        || previous.player.id !== player.id || previous.race.phase !== race.phase
        || previous.race.shrinkStage !== race.shrinkStage
        || player.connected !== previous.player.connected
        || player.eliminatedAtTick !== previous.player.eliminatedAtTick
        || (player.deathMs > 0) !== (previous.player.deathMs > 0)
        || player.protectionMs > previous.player.protectionMs || nowMs - previous.nowMs > 250
        || nowMs < previous.nowMs
        || Math.hypot(point.x - previous.projection.point.x,
          point.y - previous.projection.point.y) > 2;
    }
    if (!previous || discontinuity || !player.connected
      || player.eliminatedAtTick !== null || player.deathMs > 0) {
      this.offset = { x: 0, y: 0 };
    }
    else {
      const decay = Math.exp(-Math.max(0, nowMs - previous.nowMs) / 80);
      this.offset.x *= decay; this.offset.y *= decay;
      if (movementAxis(map, previous.projection.movement) !== movementAxis(map, movement)) {
        this.offset = { x: 0, y: 0 };
      }
      if (completedPortal(map, previous.projection.movement, movement)) {
        this.offset = { x: 0, y: 0 };
        discontinuity = true;
      }
      if (previous.race !== race) {
        const reconciliationTick = Math.max(previous.tick, presentationTick,
          previous.race.tick, race.tick);
        const oldProjection = projectMovement(map, previous.player, previous.race.tick,
          reconciliationTick, pending);
        const newProjection = projectMovement(map, player, race.tick,
          reconciliationTick, pending);
        const correction = safeCorrection(map, oldProjection, newProjection);
        const correctionSize = Math.hypot(oldProjection.point.x - newProjection.point.x,
          oldProjection.point.y - newProjection.point.y);
        if (!oldProjection.complete || !newProjection.complete) {
          this.offset = { x: 0, y: 0 };
          discontinuity = true;
        } else if (correction) {
          this.offset.x += correction.x;
          this.offset.y += correction.y;
        } else {
          this.offset = { x: 0, y: 0 };
          // A small corner correction must stay on the corridor, but should not
          // discard the camera's follow lag and jerk the entire maze into place.
          const portalCorrection = movementEdge(map, oldProjection.movement)?.portal
            || movementEdge(map, newProjection.movement)?.portal;
          if (correctionSize > 1 || portalCorrection && correctionSize > POSITION_EPSILON) {
            discontinuity = true;
          }
        }
        if (Math.hypot(this.offset.x, this.offset.y) > 1) {
          this.offset = { x: 0, y: 0 };
          discontinuity = true;
        }
      }
    }
    const presentedPoint = correctedPoint(map, movement, point, this.offset);
    if (presentedPoint) {
      this.offset.x = presentedPoint.x - point.x;
      this.offset.y = presentedPoint.y - point.y;
    } else {
      this.offset = { x: 0, y: 0 };
    }
    this.previous = { race, player, tick: presentationTick, projection, nowMs };
    return { movement, point: presentedPoint ?? point, discontinuity };
  }
}

/** Interpolates one remote actor between ordered authoritative snapshots. */
export function interpolateRemotePosition(history: readonly RaceSnapshot[], targetTick: number,
  id: string, enemy: boolean, map: RaceMap): { x: number; y: number } | null {
  let before = history[0], after = history[history.length - 1];
  for (const snapshot of history) {
    if (snapshot.tick <= targetTick) before = snapshot;
    if (snapshot.tick >= targetTick) { after = snapshot; break; }
  }
  if (!before || !after) return null;
  const getMovement = (snapshot: RaceSnapshot): Movement | undefined => enemy
    ? snapshot.enemies.find((candidate) => candidate.id === id)?.movement
    : snapshot.players.find((candidate) => candidate.id === id)?.movement;
  const firstMovement = getMovement(before), secondMovement = getMovement(after);
  if (!firstMovement || !secondMovement) return null;
  const first = position(map, firstMovement), second = position(map, secondMovement);
  if (before.shrinkStage !== after.shrinkStage) return second;
  if (Math.hypot(second.x - first.x, second.y - first.y) > 2) return second;
  const alpha = before.tick === after.tick ? 1
    : Math.min(1, Math.max(0, (targetTick - before.tick) / (after.tick - before.tick)));
  return { x: first.x + (second.x - first.x) * alpha,
    y: first.y + (second.y - first.y) * alpha };
}
