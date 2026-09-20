import { FixedStepLoop } from '../../engine/loop';
import { LEVEL_MULTIPLIER_STEP } from '../../config/constants';
import { MOVEMENT_STEP_MS } from '../domain/services/MovementRules';
import { getGameState } from '../../state/gameState';
import {
  ComposedGame,
  LevelClearCheckpoint,
  PacketGame,
  RenderCapableSystem,
  RunResult,
  RuntimeControl,
  RuntimeState,
  UpdateCapableSystem,
} from './contracts';
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
  private beforeSystems: UpdateCapableSystem[] = [];
  private simulationSystems: UpdateCapableSystem[] = [];
  private afterSystems: UpdateCapableSystem[] = [];
  private totalPoints = 0;
  private currentLevel = 1;
  private levelsCleared = 0;
  private result: RunResult | null = null;
  private levelClear: LevelClearCheckpoint | null = null;
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

  /** Composes the run once and groups its update systems by phase. */
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
    this.currentLevel = 1;
    this.levelsCleared = 0;
    this.result = null;
    this.levelClear = null;
    composed.world.levelMultiplier = 1;
    this.beforeSystems = composed.updateSystems.filter((system) => system.updatePhase === 'beforeSimulation');
    this.simulationSystems = composed.updateSystems.filter((system) => !system.updatePhase || system.updatePhase === 'simulation');
    this.afterSystems = composed.updateSystems.filter((system) => system.updatePhase === 'afterSimulation');

    this.loop = new FixedStepLoop(this.update, this.render, this.recordActiveTime);
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

  /** Refills and resumes the same run after an acknowledged maze-clear checkpoint. */
  continueLevel(): void {
    if (!this.composed || this.destroyed || this.composed.tutorial || !this.levelClear || this.result) {
      return;
    }

    const world = this.composed.world;
    world.levelMultiplier *= LEVEL_MULTIPLIER_STEP;
    const refilledPointCount = this.composed.resetLevel();
    this.currentLevel += 1;
    this.totalPoints += refilledPointCount;
    this.levelClear = null;
    world.outcome = null;
    world.isMoving = true;
    this.pausedByFocusLoss = false;
    this.presentationReady = false;
    this.composed.input.reset();
    this.composed.scheduler.setPaused(false);
    this.loop?.resetClock();
    this.notifyState();
  }

  /** Resets the frame clock on resume so paused time never enters the run duration. */
  private setPaused(paused: boolean): void {
    if (!this.composed || (!this.composed.tutorial && this.composed.world.outcome)
      || this.composed.world.isMoving === !paused) return;
    this.presentationReady = false;
    this.composed.world.isMoving = !paused;
    this.composed.input.reset();
    this.composed.scheduler.setPaused(paused);
    if (!paused) this.loop?.resetClock();
    this.notifyState();
  }

  private notifyState(): void {
    if (!this.composed || this.destroyed) return;
    this.onStateChange?.({
      paused: !this.composed.world.isMoving,
      result: this.result,
      levelClear: this.levelClear,
      ...(this.composed.tutorial ? { tutorial: this.composed.tutorial.getSnapshot() } : {}),
    });
  }

  /** Stops the loop and releases the composed run and its system lists. */
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
    this.beforeSystems = [];
    this.simulationSystems = [];
    this.afterSystems = [];

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

  /** Counts real active time and reports visible, unfrozen frame timing to the renderer. */
  private readonly recordActiveTime = (elapsedMs: number): void => {
    if (!this.composed) return;
    const active = this.composed.world.isMoving && !this.composed.world.debugFrozen && !document.hidden;
    this.composed.renderer.recordFrame?.(elapsedMs, active);
    if (this.composed.world.isMoving && !this.composed.world.debugFrozen) this.elapsedMs += elapsedMs;
  };

  /** Advances scaled gameplay in bounded slices while frame-owned systems run once. */
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
    const simulationDeltaMs = deltaMs * this.composed.world.levelMultiplier;
    this.beforeSystems.forEach((system) => system.update(deltaMs));

    let remainingMs = simulationDeltaMs;
    while (remainingMs > Number.EPSILON && this.composed?.world.isMoving) {
      const maximumSliceMs = Math.min(remainingMs, MOVEMENT_STEP_MS);
      const sliceMs = this.simulationSystems.reduce((boundaryMs, system) => {
        const candidate = system.getSimulationBoundaryMs?.(boundaryMs) ?? boundaryMs;
        return candidate > Number.EPSILON ? Math.min(boundaryMs, candidate) : boundaryMs;
      }, maximumSliceMs);
      const tutorial = this.composed.tutorial;
      const tutorialSnapshot = tutorial?.getSnapshot();
      tutorial?.beforeUpdate();
      this.composed.world.nextTick();
      this.composed.scheduler.update(sliceMs);
      this.simulationSystems.forEach((system) => system.update(sliceMs));
      tutorial?.update(sliceMs);
      if (tutorial && tutorial.getSnapshot() !== tutorialSnapshot) {
        if (tutorial.getSnapshot().phase === 'playing') this.notifyState();
        else this.pause();
      } else if (!tutorial) {
        this.handleRunProgression();
      }
      remainingMs -= sliceMs;
    }
    if (!this.composed) return;
    this.afterSystems.forEach((system) => system.update(deltaMs));
    this.presentationReady = this.composed.world.isMoving;
  };

  /** Publishes a nonterminal clear checkpoint or freezes the final loss result. */
  private handleRunProgression(): void {
    if (!this.composed || this.result || this.levelClear) return;
    const remaining = this.composed.getRemainingPointCount();
    const world = this.composed.world;
    if (world.runMode !== 'endless' && !world.outcome && this.totalPoints > 0 && remaining === 0) {
      world.outcome = 'cleared';
      this.levelsCleared += 1;
      this.levelClear = {
        level: this.currentLevel,
        ...getGameState(),
        elapsedMs: Math.round(this.elapsedMs),
        pointsCollected: this.totalPoints,
        totalPoints: this.totalPoints,
        nextMultiplier: world.levelMultiplier * LEVEL_MULTIPLIER_STEP,
      };
      this.freezeSimulation();
      return;
    }
    if (world.outcome !== 'lost') return;

    const recovered = world.runMode === 'endless'
      ? this.composed.getCollectedPointCount?.() ?? 0 : this.totalPoints - remaining;
    this.result = {
      outcome: world.outcome,
      mode: world.runMode ?? 'classic',
      ...getGameState(),
      elapsedMs: Math.round(this.elapsedMs),
      pointsCollected: recovered,
      totalPoints: world.runMode === 'endless' ? recovered : this.totalPoints,
      levelsCleared: this.levelsCleared,
    };
    this.freezeSimulation();
  }

  /** Stops simulation, scheduler, and input at a clear checkpoint or terminal result. */
  private freezeSimulation(): void {
    if (!this.composed) return;
    const world = this.composed.world;
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
