export class PreviewPlayback {
  timeMs = 0;
  playing = false;
  loop = false;
  speed = 1;
  durationMs = 0;

  select(animation: { durationMs: number; loop: boolean }): void {
    this.durationMs = animation.durationMs;
    this.loop = animation.loop;
    this.speed = 1;
    this.replay();
  }

  advance(deltaMs: number): void {
    if (!this.playing || this.durationMs <= 0) return;
    const elapsed = Number.isFinite(deltaMs) ? Math.max(0, Math.min(100, deltaMs)) : 0;
    const next = this.timeMs + elapsed * this.speed;
    this.timeMs = this.loop ? next % this.durationMs : Math.min(this.durationMs, next);
    if (!this.loop && this.timeMs === this.durationMs) this.playing = false;
  }

  seek(timeMs: number): void {
    this.timeMs = Math.max(0, Math.min(this.durationMs, timeMs));
    this.playing = false;
  }

  toggle(): void {
    if (this.durationMs <= 0) return;
    if (this.timeMs >= this.durationMs) this.timeMs = 0;
    this.playing = !this.playing;
  }

  replay(): void {
    this.timeMs = 0;
    this.playing = this.durationMs > 0;
  }
}
