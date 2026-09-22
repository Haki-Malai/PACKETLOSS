import { describe, expect, it } from 'vitest';
import { ENDLESS_SECTION_HEIGHT, ENDLESS_WIDTH, endlessBoundary, generateEndlessSection } from '../game/domain/world/EndlessMazeGenerator';
import { EndlessMazeStream } from '../game/domain/world/EndlessMazeStream';
import { CollisionGrid } from '../game/domain/world/CollisionGrid';
import { EnemyNavigationService } from '../game/domain/services/EnemyNavigationService';
import { PortalService } from '../game/domain/services/PortalService';
import { EndlessMazePresentation } from '../game/infrastructure/three/EndlessMazePresentation';
import { buildMazeWallFootprint } from '../game/domain/world/MazeFootprint';

/** Reads legal physical transitions through the same public navigation API used by enemies. */
function navigationFor(stream: EndlessMazeStream): EnemyNavigationService {
  const grid = new CollisionGrid(stream.map.tiles.map((row) => row.map((tile) => tile.collision)));
  return new EnemyNavigationService(grid, 16, new PortalService(grid), 'physical');
}

/** Finds enclosed areas attached through one tile, allowing routes beyond open outer seams. */
function oneEntrancePockets(stream: EndlessMazeStream): Array<{ entrance: { x: number; y: number }; tiles: number }> {
  const { width, height } = stream.map;
  const tiles = stream.map.tiles.flat().filter((tile) => tile.x > 0 && tile.x < width - 1
    && tile.localId !== null && tile.localId < 17);
  const indexByPosition = new Int32Array(width * height).fill(-1);
  tiles.forEach((tile, index) => { indexByPosition[tile.y * width + tile.x] = index; });
  const navigation = navigationFor(stream);
  const neighbors = tiles.map((tile) => navigation.getSteps(tile).map(({ destination }) =>
    indexByPosition[destination.y * width + destination.x]).filter((index) => index >= 0));
  const discovered = new Int32Array(tiles.length);
  const low = new Int32Array(tiles.length);
  const subtreeSize = new Int32Array(tiles.length);
  const reachesOuterSeam = new Uint8Array(tiles.length);
  const pockets: Array<{ entrance: { x: number; y: number }; tiles: number }> = [];
  let clock = 0;

  /** Marks components that would lose every physical route out if one entrance tile vanished. */
  const visit = (index: number, parent: number): void => {
    discovered[index] = low[index] = ++clock;
    subtreeSize[index] = 1;
    const tile = tiles[index];
    reachesOuterSeam[index] = Number((tile.y === 0 && !tile.collision.up)
      || (tile.y === height - 1 && !tile.collision.down));
    let children = 0;
    const childPockets: typeof pockets = [];
    for (const neighbor of neighbors[index]) {
      if (neighbor === parent) continue;
      if (discovered[neighbor]) {
        low[index] = Math.min(low[index], discovered[neighbor]);
        continue;
      }
      children += 1;
      visit(neighbor, index);
      low[index] = Math.min(low[index], low[neighbor]);
      subtreeSize[index] += subtreeSize[neighbor];
      reachesOuterSeam[index] |= reachesOuterSeam[neighbor];
      if (low[neighbor] >= discovered[index] && !reachesOuterSeam[neighbor]) {
        childPockets.push({ entrance: { x: tile.x, y: tile.y }, tiles: subtreeSize[neighbor] });
      }
    }
    if (parent !== -1 || children > 1) pockets.push(...childPockets);
  };

  for (let index = 0; index < tiles.length; index += 1) {
    if (!discovered[index]) visit(index, -1);
  }
  return pockets;
}

