import { advanceFixedStep, FixedStepState } from './fixedStep';

type UpdateCallback = (_deltaMs: number) => void;
type RenderCallback = (_alpha: number) => void;
type FrameCallback = (_elapsedMs: number) => void;

export class FixedStepLoop {
  private readonly stepMs: number;
  private readonly maxSubSteps: number;
  private readonly update: UpdateCallback;
  private readonly render: RenderCallback;
  private readonly onFrame?: FrameCallback;
  private readonly state: FixedStepState = { accumulatorMs: 0 };

  private running = false;
  private lastTimestamp = 0;
  private frameId = 0;

  /** Keeps real frame time available separately from capped simulation updates. */
  constructor(update: UpdateCallback, render: RenderCallback, onFrame?: FrameCallback, stepMs = 1000 / 60, maxSubSteps = 8) {
    this.update = update;
    this.render = render;
    this.onFrame = onFrame;
    this.stepMs = stepMs;
    this.maxSubSteps = maxSubSteps;
  }

  /** Starts the loop with a fresh wall-clock and simulation accumulator. */
  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTimestamp = performance.now();
    this.state.accumulatorMs = 0;
    this.frameId = window.requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (!this.running) {
      return;
    }
    this.running = false;
    window.cancelAnimationFrame(this.frameId);
  }

  /** Discards paused simulation time and starts the next active frame at the resume instant. */
  resetClock(): void {
    this.lastTimestamp = performance.now();
    this.state.accumulatorMs = 0;
  }

  /** Reports real elapsed time before advancing the bounded fixed-step simulation. */
  private readonly tick = (timestamp: number): void => {
    if (!this.running) {
      return;
    }

    const deltaMs = Math.max(0, timestamp - this.lastTimestamp);
    this.lastTimestamp = timestamp;
    this.onFrame?.(deltaMs);

    const result = advanceFixedStep(this.state, deltaMs, this.stepMs, this.maxSubSteps);
    this.state.accumulatorMs = result.accumulatorMs;

    for (let i = 0; i < result.ticks; i += 1) {
      this.update(this.stepMs);
    }

    const alpha = this.stepMs > 0 ? this.state.accumulatorMs / this.stepMs : 0;
    this.render(alpha);

    this.frameId = window.requestAnimationFrame(this.tick);
  };
}
