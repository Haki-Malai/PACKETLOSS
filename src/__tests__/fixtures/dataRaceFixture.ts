import type { Direction, RaceMap } from '../../game/simulation/types';

/** Creates an authored sixteen-cell square patrol with four separated starting cells. */
export function dataRaceFixture(): RaceMap {
  const positions = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3],
    [4, 4], [3, 4], [2, 4], [1, 4], [0, 4], [0, 3], [0, 2], [0, 1]];
  const cells = positions.map(([x, y], index) => ({ x, y, edges: [(index + 1) % 16, (index + 15) % 16].map((to) => {
    const [nx, ny] = positions[to];
    const direction: Direction = nx > x ? 'right' : nx < x ? 'left' : ny > y ? 'down' : 'up';
    return { to, direction };
  }) }));
  return { id: 'authored-square', width: 5, height: 5, cells, spawns: [0, 8, 4, 12], enemyHome: 4,
    pickups: [{ id: 0, cell: 0, kind: 'core' }, { id: 8, cell: 8, kind: 'bit' }] };
}
