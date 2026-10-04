import { describe, expect, it } from 'vitest';
import authoredMap from '../../public/assets/mazes/default/maze.json';
import { parseTiledMap, type TiledMap } from '../game/infrastructure/map/TiledParser';
import { encodeRaceSnapshot } from '../game/protocol/messages';
import { createClassicRaceMap } from '../game/simulation/classicMap';
import { physicalPath } from '../game/simulation/movement';
import { DataRace } from '../game/simulation/DataRace';

describe('authored Classic Data Race metadata', () => {
  it('keeps Classic geometry and gives the reviewed spawns twelve mirrored reachable cores', () => {
    const original = parseTiledMap(authoredMap as TiledMap), map = createClassicRaceMap(original);
    expect([map.width, map.height]).toEqual([49, 49]);
    expect(map.spawns.map((spawn) => ({ x: map.cells[spawn].x, y: map.cells[spawn].y })))
      .toEqual([{ x: 11, y: 21 }, { x: 37, y: 21 }, { x: 11, y: 30 }, { x: 37, y: 30 }]);
    expect(map.spawns.map((spawn) => physicalPath(map, spawn, map.enemyHome)?.length)).toEqual([17, 17, 20, 20]);
    const coreCells = map.pickups.filter((point) => point.kind === 'core').map((point) => point.cell);
    const cores = coreCells.map((cell) => map.cells[cell]);
    expect(cores).toHaveLength(12);
    for (const core of cores) expect(cores.some((other) => other.x === 48 - core.x && other.y === core.y)).toBe(true);
    const coreDistances = map.spawns.map((spawn) => coreCells
      .map((core) => physicalPath(map, spawn, core)?.length ?? Number.POSITIVE_INFINITY).sort((a, b) => a - b));
    expect(coreDistances[0]).toEqual(coreDistances[1]);
    expect(coreDistances[2]).toEqual(coreDistances[3]);
    const nearbyBits = map.spawns.map((spawn) => map.pickups.filter((point) => point.kind === 'bit'
      && (physicalPath(map, spawn, point.cell)?.length ?? Number.POSITIVE_INFINITY) <= 3).length);
    expect(nearbyBits[0]).toBe(nearbyBits[1]);
    expect(nearbyBits[2]).toBe(nearbyBits[3]);
    expect(nearbyBits.every((count) => count >= 4)).toBe(true);
    expect(map.pickups).toHaveLength(2197);
    expect(original.collectibleObjects).toEqual([]);
    const game = new DataRace(map, 'full-maze', [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 1);
    expect(game.snapshot().enemies).toEqual([]);
    const encoded = encodeRaceSnapshot(map, game.snapshot());
    expect('pickups' in encoded).toBe(false);
    expect(JSON.stringify(encoded).length).toBeLessThan(5000);
    for (let tick = 0; tick < 240; tick += 1) game.step();
    expect(game.snapshot().phase).toBe('playing');
  });
});
