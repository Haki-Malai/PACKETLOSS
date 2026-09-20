import type { TilePosition } from '../domain/valueObjects/TilePosition';

export type MapVariant = 'default' | 'demo';

type BonusTiles = readonly [TilePosition, TilePosition, TilePosition, TilePosition, TilePosition];

export const SCORE_BONUS_TILES: Record<MapVariant, BonusTiles> = {
  default: [
    { x: 10, y: 8 }, { x: 38, y: 8 }, { x: 24, y: 2 }, { x: 14, y: 40 }, { x: 34, y: 40 },
  ],
  demo: [
    { x: 2, y: 2 }, { x: 10, y: 2 }, { x: 6, y: 2 }, { x: 3, y: 10 }, { x: 9, y: 10 },
  ],
};

export interface MapRuntimePaths {
  mapJsonPath: string;
}

const DEFAULT_MAP_PATHS: MapRuntimePaths = {
  mapJsonPath: 'assets/mazes/default/maze.json',
};

const DEMO_MAP_PATHS: MapRuntimePaths = {
  mapJsonPath: 'assets/mazes/default/demo.json',
};

export function resolveMapVariantFromEnv(gameEnv: string | undefined): MapVariant {
  return gameEnv === 'DEMO' ? 'demo' : 'default';
}

export function resolveMapPathsForVariant(mapVariant: MapVariant): MapRuntimePaths {
  if (mapVariant === 'demo') {
    return { ...DEMO_MAP_PATHS };
  }

  return { ...DEFAULT_MAP_PATHS };
}
