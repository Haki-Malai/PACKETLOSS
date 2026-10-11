import { clonePowerupCombatState } from './PowerupCombat';
import type { RaceSnapshot } from './types';

/** Copies all mutable simulation state without a browser or Node global. */
export function cloneSnapshot(state: RaceSnapshot): RaceSnapshot {
  return { ...state, players: state.players.map((player) => ({ ...player, movement: { ...player.movement },
      deathPosition: player.deathPosition ? { ...player.deathPosition } : null })),
    enemies: state.enemies.map((enemy) => ({ ...enemy, movement: { ...enemy.movement }, patrol: [...enemy.patrol] })),
    combat: clonePowerupCombatState(state.combat),
    pickups: state.pickups.map((pickup) => ({ ...pickup })), rankings: state.rankings.map((ranking) => ({ ...ranking })) };
}
