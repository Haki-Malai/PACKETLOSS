import {
  GHOST_EAT_CHAIN_SCORES,
  PACKET_DEATH_ANIMATION,
  PACKET_DEATH_RECOVERY,
  SPEED,
} from '../../config/constants';
import { addScore, loseLife } from '../../state/gameState';
import { GhostEntity } from '../domain/entities/GhostEntity';
import { CollisionBody } from '../domain/valueObjects/CollisionBody';
import { GhostCollisionCandidate, findFirstCollision } from '../domain/services/GhostPacketCollisionService';
import { clearGhostScaredWindow } from '../domain/services/GhostScaredStateService';
import { MovementRules } from '../domain/services/MovementRules';
import { WorldState } from '../domain/world/WorldState';

const PACKET_RESPAWN_DIRECTION = 'right';

export class GhostPacketCollisionSystem {
  constructor(
    private readonly world: WorldState,
    private readonly movementRules: MovementRules,
    private readonly defaultGhostSpeed: number = SPEED.ghost,
  ) {}

  update(deltaMs = 0): void {
    this.resetGhostEatChainIfNoScaredGhosts();
    if (this.world.packet.deathAnimationRemainingMs > 0) {
      const elapsed = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
      this.world.packet.deathAnimationRemainingMs = Math.max(0, this.world.packet.deathAnimationRemainingMs - elapsed);
      if (this.world.packet.deathAnimationRemainingMs === 0) this.respawnPacket();
      return;
    }
    if (this.isPacketInDeathRecovery()) {
      return;
    }

    const collisionActiveGhosts = this.world.ghosts.filter((ghost) => {
      return ghost.active && ghost.state.free && !this.world.ghostsExitingJail.has(ghost);
    });

    const collision = findFirstCollision({
      packet: this.toCollisionBody(this.world.packet),
      ghosts: this.buildGhostCandidates(collisionActiveGhosts),
    });

    if (!collision) {
      return;
    }

    if (collision.outcome === 'packet-hit' && this.isPacketInPortalShieldWindow()) {
      return;
    }

    if (collision.outcome === 'packet-hit') {
      this.applyPacketHitOutcome();
      return;
    }

    this.applyGhostHitOutcome(collision.ghost);
    this.resetGhostEatChainIfNoScaredGhosts();
  }

  destroy(): void {}

  private applyPacketHitOutcome(): void {
    loseLife();
    this.world.packet.deathAnimationRemainingMs = PACKET_DEATH_ANIMATION.durationMs;
  }

  private respawnPacket(): void {
    this.movementRules.setEntityTile(this.world.packet, this.world.packetSpawnTile);
    this.world.packet.direction.current = PACKET_RESPAWN_DIRECTION;
    this.world.packet.direction.next = PACKET_RESPAWN_DIRECTION;
    this.world.packet.portalBlinkRemainingMs = 0;
    this.world.packet.portalBlinkElapsedMs = 0;
    this.world.packet.deathRecoveryRemainingMs = PACKET_DEATH_RECOVERY.durationMs;
    this.world.packet.deathRecoveryElapsedMs = 0;
    this.world.packet.deathRecoveryNextToggleAtMs = PACKET_DEATH_RECOVERY.blinkStartIntervalMs;
    this.world.packet.deathRecoveryVisible = true;
  }

  private applyGhostHitOutcome(ghost: GhostEntity): void {
    const chainScoreIndex = Math.min(this.world.ghostEatChainCount, GHOST_EAT_CHAIN_SCORES.length - 1);
    addScore(GHOST_EAT_CHAIN_SCORES[chainScoreIndex] ?? GHOST_EAT_CHAIN_SCORES[GHOST_EAT_CHAIN_SCORES.length - 1]);
    this.world.ghostEatChainCount += 1;

    this.world.ghostsExitingJail.delete(ghost);
    clearGhostScaredWindow(this.world, ghost);
    this.movementRules.setEntityTile(ghost, this.world.ghostJailReturnTile);
    ghost.state.free = false;
    ghost.state.soonFree = true;
    ghost.state.dead = false;
    ghost.state.animation = 'default';
    ghost.speed = this.defaultGhostSpeed;
  }

  private isPacketInDeathRecovery(): boolean {
    return (this.world.packet.deathRecoveryRemainingMs ?? 0) > 0;
  }

  private isPacketInPortalShieldWindow(): boolean {
    return (this.world.packet.portalBlinkRemainingMs ?? 0) > 0;
  }

  private resetGhostEatChainIfNoScaredGhosts(): void {
    const hasScaredGhost = this.world.ghosts.some((ghost) => ghost.state.scared);
    if (!hasScaredGhost) {
      this.world.ghostEatChainCount = 0;
    }
  }

  private buildGhostCandidates(ghosts: GhostEntity[]): GhostCollisionCandidate[] {
    return ghosts.map((ghost) => ({ ghost, body: this.toCollisionBody(ghost) }));
  }

  private toCollisionBody(
    entity: Pick<GhostEntity, 'x' | 'y' | 'displayWidth' | 'displayHeight'>,
  ): CollisionBody {
    return {
      x: entity.x,
      y: entity.y,
      radius: Math.min(entity.displayWidth, entity.displayHeight) / 2,
    };
  }
}
