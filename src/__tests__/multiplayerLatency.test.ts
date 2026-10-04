import { describe, expect, it } from 'vitest';
import { DataRace } from '../game/simulation/DataRace';
import { position } from '../game/simulation/movement';
import {
  interpolateRemotePosition,
  LocalMovementPresentation,
  localPredictionTick,
  RacePresentationClock,
  reconcileMovement,
  type PredictedInput,
} from '../game/simulation/prediction';
import { RACE, type Direction, type RaceSnapshot } from '../game/simulation/types';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

interface Delivery {
  at: number;
  snapshot: RaceSnapshot;
}

interface StraightSample {
  now: number;
  point: { x: number; y: number };
  discontinuity: boolean;
}
const STRAIGHT_PRESENTATION_CASES = [60, 120, 144]
  .flatMap((frameRate) => [0, 1, 5].map((delay) => [frameRate, delay]));

/** Simulates ordered snapshot delivery, delayed input, jitter, and a reserved reconnect. */
function runLatencyScenario(roundTripMs: number): number {
  const map = dataRaceFixture();
  const race = new DataRace(map, `latency-${roundTripMs}`,
    [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11);
  for (let tick = 0; tick < RACE.countdownTicks; tick += 1) race.step();
  const safe = race.snapshot();
  safe.enemies.forEach((enemy) => { enemy.waitMs = 1_000_000; });
  race.restore(safe);
  const localId = safe.players.find((player) => player.slot === 0)!.id;
  const oneWayTicks = Math.max(1, Math.ceil(roundTripMs / 2 / RACE.stepMs));
  const jitter = [0, 1, -1, 2, -2];
  const turns = new Map<number, Direction>([[48, 'down'], [112, 'left'], [176, 'up']]);
  const inputs: Array<{ at: number; sequence: number; direction: Direction }> = [];
  const deliveries: Delivery[] = [];
  let latest = race.snapshot();
  let latestReceivedAt = 0;
  let lastDeliveryAt = 0;
  let sequence = 0;
  let pending: PredictedInput[] = [];
  let maximumError = 0;
  const clock = new RacePresentationClock();
  const presenter = new LocalMovementPresentation();

  for (let clientTick = 1; clientTick <= 252; clientTick += 1) {
    const turn = turns.get(clientTick);
    if (turn) {
      sequence += 1;
      pending.push({ sequence, tick: clock.sample(latest,
        latestReceivedAt * RACE.stepMs, clientTick * RACE.stepMs, roundTripMs), direction: turn });
      inputs.push({ at: clientTick + Math.max(1, oneWayTicks + jitter[sequence % jitter.length]),
        sequence, direction: turn });
    }
    for (const input of inputs.filter((candidate) => candidate.at === clientTick)) {
      expect(race.input(localId, input.sequence, input.direction)).toBe(true);
    }
    if (clientTick === 204) race.disconnect(localId);
    race.step();
    if (clientTick === 216) {
      race.reconnect(localId);
      pending = [];
      clock.reset(); presenter.reset();
      deliveries.length = 0;
      latest = race.snapshot();
      latestReceivedAt = clientTick;
      lastDeliveryAt = clientTick;
      const player = latest.players.find((candidate) => candidate.id === localId)!;
      expect(player.connected).toBe(true);
    }
    if (clientTick % 3 === 0 && clientTick < 204 || clientTick % 3 === 0 && clientTick > 216) {
      const delay = Math.max(1, oneWayTicks + jitter[(clientTick / 3) % jitter.length]);
      lastDeliveryAt = Math.max(lastDeliveryAt, clientTick + delay);
      deliveries.push({ at: lastDeliveryAt, snapshot: race.snapshot() });
    }
    while (deliveries[0]?.at === clientTick) {
      latest = deliveries.shift()!.snapshot;
      latestReceivedAt = clientTick;
    }
    const authoritative = race.snapshot().players.find((player) => player.id === localId)!;
    if (!authoritative.connected) continue;
    const local = latest.players.find((player) => player.id === localId)!;
    const predictedTick = clock.sample(latest, latestReceivedAt * RACE.stepMs,
      clientTick * RACE.stepMs, roundTripMs);
    const predicted = presenter.sample(map, latest, local, predictedTick, pending, clientTick * RACE.stepMs);
    pending = pending.filter((input) => input.sequence > local.acknowledgedInput);
    const expectedPoint = position(map, authoritative.movement);
    const predictedPoint = predicted.point;
    maximumError = Math.max(maximumError,
      Math.hypot(expectedPoint.x - predictedPoint.x, expectedPoint.y - predictedPoint.y));
  }
  return maximumError;
}

/** Samples one straight authoritative run with snapshots arriving between display frames. */
function runStraightPresentation(frameRate: number, deliveryDelayMs: number): StraightSample[] {
  const map = dataRaceFixture();
  const race = new DataRace(map, `straight-${frameRate}-${deliveryDelayMs}`,
    [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11);
  const safe = race.snapshot();
  safe.enemies.forEach((enemy) => { enemy.waitMs = 1_000_000; });
  race.restore(safe);
  const deliveries: Delivery[] = [{ at: deliveryDelayMs, snapshot: race.snapshot() }];
  for (let tick = 1; tick <= 42; tick += 1) {
    race.step();
    if (tick % 3 === 0) {
      deliveries.push({ at: tick * RACE.stepMs + deliveryDelayMs, snapshot: race.snapshot() });
    }
  }
  const localId = safe.players.find((player) => player.slot === 0)!.id;
  const clock = new RacePresentationClock();
  const presenter = new LocalMovementPresentation();
  const samples: StraightSample[] = [];
  let delivery = 0;
  for (let frame = 1; frame * 1000 / frameRate <= 600; frame += 1) {
    const now = frame * 1000 / frameRate;
    while (deliveries[delivery + 1]?.at <= now) delivery += 1;
    const latest = deliveries[delivery];
    const player = latest.snapshot.players.find((candidate) => candidate.id === localId)!;
    const tick = clock.sample(latest.snapshot, latest.at, now, deliveryDelayMs);
    const sample = presenter.sample(map, latest.snapshot, player, tick, [], now);
    samples.push({ now, point: sample.point, discontinuity: sample.discontinuity });
  }
  return samples;
}

describe('multiplayer prediction under network delay', () => {
  it.each([60, 120, 144])('keeps a steady %i Hz clock through snapshot and latency jitter', (frameRate) => {
    const race = new DataRace(dataRaceFixture(), 'clock-speed',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot();
    race.phase = 'playing';
    const arrivals = [0, 50, 135, 150, 210, 250, 335, 350, 400, 455, 530];
    const clock = new RacePresentationClock();
    let delivery = 0;
    const start = clock.sample(race, 0, 0, 100);
    for (let frame = 1; frame * 1000 / frameRate <= 500; frame += 1) {
      const now = frame * 1000 / frameRate;
      while (arrivals[delivery + 1] <= now) delivery += 1;
      const snapshot = { ...race, tick: delivery * 3 };
      const tick = clock.sample(snapshot, arrivals[delivery], now, delivery % 2 ? 90 : 110);
      expect(tick - start).toBeCloseTo(now / RACE.stepMs, 10);
    }
  });

  it.each([0, 200])('gradually resynchronizes a lasting latency change to %i ms', (leadMs) => {
    const race = new DataRace(dataRaceFixture(), 'clock-drift',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot();
    race.phase = 'playing';
    const clock = new RacePresentationClock();
    let previous = clock.sample(race, 0, 0, 100);
    let target = previous;
    for (let frame = 1; frame <= 600; frame += 1) {
      const now = frame * RACE.stepMs;
      const snapshot = { ...race, tick: Math.floor(frame / 3) * 3 };
      const tick = clock.sample(snapshot, snapshot.tick * RACE.stepMs, now, leadMs);
      expect(tick - previous).toBeGreaterThanOrEqual(0.98 - 1e-9);
      expect(tick - previous).toBeLessThanOrEqual(1.02 + 1e-9);
      target = frame + leadMs / RACE.stepMs;
      previous = tick;
    }
    expect(Math.abs(previous - target)).toBeLessThanOrEqual(3 + 1e-9);
  });

  it.each(STRAIGHT_PRESENTATION_CASES)(
    'preserves straight-line speed at %i Hz with %i ms snapshot delivery', (frameRate, delay) => {
    const samples = runStraightPresentation(frameRate, delay);
    samples.forEach((sample, index) => {
      expect(sample.point.x).toBeCloseTo(RACE.playerSpeed * sample.now / 1000, 10);
      expect(sample.point.y).toBe(0);
      expect(sample.discontinuity).toBe(index === 0);
      if (index > 0) {
        expect(sample.point.x - samples[index - 1].point.x)
          .toBeCloseTo(RACE.playerSpeed / frameRate, 10);
      }
    });
  });

  it.each([50, 100, 200])('keeps local prediction bounded at %i ms RTT with jitter and reconnect', (roundTripMs) => {
    expect(runLatencyScenario(roundTripMs)).toBeLessThan(1.25);
  });

  it.each([50, 100, 200])('keeps every 144 Hz movement frame advancing through jitter at %i ms RTT', (roundTripMs) => {
    const map = dataRaceFixture();
    const race = new DataRace(map, 'continuous-jitter',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11);
    for (let tick = 0; tick < RACE.countdownTicks; tick += 1) race.step();
    const deliveries = [0, 50, 135, 150, 210, 250, 335, 350, 400, 455, 530].map((at, index) => {
      if (index > 0) for (let step = 0; step < 3; step += 1) race.step();
      return { at, snapshot: race.snapshot() };
    });
    const localId = deliveries[0].snapshot.players.find((player) => player.slot === 0)!.id;
    const clock = new RacePresentationClock(), presenter = new LocalMovementPresentation();
    let delivery = 0, previous = 0;
    for (let frame = 0; frame <= 72; frame += 1) {
      const now = frame * 1000 / 144;
      while (deliveries[delivery + 1]?.at <= now) delivery += 1;
      const latest = deliveries[delivery];
      const player = latest.snapshot.players.find((candidate) => candidate.id === localId)!;
      const tick = clock.sample(latest.snapshot, latest.at, now, roundTripMs);
      const point = presenter.sample(map, latest.snapshot, player, tick, [], now).point;
      if (now >= 100) {
        expect(point.x - previous).toBeCloseTo(RACE.playerSpeed / 144, 10);
      }
      expect(point.y).toBe(0);
      previous = point.x;
    }
  });

  it('advances a remote actor smoothly between 20 Hz snapshots on a 100 ms delay', () => {
    const map = dataRaceFixture();
    const race = new DataRace(map, 'interpolation',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11);
    const first = race.snapshot(), second = race.snapshot();
    first.tick = 100; second.tick = 103;
    const id = first.players[0].id;
    first.players[0].movement = { cell: 0, to: 1, progress: 0, direction: 'right', queued: 'right' };
    second.players[0].movement = { ...first.players[0].movement, progress: 0.75 };
    const clock = new RacePresentationClock();
    const target = clock.sample({ ...second, tick: 106, phase: 'playing' }, 0, 25) - 6;
    const point = interpolateRemotePosition([first, second], target, id, false, map);
    expect(target).toBe(101.5);
    expect(point).toEqual({ x: 0.375, y: 0 });
  });

  it('stamps direction changes on their current local prediction ticks', () => {
    expect(localPredictionTick(100, 1_000, 1_000)).toBe(100);
    expect(localPredictionTick(100, 1_000, 1_034)).toBeCloseTo(102.04);
    expect(localPredictionTick(100, 1_000, 2_000)).toBe(124);
    const player = new DataRace(dataRaceFixture(), 'input-timing',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot().players[0];
    player.protectionMs = 0;
    const movement = reconcileMovement(dataRaceFixture(), player, 100, 103, [
      { sequence: 1, tick: 101, direction: 'right' },
      { sequence: 2, tick: 103, direction: 'down' },
    ]);
    expect(position(dataRaceFixture(), movement)).toEqual({ x: 3 / 16, y: 0 });
  });

  it('presents fractional movement at 144 Hz instead of repeating whole-tick positions', () => {
    const map = dataRaceFixture();
    const player = new DataRace(map, 'fractional',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot().players[0];
    const samples = [0, 1, 2, 3].map((frame) => position(map, reconcileMovement(map, player, 100,
      localPredictionTick(100, 0, frame * 1000 / 144), [])).x);
    samples.forEach((x, frame) => expect(x).toBeCloseTo(frame * RACE.playerSpeed / 144));
    const turn = reconcileMovement(map, player, 100, 100.5,
      [{ sequence: 1, tick: 100, direction: 'down' }]);
    expect(position(map, turn)).toEqual({ x: 0, y: 1 / 32 });
  });

  it('applies a reversal at its fractional input time without rewriting already presented travel', () => {
    const map = dataRaceFixture();
    const race = new DataRace(map, 'fractional-turn',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot();
    race.phase = 'playing'; race.tick = 100;
    const player = race.players.find((candidate) => candidate.slot === 0)!;
    const presenter = new LocalMovementPresentation();
    const before = presenter.sample(map, race, player, 100.5, [], 0).point;
    const after = presenter.sample(map, race, player, 100.75,
      [{ sequence: 1, tick: 100.5, direction: 'left' }], RACE.stepMs / 4).point;
    expect(before.x).toBeCloseTo(1 / 32);
    expect(before.x - after.x).toBeCloseTo(RACE.playerSpeed * RACE.stepMs / 4000);
  });

  it('compares newly acknowledged input from both authoritative bases at one presentation tick', () => {
    const map = dataRaceFixture();
    const first = new DataRace(map, 'acknowledged-reconciliation',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot();
    first.phase = 'playing'; first.tick = 100;
    first.players[0].movement = {
      cell: 0, to: 1, progress: 0.5, direction: 'right', queued: 'right',
    };
    const pending: PredictedInput[] = [{ sequence: 1, tick: 100.5, direction: 'left' }];
    const presenter = new LocalMovementPresentation();
    const before = presenter.sample(map, first, first.players[0], 101.5, pending, 0);
    expect(before.point.x).toBeCloseTo(0.46875);
    const acknowledged = structuredClone(first);
    acknowledged.tick = 102;
    acknowledged.players[0].acknowledgedInput = 1;
    acknowledged.players[0].movement = {
      cell: 1, to: 0, progress: 0.5625, direction: 'left', queued: 'left',
    };
    const after = presenter.sample(map, acknowledged, acknowledged.players[0], 102,
      pending, RACE.stepMs / 2);
    expect(after.point.x).toBeCloseTo(0.4375);
    expect(after.point.x).toBeLessThan(before.point.x);
    expect(after.discontinuity).toBe(false);
  });

  it('keeps remote motion forward across a delayed snapshot and holds the buffered endpoints', () => {
    const map = dataRaceFixture();
    const first = new DataRace(map, 'clock-jitter',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot();
    first.phase = 'playing'; first.tick = 100;
    first.players[0].movement = { cell: 0, to: 1, progress: 0, direction: 'right', queued: 'right' };
    const second = structuredClone(first);
    second.tick = 103; second.players[0].movement.progress = 3 / 16;
    const clock = new RacePresentationClock();
    clock.sample(first, 0, 0);
    let previous = 94;
    for (let now = 7; now <= 147; now += 7) {
      const tick = clock.sample(now < 105 ? first : second, now < 105 ? 0 : 105, now) - 6;
      expect(tick).toBeGreaterThan(previous);
      expect(tick - previous).toBeLessThanOrEqual(7 / RACE.stepMs * 1.1 + 1e-9);
      previous = tick;
    }
    const id = first.players[0].id;
    expect(interpolateRemotePosition([first, second], 90, id, false, map)).toEqual({ x: 0, y: 0 });
    expect(interpolateRemotePosition([first, second], 110, id, false, map)).toEqual({ x: 3 / 16, y: 0 });
  });

  it('eases a small correction while preserving new input and snaps death, respawn and rematches', () => {
    const map = dataRaceFixture();
    const first = new DataRace(map, 'correction',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot();
    first.phase = 'playing'; first.tick = 100;
    first.players[0].movement = { cell: 0, to: 1, progress: 0.5, direction: 'right', queued: 'right' };
    const presenter = new LocalMovementPresentation();
    const initial = presenter.sample(map, first, first.players[0], 103, [], 0);
    expect(initial.point.x).toBe(0.6875);
    expect(initial.discontinuity).toBe(true);
    const corrected = structuredClone(first);
    corrected.tick = 103; corrected.players[0].movement.progress = 0.6;
    const arrival = presenter.sample(map, corrected, corrected.players[0], 103, [], 0);
    expect(arrival.point.x).toBe(0.6875);
    expect(arrival.discontinuity).toBe(false);
    const moved = presenter.sample(map, corrected, corrected.players[0], 103.5,
      [{ sequence: 1, tick: 103, direction: 'left' }], RACE.stepMs / 2);
    expect(moved.movement.direction).toBe('left');
    expect(moved.point.x).toBeLessThan(arrival.point.x);
    expect(moved.discontinuity).toBe(false);
    const settled = presenter.sample(map, corrected, corrected.players[0], 115, [], 240);
    expect(Math.abs(settled.point.x - position(map, settled.movement).x)).toBeLessThan(0.005);
    const disconnected = structuredClone(corrected);
    disconnected.tick = 116; disconnected.players[0].connected = false;
    expect(presenter.sample(map, disconnected, disconnected.players[0], 116, [], 245).discontinuity)
      .toBe(true);
    const reconnected = structuredClone(disconnected);
    reconnected.tick = 117; reconnected.players[0].connected = true;
    reconnected.players[0].protectionMs = RACE.protectionMs;
    expect(presenter.sample(map, reconnected, reconnected.players[0], 117, [], 248).discontinuity)
      .toBe(true);
    const dead = structuredClone(corrected);
    dead.tick = 118; dead.players[0].deathMs = 900;
    const death = presenter.sample(map, dead, dead.players[0], 118, [], 250);
    expect(death.point).toEqual({ x: 0.6, y: 0 });
    expect(death.discontinuity).toBe(true);
    const respawn = structuredClone(dead);
    respawn.tick += 54; respawn.players[0].deathMs = 0;
    respawn.players[0].movement = { cell: 8, to: null, progress: 0, direction: 'right', queued: 'right' };
    const recovered = presenter.sample(map, respawn, respawn.players[0], respawn.tick, [], 260);
    expect(recovered.point).toEqual({ x: 4, y: 4 });
    expect(recovered.discontinuity).toBe(true);
    const rematch = structuredClone(first);
    rematch.matchId = 'next-match'; rematch.tick = 0; rematch.phase = 'countdown';
    const nextMatch = presenter.sample(map, rematch, rematch.players[0], 0, [], 270);
    expect(nextMatch.point).toEqual({ x: 0.5, y: 0 });
    expect(nextMatch.discontinuity).toBe(true);
  });

  it('clears correction on a shrink without snapping unless the player also teleports', () => {
    const map = dataRaceFixture();
    const first = new DataRace(map, 'shrink-camera',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot();
    first.phase = 'playing'; first.tick = 597;
    first.players[0].movement = { cell: 0, to: 1, progress: 0.5, direction: 'right', queued: 'right' };
    const presenter = new LocalMovementPresentation();
    presenter.sample(map, first, first.players[0], 599, [], 0);
    const corrected = structuredClone(first);
    corrected.tick = 599;
    corrected.players[0].movement.progress = 0.55;
    const beforeShrink = presenter.sample(map, corrected, corrected.players[0], 599, [], 16);
    expect(beforeShrink.point.x).toBeCloseTo(0.625);
    const shrunk = structuredClone(corrected);
    shrunk.tick = 600; shrunk.shrinkStage = 1;
    shrunk.players[0].movement.progress = 0.6125;
    const afterShrink = presenter.sample(map, shrunk, shrunk.players[0], 600, [], 32);
    expect(afterShrink.point.x).toBeCloseTo(0.6125);
    expect(afterShrink.discontinuity).toBe(false);
    const teleported = structuredClone(shrunk);
    teleported.tick = 601; teleported.shrinkStage = 2;
    teleported.players[0].movement = { cell: 8, to: null, progress: 0, direction: 'right', queued: 'right' };
    expect(presenter.sample(map, teleported, teleported.players[0], 601, [], 48).discontinuity).toBe(true);
  });

  it('clamps correction at a wall and clears it through a continuous perpendicular turn', () => {
    const map = dataRaceFixture();
    const first = new DataRace(map, 'corridor-correction',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot();
    first.phase = 'playing'; first.tick = 100;
    first.players[0].movement = {
      cell: 3, to: 4, progress: 0.95, direction: 'right', queued: 'right',
    };
    const presenter = new LocalMovementPresentation();
    presenter.sample(map, first, first.players[0], 100, [], 0);
    const corrected = structuredClone(first);
    corrected.players[0].movement.progress = 0.85;
    const arrival = presenter.sample(map, corrected, corrected.players[0], 100, [], 0);
    expect(arrival.point).toEqual({ x: 3.95, y: 0 });
    expect(arrival.discontinuity).toBe(false);
    const wall = presenter.sample(map, corrected, corrected.players[0], 103, [], 50);
    expect(wall.point).toEqual({ x: 4, y: 0 });
    expect(wall.discontinuity).toBe(false);
    const corner = presenter.sample(map, corrected, corrected.players[0], 104,
      [{ sequence: 1, tick: 103, direction: 'down' }], 60);
    expect(corner.point.x).toBe(4);
    expect(corner.point.y).toBeCloseTo(0.0625);
    expect(corner.discontinuity).toBe(false);
  });

  it('corrects a small corner disagreement without snapping the following camera', () => {
    const map = dataRaceFixture();
    const first = new DataRace(map, 'corner-camera',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot();
    first.phase = 'playing'; first.tick = 100;
    first.players[0].movement = {
      cell: 3, to: 4, progress: 0.95, direction: 'right', queued: 'down',
    };
    const presenter = new LocalMovementPresentation();
    presenter.sample(map, first, first.players[0], 100, [], 0);
    const corrected = structuredClone(first);
    corrected.tick = 101;
    corrected.players[0].movement.progress = 0.99;
    const arrival = presenter.sample(map, corrected, corrected.players[0], 101, [], RACE.stepMs);
    expect(arrival.point).toEqual({ x: 3.99, y: 0 });
    expect(arrival.discontinuity).toBe(false);
    const turned = presenter.sample(map, corrected, corrected.players[0], 102, [], 2 * RACE.stepMs);
    expect(turned.point.x).toBe(4);
    expect(turned.point.y).toBeCloseTo(0.0525);
    expect(turned.discontinuity).toBe(false);
  });

  it('drops correction offsets when predicted travel crosses a portal', () => {
    const map = dataRaceFixture();
    map.cells[0].edges.push({ to: 8, direction: 'left', portal: true });
    const race = new DataRace(map, 'portal-presentation',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot();
    race.phase = 'playing'; race.tick = 100;
    race.players[0].movement = { cell: 0, to: 8, progress: 0.75, direction: 'left', queued: 'left' };
    const presenter = new LocalMovementPresentation();
    presenter.sample(map, race, race.players[0], 100, [], 0);
    const corrected = structuredClone(race);
    corrected.tick = 101; corrected.players[0].movement.progress = 0.625;
    const arrival = presenter.sample(map, corrected, corrected.players[0], 101, [], RACE.stepMs);
    expect(arrival.point.x).toBe(-0.3125);
    expect(arrival.discontinuity).toBe(true);
    const teleported = presenter.sample(map, corrected, corrected.players[0], 105, [], RACE.stepMs * 5);
    expect(teleported.point).toEqual({ x: 3.9375, y: 4 });
    expect(teleported.discontinuity).toBe(true);
  });

  it('snaps when a newer snapshot exhausts the previous prediction history', () => {
    const map = dataRaceFixture();
    const first = new DataRace(map, 'prediction-history',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot();
    first.phase = 'playing'; first.tick = 100;
    first.players[0].movement = {
      cell: 0, to: 1, progress: 0.25, direction: 'right', queued: 'right',
    };
    const presenter = new LocalMovementPresentation();
    presenter.sample(map, first, first.players[0], 124, [], 0);
    const recovered = structuredClone(first);
    recovered.tick = 130;
    recovered.players[0].movement = {
      cell: 2, to: 3, progress: 0.125, direction: 'right', queued: 'right',
    };
    const sample = presenter.sample(map, recovered, recovered.players[0], 130, [], 100);
    expect(sample.point).toEqual({ x: 2.125, y: 0 });
    expect(sample.discontinuity).toBe(true);
  });

  it('bounds stalled prediction and resets the clock on visibility or match transitions', () => {
    const race = new DataRace(dataRaceFixture(), 'clock-reset',
      [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 11).snapshot();
    race.phase = 'playing'; race.tick = 200;
    const clock = new RacePresentationClock();
    expect(clock.sample(race, 0, 0, 100)).toBe(206);
    expect(clock.sample(race, 0, 2000, 100)).toBe(224);
    clock.reset();
    expect(clock.sample(race, 2000, 2000)).toBe(200);
    for (let frame = 1; frame <= 115; frame += 1) {
      clock.sample(race, 2000, 2000 + frame * 1000 / 144);
    }
    const recovered = { ...race, tick: 248 };
    expect(clock.sample(recovered, 2800, 2800)).toBe(248);
    expect(clock.sample(recovered, 2800, 2800 + RACE.stepMs / 2)).toBeGreaterThan(248);
    const rematch = { ...race, matchId: 'next', tick: 0, phase: 'countdown' as const };
    expect(clock.sample(rematch, 2810, 2810)).toBe(0);
  });
});
