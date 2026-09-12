import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameCompositionRoot } from '../game/app/GameCompositionRoot';
import { BrowserInputAdapter } from '../game/infrastructure/adapters/BrowserInputAdapter';
import { ThreeRendererAdapter } from '../game/infrastructure/adapters/ThreeRendererAdapter';
import { AssetCatalog } from '../game/infrastructure/assets/AssetCatalog';
import { TiledMapRepository } from '../game/infrastructure/map/TiledMapRepository';
import { getGameState, resetGameState } from '../state/gameState';
import { createCollisionTile, createMapFixture } from './fixtures/renderFixtures';
import { FakeDocument } from './helpers/fakeDom';

vi.mock('../game/infrastructure/adapters/ThreeRendererAdapter', () => ({ ThreeRendererAdapter: vi.fn() }));
vi.mock('../game/infrastructure/adapters/BrowserInputAdapter', () => ({ BrowserInputAdapter: vi.fn() }));

describe('GameCompositionRoot cancellation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    resetGameState();
  });

  it.each(['map', 'assets'])('leaves the replacement game intact when cancelled during %s loading', async (stage) => {
    const document = new FakeDocument();
    const mount = document.createElement('main');
    Object.assign(mount, { id: 'game-root' });
    document.body.appendChild(mount);
    vi.stubGlobal('document', document);
    const { map } = createMapFixture([[createCollisionTile()]]);
    let finishMap!: (_map: typeof map) => void;
    const mapLoading = new Promise<typeof map>((resolve) => { finishMap = resolve; });
    let finishAssets!: () => void;
    const assetsLoading = new Promise<void>((resolve) => { finishAssets = resolve; });
    let onAssetsStarted!: () => void;
    const assetsStarted = new Promise<void>((resolve) => { onAssetsStarted = resolve; });
    vi.spyOn(TiledMapRepository.prototype, 'loadMap').mockReturnValue(stage === 'map' ? mapLoading : Promise.resolve(map));
    const loadAssets = vi.spyOn(AssetCatalog.prototype, 'loadForMap').mockImplementation(() => {
      onAssetsStarted();
      return assetsLoading;
    });
    const abort = new AbortController();
    const starting = new GameCompositionRoot().compose({ pause: vi.fn(), resume: vi.fn(), togglePause: vi.fn() }, abort.signal);
    if (stage === 'assets') await assetsStarted;

    abort.abort();
    const replacement = document.createElement('canvas');
    mount.replaceChildren(replacement);
    resetGameState(1200, 2);
    finishMap(map);
    finishAssets();

    await expect(starting).rejects.toMatchObject({ name: 'AbortError' });
    expect(mount.children).toEqual([replacement]);
    expect(getGameState()).toEqual({ score: 1200, lives: 2 });
    expect(ThreeRendererAdapter).not.toHaveBeenCalled();
    expect(BrowserInputAdapter).not.toHaveBeenCalled();
    if (stage === 'map') expect(loadAssets).not.toHaveBeenCalled();
  });
});
