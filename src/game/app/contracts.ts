import { WorldState } from '../domain/world/WorldState';
import { BrowserInputAdapter } from '../infrastructure/adapters/BrowserInputAdapter';
import { RendererViewport } from '../infrastructure/adapters/ThreeRendererAdapter';
import { TimerSchedulerAdapter } from '../infrastructure/adapters/TimerSchedulerAdapter';
import type { TutorialController } from '../tutorial/TutorialController';
import type { TutorialSnapshot } from '../tutorial/TutorialLesson';

export type RunMode = 'classic' | 'endless';

export interface RunResult {
  mode?: RunMode;
  outcome: 'lost' | 'cleared';
  score: number;
  lives: number;
  elapsedMs: number;
  pointsCollected: number;
  totalPoints: number;
  levelsCleared: number;
}

export interface LevelClearCheckpoint {
  level: number;
  score: number;
  lives: number;
  elapsedMs: number;
  pointsCollected: number;
  totalPoints: number;
  nextMultiplier: number;
}

export interface RuntimeState {
  paused: boolean;
  result: RunResult | null;
  levelClear: LevelClearCheckpoint | null;
  tutorial?: TutorialSnapshot;
}

export interface PacketGame {
  start(): Promise<void>;
  pause(): void;
  resume(): void;
  continueLevel(): void;
  destroy(): void;
}

export interface RuntimeControl {
  pause(): void;
  resume(): void;
  togglePause(): void;
}

export interface UpdateCapableSystem {
  runsWhenPaused?: boolean;
  updatePhase?: 'beforeSimulation' | 'simulation' | 'afterSimulation';
  getSimulationBoundaryMs?(_maximumMs: number): number;
  start?(): void;
  update(deltaMs: number): void;
  destroy?(): void;
}

export interface RenderCapableSystem {
  capturePreviousState?(): void;
  render(alpha: number): void;
  destroy?(): void;
}

export interface ComposedGame {
  world: WorldState;
  renderer: RendererViewport;
  input: BrowserInputAdapter;
  scheduler: TimerSchedulerAdapter;
  updateSystems: UpdateCapableSystem[];
  renderSystems: RenderCapableSystem[];
  getRemainingPointCount(): number;
  getCollectedPointCount?(): number;
  resetLevel(): number;
  tutorial?: TutorialController;
  destroy: () => void;
}
