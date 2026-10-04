import { describe, expect, it } from 'vitest';
import { battleArenaMapAtStage, createBattleArenaMap } from '../game/simulation/BattleArenaMap';
import { DataRace } from '../game/simulation/DataRace';
import { createMovement, move, position } from '../game/simulation/movement';
import { reconcileMovement } from '../game/simulation/prediction';
import { RACE, type RaceMap } from '../game/simulation/types';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

const IDENTITIES = [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' },
  { id: 'carol', name: 'Carol' }, { id: 'dave', name: 'Dave' }] as const;
const TERMINAL_PRESENTATION_TICKS = Math.ceil(RACE.deathMs / RACE.stepMs)
  + RACE.shrinkTransitionTicks;
let generatedArena: RaceMap | null = null;

/** Creates a two-player session with a known authored perimeter and independent seed. */
function race(id = 'match', seed = 4): DataRace {
  return new DataRace(dataRaceFixture(), id, IDENTITIES.slice(0, 2), seed);
}

/** Reuses one immutable generated arena across authoritative simulation scenarios. */
function arenaMap(): RaceMap {
  generatedArena ??= createBattleArenaMap(0x12345678);
  return generatedArena;
}

/** Locates one stable arena cell without copying the generator's coordinate formula into assertions. */
function arenaCell(map: RaceMap, x: number, y: number): number {
  const cell = map.cells.findIndex((candidate) => candidate.x === x && candidate.y === y);
  if (cell < 0) throw new Error(`Missing arena cell at ${x},${y}.`);
  return cell;
}

/** Advances an authoritative match by an exact fixed-step count. */
function steps(game: DataRace, count: number): void {
  for (let tick = 0; tick < count; tick += 1) game.step();
}

