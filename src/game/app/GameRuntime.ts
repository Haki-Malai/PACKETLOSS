import { FixedStepLoop } from '../../engine/loop';
import { getGameState } from '../../state/gameState';
import { ComposedGame, PacketGame, RenderCapableSystem, RunResult, RuntimeControl, RuntimeState, UpdateCapableSystem } from './contracts';
import { GameCompositionRoot } from './GameCompositionRoot';

export class GameRuntime implements PacketGame {
  private loop: FixedStepLoop | null = null;
  private composed: ComposedGame | null = null;
  private started = false;
  private destroyed = false;
  private pausedByFocusLoss = false;
  private focusListenersBound = false;
  private presentationReady = false;
  private starting: Promise<void> | null = null;
  private elapsedMs = 0;
  private totalPoints = 0;
  private result: RunResult | null = null;
  private readonly startupAbort = new AbortController();

  constructor(
    private readonly compositionRoot: GameCompositionRoot,
    private readonly onStateChange?: (_state: RuntimeState) => void,
  ) {}

  start(): Promise<void> {
    if (this.started || this.destroyed) {
      return Promise.resolve();
    }
    this.starting ??= this.initialize().finally(() => {
      this.starting = null;
    });
    return this.starting;
  }

  private async initialize(): Promise<void> {
    let composed: ComposedGame;
    try {
      composed = await this.compositionRoot.compose(this.runtimeControl, this.startupAbort.signal);
    } catch (error) {
      if (this.destroyed) return;
      throw error;
    }
    if (this.destroyed) {
      this.destroyComposedGame(composed);
      return;
    }
    this.composed = composed;
    this.elapsedMs = 0;
    this.totalPoints = composed.getRemainingPointCount();
    this.result = null;

    this.loop = new FixedStepLoop(this.update, this.render);
    this.started = true;
    try {
      this.bindFocusListeners();
      composed.updateSystems.forEach((system) => {
        system.start?.();
      });
      if (composed.tutorial) {
        composed.world.isMoving = false;
        composed.scheduler.setPaused(true);
        composed.input.reset();
      }
      this.loop.start();
      this.notifyState();
    } catch (error) {
      this.loop.stop();
      this.loop = null;
      this.started = false;
      this.unbindFocusListeners();
      this.composed = null;
      this.destroyComposedGame(composed);
      throw error;
    }
  }

  pause(): void {
    this.pausedByFocusLoss = false;
    this.setPaused(true);
  }

  resume(): void {
    this.pausedByFocusLoss = false;
    if (this.composed?.tutorial && !this.composed.tutorial.resume()) return;
    this.setPaused(false);
  }

  private setPaused(paused: boolean): void {
    if (!this.composed || (!this.composed.tutorial && this.composed.world.outcome)
      || this.composed.world.isMoving === !paused) return;
    this.presentationReady = false;
    this.composed.world.isMoving = !paused;
    this.composed.input.reset();
    this.composed.scheduler.setPaused(paused);
    this.notifyState();
  }

  private notifyState(): void {
    if (!this.composed || this.destroyed) return;
    this.onStateChange?.({
      paused: !this.composed.world.isMoving,
      result: this.result,
      ...(this.composed.tutorial ? { tutorial: this.composed.tutorial.getSnapshot() } : {}),
    });
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.startupAbort.abort();
    this.presentationReady = false;
    this.started = false;
    this.unbindFocusListeners();
    this.pausedByFocusLoss = false;

    this.loop?.stop();
    this.loop = null;

    if (this.composed) {
      this.destroyComposedGame(this.composed);
    }
    this.composed = null;
  }

  private readonly runtimeControl: RuntimeControl = {
    pause: () => {
      this.pause();
    },
    resume: () => {
      this.resume();
    },
    togglePause: () => {
      if (!this.composed) {
        return;
      }
      if (this.composed.world.isMoving) {
        this.pause();
      } else {
        this.resume();
      }
    },
  };

