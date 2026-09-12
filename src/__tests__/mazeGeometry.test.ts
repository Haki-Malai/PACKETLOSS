import fs from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { SPRITE_SIZE } from '../config/constants';
import { GhostJailService } from '../game/domain/services/GhostJailService';
import { parseGid, parseTiledMap } from '../game/infrastructure/map/TiledParser';
import type { TiledMap } from '../game/infrastructure/map/TiledParser';
import { buildMazeWallEdgeGeometry, buildMazeWallGeometry, buildMazeWallGeometryFromMask, buildMazeWallMask, traceWallContours } from '../game/infrastructure/three/MazeGeometry';
import type { TileAlphaMask, WallContourPoint } from '../game/infrastructure/three/MazeGeometry';
import { createCollisionTile, createMapFixture } from './fixtures/renderFixtures';

function maskFromRows(rows: string[]): TileAlphaMask {
  return { width: rows[0].length, height: rows.length, opaque: Uint8Array.from(rows.join(''), (pixel) => pixel === '#' ? 1 : 0) };
}

function fixture(width = 1, height = 1, tileWidth = 16, tileHeight = tileWidth) {
  const { map } = createMapFixture(Array.from({ length: height }, () => Array.from({ length: width }, () => createCollisionTile())));
  map.tileWidth = tileWidth;
  map.tileHeight = tileHeight;
  map.widthInPixels = width * tileWidth;
  map.heightInPixels = height * tileHeight;
  return map;
}

function area(contour: WallContourPoint[]): number {
  return contour.reduce((sum, point, index) => {
    const next = contour[(index + 1) % contour.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0) / 2;
}

// The source tiles are non-interlaced 8-bit RGBA PNGs. Decode their actual alpha
// without a browser or adding an image-processing dependency to the game.
function readTileMask(imagePath: string): TileAlphaMask {
  const png = fs.readFileSync(path.resolve('public/assets/mazes/default', imagePath));
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (png[24] !== 8 || png[25] !== 6 || png[28] !== 0) throw new Error('Expected non-interlaced RGBA tile');
  const chunks: Buffer[] = [];
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset);
    if (png.toString('ascii', offset + 4, offset + 8) === 'IDAT') chunks.push(png.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  const pixels = new Uint8Array(stride * height);
  const paeth = (left: number, above: number, upperLeft: number): number => {
    const prediction = left + above - upperLeft;
    const a = Math.abs(prediction - left);
    const b = Math.abs(prediction - above);
    const c = Math.abs(prediction - upperLeft);
    return a <= b && a <= c ? left : b <= c ? above : upperLeft;
  };
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x += 1) {
      const index = y * stride + x;
      const left = x >= 4 ? pixels[index - 4] : 0;
      const above = y > 0 ? pixels[index - stride] : 0;
      const upperLeft = x >= 4 && y > 0 ? pixels[index - stride - 4] : 0;
      const predictor = [0, left, above, Math.floor((left + above) / 2), paeth(left, above, upperLeft)][filter];
      if (predictor === undefined) throw new Error('Unknown PNG row filter');
      pixels[index] = raw[y * (stride + 1) + x + 1] + predictor;
    }
  }
  return { width, height, opaque: Uint8Array.from({ length: width * height }, (_, i) => pixels[i * 4 + 3] >= 128 ? 1 : 0) };
}

