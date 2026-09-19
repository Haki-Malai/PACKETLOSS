import { ENEMY_CONFIG, SPEED } from '../../config/constants';
import type { EnemyEntity, EnemyKey } from '../domain/entities/EnemyEntity';
import { MovementRules } from '../domain/services/MovementRules';
import type { Direction } from '../domain/valueObjects/Direction';
import type { TilePosition } from '../domain/valueObjects/TilePosition';
import type { WorldState } from '../domain/world/WorldState';
import { ENEMY_EAT_DURATION_MS } from '../shared/enemyEating';
import type { CollectiblePoint, CollectibleSystem } from '../systems/CollectibleSystem';
import { getTutorialLesson, type TutorialLessonId, type TutorialPhase, type TutorialSnapshot } from './TutorialLesson';

const TARGETS: Record<TutorialLessonId, TilePosition | null> = {
  movement: { x: 11, y: 3 }, firewall: { x: 1, y: 2 }, power: { x: 2, y: 6 },
  virus: { x: 11, y: 11 }, ping: { x: 10, y: 11 }, spam: { x: 11, y: 1 }, lag: { x: 2, y: 5 },
};

const MOVEMENT_DATA_TILES: readonly TilePosition[] = [
  { x: 1, y: 1 }, { x: 1, y: 11 }, { x: 6, y: 5 }, { x: 11, y: 3 },
];

const AUTO_START_DIRECTIONS: Record<TutorialLessonId, Direction> = {
  movement: 'right', firewall: 'left', virus: 'right', ping: 'right', spam: 'right', lag: 'right',
  power: 'left',
};

function sameTile(a: Readonly<TilePosition>, b: Readonly<TilePosition>): boolean {
  return a.x === b.x && a.y === b.y;
}

function point(world: WorldState, tile: TilePosition, kind: CollectiblePoint['kind']): CollectiblePoint {
  return { tile: { ...tile }, x: (tile.x + 0.5) * world.tileSize, y: (tile.y + 0.5) * world.tileSize, kind };
}

function placePacket(world: WorldState, movement: MovementRules, tile: TilePosition): void {
  movement.setEntityTile(world.packet, tile);
  world.packet.direction = { current: 'up', next: 'up' };
}

/** Resets the shared demo world into a deterministic lesson and returns its authored pickups. */
export function prepareTutorialWorld(
  lesson: TutorialLessonId,
  world: WorldState,
  movement: MovementRules,
): readonly CollectiblePoint[] {
  const spawn = { x: 6, y: 7 };
  placePacket(world, movement, spawn);
  const autoStartDirection = AUTO_START_DIRECTIONS[lesson];
  world.packet.direction = { current: autoStartDirection, next: autoStartDirection };
  Object.assign(world.packetSpawnTile, spawn);
  world.enemies.forEach((enemy) => {
    enemy.active = false;
    enemy.state = { free: false, soonFree: false, scared: false, dead: false, animation: 'default' };
    enemy.speed = enemy.baseSpeed;
    enemy.eatenElapsedMs = null;
    enemy.resetAbilities();
  });
  world.lagZones = [];
  world.enemyEffects = [];
  world.enemyScaredTimers.clear();
  world.enemyScaredWarnings.clear();
  world.enemiesExitingJail.clear();
  world.enemyEatChainCount = 0;

  const activate = (
    key: EnemyKey,
    tile: TilePosition,
    direction: Direction = 'right',
  ): void => {
    const enemy = world.enemies.find((candidate) => !candidate.isCopy && candidate.key === key);
    if (!enemy) return;
    movement.setEntityTile(enemy, tile);
    enemy.active = true;
    enemy.state.free = true;
    enemy.direction = direction;
  };
  if (lesson === 'firewall') {
    activate('firewall', { x: 11, y: 1 }, 'down');
  } else if (lesson === 'virus') {
    activate('virus', { x: 1, y: 1 });
  } else if (lesson === 'ping' || lesson === 'spam') {
    activate(lesson, { x: 10, y: 5 });
  } else if (lesson === 'power') {
    activate('firewall', { x: 11, y: 1 }, 'down');
  } else if (lesson === 'lag') {
    activate('lag', { x: 2, y: 5 });
  }

  if (lesson === 'movement') {
    return MOVEMENT_DATA_TILES.map((tile) => point(world, tile, 'base'));
  }
  const target = TARGETS[lesson];
  return target && ['firewall', 'power', 'virus', 'ping', 'spam'].includes(lesson)
    ? [point(world, target, lesson === 'power' ? 'power' : 'base')]
    : [];
}

export class TutorialController {
  private snapshot: TutorialSnapshot;
  private before = { x: 0, y: 0, zone: false };
  private movedRight = false;
  private turnedUp = false;
  private collected = false;
  private witnessed = false;
  private crossedSlowly = false;
  private lagZone: TilePosition | null = null;
  private readonly targetPoint: CollectiblePoint | undefined;
  private readonly enemyCenters = new Set<string>();

