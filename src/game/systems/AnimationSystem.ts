import { GHOST_SCARED_WARNING_DURATION_MS, PACKET_DEATH_RECOVERY } from '../../config/constants';
import { GhostEntity } from '../domain/entities/GhostEntity';
import { clearGhostScaredWindow } from '../domain/services/GhostScaredStateService';
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
};

export const PACKET_CHOMP_SEQUENCE = [0, 1, 2, 3, 2, 1] as const;
const PACKET_IDLE_FRAME = PACKET_CHOMP_SEQUENCE[0];
export const PACKET_CHOMP_FRAME_RATE = 20;

export class AnimationSystem {
  constructor(
    private readonly world: WorldState,
    _defaultGhostSpeed: number,
    private readonly animations: Record<AnimationKey, AnimationDefinition> = ANIMATIONS,
  ) {}

  start(): void {
    this.world.packetAnimation = this.createPacketAnimationPlayback();

    this.world.ghosts.forEach((ghost) => {
      if (!ghost.active) return;
      this.world.ghostAnimations.set(ghost, this.createAnimationPlayback(`${ghost.key}Idle` as AnimationKey));
    });
  }

  update(deltaMs: number): void {
    this.updatePacketAnimationState(deltaMs);

    this.world.ghosts.forEach((ghost) => {
      if (!ghost.active) return;
      this.updateGhostAnimationState(ghost, deltaMs);
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

  private updateGhostAnimationState(ghost: GhostEntity, deltaMs: number): void {
    this.updateGhostScaredTimer(ghost, deltaMs);
    if (!this.world.ghostAnimations.has(ghost)) {
      this.world.ghostAnimations.set(ghost, this.createAnimationPlayback(`${ghost.key}Idle` as AnimationKey));
    }

    if (ghost.state.scared && ghost.state.animation !== 'scared') {
      ghost.state.animation = 'scared';
      this.world.ghostAnimations.set(ghost, this.createAnimationPlayback('scaredIdle'));
    } else if (!ghost.state.scared && ghost.state.animation === 'scared') {
      ghost.state.animation = 'default';
      this.world.ghostAnimations.set(ghost, this.createAnimationPlayback(`${ghost.key}Idle` as AnimationKey));
    }

    const playback = this.world.ghostAnimations.get(ghost);
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

  private updateGhostScaredTimer(ghost: GhostEntity, deltaMs: number): void {
    const remainingBefore = this.world.ghostScaredTimers.get(ghost) ?? 0;
    if (remainingBefore <= 0) {
      this.world.ghostScaredWarnings.delete(ghost);
      return;
    }

    if (!ghost.state.scared) {
      ghost.state.scared = true;
    }

    const safeDelta = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
    const remainingAfter = Math.max(0, remainingBefore - safeDelta);

    if (remainingAfter <= 0) {
      clearGhostScaredWindow(this.world, ghost);
      return;
    }

    this.world.ghostScaredTimers.set(ghost, remainingAfter);
    this.updateGhostWarningState(ghost, remainingBefore, remainingAfter);
  }

  private updateGhostWarningState(ghost: GhostEntity, remainingBefore: number, remainingAfter: number): void {
    if (remainingAfter > GHOST_SCARED_WARNING_DURATION_MS) {
      this.world.ghostScaredWarnings.delete(ghost);
      return;
    }

    const warningElapsedBeforeTick = Math.max(0, GHOST_SCARED_WARNING_DURATION_MS - remainingBefore);
    const warningElapsedAfterTick = Math.max(0, GHOST_SCARED_WARNING_DURATION_MS - remainingAfter);
    const warningDelta = Math.max(0, warningElapsedAfterTick - warningElapsedBeforeTick);

    let warning = this.world.ghostScaredWarnings.get(ghost);
    if (!warning) {
      warning = {
        elapsedMs: warningElapsedBeforeTick,
        nextToggleAtMs: resolveNextBlinkToggleAt(warningElapsedBeforeTick, GHOST_SCARED_WARNING_DURATION_MS, PACKET_DEATH_RECOVERY),
        showBaseColor: false,
      };
    }

    const elapsedBefore = warning.elapsedMs;
    warning.elapsedMs = Math.min(GHOST_SCARED_WARNING_DURATION_MS, warning.elapsedMs + warningDelta);

    let nextToggleAtMs = warning.nextToggleAtMs;
    if (!Number.isFinite(nextToggleAtMs) || nextToggleAtMs <= 0) {
      nextToggleAtMs = resolveNextBlinkToggleAt(elapsedBefore, GHOST_SCARED_WARNING_DURATION_MS, PACKET_DEATH_RECOVERY);
    }

    while (nextToggleAtMs > 0 && warning.elapsedMs >= nextToggleAtMs) {
      warning.showBaseColor = !warning.showBaseColor;
      nextToggleAtMs = resolveNextBlinkToggleAt(nextToggleAtMs, GHOST_SCARED_WARNING_DURATION_MS, PACKET_DEATH_RECOVERY);
    }

    warning.nextToggleAtMs = nextToggleAtMs;
    this.world.ghostScaredWarnings.set(ghost, warning);
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
