import { Direction } from '../valueObjects/Direction';
import { MovementProgress } from '../valueObjects/MovementProgress';
import { TilePosition } from '../valueObjects/TilePosition';
import { RenderableEntity } from './PacketEntity';

export type EnemyAnimationState = 'default' | 'scared';

export const ENEMY_KEYS = ['firewall', 'virus', 'ping', 'spam', 'lag', 'quarantine', 'trojan'] as const;
export type EnemyArchetype = typeof ENEMY_KEYS[number];
export type EnemyKey = EnemyArchetype;

export interface EnemyState {
  free: boolean;
  soonFree: boolean;
  scared: boolean;
  dead: boolean;
  animation: EnemyAnimationState;
}

export class EnemyEntity implements RenderableEntity {
  x = 0;
  y = 0;
  displayWidth: number;
  displayHeight: number;
  angle = 0;
  flipX = false;
  flipY = false;
  depth = 2;
  active = true;
  moved: MovementProgress = { x: 0, y: 0 };
  key: EnemyKey;
  state: EnemyState;
  direction: Direction;
  speed: number;
  readonly baseSpeed: number;
  readonly isCopy: boolean;
  tile: TilePosition;
  abilityRemainingMs: number | null = null;
  pingTarget: TilePosition | null = null;
  ambushTarget: TilePosition | null = null;
  lastLagTile: TilePosition | null = null;
  eatenElapsedMs: number | null = null;
  disguised = false;
  disguiseRemainingMs = 0;
  revealRemainingMs = 0;

  constructor(params: {
    key: EnemyKey;
    tile: TilePosition;
    direction: Direction;
    speed: number;
    displayWidth: number;
    displayHeight: number;
    isCopy?: boolean;
  }) {
    this.key = params.key;
    this.direction = params.direction;
    this.speed = params.speed;
    this.baseSpeed = params.speed;
    this.isCopy = params.isCopy ?? false;
    this.active = !this.isCopy;
    this.tile = { ...params.tile };
    this.displayWidth = params.displayWidth;
    this.displayHeight = params.displayHeight;
    this.state = {
      free: false,
      soonFree: !this.isCopy,
      scared: false,
      dead: false,
      animation: 'default',
    };
  }

  /** Clears cooldowns, saved targets, and any Trojan approach, disguise, or reveal state. */
  resetAbilities(): void {
    this.abilityRemainingMs = null;
    this.pingTarget = null;
    this.ambushTarget = null;
    this.lastLagTile = null;
    this.disguised = false;
    this.disguiseRemainingMs = 0;
    this.revealRemainingMs = 0;
  }
}