  constructor(
    private readonly lesson: TutorialLessonId,
    private readonly world: WorldState,
    private readonly movement: MovementRules,
    private readonly collectibles: CollectibleSystem,
  ) {
    const definition = getTutorialLesson(lesson);
    this.snapshot = this.createSnapshot('introduction', definition.introduction, definition.objective, TARGETS[lesson]);
    const target = TARGETS[lesson];
    this.targetPoint = target
      ? Array.from(collectibles.getPoints()).find((entry) => sameTile(entry.tile, target))
      : undefined;
    const enemy = this.enemy(lesson === 'power' ? 'firewall' : lesson);
    if (enemy) this.enemyCenters.add(`${enemy.tile.x},${enemy.tile.y}`);
  }

  getSnapshot(): TutorialSnapshot {
    return this.snapshot;
  }

  /** Returns every cyan floor marker that should be visible for the current lesson state. */
  getMarkerTiles(): readonly Readonly<TilePosition>[] {
    if (this.lesson === 'movement') {
      return Array.from(this.collectibles.getPoints(), (entry) => entry.tile);
    }
    return this.snapshot.marker ? [this.snapshot.marker] : [];
  }

  /** Resumes a nonterminal checkpoint without relocating its preserved practice state. */
  resume(): boolean {
    if (this.snapshot.phase === 'success' || this.snapshot.phase === 'retry') return false;
    if (this.snapshot.phase === 'playing') return true;
    this.setPhase('playing', this.snapshot.message);
    return true;
  }

  /** Captures Packet movement and Lag-zone occupancy before simulation systems advance. */
  beforeUpdate(): void {
    const packet = this.world.packet;
    const occupied = { x: Math.floor(packet.x / this.world.tileSize), y: Math.floor(packet.y / this.world.tileSize) };
    this.before = {
      x: packet.x, y: packet.y,
      zone: this.world.lagZones.some((zone) => zone.ageMs < zone.durationMs && sameTile(zone.tile, occupied)),
    };
  }

  /** Evaluates the active lesson after one simulation update. */
  update(_deltaMs: number): void {
    if (this.snapshot.phase !== 'playing' || !this.world.isMoving) return;
    if (this.world.packet.deathAnimationRemainingMs > 0 || this.world.outcome === 'lost') {
      this.setPhase('retry', 'That contact would cost a life. Retry this checkpoint as often as you need.');
      return;
    }
    if (!this.witnessed && (this.lesson === 'ping' || this.lesson === 'spam' || this.lesson === 'lag')) {
      const enemy = this.enemy(this.lesson);
      if (enemy && (!enemy.active || !enemy.state.free || enemy.state.dead)) {
        this.setPhase('retry', 'The enemy was eaten before demonstrating its ability. Retry to see it in action.');
        return;
      }
    }

    const packet = this.world.packet;
    const dx = packet.x - this.before.x;
    const dy = packet.y - this.before.y;
    if (dx > 0 && dy === 0 && packet.portalBlinkRemainingMs === 0) this.movedRight = true;
    if (this.movedRight && dy < 0 && dx === 0) this.turnedUp = true;
    const target = this.targetPoint?.tile;
    const consumed = target && !Array.from(this.collectibles.getPoints()).some((entry) => sameTile(entry.tile, target));
    const firstCollection = !!consumed && !this.collected;
    if (consumed) this.collected = true;

    if (this.lesson === 'movement') {
      if (firstCollection && !this.turnedUp) {
        this.setPhase('retry', 'You found the data bit. Retry and reach it by moving right, then turning up at the far corner.');
      } else if (this.turnedUp && this.collectibles.getPointCount() === 0) {
        this.setPhase('success', 'All four data bits recovered. Data bits are worth 10 points.');
      }
    } else if (this.lesson === 'firewall' || this.lesson === 'virus') {
      this.observeEnemyTravel(this.enemy(this.lesson));
      if (this.collected && this.enemyCenters.size >= (this.lesson === 'firewall' ? 3 : 2)) {
        this.setPhase('success', this.lesson === 'firewall'
          ? 'You stayed clear of Firewall’s patrol. Watch its route to find a safe opening.'
          : 'You kept moving while Virus chased your position. It can also take portal shortcuts.');
      }
    } else if (this.lesson === 'power') {
      this.updatePower(firstCollection);
    } else if (this.lesson === 'ping' || this.lesson === 'spam') {
      this.updateEnemyAbility();
    } else if (this.lesson === 'lag') {
      this.updateLag(dx, dy);
    }
  }

