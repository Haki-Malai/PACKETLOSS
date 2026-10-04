import type { RaceSnapshot } from './types';

/** Copies all mutable simulation state without a browser or Node global. */
export function cloneSnapshot(state: RaceSnapshot): RaceSnapshot {
  return { ...state, players: state.players.map((player) => ({ ...player, movement: { ...player.movement } })),
    enemies: state.enemies.map((enemy) => ({ ...enemy, movement: { ...enemy.movement }, patrol: [...enemy.patrol] })),
    pickups: state.pickups.map((pickup) => ({ ...pickup })), rankings: state.rankings.map((ranking) => ({ ...ranking })) };
}
