import { ENEMY_CONFIG, PACKET_DEATH_RECOVERY, PACKET_PORTAL_BLINK, SPEED } from '../../config/constants';
import { PortalService } from '../domain/services/PortalService';
import { MovementRules } from '../domain/services/MovementRules';
import { OPPOSITE_DIRECTION } from '../domain/valueObjects/Direction';
import { WorldState } from '../domain/world/WorldState';
import { resolveNextBlinkToggleAt } from '../shared/blinkCadence';

export class PacketMovementSystem {
  constructor(
    private readonly world: WorldState,
    private readonly movementRules: MovementRules,
    private readonly portalService: PortalService,
  ) {}

  /** Returns the next center or portal threshold so the runtime can preserve the full movement budget. */
  getSimulationBoundaryMs(maximumMs: number): number {
    if (this.world.packet.deathAnimationRemainingMs > 0) return maximumMs;
    const packet = this.world.packet;
    const direction = packet.direction.next === OPPOSITE_DIRECTION[packet.direction.current]
      ? packet.direction.next : packet.direction.current;
    const occupiedX = Math.floor(packet.x / this.world.tileSize);
    const occupiedY = Math.floor(packet.y / this.world.tileSize);
    const slowed = this.world.lagZones.some((zone) => zone.ageMs < zone.durationMs
      && zone.tile.x === occupiedX && zone.tile.y === occupiedY);
    const speed = SPEED.packet * (slowed ? ENEMY_CONFIG.lag.slowMultiplier : 1);
    const centerDistance = this.movementRules.getDistanceToCenter(packet, direction);
    const portalDistance = this.portalService.getDistanceToTeleport(
      { tile: packet.tile, moved: packet.moved, direction }, this.world.collisionGrid, this.world.tileSize);
    const distance = portalDistance === null ? centerDistance : Math.min(centerDistance, portalDistance);
    return Math.min(maximumMs, this.movementRules.timeForDistance(distance, speed));
  }

  /** Advances Packet movement and protection effects using the current level multiplier. */
  update(deltaMs = 1000 / 60): void {
    if (this.world.packet.deathAnimationRemainingMs > 0) return;
    const previousX = this.world.packet.x;
    const previousY = this.world.packet.y;
    this.updatePortalBlink(deltaMs);
    this.updateDeathRecovery(deltaMs);

    const collisionTiles = this.world.collisionGrid.getTilesAt(this.world.packet.tile);
    this.movementRules.applyBufferedDirection(this.world.packet, collisionTiles, (direction) => {
      return this.portalService.canAdvanceOutward(
        { tile: this.world.packet.tile, moved: this.world.packet.moved, direction }, this.world.collisionGrid);
    });
    this.updateDirectionVisuals();

    const canMoveCurrent = this.movementRules.canMove(
      this.world.packet.direction.current,
      this.world.packet.moved.y,
      this.world.packet.moved.x,
      collisionTiles,
    );
    const canAdvanceOutward = this.portalService.canAdvanceOutward(this.world.packet, this.world.collisionGrid);

    if (canMoveCurrent || canAdvanceOutward) {
      const occupiedX = Math.floor(this.world.packet.x / this.world.tileSize);
      const occupiedY = Math.floor(this.world.packet.y / this.world.tileSize);
      const slowed = this.world.lagZones.some((zone) => zone.ageMs < zone.durationMs
        && zone.tile.x === occupiedX && zone.tile.y === occupiedY);
      const speed = SPEED.packet * (slowed ? ENEMY_CONFIG.lag.slowMultiplier : 1);
      const portalDistance = this.portalService.getDistanceToTeleport(
        this.world.packet, this.world.collisionGrid, this.world.tileSize);
      this.movementRules.advanceEntity(
        this.world.packet,
        this.world.packet.direction.current,
        this.movementRules.movementDistance(speed, deltaMs),
        portalDistance ?? Infinity,
      );
    } else {
      this.movementRules.discardPendingDistance(this.world.packet);
    }

    const teleported = this.portalService.tryTeleport(
      this.world.packet,
      this.world.collisionGrid,
      this.world.tick,
      this.world.tileSize,
    );
    if (teleported && this.world.packet.portalBlinkRemainingMs !== Infinity) {
      this.world.packet.portalBlinkRemainingMs = PACKET_PORTAL_BLINK.durationMs;
      this.world.packet.portalBlinkElapsedMs = 0;
    }

    this.movementRules.syncEntityPosition(this.world.packet);
    if (this.world.packet.x !== previousX || this.world.packet.y !== previousY) this.world.recordPacketVisit();
  }

