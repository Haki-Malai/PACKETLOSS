import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameCompositionRoot } from '../game/app/GameCompositionRoot';
import { BrowserInputAdapter } from '../game/infrastructure/adapters/BrowserInputAdapter';
import { ThreeRendererAdapter } from '../game/infrastructure/adapters/ThreeRendererAdapter';
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
  });
});
