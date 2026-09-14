import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { GameRuntime } from '../game/app/GameRuntime';
import { ComposedGame, RuntimeState } from '../game/app/contracts';
import { GameCompositionRoot } from '../game/app/GameCompositionRoot';
import { EnemyEntity } from '../game/domain/entities/EnemyEntity';
import { PacketEntity } from '../game/domain/entities/PacketEntity';
import { EnemyDecisionService } from '../game/domain/services/EnemyDecisionService';
import { MovementRules } from '../game/domain/services/MovementRules';
import { PortalService } from '../game/domain/services/PortalService';
import { WorldState } from '../game/domain/world/WorldState';
import { SeededRandom } from '../game/shared/random/SeededRandom';
import { CollectibleSystem } from '../game/systems/CollectibleSystem';
import { EnemyMovementSystem } from '../game/systems/EnemyMovementSystem';
import { EnemyPacketCollisionSystem } from '../game/systems/EnemyPacketCollisionSystem';
import { TutorialController } from '../game/tutorial/TutorialController';
import { getGameState, resetGameState } from '../state/gameState';
import { createCollisionTile, createMapFixture } from './fixtures/pointLayoutFixtures';

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
    reset: vi.fn(),
  };

  const world = {
    isMoving: true,
    outcome: null as WorldState['outcome'],
    nextTick: vi.fn(),
  };

  const composed: ComposedGame = {
    world: world as never,
    renderer: {} as never,
    input: input as never,
    scheduler: scheduler as never,
    updateSystems: [{ start, update, destroy: updateDestroy }],
    renderSystems: [{ render, destroy: renderDestroy }],
    getRemainingPointCount: vi.fn(() => 1),
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

function createFinishingGame(kind: 'pellet' | 'power-pellet', enemyState?: 'dangerous' | 'scared', pointTile = { x: 0, y: 0 }) {
  const { composed, spies } = createComposedGame();
  const { map, collisionGrid } = createMapFixture(Array.from({ length: pointTile.y + 1 },
    () => Array.from({ length: pointTile.x + 2 }, () => createCollisionTile())));
  map.collectibleObjects = [{ type: kind, x: pointTile.x * 16 + 8, y: pointTile.y * 16 + 8 }];
  const movement = new MovementRules(16);
  const packet = new PacketEntity(pointTile, 10, 10);
  movement.setEntityTile(packet, packet.tile);
  const enemy = new EnemyEntity({
    key: 'virus', tile: packet.tile, direction: 'left', speed: 1, displayWidth: 10, displayHeight: 10,
  });
  movement.setEntityTile(enemy, enemy.tile);
  enemy.state.free = true;
  enemy.state.scared = enemyState === 'scared';
  const world = new WorldState({
    map, collisionGrid, tileSize: 16, packet, packetSpawnTile: { x: 1, y: 0 },
    enemies: enemyState ? [enemy] : [], enemyJailBounds: { minX: 1, maxX: 1, y: 0 },
  });
  const collisions = new EnemyPacketCollisionSystem(world, movement);
  const collectibles = new CollectibleSystem(world);
  composed.world = world;
  composed.updateSystems = [collisions, collectibles];
  composed.getRemainingPointCount = () => collectibles.getPointCount();
  return { composed, world, collectibles, spies };
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
    resetGameState();
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

  it.each([
    { kind: 'pellet' as const, score: 10, enemyState: undefined },
    { kind: 'power-pellet' as const, score: 50, enemyState: undefined },
    { kind: 'pellet' as const, score: 210, enemyState: 'scared' as const },
  ])('finishes on the final $kind with its score and any scared-enemy bonus ($score)', async ({ kind, score, enemyState }) => {
    const { composed, world } = createFinishingGame(kind, enemyState);
    const onStateChange = vi.fn<(_state: RuntimeState) => void>();
    const runtime = new GameRuntime({ compose: vi.fn().mockResolvedValue(composed) } as unknown as GameCompositionRoot, onStateChange);
    await runtime.start();
    nextFrame?.(1);
    nextFrame?.(20);
    const result = { outcome: 'cleared', score, lives: 3, elapsedMs: 17, pointsCollected: 1, totalPoints: 1 };
    expect(onStateChange).toHaveBeenLastCalledWith({ paused: true, result });
    expect(world.isMoving).toBe(false);

    runtime.resume();
    emitWindowEvent('blur');
    emitWindowEvent('focus');
    nextFrame?.(60);
    expect(world.isMoving).toBe(false);
    expect(onStateChange.mock.calls.filter(([state]) => state.result)).toHaveLength(1);
    expect(getGameState().score).toBe(score);
    runtime.destroy();
  });

  it('lets a final-life collision beat the last power core, freezes death on pause, and records active time once', async () => {
    const { composed, world, collectibles } = createFinishingGame('power-pellet', 'dangerous');
    resetGameState(100, 1);
    const onStateChange = vi.fn<(_state: RuntimeState) => void>();
    const runtime = new GameRuntime({ compose: vi.fn().mockResolvedValue(composed) } as unknown as GameCompositionRoot, onStateChange);
    await runtime.start();
    nextFrame?.(1);
    nextFrame?.(20);
    runtime.pause();
    nextFrame?.(120);
    nextFrame?.(220);
    expect(world.packet.deathAnimationRemainingMs).toBe(900);
    expect(collectibles.getPointCount()).toBe(1);
    expect(world.outcome).toBeNull();

    runtime.resume();
    for (let frame = 1; frame <= 65; frame += 1) nextFrame?.(220 + frame * 17);
    const result = onStateChange.mock.lastCall?.[0].result;
    expect(result).toMatchObject({ outcome: 'lost', score: 100, lives: 0, pointsCollected: 0, totalPoints: 1 });
    expect(result?.elapsedMs).toBeGreaterThanOrEqual(917);
    expect(result?.elapsedMs).toBeLessThanOrEqual(934);
    expect(world.packet.tile).toEqual({ x: 0, y: 0 });
    expect(world.packet.deathRecoveryRemainingMs).toBe(0);
    runtime.resume();
    nextFrame?.(1500);
    expect(world.isMoving).toBe(false);
    expect(onStateChange.mock.calls.filter(([state]) => state.result)).toHaveLength(1);
    runtime.destroy();
  });

  it('does not award a clear for a map that starts with no points', async () => {
    const { composed, spies } = createComposedGame();
    composed.getRemainingPointCount = () => 0;
    const onStateChange = vi.fn<(_state: RuntimeState) => void>();
    const runtime = new GameRuntime({ compose: vi.fn().mockResolvedValue(composed) } as unknown as GameCompositionRoot, onStateChange);
    await runtime.start();
    nextFrame?.(1);
    nextFrame?.(50);
    expect(spies.world.isMoving).toBe(true);
    expect(onStateChange).toHaveBeenCalledExactlyOnceWith({ paused: false, result: null });
    runtime.destroy();
  });

  it('starts practice frozen and holds a real dangerous encounter for a lesson retry without a result', async () => {
    const { composed, world, collectibles, spies } = createFinishingGame('pellet', 'dangerous');
    composed.tutorial = new TutorialController('firewall', world, new MovementRules(16), collectibles);
    const onStateChange = vi.fn<(_state: RuntimeState) => void>();
    const runtime = new GameRuntime({ compose: vi.fn().mockResolvedValue(composed) } as unknown as GameCompositionRoot,
      onStateChange);
    await runtime.start();
    nextFrame?.(1);
    nextFrame?.(40);
    emitWindowEvent('blur');
    emitWindowEvent('focus');
    expect(world.packet.deathAnimationRemainingMs).toBe(0);
    expect(spies.scheduler.update).not.toHaveBeenCalled();
    expect(spies.scheduler.setPaused).toHaveBeenLastCalledWith(true);
    expect(onStateChange.mock.lastCall?.[0]).toMatchObject({ paused: true, result: null,
      tutorial: { lesson: 'firewall', phase: 'introduction' } });

    runtime.resume();
    nextFrame?.(60);
    expect(world.packet.deathAnimationRemainingMs).toBe(900);
    expect(collectibles.getPointCount()).toBe(1);
    expect(onStateChange.mock.lastCall?.[0]).toMatchObject({ paused: true, result: null,
      tutorial: { phase: 'retry' } });
    runtime.resume();
    emitWindowEvent('blur');
    emitWindowEvent('focus');
    nextFrame?.(100);
    expect(world.packet.deathAnimationRemainingMs).toBe(900);
    expect(world.isMoving).toBe(false);
    expect(onStateChange.mock.calls.map(([state]) => state.tutorial?.phase))
      .toEqual(['introduction', 'playing', 'retry']);
    runtime.destroy();
  });

  it('pauses after the last power pickup and enemy capture without turning practice into a completed run', async () => {
    const { composed, world, collectibles, spies } = createFinishingGame('power-pellet', 'dangerous', { x: 7, y: 7 });
    const movement = new MovementRules(16);
    const enemy = world.enemies[0];
    enemy.key = 'firewall';
    movement.setEntityTile(enemy, { x: 8, y: 7 });
    composed.updateSystems.unshift(new EnemyMovementSystem(world, movement, new EnemyDecisionService(),
      new PortalService(world.collisionGrid), new SeededRandom(1)));
    composed.tutorial = new TutorialController('power', world, movement, collectibles);
    const onStateChange = vi.fn<(_state: RuntimeState) => void>();
    const runtime = new GameRuntime({ compose: vi.fn().mockResolvedValue(composed) } as unknown as GameCompositionRoot,
      onStateChange);
    await runtime.start();
    runtime.resume();
    nextFrame?.(1);
    nextFrame?.(20);
    expect(collectibles.getPointCount()).toBe(0);
    expect(world.outcome).toBeNull();
    expect(onStateChange.mock.lastCall?.[0]).toMatchObject({ paused: true, result: null,
      tutorial: { phase: 'explanation' } });
    const timerCalls = spies.scheduler.update.mock.calls.length;
    nextFrame?.(60);
    expect(spies.scheduler.update).toHaveBeenCalledTimes(timerCalls);

    movement.setEntityTile(enemy, world.packet.tile);
    runtime.resume();
    nextFrame?.(80);
    expect(enemy.state.dead).toBe(true);
    for (let frame = 1; frame <= 28; frame += 1) nextFrame?.(80 + frame * 17);
    expect(onStateChange.mock.lastCall?.[0]).toMatchObject({ paused: true, result: null,
      tutorial: { phase: 'success' } });
    runtime.resume();
    emitWindowEvent('blur');
    emitWindowEvent('focus');
    nextFrame?.(620);
    expect(world.isMoving).toBe(false);
    expect(onStateChange.mock.calls.map(([state]) => state.tutorial?.phase))
      .toEqual(['introduction', 'playing', 'explanation', 'playing', 'success']);
    expect(onStateChange.mock.calls.every(([state]) => state.result === null)).toBe(true);
    runtime.destroy();
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
    expect(spies.input.reset).toHaveBeenCalledTimes(1);
    expect(spies.world.isMoving).toBe(false);
    expect(spies.scheduler.setPaused).toHaveBeenCalledWith(true);
    nextFrame?.(40);
    nextFrame?.(60);
    expect(spies.update).not.toHaveBeenCalled();
    expect(spies.scheduler.update).not.toHaveBeenCalled();
    expect(spies.world.nextTick).not.toHaveBeenCalled();
    expect(spies.render).toHaveBeenLastCalledWith(1);

    runtime.resume();
    expect(spies.input.reset).toHaveBeenCalledTimes(2);
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

  it('cancels focus-driven resume when an already paused menu is explicitly opened', async () => {
    const { composed, spies } = createComposedGame();
    const onStateChange = vi.fn<(_state: RuntimeState) => void>();
    const runtime = new GameRuntime({ compose: vi.fn().mockResolvedValue(composed) } as unknown as GameCompositionRoot, onStateChange);
    await runtime.start();
    emitWindowEvent('blur');
    runtime.pause();
    emitWindowEvent('focus');
    expect(spies.world.isMoving).toBe(false);
    expect(onStateChange.mock.calls.map(([state]) => state.paused)).toEqual([false, true]);
    runtime.destroy();
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
