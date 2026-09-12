import { CollisionTile, createEmptyCollisionTile } from '../../domain/world/CollisionGrid';
import { WorldMapData, WorldObject, WorldProperty, WorldTile } from '../../domain/world/WorldState';
import { applyVoidLeakBoundaryGuards, createBlockingCollisionTile, inferPortalPairs } from './TiledMapTopology';

export const FLIPPED_HORIZONTAL = 0x80000000;
export const FLIPPED_VERTICAL = 0x40000000;
export const FLIPPED_ANTI_DIAGONAL = 0x20000000;

export interface TiledProperty {
  name: string;
  type?: string;
  value: unknown;
}

export interface TiledTile {
  id: number;
  image?: string;
  properties?: TiledProperty[];
}

export interface TiledTileset {
  firstgid: number;
  name: string;
  tilewidth: number;
  tileheight: number;
  tiles?: TiledTile[];
}

export interface TiledObject {
  id?: number;
  name?: string;
  type?: string;
  visible?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  properties?: TiledProperty[];
}

export interface TiledTileLayer {
  name: string;
  type: 'tilelayer';
  width: number;
  height: number;
  data: number[];
}

export interface TiledObjectLayer {
  name: string;
  type: 'objectgroup';
  objects?: TiledObject[];
}

export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: Array<TiledTileLayer | TiledObjectLayer | Record<string, unknown>>;
  tilesets: TiledTileset[];
}

export interface ParsedGid {
  gid: number;
  flippedHorizontal: boolean;
  flippedVertical: boolean;
  flippedAntiDiagonal: boolean;
  rotation: number;
  flipped: boolean;
}

interface TrimBounds {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function parseGid(rawGid: number): ParsedGid {
  const flippedHorizontal = Boolean(rawGid & FLIPPED_HORIZONTAL);
  const flippedVertical = Boolean(rawGid & FLIPPED_VERTICAL);
  const flippedAntiDiagonal = Boolean(rawGid & FLIPPED_ANTI_DIAGONAL);
  const gid = rawGid & ~(FLIPPED_HORIZONTAL | FLIPPED_VERTICAL | FLIPPED_ANTI_DIAGONAL);

  let rotation = 0;
  let flipped = false;

  if (flippedHorizontal && flippedVertical && flippedAntiDiagonal) {
    rotation = Math.PI / 2;
    flipped = true;
  } else if (flippedHorizontal && flippedVertical && !flippedAntiDiagonal) {
    rotation = Math.PI;
  } else if (flippedHorizontal && !flippedVertical && flippedAntiDiagonal) {
    rotation = Math.PI / 2;
  } else if (flippedHorizontal && !flippedVertical && !flippedAntiDiagonal) {
    flipped = true;
  } else if (!flippedHorizontal && flippedVertical && flippedAntiDiagonal) {
    rotation = (3 * Math.PI) / 2;
  } else if (!flippedHorizontal && flippedVertical && !flippedAntiDiagonal) {
    rotation = Math.PI;
    flipped = true;
  } else if (!flippedHorizontal && !flippedVertical && flippedAntiDiagonal) {
    rotation = (3 * Math.PI) / 2;
    flipped = true;
  }

