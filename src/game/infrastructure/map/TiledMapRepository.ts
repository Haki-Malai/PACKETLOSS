import { WorldMapData } from '../../domain/world/WorldState';
import { parseTiledMap, TiledMap } from './TiledParser';

export class TiledMapRepository {
  /** Fetches and parses a Tiled map, forwarding optional startup cancellation. */
  async loadMap(src: string, signal?: AbortSignal): Promise<WorldMapData> {
    const response = await fetch(src, { signal });
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${src}`);
    }
    const mapData = (await response.json()) as TiledMap;
    return parseTiledMap(mapData);
  }
}
