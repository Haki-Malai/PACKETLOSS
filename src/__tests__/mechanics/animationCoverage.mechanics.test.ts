import { describe, expect, it } from 'vitest';
import { AnimationSystem } from '../../game/systems/AnimationSystem';
import { MechanicsDomainHarness } from '../helpers/mechanicsDomainHarness';
import { AnimationKey } from '../../game/domain/world/WorldState';

describe('animation system coverage', () => {
  it('covers playback creation, missing playback guard, and yoyo direction branches', () => {
    const harness = new MechanicsDomainHarness({ seed: 909, fixture: 'default-map', ghostCount: 1, autoStartSystems: false });

    try {
      const ghost = harness.world.ghosts[0];
      if (!ghost) {
        throw new Error('expected one ghost for animation test');
      }

      harness.animationSystem.start();
      expect(harness.world.ghostAnimations.has(ghost)).toBe(true);

      harness.world.ghostAnimations.delete(ghost);
      harness.animationSystem.update(100);
      expect(harness.world.ghostAnimations.has(ghost)).toBe(false);

      harness.world.ghostAnimations.set(ghost, {
        key: `${ghost.key}Idle`,
        frame: 0,
        elapsedMs: 0,
        forward: 1,
      });

      ghost.state.scared = true;
      harness.animationSystem.update(250);
      expect(ghost.state.animation).toBe('scared');

      ghost.state.scared = false;
      harness.animationSystem.update(250);
      expect(ghost.state.animation).toBe('default');

      const playback = harness.world.ghostAnimations.get(ghost);
      expect(playback).toBeDefined();
      if (!playback) {
        return;
      }

      playback.frame = 7;
      playback.forward = 1;
      playback.elapsedMs = 250;
      harness.animationSystem.update(250);
      expect(playback.forward).toBe(-1);

      playback.frame = 2;
      playback.forward = -1;
      playback.elapsedMs = 250;
      harness.animationSystem.update(250);
      expect(playback.frame).toBeLessThan(2);

      playback.frame = 0;
      playback.forward = -1;
      playback.elapsedMs = 250;
      harness.animationSystem.update(250);
      expect(playback.forward).toBe(1);

      const nonYoyoAnimations: Record<AnimationKey, { start: number; end: number; yoyo: boolean; frameRate: number }> = {
        scaredIdle: { start: 0, end: 2, yoyo: false, frameRate: 4 },
        inkyIdle: { start: 0, end: 2, yoyo: false, frameRate: 4 },
        clydeIdle: { start: 0, end: 2, yoyo: false, frameRate: 4 },
        pinkyIdle: { start: 0, end: 2, yoyo: false, frameRate: 4 },
        blinkyIdle: { start: 0, end: 2, yoyo: false, frameRate: 4 },
      };

      const nonYoyoSystem = new AnimationSystem(harness.world, 1, nonYoyoAnimations);
      ghost.state.scared = true;
      ghost.state.animation = 'scared';
      harness.world.ghostAnimations.set(ghost, {
        key: 'scaredIdle',
        frame: 0,
        elapsedMs: 0,
        forward: 1,
      });

      nonYoyoSystem.update(250);
      const nonYoyoPlayback = harness.world.ghostAnimations.get(ghost);
      expect(nonYoyoPlayback?.frame).toBe(1);

      nonYoyoSystem.update(1000);
      expect((harness.world.ghostAnimations.get(ghost)?.frame ?? -1) >= 0).toBe(true);
    } finally {
      harness.destroy();
    }
  });
});
