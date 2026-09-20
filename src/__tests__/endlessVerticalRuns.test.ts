import { describe, expect, it } from 'vitest';
import { EndlessMazeStream } from '../game/domain/world/EndlessMazeStream';

/** Counts consecutive physical north/south passages across the full resident window. */
function longestVerticalRun(stream: EndlessMazeStream): number {
  const { tiles } = stream.map;
  let longest = 1;
  for (let x = 1; x < stream.map.width - 1; x += 1) {
    let run = 1;
    for (let y = 0; y < stream.map.height - 1; y += 1) {
      const open = !tiles[y][x].collision.down && !tiles[y + 1][x].collision.up;
      run = open ? run + 1 : 1;
      longest = Math.max(longest, run);
    }
  }
  return longest;
}

/** Counts consecutive blocked north/south passages across each interior row boundary. */
function longestHorizontalWall(stream: EndlessMazeStream): number {
  const { tiles } = stream.map;
  let longest = 0;
  for (let y = 0; y <= stream.map.height; y += 1) {
    let run = 0;
    for (let x = 1; x < stream.map.width - 1; x += 1) {
      const blocked = y === 0 ? tiles[0][x].collision.up
        : y === stream.map.height ? tiles[y - 1][x].collision.down
          : tiles[y - 1][x].collision.down && tiles[y][x].collision.up;
      run = blocked ? run + 1 : 0;
      longest = Math.max(longest, run);
    }
  }
  return longest;
}

describe('endless lane limits', () => {
  it('breaks vertical travel before five boxes and horizontal walls after ten, including section seams', () => {
    for (let seed = 1; seed <= 64; seed += 1) {
      const stream = new EndlessMazeStream(seed);
      for (const direction of [null, 'up', 'up', 'down', 'down', 'down', 'down'] as const) {
        if (direction) stream.shift(direction);
        expect(longestVerticalRun(stream)).toBeLessThanOrEqual(4);
        expect(longestHorizontalWall(stream)).toBeLessThanOrEqual(10);
      }
    }
  }, 30_000);
});
