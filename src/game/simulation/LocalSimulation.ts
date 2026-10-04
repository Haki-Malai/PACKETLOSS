import { MODE_RULES, type ModeRules, type SimulationMode } from './modes';

export interface SimulationSystem {
  update(deltaMs: number): void;
  getSimulationBoundaryMs?(maximumMs: number): number;
}
export interface LocalSimulationOptions {
  mode?: SimulationMode;
  before: readonly SimulationSystem[];
  systems: readonly SimulationSystem[];
  after: readonly SimulationSystem[];
  active: () => boolean;
  beforeStep: () => void;
  advanceTimers: (deltaMs: number) => void;
  afterStep: (deltaMs: number) => void;
}

/** Advances session-owned local systems without depending on rendering, input, or platform clocks. */
export class LocalSimulation {
  activeTimeMs = 0;
  private disposed = false;

  /** Receives explicit system ordering and lifecycle hooks from a platform composition adapter. */
  constructor(private readonly options: LocalSimulationOptions) {}

  /** Exposes explicit mode policy to the owning local progression and pause adapter. */
  get rules(): Readonly<ModeRules> { return MODE_RULES[this.options.mode ?? 'classic']; }

  /** Records actual unpaused elapsed time independently of scaled or capped simulation steps. */
  recordTime(elapsedMs: number): void {
    if (!this.disposed && this.options.active() && Number.isFinite(elapsedMs) && elapsedMs > 0) this.activeTimeMs += elapsedMs;
  }

  /** Runs frame phases once and splits gameplay at the earliest movement or lifecycle boundary. */
  advance(frameMs: number, simulationMs: number): void {
    if (this.disposed || !this.options.active()) return;
    this.options.before.forEach((system) => system.update(frameMs));
    let remaining = simulationMs;
    while (remaining > Number.EPSILON && !this.disposed && this.options.active()) {
      const slice = this.options.systems.reduce((boundary, system) => {
        const candidate = system.getSimulationBoundaryMs?.(boundary) ?? boundary;
        return candidate > Number.EPSILON ? Math.min(boundary, candidate) : boundary;
      }, Math.min(remaining, 1000 / 60));
      this.options.beforeStep();
      this.options.advanceTimers(slice);
      this.options.systems.forEach((system) => system.update(slice));
      this.options.afterStep(slice);
      remaining -= slice;
    }
    if (!this.disposed) this.options.after.forEach((system) => system.update(frameMs));
  }

  /** Prevents late platform callbacks from advancing a disposed session. */
  destroy(): void { this.disposed = true; }
}
