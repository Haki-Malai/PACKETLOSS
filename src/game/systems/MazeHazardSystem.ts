import { ENEMY_CONFIG } from '../../config/constants';
import { EnemyEntity } from '../domain/entities/EnemyEntity';
import { MovementRules, toWorldPosition } from '../domain/services/MovementRules';
import { EnemyNavigationService } from '../domain/services/EnemyNavigationService';
import { PortalService } from '../domain/services/PortalService';
import { DIRECTIONS } from '../domain/valueObjects/Direction';
import type { TilePosition } from '../domain/valueObjects/TilePosition';
import { WorldState } from '../domain/world/WorldState';
import { buildMazeWallFootprint, connectionCenterIsOpen, connectionTouchesAuthoredWall } from '../domain/world/MazeFootprint';
import type { WallConnection } from '../domain/world/MazeFootprint';
import type { RandomSource } from '../shared/random/RandomSource';
import type { CollectibleSystem } from './CollectibleSystem';

/** Owns temporary maze blockers and Trojan ambushes using simulation time and seeded randomness. */
export class MazeHazardSystem {
  private readonly navigation: EnemyNavigationService;
  private readonly permanentWalls = buildMazeWallFootprint(this.world.map);

  /** Shares live movement rules and point state; fake points never enter the collectible system. */
  constructor(
    private readonly world: WorldState,
    private readonly movement: MovementRules,
    private readonly rng: RandomSource,
    private readonly collectibles: Pick<CollectibleSystem, 'getPoints'>,
  ) {
    this.navigation = new EnemyNavigationService(world.collisionGrid, world.tileSize,
      new PortalService(world.collisionGrid, world.map.portalPairs ?? []));
  }

  /** Ages walls and advances eligible enemies; pause and terminal checkpoints freeze all hazards. */
  update(deltaMs: number): void {
    if (!this.world.isMoving || this.world.outcome) return;
    const elapsed = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
    const previousCount = this.world.quarantineWalls.length;
    this.world.quarantineWalls = this.world.quarantineWalls
      .map((wall) => ({ ...wall, ageMs: wall.ageMs + elapsed }))
      .filter((wall) => wall.ageMs < wall.durationMs);
    if (this.world.quarantineWalls.length !== previousCount) this.syncCollision();

    for (const enemy of this.world.enemies) {
      if (enemy.key !== 'quarantine' && enemy.key !== 'trojan') continue;
      if (!enemy.active || !enemy.state.free || enemy.state.dead || enemy.state.scared
        || this.world.enemiesExitingJail.has(enemy)) {
        enemy.resetAbilities();
        continue;
      }
      if (enemy.key === 'trojan' && this.updateDisguise(enemy, elapsed)) continue;
      if (enemy.key === 'trojan' && enemy.ambushTarget) {
        this.finishAmbush(enemy);
        continue;
      }
      const interval = ENEMY_CONFIG[enemy.key].intervalMs;
      enemy.abilityRemainingMs = Math.max(0, (enemy.abilityRemainingMs ?? interval) - elapsed);
      if (enemy.abilityRemainingMs > 0) continue;
      if (enemy.key === 'quarantine') {
        this.createWalls(enemy);
        enemy.abilityRemainingMs = interval;
      } else {
        enemy.abilityRemainingMs = this.selectAmbushTarget(enemy) ? null : ENEMY_CONFIG.trojan.retryMs;
      }
    }
  }

