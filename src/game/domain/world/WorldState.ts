import { EnemyEntity } from '../entities/EnemyEntity';
import { PacketEntity } from '../entities/PacketEntity';
import { MovementProgress } from '../valueObjects/MovementProgress';
import { TilePosition } from '../valueObjects/TilePosition';
import { CollisionGrid, CollisionTile } from './CollisionGrid';
import type { WallConnection } from './MazeFootprint';
import type { RunMode } from '../../app/contracts';

export interface WorldProperty {
  name: string;
  type?: string;
  value: unknown;
}

export interface WorldObject {
  id?: number;
  name?: string;
  type?: string;
  visible?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  properties?: WorldProperty[];
}

export interface WorldTile {
  x: number;
  y: number;
  rawGid: number;
  gid: number | null;
  localId: number | null;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  collision: CollisionTile;
}

export interface PortalPair {
  from: TilePosition;
  to: TilePosition;
}

export interface WorldMapData {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  widthInPixels: number;
  heightInPixels: number;
  tiles: WorldTile[][];
  collisionByGid: Map<number, CollisionTile>;
  portalPairs?: PortalPair[];
  spawnObjects: WorldObject[];
  collectibleObjects?: WorldObject[];
  packetSpawn?: WorldObject;
  enemyHome?: WorldObject;
  topologyRevision?: number;
}

export type AnimationKey = 'scaredIdle' | `${EnemyEntity['key']}Idle`;

export interface LagZone {
  readonly tile: Readonly<TilePosition>;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly ageMs: number;
  readonly durationMs: number;
}

export interface EnemyEffect {
  readonly kind: 'ping' | 'split' | 'quarantine' | 'trojan';
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly ageMs: number;
  readonly durationMs: number;
  readonly target?: { readonly x: number; readonly y: number };
}

export interface QuarantineWall extends WallConnection {
  readonly source: { readonly x: number; readonly y: number };
  readonly ageMs: number;
  readonly durationMs: number;
}

export interface AnimationPlayback {
  key: AnimationKey;
  frame: number;
  elapsedMs: number;
  forward: 1 | -1;
}

export interface EnemyScaredWarningVisualState {
  elapsedMs: number;
  nextToggleAtMs: number;
  showBaseColor: boolean;
}

export interface PacketAnimationPlayback {
  frame: number;
  elapsedMs: number;
  sequenceIndex: number;
  active: boolean;
}

export interface EnemyJailBounds {
  minX: number;
  maxX: number;
  y: number;
}

export interface ScreenPointerState {
  x: number;
  y: number;
}

export interface MovableEntity {
  x: number;
  y: number;
  moved: MovementProgress;
  tile: TilePosition;
}

export class WorldState {
  runMode: RunMode = 'classic';
  powerRemainingMs = 0;
  readonly map: WorldMapData;
  readonly tileSize: number;
  readonly collisionGrid: CollisionGrid;
  readonly packetSpawnTile: TilePosition;
  packet: PacketEntity;
  enemies: EnemyEntity[];
  lagZones: LagZone[] = [];
  enemyEffects: EnemyEffect[] = [];
  quarantineWalls: QuarantineWall[] = [];
  readonly visitedPacketTiles = new Map<string, Readonly<TilePosition>>();
  enemyScaredTimers = new Map<EnemyEntity, number>();
  enemyScaredWarnings = new Map<EnemyEntity, EnemyScaredWarningVisualState>();
  enemyJailBounds: EnemyJailBounds;
  readonly enemyJailReturnTile: TilePosition;
  enemyEatChainCount = 0;
  enemiesExitingJail = new Set<EnemyEntity>();
  enemyAnimations = new Map<EnemyEntity, AnimationPlayback>();
  packetAnimation: PacketAnimationPlayback = {
    frame: 0,
    elapsedMs: 0,
    sequenceIndex: 0,
    active: false,
  };
  isMoving = true;
  debugFrozen = false;
  debugPowerOverrideEnabled = false;
  levelMultiplier = 1;
  scoreBonusMultiplier = 1;
  outcome: 'lost' | 'cleared' | null = null;
  collisionDebugEnabled = false;
  hoveredDebugTile: TilePosition | null = null;
  pointerScreen: ScreenPointerState | null = null;
  debugPanelText = '';
  tick = 0;

  constructor(params: {
    map: WorldMapData;
    tileSize: number;
    collisionGrid: CollisionGrid;
    packetSpawnTile: TilePosition;
    packet: PacketEntity;
    enemies: EnemyEntity[];
    enemyJailBounds: EnemyJailBounds;
  }) {
    this.map = params.map;
    this.tileSize = params.tileSize;
    this.collisionGrid = params.collisionGrid;
    this.packetSpawnTile = { ...params.packetSpawnTile };
    this.packet = params.packet;
    this.enemies = params.enemies;
    this.enemyJailBounds = params.enemyJailBounds;
    this.enemyJailReturnTile = {
      x: params.enemyJailBounds.minX + Math.floor((params.enemyJailBounds.maxX - params.enemyJailBounds.minX) / 2),
      y: params.enemyJailBounds.y,
    };
  }

  nextTick(): number {
    this.tick += 1;
    return this.tick;
  }

  /** Records only the tile physically occupied after Packet movement, including portal arrivals. */
  recordPacketVisit(): void {
    const tile = { x: Math.floor(this.packet.x / this.tileSize), y: Math.floor(this.packet.y / this.tileSize) };
    this.visitedPacketTiles.set(`${tile.x},${tile.y}`, tile);
  }

  /** Removes Quarantine geometry records and their collision overlay together. */
  clearQuarantineWalls(): void {
    this.quarantineWalls = [];
    this.collisionGrid.setTemporaryEdges([]);
  }
}
