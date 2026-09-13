import { Direction } from '../valueObjects/Direction';
import { MovementProgress } from '../valueObjects/MovementProgress';
import { TilePosition } from '../valueObjects/TilePosition';
import { RenderableEntity } from './PacketEntity';

export type GhostAnimationState = 'default' | 'scared';

export type EnemyArchetype = 'firewall' | 'virus' | 'ping' | 'spam' | 'lag';
export type GhostKey = EnemyArchetype;

export interface GhostState {
  free: boolean;
  soonFree: boolean;
  scared: boolean;
  dead: boolean;
  animation: GhostAnimationState;
}

export class GhostEntity implements RenderableEntity {
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
  key: GhostKey;
  state: GhostState;
  direction: Direction;
  speed: number;
  readonly baseSpeed: number;
  readonly isCopy: boolean;
  tile: TilePosition;
  abilityRemainingMs: number | null = null;
  pingTarget: TilePosition | null = null;
  lastLagTile: TilePosition | null = null;
  eatenElapsedMs: number | null = null;

  constructor(params: {
    key: GhostKey;
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

  resetAbilities(): void {
    this.abilityRemainingMs = null;
    this.pingTarget = null;
    this.lastLagTile = null;
  }
}
