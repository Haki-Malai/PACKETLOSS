import { SPEED } from '../../config/constants';
import { IS_DEV } from '../../config/environment';
import type { WorldState } from '../domain/world/WorldState';
import type { MovementRules } from '../domain/services/MovementRules';
import type { PortalService } from '../domain/services/PortalService';
import { defeatEnemy } from '../domain/services/EnemyDefeatService';
import { isBodyOverlap } from '../domain/services/EnemyPacketCollisionService';
import { buildPointLayout } from '../domain/services/PointLayoutService';
import { createPowerupCollisionWorld, type PowerupCollisionWorld } from '../domain/services/PowerupCollision';
import type { EndlessMazeStream, ResidentEndlessSection } from '../domain/world/EndlessMazeStream';
import { MOVEMENT_STEPS_PER_SECOND } from '../domain/services/MovementRules';
import { OFFENSIVE_POWERUPS, POWERUP_PICKUP_RADIUS, POWERUP_RULES, placePowerupPickups,
  type PowerupKind, type PowerupCombatActor, type PowerupPickup, type PowerupPoint } from '../shared/offensivePowerups';
import { SeededRandom } from '../shared/random/SeededRandom';
import { activatePowerup, addPowerupCollection, cancelPowerupCast, createPowerupCombatState,
  stepPowerupCombat } from '../simulation/PowerupCombat';
import type { CollectibleSystem } from './CollectibleSystem';

interface BonusPickups { getPickups(): readonly { x: number; y: number }[] }
const PACKET_ID = 'packet';

/** Adapts shared combat to solo actors and keeps weapons separate from scored maze points. */
export class PowerupSystem {
  private heldPowerup: PowerupKind | null = null;
  private nextPickupId = 1;
  private readonly previousPositions = new Map<string, PowerupPoint>();
  private initialPickups: PowerupPickup[] = [];
  private readonly seed: number;
  private collisionWorld: PowerupCollisionWorld | null = null;
  private collisionKey = '';

  constructor(private readonly world: WorldState, private readonly movement: MovementRules,
    private readonly collectibles: CollectibleSystem, private readonly bonuses?: BonusPickups,
    private readonly stream?: EndlessMazeStream, private readonly portals?: PortalService) {
    this.seed = stream?.initialPickupSeed ?? buildPointLayout({ map: world.map,
      collisionGrid: world.collisionGrid, startTile: world.packetSpawnTile, tileSize: world.tileSize,
      options: { minPowerPoints: 0, maxPowerPoints: 0 } }).seed;
    if (stream) stream.getSections().forEach((section, slot) => this.addSection(section, slot));
    else world.powerupPickups = placePowerupPickups(this.candidates(), this.seed).map((pickup) =>
      ({ ...pickup, id: this.nextPickupId++ }));
    this.initialPickups = world.powerupPickups.map((pickup) => ({ ...pickup }));
    this.rememberPositions();
    this.publish();
  }

  /** Splits at release and cast completion so a moving caster releases at the exact firing position. */
  getSimulationBoundaryMs(maximumMs: number): number {
    return this.world.powerupCombat.casts.reduce((boundary, cast) => {
      const rule = POWERUP_RULES[cast.kind];
      const next = (cast.origin ? rule.durationMs : rule.releaseMs) - cast.elapsedMs;
      return next > Number.EPSILON ? Math.min(boundary, next) : boundary;
    }, maximumMs);
  }

  /** Resolves swept weapon hits after topology and actor movement, before contact damage. */
  update(deltaMs: number): void {
    if (!this.world.isMoving || this.world.outcome) return;
    if (this.world.packet.deathAnimationRemainingMs > 0) this.clearForDeath();
    const actors = this.actors();
    const walls = this.walls();
    const hits = stepPowerupCombat(this.world.powerupCombat, deltaMs, actors, walls,
      SPEED.packet * MOVEMENT_STEPS_PER_SECOND);
    for (const hit of hits) {
      const enemy = this.world.enemies.find((candidate, index) => this.enemyId(index) === hit.targetId
        && candidate.active && !candidate.state.dead);
      if (enemy) defeatEnemy(this.world, this.movement, enemy, 'weapon');
    }
    this.rememberPositions();
    this.publish();
  }

