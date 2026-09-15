import { COLLECTIBLE_CONFIG, ENEMY_SCARED_DURATION_MS } from '../../config/constants';
import { addScore } from '../../state/gameState';
import { setActiveEnemiesScaredWindow } from '../domain/services/EnemyScaredStateService';
import { buildPointLayout } from '../domain/services/PointLayoutService';
import { TilePosition } from '../domain/valueObjects/TilePosition';
import { WorldState } from '../domain/world/WorldState';
import { createEatEffect, type CollectibleKind, type EatEffect } from '../shared/pickupEffects';

const POINT_CONSUME_MOVEMENT_EPSILON = 0.001;
const POINT_CONSUME_POSITION_EPSILON = 0.01;

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

function getObjectNumberProperty(
  object: {
    properties?: Array<{
      name: string;
      value: unknown;
    }>;
  },
  name: string,
): number | undefined {
  const property = object.properties?.find((entry) => entry.name === name);
  return typeof property?.value === 'number' ? property.value : undefined;
}

export class CollectibleSystem {
  private readonly pointsByTile = new Map<string, CollectiblePoint>();
  private readonly eatEffects: EatEffect[] = [];
  private readonly initialPoints: readonly CollectiblePoint[];

  constructor(private readonly world: WorldState, points?: readonly CollectiblePoint[]) {
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
    this.consumePointAtPacketTile();
    this.updateEatEffects(deltaMs);
  }

  getPoints(): Iterable<CollectiblePoint> {
    return this.pointsByTile.values();
  }

  getPointCount(): number {
    return this.pointsByTile.size;
  }

  getEatEffects(): readonly EatEffect[] {
    return this.eatEffects;
  }

  /** Restores the original collectible layout and clears effects from the completed level. */
  refill(): number {
    this.pointsByTile.clear();
    this.eatEffects.length = 0;
    this.initialPoints.forEach((point) => {
      this.pointsByTile.set(tileKey(point.tile), { ...point, tile: { ...point.tile } });
    });
    return this.pointsByTile.size;
  }

  private consumePointAtPacketTile(): void {
    if (this.world.outcome || this.world.packet.deathAnimationRemainingMs > 0) return;
    const key = tileKey(this.world.packet.tile);
    const point = this.pointsByTile.get(key);
    if (!point || !this.isPacketCenteredOnPoint(point)) {
      return;
    }

    this.pointsByTile.delete(key);

    const baseScore = point.kind === 'power' ? COLLECTIBLE_CONFIG[1].score : COLLECTIBLE_CONFIG[0].score;
    const scoreDelta = Math.round(baseScore * this.world.levelMultiplier);
    addScore(scoreDelta);
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
    this.world.enemyEatChainCount = 0;
  }

  private isPacketCenteredOnPoint(point: CollectiblePoint): boolean {
    if (
      Math.abs(this.world.packet.moved.x) > POINT_CONSUME_MOVEMENT_EPSILON ||
      Math.abs(this.world.packet.moved.y) > POINT_CONSUME_MOVEMENT_EPSILON
    ) {
      return false;
    }

    return (
      Math.abs(this.world.packet.x - point.x) <= POINT_CONSUME_POSITION_EPSILON &&
      Math.abs(this.world.packet.y - point.y) <= POINT_CONSUME_POSITION_EPSILON
    );
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
