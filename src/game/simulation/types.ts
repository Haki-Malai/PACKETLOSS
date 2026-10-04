import { MODE_RULES } from './modes';
import { ENEMY_EAT_CHAIN_SCORES, ENEMY_SCARED_DURATION_MS, PACKET_DEATH_ANIMATION,
  PACKET_DEATH_RECOVERY, SPEED, TILE_SIZE } from '../../config/constants';
import { MOVEMENT_STEP_MS, MOVEMENT_STEPS_PER_SECOND } from '../domain/services/MovementRules';
import { ENEMY_EAT_DURATION_MS } from '../shared/enemyEating';

import type { Direction } from '../domain/valueObjects/Direction';
export { CLOCKWISE_DIRECTIONS as DIRECTIONS, type Direction } from '../domain/valueObjects/Direction';
export interface Edge { to: number; direction: Direction; portal?: boolean }
export interface Cell { x: number; y: number; edges: Edge[] }
export interface Pickup { id: number; cell: number; kind: 'bit' | 'core' }
export interface RaceMap {
  id: string;
  width: number;
  height: number;
  cells: Cell[];
  spawns: number[];
  enemyHome: number;
  pickups: Pickup[];
}
export interface Movement {
  cell: number;
  to: number | null;
  progress: number;
  direction: Direction;
  queued: Direction;
}
export interface RacePlayer {
  id: string;
  name: string;
  color: string;
  slot: number;
  connected: boolean;
  score: number;
  movement: Movement;
  huntMs: number;
  protectionMs: number;
  portalBlinkMs?: number;
  deathMs: number;
  chain: number;
  acknowledgedInput: number;
}
export interface RaceEnemy {
  id: 'firewall' | 'virus';
  movement: Movement;
  phase: 'pen' | 'active' | 'eaten' | 'returning';
  waitMs: number;
  patrol: number[];
  patrolIndex: number;
}
export interface Ranking { playerId: string; name: string; score: number; rank: number }
export interface RaceSnapshot {
  matchId: string;
  mapId: string;
  tick: number;
  playTicks: number;
  phase: 'countdown' | 'playing' | 'finished' | 'aborted';
  players: RacePlayer[];
  enemies: RaceEnemy[];
  pickups: Pickup[];
  refill: number;
  randomState: number;
  rankings: Ranking[];
  abortReason: string | null;
}
export interface PlayerIdentity { id: string; name: string; color?: string }
export const RACE = {
  stepMs: MOVEMENT_STEP_MS,
  countdownTicks: 0,
  matchTicks: MODE_RULES['data-race'].durationMs! / 1000 * 60,
  playerSpeed: SPEED.packet * MOVEMENT_STEPS_PER_SECOND / TILE_SIZE,
  huntingMs: ENEMY_SCARED_DURATION_MS,
  deathMs: PACKET_DEATH_ANIMATION.durationMs,
  protectionMs: PACKET_DEATH_RECOVERY.durationMs,
  enemyCollapseMs: ENEMY_EAT_DURATION_MS,
  colors: ['#38bdf8', '#fb7185', '#a3e635', '#c084fc'],
  chain: ENEMY_EAT_CHAIN_SCORES,
} as const;