  private bindFocusListeners(): void {
    if (this.focusListenersBound || !this.canBindWindowListeners()) {
      return;
    }

    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('focus', this.handleWindowFocus);
    if (this.canBindDocumentListeners()) {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
    this.focusListenersBound = true;
  }

  private unbindFocusListeners(): void {
    if (!this.focusListenersBound || !this.canBindWindowListeners()) {
      return;
    }

    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
    if (this.canBindDocumentListeners()) {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    this.focusListenersBound = false;
  }

  private readonly handleWindowBlur = (): void => {
    this.handleFocusLost();
  };

  private readonly handleWindowFocus = (): void => {
    this.handleFocusReturned();
  };

  private readonly handleVisibilityChange = (): void => {
    if (typeof document === 'undefined' || !('hidden' in document)) {
      return;
    }

    if (document.hidden) {
      this.handleFocusLost();
      return;
    }

    this.handleFocusReturned();
  };

  private canBindWindowListeners(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.addEventListener === 'function' &&
      typeof window.removeEventListener === 'function'
    );
  }

  private canBindDocumentListeners(): boolean {
    return (
      typeof document !== 'undefined' &&
      typeof document.addEventListener === 'function' &&
      typeof document.removeEventListener === 'function'
    );
  }

  private handleFocusLost(): void {
    if (!this.started || this.destroyed || !this.composed || !this.composed.world.isMoving) {
      return;
    }

    this.pausedByFocusLoss = true;
    this.setPaused(true);
  }

  private handleFocusReturned(): void {
    if (!this.started || this.destroyed || !this.composed || !this.pausedByFocusLoss) {
      return;
    }

    this.resume();
  }

  /** Advances active simulation or holds it at an exact frame while paused or debug-frozen. */
  private readonly update = (deltaMs: number): void => {
    if (!this.composed || this.destroyed) {
      return;
    }

    if (!this.composed.world.isMoving || this.composed.world.debugFrozen) {
      if (this.composed.world.debugFrozen) this.presentationReady = false;
      this.composed.updateSystems.forEach((system) => {
        if (system.runsWhenPaused) {
          system.update(deltaMs);
        }
      });
      return;
    }

    this.composed.renderSystems.forEach((system) => {
      system.capturePreviousState?.();
    });
    const tutorial = this.composed.tutorial;
    const tutorialSnapshot = tutorial?.getSnapshot();
    tutorial?.beforeUpdate();
    this.composed.world.nextTick();
    this.elapsedMs += deltaMs;
    this.composed.scheduler.update(deltaMs);

    this.composed.updateSystems.forEach((system) => {
      system.update(deltaMs);
    });
    if (tutorial) {
      tutorial.update(deltaMs);
      if (tutorial.getSnapshot() !== tutorialSnapshot) {
        if (tutorial.getSnapshot().phase === 'playing') this.notifyState();
        else this.pause();
      }
    } else {
      this.finishRunIfComplete();
    }
    if (!this.composed) return;
    this.presentationReady = this.composed.world.isMoving;
  };

  private finishRunIfComplete(): void {
    if (!this.composed || this.result) return;
    const remaining = this.composed.getRemainingPointCount();
    const world = this.composed.world;
    if (!world.outcome && this.totalPoints > 0 && remaining === 0) world.outcome = 'cleared';
    if (!world.outcome) return;

    this.result = {
      outcome: world.outcome,
      ...getGameState(),
      elapsedMs: Math.round(this.elapsedMs),
      pointsCollected: this.totalPoints - remaining,
      totalPoints: this.totalPoints,
    };
    world.isMoving = false;
    this.pausedByFocusLoss = false;
    this.presentationReady = false;
    this.composed.scheduler.setPaused(true);
    this.composed.input.reset();
    this.notifyState();
  }

  private readonly render = (alpha: number): void => {
    if (!this.composed || this.destroyed) {
      return;
    }

    const renderAlpha = this.presentationReady && this.composed.world.isMoving ? alpha : 1;
    this.composed.renderSystems.forEach((system) => {
      system.render(renderAlpha);
    });
  };

  private destroyComposedGame(composed: ComposedGame): void {
    const uniqueSystems = new Set([...composed.renderSystems, ...composed.updateSystems]);
    this.destroySystems(Array.from(uniqueSystems));
    composed.scheduler.clear();
    composed.input.destroy();
    composed.destroy();
  }

  private destroySystems(systems: Array<UpdateCapableSystem | RenderCapableSystem>): void {
    systems.forEach((system) => {
      system.destroy?.();
    });
  }
}
