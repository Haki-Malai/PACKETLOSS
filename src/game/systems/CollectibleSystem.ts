import { COLLECTIBLE_CONFIG, ENEMY_SCARED_DURATION_MS } from '../../config/constants';
import { awardScore } from './awardScore';
import { isBodyOverlap } from '../domain/services/EnemyPacketCollisionService';
import { getObjectNumberProperty } from '../domain/services/EnemyJailService';
import { setActiveEnemiesScaredWindow } from '../domain/services/EnemyScaredStateService';
import { buildPointLayout } from '../domain/services/PointLayoutService';
import { TilePosition } from '../domain/valueObjects/TilePosition';
import { WorldState } from '../domain/world/WorldState';
import type { ResidentEndlessSection } from '../domain/world/EndlessMazeStream';
import { ENDLESS_SETTINGS } from '../shared/endlessSettings';
import { CollisionGrid } from '../domain/world/CollisionGrid';
import { createEatEffect, type CollectibleKind, type EatEffect } from '../shared/pickupEffects';

export type { CollectibleKind, EatEffect } from '../shared/pickupEffects';

export interface CollectiblePoint {
  tile: TilePosition;
  x: number;
  y: number;
  kind: CollectibleKind;
}

function tileKey(tile: TilePosition): string {
  return `${tile.x},${tile.y}`;
}

export class CollectibleSystem {
  private readonly pointsByTile = new Map<string, CollectiblePoint>();
  private readonly eatEffects: EatEffect[] = [];
  private readonly initialPoints: readonly CollectiblePoint[];
  private revision = 0;
  private collectedCount = 0;

  constructor(private readonly world: WorldState, points?: readonly CollectiblePoint[],
    private readonly endlessPickupSeed?: number) {
    if (points) {
      points.forEach((point) => {
        this.pointsByTile.set(tileKey(point.tile), { ...point, tile: { ...point.tile } });
      });
    } else {
      const mapCollectibles = this.buildMapAuthoredCollectibles();
      if (mapCollectibles.size > 0) {
        mapCollectibles.forEach((point, key) => {
          this.pointsByTile.set(key, point);
        });
      } else {
        this.buildAlgorithmicCollectibles();
      }
    }

    this.initialPoints = Array.from(this.pointsByTile.values(), (point) => ({
      ...point,
      tile: { ...point.tile },
    }));
  }

  update(deltaMs: number): void {
    this.consumeTouchingPoint();
    this.updateEatEffects(deltaMs);
  }

  getPoints(): Iterable<CollectiblePoint> {
    return this.pointsByTile.values();
  }

  getPointCount(): number {
    return this.pointsByTile.size;
  }

  /** Returns the pickup content revision, including same-count stream replacements. */
  getRevision(): number {
    return this.revision;
  }

  /** Counts only pickups the Packet touched, independent of section eviction. */
  getCollectedCount(): number {
    return this.collectedCount;
  }

  /** Keeps resident pickups and creates fresh points for an incoming maze section. */
  shiftEndlessSection(section: ResidentEndlessSection, rows: number, newSlot: number): void {
    const pixels = rows * this.world.tileSize;
    const retained = Array.from(this.pointsByTile.values()).map((point) => ({
      ...point, tile: { x: point.tile.x, y: point.tile.y + rows }, y: point.y + pixels,
    })).filter((point) => point.tile.y >= 0 && point.tile.y < this.world.map.height);
    this.pointsByTile.clear();
    retained.forEach((point) => this.pointsByTile.set(tileKey(point.tile), point));
    const layout = buildPointLayout({
      map: section.map,
      collisionGrid: new CollisionGrid(section.map.tiles.map((row) => row.map((tile) => tile.collision))),
      startTile: { x: Math.floor(section.map.width / 2), y: Math.floor(section.map.height / 2) },
      tileSize: this.world.tileSize,
      options: { seed: section.pickupSeed,
        powerPointRatio: ENDLESS_SETTINGS.powerCoresPerTile,
        minPowerPoints: ENDLESS_SETTINGS.sectionPowerCores.min,
        maxPowerPoints: ENDLESS_SETTINGS.sectionPowerCores.max },
    });
    const add = (tiles: readonly TilePosition[], kind: CollectibleKind): void => {
      tiles.forEach((tile) => {
        const positioned = { x: tile.x, y: tile.y + newSlot * section.map.height };
        const center = this.toPointCenter(positioned);
        this.pointsByTile.set(tileKey(positioned), { tile: positioned, ...center, kind });
      });
    };
    add(layout.basePoints, 'base');
    add(layout.powerPoints, 'power');
    this.eatEffects.forEach((effect) => { effect.y += pixels; });
    this.revision += 1;
  }

  getEatEffects(): readonly EatEffect[] {
    return this.eatEffects;
  }

  /** Restores the original collectible layout and clears effects from the completed level. */
  refill(): number {
    this.world.visitedPacketTiles.clear();
    this.pointsByTile.clear();
    this.eatEffects.length = 0;
    this.initialPoints.forEach((point) => {
      this.pointsByTile.set(tileKey(point.tile), { ...point, tile: { ...point.tile } });
    });
    return this.pointsByTile.size;
  }

