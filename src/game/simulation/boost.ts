import { move, type MovementTeleport } from './movement';
import { RACE, type BoostAction, type RaceMap, type RacePlayer, type ScheduledInput } from './types';

export const BOOST = { speedMultiplier: 2, minimumTicks: 7.5, ticksPerPoint: 1.5 } as const;
const EPSILON = 1e-9;

/** Cancels a burst without discarding the unpaid fraction of an already used score point. */
export function cancelBoost(player: RacePlayer): void {
  player.boosting = false;
  player.boostHeld = false;
  player.boostTicks = 0;
}

/** Applies physical press/release edges; exhaustion requires release before another funded press. */
export function applyBoostAction(player: RacePlayer, action: BoostAction): void {
  if (action === 'cancel') cancelBoost(player);
  else if (action === 'release') player.boostHeld = false;
  else if (!player.boostHeld) {
    player.boostHeld = true;
    if (player.score > 0) {
      player.boosting = true;
      player.boostTicks = BOOST.minimumTicks;
    }
  }
}

/** Consumes ordered edges, retaining the final direction while preserving same-tick boost taps. */
export function applyScheduledInput(player: RacePlayer, inputs: readonly ScheduledInput[], tick: number): void {
  const due = inputs.filter((input) => input.targetTick <= tick && input.sequence > player.acknowledgedInput)
    .sort((left, right) => left.sequence - right.sequence);
  for (const input of due) {
    if (input.direction !== undefined) player.movement.queued = input.direction;
    if (input.boost !== undefined) applyBoostAction(player, input.boost);
    player.acknowledgedInput = input.sequence;
  }
}

/** Moves once per step, ages the burst in elapsed ticks, and charges only actual boosted travel; portal fractions remain elapsed-time fractions. */
export function advanceBoost(map: RaceMap, player: RacePlayer, ticks = 1, movementLocked = false,
  onTeleport?: (_motion: MovementTeleport) => void): void {
  if (player.score <= 0 || !player.boostHeld && player.boostTicks <= EPSILON) {
    player.boosting = false;
    player.boostTicks = 0;
  }
  const boostedTicks = player.boosting ? Math.min(ticks, player.boostHeld ? ticks : player.boostTicks,
    Math.max(0, player.score * BOOST.ticksPerPoint - player.boostCostTicks)) : 0;
  const baseDistance = RACE.playerSpeed * RACE.stepMs / 1000;
  const boostDistance = baseDistance * BOOST.speedMultiplier * boostedTicks;
  const distance = boostDistance + baseDistance * (ticks - boostedTicks);
  const traveled = movementLocked ? 0 : move(map, player.movement, distance, true, undefined,
    onTeleport ? (motion) => {
      const travel = motion.fraction * distance;
      const elapsed = travel <= boostDistance ? travel / (baseDistance * BOOST.speedMultiplier)
        : boostedTicks + (travel - boostDistance) / baseDistance;
      onTeleport({ ...motion, fraction: elapsed / ticks });
    } : undefined);
  const costTicks = player.boostCostTicks + Math.min(boostedTicks, traveled / (baseDistance * BOOST.speedMultiplier));
  const points = Math.min(player.score, Math.floor((costTicks + EPSILON) / BOOST.ticksPerPoint));
  player.score -= points;
  player.boostCostTicks = Math.max(0, costTicks - points * BOOST.ticksPerPoint);
  player.boostTicks = Math.max(0, player.boostTicks - ticks);
  if (player.score === 0 || !player.boostHeld && player.boostTicks <= EPSILON) {
    player.boosting = false;
    player.boostTicks = 0;
  }
}
