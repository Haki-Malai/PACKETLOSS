import fs from 'node:fs';
import path from 'node:path';
import { Box3, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { CollisionGrid } from '../game/domain/world/CollisionGrid';
import { parseTiledMap, type TiledMap } from '../game/infrastructure/map/TiledParser';
import { MazeScene } from '../game/infrastructure/three/MazeScene';
import { buildPacmanSignGeometry } from '../game/infrastructure/three/PacmanSignGeometry';
import { createCollisionTile, createMapFixture, createWorld } from './fixtures/renderFixtures';

describe('extruded PACMAN sign', () => {
  it('leaves counters and the C opening empty while all six glyph stems have solid faces', () => {
    const geometry = buildPacmanSignGeometry(78, 14);
    const material = new MeshBasicMaterial();
    const mesh = new Mesh(geometry, material);
    const ray = new Raycaster(new Vector3(), new Vector3(0, -1, 0));
    const hits = (letter: number, x: number, y: number): number => {
      ray.ray.origin.set((letter * 10 + x) * 78 / 58 - 39, 20, 7 - y * 14 / 10);
      return ray.intersectObject(mesh).length;
    };
    for (const letter of [0, 1, 4]) expect(hits(letter, 4, 7)).toBe(0);
    expect(hits(2, 7, 5)).toBe(0);
    for (let letter = 0; letter < 6; letter += 1) expect(hits(letter, 1, 5)).toBeGreaterThan(0);
    geometry.dispose();
    material.dispose();
  });

  it.each(['maze', 'demo'])('keeps lettering and its outlines inside the authored %s sign area', (name) => {
    const tiled = JSON.parse(fs.readFileSync(path.resolve(`public/assets/mazes/default/${name}.json`), 'utf8')) as TiledMap;
    const map = parseTiledMap(tiled);
    const originalMap = structuredClone(map);
    const grid = new CollisionGrid(map.tiles.map((row) => row.map((tile) => tile.collision)));
    const world = createWorld(map, grid, { x: 0, y: 0 });
    const scene = new MazeScene(world, { getTileMask: () => undefined });
    scene.group.updateMatrixWorld(true);
    const signs = scene.group.children.filter((object) => object.name === 'sign-artwork');
    expect(signs).toHaveLength(1);
    const tiles = map.tiles.flat().filter((tile) => tile.localId !== null && tile.localId >= 17 && tile.localId <= 21);
    const left = Math.min(...tiles.map((tile) => tile.x)) * map.tileWidth;
    const right = (Math.max(...tiles.map((tile) => tile.x)) + 1) * map.tileWidth;
    const north = tiles[0].y * map.tileHeight;
    const south = north + map.tileHeight;
    const letters = scene.group.getObjectByName('sign-lettering')!;
    const letterBounds = new Box3().setFromObject(letters);
    expect(letterBounds.min.x).toBeCloseTo(left + 1);
    expect(letterBounds.max.x).toBeCloseTo(right - 1);
    expect(letterBounds.min.z).toBeCloseTo(north + 1);
    expect(letterBounds.max.z).toBeCloseTo(south - 1);
    expect(letterBounds.min.y).toBeCloseTo(0);
    expect(letterBounds.max.y).toBeGreaterThan(letterBounds.min.y);
    const outlinedBounds = new Box3().setFromObject(signs[0]);
    expect(outlinedBounds.min.x).toBeGreaterThanOrEqual(left);
    expect(outlinedBounds.max.x).toBeLessThanOrEqual(right);
    expect(outlinedBounds.min.z).toBeGreaterThanOrEqual(north);
    expect(outlinedBounds.max.z).toBeLessThanOrEqual(south);
    expect(map).toEqual(originalMap);
    scene.dispose();
  });

  it('creates separate lettering for each contiguous run without bridging the gap', () => {
    const { map, collisionGrid } = createMapFixture([[createCollisionTile(), createCollisionTile(), createCollisionTile(), createCollisionTile()]]);
    map.tiles[0][0].localId = 17;
    map.tiles[0][1].localId = 18;
    map.tiles[0][3].localId = 17;
    const world = createWorld(map, collisionGrid, { x: 0, y: 0 });
    const scene = new MazeScene(world, {
      getTileMask: () => ({ width: 1, height: 1, opaque: new Uint8Array([1]) }),
    });
    const signs = scene.group.children.filter((object) => object.name === 'sign-artwork');
    expect(signs).toHaveLength(2);
    for (const [index, [left, right]] of [[0, 32], [48, 64]].entries()) {
      const bounds = new Box3().setFromObject(signs[index]);
      expect(bounds.min.x).toBeGreaterThanOrEqual(left);
      expect(bounds.max.x).toBeLessThanOrEqual(right);
    }
    scene.dispose();
  });
});