describe('maze wall footprints', () => {
  it.each([
    [0, 0, 1],
    [0x80000000, 3, 1],
    [0x40000000, 0, 2],
    [0xc0000000, 3, 2],
    [0x20000000, 1, 0],
    [0xa0000000, 2, 0],
    [0x60000000, 1, 3],
    [0xe0000000, 2, 3],
  ])('preserves the Tiled transform %i', (flags, expectedX, expectedY) => {
    const map = fixture(1, 1, 4);
    const parsed = parseGid(flags + 1);
    Object.assign(map.tiles[0][0], { rotation: parsed.rotation, flipX: parsed.flipped });
    const source = maskFromRows(['....', '#...', '....', '....']);
    const result = buildMazeWallMask(map, () => source);
    expect([...result.opaque.entries()].filter(([, pixel]) => pixel)).toEqual([[expectedY * 4 + expectedX, 1]]);
  });

  it('scales native alpha dimensions into the map tile dimensions', () => {
    const result = buildMazeWallMask(fixture(1, 1, 8, 4), () => maskFromRows(['#.', '..']));
    expect(result).toEqual(maskFromRows(['####....', '####....', '........', '........']));
  });

  it('keeps native two-pixel rails and one unit of Pac-Man clearance', () => {
    const map = fixture();
    map.tiles[0][0].collision = createCollisionTile({ collides: true, left: true, right: true });
    const source = readTileMask('source/tiles/tile-01.png');
    const result = buildMazeWallMask(map, () => source);
    const center = result.width / 2;
    const row = result.opaque.slice(center * result.width, (center + 1) * result.width);
    const leftWallEdge = row.slice(0, center).lastIndexOf(1) + 1;
    const rightWallEdge = row.findIndex((pixel, x) => x >= center && pixel === 1);
    const radius = SPRITE_SIZE.pacman / 2;
    expect(center - radius - leftWallEdge).toBe(1);
    expect(rightWallEdge - (center + radius)).toBe(1);
  });

  it('excludes empty tiles and special pen/sign tiles without interpreting collision as occupancy', () => {
    const map = fixture(8);
    map.tiles[0][0].gid = null;
    for (let x = 1; x <= 6; x += 1) map.tiles[0][x].localId = 15 + x;
    map.tiles[0][7].collision = createCollisionTile({ collides: true, up: true, right: true, down: true, left: true });
    const read = vi.fn(() => maskFromRows(['#']));
    const result = buildMazeWallMask(map, read);
    expect(result.opaque.reduce((sum, pixel) => sum + pixel, 0)).toBe(16 * 16);
    expect(result.opaque[7 * 16]).toBe(1);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it('caches alpha reads and leaves the map and source masks unchanged', () => {
    const map = fixture(2);
    const source = readTileMask('source/tiles/tile-00.png');
    const originalMap = structuredClone(map);
    const originalSource = structuredClone(source);
    const read = vi.fn(() => source);
    buildMazeWallGeometry(map, read).dispose();
    expect(read).toHaveBeenCalledTimes(1);
    expect(map).toEqual(originalMap);
    expect(source).toEqual(originalSource);
  });

  it('scales the pen entrance rail depth with tile height while retaining its side edges', () => {
    const map = fixture(1, 2, 32);
    const result = buildMazeWallMask(map, () => maskFromRows(['#']), { minX: 0, maxX: 0, y: 1 });
    expect([...result.opaque.slice(27 * 32, 28 * 32)]).toEqual(Array<number>(32).fill(1));
    expect([...result.opaque.slice(28 * 32, 29 * 32)]).toEqual([1, ...Array<number>(30).fill(0), 1]);
    expect([...result.opaque.slice(31 * 32, 32 * 32)]).toEqual([1, ...Array<number>(30).fill(0), 1]);
    expect([...result.opaque.slice(32 * 32, 33 * 32)]).toEqual(Array<number>(32).fill(1));
  });
});

describe('continuous wall geometry', () => {
  it('removes tile joins before extruding the outline', () => {
    const map = fixture(2, 1, 4);
    const source = maskFromRows(['####', '####', '....', '....']);
    const contours = traceWallContours(buildMazeWallMask(map, () => source));
    expect(contours).toEqual([[{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 2 }, { x: 0, y: 2 }]]);
    const geometry = buildMazeWallGeometry(map, () => source);
    const positions = geometry.getAttribute('position');
    expect(Array.from({ length: positions.count }, (_, i) => positions.getX(i))).not.toContain(4);
    geometry.dispose();
  });

  it('keeps holes open and aligns the top face with the original footprint at a twelve-unit height', () => {
    const source = maskFromRows(['#####', '#...#', '#...#', '#...#', '#####']);
    const contours = traceWallContours(source);
    expect(contours.map(area).sort((a, b) => a - b)).toEqual([-9, 25]);
    const geometry = buildMazeWallGeometry(fixture(1, 1, 5), () => source);
    geometry.computeBoundingBox();
    expect(geometry.boundingBox?.min.x).toBeCloseTo(0);
    expect(geometry.boundingBox?.min.y).toBeCloseTo(0);
    expect(geometry.boundingBox?.min.z).toBeCloseTo(0);
    expect(geometry.boundingBox?.max.x).toBeCloseTo(5);
    expect(geometry.boundingBox?.max.y).toBeCloseTo(12);
    expect(geometry.boundingBox?.max.z).toBeCloseTo(5);
    const material = new MeshBasicMaterial();
    const mesh = new Mesh(geometry, material);
    const ray = new Raycaster(new Vector3(2.5, 20, 2.5), new Vector3(0, -1, 0));
    expect(ray.intersectObject(mesh)).toHaveLength(0);
    ray.ray.origin.set(0.5, 20, 0.5);
    expect(ray.intersectObject(mesh).length).toBeGreaterThan(0);
    const positions = geometry.getAttribute('position');
    const topXs = Array.from({ length: positions.count }, (_, i) => i).filter((i) => positions.getY(i) > 11.99).map((i) => positions.getX(i));
    expect(Math.min(...topXs)).toBeCloseTo(0);
    expect(Math.max(...topXs)).toBeCloseTo(5);
    geometry.dispose();
    material.dispose();
  });

  it('keeps diagonal-only contacts as separate closed contours', () => {
    const contours = traceWallContours(maskFromRows(['#.', '.#']));
    expect(contours).toHaveLength(2);
    expect(contours.map(area)).toEqual([1, 1]);
    expect(contours.map((contour) => contour.length)).toEqual([4, 4]);
  });

  it('outlines the top, bottom, and side corners without tile seams or face diagonals', () => {
    const mask = buildMazeWallMask(fixture(2, 1, 4), () => maskFromRows(['####', '####', '....', '....']));
    const geometry = buildMazeWallEdgeGeometry(mask);
    const positions = geometry.getAttribute('position');
    expect(positions.count).toBeGreaterThan(0);
    for (let i = 0; i < positions.count; i += 2) {
      const dx = positions.getX(i + 1) - positions.getX(i);
      const dy = positions.getY(i + 1) - positions.getY(i);
      const dz = positions.getZ(i + 1) - positions.getZ(i);
      expect([dx, dy, dz].filter((delta) => delta !== 0)).toHaveLength(1);
      expect(positions.getX(i)).not.toBe(4);
    }
    geometry.dispose();
  });

  it.each([
    { name: 'outer corners', rows: ['####', '####'] },
    { name: 'concave corners', rows: ['####', '####', '##..', '##..'] },
    { name: 'holes', rows: ['######', '######', '##..##', '##..##', '######', '######'] },
    { name: 'diagonal contacts', rows: ['##..', '##..', '..##', '..##'] },
  ])('connects side outlines straight to the top face at $name', ({ rows }) => {
    const mask = maskFromRows(rows);
    const walls = buildMazeWallGeometryFromMask(mask);
    const edges = buildMazeWallEdgeGeometry(mask);
    const wallPositions = walls.getAttribute('position');
    const edgePositions = edges.getAttribute('position');
    const vertices = Array.from({ length: wallPositions.count }, (_, i) => new Vector3().fromBufferAttribute(wallPositions, i));
    const endpoints = Array.from({ length: edgePositions.count }, (_, i) => new Vector3().fromBufferAttribute(edgePositions, i));
    const capEndpoints = endpoints.filter((point) => point.y > 12);
    const sideTops: Vector3[] = [];
    for (let i = 0; i < endpoints.length; i += 2) {
      const [start, end] = [endpoints[i], endpoints[i + 1]];
      if (start.y === end.y) continue;
      expect(start.y).toBeCloseTo(0.08);
      expect(end.y).toBeCloseTo(12.01);
      expect(end.x).toBe(start.x);
      expect(end.z).toBe(start.z);
      sideTops.push(end);
    }
    expect(capEndpoints.length).toBeGreaterThan(0);
    for (const endpoint of capEndpoints) {
      // Shared diagonal-contact corners also have a direct side connection.
      expect(sideTops.some((point) => point.equals(endpoint))).toBe(true);
      const onCap = endpoint.clone().setY(12);
      expect(vertices.some((vertex) => vertex.distanceTo(onCap) < 0.00001)).toBe(true);
    }
    walls.dispose();
    edges.dispose();
  });

  it('keeps side connections at rounded-corner ends without outlining each pixel stair-step', () => {
    const geometry = buildMazeWallEdgeGeometry(maskFromRows(['.######', '#######', '#######', '#######']));
    const positions = geometry.getAttribute('position');
    const corners: string[] = [];
    for (let i = 0; i < positions.count; i += 2) {
      if (positions.getY(i) < 0.1 && positions.getY(i + 1) > 11) {
        corners.push(`${positions.getX(i)}:${positions.getZ(i)}`);
      }
    }
    expect(corners).toEqual(expect.arrayContaining(['1:0', '0:1']));
    expect(corners).not.toContain('1:1');
    geometry.dispose();
  });

  it.each(['maze', 'demo'])('opens the native %s pen release crossing without changing other walls or gameplay data', (name) => {
    const tiled = JSON.parse(fs.readFileSync(path.resolve(`public/assets/mazes/default/${name}.json`), 'utf8')) as TiledMap;
    const map = parseTiledMap(tiled);
    const originalMap = structuredClone(map);
    const pen = new GhostJailService().resolveGhostJailBounds(map, { x: 0, y: 0 });
    const originalMask = buildMazeWallMask(map, readTileMask);
    const openedMask = buildMazeWallMask(map, readTileMask, pen);
    const left = pen.minX * map.tileWidth + 1;
    const right = (pen.maxX + 1) * map.tileWidth - 1;
    const north = pen.y * map.tileHeight;
    let changesOutsideEntrance = 0;
    let removedPixels = 0;
    for (let i = 0; i < originalMask.opaque.length; i += 1) {
      if (originalMask.opaque[i] === openedMask.opaque[i]) continue;
      removedPixels += 1;
      const x = i % openedMask.width;
      const y = Math.floor(i / openedMask.width);
      if (x < left || x >= right || y < north - 2 || y >= north) changesOutsideEntrance += 1;
    }
    expect(removedPixels).toBeGreaterThan(0);
    expect(changesOutsideEntrance).toBe(0);
    const geometry = buildMazeWallGeometry(map, readTileMask, pen);
    const material = new MeshBasicMaterial();
    const mesh = new Mesh(geometry, material);
    const centerX = (left + right) / 2;
    const radius = SPRITE_SIZE.ghost / 2;
    const ray = new Raycaster(new Vector3(), new Vector3(0, -1, 0));
    let intersections = 0;
    for (let x = centerX - radius; x <= centerX + radius; x += 1) {
      for (let y = north - 2; y <= north; y += 0.5) {
        ray.ray.origin.set(x, 20, y);
        intersections += ray.intersectObject(mesh).length;
      }
    }
    expect(intersections).toBe(0);
    expect(map).toEqual(originalMap);
    geometry.dispose();
    material.dispose();
  });

  it.each(['maze', 'demo'])('preserves native %s map footprints and leaves portal centers open', (name) => {
    const tiled = JSON.parse(fs.readFileSync(path.resolve(`public/assets/mazes/default/${name}.json`), 'utf8')) as TiledMap;
    const map = parseTiledMap(tiled);
    const originalMap = structuredClone(map);
    const mask = buildMazeWallMask(map, readTileMask);
    const contours = traceWallContours(mask);
    expect(contours.reduce((sum, contour) => sum + area(contour), 0)).toBe(mask.opaque.reduce((sum, pixel) => sum + pixel, 0));
    for (const pair of map.portalPairs ?? []) {
      for (const tile of [pair.from, pair.to]) {
        expect(mask.opaque[(tile.y * map.tileHeight + 8) * mask.width + tile.x * map.tileWidth + 8]).toBe(0);
      }
    }
    const geometry = buildMazeWallGeometry(map, readTileMask);
    const positions = geometry.getAttribute('position');
    let outsideFootprint = 0;
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getZ(i);
      const touchingPixels = [-0.0001, 0.0001].flatMap((dx) => [-0.0001, 0.0001].map((dy) => {
        const column = Math.floor(x + dx);
        const row = Math.floor(y + dy);
        return column >= 0 && column < mask.width && row >= 0 && row < mask.height && mask.opaque[row * mask.width + column];
      }));
      if (!touchingPixels.some(Boolean)) outsideFootprint += 1;
    }
    expect(outsideFootprint).toBe(0);
    expect(map).toEqual(originalMap);
    geometry.dispose();
  });
});
