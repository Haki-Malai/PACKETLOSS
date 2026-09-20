import { ENEMY_CONFIG } from '../../config/constants';
import type { Camera3D } from '../../engine/camera3d';
import type { EnemyEntity } from '../domain/entities/EnemyEntity';
import { EnemyNavigationService } from '../domain/services/EnemyNavigationService';
import { clearEnemyScaredWindow, setEnemyScaredWindow } from '../domain/services/EnemyScaredStateService';
import type { MovementRules } from '../domain/services/MovementRules';
import type { PortalService } from '../domain/services/PortalService';
import type { WorldState } from '../domain/world/WorldState';
import type { RandomSource } from '../shared/random/RandomSource';
import { ENDLESS_SETTINGS } from '../shared/endlessSettings';
import type { EnemyMovementSystem } from './EnemyMovementSystem';

interface PendingEntry {
  enemy: EnemyEntity;
  side: 'top' | 'bottom';
  remainingMs: number;
  anchor: { x: number | null } | null;
}

/** Creates bounded offscreen waves from the seven reusable original enemy slots. */
export class EndlessEncounterSystem {
  private readonly navigation: EnemyNavigationService;
  private remainingMs: number = ENDLESS_SETTINGS.firstEncounterMs;
  private pending: PendingEntry[] = [];

  constructor(
    private readonly world: WorldState,
    private readonly camera: Camera3D,
    private readonly movement: MovementRules,
    private readonly enemyMovement: EnemyMovementSystem,
    private readonly rng: RandomSource,
    portals: PortalService,
  ) {
    this.navigation = new EnemyNavigationService(world.collisionGrid, world.tileSize, portals, 'physical');
  }

  /** Advances only with active simulation and defers waves while no valid offscreen tile exists. */
  update(deltaMs: number): void {
    if (!this.world.isMoving || this.world.outcome) return;
    this.world.powerRemainingMs = Math.max(0, this.world.powerRemainingMs - deltaMs);
    const bounds = this.camera.getVisibleGroundBounds();
    this.world.enemies.forEach((enemy) => {
      if (!enemy.active || enemy.state.dead) return;
      if (enemy.y + enemy.displayHeight < bounds.minY - ENDLESS_SETTINGS.retireMarginTiles * this.world.tileSize
        || enemy.y - enemy.displayHeight > bounds.maxY + ENDLESS_SETTINGS.retireMarginTiles * this.world.tileSize) {
        this.retire(enemy);
      }
    });
    this.activatePending(deltaMs, bounds);
    this.remainingMs -= deltaMs;
    if (this.remainingMs > 0) return;
    this.remainingMs = ENDLESS_SETTINGS.encounterIntervalMinMs + this.rng.int(
      ENDLESS_SETTINGS.encounterIntervalMaxMs - ENDLESS_SETTINGS.encounterIntervalMinMs + 1);
    const count = ENDLESS_SETTINGS.waveMinEnemies + this.rng.int(
      ENDLESS_SETTINGS.waveMaxEnemies - ENDLESS_SETTINGS.waveMinEnemies + 1);
    const available = this.world.enemies.filter((enemy) => !enemy.isCopy && !enemy.active
      && !this.pending.some((entry) => entry.enemy === enemy));
    for (let i = available.length - 1; i > 0; i -= 1) {
      const j = this.rng.int(i + 1);
      [available[i], available[j]] = [available[j], available[i]];
    }
    const formation = this.rng.int(3);
    const leadingSide = this.rng.int(2) === 0 ? 'top' : 'bottom';
    const anchor = formation === 1 ? { x: null as number | null } : null;
    const waveSize = formation === 0 ? 1 : count;
    for (let i = 0; i < Math.min(waveSize, available.length); i += 1) {
      const side = formation === 2 && i % 2 === 1
        ? leadingSide === 'top' ? 'bottom' : 'top' : leadingSide;
      this.pending.push({ enemy: available[i], side,
        remainingMs: formation === 1 ? i * ENDLESS_SETTINGS.staggeredEntryMs : 0, anchor });
    }
    this.activatePending(0, bounds);
  }

  /** Clears visible threats after nonfinal death while retaining the Packet's exact position. */
  onPacketRespawn(): void {
    const bounds = this.camera.getVisibleGroundBounds();
    const margin = this.world.tileSize;
    /** Includes actor or hazard extent when testing recovery-view overlap. */
    const visible = (x: number, y: number, radius: number): boolean =>
      x + radius >= bounds.minX - margin && x - radius <= bounds.maxX + margin
      && y + radius >= bounds.minY - margin && y - radius <= bounds.maxY + margin;
    this.world.enemies.forEach((enemy) => {
      if (enemy.active && visible(enemy.x, enemy.y, Math.max(enemy.displayWidth, enemy.displayHeight))) {
        this.retire(enemy);
      }
    });
    this.world.lagZones = this.world.lagZones.filter((zone) => !visible(zone.x, zone.y, zone.radius));
    this.world.quarantineWalls = this.world.quarantineWalls.filter((wall) => {
      const x = (wall.tile.x + (wall.side === 'right' ? 1 : 0.5)) * this.world.tileSize;
      const y = (wall.tile.y + 0.5) * this.world.tileSize;
      return !visible(x, y, this.world.tileSize);
    });
    this.world.enemyEffects = this.world.enemyEffects.filter((effect) => effect.kind !== 'quarantine'
      || !visible(effect.x, effect.y, effect.radius));
    this.world.collisionGrid.setTemporaryEdges(this.world.quarantineWalls);
    this.pending = [];
    this.remainingMs = ENDLESS_SETTINGS.firstEncounterMs;
  }

