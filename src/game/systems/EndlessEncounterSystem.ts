import { ENEMY_CONFIG } from '../../config/constants';
import type { Camera3D } from '../../engine/camera3d';
import type { EnemyEntity } from '../domain/entities/EnemyEntity';
import { EnemyNavigationService } from '../domain/services/EnemyNavigationService';
import { clearEnemyScaredWindow, setEnemyScaredWindow } from '../domain/services/EnemyScaredStateService';
import type { MovementRules } from '../domain/services/MovementRules';
import type { PortalService } from '../domain/services/PortalService';
import { DIRECTION_VECTORS, OPPOSITE_DIRECTION, type Direction } from '../domain/valueObjects/Direction';
import type { WorldState } from '../domain/world/WorldState';
import type { RandomSource } from '../shared/random/RandomSource';
import { ENDLESS_SETTINGS, endlessEncounterInterval } from '../shared/endlessSettings';
import type { EnemyMovementSystem } from './EnemyMovementSystem';

interface PendingEntry {
  enemy: EnemyEntity;
  side: Direction;
  forward: boolean;
  heading: Direction;
  remainingMs: number;
  anchor: { x: number | null; y: number | null } | null;
}

interface SpawnOption {
  tile: { x: number; y: number };
  side: Direction;
}

type GroundBounds = { minX: number; maxX: number; minY: number; maxY: number };

