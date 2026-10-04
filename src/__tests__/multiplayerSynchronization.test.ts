import { describe, expect, it } from 'vitest';
import { DataRace } from '../game/simulation/DataRace';
import { createMovement, move, position } from '../game/simulation/movement';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

/** Starts an authored corridor scenario with an independently known half-tile position. */
function scenario() {
  const map = dataRaceFixture();
  const race = new DataRace(map, 'scheduled', [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 1);
  const state = race.snapshot();
  state.tick = 100;
  state.players[0].movement = createMovement(0);
  move(map, state.players[0].movement, 0.5);
  race.restore(state);
  return { map, race, id: state.players[0].id };
}

describe('scheduled multiplayer input', () => {
  it('consumes only the final same-tick intent before moving and acknowledges after the step', () => {
    const { map, race, id } = scenario();
    expect(race.input(id, 1, 'left', 101)).toBe(true);
    expect(race.input(id, 2, 'down', 101)).toBe(true);
    expect(race.snapshot().players[0].acknowledgedInput).toBe(0);
    race.step();
    expect(position(map, race.snapshot().players[0].movement)).toEqual({ x: 0.5625, y: 0 });
    expect(race.snapshot().players[0].acknowledgedInput).toBe(2);
  });

  it('exposes terminal movement freeze while leaving explicit solo practice movable', () => {
    const { race, id } = scenario();
    const other = race.snapshot().players.find((player) => player.id !== id)!;
    race.eliminate(other.id);
    expect(race.snapshot()).toMatchObject({ phase: 'playing', movementEnabled: false });
    const solo = new DataRace(dataRaceFixture(), 'solo', [{ id, name: 'A' }], 1, 0, true);
    expect(solo.snapshot().movementEnabled).toBe(true);
  });

  it('bounds future scheduling and discards unconsumed inputs on disconnect', () => {
    const { race, id } = scenario();
    expect(race.input(id, 1, 'left', 125)).toBe(false);
    expect(race.input(id, 1, 'left', 124)).toBe(true);
    expect(race.input(id, 2, 'down', 123)).toBe(false);
    race.disconnect(id);
    race.reconnect(id);
    expect(race.input(id, 1, 'right', 101)).toBe(true);
    race.step();
    expect(race.snapshot().players[0].acknowledgedInput).toBe(1);
  });

  it('collapses late bursts onto the next step without retroactive travel', () => {
    const { race, id, map } = scenario();
    expect(race.input(id, 1, 'left', 90)).toBe(true);
    expect(race.input(id, 2, 'right', 91)).toBe(true);
    expect(race.input(id, 2, 'left', 102)).toBe(false);
    expect(race.tick).toBe(100);
    expect(position(map, race.snapshot().players[0].movement).x).toBe(0.5);
    race.step();
    expect(position(map, race.snapshot().players[0].movement).x).toBeCloseTo(0.5625);
    expect(race.snapshot().players[0].acknowledgedInput).toBe(2);
  });

  it('accepts at most the bounded scheduling horizon without granting message-driven movement', () => {
    const { race, id, map } = scenario();
    for (let step = 1; step <= 24; step += 1) expect(race.input(id, step, 'right', 100 + step)).toBe(true);
    expect(race.input(id, 25, 'right', 125)).toBe(false);
    expect(race.input(id, 25, 'right', 124.5)).toBe(false);
    expect(position(map, race.snapshot().players[0].movement).x).toBe(0.5);
    for (let step = 1; step <= 24; step += 1) {
      race.step();
      expect(race.snapshot().players[0].acknowledgedInput).toBe(step);
    }
    expect(position(map, race.snapshot().players[0].movement).x).toBeCloseTo(2);
  });
});
