import {
  ENEMY_EAT_CHAIN_SCORES,
  PACKET_DEATH_ANIMATION,
  PACKET_DEATH_RECOVERY,
  SPEED,
} from '../../config/constants';
import { addScore, getGameState, loseLife } from '../../state/gameState';
import { EnemyEntity } from '../domain/entities/EnemyEntity';
import { CollisionBody } from '../domain/valueObjects/CollisionBody';
import { EnemyCollisionCandidate, findFirstCollision } from '../domain/services/EnemyPacketCollisionService';
import { clearEnemyScaredWindow } from '../domain/services/EnemyScaredStateService';
import { MovementRules } from '../domain/services/MovementRules';
import { WorldState } from '../domain/world/WorldState';
import { ENEMY_EAT_DURATION_MS } from '../shared/enemyEating';

const PACKET_RESPAWN_DIRECTION = 'right';

export class EnemyPacketCollisionSystem {
  constructor(
    private readonly world: WorldState,
    private readonly movementRules: MovementRules,
    _defaultEnemySpeed: number = SPEED.enemy,
    private readonly onPacketRespawn?: () => void,
  ) {}

  /** Resolves collisions and advances death timing using scaled simulation time. */
  update(deltaMs = 0): void {
    if (!this.world.isMoving) return;
    if (this.world.outcome) return;
    const elapsed = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
    this.world.packet.enemyEatRemainingMs = Math.max(0, this.world.packet.enemyEatRemainingMs - elapsed);
    this.resetEnemyEatChainIfNoScaredEnemies();
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

    const collisionActiveEnemies = this.world.enemies.filter((enemy) => {
      return enemy.active && enemy.state.free && !enemy.state.dead && !this.world.enemiesExitingJail.has(enemy);
    });

    const collision = findFirstCollision({
      packet: this.toCollisionBody(this.world.packet),
      enemies: this.buildEnemyCandidates(collisionActiveEnemies),
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

    this.applyEnemyHitOutcome(collision.enemy);
    this.resetEnemyEatChainIfNoScaredEnemies();
  }

  destroy(): void {}

  private applyPacketHitOutcome(): void {
    loseLife();
    this.world.packet.enemyEatRemainingMs = 0;
    this.world.packet.deathAnimationRemainingMs = PACKET_DEATH_ANIMATION.durationMs;
  }

  /** Restores the Packet after a nonfinal death, then resets enemies through the owning composition. */
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
    this.onPacketRespawn?.();
  }

  /** Applies the level-scaled chain award and starts the enemy's harmless return state. */
  private applyEnemyHitOutcome(enemy: EnemyEntity): void {
    const chainScoreIndex = Math.min(this.world.enemyEatChainCount, ENEMY_EAT_CHAIN_SCORES.length - 1);
    const baseScore = ENEMY_EAT_CHAIN_SCORES[chainScoreIndex]
      ?? ENEMY_EAT_CHAIN_SCORES[ENEMY_EAT_CHAIN_SCORES.length - 1];
    addScore(Math.round(baseScore * this.world.levelMultiplier));
    this.world.enemyEatChainCount += 1;

    this.world.enemiesExitingJail.delete(enemy);
    clearEnemyScaredWindow(this.world, enemy);
    enemy.speed = enemy.baseSpeed * this.world.levelMultiplier;
    enemy.state.free = false;
    enemy.state.soonFree = false;
    enemy.state.dead = true;
    enemy.state.animation = 'default';
    enemy.eatenElapsedMs = 0;
    this.world.packet.enemyEatRemainingMs = ENEMY_EAT_DURATION_MS;
  }

  private isPacketInDeathRecovery(): boolean {
    return (this.world.packet.deathRecoveryRemainingMs ?? 0) > 0;
  }

  private isPacketInPortalShieldWindow(): boolean {
    return (this.world.packet.portalBlinkRemainingMs ?? 0) > 0;
  }

  private resetEnemyEatChainIfNoScaredEnemies(): void {
    const hasScaredEnemy = this.world.enemies.some((enemy) => enemy.active && enemy.state.scared);
    if (!hasScaredEnemy) {
      this.world.enemyEatChainCount = 0;
    }
  }

  private buildEnemyCandidates(enemies: EnemyEntity[]): EnemyCollisionCandidate[] {
    return enemies.map((enemy) => ({ enemy, body: this.toCollisionBody(enemy) }));
  }

  private toCollisionBody(
    entity: Pick<EnemyEntity, 'x' | 'y' | 'displayWidth' | 'displayHeight'>,
  ): CollisionBody {
    return {
      x: entity.x,
      y: entity.y,
      radius: Math.min(entity.displayWidth, entity.displayHeight) / 2,
    };
  }
}
