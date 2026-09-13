import { ENEMY_CONFIG } from '../../config/constants';
import { GhostEntity } from '../domain/entities/GhostEntity';
import { EnemyNavigationService } from '../domain/services/EnemyNavigationService';
import { isBodyOverlap } from '../domain/services/GhostPacketCollisionService';
import { clearGhostScaredWindow } from '../domain/services/GhostScaredStateService';
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
    const eligible = this.world.ghosts.filter((ghost) => {
      if (!ghost.active || !ghost.state.free || ghost.state.scared || this.world.ghostsExitingJail.has(ghost)) {
        ghost.resetAbilities();
        return false;
      }
      return true;
    });
    for (const ghost of eligible) {
      if (ghost.key === 'lag' && !ghost.lastLagTile) ghost.lastLagTile = { ...ghost.tile };
      const interval = ghost.key === 'ping' ? ENEMY_CONFIG.ping.intervalMs
        : ghost.key === 'spam' ? ENEMY_CONFIG.spam.splitIntervalMs
          : ghost.key === 'lag' ? ENEMY_CONFIG.lag.dropIntervalMs : 0;
      if (interval === 0) continue;
      ghost.abilityRemainingMs = Math.max(0, (ghost.abilityRemainingMs ?? interval) - elapsed);
      if (ghost.abilityRemainingMs > 0) continue;
      if (ghost.key === 'ping') {
        this.ping(ghost);
        ghost.abilityRemainingMs = interval;
      } else if (ghost.moved.x === 0 && ghost.moved.y === 0) {
        if (ghost.key === 'spam') {
          ghost.abilityRemainingMs = this.split(ghost) ? interval : ENEMY_CONFIG.spam.retryMs;
        } else {
          this.dropLagZone(ghost);
          ghost.abilityRemainingMs = interval;
        }
      }
    }
  }

  private ping(ghost: GhostEntity): void {
    const radius = ENEMY_CONFIG.ping.rangeTiles * this.world.tileSize;
    const packet = this.world.packet;
    const detected = Math.hypot(packet.x - ghost.x, packet.y - ghost.y) <= radius;
    if (detected) ghost.pingTarget = {
      x: Math.floor(packet.x / this.world.tileSize),
      y: Math.floor(packet.y / this.world.tileSize),
    };
    this.world.enemyEffects.push({
      kind: 'ping', x: ghost.x, y: ghost.y, radius, ageMs: 0,
      durationMs: ENEMY_CONFIG.ping.pulseDurationMs,
      ...(detected ? { target: { x: packet.x, y: packet.y } } : {}),
    });
  }

  private split(parent: GhostEntity): boolean {
    const activeCount = this.world.ghosts.filter((ghost) => ghost.active && ghost.key === 'spam').length;
    if (activeCount >= ENEMY_CONFIG.spam.maxCount) return false;
    const copy = this.world.ghosts.find((ghost) => ghost.isCopy && ghost.key === 'spam' && !ghost.active);
    if (!copy) return false;
    const radius = Math.min(copy.displayWidth, copy.displayHeight) / 2;
    const occupied = [this.world.packet, ...this.world.ghosts.filter((ghost) => ghost.active)];
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
    clearGhostScaredWindow(this.world, copy);
    this.world.ghostsExitingJail.delete(copy);
    this.world.ghostAnimations.delete(copy);
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

  private dropLagZone(ghost: GhostEntity): void {
    if (ghost.lastLagTile?.x === ghost.tile.x && ghost.lastLagTile.y === ghost.tile.y) return;
    ghost.lastLagTile = { ...ghost.tile };
    const tile = this.world.collisionGrid.getTileAt(ghost.tile.x, ghost.tile.y);
    if (tile.portal || tile.penGate) return;
    const position = toWorldPosition(ghost.tile, { x: 0, y: 0 }, this.world.tileSize);
    this.world.lagZones = this.world.lagZones
      .filter((zone) => zone.tile.x !== ghost.tile.x || zone.tile.y !== ghost.tile.y)
      .slice(-(ENEMY_CONFIG.lag.maxZones - 1));
    this.world.lagZones.push({
      tile: { ...ghost.tile }, ...position, radius: this.world.tileSize * ENEMY_CONFIG.lag.radiusTiles,
      ageMs: 0, durationMs: ENEMY_CONFIG.lag.zoneDurationMs,
    });
  }
}
