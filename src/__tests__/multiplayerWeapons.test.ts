import { describe, expect, it } from 'vitest';
import { DataRace } from '../game/simulation/DataRace';
import { createMovement, move, position, type MovementTeleport } from '../game/simulation/movement';
import { RACE, SYNCHRONIZATION, type Direction, type RaceMap, type RaceSnapshot } from '../game/simulation/types';
import { createBattleArenaMap } from '../game/simulation/BattleArenaMap';
import { isPowerupKind, OFFENSIVE_POWERUPS } from '../game/shared/offensivePowerups';
import { decodeRaceSnapshot, encodeRaceSnapshot, parseClientMessage, parseServerMessage } from '../game/protocol/messages';
import { MultiplayerSynchronization } from '../game/simulation/MultiplayerSynchronization';
import { sampleRemoteActor } from '../game/simulation/prediction';

/** Supplies an authored open corridor grid with independent spawns and a distant ordinary pickup. */
function mapFixture(): RaceMap {
  const width = 9, height = 7;
  const cells = Array.from({ length: width * height }, (_, cell) => {
    const x = cell % width, y = Math.floor(cell / width);
    const neighbors: Array<[number, number, Direction]> = [[x - 1, y, 'left'], [x + 1, y, 'right'],
      [x, y - 1, 'up'], [x, y + 1, 'down']];
    return { x, y, edges: neighbors.filter(([nx, ny]) => nx >= 0 && nx < width && ny >= 0 && ny < height)
      .map(([nx, ny, direction]) => ({ to: ny * width + nx, direction })) };
  });
  return { id: 'weapon-corridor', width, height, cells, spawns: [29, 31, 47, 49], enemyHome: 0,
    pickups: [{ id: 0, cell: 0, kind: 'bit' }, { id: 100, cell: 50, kind: 'missile' }] };
}

/** Creates a two-player match with known facing, spawn coordinates, and optional target protection. */
function gameFixture(targetEffects: Partial<Pick<RaceSnapshot['players'][number], 'protectionMs' | 'portalBlinkMs' | 'huntMs'>> = {}) {
  const map = mapFixture(), game = new DataRace(map, 'weapons', [{ id: 'alice', name: 'Alice' },
    { id: 'bob', name: 'Bob' }], 4);
  const state = game.snapshot();
  for (const player of state.players) {
    player.movement = createMovement(player.id === 'alice' ? 29 : 31);
    player.protectionMs = 0;
    if (player.id === 'bob') Object.assign(player, targetEffects);
  }
  game.restore(state);
  return { map, game };
}

/** Advances only the authoritative fixed-step interface. */
function steps(game: DataRace, count: number): void {
  for (let tick = 0; tick < count; tick += 1) game.step();
}

/** Reads a named player from a detached authoritative snapshot. */
function player(game: DataRace, id: string) {
  return game.snapshot().players.find((candidate) => candidate.id === id)!;
}