  /** Tracks the powered Firewall target through capture, expiry, and completed intake. */
  private updatePower(firstCollection: boolean): void {
    const enemy = this.enemy('firewall');
    if (firstCollection && enemy?.state.dead) {
      this.setPhase('retry', 'Collect the power core before catching Firewall. Retry to practice that order.');
    } else if (firstCollection && enemy?.state.scared) {
      this.setPhase('playing', this.snapshot.message, this.snapshot.objective, enemy.tile);
    } else if (this.collected && enemy?.state.dead && (enemy.eatenElapsedMs ?? 0) >= ENEMY_EAT_DURATION_MS) {
      this.setPhase('success', 'You ate Firewall for 200 points. Its harmless bug returns to the pen; flashing warns when power is ending.');
    } else if (this.collected && enemy && !enemy.state.scared && !enemy.state.dead) {
      this.setPhase('retry', 'Power wore off before you caught Firewall. Retry the checkpoint for another power core.');
    } else if (this.collected && enemy?.state.scared) {
      this.followEnemy('firewall');
    }
  }

  /** Handles the staged Ping scan or Spam split and its follow-up destination. */
  private updateEnemyAbility(): void {
    if (!this.witnessed) {
      const effect = this.world.enemyEffects.find((entry) => this.lesson === 'ping'
        ? entry.kind === 'ping' && entry.target : entry.kind === 'split');
      const copyCreated = this.world.enemies.some((enemy) => enemy.isCopy && enemy.active);
      if (!effect || (this.lesson === 'spam' && !copyCreated)) {
        this.followEnemy(this.lesson);
        return;
      }
      this.witnessed = true;
      const marker = this.targetPoint?.tile ?? null;
      this.setPhase('explanation', this.lesson === 'ping'
        ? 'The green marker is the position Ping remembers. Move away; it keeps chasing that old position until its next scan.'
        : 'A smaller Spam copy has appeared. Copies can reproduce too, up to four Spam. Stay clear of both bodies.',
      'Recover the marked data bit.', marker);
      return;
    }
    if (this.collected) {
      this.setPhase('success', this.lesson === 'ping'
        ? 'You moved away from Ping’s last scan and recovered the data bit. Walls cannot hide you from its next pulse.'
        : 'You stayed clear of the growing crowd and recovered the data bit. Power cores stop further splitting.');
    }
  }

  private updateLag(dx: number, dy: number): void {
    if (!this.witnessed) {
      const zone = this.world.lagZones.find((entry) => entry.ageMs === 0);
      if (!zone) {
        this.followEnemy('lag');
        return;
      }
      if (!sameTile(zone.tile, { x: 4, y: 5 })) {
        this.setPhase('retry', 'Lag left a different zone. Retry to reset this guided crossing.');
        return;
      }
      this.witnessed = true;
      this.lagZone = { ...zone.tile };
      this.setPhase('explanation', 'That yellow zone is real: it lasts four seconds and halves your speed. Find a route back and cross it before it disappears.',
        'Navigate through the yellow zone to the marked square.', { x: 5, y: 5 });
      return;
    }
    const zone = this.world.lagZones.find((entry) => this.lagZone && sameTile(entry.tile, this.lagZone));
    const distance = Math.hypot(dx, dy);
    if (zone && this.before.zone && distance > 0 && distance <= SPEED.packet * ENEMY_CONFIG.lag.slowMultiplier) {
      this.crossedSlowly = true;
    }
    if (this.crossedSlowly && this.atMarker()) {
      this.setPhase('success', 'You crossed the zone at half speed without losing a life. Overlapping zones do not slow you further.');
    } else if (!zone) {
      this.setPhase('retry', 'The zone expired before you crossed it. Retry to make a fresh zone.');
    }
  }

  private enemy(key: string): EnemyEntity | undefined {
    return this.world.enemies.find((enemy) => !enemy.isCopy && enemy.key === key);
  }

  private followEnemy(key: string): void {
    const enemy = this.enemy(key);
    if (enemy && (!this.snapshot.marker || !sameTile(enemy.tile, this.snapshot.marker))) {
      this.setPhase('playing', this.snapshot.message, this.snapshot.objective, enemy.tile);
    }
  }

  private observeEnemyTravel(enemy: EnemyEntity | undefined): void {
    if (enemy && enemy.moved.x === 0 && enemy.moved.y === 0) this.enemyCenters.add(`${enemy.tile.x},${enemy.tile.y}`);
  }

  private atMarker(): boolean {
    return !!this.snapshot.marker && sameTile(this.world.packet.tile, this.snapshot.marker)
      && this.world.packet.moved.x === 0 && this.world.packet.moved.y === 0;
  }

  private setPhase(phase: TutorialPhase, message: string, objective = this.snapshot.objective, marker = this.snapshot.marker): void {
    this.snapshot = this.createSnapshot(phase, message, objective, marker);
  }

  private createSnapshot(phase: TutorialPhase, message: string, objective: string, marker: Readonly<TilePosition> | null): TutorialSnapshot {
    return Object.freeze({ lesson: this.lesson, phase, objective, message, marker: marker ? Object.freeze({ ...marker }) : null });
  }
}