  /** Collects one point as soon as its visible footprint overlaps the Packet. */
  private consumeTouchingPoint(): void {
    if (this.world.outcome || this.world.packet.deathAnimationRemainingMs > 0) return;
    const point = this.findTouchingPoint();
    if (!point) return;

    this.pointsByTile.delete(tileKey(point.tile));
    this.collectedCount += 1;
    this.revision += 1;

    const baseScore = point.kind === 'power' ? COLLECTIBLE_CONFIG[1].score : COLLECTIBLE_CONFIG[0].score;
    awardScore(this.world, baseScore);
    if (point.kind === 'power') {
      this.triggerScaredEnemyWindow();
    }
    this.triggerPacketEatAnimation();

    this.eatEffects.push(createEatEffect(point.kind, point.x, point.y));
  }

  private triggerPacketEatAnimation(): void {
    const playback = this.world.packetAnimation;
    playback.active = true;
    playback.frame = 0;
    playback.elapsedMs = 0;
    playback.sequenceIndex = 0;
  }

  private triggerScaredEnemyWindow(): void {
    setActiveEnemiesScaredWindow(this.world, ENEMY_SCARED_DURATION_MS);
    if (this.world.runMode === 'endless') this.world.powerRemainingMs = ENEMY_SCARED_DURATION_MS;
    this.world.enemyEatChainCount = 0;
  }

  /** Checks point tiles within the Packet's reach, including a neighboring tile before its center is crossed. */
  private findTouchingPoint(): CollectiblePoint | undefined {
    const packet = this.world.packet;
    const radius = Math.min(packet.displayWidth, packet.displayHeight) / 2;
    const packetBody = { x: packet.x, y: packet.y, radius };
    const maxPointRadius = Math.max(COLLECTIBLE_CONFIG[0].size, COLLECTIBLE_CONFIG[1].size) / 2;
    const reach = radius + maxPointRadius;
    const minX = Math.floor((packet.x - reach) / this.world.tileSize);
    const maxX = Math.floor((packet.x + reach) / this.world.tileSize);
    const minY = Math.floor((packet.y - reach) / this.world.tileSize);
    const maxY = Math.floor((packet.y + reach) / this.world.tileSize);

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const point = this.pointsByTile.get(tileKey({ x, y }));
        if (!point) continue;
        const pointRadius = COLLECTIBLE_CONFIG[point.kind === 'power' ? 1 : 0].size / 2;
        if (isBodyOverlap(packetBody, { x: point.x, y: point.y, radius: pointRadius })) return point;
      }
    }
  }

  private updateEatEffects(deltaMs: number): void {
    for (let i = this.eatEffects.length - 1; i >= 0; i -= 1) {
      const effect = this.eatEffects[i];
      effect.elapsedMs += deltaMs;
      if (effect.elapsedMs >= effect.durationMs) {
        this.eatEffects.splice(i, 1);
      }
    }
  }

  private buildMapAuthoredCollectibles(): Map<string, CollectiblePoint> {
    const points = new Map<string, CollectiblePoint>();
    const objects = this.world.map.collectibleObjects ?? [];

    objects.forEach((object) => {
      const pointType = getObjectNumberProperty(object, 'pointType');
      const kind: CollectibleKind | null =
        pointType === 1 || object.type === 'power-pellet'
          ? 'power'
          : pointType === 0 || object.type === 'pellet'
            ? 'base'
            : null;
      if (!kind) {
        return;
      }

      const gridX = getObjectNumberProperty(object, 'gridX');
      const gridY = getObjectNumberProperty(object, 'gridY');
      const tile = this.resolveCollectibleTile({ gridX, gridY, x: object.x, y: object.y });
      if (!tile) {
        return;
      }

      const key = tileKey(tile);
      const center = this.toPointCenter(tile);
      const existing = points.get(key);
      if (existing?.kind === 'power') {
        return;
      }

      points.set(key, {
        tile,
        x: center.x,
        y: center.y,
        kind,
      });
    });

    return points;
  }

  private buildAlgorithmicCollectibles(): void {
    const pointLayout = buildPointLayout({
      map: this.world.map,
      collisionGrid: this.world.collisionGrid,
      startTile: this.world.packet.tile,
      tileSize: this.world.tileSize,
      ...(this.world.runMode === 'endless'
        ? { options: { seed: this.endlessPickupSeed,
          powerPointRatio: ENDLESS_SETTINGS.powerCoresPerTile,
          minPowerPoints: ENDLESS_SETTINGS.initialPowerCores.min,
          maxPowerPoints: ENDLESS_SETTINGS.initialPowerCores.max } } : {}),
    });

    const powerTiles = new Set(pointLayout.powerPoints.map((tile) => tileKey(tile)));
    pointLayout.basePoints.forEach((tile) => {
      const key = tileKey(tile);
      const center = this.toPointCenter(tile);
      this.pointsByTile.set(key, {
        tile,
        x: center.x,
        y: center.y,
        kind: powerTiles.has(key) ? 'power' : 'base',
      });
    });
  }

  private resolveCollectibleTile(params: {
    gridX: number | undefined;
    gridY: number | undefined;
    x: number | undefined;
    y: number | undefined;
  }): TilePosition | null {
    if (typeof params.gridX === 'number' && typeof params.gridY === 'number') {
      return { x: params.gridX, y: params.gridY };
    }
    if (typeof params.x === 'number' && typeof params.y === 'number') {
      return {
        x: Math.floor(params.x / this.world.tileSize),
        y: Math.floor(params.y / this.world.tileSize),
      };
    }
    return null;
  }

  private toPointCenter(tile: TilePosition): { x: number; y: number } {
    return {
      x: tile.x * this.world.tileSize + this.world.tileSize / 2,
      y: tile.y * this.world.tileSize + this.world.tileSize / 2,
    };
  }
}
