import { describe, expect, it } from 'vitest';
import { DataRace } from '../game/simulation/DataRace';
import { MultiplayerSynchronization } from '../game/simulation/MultiplayerSynchronization';
import { createMovement, move, position } from '../game/simulation/movement';
import { correctedPoint, RacePresentationClock, reconcileMovement, sampleRemoteActor } from '../game/simulation/prediction';
import { RACE, type RaceSnapshot, type ScheduledInput } from '../game/simulation/types';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

/** Exercises actual command delivery and server steps independently of client rendering. */
function scheduledNetwork(frameRate: number, uploadMs: number, downloadMs: number, boosting = false) {
  const map = dataRaceFixture();
  const race = new DataRace(map, 'network', [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 1);
  const id = race.snapshot().players[0].id;
  if (boosting) {
    const funded = race.snapshot();
    funded.players[0].score = 100;
    race.restore(funded);
  }
  const sync = new MultiplayerSynchronization();
  sync.observeRoundTrip(uploadMs + downloadMs);
  const states = new Map<number, RaceSnapshot>([[0, race.snapshot()]]);
  const snapshots = [{ at: downloadMs, state: race.snapshot(), publication: 1 }];
  const inputs: Array<{ at: number; command: ScheduledInput }> = [];
  const samples: Array<{ tick: number; x: number; y: number; discontinuity: boolean }> = [];
  let publication = 1, nextFrame = downloadMs, lastDelivery = downloadMs;
  for (let now = 0; now <= 2200; now += 1) {
    while (inputs[0] && inputs[0].at <= now) {
      const { command } = inputs.shift()!;
      expect(race.input(id, command.sequence, command.direction, command.targetTick, command.boost)).toBe(true);
    }
    while ((race.tick + 1) * RACE.stepMs <= now + 1e-8) {
      race.step();
      const state = race.snapshot();
      states.set(state.tick, state);
      if (state.tick % 3 === 0) {
        const jitter = [0, 8, -4, 12, -6][publication % 5];
        lastDelivery = Math.max(lastDelivery, now + Math.max(0, downloadMs + jitter));
        snapshots.push({ at: lastDelivery, state, publication: ++publication });
      }
    }
    while (snapshots[0] && snapshots[0].at <= now) {
      const delivery = snapshots.shift()!;
      sync.acceptSnapshot(map, delivery.state, id, delivery.publication, now);
    }
    if ([300, 500, 800, 1100].includes(now)) {
      const direction = now === 300 || now === 800 ? 'left' : 'right';
      expect(sync.submitDirection(direction, now, (command) => {
        inputs.push({ at: now + uploadMs + 5, command }); return true;
      })).not.toBeNull();
      if (boosting) {
        const actions = now === 300 ? ['press'] as const : now === 500 ? ['release'] as const
          : now === 800 ? ['press', 'release'] as const : ['cancel'] as const;
        for (const action of actions) {
          expect(sync.submitBoost(action, now, (command) => {
            inputs.push({ at: now + uploadMs + 5, command }); return true;
          })).not.toBeNull();
        }
      }
    }
    if (now >= nextFrame && now < 1900) {
      nextFrame += 1000 / frameRate;
      const frame = sync.sample(now);
      const actor = frame?.actors.get(id);
      if (frame && actor) {
        samples.push({ tick: frame.predictedTick, ...actor.point, discontinuity: actor.discontinuity });
        if (boosting) expect(actor.player.score).toBe(sync.history[sync.history.length - 1].players.find((player) => player.id === id)!.score);
      }
    }
  }
  for (const [index, sample] of samples.entries()) {
    const before = states.get(Math.floor(sample.tick))!;
    const after = states.get(Math.ceil(sample.tick))!;
    const a = position(map, before.players.find((player) => player.id === id)!.movement);
    const b = position(map, after.players.find((player) => player.id === id)!.movement);
    const fraction = sample.tick % 1;
    let expectedX = a.x + (b.x - a.x) * fraction;
    // This authored corridor ends at x=0 and x=4; a partial boost can shift either speed's wall arrival into mid-tick.
    if (a.x !== b.x && (b.x === 0 || b.x === 4)) {
      const speed = boosting && after.players.find((player) => player.id === id)!.boosting ? 0.125 : 0.0625;
      expectedX = Math.max(0, Math.min(4, a.x + Math.sign(b.x - a.x)
        * speed * fraction));
    }
    // A 125 ms tap ends halfway through its eighth tick: 0.125 tiles/tick, then 0.0625.
    const prior = before.players.find((player) => player.id === id)!;
    if (boosting && prior.boosting && !prior.boostHeld && prior.boostTicks === 0.5 && a.x !== b.x) {
      expectedX = Math.max(0, Math.min(4, a.x + Math.sign(b.x - a.x)
        * (0.125 * Math.min(fraction, 0.5) + 0.0625 * Math.max(0, fraction - 0.5))));
    }
    expect(sample.x).toBeCloseTo(expectedX, 7);
    expect(sample.y).toBeCloseTo(a.y + (b.y - a.y) * fraction, 7);
    expect(sample.discontinuity).toBe(index === 0);
  }
}

/** Returns a live controller and its authoritative authored-square scenario. */
function scenario() {
  const map = dataRaceFixture();
  const race = new DataRace(map, 'prediction', [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 1);
  const state = race.snapshot(), id = state.players[0].id;
  const sync = new MultiplayerSynchronization();
  sync.acceptSnapshot(map, state, id, 1, 0);
  return { map, race, state, id, sync };
}

describe('multiplayer prediction and presentation', () => {
  it.each([60, 120, 144])('keeps a steady clock through arrival jitter at %i Hz', (fps) => {
    const { state } = scenario();
    const arrivals = [0, 50, 135, 150, 210, 250, 335, 350, 400, 455, 530];
    const clock = new RacePresentationClock();
    const start = clock.sample(state, 0, 0, 100);
    let delivery = 0;
    for (let frame = 1; frame * 1000 / fps <= 500; frame += 1) {
      const now = frame * 1000 / fps;
      while (arrivals[delivery + 1] <= now) delivery += 1;
      const tick = clock.sample({ ...state, tick: delivery * 3 }, arrivals[delivery], now, delivery % 2 ? 90 : 110);
      expect(tick - start).toBeCloseTo(now / RACE.stepMs, 9);
    }
  });

  it('converges on lasting latency changes without an abrupt speed or position change', () => {
    const { state } = scenario();
    const clock = new RacePresentationClock();
    let previous = clock.sample(state, 0, 0, 100);
    for (let frame = 1; frame <= 600; frame += 1) {
      const now = frame * RACE.stepMs;
      const tick = Math.floor(frame / 3) * 3;
      const next = clock.sample({ ...state, tick }, tick * RACE.stepMs, now, 200);
      expect(next - previous).toBeGreaterThanOrEqual(0.98 - 1e-8);
      expect(next - previous).toBeLessThanOrEqual(1.02 + 1e-8);
      previous = next;
    }
    expect(Math.abs(previous - 612)).toBeLessThanOrEqual(3 + 1e-8);
  });

  it.each([60, 120, 144].flatMap((fps) => [[0, 0], [25, 25], [50, 50], [30, 170]].map(([up, down]) => [fps, up, down])))('matches corresponding authoritative ticks at %i Hz with %i/%i ms asymmetric delay and jitter', (fps, up, down) => {
    expect.hasAssertions();
    scheduledNetwork(fps, up, down);
  });

  it.each([60, 120, 144].flatMap((fps) => [[0, 0], [50, 50], [30, 170]].map(([up, down]) => [fps, up, down])))('replays paid boost taps/holds at %i Hz with %i/%i ms delay and jitter', (fps, up, down) => {
    expect.hasAssertions();
    scheduledNetwork(fps, up, down, true);
  });

  it('uses the same final intent for simultaneous changes, without rewriting a started partial step', () => {
    const { map, state, id, sync } = scenario();
    const commands: ScheduledInput[] = [];
    const before = sync.sample(5)!.actors.get(id)!.point;
    sync.submitDirection('left', 5, (input) => { commands.push(input); return true; });
    sync.submitDirection('down', 5, (input) => { commands.push(input); return true; });
    expect(commands[0].targetTick).toBe(commands[1].targetTick);
    expect(sync.sample(5)!.actors.get(id)!.point).toEqual(before);
    const expected = reconcileMovement(map, state.players[0], 0, commands[0].targetTick, commands);
    expect(position(map, expected).x).toBeCloseTo(commands[0].targetTick / 16, 10);
    expect(position(map, expected).y).toBe(0);
  });

  it('holds terminal survivors, permits solo movement, and never records a failed send', () => {
    const { race, map, id, sync } = scenario();
    expect(sync.submitDirection('left', 0, () => false)).toBeNull();
    expect(sync.diagnostics.pendingInputs).toBe(0);
    race.eliminate(race.snapshot().players[1].id);
    sync.acceptSnapshot(map, race.snapshot(), id, 2, 0);
    expect(sync.sample(100)!.actors.get(id)!.point).toEqual({ x: 0, y: 0 });
    expect(sync.submitDirection('right', 100, () => true)).toBeNull();
    const solo = new DataRace(map, 'solo', [{ id, name: 'A' }], 1, 0, true);
    sync.acceptSnapshot(map, solo.snapshot(), id, 3, 100);
    expect(sync.sample(120)!.actors.get(id)!.point.x).toBeGreaterThan(0);
  });

  it('retains the private spending budget across incremental frames while showing confirmed score', () => {
    const { race, map, id, sync } = scenario();
    const funded = race.snapshot();
    funded.players[0].score = 1;
    race.restore(funded);
    sync.acceptSnapshot(map, funded, id, 2, 0);
    expect(sync.submitBoost('press', 0, () => true)).not.toBeNull();
    sync.sample(50);
    sync.sample(75);
    const actor = sync.sample(100)!.actors.get(id)!;
    expect(actor.point.x).toBeCloseTo(0.59375);
    expect(actor.player.score).toBe(1);
    expect(actor.player.boosting).toBe(false);
    expect(race.snapshot().players[0].score).toBe(1);
  });

  it('allows boost cancellation through a stalled stream and does not record failed boost sends', () => {
    const { race, map, id, sync } = scenario();
    const funded = race.snapshot();
    funded.players[0].score = 100;
    map.pickups = [{ id: 5, cell: 5, kind: 'bit' }];
    funded.pickups = map.pickups.map((pickup) => ({ ...pickup }));
    race.restore(funded);
    sync.acceptSnapshot(map, funded, id, 2, 0);
    expect(sync.submitBoost('press', 0, () => false)).toBeNull();
    expect(sync.diagnostics.pendingInputs).toBe(0);
    const commands: ScheduledInput[] = [];
    sync.submitBoost('press', 0, (command) => { commands.push(command); return true; });
    race.input(id, commands[0].sequence, undefined, commands[0].targetTick, commands[0].boost);
    for (let tick = 0; tick < commands[0].targetTick; tick += 1) race.step();
    expect(race.snapshot().players[0].boosting).toBe(true);
    expect(sync.submitDirection('left', 2000, () => true)).toBeNull();
    expect(sync.submitBoost('press', 2000, () => true)).toBeNull();
    expect(sync.submitBoost('cancel', 2000, (command) => { commands.push(command); return true; })).not.toBeNull();
    expect(race.input(id, commands[1].sequence, undefined, commands[1].targetTick, commands[1].boost)).toBe(true);
    race.step();
    expect(race.snapshot().players[0]).toMatchObject({ boosting: false, boostHeld: false,
      boostTicks: 0, score: 100, acknowledgedInput: commands[1].sequence });
  });

  it('bounds a stalled stream, then rebases without treating recovery correction as a camera teleport', () => {
    const { race, map, id, sync } = scenario();
    sync.sample(0);
    const stalled = sync.sample(500)!;
    expect(stalled.stalled).toBe(true);
    expect(stalled.actors.get(id)!.point.x).toBe(1.5);
    expect(sync.sample(2000)!.actors.get(id)!.point).toEqual(stalled.actors.get(id)!.point);
    expect(sync.submitDirection('left', 2000, () => true)).toBeNull();
    for (let i = 0; i < 60; i += 1) race.step();
    sync.acceptSnapshot(map, race.snapshot(), id, 2, 2000);
    expect(sync.sample(2000)!.actors.get(id)!.discontinuity).toBe(false);
    sync.resetPresentation();
    expect(sync.sample(2001)!.actors.get(id)!.discontinuity).toBe(true);
  });

  it('accepts newer same-tick publications and ignores duplicate, older, and backwards state', () => {
    const { map, state, id, sync } = scenario();
    const frozen = { ...state, movementEnabled: false };
    expect(sync.acceptSnapshot(map, frozen, id, 2, 0)).toBe(true);
    expect(sync.acceptSnapshot(map, state, id, 1, 0)).toBe(false);
    expect(sync.acceptSnapshot(map, state, id, 2, 0)).toBe(false);
    sync.acceptSnapshot(map, { ...state, tick: 4 }, id, 3, 10);
    expect(sync.acceptSnapshot(map, state, id, 4, 11)).toBe(false);
  });

  it('rounds remote corners through the shared center and samples facing/effects at the same time', () => {
    const { map, state, id } = scenario();
    const first = structuredClone(state), second = structuredClone(state);
    first.tick = 10; second.tick = 14;
    first.players[0].movement = { cell: 3, to: 4, progress: 0.875, direction: 'right', queued: 'down' };
    second.players[0].movement = { cell: 4, to: 5, progress: 0.125, direction: 'down', queued: 'down' };
    first.players[0].huntMs = 100; second.players[0].huntMs = 2000;
    const early = sampleRemoteActor([first, second], 11, id, map)!;
    expect(early.point).toEqual({ x: 3.9375, y: 0 });
    expect(early.player.movement.direction).toBe('right');
    expect(early.player.huntMs).toBeCloseTo(100 - RACE.stepMs);
    expect(sampleRemoteActor([first, second], 12, id, map)!.point).toEqual({ x: 4, y: 0 });
    const late = sampleRemoteActor([first, second], 13, id, map)!;
    expect(late.point).toEqual({ x: 4, y: 0.0625 });
    expect(late.player.movement.direction).toBe('down');
    expect(sampleRemoteActor([first, second], 14, id, map)!.player.huntMs).toBe(2000);
  });

  it('holds remote endpoints across portals and advances death only on its confirmed timeline', () => {
    const { map, state, id } = scenario();
    map.cells[0].edges.push({ to: 8, direction: 'left', portal: true });
    const first = structuredClone(state), second = structuredClone(state);
    first.tick = 10; second.tick = 13;
    first.players[0].movement = { cell: 0, to: 8, progress: 0.5, direction: 'left', queued: 'left' };
    second.players[0].movement = createMovement(8, 'left');
    second.players[0].eliminatedAtTick = 13; second.players[0].deathMs = RACE.deathMs;
    expect(sampleRemoteActor([first, second], 12, id, map)!.point).toEqual({ x: -0.25, y: 0 });
    expect(sampleRemoteActor([first, second], 12, id, map)!.player.deathMs).toBe(0);
    expect(sampleRemoteActor([first, second], 13, id, map)!.point).toEqual({ x: 4, y: 4 });
    expect(sampleRemoteActor([first, second], 13, id, map)!.player.deathMs).toBe(RACE.deathMs);
  });

  it('discards removed-corridor history per actor while preserving valid shrink interpolation', () => {
    const { map, state, id } = scenario();
    const first = structuredClone(state), second = structuredClone(state);
    first.tick = 10; second.tick = 13; second.shrinkStage = 1;
    first.players[0].movement = { cell: 3, to: 4, progress: 0.25, direction: 'right', queued: 'right' };
    second.players[0].movement = createMovement(3);
    first.players[1].movement = { cell: 0, to: 1, progress: 0.25, direction: 'right', queued: 'right' };
    second.players[1].movement = { ...first.players[1].movement, progress: 0.4375 };
    map.cells[3].edges = map.cells[3].edges.filter((edge) => edge.to !== 4);
    map.cells[4].edges = map.cells[4].edges.filter((edge) => edge.to !== 3);
    expect(sampleRemoteActor([first, second], 11, id, map)!.point).toEqual({ x: 3, y: 0 });
    expect(sampleRemoteActor([first, second], 11, first.players[1].id, map)!.point).toEqual({ x: 0.3125, y: 0 });
  });

  it('clamps correction at walls and discards unsafe corner offsets', () => {
    const { map } = scenario();
    const actor = createMovement(3); move(map, actor, 0.75);
    expect(correctedPoint(map, actor, position(map, actor), { x: 0.5, y: 0 })).toEqual({ x: 4, y: 0 });
    expect(correctedPoint(map, actor, position(map, actor), { x: 0.2, y: 0.2 })).toBeNull();
  });
});
