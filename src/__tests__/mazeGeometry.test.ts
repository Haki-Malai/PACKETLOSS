import fs from 'node:fs';
import path from 'node:path';
import { Box3, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { CollisionGrid } from '../game/domain/world/CollisionGrid';
import { connectionTouchesAuthoredWall, extendMazeWallFootprint } from '../game/domain/world/MazeFootprint';
import { parseTiledMap, type TiledMap } from '../game/infrastructure/map/TiledParser';
import {
  buildMazePenFootprint,
  buildMazeWallEdgeGeometry,
  buildMazeWallFootprint,
  buildMazeWallGeometry,
  buildMazeWallGeometryFromFootprint,
  traceWallContours,
  splitMazeWallEdgesByOwnership,
} from '../game/infrastructure/three/MazeGeometry';
import type { MazeFootprint, WallContourPoint } from '../game/infrastructure/three/MazeGeometry';
import { MazeScene } from '../game/infrastructure/three/MazeScene';
import { createCollisionTile, createMapFixture, createWorld } from './fixtures/renderFixtures';

function footprintFromRows(rows: string[]): MazeFootprint {
  return {
    width: rows[0].length,
    height: rows.length,
    solid: Uint8Array.from(rows.join(''), (cell) => cell === '#' ? 1 : 0),
  };
}

function fixture(width = 1, height = 1, tileWidth = 16, tileHeight = tileWidth) {
  const { map } = createMapFixture(
    Array.from({ length: height }, () => Array.from({ length: width }, () => createCollisionTile())),
  );
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

describe('procedural maze footprints', () => {
  const repeat = (row: string, count: number): string[] => Array.from({ length: count }, () => row);
  const empty = '................';
  const full = '################';
  const left = '##..............';
  const right = '..............##';
  const both = '##............##';
  const expectedTiles: Record<number, string[]> = {
    0: repeat(left, 16),
    1: repeat(both, 16),
    2: [full, full, ...repeat(left, 14)],
    5: [full, full, ...repeat(empty, 12), '#...............', left],
    6: [full, full, ...repeat(empty, 12), '#...............', '##.............#'],
    7: [both, '#.............##', ...repeat(right, 12), '#.............##', both],
    10: [both, '#.............##', ...repeat(right, 12), full, full],
    14: [both, '#..............#', ...repeat(empty, 12), '#..............#', both],
    15: [...repeat(empty, 14), '...............#', right],
    16: [full, full, ...repeat(both, 4), full, full, full, full, ...repeat(both, 4), full, full],
    23: [right, '...............#', ...repeat(empty, 12), '...............#', right],
  };

  it.each(Object.entries(expectedTiles))('reproduces the complete former tile %s footprint', (localId, rows) => {
    const map = fixture();
    map.tiles[0][0].localId = Number(localId);
    const footprint = Number(localId) === 16 ? buildMazePenFootprint(map) : buildMazeWallFootprint(map);
    expect(footprint).toEqual(footprintFromRows(rows));
  });

  it.each([
    { rotation: 0, flipX: false, rows: repeat(left, 16) },
    { rotation: 0, flipX: true, rows: repeat(right, 16) },
    { rotation: Math.PI / 2, flipX: false, rows: [full, full, ...repeat(empty, 14)] },
    { rotation: Math.PI, flipX: false, rows: repeat(right, 16) },
    { rotation: (3 * Math.PI) / 2, flipX: false, rows: [...repeat(empty, 14), full, full] },
  ])('preserves rotation $rotation and flipX $flipX', ({ rotation, flipX, rows }) => {
    const map = fixture();
    Object.assign(map.tiles[0][0], { localId: 0, rotation, flipX });
    expect(buildMazeWallFootprint(map)).toEqual(footprintFromRows(rows));
  });

  it('excludes empty, unknown, jail, and sign tiles from the maze wall layer', () => {
    const map = fixture(8);
    map.tiles[0][0].gid = null;
    map.tiles[0][1].localId = 99;
    for (let x = 2; x <= 7; x += 1) map.tiles[0][x].localId = 14 + x;

    const footprint = buildMazeWallFootprint(map);
    expect(footprint.solid.reduce((sum, cell) => sum + cell, 0)).toBe(0);
  });

  it('leaves map data unchanged while building both presentation layers', () => {
    const map = fixture(2);
    map.tiles[0][0].localId = 2;
    map.tiles[0][1].localId = 16;
    const original = structuredClone(map);
    buildMazeWallGeometry(map).dispose();
    buildMazePenFootprint(map);
    expect(map).toEqual(original);
  });
});

describe('continuous wall geometry', () => {
  it('joins a thin temporary rail to rotated authored walls and keeps the other opening clear', () => {
    const map = fixture(2);
    map.tiles[0].forEach((tile) => { tile.localId = 1; tile.rotation = Math.PI / 2; });
    const base = buildMazeWallFootprint(map);
    const connection = { tile: { x: 0, y: 0 }, side: 'right' as const };
    expect(connectionTouchesAuthoredWall(map, base, connection)).toBe(true);
    const joined = extendMazeWallFootprint(map, base, [connection]);
    expect(base.solid[8 * base.width + 16]).toBe(0);
    expect(joined.solid[8 * joined.width + 16]).toBe(1);
    expect(joined.solid[8 * joined.width + 8]).toBe(0);
    expect(joined.solid[8 * joined.width + 24]).toBe(0);
    const outlines = buildMazeWallEdgeGeometry(joined);
    const split = splitMazeWallEdgesByOwnership(outlines, base);
    expect(split.authored.getAttribute('position').count).toBeGreaterThan(0);
    expect(split.temporary.getAttribute('position').count).toBeGreaterThan(0);
    const geometry = buildMazeWallGeometryFromFootprint(joined);
    expect(traceWallContours(joined).length).toBeLessThanOrEqual(traceWallContours(base).length);
    geometry.dispose();
    outlines.dispose();
    split.authored.dispose();
    split.temporary.dispose();
  });

  it('reuses joined wall geometry between samples and disposes each replaced shape', () => {
    const map = fixture(2);
    map.tiles[0].forEach((tile) => { tile.localId = 1; tile.rotation = Math.PI / 2; });
    const maze = new MazeScene({ map });
    const walls = maze.group.getObjectByName('walls') as Mesh;
    const original = vi.spyOn(walls.geometry, 'dispose');
    const record = { tile: { x: 0, y: 0 }, side: 'right' as const,
      source: { x: 0, y: 0 }, ageMs: 100, durationMs: 7000 };
    maze.syncQuarantineWalls([record]);
    expect(original).toHaveBeenCalledOnce();
    const joined = walls.geometry;
    const joinedDispose = vi.spyOn(joined, 'dispose');
    expect((maze.group.getObjectByName('quarantine-wall-edges') as { count: number }).count).toBeGreaterThan(0);
    maze.syncQuarantineWalls([{ ...record, ageMs: 200 }]);
    expect(walls.geometry).toBe(joined);
    maze.syncQuarantineWalls([]);
    expect(joinedDispose).toHaveBeenCalledOnce();
    const restored = vi.spyOn(walls.geometry, 'dispose');
    maze.dispose();
    expect(restored).toHaveBeenCalledOnce();
  });

  it('removes tile joins before extruding the outline', () => {
    const footprint = footprintFromRows(['########', '########']);
    expect(traceWallContours(footprint)).toEqual([
      [{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 2 }, { x: 0, y: 2 }],
    ]);
    const geometry = buildMazeWallGeometryFromFootprint(footprint);
    const positions = geometry.getAttribute('position');
    expect(Array.from({ length: positions.count }, (_, i) => positions.getX(i))).not.toContain(4);
    geometry.dispose();
  });

  it('keeps holes open and extrudes the footprint to a twelve-unit height', () => {
    const footprint = footprintFromRows(['#####', '#...#', '#...#', '#...#', '#####']);
    expect(traceWallContours(footprint).map(area).sort((a, b) => a - b)).toEqual([-9, 25]);
    const geometry = buildMazeWallGeometryFromFootprint(footprint);
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
    geometry.dispose();
    material.dispose();
  });

  it('keeps diagonal-only contacts as separate closed contours', () => {
    const contours = traceWallContours(footprintFromRows(['#.', '.#']));
    expect(contours).toHaveLength(2);
    expect(contours.map(area)).toEqual([1, 1]);
  });

  it('outlines only axis-aligned cap and corner segments', () => {
    const geometry = buildMazeWallEdgeGeometry(footprintFromRows(['########', '########']));
    const positions = geometry.getAttribute('position');
    expect(positions.count).toBeGreaterThan(0);
    for (let i = 0; i < positions.count; i += 2) {
      const deltas = [
        positions.getX(i + 1) - positions.getX(i),
        positions.getY(i + 1) - positions.getY(i),
        positions.getZ(i + 1) - positions.getZ(i),
      ];
      expect(deltas.filter((delta) => delta !== 0)).toHaveLength(1);
    }
    geometry.dispose();
  });

  it.each(['maze', 'demo'])('renders procedural jail rails and surrounding walls in the %s map', (name) => {
    const tiled = JSON.parse(fs.readFileSync(path.resolve(`public/assets/mazes/default/${name}.json`), 'utf8')) as TiledMap;
    const map = parseTiledMap(tiled);
    const originalMap = structuredClone(map);
    const world = createWorld(
      map,
      new CollisionGrid(map.tiles.map((row) => row.map((tile) => tile.collision))),
      { x: 0, y: 0 },
    );
    const scene = new MazeScene(world);
    scene.group.updateMatrixWorld(true);
    const bars = scene.group.getObjectByName('pen-bars')!;
    const prisonBounds = new Box3().setFromObject(scene.group.getObjectByName('enemy-pen')!);
    expect(prisonBounds.min.y).toBeGreaterThan(11.5);
    expect(prisonBounds.max.y).toBeCloseTo(12, 1);
    const ray = new Raycaster(new Vector3(), new Vector3(0, -1, 0));
    const jailTiles = map.tiles.flat().filter((tile) => tile.localId === 16);
    expect(jailTiles.length).toBeGreaterThan(0);
    const samples = [
      [8, 1, true], [8, 7, true], [8, 8, true], [8, 15, true],
      [1, 4, true], [15, 12, true], [8, 4, false], [8, 12, false],
    ] as const;
    for (const tile of jailTiles) {
      for (const [x, y, expectedSolid] of samples) {
        ray.ray.origin.set(tile.x * map.tileWidth + x + 0.5, 20, tile.y * map.tileHeight + y + 0.5);
        expect(ray.intersectObject(bars).length > 0).toBe(expectedSolid);
      }
    }
    const jailOutlines = scene.group.getObjectByName('pen-edges')!;
    const left = Math.min(...jailTiles.map((tile) => tile.x)) * map.tileWidth;
    const top = jailTiles[0].y * map.tileHeight;
    ray.ray.origin.set(left + 8.5, 20, top);
    expect(ray.intersectObject(jailOutlines)).toHaveLength(0);
    ray.ray.origin.set(left + 8.5, 20, top + 2);
    expect(ray.intersectObject(jailOutlines).length).toBeGreaterThan(0);
    expect(map).toEqual(originalMap);
    scene.dispose();
  });

  it.each(['maze', 'demo'])('leaves portal centers open in the %s map', (name) => {
    const tiled = JSON.parse(fs.readFileSync(path.resolve(`public/assets/mazes/default/${name}.json`), 'utf8')) as TiledMap;
    const map = parseTiledMap(tiled);
    const footprint = buildMazeWallFootprint(map);
    for (const pair of map.portalPairs ?? []) {
      for (const tile of [pair.from, pair.to]) {
        expect(footprint.solid[(tile.y * map.tileHeight + 8) * footprint.width + tile.x * map.tileWidth + 8]).toBe(0);
      }
    }
  });
});
