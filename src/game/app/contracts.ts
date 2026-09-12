import { WorldState } from '../domain/world/WorldState';
import { BrowserInputAdapter } from '../infrastructure/adapters/BrowserInputAdapter';
import { RendererViewport } from '../infrastructure/adapters/ThreeRendererAdapter';
import { TimerSchedulerAdapter } from '../infrastructure/adapters/TimerSchedulerAdapter';

export interface PacketGame {
  start(): Promise<void>;
  pause(): void;
  resume(): void;
  destroy(): void;
}

export interface RuntimeControl {
  pause(): void;
  resume(): void;
  togglePause(): void;
}

export interface UpdateCapableSystem {
  runsWhenPaused?: boolean;
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
  destroy: () => void;
}
