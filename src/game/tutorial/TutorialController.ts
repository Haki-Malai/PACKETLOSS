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
  movement: { x: 11, y: 5 }, firewall: { x: 8, y: 7 }, portal: { x: 1, y: 7 },
  power: { x: 7, y: 7 }, virus: { x: 4, y: 7 }, ping: { x: 10, y: 5 }, spam: { x: 10, y: 5 }, lag: { x: 2, y: 5 },
  suppression: { x: 4, y: 5 },
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

export function prepareTutorialWorld(
  lesson: TutorialLessonId,
  world: WorldState,
  movement: MovementRules,
): readonly CollectiblePoint[] {
  const spawn = lesson === 'portal' ? { x: 2, y: 7 }
    : lesson === 'suppression' ? { x: 3, y: 5 } : { x: 6, y: 7 };
  placePacket(world, movement, spawn);
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

  const activate = (key: EnemyKey, tile: TilePosition, direction: Direction = 'right'): void => {
    const enemy = world.enemies.find((candidate) => !candidate.isCopy && candidate.key === key);
    if (!enemy) return;
    movement.setEntityTile(enemy, tile);
    enemy.active = true;
    enemy.state.free = true;
    enemy.direction = direction;
  };
  if (lesson === 'firewall' || lesson === 'virus' || lesson === 'ping' || lesson === 'spam') {
    activate(lesson, { x: 10, y: 5 });
  } else if (lesson === 'power') {
    activate('firewall', { x: 9, y: 7 }, 'left');
  } else if (lesson === 'lag') {
    activate('lag', { x: 2, y: 5 });
  } else if (lesson === 'suppression') {
    activate('ping', { x: 10, y: 5 });
    activate('spam', { x: 10, y: 9 }, 'left');
    activate('lag', { x: 5, y: 5 });
    const zone = point(world, { x: 4, y: 5 }, 'base');
    world.lagZones = [{
      tile: zone.tile, x: zone.x, y: zone.y, radius: world.tileSize * ENEMY_CONFIG.lag.radiusTiles,
      ageMs: 0, durationMs: ENEMY_CONFIG.lag.zoneDurationMs,
    }];
  }

  const target = TARGETS[lesson];
  return target && ['movement', 'firewall', 'power', 'virus', 'suppression'].includes(lesson)
    ? [point(world, target, lesson === 'power' || lesson === 'suppression' ? 'power' : 'base')]
    : [];
}

