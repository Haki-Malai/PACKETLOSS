import { describe, expect, it } from 'vitest';
import { PACKET_PORTAL_BLINK, TILE_SIZE } from '../config/constants';
import { MOVEMENT_STEP_MS } from '../game/domain/services/MovementRules';
import type { Direction } from '../game/domain/valueObjects/Direction';
import { DataRace } from '../game/simulation/DataRace';
import { createMovement, move, position } from '../game/simulation/movement';
import { reconcileMovement } from '../game/simulation/prediction';
import { createEnemyWorld } from './fixtures/enemyFixtures';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

/** Creates matching authored square corridors with outward portals at both top corners. */
function worlds() {
  const local = createEnemyWorld(['P...P', '.###.', '.###.', '.###.', '.....'], [], { x: 0, y: 0 },
    [{ from: { x: 0, y: 0 }, to: { x: 4, y: 0 } }]);
  const map = dataRaceFixture();
  map.cells[0].edges.push({ to: 4, direction: 'left', portal: true });
  map.cells[4].edges.push({ to: 0, direction: 'right', portal: true });
  return { local, map };
}

describe('solo and online movement rules', () => {
  it('keeps an inward portal reversal committed while buffering a perpendicular turn', () => {
    const { local, map } = worlds();
    const actor = createMovement(0);
    const actions: Array<{ direction: Direction; distance: number; x: number; y: number; facing: Direction }> = [
      { direction: 'left', distance: 0.25, x: -0.25, y: 0, facing: 'left' },
      { direction: 'right', distance: 0.0625, x: -0.1875, y: 0, facing: 'right' },
      { direction: 'down', distance: 0.0625, x: -0.125, y: 0, facing: 'right' },
      { direction: 'down', distance: 0.125, x: 0, y: 0, facing: 'right' },
      { direction: 'down', distance: 0.0625, x: 0, y: 0.0625, facing: 'down' },
    ];
    for (const action of actions) {
      actor.queued = action.direction;
      move(map, actor, action.distance);
      local.world.packet.direction.next = action.direction;
      let remaining = action.distance * TILE_SIZE * MOVEMENT_STEP_MS;
      while (remaining > 1e-9) {
        const slice = local.packetMovement.getSimulationBoundaryMs(Math.min(remaining, MOVEMENT_STEP_MS));
        local.world.tick += 1;
        local.packetMovement.update(slice);
        remaining -= slice;
      }
      expect(position(map, actor)).toEqual({ x: action.x, y: action.y });
      expect({ x: local.world.packet.x / TILE_SIZE - 0.5, y: local.world.packet.y / TILE_SIZE - 0.5 })
        .toEqual({ x: action.x, y: action.y });
      expect(actor.direction).toBe(action.facing);
      expect(local.world.packet.direction.current).toBe(action.facing);
    }
  });

  it('restores and predicts a reversed portal without losing its queued turn', () => {
    const { map } = worlds();
    const game = new DataRace(map, 'reverse', [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 4);
    const player = game.snapshot().players.find((candidate) => candidate.slot === 0)!;
    game.input(player.id, 1, 'left');
    for (let tick = 0; tick < 4; tick += 1) game.step();
    game.input(player.id, 2, 'right'); game.step();
    game.input(player.id, 3, 'down');
    game.step(); // Save the consumed turn, not an input still waiting for its target tick.
    const saved = game.snapshot();
    const inward = saved.players.find((candidate) => candidate.id === player.id)!;
    const predicted = reconcileMovement(map, inward, saved.tick, saved.tick + 2, []);
    expect(position(map, predicted)).toEqual({ x: 0, y: 0 });
    game.restore(saved);
    for (let tick = 0; tick < 3; tick += 1) game.step();
    const advanced = game.snapshot().players.find((candidate) => candidate.id === player.id)!;
    const point = position(map, advanced.movement);
    expect(point.x).toBe(0);
    expect(point.y).toBeCloseTo(0.0625);
    expect(advanced.movement.direction).toBe('down');
    expect(advanced.portalBlinkMs).toBe(0);
  });

  it('teleports at the same half-tile threshold and starts the same portal blink', () => {
    const { local, map } = worlds();
    const game = new DataRace(map, 'portal', [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 4);
    const player = game.snapshot().players.find((candidate) => candidate.slot === 0)!;
    game.input(player.id, 1, 'left');
    local.world.packet.direction.next = 'left';
    for (let tick = 0; tick < 8; tick += 1) {
      game.step();
      local.world.tick += 1;
      local.packetMovement.update(MOVEMENT_STEP_MS);
    }
    const teleported = game.snapshot().players.find((candidate) => candidate.id === player.id)!;
    expect(position(map, teleported.movement)).toEqual({ x: 4, y: 0 });
    expect(local.world.packet.tile).toEqual({ x: 4, y: 0 });
    expect(local.world.packet.moved).toEqual({ x: 0, y: 0 });
    expect(teleported.portalBlinkMs).toBe(PACKET_PORTAL_BLINK.durationMs);
    expect(local.world.packet.portalBlinkRemainingMs).toBe(PACKET_PORTAL_BLINK.durationMs);
  });
});