  /** Collects a touched weapon after ordinary lethal contact has been resolved; no score is awarded. */
  collect(): void {
    if (!this.canControl()) return;
    const packet = this.world.packet;
    const index = this.world.powerupPickups.findIndex((pickup) => isBodyOverlap(
      { x: packet.x, y: packet.y, radius: Math.min(packet.displayWidth, packet.displayHeight) / 2 },
      { x: pickup.x, y: pickup.y, radius: POWERUP_PICKUP_RADIUS },
    ));
    if (index < 0) return;
    const [pickup] = this.world.powerupPickups.splice(index, 1);
    this.heldPowerup = pickup.kind;
    addPowerupCollection(this.world.powerupCombat, PACKET_ID, pickup.kind,
      { x: pickup.x, y: pickup.y }, { x: packet.x, y: packet.y });
    this.publish();
  }

  /** Consumes a single held weapon when no cast is already active, locking the current facing. */
  activate(): boolean {
    if (!this.canControl() || !this.heldPowerup) return false;
    if (!activatePowerup(this.world.powerupCombat, PACKET_ID, this.heldPowerup,
      this.world.packet.direction.current)) return false;
    const cast = this.world.powerupCombat.casts.find((candidate) => candidate.ownerId === PACKET_ID);
    const effect = this.world.powerupCombat.effects.find((candidate) => candidate.id === cast?.id);
    if (effect) { effect.x = this.world.packet.x; effect.y = this.world.packet.y; }
    this.heldPowerup = null;
    this.publish();
    return true;
  }

  /** Gives the active solo player a weapon only in development, replacing the previous inventory. */
  equipDevelopment(kind: PowerupKind): boolean {
    if (!IS_DEV || !this.canControl()) return false;
    this.heldPowerup = kind;
    this.publish();
    return true;
  }

  /** Clears inventory and unreleased casting on death while allowing released attacks to finish. */
  clearForDeath(): void {
    this.heldPowerup = null;
    cancelPowerupCast(this.world.powerupCombat, PACKET_ID);
    this.publish();
  }

  /** Resets combat on respawn or a level transition; only a level refill restores weapon pickups. */
  reset(refill = false): void {
    this.heldPowerup = null;
    this.world.powerupCombat = createPowerupCombatState();
    if (refill) this.world.powerupPickups = this.initialPickups.map((pickup) => ({ ...pickup }));
    this.rememberPositions();
    this.publish();
  }

  /** Rebases retained pickups, released effects, missile corner history, and actor history with the rolling maze. */
  shiftEndlessSection(section: ResidentEndlessSection, rows: number, slot: number): void {
    const pixels = rows * this.world.tileSize;
    const inside = (point: PowerupPoint): boolean => point.y >= 0 && point.y < this.world.map.heightInPixels;
    this.world.powerupPickups = this.world.powerupPickups.map((pickup) =>
      ({ ...pickup, y: pickup.y + pixels })).filter(inside);
    const state = this.world.powerupCombat;
    state.projectiles = state.projectiles.map((projectile) => ({ ...projectile, y: projectile.y + pixels,
      turns: projectile.turns.map((turn) => ({ ...turn, y: turn.y + pixels })) })).filter(inside);
    state.effects = state.effects.map((effect) => ({ ...effect, y: effect.y + pixels,
      ...(effect.source ? { source: { ...effect.source, y: effect.source.y + pixels } } : {}) })).filter(inside);
    state.casts.forEach((cast) => { if (cast.origin) cast.origin.y += pixels; });
    state.casts = state.casts.filter((cast) => !cast.origin || inside(cast.origin));
    this.previousPositions.forEach((point) => { point.y += pixels; });
    this.addSection(section, slot);
  }

  /** Releases all owned simulation state when the run is disposed. */
  destroy(): void {
    this.reset();
    this.world.powerupPickups = [];
    this.previousPositions.clear();
  }

  /** Rebuilds the shared terrain raster only when topology or Quarantine geometry changes. */
  private walls(): PowerupCollisionWorld {
    const key = (this.world.map.topologyRevision ?? 0) + ':' + this.world.quarantineWalls
      .map((wall) => wall.tile.x + ',' + wall.tile.y + ',' + wall.side).sort().join(';');
    if (!this.collisionWorld || key !== this.collisionKey) {
      this.collisionWorld = createPowerupCollisionWorld(this.world.map, this.world.quarantineWalls);
      this.collisionKey = key;
    }
    return this.collisionWorld;
  }

