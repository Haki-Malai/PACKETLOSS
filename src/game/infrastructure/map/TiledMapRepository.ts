import { WorldMapData } from '../../domain/world/WorldState';
import { parseTiledMap, TiledMap } from './TiledParser';

export class TiledMapRepository {
  async loadMap(src: string): Promise<WorldMapData> {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${src}`);
    }
    const mapData = (await response.json()) as TiledMap;
    return parseTiledMap(mapData);
  }
}
