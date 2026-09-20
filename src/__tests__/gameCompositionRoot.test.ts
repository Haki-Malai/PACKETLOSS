import { afterEach, describe, expect, it, vi } from 'vitest';
import { CAMERA } from '../config/constants';
import { Camera3D } from '../engine/camera3d';
import { GameCompositionRoot } from '../game/app/GameCompositionRoot';
import { PreloadedGameResources } from '../game/app/preloadGameResources';
import { BrowserInputAdapter } from '../game/infrastructure/adapters/BrowserInputAdapter';
import { ThreeRendererAdapter } from '../game/infrastructure/adapters/ThreeRendererAdapter';
import { TiledMapRepository } from '../game/infrastructure/map/TiledMapRepository';
import { ArcadeAssets } from '../game/infrastructure/three/ArcadeAssets';
import { AnimationSystem } from '../game/systems/AnimationSystem';
import { CameraSystem } from '../game/systems/CameraSystem';
import { EnemyReleaseSystem } from '../game/systems/EnemyReleaseSystem';
import { EndlessEncounterSystem } from '../game/systems/EndlessEncounterSystem';
import { EndlessStreamingSystem } from '../game/systems/EndlessStreamingSystem';
import { RenderSystem } from '../game/systems/RenderSystem';
import { ScoreBonusSystem } from '../game/systems/ScoreBonusSystem';
import { DebugOverlaySystem } from '../game/systems/DebugOverlaySystem';
import { getGameState, resetGameState } from '../state/gameState';
import { createCharacterAssets } from './fixtures/characterFixtures';
import { createCollisionTile, createMapFixture } from './fixtures/renderFixtures';
import { FakeDocument } from './helpers/fakeDom';
import { createHarnessMap } from './helpers/mechanicsDomainMapFactory';

vi.mock('../game/infrastructure/adapters/ThreeRendererAdapter', () => ({ ThreeRendererAdapter: vi.fn() }));
vi.mock('../game/infrastructure/adapters/BrowserInputAdapter', () => ({ BrowserInputAdapter: vi.fn() }));
const environment = vi.hoisted(() => ({ isDev: true }));
vi.mock('../config/environment', () => ({ get IS_DEV() { return environment.isDev; } }));

function prepareComposition() {
  const document = new FakeDocument();
  const mount = document.createElement('main');
  Object.assign(mount, { id: 'game-root' });
  document.body.appendChild(mount);
  vi.stubGlobal('document', document);
  const map = createHarnessMap('demo-map');
  vi.spyOn(TiledMapRepository.prototype, 'loadMap').mockResolvedValue(map);
  return { document, mount };
}

const runtimeControl = { pause: vi.fn(), resume: vi.fn(), togglePause: vi.fn() };