describe('Battle Royale authority', () => {
  it('advances one closure without moving actors or aging effects, and stops at the final ring', () => {
    const game = new DataRace(arenaMap(), 'dev-closures', IDENTITIES.slice(0, 2), 4);
    const scenario = game.snapshot();
    scenario.players.forEach((player, index) => {
      player.movement = createMovement(arenaCell(game.map, 23 + index, 25));
      player.huntMs = 2000;
    });
    scenario.playTicks = 123;
    scenario.tick = 123;
    game.restore(scenario);
    expect(game.advanceToNextClosure()).toBe(true);
    expect(game.snapshot()).toMatchObject({ tick: 123, playTicks: 600, shrinkStage: 1 });
    expect(game.snapshot().players).toEqual(scenario.players);
    for (let stage = 2; stage <= RACE.maxShrinkStage; stage += 1) {
      expect(game.advanceToNextClosure()).toBe(true);
      expect(game.snapshot().shrinkStage).toBe(stage);
    }
    const final = game.snapshot();
    expect(game.advanceToNextClosure()).toBe(false);
    expect(game.snapshot()).toEqual(final);
    game.abort('test');
    expect(game.advanceToNextClosure()).toBe(false);
    expect(race().advanceToNextClosure()).toBe(false);
  });
  it('keeps explicit development solo play active until death while rejecting accidental solo matches', () => {
    expect(() => new DataRace(dataRaceFixture(), 'invalid-solo', [IDENTITIES[0]], 4))
      .toThrow('A match requires 2–4 distinct players.');
    const game = new DataRace(dataRaceFixture(), 'dev-solo', [IDENTITIES[0]], 4, 0, true);
    const player = game.snapshot().players[0];
    expect(game.input(player.id, 1, 'right')).toBe(true);
    game.step();
    expect(position(game.map, game.snapshot().players[0].movement).x).toBeGreaterThan(0);
    expect(game.snapshot().phase).toBe('playing');

    game.eliminate(player.id);
    expect(game.input(player.id, 2, 'down')).toBe(false);
    steps(game, TERMINAL_PRESENTATION_TICKS);
    expect(game.snapshot()).toMatchObject({ phase: 'finished', rankings: [
      { playerId: player.id, rank: 1 },
    ] });
  });

  it('runs all solo development contractions and ranks the survivor only at timeout', () => {
    const map = arenaMap();
    const game = new DataRace(map, 'solo-timeout', [IDENTITIES[0]], 4, 0, true);
    const scenario = game.snapshot();
    scenario.players[0].connected = false;
    scenario.players[0].movement = createMovement(arenaCell(map, 24, 25));
    game.restore(scenario);

    steps(game, RACE.shrinkEveryTicks);
    expect(game.snapshot()).toMatchObject({ phase: 'playing', shrinkStage: 1 });
    steps(game, RACE.matchTicks - game.snapshot().playTicks);
    expect(game.snapshot()).toMatchObject({ phase: 'finished', playTicks: RACE.matchTicks,
      shrinkStage: RACE.maxShrinkStage, rankings: [{ playerId: 'alice', rank: 1 }] });
  });

  it('starts immediately, ends after exactly four minutes, and gives tied scores equal competition ranks', () => {
    const game = race();
    expect(game.snapshot()).toMatchObject({ phase: 'playing', tick: 0, playTicks: 0, shrinkStage: 0 });
    game.disconnect('alice'); game.disconnect('bob');
    for (let tick = 0; tick < RACE.matchTicks - 1; tick += 1) game.step();
    expect(game.snapshot()).toMatchObject({ phase: 'playing', playTicks: RACE.matchTicks - 1 });
    game.step();
    expect(game.snapshot().phase).toBe('finished');
    expect(game.snapshot().rankings.map((entry) => entry.rank)).toEqual([1, 1]);
    const finished = game.snapshot(); game.step(); expect(game.snapshot()).toEqual(finished);
  });

  it('preserves a disconnected survivor position on reconnect while continuing authoritative effect timers', () => {
    const game = race(), scenario = game.snapshot();
    const player = scenario.players.find((candidate) => candidate.id === 'alice')!;
    player.movement = { cell: 0, to: 15, progress: 0.25, direction: 'down', queued: 'left' };
    game.restore(scenario);
    game.disconnect('alice');
    steps(game, 5);
    const frozen = game.snapshot().players.find((candidate) => candidate.id === 'alice')!;
    expect(frozen.movement).toEqual(player.movement);
    expect(frozen.protectionMs).toBeLessThan(player.protectionMs);
    game.reconnect('alice');
    expect(game.snapshot().players.find((candidate) => candidate.id === 'alice')).toMatchObject({
      connected: true, movement: player.movement,
    });
  });

  it('keeps eliminated players stationary and ineligible for input, pickups, and respawn', () => {
    const game = new DataRace(dataRaceFixture(), 'elimination', IDENTITIES.slice(0, 3), 4);
    const scenario = game.snapshot();
    const eliminated = scenario.players.find((player) => player.id === 'alice')!;
    eliminated.movement = createMovement(0, 'down');
    for (const player of scenario.players) {
      if (player.id !== 'alice') { player.connected = false; player.movement = createMovement(4); }
    }
    scenario.pickups = [{ id: 0, cell: 0, kind: 'core' }];
    game.restore(scenario);
    game.eliminate('alice');
    expect(game.input('alice', 1, 'right')).toBe(false);
    steps(game, 60);
    expect(game.snapshot().players.find((player) => player.id === 'alice')).toMatchObject({
      connected: false, score: 0, movement: eliminated.movement, deathMs: 0, eliminatedAtTick: 0,
    });
  });

  it('batches simultaneous external eliminations before producing no-survivor tied standings', () => {
    const game = race();
    game.eliminate('alice');
    expect(game.input('bob', 1, 'right')).toBe(false);
    game.eliminate('bob');
    expect(game.phase).toBe('playing');
    steps(game, TERMINAL_PRESENTATION_TICKS);
    expect(game.snapshot()).toMatchObject({ phase: 'finished', players: [
      { eliminatedAtTick: 0 }, { eliminatedAtTick: 0 },
    ] });
    expect(game.snapshot().rankings.map(({ rank }) => rank)).toEqual([1, 1]);
  });

  it('contracts after movement, preserves caught portal deaths, snaps survivors, and uses moved portals', () => {
    const map = arenaMap();
    const game = new DataRace(map, 'closure', IDENTITIES, 4);
    const scenario = game.snapshot();
    scenario.tick = RACE.shrinkEveryTicks - 1;
    scenario.playTicks = RACE.shrinkEveryTicks - 1;
    scenario.pickups = [{ id: arenaCell(map, 10, 10), cell: arenaCell(map, 10, 10), kind: 'bit' }];
    const outer = arenaCell(map, 1, 25), inner = arenaCell(map, 2, 25);
    scenario.players.find((player) => player.id === 'alice')!.movement = {
      cell: outer, to: inner, progress: 0.4375, direction: 'right', queued: 'right',
    };
    scenario.players.find((player) => player.id === 'bob')!.movement = {
      cell: outer, to: inner, progress: 0.5, direction: 'right', queued: 'right',
    };
    scenario.players.find((player) => player.id === 'carol')!.movement = createMovement(arenaCell(map, 24, 25));
    scenario.players.find((player) => player.id === 'dave')!.movement = {
      cell: outer,
      to: arenaCell(map, 47, 25),
      progress: 0.25,
      direction: 'left',
      queued: 'left',
    };
    game.restore(scenario);
    game.step();
    const closed = game.snapshot();
    expect(closed.shrinkStage).toBe(1);
    expect(closed.players.find((player) => player.id === 'alice')!.eliminatedAtTick).toBe(RACE.shrinkEveryTicks);
    const portalDeath = closed.players.find((player) => player.id === 'dave')!;
    expect(portalDeath).toMatchObject({ eliminatedAtTick: RACE.shrinkEveryTicks,
      movement: { cell: outer, to: null, progress: 0 } });
    expect(position(battleArenaMapAtStage(map, 1), portalDeath.movement)).toEqual({ x: 1, y: 25 });
    expect(closed.players.find((player) => player.id === 'bob')!.movement).toMatchObject({
      cell: inner, to: null, progress: 0,
    });
    expect(game.input('bob', 1, 'left')).toBe(true);
    steps(game, 8);
    const staged = battleArenaMapAtStage(map, 1);
    const portal = staged.cells[inner].edges.find((edge) => edge.direction === 'left' && edge.portal)!;
    expect(game.snapshot().players.find((player) => player.id === 'bob')!.movement.cell).toBe(portal.to);
  });

  it('samples inward and outward boundary crossings before the closure decision', () => {
    const map = arenaMap();
    const game = new DataRace(map, 'bidirectional-closure', IDENTITIES, 4);
    const scenario = game.snapshot();
    scenario.tick = RACE.shrinkEveryTicks - 1;
    scenario.playTicks = RACE.shrinkEveryTicks - 1;
    const outer = arenaCell(map, 1, 25), inner = arenaCell(map, 2, 25);
    scenario.players.find((player) => player.id === 'alice')!.movement = {
      cell: outer, to: inner, progress: 0.4375, direction: 'right', queued: 'right',
    };
    scenario.players.find((player) => player.id === 'bob')!.movement = {
      cell: inner, to: outer, progress: 0.4375, direction: 'left', queued: 'left',
    };
    scenario.players.find((player) => player.id === 'carol')!.movement = {
      cell: outer, to: inner, progress: 0.5, direction: 'right', queued: 'right',
    };
    scenario.players.find((player) => player.id === 'dave')!.movement = {
      cell: inner, to: outer, progress: 0.375, direction: 'left', queued: 'left',
    };
    game.restore(scenario);
    game.step();
    const players = Object.fromEntries(game.snapshot().players.map((player) => [player.id, player]));
    expect([players.alice.eliminatedAtTick, players.bob.eliminatedAtTick])
      .toEqual([RACE.shrinkEveryTicks, RACE.shrinkEveryTicks]);
    expect(players.carol.movement).toMatchObject({ cell: inner, to: null, progress: 0 });
    expect(players.dave.movement).toMatchObject({ cell: inner, to: null, progress: 0 });
  });

  it('catches disconnected players and refills only pickups inside the contracted arena', () => {
    const map = arenaMap();
    const game = new DataRace(map, 'disconnected-closure', IDENTITIES.slice(0, 2), 4);
    const scenario = game.snapshot();
    scenario.tick = RACE.shrinkEveryTicks - 1;
    scenario.playTicks = RACE.shrinkEveryTicks - 1;
    const outer = arenaCell(map, 1, 25);
    scenario.pickups = [{ id: outer, cell: outer, kind: 'bit' }];
    const caught = scenario.players.find((player) => player.id === 'alice')!;
    caught.connected = false; caught.movement = createMovement(outer);
    const safe = scenario.players.find((player) => player.id === 'bob')!;
    safe.connected = false; safe.movement = createMovement(arenaCell(map, 24, 25));
    game.restore(scenario);
    game.step();
    const closed = game.snapshot();
    expect(closed.phase).toBe('playing');
    expect(closed.players.find((player) => player.id === 'alice')!.eliminatedAtTick).toBe(RACE.shrinkEveryTicks);
    expect(closed.players.find((player) => player.id === 'alice')!.deathMs).toBe(RACE.deathMs);
    expect(closed.refill).toBe(1);
    expect(closed.pickups.length).toBeGreaterThan(0);
    expect(closed.pickups.every((pickup) => {
      const { x, y } = map.cells[pickup.cell];
      return x >= 2 && x <= 46 && y >= 2 && y <= 46;
    })).toBe(true);
    const retainedMovement = closed.players.find((player) => player.id === 'bob')!.movement;
    steps(game, Math.ceil(RACE.deathMs / RACE.stepMs));
    const followed = game.snapshot();
    expect(followed.phase).toBe('playing');
    expect(followed.players.find((player) => player.id === 'alice')!.deathMs).toBeCloseTo(0);
    expect(followed.players.find((player) => player.id === 'bob')!.movement).toEqual(retainedMovement);
    steps(game, RACE.shrinkTransitionTicks - 1);
    expect(game.snapshot().phase).toBe('playing');
    game.step();
    expect(game.snapshot().phase).toBe('finished');
  });

  it('applies all twenty contractions by 200 seconds and holds the final arena until timeout', () => {
    const map = arenaMap();
    const game = new DataRace(map, 'all-closures', IDENTITIES.slice(0, 2), 4);
    const scenario = game.snapshot();
    scenario.players.forEach((player, index) => {
      player.connected = false;
      player.movement = createMovement(arenaCell(map, index === 0 ? 23 : 25, 25));
    });
    const centerPickup = arenaCell(map, 24, 25);
    scenario.pickups = [{ id: centerPickup, cell: centerPickup, kind: 'bit' }];
    game.restore(scenario);
    steps(game, RACE.shrinkEveryTicks * RACE.maxShrinkStage - 1);
    expect(game.snapshot()).toMatchObject({ phase: 'playing', shrinkStage: 19 });
    game.step();
    expect(game.snapshot()).toMatchObject({ phase: 'playing', playTicks: 12000, shrinkStage: 20 });
    steps(game, RACE.matchTicks - game.snapshot().playTicks);
    expect(game.snapshot()).toMatchObject({ phase: 'finished', playTicks: RACE.matchTicks, shrinkStage: 20 });
  });

  it('ranks survivors by score before players ordered by their latest elimination tick', () => {
    const game = new DataRace(dataRaceFixture(), 'rankings', IDENTITIES, 4);
    const scenario = game.snapshot();
    scenario.players.forEach((player) => { player.connected = false; });
    scenario.players.find((player) => player.id === 'alice')!.score = 1000;
    scenario.players.find((player) => player.id === 'bob')!.score = 900;
    scenario.players.find((player) => player.id === 'carol')!.score = 10;
    scenario.players.find((player) => player.id === 'dave')!.score = 20;
    game.restore(scenario);
    steps(game, 10); game.eliminate('alice');
    steps(game, 10); game.eliminate('bob');
    steps(game, RACE.matchTicks - game.snapshot().playTicks);
    expect(game.snapshot().rankings.map(({ playerId, rank }) => [playerId, rank])).toEqual([
      ['dave', 1], ['carol', 2], ['bob', 3], ['alice', 4],
    ]);
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
    const predicted = reconcileMovement(map, player, 100, 101, [{ sequence: 1, targetTick: 101, direction: 'left' }]);
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