  /** Keeps Trojan hidden until the Packet approaches, then grants a stationary reveal window. */
  private updateDisguise(enemy: EnemyEntity, elapsed: number): boolean {
    if (enemy.revealRemainingMs > 0) {
      enemy.revealRemainingMs = Math.max(0, enemy.revealRemainingMs - elapsed);
      return true;
    }
    if (!enemy.disguised) return false;
    enemy.disguiseRemainingMs = Math.max(0, enemy.disguiseRemainingMs - elapsed);
    const packet = this.world.packet;
    const near = Math.hypot(packet.x - enemy.x, packet.y - enemy.y)
      <= ENEMY_CONFIG.trojan.revealRangeTiles * this.world.tileSize;
    if (near) {
      enemy.disguised = false;
      enemy.disguiseRemainingMs = 0;
      enemy.revealRemainingMs = ENEMY_CONFIG.trojan.revealGraceMs;
      this.world.enemyEffects.push({
        kind: 'trojan', x: enemy.x, y: enemy.y, radius: this.world.tileSize * 1.5,
        ageMs: 0, durationMs: ENEMY_CONFIG.trojan.revealGraceMs,
      });
    }
    return true;
  }

  /** Selects a reachable cleared tile without moving Trojan away from its current position. */
  private selectAmbushTarget(enemy: EnemyEntity): boolean {
    const points = new Set(Array.from(this.collectibles.getPoints(), (point) => `${point.tile.x},${point.tile.y}`));
    const candidates = [...this.world.visitedPacketTiles.values()]
      .filter((tile) => this.isValidDisguiseTile(tile, enemy, points));
    while (candidates.length > 0) {
      const [tile] = candidates.splice(this.rng.int(candidates.length), 1);
      if (this.navigation.findPath(enemy.tile, tile) === null) continue;
      enemy.ambushTarget = { ...tile };
      return true;
    }
    return false;
  }

  /** Transforms only after normal movement reaches the chosen tile and it remains empty. */
  private finishAmbush(enemy: EnemyEntity): void {
    const target = enemy.ambushTarget!;
    if (enemy.tile.x !== target.x || enemy.tile.y !== target.y
      || enemy.moved.x !== 0 || enemy.moved.y !== 0) return;
    enemy.ambushTarget = null;
    const points = new Set(Array.from(this.collectibles.getPoints(), (point) => `${point.tile.x},${point.tile.y}`));
    if (!this.isValidDisguiseTile(target, enemy, points)) {
      enemy.abilityRemainingMs = ENEMY_CONFIG.trojan.retryMs;
      return;
    }
    enemy.disguised = true;
    enemy.disguiseRemainingMs = ENEMY_CONFIG.trojan.disguiseDurationMs;
    enemy.revealRemainingMs = 0;
    enemy.abilityRemainingMs = ENEMY_CONFIG.trojan.intervalMs;
  }

  /** Requires a visited, walkable, actor-free tile with no real collectible in its neighborhood. */
  private isValidDisguiseTile(tile: Readonly<TilePosition>, enemy: EnemyEntity, points: ReadonlySet<string>): boolean {
    if (!this.world.visitedPacketTiles.has(`${tile.x},${tile.y}`)
      || !this.isOpenPlacement(tile) || !this.isClearOfActors(tile, 3, enemy)) return false;
    for (let y = tile.y - 1; y <= tile.y + 1; y += 1) {
      for (let x = tile.x - 1; x <= tile.x + 1; x += 1) {
        if (points.has(`${x},${y}`)) return false;
      }
    }
    return true;
  }

