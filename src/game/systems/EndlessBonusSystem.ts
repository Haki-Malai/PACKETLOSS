import { getScoreBonusStatus, setScoreBonusStatus } from '../../state/gameState';
import { isBodyOverlap } from '../domain/services/EnemyPacketCollisionService';
import { SCORE_BONUS_ACTIVE_MS, SCORE_BONUS_TIERS, type ScoreBonusKind } from '../domain/valueObjects/ScoreBonus';
import type { EndlessMazeStream } from '../domain/world/EndlessMazeStream';
import type { WorldState } from '../domain/world/WorldState';
import { SeededRandom } from '../shared/random/SeededRandom';
import { ENDLESS_SETTINGS } from '../shared/endlessSettings';
import type { ScoreBonusPickup } from './ScoreBonusSystem';

interface EndlessBonusPickup extends ScoreBonusPickup {
  sectionIndex: number;
}

/** Keeps one random multiplier icon per resident section and a timed score boost. */
export class EndlessBonusSystem {
  private readonly rng: SeededRandom;
  private pickups: EndlessBonusPickup[] = [];
  private remainingMs = 0;
  private activeKind: ScoreBonusKind | null = null;

  constructor(private readonly world: WorldState, stream: EndlessMazeStream, seed: number) {
    this.rng = new SeededRandom(seed ^ 0xb27c348d);
    stream.getSections().forEach((section, slot) => this.addSection(section.index, slot));
    this.publish();
  }

  /** Returns currently uncollected icons without advancing the boost timer. */
  getPickups(): readonly ScoreBonusPickup[] {
    return this.pickups;
  }

  /** Advances boost time and collects an icon touched by the Packet. */
  update(deltaMs: number): void {
    if (!this.world.isMoving) return;
    if (this.world.packet.deathAnimationRemainingMs > 0 || this.world.outcome) this.endBoost();
    else {
      this.remainingMs = Math.max(0, this.remainingMs - deltaMs);
      if (this.remainingMs === 0) this.endBoost();
      const packet = this.world.packet;
      const radius = Math.min(packet.displayWidth, packet.displayHeight) / 2;
      const index = this.pickups.findIndex((pickup) => isBodyOverlap(
        { x: packet.x, y: packet.y, radius },
        { x: pickup.x, y: pickup.y, radius: 2.5 },
      ));
      if (index >= 0) {
        const [pickup] = this.pickups.splice(index, 1);
        this.remainingMs = SCORE_BONUS_ACTIVE_MS;
        this.activeKind = pickup.kind;
        this.world.scoreBonusMultiplier *= pickup.multiplier;
      }
    }
    this.publish();
  }

  /** Drops an evicted icon and introduces one random kind on the incoming section. */
  shiftSection(evictedIndex: number, addedIndex: number, rows: number, newSlot: number): void {
    this.pickups = this.pickups.filter((pickup) => pickup.sectionIndex !== evictedIndex);
    this.pickups.forEach((pickup) => { pickup.y += rows * this.world.tileSize; });
    this.addSection(addedIndex, newSlot);
    this.publish();
  }

  /** Assigns one icon kind and corridor tile to an incoming section. */
  private addSection(sectionIndex: number, slot: number): void {
    const tier = SCORE_BONUS_TIERS[this.rng.int(SCORE_BONUS_TIERS.length)];
    if (!tier) return;
    const candidates = this.world.map.tiles.slice(slot * ENDLESS_SETTINGS.sectionRows,
      (slot + 1) * ENDLESS_SETTINGS.sectionRows)
      .flat().filter((tile) => tile.localId !== null && tile.localId < 16
        && tile.x > 1 && tile.x < this.world.map.width - 2
        && Math.abs(tile.x - this.world.packet.tile.x) + Math.abs(tile.y - this.world.packet.tile.y) >= 5);
    const tile = candidates[this.rng.int(candidates.length)];
    if (!tile) return;
    this.pickups.push({ sectionIndex, kind: tier.kind, multiplier: tier.multiplier,
      x: (tile.x + 0.5) * this.world.tileSize,
      y: (tile.y + 0.5) * this.world.tileSize });
  }

  /** Clears a timed multiplier after expiry or death. */
  private endBoost(): void {
    this.remainingMs = 0;
    this.activeKind = null;
    this.world.scoreBonusMultiplier = 1;
  }

  /** Sends the active or available icon state to the HUD. */
  private publish(): void {
    const next = this.remainingMs > 0 && this.activeKind
      ? { kind: this.activeKind, multiplier: this.world.scoreBonusMultiplier,
        seconds: Math.ceil(this.remainingMs / 1000), phase: 'active' as const }
      : this.pickups.length > 0
        ? { count: this.pickups.length, phase: 'available' as const }
        : null;
    if (next || getScoreBonusStatus()) setScoreBonusStatus(next);
  }
}
