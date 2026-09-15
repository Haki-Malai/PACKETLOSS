import { afterEach, describe, expect, it, vi } from 'vitest';
import { PreloadedGameResources, preloadGameResources } from '../game/app/preloadGameResources';
import { TiledMapRepository } from '../game/infrastructure/map/TiledMapRepository';
import { ArcadeAssets } from '../game/infrastructure/three/ArcadeAssets';
import { createCharacterAssets } from './fixtures/characterFixtures';
import { createCollisionTile, createMapFixture } from './fixtures/renderFixtures';

describe('initial game resource preload', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads both maps and transfers the parsed models to the first selected runtime', async () => {
        const defaultMap = createMapFixture([[createCollisionTile()]]).map;
        const demoMap = createMapFixture([[createCollisionTile()]]).map;
        const assets = createCharacterAssets();
        const loadMap = vi
            .spyOn(TiledMapRepository.prototype, 'loadMap')
            .mockImplementation((path) =>
                Promise.resolve(path.endsWith('demo.json') ? demoMap : defaultMap)
            );
        vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
        const abort = new AbortController();

        const preloaded = await preloadGameResources(abort.signal);

        expect(loadMap.mock.calls).toEqual([
            ['assets/mazes/default/maze.json', abort.signal],
            ['assets/mazes/default/demo.json', abort.signal],
        ]);
        expect(preloaded.take('demo')).toEqual({ map: demoMap, assets });
        expect(preloaded.take('default')).toEqual({ map: defaultMap });
        assets.dispose();
    });

    it('releases parsed models when another required resource fails', async () => {
        const assets = createCharacterAssets();
        const dispose = vi.spyOn(assets, 'dispose');
        vi.spyOn(TiledMapRepository.prototype, 'loadMap')
            .mockRejectedValueOnce(new Error('Default map unavailable'))
            .mockResolvedValueOnce(createMapFixture([[createCollisionTile()]]).map);
        vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);

        await expect(preloadGameResources()).rejects.toThrow('Default map unavailable');
        expect(dispose).toHaveBeenCalledOnce();
    });

    it('disposes unclaimed models exactly once', () => {
        const map = createMapFixture([[createCollisionTile()]]).map;
        const assets = createCharacterAssets();
        const dispose = vi.spyOn(assets, 'dispose');
        const preloaded = new PreloadedGameResources({ default: map, demo: map }, assets);

        preloaded.dispose();
        preloaded.dispose();

        expect(dispose).toHaveBeenCalledOnce();
    });
});
