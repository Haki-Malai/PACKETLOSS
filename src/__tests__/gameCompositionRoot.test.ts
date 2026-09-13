import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameCompositionRoot } from '../game/app/GameCompositionRoot';
import { BrowserInputAdapter } from '../game/infrastructure/adapters/BrowserInputAdapter';
import { ThreeRendererAdapter } from '../game/infrastructure/adapters/ThreeRendererAdapter';
import { TiledMapRepository } from '../game/infrastructure/map/TiledMapRepository';
import { ArcadeAssets } from '../game/infrastructure/three/ArcadeAssets';
import { AnimationSystem } from '../game/systems/AnimationSystem';
import { RenderSystem } from '../game/systems/RenderSystem';
import { getGameState, resetGameState } from '../state/gameState';
import { createCharacterAssets } from './fixtures/characterFixtures';
import { createCollisionTile, createMapFixture } from './fixtures/renderFixtures';
import { FakeDocument } from './helpers/fakeDom';

vi.mock('../game/infrastructure/adapters/ThreeRendererAdapter', () => ({ ThreeRendererAdapter: vi.fn() }));
vi.mock('../game/infrastructure/adapters/BrowserInputAdapter', () => ({ BrowserInputAdapter: vi.fn() }));

function prepareComposition() {
  const document = new FakeDocument();
  const mount = document.createElement('main');
  Object.assign(mount, { id: 'game-root' });
  document.body.appendChild(mount);
  vi.stubGlobal('document', document);
  const { map } = createMapFixture([[createCollisionTile()]]);
  vi.spyOn(TiledMapRepository.prototype, 'loadMap').mockResolvedValue(map);
  return { document, mount };
}

const runtimeControl = { pause: vi.fn(), resume: vi.fn(), togglePause: vi.fn() };

describe('GameCompositionRoot startup', () => {
  afterEach(() => {
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
    const failure = new Error('Could not load block.glb');
    vi.spyOn(ArcadeAssets, 'load').mockRejectedValue(failure);
    await expect(new GameCompositionRoot().compose(runtimeControl)).rejects.toBe(failure);
    expect(mount.children).toEqual([replacement]);
    expect(getGameState()).toEqual({ score: 500, lives: 1 });
    expect(ThreeRendererAdapter).not.toHaveBeenCalled();
    expect(BrowserInputAdapter).not.toHaveBeenCalled();
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

  it('mounts loaded models and registers their presentation clock after gameplay animation', async () => {
    const { mount } = prepareComposition();
    const assets = createCharacterAssets();
    vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
    const rendererDispose = vi.fn();
    vi.mocked(ThreeRendererAdapter).mockImplementationOnce(function () {
      return { dispose: rendererDispose } as unknown as ThreeRendererAdapter;
    });
    const composed = await new GameCompositionRoot({ rng: () => 0.5 }).compose(runtimeControl);
    const render = composed.renderSystems.find((system) => system instanceof RenderSystem)!;
    const animationIndex = composed.updateSystems.findIndex((system) => system instanceof AnimationSystem);
    expect(composed.updateSystems[animationIndex + 1]).toBe(render);
    expect(mount.children).toHaveLength(1);
    expect(render.scene.getObjectByName('binary-000')).toBeDefined();
    render.destroy?.();
    composed.destroy();
    expect(rendererDispose).toHaveBeenCalledOnce();
    expect(mount.children).toHaveLength(0);
  });
});
