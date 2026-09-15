import type { WorldMapData } from '../domain/world/WorldState';
import { TiledMapRepository } from '../infrastructure/map/TiledMapRepository';
import { ArcadeAssets } from '../infrastructure/three/ArcadeAssets';
import { type MapVariant, resolveMapPathsForVariant } from './mapRuntimeConfig';

export interface PreparedGameResources {
    map: WorldMapData;
    assets?: ArcadeAssets;
}

/** Owns the parsed startup resources until the first game composition consumes them. */
export class PreloadedGameResources {
    private assets: ArcadeAssets | null;

    constructor(
        private readonly maps: Record<MapVariant, WorldMapData>,
        assets: ArcadeAssets
    ) {
        this.assets = assets;
    }

    /** Returns a prepared map and transfers the shared models to the first runtime only. */
    take(mapVariant: MapVariant): PreparedGameResources {
        const resources = {
            map: this.maps[mapVariant],
            ...(this.assets ? { assets: this.assets } : {}),
        };
        this.assets = null;
        return resources;
    }

    /** Releases models when the page closes before a runtime consumes them. */
    dispose(): void {
        this.assets?.dispose();
        this.assets = null;
    }
}

/** Loads and parses both playable maps and the shared character models before showing the title. */
export async function preloadGameResources(signal?: AbortSignal): Promise<PreloadedGameResources> {
    const repository = new TiledMapRepository();
    const defaultPath = resolveMapPathsForVariant('default').mapJsonPath;
    const demoPath = resolveMapPathsForVariant('demo').mapJsonPath;
    const [defaultResult, demoResult, assetResult] = await Promise.allSettled([
        repository.loadMap(defaultPath, signal),
        repository.loadMap(demoPath, signal),
        ArcadeAssets.load(signal),
    ]);
    if (
        defaultResult.status === 'rejected' ||
        demoResult.status === 'rejected' ||
        assetResult.status === 'rejected' ||
        signal?.aborted
    ) {
        if (assetResult.status === 'fulfilled') assetResult.value.dispose();
        signal?.throwIfAborted();
        if (defaultResult.status === 'rejected') throw defaultResult.reason;
        if (demoResult.status === 'rejected') throw demoResult.reason;
        throw assetResult.status === 'rejected'
            ? assetResult.reason
            : new Error('The game assets could not load.');
    }
    return new PreloadedGameResources(
        { default: defaultResult.value, demo: demoResult.value },
        assetResult.value
    );
}
