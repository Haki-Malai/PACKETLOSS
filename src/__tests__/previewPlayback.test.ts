import { describe, expect, it } from 'vitest';
import { PreviewPlayback } from '../dev/assets/PreviewPlayback';

describe('PreviewPlayback', () => {
  it('resets time and speed when selecting an animation and leaves static assets paused', () => {
    const playback = new PreviewPlayback();
    playback.select({ durationMs: 900, loop: false });
    playback.speed = 2;
    playback.advance(100);
    playback.select({ durationMs: 6000, loop: true });
    expect(playback.timeMs).toBe(0);
    expect(playback.speed).toBe(1);
    expect(playback.playing).toBe(true);
    expect(playback.loop).toBe(true);
    playback.select({ durationMs: 0, loop: false });
    playback.toggle();
    playback.replay();
    playback.advance(100);
    expect(playback.timeMs).toBe(0);
    expect(playback.playing).toBe(false);
  });

  it('clamps scrubbing to the selected duration and pauses until playback resumes', () => {
    const playback = new PreviewPlayback();
    playback.select({ durationMs: 900, loop: false });
    playback.seek(450);
    playback.advance(100);
    expect(playback.timeMs).toBe(450);
    expect(playback.playing).toBe(false);
    playback.toggle();
    playback.advance(50);
    expect(playback.timeMs).toBe(500);
    playback.toggle();
    playback.advance(100);
    expect(playback.timeMs).toBe(500);
    playback.seek(-20);
    expect(playback.timeMs).toBe(0);
    playback.seek(1000);
    expect(playback.timeMs).toBe(900);
    expect(playback.playing).toBe(false);
  });

  it('applies playback speed while rejecting invalid elapsed time and capping frame gaps', () => {
    const playback = new PreviewPlayback();
    playback.select({ durationMs: 900, loop: false });
    playback.speed = 2;
    playback.advance(40);
    expect(playback.timeMs).toBe(80);
    playback.advance(10000);
    expect(playback.timeMs).toBe(280);
    for (const elapsed of [-100, Number.NaN, Number.POSITIVE_INFINITY]) playback.advance(elapsed);
    expect(playback.timeMs).toBe(280);
    playback.speed = 0.5;
    playback.advance(40);
    expect(playback.timeMs).toBe(300);
  });

  it('stops a one-shot exactly at its end and restarts through toggle or replay', () => {
    const playback = new PreviewPlayback();
    playback.select({ durationMs: 150, loop: false });
    playback.advance(100);
    playback.advance(100);
    expect(playback.timeMs).toBe(150);
    expect(playback.playing).toBe(false);
    playback.advance(100);
    expect(playback.timeMs).toBe(150);
    playback.toggle();
    expect(playback.timeMs).toBe(0);
    expect(playback.playing).toBe(true);
    playback.advance(80);
    playback.replay();
    expect(playback.timeMs).toBe(0);
    expect(playback.playing).toBe(true);
  });

  it('wraps looping animations across their end without pausing', () => {
    const playback = new PreviewPlayback();
    playback.select({ durationMs: 250, loop: true });
    playback.speed = 2;
    playback.advance(100);
    playback.advance(100);
    expect(playback.timeMs).toBe(150);
    expect(playback.playing).toBe(true);
  });
});