describe('endless maze generation', () => {
  it('keeps every section connected without dead ends or broken top/bottom seams', () => {
    let horizontalStraights = 0;
    let verticalStraights = 0;
    for (let seed = 1; seed <= 40; seed += 1) {
      const stream = new EndlessMazeStream(seed);
      const navigation = navigationFor(stream);
      const reachable = new Set<string>();
      const first = stream.map.tiles.flat().find((tile) => tile.x > 0 && tile.x < ENDLESS_WIDTH - 1
        && tile.localId !== null && tile.localId < 17)!;
      const start = { x: first.x, y: first.y };
      const queue = [start];
      for (let head = 0; head < queue.length; head += 1) {
        const tile = queue[head];
        const key = `${tile.x},${tile.y}`;
        if (reachable.has(key)) continue;
        reachable.add(key);
        navigation.getSteps(tile).forEach((step) => queue.push(step.destination));
      }
      let walkable = 0;
      let twoExitTiles = 0;
      let straightTiles = 0;
      for (const row of stream.map.tiles) for (const tile of row) {
        if (tile.x === 0 || tile.x === ENDLESS_WIDTH - 1 || tile.localId === null || tile.localId >= 17) continue;
        walkable += 1;
        const externalExit = tile.y === 0
          ? Number(endlessBoundary(seed, stream.getFirstIndex() - 1)[tile.x])
          : tile.y === stream.map.height - 1
            ? Number(endlessBoundary(seed, stream.getFirstIndex() + 4)[tile.x]) : 0;
        const exits = navigation.getSteps(tile).length + externalExit;
        expect(exits).toBeGreaterThanOrEqual(2);
        if (exits === 2) {
          twoExitTiles += 1;
          if (tile.collision.up && tile.collision.down) {
            straightTiles += 1;
            horizontalStraights += 1;
          } else if (tile.collision.left && tile.collision.right) {
            straightTiles += 1;
            verticalStraights += 1;
          }
        }
      }
      expect(reachable.size).toBe(walkable);
      expect(twoExitTiles / walkable).toBeGreaterThan(0.7);
      expect(twoExitTiles / walkable).toBeLessThan(0.84);
      // Shorter north/south lanes deliberately add turns, while straights still outnumber bends.
      expect(straightTiles / twoExitTiles).toBeGreaterThan(0.5);
      const sections = stream.getSections();
      for (let i = 0; i < sections.length - 1; i += 1) {
        const boundary = endlessBoundary(seed, sections[i].index);
        for (let x = 0; x < ENDLESS_WIDTH; x += 1) {
          expect(sections[i].map.tiles[ENDLESS_SECTION_HEIGHT - 1][x].collision.down).toBe(!boundary[x]);
          expect(sections[i + 1].map.tiles[0][x].collision.up).toBe(!boundary[x]);
        }
      }
    }
    expect(horizontalStraights).toBeGreaterThan(verticalStraights);
  }, 15_000);

  it('gives enclosed areas two physical ways out, including the former seed-one pocket', () => {
    for (let seed = 1; seed <= 12; seed += 1) {
      expect({ seed, pockets: oneEntrancePockets(new EndlessMazeStream(seed)) }).toEqual({ seed, pockets: [] });
    }
  });

  it('matches corridor and shared-boundary walls to the rendered footprint', () => {
    for (let seed = 1; seed <= 8; seed += 1) {
      const stream = new EndlessMazeStream(seed);
      const footprint = buildMazeWallFootprint(stream.map);
      for (let y = 0; y < stream.map.height; y += 1) {
        for (let x = 0; x < ENDLESS_WIDTH; x += 1) {
          const tile = stream.map.tiles[y][x];
          if (tile.localId === null || tile.localId >= 17) continue;
          const right = stream.map.tiles[y][x + 1];
          if (right && right.localId !== null && right.localId < 17) {
            const seam = (x + 1) * 16;
            const row = y * 16 + 8;
            expect(Boolean(footprint.solid[row * footprint.width + seam - 1])).toBe(tile.collision.right);
            expect(Boolean(footprint.solid[row * footprint.width + seam])).toBe(tile.collision.right);
          }
          const below = stream.map.tiles[y + 1]?.[x];
          if (x > 0 && x < ENDLESS_WIDTH - 1 && below && below.localId !== null && below.localId < 17) {
            const seam = (y + 1) * 16;
            const column = x * 16 + 8;
            expect(Boolean(footprint.solid[(seam - 1) * footprint.width + column])).toBe(tile.collision.down);
            expect(Boolean(footprint.solid[seam * footprint.width + column])).toBe(tile.collision.down);
          }
        }
      }
      for (let seam = 1; seam < 5; seam += 1) {
        const y = seam * ENDLESS_SECTION_HEIGHT * 16;
        for (let x = 1; x < ENDLESS_WIDTH - 1; x += 1) {
          const blocked = stream.map.tiles[seam * ENDLESS_SECTION_HEIGHT - 1][x].collision.down;
          for (const row of [y - 1, y]) {
            expect(Boolean(footprint.solid[row * footprint.width + x * 16 + 8])).toBe(blocked);
          }
        }
      }
    }
  });

  it('protects a long Firewall loop and keeps wordmarks complete and separated', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const stream = new EndlessMazeStream(seed);
      const navigation = navigationFor(stream);
      const first = stream.map.tiles.flat().find((tile) => tile.x > 0 && tile.x < ENDLESS_WIDTH - 1
        && tile.localId !== null && tile.localId < 17)!;
      expect(navigation.findPatrolOptions(first, 16).length).toBeGreaterThan(0);
      const logos = stream.getSections().flatMap((section) => section.logoRow === null
        ? [] : [section.index * ENDLESS_SECTION_HEIGHT + section.logoRow]);
      for (let i = 1; i < logos.length; i += 1) expect(logos[i] - logos[i - 1]).toBeGreaterThanOrEqual(24);
      for (const section of stream.getSections()) {
        const signs = section.map.tiles.flat().filter((tile) => tile.localId !== null
          && tile.localId >= 17 && tile.localId <= 21);
        expect(signs.length === 0 || signs.length === 5).toBe(true);
        if (signs.length) {
          expect(signs.map((tile) => tile.localId)).toEqual([17, 18, 19, 20, 21]);
          expect(signs.map((tile) => tile.x)).toEqual([10, 11, 12, 13, 14]);
          expect(signs.every((tile) => tile.y === section.logoRow)).toBe(true);
        }
      }
    }
  }, 15_000);

  it('keeps a full portal corridor between matching straight walls below each wordmark', () => {
    let logoCount = 0;
    for (let seed = 1; seed <= 80; seed += 1) {
      const stream = new EndlessMazeStream(seed);
      const footprint = buildMazeWallFootprint(stream.map);
      for (const section of stream.getSections()) {
        if (section.logoRow === null) {
          expect(section.map.portalPairs).toEqual([]);
          continue;
        }
        logoCount += 1;
        const row = stream.localRow(section.index, section.logoRow + 1);
        const pair = { from: { x: 1, y: row }, to: { x: ENDLESS_WIDTH - 2, y: row } };
        expect(section.map.portalPairs).toEqual([{ from: { x: 1, y: section.logoRow + 1 },
          to: { x: ENDLESS_WIDTH - 2, y: section.logoRow + 1 } }]);
        expect(stream.map.portalPairs).toContainEqual(pair);
        for (let x = 1; x < ENDLESS_WIDTH - 2; x += 1) {
          expect(stream.map.tiles[row][x].collision.right).toBe(false);
          expect(stream.map.tiles[row][x + 1].collision.left).toBe(false);
          expect(footprint.solid[(row * 16 + 8) * footprint.width + x * 16 + 8]).toBe(0);
        }
        for (let x = 8; x <= 16; x += 1) {
          const corridor = stream.map.tiles[row][x];
          expect(corridor.collision.up).toBe(true);
          expect(corridor.collision.down).toBe(true);
          expect(footprint.solid[(row * 16) * footprint.width + x * 16 + 8]).toBe(1);
          expect(footprint.solid[(row * 16 + 15) * footprint.width + x * 16 + 8]).toBe(1);
        }
        for (const x of [7, 17]) {
          expect(stream.map.tiles[row][x].collision.up).toBe(false);
          expect(stream.map.tiles[row][x].collision.down).toBe(false);
          expect(footprint.solid[(row * 16) * footprint.width + x * 16 + 8]).toBe(0);
          expect(footprint.solid[(row * 16 + 15) * footprint.width + x * 16 + 8]).toBe(0);
        }
        for (const x of [1, ENDLESS_WIDTH - 2]) {
          const mouth = stream.map.tiles[row][x];
          expect(mouth.localId).toBe(14);
          expect(mouth.collision.portal).toBe(true);
          expect([mouth.collision.up, mouth.collision.right, mouth.collision.down, mouth.collision.left])
            .toEqual([false, false, false, false]);
        }
        for (const [x, seamX] of [[0, 15], [ENDLESS_WIDTH - 1, (ENDLESS_WIDTH - 1) * 16]]) {
          const tip = stream.map.tiles[row][x];
          expect(tip.localId).toBe(23);
          expect(tip.collision.collides).toBe(true);
          expect(footprint.solid[(row * 16 + 8) * footprint.width + seamX]).toBe(0);
          expect(footprint.solid[((row - 1) * 16 + 8) * footprint.width + seamX]).toBe(1);
          expect(footprint.solid[((row + 1) * 16 + 8) * footprint.width + seamX]).toBe(1);
        }
      }
    }
    expect(logoCount).toBeGreaterThan(168);
  }, 15_000);

  it('starts under a centered wordmark on its portal corridor and adds long routes elsewhere', () => {
    let otherFullRows = 0;
    let otherLongRuns = 0;
    const row = Math.floor(ENDLESS_SECTION_HEIGHT / 2);
    for (let seed = 1; seed <= 80; seed += 1) {
      const stream = new EndlessMazeStream(seed);
      const start = stream.getSections().find((section) => section.index === 0)!;
      expect(start.logoRow).toBe(row - 1);
      expect(start.map.tiles[row - 1].slice(10, 15).map((tile) => tile.localId))
        .toEqual([17, 18, 19, 20, 21]);
      expect(start.map.portalPairs).toEqual([{ from: { x: 1, y: row }, to: { x: 23, y: row } }]);
      expect(stream.map.portalPairs).toContainEqual({ from: { x: 1, y: row + 2 * ENDLESS_SECTION_HEIGHT },
        to: { x: 23, y: row + 2 * ENDLESS_SECTION_HEIGHT } });
      for (let x = 1; x < ENDLESS_WIDTH - 2; x += 1) {
        expect(start.map.tiles[row][x].collision.right).toBe(false);
        expect(start.map.tiles[row][x + 1].collision.left).toBe(false);
      }
      expect(start.map.tiles[row][Math.floor(ENDLESS_WIDTH / 2)].localId).toBeLessThan(17);

      for (const section of stream.getSections()) {
        if (section.index === 0 || section.logoRow !== null) continue;
        let longestRun = 1;
        for (let y = 3; y < ENDLESS_SECTION_HEIGHT - 3; y += 1) {
          let run = 1;
          for (let x = 1; x < ENDLESS_WIDTH - 2; x += 1) {
            run = section.map.tiles[y][x].collision.right ? 1 : run + 1;
            longestRun = Math.max(longestRun, run);
          }
        }
        if (longestRun === ENDLESS_WIDTH - 2) otherFullRows += 1;
        else if (longestRun >= 12) otherLongRuns += 1;
      }
    }
    expect(otherFullRows).toBeGreaterThan(10);
    expect(otherLongRuns).toBeGreaterThan(20);
  }, 15_000);

  it('keeps wordmarks separated when the starting section regenerates after eviction', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const stream = new EndlessMazeStream(seed);
      for (let step = 0; step < 6; step += 1) stream.shift('down');
      for (let step = 0; step < 6; step += 1) stream.shift('up');
      const logos = stream.getSections().flatMap((section) => section.logoRow === null ? []
        : [section.index * ENDLESS_SECTION_HEIGHT + section.logoRow]);
      for (let i = 1; i < logos.length; i += 1) {
        expect(logos[i] - logos[i - 1]).toBeGreaterThanOrEqual(24);
      }
    }
  }, 15_000);

  it('keeps nearby sections, regenerates evicted geography, and reuses retained scene objects', () => {
    const stream = new EndlessMazeStream(12345);
    const presentation = new EndlessMazePresentation(stream);
    const original = stream.getSections()[2];
    const originalSignature = original.map.tiles.flat().map((tile) => tile.rawGid + ':' + tile.rotation).join('|');
    const retainedScene = presentation.group.children[3];
    stream.shift('down');
    presentation.onShift();
    expect(stream.getSections()[1]).toBe(original);
    expect(presentation.group.children).toContain(retainedScene);
    stream.shift('down');
    presentation.onShift();
    stream.shift('down');
    presentation.onShift();
    expect(stream.getSections().some((section) => section.index === original.index)).toBe(false);
    stream.shift('up');
    presentation.onShift();
    const regenerated = stream.getSections().find((section) => section.index === original.index);
    expect(regenerated).toBeDefined();
    expect(regenerated).not.toBe(original);
    expect(regenerated!.map.tiles.flat().map((tile) => tile.rawGid + ':' + tile.rotation).join('|'))
      .not.toBe(originalSignature);
    expect(presentation.group.children).toHaveLength(5);
    for (let i = 0; i < 10; i += 1) {
      stream.shift(i % 2 === 0 ? 'up' : 'down');
      presentation.onShift();
      expect(presentation.group.children).toHaveLength(5);
    }
    presentation.dispose();
    expect(presentation.group.children).toHaveLength(0);
  });

  it('uses continuous authored side rails and avoids detached four-way wall corners', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const map = new EndlessMazeStream(seed).map;
      for (let y = 0; y < map.height; y += 1) {
        const left = map.tiles[y][0];
        const right = map.tiles[y][ENDLESS_WIDTH - 1];
        const portalRow = left.localId === 23;
        expect(left.localId).toBe(portalRow ? 23 : 0);
        expect(left.flipX).toBe(!portalRow);
        expect(right.localId).toBe(portalRow ? 23 : 0);
        expect(right.flipX).toBe(portalRow);
        for (const rail of [left, right]) {
          expect([rail.collision.up, rail.collision.right, rail.collision.down, rail.collision.left])
            .toEqual([true, true, true, true]);
        }
      }
      for (let y = 1; y < map.height; y += 1) {
        for (let x = 1; x < ENDLESS_WIDTH; x += 1) {
          const topLeft = map.tiles[y - 1][x - 1];
          const topRight = map.tiles[y - 1][x];
          const bottomLeft = map.tiles[y][x - 1];
          expect(topLeft.collision.right || topLeft.collision.down
            || topRight.collision.down || bottomLeft.collision.right).toBe(true);
        }
      }
    }
  }, 15_000);

  it('uses only supported authored wall and portal-tip tiles', () => {
    const section = generateEndlessSection(22, 7, 101);
    expect(section.map.width).toBe(25);
    expect(section.map.height).toBe(24);
    expect(section.map.tiles.flat().every((tile) =>
      tile.localId !== null && [0, 1, 7, 10, 14, 17, 18, 19, 20, 21, 23].includes(tile.localId)))
      .toBe(true);
  });
});