export class TutorialController {
  private snapshot: TutorialSnapshot;
  private before = { x: 0, y: 0, zone: false, zoneRemainingMs: 0 };
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
    this.targetPoint = Array.from(collectibles.getPoints()).find((entry) =>
      entry.kind === (lesson === 'power' || lesson === 'suppression' ? 'power' : 'base'));
    const enemy = this.enemy(lesson === 'power' ? 'firewall' : lesson);
    if (enemy) this.enemyCenters.add(`${enemy.tile.x},${enemy.tile.y}`);
  }

  getSnapshot(): TutorialSnapshot {
    return this.snapshot;
  }

  resume(): boolean {
    if (this.snapshot.phase === 'success' || this.snapshot.phase === 'retry') return false;
    if (this.snapshot.phase === 'playing') return true;
    if (this.lesson === 'lag' && this.snapshot.phase === 'explanation') {
      // Keep the zone made by the real ability system; stage a safe approach behind Lag.
      placePacket(this.world, this.movement, { x: 3, y: 5 });
      const lag = this.enemy('lag');
      if (lag) {
        this.movement.setEntityTile(lag, { x: 5, y: 5 });
        lag.direction = 'right';
      }
    }
    this.setPhase('playing', this.snapshot.message);
    return true;
  }

  beforeUpdate(): void {
    const packet = this.world.packet;
    const occupied = { x: Math.floor(packet.x / this.world.tileSize), y: Math.floor(packet.y / this.world.tileSize) };
    const requiredZone = this.world.lagZones.find((zone) => this.targetPoint && sameTile(zone.tile, this.targetPoint.tile));
    this.before = {
      x: packet.x, y: packet.y,
      zone: this.world.lagZones.some((zone) => zone.ageMs < zone.durationMs && sameTile(zone.tile, occupied)),
      zoneRemainingMs: requiredZone ? Math.max(0, requiredZone.durationMs - requiredZone.ageMs) : 0,
    };
  }

  update(deltaMs: number): void {
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
        this.setPhase('retry', 'You found the pellet. Retry and reach it by moving right, then turning up at the far corner.');
      } else if (this.collected && this.turnedUp && this.atMarker()) {
        this.setPhase('success', 'Corner turned, pellet collected. Regular pellets are worth 10 points.');
      }
    } else if (this.lesson === 'firewall' || this.lesson === 'virus') {
      this.observeEnemyTravel(this.enemy(this.lesson));
      if (this.collected && this.enemyCenters.size >= (this.lesson === 'firewall' ? 3 : 2)) {
        this.setPhase('success', this.lesson === 'firewall'
          ? 'You stayed clear of Firewall’s patrol. Watch its route to find a safe opening.'
          : 'You kept moving while Virus chased your position. It can also take portal shortcuts.');
      }
    } else if (this.lesson === 'portal') {
      if (packet.portalBlinkRemainingMs > 0 && sameTile(packet.tile, { x: 11, y: 7 })) {
        this.setPhase('success', 'You emerged from the linked portal. The blinking protects you briefly from dangerous contact.');
      }
    } else if (this.lesson === 'power') {
      this.updatePower(firstCollection);
    } else if (this.lesson === 'ping' || this.lesson === 'spam') {
      this.updateEnemyAbility();
    } else if (this.lesson === 'lag') {
      this.updateLag(dx, dy);
    } else if (this.lesson === 'suppression') {
      const suppressed = ['ping', 'spam', 'lag'].every((key) => this.enemy(key)?.state.scared);
      const requiredZoneActive = this.world.lagZones.some((zone) => this.targetPoint && sameTile(zone.tile, this.targetPoint.tile));
      if (firstCollection && this.before.zoneRemainingMs > deltaMs && suppressed && this.world.lagZones.length === 0) {
        this.setPhase('success', 'Zone cleared. Ping, Spam, and Lag cannot use their abilities while scared. You are ready to play.');
      } else if (!requiredZoneActive && (!this.collected || firstCollection)) {
        this.setPhase('retry', 'The zone expired before you collected power. Retry to see the pellet clear it.');
      }
    }
  }

  private updatePower(firstCollection: boolean): void {
    const enemy = this.enemy('firewall');
    if (firstCollection && enemy?.state.dead) {
      this.setPhase('retry', 'Collect the power pellet before catching Firewall. Retry to practice that order.');
    } else if (firstCollection && enemy?.state.scared) {
      this.setPhase('explanation', 'Firewall is scared and moves at half speed. Keep moving right to catch it before power fades.',
        'Catch the scared Firewall.', { x: 8, y: 7 });
    } else if (this.collected && enemy?.state.dead && (enemy.eatenElapsedMs ?? 0) >= ENEMY_EAT_DURATION_MS) {
      this.setPhase('success', 'You ate Firewall for 200 points. Its harmless bug returns to the pen; flashing warns when power is ending.');
    } else if (this.collected && enemy && !enemy.state.scared && !enemy.state.dead) {
      this.setPhase('retry', 'Power wore off before you caught Firewall. Retry the checkpoint for another power pellet.');
    }
  }

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
      const marker = { x: this.world.packet.tile.x <= 6 ? 8 : 4, y: 7 };
      this.setPhase('explanation', this.lesson === 'ping'
        ? 'The green marker is the position Ping remembers. Move away; it keeps chasing that old position until its next scan.'
        : 'A smaller Spam copy has appeared. Copies can reproduce too, up to four Spam. Stay clear of both bodies.',
      'Move to the marked square.', marker);
      return;
    }
    if (this.atMarker()) {
      this.setPhase('success', this.lesson === 'ping'
        ? 'You moved away from Ping’s last scan. Walls cannot hide you from its next pulse.'
        : 'You stayed clear of the growing crowd. Power pellets stop further splitting.');
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
      this.setPhase('explanation', 'That yellow zone is real: it lasts four seconds and halves your speed. Your next attempt starts just behind it, with Lag safely ahead.',
        'Move right through the yellow zone to the marked square.', { x: 5, y: 5 });
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