  /** Extends authored rails across open connections; closed routes reopen when timers expire. */
  private createWalls(enemy: EnemyEntity): void {
    const config = ENEMY_CONFIG.quarantine;
    const capacity = Math.min(config.wallsPerCast, config.maxWalls - this.world.quarantineWalls.length);
    if (capacity <= 0) return;
    const candidates: WallConnection[] = [];
    for (let y = Math.max(0, enemy.tile.y - config.rangeTiles); y <= Math.min(this.world.map.height - 1, enemy.tile.y + config.rangeTiles); y += 1) {
      for (let x = Math.max(0, enemy.tile.x - config.rangeTiles); x <= Math.min(this.world.map.width - 1, enemy.tile.x + config.rangeTiles); x += 1) {
        const tile = { x, y };
        if (Math.abs(x - enemy.tile.x) + Math.abs(y - enemy.tile.y) > config.rangeTiles) continue;
        for (const side of ['right', 'down'] as const) {
          const neighbor = { x: x + (side === 'right' ? 1 : 0), y: y + (side === 'down' ? 1 : 0) };
          if (Math.abs(neighbor.x - enemy.tile.x) + Math.abs(neighbor.y - enemy.tile.y) > config.rangeTiles) continue;
          const connection = { tile, side };
          if (this.canCloseConnection(connection, neighbor)) candidates.push(connection);
        }
      }
    }
    const count = Math.min(capacity, candidates.length);
    for (let i = 0; i < count; i += 1) {
      const [connection] = candidates.splice(this.rng.int(candidates.length), 1);
      this.world.quarantineWalls.push({
        ...connection, source: { x: enemy.x, y: enemy.y }, ageMs: 0, durationMs: config.wallDurationMs,
      });
    }
    if (count === 0) return;
    this.syncCollision();
    this.world.enemyEffects.push({
      kind: 'quarantine', x: enemy.x, y: enemy.y, radius: this.world.tileSize * 2,
      ageMs: 0, durationMs: 650,
    });
  }

  /** Accepts only actor-free open passages whose new rail joins permanent wall geometry. */
  private canCloseConnection(connection: WallConnection, neighbor: TilePosition): boolean {
    const { tile, side } = connection;
    return this.isOpenPlacement(tile) && this.isOpenPlacement(neighbor)
      && this.isClearOfActors(tile, 1.5) && this.isClearOfActors(neighbor, 1.5)
      && this.movement.canMove(side, 0, 0, this.world.collisionGrid.getTilesAt(tile))
      && connectionCenterIsOpen(this.world.map, this.permanentWalls, connection)
      && connectionTouchesAuthoredWall(this.world.map, this.permanentWalls, connection);
  }

  /** Allows walkable directional-wall corridors while reserving solid tiles, portals, spawn, and jail. */
  private isOpenPlacement(tile: Readonly<TilePosition>): boolean {
    const authored = this.world.map.tiles[tile.y]?.[tile.x];
    if (authored?.gid == null || (authored.localId !== null && authored.localId >= 16 && authored.localId <= 21)) return false;
    const collision = this.world.collisionGrid.getTileAt(tile.x, tile.y);
    if (collision.penGate || collision.portal) return false;
    const neighbors = this.world.collisionGrid.getTilesAt(tile);
    if (!DIRECTIONS.some((direction) => this.movement.canMove(direction, 0, 0, neighbors))) return false;
    const jail = this.world.enemyJailBounds;
    if (tile.x >= jail.minX - 1 && tile.x <= jail.maxX + 1 && tile.y >= jail.y - 2 && tile.y <= jail.y + 1) return false;
    const spawn = this.world.packetSpawnTile;
    if (Math.abs(tile.x - spawn.x) <= 1 && Math.abs(tile.y - spawn.y) <= 1) return false;
    for (let y = tile.y - 1; y <= tile.y + 1; y += 1) {
      for (let x = tile.x - 1; x <= tile.x + 1; x += 1) {
        if (this.world.collisionGrid.getTileAt(x, y).portal) return false;
      }
    }
    return true;
  }

  /** Reserves actor bodies and their current corridor segment so walls never materialize through them. */
  private isClearOfActors(tile: Readonly<TilePosition>, packetClearanceTiles: number, owner?: EnemyEntity): boolean {
    const position = toWorldPosition(tile, { x: 0, y: 0 }, this.world.tileSize);
    const packet = this.world.packet;
    if (Math.hypot(position.x - packet.x, position.y - packet.y) <= this.world.tileSize * packetClearanceTiles) return false;
    return this.world.enemies.every((enemy) => enemy === owner || !enemy.active
      || Math.hypot(position.x - enemy.x, position.y - enemy.y) > this.world.tileSize * 1.5);
  }

  /** Publishes the same active wall connections consumed by rendering to movement and navigation. */
  private syncCollision(): void {
    this.world.collisionGrid.setTemporaryEdges(this.world.quarantineWalls);
  }
}