describe('authoritative offensive weapons', () => {
  it('places two mirrored pickups per weapon with unique IDs outside cores, spawns, and portals', () => {
    const map = createBattleArenaMap(19), weapons = map.pickups.filter((pickup) => isPowerupKind(pickup.kind));
    expect(weapons).toHaveLength(8);
    expect(new Set(map.pickups.map((pickup) => pickup.id)).size).toBe(map.pickups.length);
    for (const kind of OFFENSIVE_POWERUPS) {
      const pair = weapons.filter((pickup) => pickup.kind === kind);
      expect(pair).toHaveLength(2);
      const [left, right] = pair.map((pickup) => map.cells[pickup.cell]);
      expect([left.x + right.x, left.y]).toEqual([map.width - 1, right.y]);
    }
    for (const pickup of weapons) {
      expect(map.spawns).not.toContain(pickup.cell);
      expect(map.cells[pickup.cell].edges.some((edge) => edge.portal)).toBe(false);
      expect(map.pickups.some((point) => point.cell === pickup.cell && point.kind === 'core')).toBe(false);
    }
  });

  it('replaces inventory on collection without awarding score or allowing weapons to block an ordinary refill', () => {
    const { game } = gameFixture();
    game.equipPowerup('alice', 'missile');
    const state = game.snapshot();
    state.pickups = [{ id: 100, cell: 29, kind: 'laser' }, { id: 0, cell: 0, kind: 'bit' }];
    game.restore(state);
    game.step();
    expect(player(game, 'alice')).toMatchObject({ heldPowerup: 'laser', score: 0 });
    expect(game.snapshot().combat.effects).toEqual([expect.objectContaining({ role: 'collection', kind: 'laser' })]);
    const emptied = game.snapshot();
    emptied.pickups = [{ id: 101, cell: 49, kind: 'blast' }];
    game.restore(emptied);
    game.step();
    expect(game.snapshot()).toMatchObject({ refill: 1, pickups: game.map.pickups });
  });

  it('schedules E independently of movement and consumes it once while the player continues moving', () => {
    const { game, map } = gameFixture({ protectionMs: 1000 });
    game.equipPowerup('alice', 'blast');
    expect(game.activate('alice', 1, 2)).toBe(true);
    expect(game.activate('alice', 1, 2)).toBe(false);
    expect(game.input('alice', 1, 'right', 2)).toBe(true);
    game.step();
    expect(player(game, 'alice').heldPowerup).toBe('blast');
    game.step();
    expect(player(game, 'alice')).toMatchObject({ heldPowerup: null, acknowledgedPowerup: 1, acknowledgedInput: 1 });
    expect(position(map, player(game, 'alice').movement).x).toBeGreaterThan(2);
    game.equipPowerup('alice', 'laser');
    expect(game.activate('alice', 2, 3)).toBe(true);
    game.step();
    expect(player(game, 'alice')).toMatchObject({ heldPowerup: 'laser', acknowledgedPowerup: 2 });
    expect(game.snapshot().combat.casts).toHaveLength(1);
  });

  it.each([{ protectionMs: 1000 }, { portalBlinkMs: 1000 }])('respects protection %j', (effects) => {
    const { game } = gameFixture(effects);
    game.equipPowerup('alice', 'reverse-blast'); game.activate('alice', 1, 1);
    steps(game, 25);
    expect(player(game, 'bob').eliminatedAtTick).toBeNull();
  });

  it.each([{ protectionMs: 4000 }, { portalBlinkMs: 4000 }])('preserves immunity against blast %j', (effects) => {
    const { game } = gameFixture(effects);
    game.equipPowerup('alice', 'blast'); game.activate('alice', 1, 1);
    steps(game, 100);
    expect(player(game, 'bob').eliminatedAtTick).toBeNull();
    expect(game.snapshot().combat.effects).toEqual([]);
  });

  it.each([0, 1300])('kills at the enlarged blast radius after %i ms protection and preserves final scores', (protectionMs) => {
    const { game } = gameFixture({ protectionMs, huntMs: 6000 });
    const state = game.snapshot();
    for (const candidate of state.players) {
      candidate.movement = createMovement(candidate.id === 'alice' ? 30 : 35);
      candidate.score = candidate.id === 'alice' ? 10 : 50;
    }
    game.restore(state);
    game.equipPowerup('bob', 'missile');
    game.equipPowerup('alice', 'blast'); game.activate('alice', 1, 1);
    steps(game, 200);
    expect(player(game, 'bob').eliminatedAtTick).not.toBeNull();
    expect(player(game, 'bob')).toMatchObject({ heldPowerup: null, huntMs: 0, score: 50 });
    expect(player(game, 'alice').eliminatedAtTick).toBeNull();
    expect(game.snapshot()).toMatchObject({ phase: 'finished', rankings: [
      { playerId: 'alice', rank: 1, score: 10 }, { playerId: 'bob', rank: 2, score: 50 },
    ] });
  });

  it('holds an authoritative laser caster at its exact position and facing through the full animation', () => {
    const { game, map } = gameFixture({ protectionMs: 4000 });
    steps(game, 4);
    const origin = position(map, player(game, 'alice').movement);
    game.equipPowerup('alice', 'laser');
    game.activate('alice', 1, 5);
    game.input('alice', 1, 'left', 5);
    steps(game, 90);
    expect(position(map, player(game, 'alice').movement)).toEqual(origin);
    expect(player(game, 'alice').movement).toMatchObject({ direction: 'right', queued: 'left' });
    expect(game.snapshot().combat.casts[0]).toMatchObject({ facing: 'right',
      origin: { x: (origin.x + 0.5) * 16, y: (origin.y + 0.5) * 16 } });
    steps(game, 18);
    expect(game.snapshot().combat.casts).toEqual([]);
    expect(position(map, player(game, 'alice').movement)).toEqual(origin);
    game.step();
    expect(player(game, 'alice').movement.direction).toBe('left');
    expect(position(map, player(game, 'alice').movement).x).toBeLessThan(origin.x);
  });

  it('pins local prediction and remote interpolation until the laser ends across coalesced snapshots', () => {
    const { game, map } = gameFixture({ protectionMs: 4000 });
    steps(game, 5);
    const sync = new MultiplayerSynchronization();
    sync.acceptSnapshot(map, game.snapshot(), 'alice', 1, 0);
    const origin = position(map, player(game, 'alice').movement);
    expect(sync.sample(20)!.actors.get('alice')!.point.x).toBeGreaterThan(origin.x);
    game.equipPowerup('alice', 'laser');
    game.activate('alice', 1, 6); game.input('alice', 1, 'left', 6); game.step();
    sync.acceptSnapshot(map, game.snapshot(), 'alice', 2, 20);
    expect(sync.sample(40)!.actors.get('alice')).toMatchObject({ point: origin, moving: false,
      player: { movement: { direction: 'right', queued: 'left' } } });
    steps(game, 99);
    const before = game.snapshot();
    steps(game, 12);
    const after = game.snapshot();
    expect(sampleRemoteActor([before, after], 109, 'alice', map)).toMatchObject({ point: origin, moving: false });
    const resumed = sampleRemoteActor([before, after], 115, 'alice', map)!;
    expect(resumed.moving).toBe(true);
    expect(resumed.point.x).toBeCloseTo(origin.x - RACE.playerSpeed * RACE.stepMs / 1000 * 2);
    expect(resumed.player.movement.direction).toBe('left');
  });

  it('ignores the core gold effect for damage and preserves the exact fractional release hit position', () => {
    const { game } = gameFixture({ huntMs: 6000 });
    game.equipPowerup('alice', 'reverse-blast'); game.activate('alice', 1, 1);
    steps(game, 25);
    const victim = player(game, 'bob');
    expect(victim.eliminatedAtTick).not.toBeNull();
    expect(victim.deathPosition!.x).toBeCloseTo(4 + RACE.playerSpeed * 0.35, 6);
    expect(victim.deathPosition!.y).toBe(3);
    expect(victim).toMatchObject({ heldPowerup: null, score: 0 });
    expect(player(game, 'alice').score).toBe(0);
  });

  it.each(['laser', 'missile'] as const)('resolves a lethal %s through authoritative movement without changing score', (kind) => {
    const { game } = gameFixture();
    game.equipPowerup('alice', kind); game.activate('alice', 1, 1);
    steps(game, 90);
    expect(player(game, 'bob').eliminatedAtTick).not.toBeNull();
    expect(game.snapshot().players.map((candidate) => candidate.score)).toEqual([0, 0]);
  });

  it('batches simultaneous casts so both opponents die in one elimination cohort', () => {
    const { game } = gameFixture();
    for (const id of ['alice', 'bob']) { game.equipPowerup(id, 'reverse-blast'); game.activate(id, 1, 1); }
    steps(game, 25);
    const state = game.snapshot();
    expect(state.players.every((candidate) => candidate.eliminatedAtTick !== null)).toBe(true);
    expect(new Set(state.players.map((candidate) => candidate.eliminatedAtTick)).size).toBe(1);
    expect(state.movementEnabled).toBe(false);
  });

  it('restores and deeply clones active casts and rejects stale or eliminated activation requests', () => {
    const { game } = gameFixture();
    game.equipPowerup('alice', 'missile'); game.activate('alice', 1, 1); game.step();
    const checkpoint = game.snapshot(); game.step(); const expected = game.snapshot();
    game.restore(checkpoint); game.step(); expect(game.snapshot()).toEqual(expected);
    const external = game.snapshot(); external.combat.casts[0].elapsedMs = 999;
    expect(game.snapshot().combat.casts[0].elapsedMs).not.toBe(999);
    game.eliminate('alice');
    expect(game.snapshot().combat.casts).toEqual([]);
    expect(game.activate('alice', 2, game.tick + 1)).toBe(false);
  });

  it('reports the exact physical segments and time fraction of a portal crossing', () => {
    const map = mapFixture(); map.cells[29].edges.push({ to: 35, direction: 'left', portal: true });
    const actor = { cell: 29, to: 35, progress: 0.8, direction: 'left' as const, queued: 'left' as const };
    const crossings: MovementTeleport[] = [];
    move(map, actor, 0.25, true, undefined, (motion) => crossings.push(motion));
    expect(crossings).toHaveLength(1);
    expect(crossings[0].departure).toEqual({ x: 1.5, y: 3 });
    expect(crossings[0].arrival).toEqual({ x: 8, y: 3 });
    expect(crossings[0].fraction).toBeCloseTo(0.4, 8);
    expect(position(map, actor).x).toBeCloseTo(7.85, 8);
  });

  it('interpolates matching authoritative missiles between buffered snapshots', () => {
    const { game, map } = gameFixture({ protectionMs: 1000 });
    game.equipPowerup('alice', 'missile'); game.activate('alice', 1, 1); steps(game, 27);
    const first = game.snapshot(), sync = new MultiplayerSynchronization();
    sync.acceptSnapshot(map, first, 'alice', 1, 450);
    steps(game, 3); const second = game.snapshot(); sync.acceptSnapshot(map, second, 'alice', 2, 500);
    const frame = sync.sample(575)!;
    expect(frame.combat.projectiles[0].id).toBe(first.combat.projectiles[0].id);
    expect(frame.combat.projectiles[0].x).toBeGreaterThan(first.combat.projectiles[0].x);
    expect(frame.combat.projectiles[0].x).toBeLessThan(second.combat.projectiles[0].x);
  });

  it('replays both corners from coalesced missile snapshots without diagonal interpolation or mutation', () => {
    const { game, map } = gameFixture(), sync = new MultiplayerSynchronization();
    const first = game.snapshot();
    first.tick = 60; first.combat.clockMs = 1000;
    first.combat.projectiles = [{ id: 99, ownerId: 'alice', targetId: 'bob',
      x: 50, y: 24, angle: 0, elapsedMs: 100, turns: [] }];
    const second = structuredClone(first);
    second.tick = 75; second.combat.clockMs = 1250;
    second.combat.projectiles[0] = { ...first.combat.projectiles[0], x: 64, y: 40, elapsedMs: 350,
      turns: [{ x: 56, y: 24, angle: Math.PI / 2, elapsedMs: 150 },
        { x: 56, y: 40, angle: 0, elapsedMs: 150 + 1000 * 16 / 120 }] };
    const originals = structuredClone([first, second]);
    sync.acceptSnapshot(map, first, 'alice', 1, 1000);
    sync.acceptSnapshot(map, second, 'alice', 2, 1250);
    const delay = SYNCHRONIZATION.interpolationTicks * RACE.stepMs;
    const vertical = sync.sample(1250 + delay - 100)!.combat.projectiles[0];
    expect(vertical.x).toBeCloseTo(56);
    expect(vertical.y).toBeCloseTo(36);
    expect(vertical.angle).toBe(Math.PI / 2);
    expect(vertical.turns).toHaveLength(1);
    const horizontal = sync.sample(1250 + delay - 50)!.combat.projectiles[0];
    expect(horizontal.x).toBeCloseTo(58);
    expect(horizontal.y).toBeCloseTo(40);
    expect(horizontal.angle).toBe(0);
    expect(horizontal.turns).toHaveLength(2);
    expect([first, second]).toEqual(originals);
  });

  it('restores and round trips detached missile corner history and rejects invalid flight records', () => {
    const { game, map } = gameFixture({ protectionMs: 1000 });
    const checkpoint = game.snapshot();
    checkpoint.combat.projectiles = [{ id: 99, ownerId: 'alice', targetId: 'bob',
      x: 79, y: 88, angle: Math.PI, elapsedMs: 1100,
      turns: [{ x: 56, y: 24, angle: Math.PI / 2, elapsedMs: 225 },
        { x: 56, y: 56, angle: 0, elapsedMs: 225 + 1000 * 32 / 120 },
        { x: 88, y: 56, angle: Math.PI / 2, elapsedMs: 225 + 1000 * 64 / 120 },
        { x: 88, y: 88, angle: Math.PI, elapsedMs: 1025 }] }];
    checkpoint.combat.nextId = 100;
    game.restore(checkpoint);
    const restored = game.snapshot();
    const envelope = { type: 'snapshot', publication: 1, snapshot: encodeRaceSnapshot(map, restored),
      serverTimeMs: 0, instanceRunId: 'run', processGeneration: 'process' };
    const parsed = parseServerMessage(JSON.stringify(envelope));
    expect(parsed?.type === 'snapshot' && decodeRaceSnapshot(map, parsed.snapshot)).toEqual(restored);
    checkpoint.combat.projectiles[0].turns[0].x = -1;
    restored.combat.projectiles[0].turns[0].x = -2;
    expect(game.snapshot().combat.projectiles[0].turns[0].x).toBe(56);
    const diagonal = structuredClone(envelope);
    diagonal.snapshot.combat.projectiles[0].angle = Math.PI / 4;
    expect(parseServerMessage(JSON.stringify(diagonal))).toBeNull();
    const invalidCorner = structuredClone(envelope);
    invalidCorner.snapshot.combat.projectiles[0].turns[0].angle = Math.PI / 4;
    expect(parseServerMessage(JSON.stringify(invalidCorner))).toBeNull();
  });

  it('round trips weapon pickups, casts, inventory and acknowledgements through strict compact snapshots', () => {
    const { game, map } = gameFixture();
    game.equipPowerup('alice', 'laser'); game.activate('alice', 1, 1); game.step();
    game.equipPowerup('bob', 'blast');
    const snapshot = game.snapshot();
    const envelope = { type: 'snapshot', publication: 1, snapshot: encodeRaceSnapshot(map, snapshot),
      serverTimeMs: 0, instanceRunId: 'run', processGeneration: 'process' };
    const parsed = parseServerMessage(JSON.stringify(envelope));
    expect(parsed?.type === 'snapshot' && decodeRaceSnapshot(map, parsed.snapshot)).toEqual(snapshot);
    const command = { type: 'activate-powerup', matchId: 'weapons', sequence: 1, targetTick: 2 };
    expect(parseClientMessage(JSON.stringify(command))).toEqual(command);
    expect(parseClientMessage(JSON.stringify({ ...command, targetId: 'bob' }))).toBeNull();
    const forged = structuredClone(envelope); forged.snapshot.combat.casts[0].elapsedMs = -1;
    expect(parseServerMessage(JSON.stringify(forged))).toBeNull();
  });

  it('waits for activation acknowledgement without losing same-tick direction and samples stable effect IDs', () => {
    const { game, map } = gameFixture({ protectionMs: 1000 });
    game.equipPowerup('alice', 'blast');
    const sync = new MultiplayerSynchronization(); sync.acceptSnapshot(map, game.snapshot(), 'alice', 1, 0);
    const movement: unknown[] = [], activation: unknown[] = [];
    sync.submitDirection('right', 0, (command) => { movement.push(command); return true; });
    sync.submitPowerup(0, (command) => { activation.push(command); return true; });
    expect(movement).toHaveLength(1); expect(activation).toHaveLength(1);
    expect(sync.submitPowerup(0, () => true)).toBeNull();
    game.activate('alice', 1, 1); steps(game, 3);
    sync.acceptSnapshot(map, game.snapshot(), 'alice', 2, 50);
    expect(sync.sample(190)?.combat.casts[0].id).toBe(1);
    expect(sync.sample(200)?.combat.casts[0].id).toBe(1);
  });
});