describe('GameCompositionRoot startup', () => {
  afterEach(() => {
    environment.isDev = true;
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    resetGameState();
  });

  it('leaves the replacement game intact when cancelled during map loading', async () => {
    const document = new FakeDocument();
    const mount = document.createElement('main');
    Object.assign(mount, { id: 'game-root' });
    document.body.appendChild(mount);
    vi.stubGlobal('document', document);
    const { map } = createMapFixture([[createCollisionTile()]]);
    let finishMap!: (_map: typeof map) => void;
    const mapLoading = new Promise<typeof map>((resolve) => { finishMap = resolve; });
    vi.spyOn(TiledMapRepository.prototype, 'loadMap').mockReturnValue(mapLoading);
    const loadAssets = vi.spyOn(ArcadeAssets, 'load');
    const abort = new AbortController();
    const starting = new GameCompositionRoot().compose({ pause: vi.fn(), resume: vi.fn(), togglePause: vi.fn() }, abort.signal);

    abort.abort();
    const replacement = document.createElement('canvas');
    mount.replaceChildren(replacement);
    resetGameState(1200, 2);
    finishMap(map);

    await expect(starting).rejects.toMatchObject({ name: 'AbortError' });
    expect(mount.children).toEqual([replacement]);
    expect(getGameState()).toEqual({ score: 1200, lives: 2 });
    expect(ThreeRendererAdapter).not.toHaveBeenCalled();
    expect(BrowserInputAdapter).not.toHaveBeenCalled();
    expect(loadAssets).not.toHaveBeenCalled();
  });

  it('waits for character assets and releases a late load without replacing a cancelled game', async () => {
    const { document, mount } = prepareComposition();
    const assets = createCharacterAssets();
    const dispose = vi.spyOn(assets, 'dispose');
    let finishLoad!: (_assets: ArcadeAssets) => void;
    const loading = new Promise<ArcadeAssets>((resolve) => { finishLoad = resolve; });
    const load = vi.spyOn(ArcadeAssets, 'load').mockReturnValue(loading);
    const abort = new AbortController();
    const starting = new GameCompositionRoot().compose(runtimeControl, abort.signal);
    await vi.waitFor(() => expect(load).toHaveBeenCalledWith(abort.signal));
    expect(ThreeRendererAdapter).not.toHaveBeenCalled();
    abort.abort();
    const replacement = document.createElement('canvas');
    mount.replaceChildren(replacement);
    resetGameState(1200, 2);
    finishLoad(assets);

    await expect(starting).rejects.toMatchObject({ name: 'AbortError' });
    expect(dispose).toHaveBeenCalledOnce();
    expect(mount.children).toEqual([replacement]);
    expect(getGameState()).toEqual({ score: 1200, lives: 2 });
    expect(ThreeRendererAdapter).not.toHaveBeenCalled();
    expect(BrowserInputAdapter).not.toHaveBeenCalled();
  });

  it('propagates a character load failure without mounting or resetting shared state', async () => {
    const { document, mount } = prepareComposition();
    const replacement = document.createElement('canvas');
    mount.replaceChildren(replacement);
    resetGameState(500, 1);
    const failure = new Error('Could not load firewall.glb');
    vi.spyOn(ArcadeAssets, 'load').mockRejectedValue(failure);
    await expect(new GameCompositionRoot().compose(runtimeControl)).rejects.toBe(failure);
    expect(mount.children).toEqual([replacement]);
    expect(getGameState()).toEqual({ score: 500, lives: 1 });
    expect(ThreeRendererAdapter).not.toHaveBeenCalled();
    expect(BrowserInputAdapter).not.toHaveBeenCalled();
  });

  it('uses the first-visit map and models without loading them again', async () => {
    const { mount } = prepareComposition();
    const map = createHarnessMap('demo-map');
    const assets = createCharacterAssets();
    const loadMap = vi.spyOn(TiledMapRepository.prototype, 'loadMap');
    loadMap.mockClear();
    const loadAssets = vi.spyOn(ArcadeAssets, 'load');
    const rendererDispose = vi.fn();
    const prepare = vi.fn(async () => {});
    vi.mocked(ThreeRendererAdapter).mockImplementationOnce(function () {
      return { dispose: rendererDispose, prepare } as unknown as ThreeRendererAdapter;
    });
    const preloadedResources = new PreloadedGameResources({ default: map, demo: map }, assets);

    const composed = await new GameCompositionRoot({ preloadedResources }).compose(runtimeControl);

    expect(loadMap).not.toHaveBeenCalled();
    expect(loadAssets).not.toHaveBeenCalled();
    expect(composed.world.map).toBe(map);
    const render = composed.renderSystems.find((system) => system instanceof RenderSystem)!;
    expect(prepare).toHaveBeenCalledExactlyOnceWith(render.scene, expect.anything());
    render.destroy?.();
    composed.destroy();
    expect(rendererDispose).toHaveBeenCalledOnce();
    expect(mount.children).toHaveLength(0);
  });

  it('composes Endless from generated tiles with seven originals and three reusable Spam slots', async () => {
    environment.isDev = false;
    const { mount } = prepareComposition();
    const loadMap = vi.spyOn(TiledMapRepository.prototype, 'loadMap');
    loadMap.mockClear();
    vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(createCharacterAssets());
    vi.mocked(ThreeRendererAdapter).mockImplementationOnce(function () {
      return { dispose: vi.fn(), prepare: vi.fn(async () => {}) } as unknown as ThreeRendererAdapter;
    });

    const composed = await new GameCompositionRoot({ mode: 'endless', endlessSeed: 123 }).compose(runtimeControl);
    expect(loadMap).not.toHaveBeenCalled();
    expect(composed.world.runMode).toBe('endless');
    expect([composed.world.map.width, composed.world.map.height]).toEqual([25, 120]);
    expect(composed.world.packetSpawnTile).toEqual({ x: 12, y: 60 });
    expect(composed.world.packet.tile).toEqual({ x: 12, y: 60 });
    expect(composed.world.map.tiles[59].slice(10, 15).map((tile) => tile.localId))
      .toEqual([17, 18, 19, 20, 21]);
    expect(composed.world.map.portalPairs).toContainEqual({
      from: { x: 1, y: 60 }, to: { x: 23, y: 60 },
    });
    for (let x = 1; x < 23; x += 1) {
      expect(composed.world.map.tiles[60][x].collision.right).toBe(false);
    }
    expect(composed.world.enemies).toHaveLength(10);
    expect(composed.world.enemies.filter((enemy) => !enemy.isCopy)).toHaveLength(7);
    expect(composed.world.enemies.filter((enemy) => enemy.isCopy)).toHaveLength(3);
    expect(composed.world.enemies.every((enemy) => !enemy.active)).toBe(true);
    expect(composed.updateSystems.some((system) => system instanceof EnemyReleaseSystem)).toBe(false);
    expect(composed.updateSystems.some((system) => system instanceof EndlessEncounterSystem)).toBe(true);
    expect(composed.updateSystems.some((system) => system instanceof EndlessStreamingSystem)).toBe(true);
    composed.renderSystems.forEach((system) => system.destroy?.());
    composed.destroy();
    expect(mount.children).toHaveLength(0);
  });

  it('keeps the canvas unmounted and releases the scene if shader preparation is cancelled', async () => {
    const { mount } = prepareComposition();
    const assets = createCharacterAssets();
    const disposeAssets = vi.spyOn(assets, 'dispose');
    vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
    let finishPreparation!: () => void;
    const preparation = new Promise<void>((resolve) => { finishPreparation = resolve; });
    const prepare = vi.fn(() => preparation);
    const disposeRenderer = vi.fn();
    vi.mocked(ThreeRendererAdapter).mockImplementationOnce(function () {
      return { prepare, dispose: disposeRenderer } as unknown as ThreeRendererAdapter;
    });
    const destroyInput = vi.fn();
    vi.mocked(BrowserInputAdapter).mockImplementationOnce(function () {
      return { destroy: destroyInput } as unknown as BrowserInputAdapter;
    });
    const abort = new AbortController();
    const starting = new GameCompositionRoot().compose(runtimeControl, abort.signal);

    await vi.waitFor(() => expect(prepare).toHaveBeenCalledOnce());
    expect(mount.children).toHaveLength(0);
    abort.abort();
    finishPreparation();
    await expect(starting).rejects.toMatchObject({ name: 'AbortError' });
    expect(disposeRenderer).toHaveBeenCalledOnce();
    expect(disposeAssets).toHaveBeenCalledOnce();
    expect(destroyInput).toHaveBeenCalledOnce();
    expect(mount.children).toHaveLength(0);
  });

  it('releases loaded assets and a created renderer when input construction fails', async () => {
    const { mount } = prepareComposition();
    const assets = createCharacterAssets();
    const disposeAssets = vi.spyOn(assets, 'dispose');
    const disposeRenderer = vi.fn();
    vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
    vi.mocked(ThreeRendererAdapter).mockImplementationOnce(function () {
      return { dispose: disposeRenderer } as unknown as ThreeRendererAdapter;
    });
    const failure = new Error('Input could not start');
    vi.mocked(BrowserInputAdapter).mockImplementationOnce(function () { throw failure; });
    await expect(new GameCompositionRoot().compose(runtimeControl)).rejects.toBe(failure);
    expect(disposeAssets).toHaveBeenCalledOnce();
    expect(disposeRenderer).toHaveBeenCalledOnce();
    expect(mount.children).toHaveLength(0);
  });

  it('rejects a map without a qualifying Firewall patrol and releases startup resources', async () => {
    const { mount } = prepareComposition();
    const { map } = createMapFixture([[createCollisionTile()]]);
    vi.spyOn(TiledMapRepository.prototype, 'loadMap').mockResolvedValue(map);
    const assets = createCharacterAssets();
    const disposeAssets = vi.spyOn(assets, 'dispose');
    const disposeRenderer = vi.fn();
    const destroyInput = vi.fn();
    vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
    vi.mocked(ThreeRendererAdapter).mockImplementationOnce(function () {
      return { dispose: disposeRenderer } as unknown as ThreeRendererAdapter;
    });
    vi.mocked(BrowserInputAdapter).mockImplementationOnce(function () {
      return { destroy: destroyInput } as unknown as BrowserInputAdapter;
    });

    await expect(new GameCompositionRoot().compose(runtimeControl)).rejects.toThrow('at least 16 steps');
    expect(destroyInput).toHaveBeenCalledOnce();
    expect(disposeRenderer).toHaveBeenCalledOnce();
    expect(disposeAssets).toHaveBeenCalledOnce();
    expect(mount.children).toHaveLength(0);
  });

  it.each([true, false])('mounts models and their presentation clock with diagnostics only in dev (%s)', async (isDev) => {
    environment.isDev = isDev;
    const { mount } = prepareComposition();
    const assets = createCharacterAssets();
    vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
    const rendererDispose = vi.fn();
    vi.mocked(ThreeRendererAdapter).mockImplementationOnce(function () {
      return { dispose: rendererDispose, prepare: vi.fn(async () => {}) } as unknown as ThreeRendererAdapter;
    });
    const composed = await new GameCompositionRoot({ rng: () => 0.5 }).compose(runtimeControl);
    const render = composed.renderSystems.find((system) => system instanceof RenderSystem)!;
    const animationIndex = composed.updateSystems.findIndex((system) => system instanceof AnimationSystem);
    expect(composed.updateSystems[animationIndex + 1]).toBe(render);
    expect(composed.updateSystems.some((system) => system instanceof DebugOverlaySystem)).toBe(isDev);
    expect(composed.renderSystems.some((system) => system instanceof DebugOverlaySystem)).toBe(isDev);
    expect(render.scene.getObjectByName('collision-debug') !== undefined).toBe(isDev);
    expect(composed.updateSystems.some((system) => system instanceof EnemyReleaseSystem)).toBe(true);
    expect(composed.updateSystems.some((system) => system instanceof ScoreBonusSystem)).toBe(true);
    expect(composed.tutorial).toBeUndefined();
    expect(mount.children).toHaveLength(1);
    expect(render.scene.getObjectByName('binary-000')).toBeDefined();
    expect(composed.world.enemies.filter((enemy) => enemy.active).map((enemy) => enemy.key))
      .toEqual(['firewall', 'virus', 'ping', 'spam', 'lag', 'quarantine', 'trojan']);
    const copies = composed.world.enemies.filter((enemy) => enemy.isCopy);
    expect(copies).toHaveLength(3);
    expect(copies.every((enemy) => !enemy.active && !enemy.state.soonFree && enemy.displayWidth === 8.8)).toBe(true);
    render.destroy?.();
    composed.destroy();
    expect(rendererDispose).toHaveBeenCalledOnce();
    expect(mount.children).toHaveLength(0);
  });

  it('resets level actors and restores the original jail roster while retiring Spam copies', async () => {
    const { mount } = prepareComposition();
    vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(createCharacterAssets());
    const rendererDispose = vi.fn();
    vi.mocked(ThreeRendererAdapter).mockImplementationOnce(function () {
      return { dispose: rendererDispose, prepare: vi.fn(async () => {}) } as unknown as ThreeRendererAdapter;
    });
    const composed = await new GameCompositionRoot({ rng: () => 0.5 }).compose(runtimeControl);
    const originals = composed.world.enemies.filter((enemy) => !enemy.isCopy);
    const copies = composed.world.enemies.filter((enemy) => enemy.isCopy);
    const initialPointCount = composed.getRemainingPointCount();
    const originalPlacements = originals.map((enemy) => ({ tile: { ...enemy.tile }, direction: enemy.direction }));
    composed.world.levelMultiplier = 1.25;
    composed.world.packet.tile = { x: 0, y: 0 };
    composed.world.packet.moved = { x: 3, y: 0 };
    composed.world.packet.portalBlinkRemainingMs = Infinity;
    composed.world.packet.portalBlinkElapsedMs = 360;
    originals.forEach((enemy) => {
      enemy.tile = { x: 0, y: 0 };
      enemy.state = { free: true, soonFree: false, scared: true, dead: false, animation: 'scared' };
      enemy.abilityRemainingMs = 200;
    });
    copies[0].active = true;
    copies[0].state.free = true;
    composed.world.enemyEffects = [{ kind: 'split', x: 8, y: 8, radius: 16, ageMs: 0, durationMs: 450 }];
    composed.world.lagZones = [{
      tile: { x: 1, y: 1 }, x: 24, y: 24, radius: 8, ageMs: 0, durationMs: 4000,
    }];

    expect(composed.resetLevel()).toBe(initialPointCount);

    expect(composed.world.packet.tile).toEqual(composed.world.packetSpawnTile);
    expect(composed.world.packet.direction).toEqual({ current: 'right', next: 'right' });
    expect(composed.world.packet.portalBlinkRemainingMs).toBe(Infinity);
    expect(composed.world.packet.portalBlinkElapsedMs).toBe(360);
    expect(originals.map((enemy) => ({ tile: enemy.tile, direction: enemy.direction }))).toEqual(originalPlacements);
    expect(originals.every((enemy) => enemy.active && !enemy.state.free && enemy.state.soonFree
      && !enemy.state.scared && !enemy.state.dead)).toBe(true);
    expect(originals.map((enemy) => enemy.speed)).toEqual([1.15, 0.85, 1, 1, 0.5, 1, 1]);
    expect(copies.every((enemy) => !enemy.active && !enemy.state.soonFree)).toBe(true);
    expect(composed.world.enemyEffects).toEqual([]);
    expect(composed.world.lagZones).toEqual([]);

    const render = composed.renderSystems.find((system) => system instanceof RenderSystem)!;
    render.destroy?.();
    composed.destroy();
    expect(rendererDispose).toHaveBeenCalledOnce();
    expect(mount.children).toHaveLength(0);
  });

  it('forces the demo and authored Ping pickup for practice without automatic releases', async () => {
    const { mount } = prepareComposition();
    Object.assign(mount, { getBoundingClientRect: () => ({ width: 320, height: 568 }) });
    const map = createHarnessMap('demo-map');
    const loadMap = vi.spyOn(TiledMapRepository.prototype, 'loadMap').mockResolvedValue(map);
    vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(createCharacterAssets());
    vi.stubGlobal('window', { innerWidth: 320, innerHeight: 568, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const setZoom = vi.spyOn(Camera3D.prototype, 'setZoom');
    const rendererDispose = vi.fn();
    vi.mocked(ThreeRendererAdapter).mockImplementationOnce(function () {
      return { dispose: rendererDispose, prepare: vi.fn(async () => {}), resize: vi.fn(), width: 320, height: 568 } as unknown as ThreeRendererAdapter;
    });
    const rng = vi.fn(() => 0.9);
    const composed = await new GameCompositionRoot({ mapVariant: 'default', tutorialLesson: 'ping', rng })
      .compose(runtimeControl);

    expect(loadMap).toHaveBeenCalledWith('assets/mazes/default/demo.json');
    expect(rng).not.toHaveBeenCalled();
    expect(composed.world.map).toBe(map);
    expect(composed.tutorial?.getSnapshot()).toMatchObject({ lesson: 'ping', phase: 'introduction' });
    expect(composed.getRemainingPointCount()).toBe(1);
    expect(composed.updateSystems.some((system) => system instanceof EnemyReleaseSystem)).toBe(false);
    expect(composed.updateSystems.some((system) => system instanceof ScoreBonusSystem)).toBe(false);
    expect(composed.world.enemies.filter((enemy) => enemy.active).map((enemy) => enemy.key)).toEqual(['ping']);
    const camera = composed.updateSystems.find((system) => system instanceof CameraSystem)!;
    camera.start();
    expect(setZoom.mock.lastCall?.[0]).toBeLessThan(CAMERA.zoom);
    camera.destroy();

    const render = composed.renderSystems.find((system) => system instanceof RenderSystem)!;
    render.destroy?.();
    composed.destroy();
    expect(rendererDispose).toHaveBeenCalledOnce();
    expect(mount.children).toHaveLength(0);
  });
});
