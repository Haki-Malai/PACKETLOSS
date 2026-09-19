import { ENEMY_SCARED_WARNING_DURATION_MS, PACKET_DEATH_RECOVERY } from '../../config/constants';
import { EnemyEntity } from '../domain/entities/EnemyEntity';
import { clearEnemyScaredWindow } from '../domain/services/EnemyScaredStateService';
import { resolveNextBlinkToggleAt } from '../shared/blinkCadence';
import {
  AnimationKey,
  AnimationPlayback,
  PacketAnimationPlayback,
  WorldState,
} from '../domain/world/WorldState';

interface AnimationDefinition {
  start: number;
  end: number;
  yoyo: boolean;
  frameRate: number;
}

const ANIMATIONS: Record<AnimationKey, AnimationDefinition> = {
  scaredIdle: { start: 0, end: 7, yoyo: true, frameRate: 4 },
  firewallIdle: { start: 0, end: 7, yoyo: true, frameRate: 4 },
  virusIdle: { start: 0, end: 7, yoyo: true, frameRate: 4 },
  pingIdle: { start: 0, end: 7, yoyo: true, frameRate: 4 },
  spamIdle: { start: 0, end: 7, yoyo: true, frameRate: 4 },
  lagIdle: { start: 0, end: 7, yoyo: true, frameRate: 4 },
  quarantineIdle: { start: 0, end: 7, yoyo: true, frameRate: 4 },
  trojanIdle: { start: 0, end: 7, yoyo: true, frameRate: 4 },
};

export const PACKET_CHOMP_SEQUENCE = [0, 1, 2, 3, 2, 1] as const;
const PACKET_IDLE_FRAME = PACKET_CHOMP_SEQUENCE[0];
export const PACKET_CHOMP_FRAME_RATE = 20;

export class AnimationSystem {
  constructor(
    private readonly world: WorldState,
    _defaultEnemySpeed: number,
    private readonly animations: Record<AnimationKey, AnimationDefinition> = ANIMATIONS,
  ) {}

  start(): void {
    this.world.packetAnimation = this.createPacketAnimationPlayback();

    this.world.enemies.forEach((enemy) => {
      if (!enemy.active) return;
      this.world.enemyAnimations.set(enemy, this.createAnimationPlayback(`${enemy.key}Idle` as AnimationKey));
    });
  }

  update(deltaMs: number): void {
    this.updatePacketAnimationState(deltaMs);

    this.world.enemies.forEach((enemy) => {
      if (!enemy.active) return;
      this.updateEnemyAnimationState(enemy, deltaMs);
    });
  }

  private updatePacketAnimationState(deltaMs: number): void {
    const playback = this.world.packetAnimation;

    if (!playback.active) {
      playback.frame = PACKET_IDLE_FRAME;
      playback.elapsedMs = 0;
      playback.sequenceIndex = 0;
      return;
    }

    const frameDurationMs = 1000 / PACKET_CHOMP_FRAME_RATE;
    playback.elapsedMs += deltaMs;

    while (playback.elapsedMs >= frameDurationMs) {
      playback.elapsedMs -= frameDurationMs;
      playback.sequenceIndex += 1;

      if (playback.sequenceIndex >= PACKET_CHOMP_SEQUENCE.length) {
        playback.active = false;
        playback.frame = PACKET_IDLE_FRAME;
        playback.elapsedMs = 0;
        playback.sequenceIndex = 0;
        return;
      }

      playback.frame = PACKET_CHOMP_SEQUENCE[playback.sequenceIndex];
    }
  }

