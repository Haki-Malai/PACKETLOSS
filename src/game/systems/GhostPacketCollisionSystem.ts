import {
  GHOST_EAT_CHAIN_SCORES,
  PACKET_DEATH_ANIMATION,
  PACKET_DEATH_RECOVERY,
  SPEED,
} from '../../config/constants';
import { addScore, getGameState, loseLife } from '../../state/gameState';
import { GhostEntity } from '../domain/entities/GhostEntity';
import { CollisionBody } from '../domain/valueObjects/CollisionBody';
import { GhostCollisionCandidate, findFirstCollision } from '../domain/services/GhostPacketCollisionService';
import { clearGhostScaredWindow } from '../domain/services/GhostScaredStateService';
import { MovementRules } from '../domain/services/MovementRules';
import { WorldState } from '../domain/world/WorldState';
import { GHOST_EAT_DURATION_MS } from '../shared/ghostEating';

const PACKET_RESPAWN_DIRECTION = 'right';

export class GhostPacketCollisionSystem {
  constructor(
    private readonly world: WorldState,
    private readonly movementRules: MovementRules,
    _defaultGhostSpeed: number = SPEED.ghost,
  ) {}

  update(deltaMs = 0): void {
    if (!this.world.isMoving) return;
    if (this.world.outcome) return;
    const elapsed = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
    this.world.packet.ghostEatRemainingMs = Math.max(0, this.world.packet.ghostEatRemainingMs - elapsed);
    this.resetGhostEatChainIfNoScaredGhosts();
    if (this.world.packet.deathAnimationRemainingMs > 0) {
      this.world.packet.deathAnimationRemainingMs = Math.max(0, this.world.packet.deathAnimationRemainingMs - elapsed);
      if (this.world.packet.deathAnimationRemainingMs === 0) {
        if (getGameState().lives === 0) this.world.outcome = 'lost';
        else this.respawnPacket();
      }
      return;
    }
    if (this.isPacketInDeathRecovery()) {
      return;
    }

    const collisionActiveGhosts = this.world.ghosts.filter((ghost) => {
      return ghost.active && ghost.state.free && !ghost.state.dead && !this.world.ghostsExitingJail.has(ghost);
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
    this.world.packet.ghostEatRemainingMs = 0;
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
    ghost.speed = ghost.baseSpeed;
    ghost.state.free = false;
    ghost.state.soonFree = false;
    ghost.state.dead = true;
    ghost.state.animation = 'default';
    ghost.eatenElapsedMs = 0;
    this.world.packet.ghostEatRemainingMs = GHOST_EAT_DURATION_MS;
  }

  private isPacketInDeathRecovery(): boolean {
    return (this.world.packet.deathRecoveryRemainingMs ?? 0) > 0;
  }

  private isPacketInPortalShieldWindow(): boolean {
    return (this.world.packet.portalBlinkRemainingMs ?? 0) > 0;
  }

  private resetGhostEatChainIfNoScaredGhosts(): void {
    const hasScaredGhost = this.world.ghosts.some((ghost) => ghost.active && ghost.state.scared);
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