  private updatePortalBlink(deltaMs: number): void {
    const remaining = this.world.packet.portalBlinkRemainingMs ?? 0;
    if (remaining <= 0) {
      this.world.packet.portalBlinkRemainingMs = 0;
      this.world.packet.portalBlinkElapsedMs = 0;
      return;
    }

    const safeDelta = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
    const nextRemaining = Math.max(0, remaining - safeDelta);
    this.world.packet.portalBlinkRemainingMs = nextRemaining;

    if (nextRemaining <= 0) {
      this.world.packet.portalBlinkElapsedMs = 0;
      return;
    }

    const elapsed = this.world.packet.portalBlinkElapsedMs ?? 0;
    this.world.packet.portalBlinkElapsedMs = elapsed + safeDelta;
  }

  private updateDeathRecovery(deltaMs: number): void {
    const remaining = this.world.packet.deathRecoveryRemainingMs ?? 0;
    if (remaining <= 0) {
      this.world.packet.deathRecoveryRemainingMs = 0;
      this.world.packet.deathRecoveryElapsedMs = 0;
      this.world.packet.deathRecoveryNextToggleAtMs = 0;
      this.world.packet.deathRecoveryVisible = true;
      return;
    }

    const safeDelta = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
    const elapsedBefore = this.world.packet.deathRecoveryElapsedMs ?? 0;
    const elapsedAfter = Math.min(PACKET_DEATH_RECOVERY.durationMs, elapsedBefore + safeDelta);
    const nextRemaining = Math.max(0, remaining - safeDelta);
    this.world.packet.deathRecoveryElapsedMs = elapsedAfter;
    this.world.packet.deathRecoveryRemainingMs = nextRemaining;

    if (nextRemaining <= 0) {
      this.world.packet.deathRecoveryElapsedMs = 0;
      this.world.packet.deathRecoveryNextToggleAtMs = 0;
      this.world.packet.deathRecoveryVisible = true;
      return;
    }

    let nextToggleAtMs = this.world.packet.deathRecoveryNextToggleAtMs;
    if (!Number.isFinite(nextToggleAtMs) || nextToggleAtMs <= 0) {
      nextToggleAtMs = resolveNextBlinkToggleAt(elapsedBefore, PACKET_DEATH_RECOVERY.durationMs, PACKET_DEATH_RECOVERY);
    }

    while (nextToggleAtMs > 0 && elapsedAfter >= nextToggleAtMs) {
      this.world.packet.deathRecoveryVisible = !this.world.packet.deathRecoveryVisible;
      nextToggleAtMs = resolveNextBlinkToggleAt(nextToggleAtMs, PACKET_DEATH_RECOVERY.durationMs, PACKET_DEATH_RECOVERY);
    }

    this.world.packet.deathRecoveryNextToggleAtMs = nextToggleAtMs;
  }

  private updateDirectionVisuals(): void {
    if (this.world.packet.direction.current === 'right') {
      this.world.packet.angle = 0;
      this.world.packet.flipY = false;
      return;
    }

    if (this.world.packet.direction.current === 'left') {
      this.world.packet.angle = 180;
      this.world.packet.flipY = true;
      return;
    }

    if (this.world.packet.direction.current === 'up') {
      this.world.packet.angle = -90;
      return;
    }

    if (this.world.packet.direction.current === 'down') {
      this.world.packet.angle = 90;
    }
  }

}