  return {
    gid,
    flippedHorizontal,
    flippedVertical,
    flippedAntiDiagonal,
    rotation,
    flipped,
  };
}

export function readCollisionTileFromProperties(properties: Record<string, unknown>): CollisionTile {
  const read = (name: string): unknown => properties[name];
  const toBool = (value: unknown): boolean => Boolean(value);

  return {
    collides: toBool(read('collides')),
    penGate: toBool(read('penGate')),
    portal: toBool(read('portal')),
    up: toBool(read('up') ?? read('blocksUp')),
    down: toBool(read('down') ?? read('blocksDown')),
    left: toBool(read('left') ?? read('blocksLeft')),
    right: toBool(read('right') ?? read('blocksRight')),
  };
}

export function orientCollisionTile(base: CollisionTile, rotation: number, flipX: boolean, flipY: boolean): CollisionTile {
  let edges = {
    up: base.up,
    right: base.right,
    down: base.down,
    left: base.left,
  };

  if (flipX) {
    [edges.left, edges.right] = [edges.right, edges.left];
  }
  if (flipY) {
    [edges.up, edges.down] = [edges.down, edges.up];
  }

  const steps = ((Math.round(rotation / (Math.PI / 2)) % 4) + 4) % 4;
  for (let i = 0; i < steps; i += 1) {
    edges = {
      up: edges.left,
      right: edges.up,
      down: edges.right,
      left: edges.down,
    };
  }

  return { collides: base.collides, penGate: base.penGate, portal: base.portal, ...edges };
}

const getTilesetForGid = (gid: number, sortedTilesets: TiledTileset[]): TiledTileset | undefined => {
  for (let i = 0; i < sortedTilesets.length; i += 1) {
    const current = sortedTilesets[i];
    const nextFirstgid = sortedTilesets[i + 1]?.firstgid ?? Number.POSITIVE_INFINITY;
    if (gid >= current.firstgid && gid < nextFirstgid) {
      return current;
    }
  }
  return undefined;
};

const toPropertyRecord = (properties?: TiledProperty[]): Record<string, unknown> => {
  const record: Record<string, unknown> = {};
  if (!Array.isArray(properties)) {
    return record;
  }
  properties.forEach((property) => {
    if (property && typeof property.name === 'string') {
      record[property.name] = property.value;
    }
  });
  return record;
};

const toWorldObject = (object: TiledObject): WorldObject => ({
  id: object.id,
  name: object.name,
  type: object.type,
  visible: object.visible,
  x: object.x,
  y: object.y,
  width: object.width,
  height: object.height,
  properties: object.properties?.map(
    (property): WorldProperty => ({ name: property.name, type: property.type, value: property.value }),
  ),
});

function computeTrimBounds(tiles: WorldTile[][]): TrimBounds {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (let y = 0; y < tiles.length; y += 1) {
    for (let x = 0; x < (tiles[y]?.length ?? 0); x += 1) {
      if (tiles[y]?.[x]?.gid === null) {
        continue;
      }
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return { minX: 0, minY: 0, width: tiles[0]?.length ?? 0, height: tiles.length };
  }

  return {
    minX,
    minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

function trimTiles(tiles: WorldTile[][], bounds: TrimBounds): WorldTile[][] {
  const trimmed: WorldTile[][] = [];
  for (let y = 0; y < bounds.height; y += 1) {
    const row: WorldTile[] = [];
    for (let x = 0; x < bounds.width; x += 1) {
      const source = tiles[bounds.minY + y]?.[bounds.minX + x];
      if (!source) {
        row.push({
          x,
          y,
          rawGid: 0,
          gid: null,
          localId: null,
          imagePath: '(empty)',
          rotation: 0,
          flipX: false,
          flipY: false,
          collision: createBlockingCollisionTile(),
        });
        continue;
      }
      row.push({ ...source, x, y });
    }
    trimmed.push(row);
  }
  return trimmed;
}

function rebaseWorldObject(object: WorldObject, bounds: TrimBounds, tileWidth: number, tileHeight: number): WorldObject {
  const offsetX = bounds.minX * tileWidth;
  const offsetY = bounds.minY * tileHeight;

  const properties = object.properties?.map((property) => {
    const shouldShiftX = property.name === 'gridX' || property.name === 'startX' || property.name === 'endX';
    const shouldShiftY = property.name === 'gridY';
    if (!shouldShiftX && !shouldShiftY) {
      return property;
    }
    if (typeof property.value !== 'number') {
      return property;
    }
    return {
      ...property,
      value: shouldShiftX ? property.value - bounds.minX : property.value - bounds.minY,
    };
  });

  return {
    ...object,
    x: typeof object.x === 'number' ? object.x - offsetX : object.x,
    y: typeof object.y === 'number' ? object.y - offsetY : object.y,
    properties,
  };
}

export function parseTiledMap(map: TiledMap): WorldMapData {
  const mazeLayer = map.layers.find((layer) => isRecord(layer) && layer.type === 'tilelayer' && layer.name === 'Maze') as
    | TiledTileLayer
    | undefined;
  const fallbackLayer = map.layers.find((layer) => isRecord(layer) && layer.type === 'tilelayer') as TiledTileLayer | undefined;
  const tileLayer = mazeLayer ?? fallbackLayer;
  if (!tileLayer || !Array.isArray(tileLayer.data)) {
    throw new Error('Maze tile layer is required in maze.json');
  }

  const width = tileLayer.width;
  const height = tileLayer.height;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('Maze layer width/height must be positive numbers');
  }

  const collisionByGid = new Map<number, CollisionTile>();
  const imageByGid = new Map<number, string>();

  map.tilesets.forEach((tileset) => {
    if (!Number.isFinite(tileset.firstgid) || !Array.isArray(tileset.tiles)) {
      return;
    }
    tileset.tiles.forEach((tile) => {
      if (!tile || !Number.isFinite(tile.id)) {
        return;
      }
      const gid = tileset.firstgid + tile.id;
      const properties = toPropertyRecord(tile.properties);
      collisionByGid.set(gid, readCollisionTileFromProperties(properties));
      if (typeof tile.image === 'string') {
        imageByGid.set(gid, tile.image);
      }
    });
  });

  const sortedTilesets = [...map.tilesets].sort((a, b) => a.firstgid - b.firstgid);
  const rawTiles: WorldTile[][] = [];
  for (let y = 0; y < height; y += 1) {
    const row: WorldTile[] = [];
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const rawGid = tileLayer.data[index] ?? 0;
      const parsed = parseGid(rawGid);
      if (parsed.gid <= 0) {
        row.push({
          x,
          y,
          rawGid,
          gid: null,
          localId: null,
          imagePath: '(empty)',
          rotation: 0,
          flipX: false,
          flipY: false,
          collision: createBlockingCollisionTile(),
        });
        continue;
      }

      const tileset = getTilesetForGid(parsed.gid, sortedTilesets);
      const localId = tileset ? parsed.gid - tileset.firstgid : parsed.gid;
      const baseCollision = collisionByGid.get(parsed.gid) ?? createEmptyCollisionTile();
      row.push({
        x,
        y,
        rawGid,
        gid: parsed.gid,
        localId,
        imagePath: imageByGid.get(parsed.gid) ?? '(unknown)',
        rotation: parsed.rotation,
        flipX: parsed.flipped,
        flipY: false,
        collision: orientCollisionTile(baseCollision, parsed.rotation, parsed.flipped, false),
      });
    }
    rawTiles.push(row);
  }

  const trimBounds = computeTrimBounds(rawTiles);
  const tiles = trimTiles(rawTiles, trimBounds);

  const spawnLayer = map.layers.find((layer) => isRecord(layer) && layer.type === 'objectgroup' && layer.name === 'Spawns') as
    | TiledObjectLayer
    | undefined;
  const dotsLayer = map.layers.find((layer) => isRecord(layer) && layer.type === 'objectgroup' && layer.name === 'Dots') as
    | TiledObjectLayer
    | undefined;

  const spawnObjects = (spawnLayer?.objects ?? []).map((object) =>
    rebaseWorldObject(toWorldObject(object), trimBounds, map.tilewidth, map.tileheight),
  );
  const collectibleObjects = (dotsLayer?.objects ?? []).map((object) =>
    rebaseWorldObject(toWorldObject(object), trimBounds, map.tilewidth, map.tileheight),
  );

  const portalPairs = inferPortalPairs(tiles);
  applyVoidLeakBoundaryGuards(tiles);

  return {
    width: trimBounds.width,
    height: trimBounds.height,
    tileWidth: map.tilewidth,
    tileHeight: map.tileheight,
    widthInPixels: trimBounds.width * map.tilewidth,
    heightInPixels: trimBounds.height * map.tileheight,
    tiles,
    collisionByGid,
    imageByGid,
    portalPairs,
    spawnObjects,
    collectibleObjects,
    packetSpawn: spawnObjects.find((object) => object.type === 'packet'),
    ghostHome: spawnObjects.find((object) => object.type === 'ghost-home'),
  };
}
