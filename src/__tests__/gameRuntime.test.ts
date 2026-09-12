import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { GameRuntime } from '../game/app/GameRuntime';
import { ComposedGame } from '../game/app/contracts';
import { GameCompositionRoot } from '../game/app/GameCompositionRoot';

type EventCallback = (_event?: Event) => void;

function createComposedGame() {
  const start = vi.fn();
  const update = vi.fn();
  const render = vi.fn();
  const updateDestroy = vi.fn();
  const renderDestroy = vi.fn();

  const scheduler = {
    update: vi.fn(),
    setPaused: vi.fn(),
    clear: vi.fn(),
  };

  const input = {
    destroy: vi.fn(),
  };

  const world = {
    isMoving: true,
    nextTick: vi.fn(),
  };

  const composed: ComposedGame = {
    world: world as never,
    renderer: {} as never,
    input: input as never,
    scheduler: scheduler as never,
    updateSystems: [{ start, update, destroy: updateDestroy }],
    renderSystems: [{ render, destroy: renderDestroy }],
    destroy: vi.fn(),
  };

  return {
    composed,
    spies: {
      start,
      update,
      render,
      updateDestroy,
      renderDestroy,
      scheduler,
      input,
      world,
    },
  };
}

describe('GameRuntime', () => {
  let nextFrame: ((_timestamp: number) => void) | null = null;
  let frameId = 0;
  let emitWindowEvent: (_type: 'blur' | 'focus') => void;
  let emitVisibilityChange: () => void;
  let setDocumentHidden: (_hidden: boolean) => void;
  let windowAddEventListener: ReturnType<typeof vi.fn>;
  let windowRemoveEventListener: ReturnType<typeof vi.fn>;
  let documentAddEventListener: ReturnType<typeof vi.fn>;
  let documentRemoveEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    nextFrame = null;
    frameId = 0;
    const windowListeners = new Map<string, Set<EventCallback>>();
    const documentListeners = new Map<string, Set<EventCallback>>();
    const documentState = { hidden: false };

    const registerListener = (listeners: Map<string, Set<EventCallback>>, type: string, listener: EventCallback): void => {
      const entries = listeners.get(type) ?? new Set<EventCallback>();
      entries.add(listener);
      listeners.set(type, entries);
    };
    const unregisterListener = (listeners: Map<string, Set<EventCallback>>, type: string, listener: EventCallback): void => {
      const entries = listeners.get(type);
      if (!entries) {
        return;
      }
      entries.delete(listener);
      if (entries.size === 0) {
        listeners.delete(type);
      }
    };
    const emitListeners = (listeners: Map<string, Set<EventCallback>>, type: string): void => {
      listeners.get(type)?.forEach((listener) => {
        listener({ type } as Event);
      });
    };

    windowAddEventListener = vi.fn((type: string, listener: EventCallback) => {
      registerListener(windowListeners, type, listener);
    });
    windowRemoveEventListener = vi.fn((type: string, listener: EventCallback) => {
      unregisterListener(windowListeners, type, listener);
    });

    documentAddEventListener = vi.fn((type: string, listener: EventCallback) => {
      registerListener(documentListeners, type, listener);
    });
    documentRemoveEventListener = vi.fn((type: string, listener: EventCallback) => {
      unregisterListener(documentListeners, type, listener);
    });

    vi.stubGlobal('window', {
      requestAnimationFrame: vi.fn((callback: (_timestamp: number) => void) => {
        nextFrame = callback;
        frameId += 1;
        return frameId;
      }),
      cancelAnimationFrame: vi.fn(),
      addEventListener: windowAddEventListener,
      removeEventListener: windowRemoveEventListener,
    });

    vi.stubGlobal('document', {
      get hidden(): boolean {
        return documentState.hidden;
      },
      addEventListener: documentAddEventListener,
      removeEventListener: documentRemoveEventListener,
    });

    emitWindowEvent = (type: 'blur' | 'focus') => {
      emitListeners(windowListeners, type);
    };
    emitVisibilityChange = () => {
      emitListeners(documentListeners, 'visibilitychange');
    };
    setDocumentHidden = (hidden: boolean) => {
      documentState.hidden = hidden;
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts composed systems and drives update/render during animation frames', async () => {
    const { composed, spies } = createComposedGame();
    const compositionRoot = {
      compose: vi.fn().mockResolvedValue(composed),
    } as unknown as GameCompositionRoot;

    const runtime = new GameRuntime(compositionRoot);
    await runtime.start();

    expect(spies.start).toHaveBeenCalledOnce();
    expect(nextFrame).not.toBeNull();

    nextFrame?.(1);
    nextFrame?.(20);

    expect(spies.world.nextTick).toHaveBeenCalled();
    expect(spies.scheduler.update).toHaveBeenCalled();
    expect(spies.update).toHaveBeenCalled();
    expect(spies.render).toHaveBeenCalled();
  });

  it('freezes simulation while paused and resumes interpolation only after a fresh update', async () => {
    const { composed, spies } = createComposedGame();
    const compositionRoot = {
      compose: vi.fn().mockResolvedValue(composed),
    } as unknown as GameCompositionRoot;

    const runtime = new GameRuntime(compositionRoot);
    await runtime.start();
    nextFrame?.(1);
    nextFrame?.(20);
    spies.update.mockClear();
    spies.scheduler.update.mockClear();
    spies.world.nextTick.mockClear();

    runtime.pause();
    expect(spies.world.isMoving).toBe(false);
    expect(spies.scheduler.setPaused).toHaveBeenCalledWith(true);
    nextFrame?.(40);
    nextFrame?.(60);
    expect(spies.update).not.toHaveBeenCalled();
    expect(spies.scheduler.update).not.toHaveBeenCalled();
    expect(spies.world.nextTick).not.toHaveBeenCalled();
    expect(spies.render).toHaveBeenLastCalledWith(1);

    runtime.resume();
    expect(spies.world.isMoving).toBe(true);
    expect(spies.scheduler.setPaused).toHaveBeenCalledWith(false);
    nextFrame?.(61);
    expect(spies.update).not.toHaveBeenCalled();
    expect(spies.render).toHaveBeenLastCalledWith(1);
    nextFrame?.(80);
    expect(spies.update).toHaveBeenCalledOnce();
    expect(spies.scheduler.update).toHaveBeenCalledOnce();
    expect(spies.world.nextTick).toHaveBeenCalledOnce();
    expect(spies.render.mock.lastCall?.[0]).toBeLessThan(1);
    runtime.destroy();
  });

  it('auto-pauses on window blur and auto-resumes on focus when pause was focus-caused', async () => {
    const { composed, spies } = createComposedGame();
    const compositionRoot = {
      compose: vi.fn().mockResolvedValue(composed),
    } as unknown as GameCompositionRoot;

    const runtime = new GameRuntime(compositionRoot);
    await runtime.start();

    emitWindowEvent('blur');
    expect(spies.world.isMoving).toBe(false);
    expect(spies.scheduler.setPaused).toHaveBeenLastCalledWith(true);

    emitWindowEvent('focus');
    expect(spies.world.isMoving).toBe(true);
    expect(spies.scheduler.setPaused).toHaveBeenLastCalledWith(false);
  });

  it('auto-pauses on hidden visibility and auto-resumes when visible again', async () => {
    const { composed, spies } = createComposedGame();
    const compositionRoot = {
      compose: vi.fn().mockResolvedValue(composed),
    } as unknown as GameCompositionRoot;

    const runtime = new GameRuntime(compositionRoot);
    await runtime.start();

    setDocumentHidden(true);
    emitVisibilityChange();
    expect(spies.world.isMoving).toBe(false);
    expect(spies.scheduler.setPaused).toHaveBeenLastCalledWith(true);

    setDocumentHidden(false);
    emitVisibilityChange();
    expect(spies.world.isMoving).toBe(true);
    expect(spies.scheduler.setPaused).toHaveBeenLastCalledWith(false);
  });

  it('does not auto-resume when the runtime was manually paused before focus loss', async () => {
    const { composed, spies } = createComposedGame();
    const compositionRoot = {
      compose: vi.fn().mockResolvedValue(composed),
    } as unknown as GameCompositionRoot;

    const runtime = new GameRuntime(compositionRoot);
    await runtime.start();

    runtime.pause();
    expect(spies.world.isMoving).toBe(false);

    emitWindowEvent('blur');
    emitWindowEvent('focus');
    setDocumentHidden(true);
    emitVisibilityChange();
    setDocumentHidden(false);
    emitVisibilityChange();

    expect(spies.world.isMoving).toBe(false);
    expect(spies.scheduler.setPaused).toHaveBeenCalledTimes(1);
    expect(spies.scheduler.setPaused).toHaveBeenCalledWith(true);
  });

  it('destroys loop resources and composed systems exactly once', async () => {
    const { composed, spies } = createComposedGame();
    const compositionRoot = {
      compose: vi.fn().mockResolvedValue(composed),
    } as unknown as GameCompositionRoot;

    const runtime = new GameRuntime(compositionRoot);
    await runtime.start();

    runtime.destroy();

    expect(spies.scheduler.clear).toHaveBeenCalledOnce();
    expect(spies.input.destroy).toHaveBeenCalledOnce();
    expect(spies.updateDestroy).toHaveBeenCalledOnce();
    expect(spies.renderDestroy).toHaveBeenCalledOnce();
    expect(composed.destroy).toHaveBeenCalledOnce();

    const win = globalThis.window as unknown as {
      cancelAnimationFrame: ReturnType<typeof vi.fn>;
    };
    expect(win.cancelAnimationFrame).toHaveBeenCalled();
    expect(windowRemoveEventListener).toHaveBeenCalledWith('blur', expect.any(Function));
    expect(windowRemoveEventListener).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(documentRemoveEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });

  it('shares pending startup so simultaneous starts create one composition and loop', async () => {
    const { composed, spies } = createComposedGame();
    let resolveComposition!: (_composed: ComposedGame) => void;
    const pending = new Promise<ComposedGame>((resolve) => { resolveComposition = resolve; });
    const compose = vi.fn().mockReturnValue(pending);
    const compositionRoot = { compose } as unknown as GameCompositionRoot;

    const runtime = new GameRuntime(compositionRoot);
    const first = runtime.start();
    const second = runtime.start();
    expect(second).toBe(first);
    expect(compose).toHaveBeenCalledOnce();
    resolveComposition(composed);
    await Promise.all([first, second]);
    await runtime.start();

    expect(spies.start).toHaveBeenCalledOnce();
    expect(window.requestAnimationFrame).toHaveBeenCalledOnce();
    expect(windowAddEventListener).toHaveBeenCalledTimes(2);
    expect(documentAddEventListener).toHaveBeenCalledTimes(1);
    runtime.destroy();
  });

  it('allows retrying startup after a loading failure', async () => {
    const { composed, spies } = createComposedGame();
    const failure = new Error('Map could not load');
    const compose = vi.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce(composed);
    const compositionRoot = { compose } as unknown as GameCompositionRoot;
    const runtime = new GameRuntime(compositionRoot);
    await expect(runtime.start()).rejects.toBe(failure);
    expect(nextFrame).toBeNull();
    await runtime.start();
    expect(compose).toHaveBeenCalledTimes(2);
    expect(spies.start).toHaveBeenCalledOnce();
    expect(window.requestAnimationFrame).toHaveBeenCalledOnce();
    runtime.destroy();
  });

  it('releases a partially started game and allows a clean retry', async () => {
    const failed = createComposedGame();
    const retry = createComposedGame();
    const failure = new Error('System could not start');
    failed.spies.start.mockImplementationOnce(() => { throw failure; });
    const compositionRoot = {
      compose: vi.fn().mockResolvedValueOnce(failed.composed).mockResolvedValueOnce(retry.composed),
    } as unknown as GameCompositionRoot;
    const runtime = new GameRuntime(compositionRoot);

    await expect(runtime.start()).rejects.toBe(failure);

    expect(failed.spies.updateDestroy).toHaveBeenCalledOnce();
    expect(failed.spies.renderDestroy).toHaveBeenCalledOnce();
    expect(failed.spies.scheduler.clear).toHaveBeenCalledOnce();
    expect(failed.spies.input.destroy).toHaveBeenCalledOnce();
    expect(failed.composed.destroy).toHaveBeenCalledOnce();
    expect(windowRemoveEventListener).toHaveBeenCalledWith('blur', expect.any(Function));
    expect(documentRemoveEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(nextFrame).toBeNull();

    await runtime.start();
    expect(retry.spies.start).toHaveBeenCalledOnce();
    expect(nextFrame).not.toBeNull();
    runtime.destroy();
    expect(failed.spies.renderDestroy).toHaveBeenCalledOnce();
    expect(retry.spies.renderDestroy).toHaveBeenCalledOnce();
  });

  it('releases a composition that finishes loading after destroy without starting its systems or loop', async () => {
    const { composed, spies } = createComposedGame();
    const sharedSystem = { update: vi.fn(), render: vi.fn(), destroy: vi.fn() };
    composed.updateSystems.push(sharedSystem);
    composed.renderSystems.push(sharedSystem);
    let resolveComposition!: (_composed: ComposedGame) => void;
    const pendingComposition = new Promise<ComposedGame>((resolve) => {
      resolveComposition = resolve;
    });
    const compose = vi.fn<GameCompositionRoot['compose']>().mockReturnValue(pendingComposition);
    const compositionRoot = { compose } as unknown as GameCompositionRoot;
    const runtime = new GameRuntime(compositionRoot);

    const starting = runtime.start();
    runtime.destroy();
    expect(compose.mock.calls[0][1]?.aborted).toBe(true);
    expect(spies.renderDestroy).not.toHaveBeenCalled();
    resolveComposition(composed);
    await starting;
    runtime.destroy();

    expect(spies.start).not.toHaveBeenCalled();
    expect(spies.update).not.toHaveBeenCalled();
    expect(spies.render).not.toHaveBeenCalled();
    expect(nextFrame).toBeNull();
    expect(windowAddEventListener).not.toHaveBeenCalled();
    expect(documentAddEventListener).not.toHaveBeenCalled();
    expect(spies.updateDestroy).toHaveBeenCalledOnce();
    expect(spies.renderDestroy).toHaveBeenCalledOnce();
    expect(sharedSystem.destroy).toHaveBeenCalledOnce();
    expect(spies.scheduler.clear).toHaveBeenCalledOnce();
    expect(spies.input.destroy).toHaveBeenCalledOnce();
    expect(composed.destroy).toHaveBeenCalledOnce();
  });
});
