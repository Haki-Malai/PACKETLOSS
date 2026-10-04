import { describe, expect, it } from 'vitest';
import { DataRace } from '../game/simulation/DataRace';
import { createMovement, move, position } from '../game/simulation/movement';
import { reconcileMovement } from '../game/simulation/prediction';
import { RACE } from '../game/simulation/types';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

/** Creates a two-player session with a known authored perimeter and independent seed. */
function race(id = 'match', seed = 4): DataRace {
  return new DataRace(dataRaceFixture(), id, [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], seed);
}

describe('Data Race authority', () => {
  it('starts immediately, ends after exactly three minutes, and gives tied scores equal competition ranks', () => {
    const game = race();
    expect(game.snapshot()).toMatchObject({ phase: 'playing', tick: 0, playTicks: 0 });
    game.disconnect('alice'); game.disconnect('bob');
    for (let tick = 0; tick < RACE.matchTicks - 1; tick += 1) game.step();
    expect(game.snapshot()).toMatchObject({ phase: 'playing', playTicks: RACE.matchTicks - 1 });
    game.step();
    expect(game.snapshot().phase).toBe('finished');
    expect(game.snapshot().rankings.map((entry) => entry.rank)).toEqual([1, 1]);
    const finished = game.snapshot(); game.step(); expect(game.snapshot()).toEqual(finished);
  });

  it('accepts input and moves on the first simulation step', () => {
    const game = race(), initial = game.snapshot();
    const player = initial.players.find((candidate) => candidate.slot === 0)!;
    expect(game.input(player.id, 1, 'down')).toBe(true);
    game.step();
    const started = game.snapshot();
    const moved = started.players.find((candidate) => candidate.id === player.id)!;
    expect(started.playTicks).toBe(1);
    const point = position(game.map, moved.movement);
    expect(point.x).toBe(0); expect(point.y).toBeCloseTo(0.0625);
  });

  it('starts on a small corridor without a patrol route and never spawns enemies', () => {
    const game = new DataRace({
      id: 'corridor', width: 4, height: 1, spawns: [0, 1, 2, 3], enemyHome: 0,
      cells: [
        { x: 0, y: 0, edges: [{ to: 1, direction: 'right' }] },
        { x: 1, y: 0, edges: [{ to: 0, direction: 'left' }, { to: 2, direction: 'right' }] },
        { x: 2, y: 0, edges: [{ to: 1, direction: 'left' }, { to: 3, direction: 'right' }] },
        { x: 3, y: 0, edges: [{ to: 2, direction: 'left' }] },
      ],
      pickups: [{ id: 0, cell: 0, kind: 'core' }, { id: 3, cell: 3, kind: 'bit' }],
    }, 'small-match', [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 4);
    expect(game.snapshot().enemies).toEqual([]);
    for (let tick = 0; tick < 420; tick += 1) game.step();
    expect(game.snapshot().enemies).toEqual([]);
    expect(game.snapshot().players.map((player) => player.deathMs)).toEqual([0, 0]);
  });

  it('awards a contested core once and gives only its collector the six-second power effect', () => {
    const game = race(), scenario = game.snapshot();
    scenario.players.forEach((player) => { player.movement = createMovement(0, 'up'); player.protectionMs = 0; });
    game.restore(scenario); game.step();
    const collected = game.snapshot();
    expect(collected.players.map((player) => player.score)).toEqual([50, 0]);
    expect(collected.players.map((player) => player.huntMs)).toEqual([6000, 0]);
    for (let tick = 0; tick < 360; tick += 1) game.step();
    expect(game.snapshot().players.map((player) => player.huntMs)).toEqual([0, 0]);
    expect(game.snapshot().players.map((player) => player.score)).toEqual([50, 0]);
  });

  it.each([0, 6000])('discards restored enemies without damage, capture awards, or blocked pickups at power %i ms', (huntMs) => {
    const game = race(), scenario = game.snapshot();
    const player = scenario.players[0];
    player.movement = createMovement(0, 'up'); player.score = 123;
    player.protectionMs = 0; player.huntMs = huntMs;
    scenario.players[1].connected = false;
    scenario.enemies = [{ id: 'firewall', movement: createMovement(0, 'up'), phase: 'active',
      waitMs: 0, patrol: [0], patrolIndex: 0 }];
    game.restore(scenario); game.step();
    const restored = game.snapshot();
    expect(restored.enemies).toEqual([]);
    expect(restored.players[0]).toMatchObject({ deathMs: 0, score: 173, huntMs: 6000, chain: 0 });
    expect(restored.pickups).toEqual([{ id: 8, cell: 8, kind: 'bit' }]);
    game.step(); expect(game.snapshot().players[0].score).toBe(173);
  });

  it('refills once after a pickup pass without resetting elapsed time or players', () => {
    const game = race(), scenario = game.snapshot();
    scenario.phase = 'playing'; scenario.playTicks = 100;
    scenario.players.forEach((player) => { player.movement = createMovement(0, 'up'); });
    scenario.pickups = [{ id: 0, cell: 0, kind: 'bit' }];
    game.restore(scenario); game.step();
    expect(game.snapshot().refill).toBe(1);
    expect(game.snapshot().playTicks).toBe(101);
    expect(game.snapshot().players.map((player) => player.score)).toEqual([10, 0]);
    expect(game.snapshot().players.map((player) => player.movement)).toEqual(scenario.players.map((player) => player.movement));
    expect(game.snapshot().pickups).toEqual(dataRaceFixture().pickups);
  });

  it('isolates sessions and restores all authoritative state needed to continue a replay', () => {
    const first = race('first'), second = race('second', 7);
    first.input('alice', 1, 'down');
    for (let tick = 0; tick < 200; tick += 1) first.step();
    expect(second.snapshot().tick).toBe(0);
    expect(second.snapshot().players.every((player) => player.score === 0)).toBe(true);
    const saved = first.snapshot(); first.step(); const expected = first.snapshot();
    first.restore(saved); first.step(); expect(first.snapshot()).toEqual(expected);
  });

  it('rotates spawn slots on rematch while preserving the same seeded participant ordering', () => {
    const identities = [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }];
    const first = new DataRace(dataRaceFixture(), 'one', identities, 4);
    const second = new DataRace(dataRaceFixture(), 'two', identities, 4, 1);
    expect(second.snapshot().players.find((player) => player.id === 'alice')!.slot)
      .toBe(1 - first.snapshot().players.find((player) => player.id === 'alice')!.slot);
  });

  it('replays local movement with immediate reversal and cannot replay more than 400 ms', () => {
    const map = dataRaceFixture(), player = race().snapshot().players[0];
    player.movement = createMovement(0, 'right'); move(map, player.movement, 0.5);
    const predicted = reconcileMovement(map, player, 100, 101, [{ sequence: 1, tick: 100, direction: 'left' }]);
    expect(position(map, predicted).x).toBeCloseTo(0.5 - 1 / 16);
    const capped = reconcileMovement(map, player, 100, 10000, []);
    expect(position(map, capped).x).toBeCloseTo(2);
  });

  it('reverses an outward portal half-step before teleporting without a position jump', () => {
    const map = dataRaceFixture(); map.cells[0].edges.push({ to: 8, direction: 'left', portal: true });
    const actor = createMovement(0, 'left'); move(map, actor, 0.25);
    expect(position(map, actor)).toEqual({ x: -0.25, y: 0 });
    actor.queued = 'right'; move(map, actor, 0.0625);
    expect(position(map, actor)).toEqual({ x: -0.1875, y: 0 });
    move(map, actor, 0.25); expect(position(map, actor)).toEqual({ x: 0.0625, y: 0 });
  });
});