  private updateEnemyAnimationState(enemy: EnemyEntity, deltaMs: number): void {
    this.updateEnemyScaredTimer(enemy, deltaMs);
    if (!this.world.enemyAnimations.has(enemy)) {
      this.world.enemyAnimations.set(enemy, this.createAnimationPlayback(`${enemy.key}Idle` as AnimationKey));
    }

    if (enemy.state.scared && enemy.state.animation !== 'scared') {
      enemy.state.animation = 'scared';
      this.world.enemyAnimations.set(enemy, this.createAnimationPlayback('scaredIdle'));
    } else if (!enemy.state.scared && enemy.state.animation === 'scared') {
      enemy.state.animation = 'default';
      this.world.enemyAnimations.set(enemy, this.createAnimationPlayback(`${enemy.key}Idle` as AnimationKey));
    }

    const playback = this.world.enemyAnimations.get(enemy);
    if (!playback) {
      return;
    }

    const definition = this.animations[playback.key];
    const frameDuration = 1000 / definition.frameRate;
    playback.elapsedMs += deltaMs;

    while (playback.elapsedMs >= frameDuration) {
      playback.elapsedMs -= frameDuration;

      if (!definition.yoyo) {
        playback.frame = playback.frame + 1 > definition.end ? definition.start : playback.frame + 1;
        continue;
      }

      if (playback.forward === 1) {
        if (playback.frame < definition.end) {
          playback.frame += 1;
        } else {
          playback.forward = -1;
          playback.frame -= 1;
        }
      } else if (playback.frame > definition.start) {
        playback.frame -= 1;
      } else {
        playback.forward = 1;
        playback.frame += 1;
      }
    }
  }

  private updateEnemyScaredTimer(enemy: EnemyEntity, deltaMs: number): void {
    const remainingBefore = this.world.enemyScaredTimers.get(enemy) ?? 0;
    if (remainingBefore <= 0) {
      this.world.enemyScaredWarnings.delete(enemy);
      return;
    }

    if (!enemy.state.scared) {
      enemy.state.scared = true;
    }

    const safeDelta = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
    const remainingAfter = Math.max(0, remainingBefore - safeDelta);

    if (remainingAfter <= 0) {
      clearEnemyScaredWindow(this.world, enemy);
      return;
    }

    this.world.enemyScaredTimers.set(enemy, remainingAfter);
    this.updateEnemyWarningState(enemy, remainingBefore, remainingAfter);
  }

  private updateEnemyWarningState(enemy: EnemyEntity, remainingBefore: number, remainingAfter: number): void {
    if (remainingAfter > ENEMY_SCARED_WARNING_DURATION_MS) {
      this.world.enemyScaredWarnings.delete(enemy);
      return;
    }

    const warningElapsedBeforeTick = Math.max(0, ENEMY_SCARED_WARNING_DURATION_MS - remainingBefore);
    const warningElapsedAfterTick = Math.max(0, ENEMY_SCARED_WARNING_DURATION_MS - remainingAfter);
    const warningDelta = Math.max(0, warningElapsedAfterTick - warningElapsedBeforeTick);

    let warning = this.world.enemyScaredWarnings.get(enemy);
    if (!warning) {
      warning = {
        elapsedMs: warningElapsedBeforeTick,
        nextToggleAtMs: resolveNextBlinkToggleAt(warningElapsedBeforeTick, ENEMY_SCARED_WARNING_DURATION_MS, PACKET_DEATH_RECOVERY),
        showBaseColor: false,
      };
    }

    const elapsedBefore = warning.elapsedMs;
    warning.elapsedMs = Math.min(ENEMY_SCARED_WARNING_DURATION_MS, warning.elapsedMs + warningDelta);

    let nextToggleAtMs = warning.nextToggleAtMs;
    if (!Number.isFinite(nextToggleAtMs) || nextToggleAtMs <= 0) {
      nextToggleAtMs = resolveNextBlinkToggleAt(elapsedBefore, ENEMY_SCARED_WARNING_DURATION_MS, PACKET_DEATH_RECOVERY);
    }

    while (nextToggleAtMs > 0 && warning.elapsedMs >= nextToggleAtMs) {
      warning.showBaseColor = !warning.showBaseColor;
      nextToggleAtMs = resolveNextBlinkToggleAt(nextToggleAtMs, ENEMY_SCARED_WARNING_DURATION_MS, PACKET_DEATH_RECOVERY);
    }

    warning.nextToggleAtMs = nextToggleAtMs;
    this.world.enemyScaredWarnings.set(enemy, warning);
  }

  private createAnimationPlayback(key: AnimationKey): AnimationPlayback {
    const definition = this.animations[key];
    return {
      key,
      frame: definition.start,
      elapsedMs: 0,
      forward: 1,
    };
  }

  private createPacketAnimationPlayback(): PacketAnimationPlayback {
    return {
      frame: PACKET_IDLE_FRAME,
      elapsedMs: 0,
      sequenceIndex: 0,
      active: false,
    };
  }

}
