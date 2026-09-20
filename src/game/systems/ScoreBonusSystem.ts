import { getScoreBonusStatus, setScoreBonusStatus } from '../../state/gameState';
import {
    SCORE_BONUS_ACTIVE_MS,
    SCORE_BONUS_TIERS,
    type ScoreBonusKind,
} from '../domain/valueObjects/ScoreBonus';
import { isBodyOverlap } from '../domain/services/EnemyPacketCollisionService';
import type { TilePosition } from '../domain/valueObjects/TilePosition';
import type { WorldState } from '../domain/world/WorldState';
import type { CollectibleSystem } from './CollectibleSystem';

export interface ScoreBonusPickup {
    kind: ScoreBonusKind;
    multiplier: number;
    x: number;
    y: number;
}

/** Owns five fixed-position pickups and the temporary scoring factor for each level. */
export class ScoreBonusSystem {
    private initialPointCount: number;
    private pickups: ScoreBonusPickup[] = [];
    private activeRemainingMs = 0;
    private activeKind: ScoreBonusKind | null = null;

    constructor(
        private readonly world: WorldState,
        private readonly collectibles: Pick<CollectibleSystem, 'getPointCount'>,
        private readonly tiles: readonly TilePosition[]
    ) {
        this.initialPointCount = collectibles.getPointCount();
        this.placePickups();
        this.publishStatus();
    }

    /** Returns the uncollected pickups without advancing the boost timer. */
    getPickups(): readonly Readonly<ScoreBonusPickup>[] {
        return this.pickups;
    }

    /** Checks fixed pickups and advances the active boost in simulation time. */
    update(deltaMs: number): void {
        if (!this.world.isMoving) return;
        if (
            this.world.outcome ||
            (this.initialPointCount > 0 && this.collectibles.getPointCount() === 0)
        ) {
            this.clearLevel();
            return;
        }
        if (this.world.packet.deathAnimationRemainingMs > 0) this.endBoost();
        else {
            if (this.activeRemainingMs > 0) {
                this.activeRemainingMs = Math.max(0, this.activeRemainingMs - deltaMs);
                if (this.activeRemainingMs === 0) this.endBoost();
            }
            const packet = this.world.packet;
            const radius = Math.min(packet.displayWidth, packet.displayHeight) / 2;
            const index = this.pickups.findIndex((pickup) =>
                isBodyOverlap(
                    { x: packet.x, y: packet.y, radius },
                    { x: pickup.x, y: pickup.y, radius: 2.5 }
                )
            );
            if (index >= 0) {
                const [pickup] = this.pickups.splice(index, 1);
                this.activeRemainingMs = SCORE_BONUS_ACTIVE_MS;
                this.activeKind = pickup.kind;
                this.world.scoreBonusMultiplier *= pickup.multiplier;
            }
        }
        this.publishStatus();
    }

    /** Starts the next level with all five pickups at their original positions. */
    refill(): void {
        this.clearLevel();
        this.initialPointCount = this.collectibles.getPointCount();
        this.placePickups();
        this.publishStatus();
    }

    /** Removes uncollected pickups and the active boost at a clear checkpoint. */
    clearLevel(): void {
        this.pickups = [];
        this.endBoost();
        this.publishStatus();
    }

    /** Places authored tiles that exist outside the enemy pen. */
    private placePickups(): void {
        if (this.initialPointCount === 0) return;
        this.pickups = SCORE_BONUS_TIERS.flatMap((tier, index) => {
            const tile = this.tiles[index];
            if (!tile) return [];
            const mapTile = this.world.map.tiles[tile.y]?.[tile.x];
            if (!mapTile || mapTile.gid === null || mapTile.collision.penGate) return [];
            return [{
                kind: tier.kind,
                multiplier: tier.multiplier,
                x: (tile.x + 0.5) * this.world.tileSize,
                y: (tile.y + 0.5) * this.world.tileSize,
            }];
        });
    }

    /** Ends the active multiplier without disturbing uncollected pickups. */
    private endBoost(): void {
        this.activeRemainingMs = 0;
        this.activeKind = null;
        this.world.scoreBonusMultiplier = 1;
    }

    /** Updates the HUD only when the available state or whole-second boost changes. */
    private publishStatus(): void {
        const next =
            this.activeRemainingMs > 0 && this.activeKind
                ? {
                      kind: this.activeKind,
                      multiplier: this.world.scoreBonusMultiplier,
                      seconds: Math.ceil(this.activeRemainingMs / 1000),
                      phase: 'active' as const,
                  }
                : this.pickups.length > 0
                  ? {
                        count: this.pickups.length,
                        phase: 'available' as const,
                    }
                  : null;
        if (next || getScoreBonusStatus()) setScoreBonusStatus(next);
    }
}
