import type { Camera3D } from '../../engine/camera3d';
import type { EnemyEntity } from '../domain/entities/EnemyEntity';
import type { PortalService } from '../domain/services/PortalService';
import type { EndlessMazeStream } from '../domain/world/EndlessMazeStream';
import { ENDLESS_RESIDENT_SECTIONS, ENDLESS_SECTION_HEIGHT } from '../domain/world/EndlessMazeGenerator';
import type { WorldState } from '../domain/world/WorldState';
import { clearEnemyScaredWindow } from '../domain/services/EnemyScaredStateService';
import type { CollectibleSystem } from './CollectibleSystem';
import type { EnemyMovementSystem } from './EnemyMovementSystem';
import type { MazeHazardSystem } from './MazeHazardSystem';
import type { RenderSystem } from './RenderSystem';

interface EndlessBonusShift {
  shiftSection(_evictedIndex: number, _addedIndex: number, _rows: number, _newSlot: number): void;
}

/** Replaces distant sections and translates all resident simulation coordinates together. */
export class EndlessStreamingSystem {
  readonly updatePhase = 'afterSimulation' as const;

  constructor(
    private readonly world: WorldState,
    private readonly stream: EndlessMazeStream,
    private readonly portals: PortalService,
    private readonly camera: Camera3D,
    private readonly collectibles: CollectibleSystem,
    private readonly bonuses: EndlessBonusShift,
    private readonly movement: EnemyMovementSystem,
    private readonly hazards: MazeHazardSystem,
    private readonly render: RenderSystem,
  ) {}

  /** Recenters the rolling map after the Packet crosses its middle section. */
  update(): void {
    if (!this.world.isMoving || this.world.outcome) return;
    const firstSafeRow = ENDLESS_SECTION_HEIGHT * Math.floor(ENDLESS_RESIDENT_SECTIONS / 2);
    const lastSafeRow = firstSafeRow + ENDLESS_SECTION_HEIGHT;
    if (this.world.packet.tile.y < firstSafeRow) this.shift('up');
    else if (this.world.packet.tile.y >= lastSafeRow) this.shift('down');
  }

  /** Rebases simulation and presentation owners after replacing one section. */
  private shift(direction: 'up' | 'down'): void {
    const { rows, evictedIndex, addedIndex } = this.stream.shift(direction);
    const pixels = rows * this.world.tileSize;
    this.translateEntity(this.world.packet, rows, pixels);
    this.world.packetSpawnTile.y += rows;
    this.world.enemies.forEach((enemy) => {
      this.translateEntity(enemy, rows, pixels);
      enemy.pingTarget = this.translateTarget(enemy.pingTarget, rows);
      enemy.ambushTarget = this.translateTarget(enemy.ambushTarget, rows);
      enemy.lastLagTile = this.translateTarget(enemy.lastLagTile, rows);
      if (enemy.active && (enemy.tile.y < 0 || enemy.tile.y >= this.world.map.height)) this.retire(enemy);
    });
    this.world.lagZones = this.world.lagZones.map((zone) => ({ ...zone,
      tile: { ...zone.tile, y: zone.tile.y + rows }, y: zone.y + pixels }))
      .filter((zone) => zone.tile.y >= 0 && zone.tile.y < this.world.map.height);
    this.world.enemyEffects = this.world.enemyEffects.map((effect) => ({ ...effect,
      y: effect.y + pixels,
      ...(effect.target ? { target: { ...effect.target, y: effect.target.y + pixels } } : {}),
    })).filter((effect) => effect.y >= 0 && effect.y < this.world.map.heightInPixels);
    this.world.quarantineWalls = this.world.quarantineWalls.map((wall) => ({ ...wall,
      tile: { ...wall.tile, y: wall.tile.y + rows },
      source: { ...wall.source, y: wall.source.y + pixels },
    })).filter((wall) => wall.tile.y >= 0 && wall.tile.y < this.world.map.height);
    this.world.collisionGrid.replaceGrid(this.world.map.tiles.map((row) => row.map((tile) => tile.collision)));
    this.world.collisionGrid.setTemporaryEdges(this.world.quarantineWalls);
    this.portals.replacePairs(this.world.map.portalPairs ?? []);
    const visits = Array.from(this.world.visitedPacketTiles.values());
    this.world.visitedPacketTiles.clear();
    visits.forEach((tile) => {
      const translated = this.translateTarget(tile, rows);
      if (translated) this.world.visitedPacketTiles.set(`${translated.x},${translated.y}`, translated);
    });
    const addedSlot = direction === 'up' ? 0 : ENDLESS_RESIDENT_SECTIONS - 1;
    this.collectibles.shiftEndlessSection(this.stream.getSections()[addedSlot], rows, addedSlot);
    this.bonuses.shiftSection(evictedIndex, addedIndex, rows, addedSlot);
    this.camera.translateY(pixels);
    this.movement.onTopologyChanged();
    this.hazards.onTopologyChanged();
    this.render.onEndlessShift(pixels);
  }

  /** Moves an actor's tile and pixel center without changing its corridor offset. */
  private translateEntity(entity: WorldState['packet'] | EnemyEntity, rows: number, pixels: number): void {
    entity.tile.y += rows;
    entity.y += pixels;
  }

  /** Rebases a saved tile target or discards it when its section left the window. */
  private translateTarget(target: { x: number; y: number } | null, rows: number): { x: number; y: number } | null {
    if (!target) return null;
    const y = target.y + rows;
    return y >= 0 && y < this.world.map.height ? { x: target.x, y } : null;
  }

  /** Retires an enemy whose section was evicted. */
  private retire(enemy: EnemyEntity): void {
    clearEnemyScaredWindow(this.world, enemy);
    enemy.active = false;
    enemy.state.free = false;
    enemy.state.soonFree = false;
    enemy.state.dead = false;
    enemy.eatenElapsedMs = null;
    enemy.speed = enemy.baseSpeed;
    enemy.resetAbilities();
    this.world.enemyAnimations.delete(enemy);
  }
}