  /** Accepts input and collection only while the living Packet owns an active run. */
  private canControl(): boolean {
    return this.world.isMoving && !this.world.outcome && this.world.packet.active
      && this.world.packet.deathAnimationRemainingMs <= 0;
  }

  /** Filters reachable pickup centers against cores, portals, multiplier icons, and actor spawns. */
  private candidates(minRow = 0, maxRow = this.world.map.height): PowerupPoint[] {
    const occupied = new Set(Array.from(this.collectibles.getPoints()).filter((point) => point.kind === 'power')
      .map((point) => point.x + ',' + point.y));
    this.bonuses?.getPickups().forEach((pickup) => occupied.add(pickup.x + ',' + pickup.y));
    this.world.powerupPickups.forEach((pickup) => occupied.add(pickup.x + ',' + pickup.y));
    const layout = buildPointLayout({ map: this.world.map, collisionGrid: this.world.collisionGrid,
      startTile: this.world.packetSpawnTile, tileSize: this.world.tileSize,
      options: { minPowerPoints: 0, maxPowerPoints: 0 } });
    return layout.basePoints.filter((tile) => tile.y >= minRow && tile.y < maxRow
      && !(tile.x === this.world.packetSpawnTile.x && tile.y === this.world.packetSpawnTile.y)
      && !this.world.map.tiles[tile.y]?.[tile.x]?.collision.portal
      && !this.world.enemies.some((enemy) => tile.x === enemy.tile.x && tile.y === enemy.tile.y)
      && !this.world.map.spawnObjects.some((spawn) => Math.floor((spawn.x ?? -16) / this.world.tileSize) === tile.x
        && Math.floor((spawn.y ?? -16) / this.world.tileSize) === tile.y))
      .map((tile) => ({ x: (tile.x + 0.5) * this.world.tileSize, y: (tile.y + 0.5) * this.world.tileSize }))
      .filter((point) => !occupied.has(point.x + ',' + point.y));
  }

  /** Gives each generated section one seeded weapon on a distinct reachable center. */
  private addSection(section: ResidentEndlessSection, slot: number): void {
    const random = new SeededRandom(section.pickupSeed ^ 0x3a6fb012);
    const candidates = this.candidates(slot * section.map.height, (slot + 1) * section.map.height);
    const point = candidates[random.int(candidates.length)];
    if (!point) return;
    this.world.powerupPickups.push({ ...point, id: this.nextPickupId++, sectionIndex: section.index,
      kind: OFFENSIVE_POWERUPS[random.int(OFFENSIVE_POWERUPS.length)] });
  }

  /** Adapts actor centers and current headings, rejecting teleport gaps as physical travel during swept collision. */
  private actors(): PowerupCombatActor[] {
    const entities = [{ id: PACKET_ID, entity: this.world.packet, active: this.canControl() },
      ...this.world.enemies.map((entity, index) => ({ id: this.enemyId(index), entity,
        active: entity.active && entity.state.free && !entity.state.dead
          && !this.world.enemiesExitingJail.has(entity) }))];
    return entities.map(({ id, entity, active }) => {
      const previous = this.previousPositions.get(id);
      const teleportMotion = this.portals?.getTeleportMotion(entity, this.world.tick);
      return { id, x: entity.x, y: entity.y, radius: Math.min(entity.displayWidth, entity.displayHeight) / 2,
        direction: typeof entity.direction === 'string' ? entity.direction : entity.direction.current,
        active, previous, teleportMotion, teleported: Boolean(previous
          && Math.hypot(entity.x - previous.x, entity.y - previous.y) > this.world.tileSize) };
    });
  }

  /** Uses stable roster indices for original enemies and reserved Spam copies. */
  private enemyId(index: number): string { return 'enemy-' + index; }

  /** Stores actor centers after each collision slice for the next swept test. */
  private rememberPositions(): void {
    this.previousPositions.set(PACKET_ID, { x: this.world.packet.x, y: this.world.packet.y });
    this.world.enemies.forEach((enemy, index) => this.previousPositions.set(this.enemyId(index), { x: enemy.x, y: enemy.y }));
  }

  /** Publishes only inventory and cast changes to the event-driven HUD. */
  private publish(): void {
    this.world.gameState.setPowerupStatus({ kind: this.heldPowerup,
      casting: this.world.powerupCombat.casts.some((cast) => cast.ownerId === PACKET_ID) });
  }
}
