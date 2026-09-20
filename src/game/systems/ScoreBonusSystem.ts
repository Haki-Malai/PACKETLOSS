import { getScoreBonusStatus, setScoreBonusStatus } from '../../state/gameState';
import {
    SCORE_BONUS_ACTIVE_MS,
    SCORE_BONUS_MILESTONES,
    SCORE_BONUS_PICKUP_MS,
    scoreBonusTier,
    type ScoreBonusKind,
} from '../domain/valueObjects/ScoreBonus';
import { isBodyOverlap } from '../domain/services/EnemyPacketCollisionService';
import { canMove } from '../domain/services/MovementRules';
import { DIRECTIONS, DIRECTION_VECTORS } from '../domain/valueObjects/Direction';
import type { TilePosition } from '../domain/valueObjects/TilePosition';
import type { WorldState } from '../domain/world/WorldState';
import type { CollectibleSystem } from './CollectibleSystem';

export interface ScoreBonusPickup {
    kind: ScoreBonusKind;
    x: number;
    y: number;
    remainingMs: number;
}

/** Selects one stable packet-reachable tile near the pen without consuming randomness. */
export function findScoreBonusTile(
    world: WorldState,
    collectibles: Pick<CollectibleSystem, 'getPoints'>
): TilePosition | null {
    const occupied = new Set(
        Array.from(collectibles.getPoints(), (point) => `${point.tile.x},${point.tile.y}`)
    );
    const portals = new Set(
        (world.map.portalPairs ?? []).flatMap((pair) => [
            `${pair.from.x},${pair.from.y}`,
            `${pair.to.x},${pair.to.y}`,
        ])
    );
    const queue = [world.packetSpawnTile];
    const seen = new Set<string>();
    const centerX = (world.enemyJailBounds.minX + world.enemyJailBounds.maxX) / 2;
    const centerY = world.enemyJailBounds.y + 1;
    let best: { tile: TilePosition; distance: number; occupied: boolean } | null = null;

    for (let index = 0; index < queue.length; index += 1) {
        const tile = queue[index];
        const key = `${tile.x},${tile.y}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const mapTile = world.map.tiles[tile.y]?.[tile.x];
        if (!mapTile || mapTile.gid === null || mapTile.collision.penGate) continue;
        const distance = Math.abs(tile.x - centerX) + Math.abs(tile.y - centerY);
        const hasPoint = occupied.has(key);
        if (
            !portals.has(key) &&
            (!best ||
                distance < best.distance ||
                (distance === best.distance && Number(hasPoint) < Number(best.occupied)) ||
                (distance === best.distance &&
                    hasPoint === best.occupied &&
                    (tile.y < best.tile.y || (tile.y === best.tile.y && tile.x < best.tile.x))))
        ) {
            best = { tile, distance, occupied: hasPoint };
        }
        const collisionTiles = world.collisionGrid.getTilesAt(tile);
        for (const direction of DIRECTIONS) {
            const delta = DIRECTION_VECTORS[direction];
            const next = { x: tile.x + delta.dx, y: tile.y + delta.dy };
            const nextMapTile = world.map.tiles[next.y]?.[next.x];
            if (nextMapTile?.gid === null || !nextMapTile || nextMapTile.collision.penGate)
                continue;
            if (canMove(direction, 0, 0, collisionTiles, world.tileSize, 'packet'))
                queue.push(next);
        }
    }
    return best?.tile ?? null;
}

/** Owns deterministic pickup scheduling and its temporary scoring factor. */
export class ScoreBonusSystem {
    private level = 1;
    private initialPointCount: number;
    private nextMilestone = 0;
    private pending = 0;
    private pickup: ScoreBonusPickup | null = null;
    private activeRemainingMs = 0;
    private readonly tile: TilePosition | null;

    constructor(
        private readonly world: WorldState,
        private readonly collectibles: Pick<CollectibleSystem, 'getPointCount' | 'getPoints'>
    ) {
        this.initialPointCount = collectibles.getPointCount();
        this.tile = findScoreBonusTile(world, collectibles);
    }

    /** Returns the current world pickup without advancing either timer. */
    getPickup(): Readonly<ScoreBonusPickup> | null {
        return this.pickup;
    }

    /** Advances simulation-time windows after regular collection and enemy collisions. */
    update(deltaMs: number): void {
        if (!this.world.isMoving) return;
        if (
            this.world.outcome ||
            (this.initialPointCount > 0 && this.collectibles.getPointCount() === 0)
        ) {
            this.clearLevel();
            return;
        }
        if (!this.tile || this.initialPointCount === 0) return;

        if (this.world.packet.deathAnimationRemainingMs > 0) this.endBoost();
        else if (this.activeRemainingMs > 0) {
            this.activeRemainingMs = Math.max(0, this.activeRemainingMs - deltaMs);
            if (this.activeRemainingMs === 0) this.endBoost();
        }
        if (this.pickup) {
            this.pickup.remainingMs = Math.max(0, this.pickup.remainingMs - deltaMs);
            if (this.pickup.remainingMs === 0) this.pickup = null;
        }
        if (this.pickup && this.world.packet.deathAnimationRemainingMs === 0) {
            const packet = this.world.packet;
            const radius = Math.min(packet.displayWidth, packet.displayHeight) / 2;
            if (
                isBodyOverlap(
                    { x: packet.x, y: packet.y, radius },
                    { x: this.pickup.x, y: this.pickup.y, radius: 2.5 }
                )
            ) {
                this.pickup = null;
                this.activeRemainingMs = SCORE_BONUS_ACTIVE_MS;
                this.world.scoreBonusMultiplier = scoreBonusTier(this.level).multiplier;
            }
        }

        const collected = this.initialPointCount - this.collectibles.getPointCount();
        while (
            this.nextMilestone < SCORE_BONUS_MILESTONES.length &&
            collected >=
                Math.ceil(this.initialPointCount * SCORE_BONUS_MILESTONES[this.nextMilestone])
        ) {
            this.pending += 1;
            this.nextMilestone += 1;
        }
        if (!this.pickup && this.pending > 0) {
            this.pending -= 1;
            const x = (this.tile.x + 0.5) * this.world.tileSize;
            const y = (this.tile.y + 0.5) * this.world.tileSize;
            this.pickup = {
                kind: scoreBonusTier(this.level).kind,
                x,
                y,
                remainingMs: SCORE_BONUS_PICKUP_MS,
            };
        }
        this.publishStatus();
    }

    /** Starts the next level with the same fixed tile and two fresh milestones. */
    refill(): void {
        this.clearLevel();
        this.level += 1;
        this.initialPointCount = this.collectibles.getPointCount();
        this.nextMilestone = 0;
    }

    /** Removes pending pickups and the temporary scoring factor at a clear checkpoint. */
    clearLevel(): void {
        this.pickup = null;
        this.pending = 0;
        this.endBoost();
        this.publishStatus();
    }

    /** Ends the active multiplier without disturbing an uncollected pickup. */
    private endBoost(): void {
        this.activeRemainingMs = 0;
        this.world.scoreBonusMultiplier = 1;
    }

    /** Updates the HUD only when the displayed whole-second value changes. */
    private publishStatus(): void {
        const tier = scoreBonusTier(this.level);
        const next =
            this.activeRemainingMs > 0
                ? {
                      kind: tier.kind,
                      multiplier: tier.multiplier,
                      seconds: Math.ceil(this.activeRemainingMs / 1000),
                      phase: 'active' as const,
                  }
                : this.pickup
                  ? {
                        kind: tier.kind,
                        multiplier: tier.multiplier,
                        seconds: Math.ceil(this.pickup.remainingMs / 1000),
                        phase: 'available' as const,
                    }
                  : null;
        if (next || getScoreBonusStatus()) setScoreBonusStatus(next);
    }
}
