import type { WorldMapData, WorldTile } from './WorldState';

export interface MazeFootprint {
  width: number;
  height: number;
  solid: Uint8Array;
}

export interface WallConnection {
  readonly tile: { readonly x: number; readonly y: number };
  readonly side: 'right' | 'down';
}

const EMPTY = '................';
const FULL = '################';
const LEFT = '##..............';
const RIGHT = '..............##';
const BOTH = '##............##';
const repeat = (row: string, count: number): string[] => Array.from({ length: count }, () => row);

/** Exact, unrotated sixteen-pixel silhouettes shared by map rendering and hazard placement. */
export const TILE_FOOTPRINTS: Readonly<Record<number, readonly string[]>> = {
  0: repeat(LEFT, 16),
  1: repeat(BOTH, 16),
  2: [FULL, FULL, ...repeat(LEFT, 14)],
  5: [FULL, FULL, ...repeat(EMPTY, 12), '#...............', LEFT],
  6: [FULL, FULL, ...repeat(EMPTY, 12), '#...............', '##.............#'],
  7: [BOTH, '#.............##', ...repeat(RIGHT, 12), '#.............##', BOTH],
  10: [BOTH, '#.............##', ...repeat(RIGHT, 12), FULL, FULL],
  14: [BOTH, '#..............#', ...repeat(EMPTY, 12), '#..............#', BOTH],
  15: [...repeat(EMPTY, 14), '...............#', RIGHT],
  16: [FULL, FULL, ...repeat(BOTH, 4), FULL, FULL, FULL, FULL, ...repeat(BOTH, 4), FULL, FULL],
  23: [RIGHT, '...............#', ...repeat(EMPTY, 12), '...............#', RIGHT],
};

/** Rasterizes the authored wall tiles after their Tiled rotation and flip transforms. */
export function buildMazeWallFootprint(map: WorldMapData): MazeFootprint {
  return buildFootprint(map, (tile) => tile.localId === null || tile.localId < 16 || tile.localId > 21);
}

/** Rasterizes only the authored prison tiles for their separate elevated presentation. */
export function buildMazePenFootprint(map: WorldMapData): MazeFootprint {
  return buildFootprint(map, (tile) => tile.localId === 16);
}

/** Samples one candidate rail as four pixels across a tile seam and one tile long. */
export function wallConnectionCells(map: WorldMapData, connection: WallConnection): Array<{ x: number; y: number }> {
  const cells: Array<{ x: number; y: number }> = [];
  const { x, y } = connection.tile;
  if (connection.side === 'right') {
    const seam = (x + 1) * map.tileWidth;
    for (let row = y * map.tileHeight; row < (y + 1) * map.tileHeight; row += 1) {
      for (let column = seam - 2; column < seam + 2; column += 1) cells.push({ x: column, y: row });
    }
  } else {
    const seam = (y + 1) * map.tileHeight;
    for (let column = x * map.tileWidth; column < (x + 1) * map.tileWidth; column += 1) {
      for (let row = seam - 2; row < seam + 2; row += 1) cells.push({ x: column, y: row });
    }
  }
  return cells;
}

/** Requires overlapping permanent wall pixels at a rail cap, excluding corner-only joins. */
export function connectionTouchesAuthoredWall(map: WorldMapData, footprint: MazeFootprint, connection: WallConnection): boolean {
  const length = connection.side === 'right' ? map.tileHeight : map.tileWidth;
  const start = connection.side === 'right' ? connection.tile.y * length : connection.tile.x * length;
  return wallConnectionCells(map, connection).some(({ x, y }) => {
    const along = connection.side === 'right' ? y : x;
    return (along < start + 2 || along >= start + length - 2)
      && x >= 0 && x < footprint.width && y >= 0 && y < footprint.height
      && Boolean(footprint.solid[y * footprint.width + x]);
  });
}

/** Rejects corridors whose center already has visible wall pixels despite permissive collision metadata. */
export function connectionCenterIsOpen(map: WorldMapData, footprint: MazeFootprint, connection: WallConnection): boolean {
  const middle = connection.side === 'right'
    ? connection.tile.y * map.tileHeight + Math.floor(map.tileHeight / 2)
    : connection.tile.x * map.tileWidth + Math.floor(map.tileWidth / 2);
  const seam = connection.side === 'right'
    ? (connection.tile.x + 1) * map.tileWidth : (connection.tile.y + 1) * map.tileHeight;
  for (let offset = -2; offset < 2; offset += 1) {
    const x = connection.side === 'right' ? seam + offset : middle;
    const y = connection.side === 'down' ? seam + offset : middle;
    if (footprint.solid[y * footprint.width + x]) return false;
  }
  return true;
}

/** Adds thin temporary rails to a copy of the permanent footprint for continuous contour generation. */
export function extendMazeWallFootprint(map: WorldMapData, base: MazeFootprint, connections: readonly WallConnection[]): MazeFootprint {
  const solid = base.solid.slice();
  for (const connection of connections) {
    for (const { x, y } of wallConnectionCells(map, connection)) {
      if (x >= 0 && x < base.width && y >= 0 && y < base.height) solid[y * base.width + x] = 1;
    }
  }
  return { width: base.width, height: base.height, solid };
}

/** Projects code-native tile templates onto the map's pixel grid without mutating Tiled data. */
function buildFootprint(map: WorldMapData, includeTile: (_tile: WorldTile) => boolean): MazeFootprint {
  const width = map.width * map.tileWidth;
  const height = map.height * map.tileHeight;
  const solid = new Uint8Array(width * height);

  for (const row of map.tiles) {
    for (const tile of row) {
      if (tile.gid === null || !includeTile(tile)) continue;
      const source = tile.localId === null ? undefined : TILE_FOOTPRINTS[tile.localId];
      if (!source) continue;
      const sourceWidth = source[0]?.length ?? 0;
      const sourceHeight = source.length;
      const cosine = Math.round(Math.cos(tile.rotation));
      const sine = Math.round(Math.sin(tile.rotation));
      for (let y = 0; y < map.tileHeight; y += 1) {
        for (let x = 0; x < map.tileWidth; x += 1) {
          const localX = (x + 0.5) / map.tileWidth - 0.5;
          const localY = (y + 0.5) / map.tileHeight - 0.5;
          const sourceX = Math.floor(((localX * cosine + localY * sine) * (tile.flipX ? -1 : 1) + 0.5) * sourceWidth);
          const sourceY = Math.floor(((-localX * sine + localY * cosine) * (tile.flipY ? -1 : 1) + 0.5) * sourceHeight);
          if (source[sourceY]?.[sourceX] === '#') solid[(tile.y * map.tileHeight + y) * width + tile.x * map.tileWidth + x] = 1;
        }
      }
    }
  }
  return { width, height, solid };
}
