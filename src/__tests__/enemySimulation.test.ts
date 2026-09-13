import { describe, expect, it } from 'vitest';
import { EnemyDecisionService, simulateEnemyMovement } from '../game/domain/services/EnemyDecisionService';
import { CollisionGrid } from '../game/domain/world/CollisionGrid';
import { SeededRandom } from '../game/shared/random/SeededRandom';
import { createCollisionTile } from './fixtures/pointLayoutFixtures';

function gridFromRows(rows: string[]): CollisionGrid {
  return new CollisionGrid(rows.map((row) => [...row].map((tile) => createCollisionTile(
    tile === '#' ? { collides: true, up: true, down: true, left: true, right: true } : {},
  ))));
}

describe('enemy movement decisions', () => {
  it('continues through a corridor and reverses only at the dead end', () => {
    const grid = gridFromRows(['#####', '#...#', '#####']);
    const decisions = new EnemyDecisionService();
    const rng = new SeededRandom(42);

    expect(decisions.chooseDirectionAtCenter('right', grid.getTilesAt({ x: 2, y: 1 }), 16, rng)).toBe('right');
    expect(decisions.chooseDirectionAtCenter('right', grid.getTilesAt({ x: 3, y: 1 }), 16, rng)).toBe('left');
    expect(decisions.chooseDirectionWhenBlocked('right', 0, 0, grid.getTilesAt({ x: 3, y: 1 }), 16, rng)).toBe('left');
  });

  it('turns into the open perpendicular corridor when forward movement is blocked', () => {
    const grid = gridFromRows(['#####', '#..##', '##.##', '#####']);
    const decisions = new EnemyDecisionService();

    expect(decisions.chooseDirectionWhenBlocked('right', 0, 0, grid.getTilesAt({ x: 2, y: 1 }), 16, new SeededRandom(42))).toBe('down');
  });

  it.each([12345, 99999])('keeps a moving enemy out of walls and turns only at tile centers with seed %s', (seed) => {
    const rows = ['#######', '#.....#', '#..#..#', '#..#..#', '#..#..#', '#.....#', '#######'];
    const snapshots = simulateEnemyMovement({
      collisionGrid: gridFromRows(rows), steps: 256, rng: new SeededRandom(seed), tileSize: 16, speed: 4,
      startTile: { x: 1, y: 1 }, startDirection: 'right',
    });
    let previous: typeof snapshots[number] = { tile: { x: 1, y: 1 }, moved: { x: 0, y: 0 }, direction: 'right' };
    const visited = new Set<string>();
    for (const state of snapshots) {
      const x = state.tile.x * 16 + 8 + state.moved.x;
      const y = state.tile.y * 16 + 8 + state.moved.y;
      const dx = x - (previous.tile.x * 16 + 8 + previous.moved.x);
      const dy = y - (previous.tile.y * 16 + 8 + previous.moved.y);
      const distance = Math.abs(dx) + Math.abs(dy);

      expect(rows[Math.floor(y / 16)]?.[Math.floor(x / 16)]).toBe('.');
      expect(distance === 0 || distance === 4).toBe(true);
      expect(dx === 0 || dy === 0).toBe(true);
      if (dx > 0) expect(state.direction).toBe('right');
      if (dx < 0) expect(state.direction).toBe('left');
      if (dy > 0) expect(state.direction).toBe('down');
      if (dy < 0) expect(state.direction).toBe('up');
      if (state.direction !== previous.direction) expect(previous.moved).toEqual({ x: 0, y: 0 });
      visited.add(`${state.tile.x},${state.tile.y}`);
      previous = state;
    }
    expect(visited.size).toBeGreaterThan(1);
  });
});