const ENTRY_SIDES: readonly Direction[] = ['up', 'right', 'down', 'left'];

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
    private readonly getExploredSectionCount: () => number = () => 0,
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
      const margin = ENDLESS_SETTINGS.retireMarginTiles * this.world.tileSize;
      const horizontalMargin = ENDLESS_SETTINGS.retireHorizontalMarginTiles * this.world.tileSize;
      if (enemy.y + enemy.displayHeight < bounds.minY - margin
        || enemy.y - enemy.displayHeight > bounds.maxY + margin
        || enemy.x + enemy.displayWidth < bounds.minX - horizontalMargin
        || enemy.x - enemy.displayWidth > bounds.maxX + horizontalMargin) {
        this.retire(enemy);
      }
    });
    this.activatePending(deltaMs, bounds);
    this.remainingMs -= deltaMs;
    if (this.remainingMs > 0) return;
    const interval = endlessEncounterInterval(this.getExploredSectionCount());
    this.remainingMs = interval.minMs + this.rng.int(interval.maxMs - interval.minMs + 1);
    const count = ENDLESS_SETTINGS.waveMinEnemies + this.rng.int(
      ENDLESS_SETTINGS.waveMaxEnemies - ENDLESS_SETTINGS.waveMinEnemies + 1);
    const available = this.world.enemies.filter((enemy) => !enemy.isCopy && !enemy.active
      && !this.pending.some((entry) => entry.enemy === enemy));
    for (let i = available.length - 1; i > 0; i -= 1) {
      const j = this.rng.int(i + 1);
      [available[i], available[j]] = [available[j], available[i]];
    }
    const formation = this.rng.int(3);
    const forward = this.rng.next() < ENDLESS_SETTINGS.forwardWaveChance;
    const heading = this.world.packet.direction.current;
    const leadingSide = forward ? heading : ENTRY_SIDES[this.rng.int(ENTRY_SIDES.length)];
    const anchor = formation === 1 ? { x: null as number | null, y: null as number | null } : null;
    const waveSize = formation === 0 ? 1 : count;
    for (let i = 0; i < Math.min(waveSize, available.length); i += 1) {
      const side = formation === 2 && i % 2 === 1 && !forward
        ? OPPOSITE_DIRECTION[leadingSide] : leadingSide;
      this.pending.push({ enemy: available[i], side, forward, heading,
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
  private activatePending(deltaMs: number, bounds: GroundBounds): void {
    const waiting: PendingEntry[] = [];
    for (const entry of this.pending) {
      entry.remainingMs -= deltaMs;
      if (entry.remainingMs > 0) {
        waiting.push(entry);
        continue;
      }
      if (entry.forward && entry.heading !== this.world.packet.direction.current) {
        entry.heading = this.world.packet.direction.current;
        entry.side = entry.heading;
        if (entry.anchor) {
          entry.anchor.x = null;
          entry.anchor.y = null;
        }
      }
      const tile = this.findSpawn(entry.enemy, entry.side, bounds, entry.anchor, entry.forward, entry.heading);
      if (!tile) {
        entry.remainingMs = ENDLESS_SETTINGS.deferredSpawnRetryMs;
        waiting.push(entry);
        continue;
      }
      if (entry.anchor && entry.anchor.x === null) {
        entry.anchor.x = tile.x;
        entry.anchor.y = tile.y;
      }
      this.activate(entry.enemy, tile);
    }
    this.pending = waiting;
  }

  /** Chooses a reachable offscreen corridor, preferring the Packet's forward route. */
  private findSpawn(
    enemy: EnemyEntity,
    side: Direction,
    bounds: GroundBounds,
    anchor: PendingEntry['anchor'],
    forward: boolean,
    heading: Direction,
  ): { x: number; y: number } | null {
    const options = ENTRY_SIDES.flatMap((candidateSide) =>
      this.spawnOptions(enemy, candidateSide, bounds, anchor));
    if (options.length === 0) return null;
    for (let i = options.length - 1; i > 0; i -= 1) {
      const j = this.rng.int(i + 1);
      [options[i], options[j]] = [options[j], options[i]];
    }
    const start = this.world.packet.tile;
    const routes = new Map<string, { steps: number; first: Direction | null }>();
    const queue = [{ tile: start, steps: 0, first: null as Direction | null }];
    routes.set(`${start.x},${start.y}`, queue[0]);
    for (let index = 0; index < queue.length; index += 1) {
      const route = queue[index];
      for (const step of this.navigation.getSteps(route.tile)) {
        const key = `${step.destination.x},${step.destination.y}`;
        if (routes.has(key)) continue;
        const next = { tile: step.destination, steps: route.steps + 1,
          first: route.first ?? step.direction };
        routes.set(key, next);
        queue.push(next);
      }
    }
    const vector = DIRECTION_VECTORS[heading];
    const valid = options.flatMap((option) => {
      const route = routes.get(`${option.tile.x},${option.tile.y}`);
      return route && route.steps >= ENDLESS_SETTINGS.spawnMinCorridorSteps
        ? [{ ...option, startsAhead: route.first === heading,
          ahead: (option.tile.x - this.world.packet.tile.x) * vector.dx
            + (option.tile.y - this.world.packet.tile.y) * vector.dy > 0 }]
        : [];
    });
    if (forward) {
      return valid.find((option) => option.ahead && option.startsAhead)?.tile
        ?? valid.find((option) => option.ahead)?.tile
        ?? valid.find((option) => option.side === side)?.tile
        ?? valid[0]?.tile ?? null;
    }
    return valid.find((option) => option.side === side)?.tile ?? valid[0]?.tile ?? null;
  }

  /** Finds body-clear corridors past one camera edge without entering walls or actors. */
  private spawnOptions(enemy: EnemyEntity, side: Direction, bounds: GroundBounds,
    anchor: PendingEntry['anchor']): SpawnOption[] {
    const vertical = side === 'up' || side === 'down';
    const edge = side === 'up' ? Math.floor(bounds.minY / this.world.tileSize)
      : side === 'down' ? Math.ceil(bounds.maxY / this.world.tileSize)
        : side === 'left' ? Math.floor(bounds.minX / this.world.tileSize)
          : Math.ceil(bounds.maxX / this.world.tileSize);
    const sign = side === 'up' || side === 'left' ? -1 : 1;
    const options: SpawnOption[] = [];
    for (let distance = ENDLESS_SETTINGS.spawnMarginTiles;
      distance <= ENDLESS_SETTINGS.spawnSearchDepthTiles; distance += 1) {
      const coordinate = edge + sign * distance;
      const span = vertical ? this.world.map.width : this.world.map.height;
      for (let cross = 1; cross < span - 1; cross += 1) {
        const x = vertical ? cross : coordinate;
        const y = vertical ? coordinate : cross;
        if (x < 1 || x >= this.world.map.width - 1 || y < 1 || y >= this.world.map.height - 1) continue;
        const centerX = (x + 0.5) * this.world.tileSize;
        const centerY = (y + 0.5) * this.world.tileSize;
        const margin = ENDLESS_SETTINGS.spawnMarginTiles * this.world.tileSize;
        if (side === 'up' && centerY + enemy.displayHeight > bounds.minY - margin
          || side === 'down' && centerY - enemy.displayHeight < bounds.maxY + margin
          || side === 'left' && centerX + enemy.displayWidth > bounds.minX - margin
          || side === 'right' && centerX - enemy.displayWidth < bounds.maxX + margin) continue;
        if (anchor?.x !== null && anchor?.x !== undefined
          && Math.abs((vertical ? x : y) - (vertical ? anchor.x : anchor.y!)) > 5) continue;
        const tile = this.world.map.tiles[y]?.[x];
        if (!tile || tile.localId === null || tile.localId >= 16) continue;
        if (this.world.enemies.some((active) => active.active
          && Math.abs(active.tile.x - x) + Math.abs(active.tile.y - y) < 2)) continue;
        options.push({ tile: { x, y }, side });
      }
    }
    return options;
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