  /** Activates due wave members offscreen and retries when no legal corridor exists. */
  private activatePending(deltaMs: number, bounds: { minY: number; maxY: number }): void {
    const waiting: PendingEntry[] = [];
    for (const entry of this.pending) {
      entry.remainingMs -= deltaMs;
      if (entry.remainingMs > 0) {
        waiting.push(entry);
        continue;
      }
      const tile = this.findSpawn(entry.enemy, entry.side, bounds, entry.anchor?.x ?? null);
      if (!tile) {
        entry.remainingMs = ENDLESS_SETTINGS.deferredSpawnRetryMs;
        waiting.push(entry);
        continue;
      }
      if (entry.anchor && entry.anchor.x === null) entry.anchor.x = tile.x;
      this.activate(entry.enemy, tile);
    }
    this.pending = waiting;
  }

  /** Chooses a reachable corridor beyond the camera and body-clearance margin. */
  private findSpawn(
    enemy: EnemyEntity,
    side: 'top' | 'bottom',
    bounds: { minY: number; maxY: number },
    nearX: number | null,
  ): { x: number; y: number } | null {
    const visibleEdge = side === 'top' ? Math.floor(bounds.minY / this.world.tileSize)
      : Math.ceil(bounds.maxY / this.world.tileSize);
    const options: Array<{ x: number; y: number }> = [];
    for (let distance = ENDLESS_SETTINGS.spawnMarginTiles;
      distance <= ENDLESS_SETTINGS.spawnSearchDepthTiles; distance += 1) {
      const y = visibleEdge + (side === 'top' ? -distance : distance);
      if (y < 1 || y >= this.world.map.height - 1) continue;
      const centerY = (y + 0.5) * this.world.tileSize;
      if (side === 'top' && centerY + enemy.displayHeight
        > bounds.minY - ENDLESS_SETTINGS.spawnMarginTiles * this.world.tileSize) continue;
      if (side === 'bottom' && centerY - enemy.displayHeight
        < bounds.maxY + ENDLESS_SETTINGS.spawnMarginTiles * this.world.tileSize) continue;
      for (let x = 1; x < this.world.map.width - 1; x += 1) {
        const tile = this.world.map.tiles[y]?.[x];
        if (!tile || tile.localId === null || tile.localId >= 16) continue;
        if (nearX !== null && Math.abs(x - nearX) > 5) continue;
        if (this.world.enemies.some((enemy) => enemy.active
          && Math.abs(enemy.tile.x - x) + Math.abs(enemy.tile.y - y) < 2)) continue;
        options.push({ x, y });
      }
    }
    for (let i = options.length - 1; i > 0; i -= 1) {
      const j = this.rng.int(i + 1);
      [options[i], options[j]] = [options[j], options[i]];
    }
    for (const tile of options) {
      const path = this.navigation.findPath(this.world.packet.tile, tile);
      if (path && path.length >= ENDLESS_SETTINGS.spawnMinCorridorSteps) return tile;
    }
    return null;
  }

  /** Resets a reusable original slot at a new offscreen entrance. */
  private activate(enemy: EnemyEntity, tile: { x: number; y: number }): void {
    this.movement.setEntityTile(enemy, tile);
    enemy.active = true;
    enemy.direction = this.rng.int(2) === 0 ? 'left' : 'right';
    enemy.state.free = true;
    enemy.state.soonFree = false;
    enemy.state.dead = false;
    enemy.state.animation = 'default';
    enemy.eatenElapsedMs = null;
    enemy.speed = enemy.baseSpeed;
    enemy.resetAbilities();
    if (this.world.powerRemainingMs > 0) setEnemyScaredWindow(this.world, enemy, this.world.powerRemainingMs);
    this.enemyMovement.onEnemyActivated(enemy);
  }

  /** Clears presentation, fear, routes, and ability state before slot reuse. */
  private retire(enemy: EnemyEntity): void {
    clearEnemyScaredWindow(this.world, enemy);
    enemy.active = false;
    enemy.state.free = false;
    enemy.state.soonFree = false;
    enemy.state.dead = false;
    enemy.eatenElapsedMs = null;
    enemy.speed = ENEMY_CONFIG[enemy.key].speed;
    enemy.resetAbilities();
    this.world.enemyAnimations.delete(enemy);
  }
}
