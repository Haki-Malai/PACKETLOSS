import { MathUtils } from 'three';

/** Short visual blends driven by the same absolute clock as the character animation. */
export class StateTransition {
  private from = 0;
  private target = 0;
  private startedAt = 0;

  constructor(private readonly durationSeconds: number) {}

  reset(value = 0): number {
    this.from = this.target = value;
    return value;
  }

  sample(target: number, timeSeconds: number, amount?: number): number {
    // Authored previews supply an absolute blend so arbitrary seeking is history-independent.
    if (amount !== undefined) return this.reset(MathUtils.clamp(amount, 0, 1));
    const value = MathUtils.lerp(this.from, this.target,
      MathUtils.smootherstep(timeSeconds - this.startedAt, 0, this.durationSeconds));
    if (target !== this.target) {
      this.from = value;
      this.target = target;
      this.startedAt = timeSeconds;
    }
    return value;
  }
}
