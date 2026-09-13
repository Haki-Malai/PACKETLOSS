import { ENEMY_CONFIG } from '../../config/constants';
import { EnemyEntity } from '../domain/entities/EnemyEntity';
import { EnemyNavigationService } from '../domain/services/EnemyNavigationService';
import { isBodyOverlap } from '../domain/services/EnemyPacketCollisionService';
import { clearEnemyScaredWindow } from '../domain/services/EnemyScaredStateService';
import { MovementRules, toWorldPosition } from '../domain/services/MovementRules';
import { PortalService } from '../domain/services/PortalService';
import { WorldState } from '../domain/world/WorldState';
import { RandomSource } from '../shared/random/RandomSource';

export class EnemyAbilitySystem {
  private readonly navigation: EnemyNavigationService;

  constructor(
    private readonly world: WorldState,
    private readonly movementRules: MovementRules,
    portals: PortalService,
    private readonly rng: RandomSource,
  ) {
    this.navigation = new EnemyNavigationService(world.collisionGrid, world.tileSize, portals);
  }

  update(deltaMs: number): void {
    const elapsed = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
    this.world.enemyEffects = this.world.enemyEffects
      .map((effect) => ({ ...effect, ageMs: effect.ageMs + elapsed }))
      .filter((effect) => effect.ageMs < effect.durationMs);
    this.world.lagZones = this.world.lagZones
      .map((zone) => ({ ...zone, ageMs: zone.ageMs + elapsed }))
      .filter((zone) => zone.ageMs < zone.durationMs);

    // Snapshot eligible enemies so a newly activated copy cannot split in its birth update.
    const eligible = this.world.enemies.filter((enemy) => {
      if (!enemy.active || !enemy.state.free || enemy.state.scared || this.world.enemiesExitingJail.has(enemy)) {
        enemy.resetAbilities();
        return false;
      }
      return true;
    });
    for (const enemy of eligible) {
      if (enemy.key === 'lag' && !enemy.lastLagTile) enemy.lastLagTile = { ...enemy.tile };
      const interval = enemy.key === 'ping' ? ENEMY_CONFIG.ping.intervalMs
        : enemy.key === 'spam' ? ENEMY_CONFIG.spam.splitIntervalMs
          : enemy.key === 'lag' ? ENEMY_CONFIG.lag.dropIntervalMs : 0;
      if (interval === 0) continue;
      enemy.abilityRemainingMs = Math.max(0, (enemy.abilityRemainingMs ?? interval) - elapsed);
      if (enemy.abilityRemainingMs > 0) continue;
      if (enemy.key === 'ping') {
        this.ping(enemy);
        enemy.abilityRemainingMs = interval;
      } else if (enemy.moved.x === 0 && enemy.moved.y === 0) {
        if (enemy.key === 'spam') {
          enemy.abilityRemainingMs = this.split(enemy) ? interval : ENEMY_CONFIG.spam.retryMs;
        } else {
          this.dropLagZone(enemy);
          enemy.abilityRemainingMs = interval;
        }
      }
    }
  }

  private ping(enemy: EnemyEntity): void {
    const radius = ENEMY_CONFIG.ping.rangeTiles * this.world.tileSize;
    const packet = this.world.packet;
    const detected = Math.hypot(packet.x - enemy.x, packet.y - enemy.y) <= radius;
    if (detected) enemy.pingTarget = {
      x: Math.floor(packet.x / this.world.tileSize),
      y: Math.floor(packet.y / this.world.tileSize),
    };
    this.world.enemyEffects.push({
      kind: 'ping', x: enemy.x, y: enemy.y, radius, ageMs: 0,
      durationMs: ENEMY_CONFIG.ping.pulseDurationMs,
      ...(detected ? { target: { x: packet.x, y: packet.y } } : {}),
    });
  }

  private split(parent: EnemyEntity): boolean {
    const activeCount = this.world.enemies.filter((enemy) => enemy.active && enemy.key === 'spam').length;
    if (activeCount >= ENEMY_CONFIG.spam.maxCount) return false;
    const copy = this.world.enemies.find((enemy) => enemy.isCopy && enemy.key === 'spam' && !enemy.active);
    if (!copy) return false;
    const radius = Math.min(copy.displayWidth, copy.displayHeight) / 2;
    const occupied = [this.world.packet, ...this.world.enemies.filter((enemy) => enemy.active)];
    const candidates = this.navigation.getSteps(parent.tile).filter((step) => {
      const tile = this.world.collisionGrid.getTileAt(step.destination.x, step.destination.y);
      if (step.cost !== 1 || tile.portal || tile.penGate) return false;
      const position = toWorldPosition(step.destination, { x: 0, y: 0 }, this.world.tileSize);
      return occupied.every((entity) => !isBodyOverlap({ ...position, radius }, {
        x: entity.x, y: entity.y, radius: Math.min(entity.displayWidth, entity.displayHeight) / 2,
      }));
    });
    if (candidates.length === 0) return false;
    const step = candidates[this.rng.int(candidates.length)];
    this.movementRules.setEntityTile(copy, step.destination);
    clearEnemyScaredWindow(this.world, copy);
    this.world.enemiesExitingJail.delete(copy);
    this.world.enemyAnimations.delete(copy);
    copy.resetAbilities();
    copy.active = true;
    copy.direction = step.direction;
    copy.speed = copy.baseSpeed;
    copy.state.free = true;
    copy.state.soonFree = false;
    copy.state.dead = false;
    copy.state.animation = 'default';
    this.world.enemyEffects.push({
      kind: 'split', x: parent.x, y: parent.y, radius: this.world.tileSize,
      ageMs: 0, durationMs: ENEMY_CONFIG.spam.splitEffectDurationMs,
    });
    return true;
  }

  private dropLagZone(enemy: EnemyEntity): void {
    if (enemy.lastLagTile?.x === enemy.tile.x && enemy.lastLagTile.y === enemy.tile.y) return;
    enemy.lastLagTile = { ...enemy.tile };
    const tile = this.world.collisionGrid.getTileAt(enemy.tile.x, enemy.tile.y);
    if (tile.portal || tile.penGate) return;
    const position = toWorldPosition(enemy.tile, { x: 0, y: 0 }, this.world.tileSize);
    this.world.lagZones = this.world.lagZones
      .filter((zone) => zone.tile.x !== enemy.tile.x || zone.tile.y !== enemy.tile.y)
      .slice(-(ENEMY_CONFIG.lag.maxZones - 1));
    this.world.lagZones.push({
      tile: { ...enemy.tile }, ...position, radius: this.world.tileSize * ENEMY_CONFIG.lag.radiusTiles,
      ageMs: 0, durationMs: ENEMY_CONFIG.lag.zoneDurationMs,
    });
  }
}
