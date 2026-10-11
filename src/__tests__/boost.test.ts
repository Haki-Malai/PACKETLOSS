import { describe, expect, it } from 'vitest';
import { DataRace } from '../game/simulation/DataRace';
import { createMovement, position, type MovementTeleport } from '../game/simulation/movement';
import { powerupMovementLockTick, reconcilePlayer, sampleRemoteActor } from '../game/simulation/prediction';
import { advanceBoost } from '../game/simulation/boost';
import { POWERUP_RULES } from '../game/shared/offensivePowerups';
import { createBattleArenaMap } from '../game/simulation/BattleArenaMap';
import { RACE, type Direction, type RaceMap } from '../game/simulation/types';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

/** Authors a long straight corridor with the other participant and pickup away from the test route. */
function corridor(): RaceMap {
    const cells = Array.from({ length: 20 }, (_, x) => ({ x, y: 0,
        edges: [
            ...(x > 0 ? [{ to: x - 1, direction: 'left' as const }] : []),
            ...(x < 19 ? [{ to: x + 1, direction: 'right' as const }] : []),
        ],
    }));
    cells.push({ x: 0, y: 2, edges: [] });
    return { id: 'boost-corridor', width: 20, height: 3, cells, spawns: [0, 20, 10, 15],
        enemyHome: 20, pickups: [{ id: 19, cell: 19, kind: 'bit' }] };
}

/** Restores a public replay scenario with enough earned score to measure the price independently. */
function scenario(score = 100, map = corridor(), direction: Direction = 'right') {
    const game = new DataRace(map, 'boost', [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 4);
    const state = game.snapshot();
    state.players[0].score = score;
    state.players[0].movement = createMovement(map.spawns[0], direction);
    game.restore(state);
    return { game, map, id: state.players[0].id };
}

/** Advances the authoritative fixed clock by a known number of ticks. */
function steps(game: DataRace, count: number): void {
    for (let tick = 0; tick < count; tick += 1) game.step();
}

describe('Battle Royale paid boost', () => {
    it('preserves a same-tick tap, doubles exactly 125 ms of travel, and spends five points', () => {
        const { game, map, id } = scenario();
        const normal = scenario();
        expect(game.input(id, 1, undefined, 1, 'press')).toBe(true);
        expect(game.input(id, 2, undefined, 1, 'release')).toBe(true);
        expect(game.snapshot().players[0].boosting).toBe(false);
        const tap = [{ sequence: 1, targetTick: 1, boost: 'press' as const },
            { sequence: 2, targetTick: 1, boost: 'release' as const }];
        const atMinimum = reconcilePlayer(map, game.snapshot().players[0], 0, 7.5, tap);
        expect(position(map, atMinimum.movement).x).toBeCloseTo(0.9375, 10);
        expect(position(map, atMinimum.movement).y).toBe(0);
        expect(atMinimum).toMatchObject({ score: 95, boosting: false, boostTicks: 0, boostCostTicks: 0 });
        steps(game, 7);
        expect(game.snapshot().players[0]).toMatchObject({ score: 96, boosting: true, boostTicks: 0.5 });
        game.step();
        steps(normal.game, 8);
        expect(position(map, game.snapshot().players[0].movement).x).toBeCloseTo(0.96875, 10);
        expect(position(map, game.snapshot().players[0].movement).y).toBe(0);
        expect(position(map, normal.game.snapshot().players[0].movement).x).toBeCloseTo(0.5, 10);
        expect(position(map, normal.game.snapshot().players[0].movement).y).toBe(0);
        expect(game.snapshot().players[0]).toMatchObject({ score: 95, boosting: false,
            boostHeld: false, boostTicks: 0, boostCostTicks: 0, acknowledgedInput: 2 });
        expect(game.snapshot().pickups).toEqual(map.pickups);
    });

    it('holds twice-normal speed for a second without stacking and stops on release after the minimum', () => {
        const { game, map, id } = scenario();
        game.input(id, 1, undefined, 1, 'press');
        game.input(id, 2, undefined, 1, 'press');
        steps(game, 60);
        expect(position(map, game.snapshot().players[0].movement)).toEqual({ x: 7.5, y: 0 });
        expect(game.snapshot().players[0]).toMatchObject({ score: 60, boosting: true, boostTicks: 0 });
        game.input(id, 3, undefined, 61, 'release');
        game.step();
        expect(position(map, game.snapshot().players[0].movement).x).toBe(7.5625);
        expect(game.snapshot().players[0]).toMatchObject({ score: 60, boosting: false });
    });

    it('expires a blocked tap without spending any points or passing through the wall', () => {
        const { game, map, id } = scenario(100, corridor(), 'up');
        game.input(id, 1, undefined, 1, 'press');
        game.input(id, 2, undefined, 1, 'release');
        steps(game, 8);
        expect(position(map, game.snapshot().players[0].movement)).toEqual({ x: 0, y: 0 });
        expect(game.snapshot().players[0]).toMatchObject({ score: 100, boosting: false, boostCostTicks: 0 });
    });

    it('charges only travel before a wall and retains that fraction until movement resumes', () => {
        const map = corridor();
        map.pickups = [{ id: 0, cell: 0, kind: 'bit' }];
        const { game, id } = scenario(100, map);
        const state = game.snapshot();
        state.players[0].movement = { ...createMovement(18), to: 19, progress: 0.9375 };
        game.restore(state);
        game.input(id, 1, undefined, 1, 'press');
        game.step();
        expect(position(map, game.snapshot().players[0].movement)).toEqual({ x: 19, y: 0 });
        expect(game.snapshot().players[0].score).toBe(100);
        expect(game.snapshot().players[0].boostCostTicks).toBeCloseTo(0.5, 10);
        steps(game, 60);
        expect(game.snapshot().players[0]).toMatchObject({ score: 100, boosting: true });
        expect(game.snapshot().players[0].boostCostTicks).toBeCloseTo(0.5, 10);
        game.input(id, 2, 'left', 62);
        game.step();
        expect(position(map, game.snapshot().players[0].movement)).toEqual({ x: 18.875, y: 0 });
        expect(game.snapshot().players[0]).toMatchObject({ score: 99, boostCostTicks: 0 });
    });

    it.each([false, true])('does not charge a laser-locked boost (held: %s), including predicted frames', (held) => {
        const { game, map, id } = scenario();
        expect(game.equipPowerup(id, 'laser')).toBe(true);
        expect(game.activate(id, 1, 1)).toBe(true);
        game.input(id, 1, undefined, 1, 'press');
        if (!held) game.input(id, 2, undefined, 1, 'release');
        game.step();
        const confirmed = game.snapshot();
        const predicted = reconcilePlayer(map, confirmed.players[0], 1, 9, [], powerupMovementLockTick(confirmed, id));
        expect(position(map, predicted.movement)).toEqual({ x: 0, y: 0 });
        expect(predicted).toMatchObject({ score: 100, boostCostTicks: 0, boostTicks: 0, boosting: held });
        steps(game, Math.round(POWERUP_RULES.laser.durationMs / RACE.stepMs) - 1);
        expect(position(map, game.snapshot().players[0].movement)).toEqual({ x: 0, y: 0 });
        expect(game.snapshot().players[0]).toMatchObject({ score: 100, boostCostTicks: 0, boostTicks: 0, boosting: held });
        game.step();
        expect(position(map, game.snapshot().players[0].movement).x).toBeCloseTo(held ? 0.125 : 0.0625, 10);
        expect(game.snapshot().players[0]).toMatchObject({ score: 100, boostCostTicks: held ? 1 : 0 });
    });

    it('keeps a confirmed remote held boost active at a wall without inventing score exhaustion', () => {
        const { game, map, id } = scenario(1, corridor(), 'up');
        game.input(id, 1, undefined, 1, 'press');
        game.step();
        const first = game.snapshot();
        steps(game, 12);
        const sampled = sampleRemoteActor([first, game.snapshot()], 10, id, map)!;
        expect(sampled).toMatchObject({ point: { x: 0, y: 0 }, moving: false,
            player: { score: 1, boosting: true, boostCostTicks: 0, boostTicks: 0 } });
    });

    it('reports elapsed portal crossing time during a tick that ends its boost halfway through', () => {
        const map = corridor();
        map.cells[0].edges.push({ to: 10, direction: 'right', portal: true });
        const player = scenario(100, map).game.snapshot().players[0];
        player.movement = { ...createMovement(0), to: 10, progress: 0.84375 };
        Object.assign(player, { boosting: true, boostHeld: false, boostTicks: 0.5 });
        const crossings: MovementTeleport[] = [];
        advanceBoost(map, player, 1, false, (motion) => crossings.push(motion));
        expect(crossings).toHaveLength(1);
        expect(crossings[0].fraction).toBeCloseTo(0.75, 10);
        expect(position(map, player.movement).x).toBeCloseTo(10.015625, 10);
        expect(player).toMatchObject({ score: 100, boosting: false, boostCostTicks: 0.5, boostTicks: 0 });
    });

    it('cancels a minimum burst immediately and carries unpaid fractions into the next burst', () => {
        const { game, map, id } = scenario();
        game.input(id, 1, undefined, 1, 'press');
        steps(game, 2);
        game.input(id, 2, undefined, 3, 'cancel');
        game.step();
        expect(position(map, game.snapshot().players[0].movement).x).toBeCloseTo(0.3125);
        expect(game.snapshot().players[0]).toMatchObject({ score: 99, boosting: false,
            boostHeld: false, boostTicks: 0, boostCostTicks: 0.5 });
        game.input(id, 3, undefined, 4, 'press');
        game.step();
        expect(game.snapshot().players[0]).toMatchObject({ score: 98, boostCostTicks: 0 });
    });

    it('stops at zero and requires a fresh press after collecting more points', () => {
        const map = corridor();
        map.pickups.push({ id: 1, cell: 1, kind: 'bit' });
        const { game, id } = scenario(1, map);
        game.input(id, 1, undefined, 1, 'press');
        steps(game, 3);
        expect(game.snapshot().players[0]).toMatchObject({ score: 0, boosting: false, boostHeld: true });
        expect(position(map, game.snapshot().players[0].movement).x).toBeCloseTo(0.28125);
        steps(game, 6);
        expect(game.snapshot().players[0]).toMatchObject({ score: 10, boosting: false });
        game.input(id, 2, undefined, 10, 'press');
        game.step();
        expect(position(map, game.snapshot().players[0].movement).x).toBeCloseTo(0.71875);
        expect(game.snapshot().players[0].boosting).toBe(false);
        game.input(id, 3, undefined, 11, 'release');
        game.input(id, 4, undefined, 11, 'press');
        game.step();
        expect(position(map, game.snapshot().players[0].movement).x).toBeCloseTo(0.84375);
        expect(game.snapshot().players[0].boosting).toBe(true);
    });

    it('cannot start an unfunded burst', () => {
        const { game, map, id } = scenario(0);
        game.input(id, 1, undefined, 1, 'press');
        game.step();
        expect(position(map, game.snapshot().players[0].movement).x).toBeCloseTo(0.0625);
        expect(game.snapshot().players[0]).toMatchObject({ score: 0, boosting: false });
    });

    it('keeps queued corner turns while boosted', () => {
        const map = dataRaceFixture();
        map.pickups = [{ id: 7, cell: 7, kind: 'bit' }, { id: 12, cell: 12, kind: 'bit' }];
        const { game, id } = scenario(100, map);
        game.input(id, 1, undefined, 1, 'press');
        steps(game, 30);
        game.input(id, 2, 'down', 31);
        steps(game, 10);
        expect(position(map, game.snapshot().players[0].movement)).toEqual({ x: 4, y: 1 });
    });

    it('retains portal blinking, power-core awards, and personal power while boosted', () => {
        const map = dataRaceFixture();
        map.cells[4].edges.push({ to: 12, direction: 'right', portal: true });
        map.pickups = [{ id: 12, cell: 12, kind: 'core' }, { id: 7, cell: 7, kind: 'bit' }];
        const { game, id } = scenario(100, map);
        game.input(id, 1, undefined, 1, 'press');
        steps(game, 36);
        expect(position(map, game.snapshot().players[0].movement)).toEqual({ x: 0, y: 4 });
        expect(game.snapshot().players[0]).toMatchObject({ score: 126, huntMs: RACE.huntingMs,
            boosting: true, portalBlinkMs: 1500 });
    });

    it('clears boost across disconnect, reconnect, elimination, and abort without further spending', () => {
        const { game, id } = scenario();
        game.input(id, 1, undefined, 1, 'press');
        steps(game, 2);
        game.disconnect(id);
        expect(game.snapshot().players[0]).toMatchObject({ score: 99, boosting: false, boostHeld: false });
        game.reconnect(id);
        game.step();
        expect(game.snapshot().players[0]).toMatchObject({ score: 99, boosting: false });
        game.input(id, 2, undefined, 4, 'press');
        game.step();
        game.eliminate(id);
        expect(game.snapshot().players[0]).toMatchObject({ score: 98, boosting: false, boostTicks: 0 });
        game.abort('test');
        expect(game.snapshot().players.every((player) => !player.boosting && !player.boostHeld)).toBe(true);
    });

    it('ranks timeout survivors using their remaining score and freezes their boost', () => {
        const { game, id } = scenario();
        const state = game.snapshot();
        state.playTicks = RACE.matchTicks - 30;
        state.players[1].score = 95;
        game.restore(state);
        game.input(id, 1, undefined, 1, 'press');
        steps(game, 30);
        expect(game.snapshot()).toMatchObject({ phase: 'finished', rankings: [
            { playerId: state.players[1].id, score: 95, rank: 1 },
            { playerId: id, score: 80, rank: 2 },
        ] });
        expect(game.snapshot().players[0]).toMatchObject({ boosting: false, boostHeld: false });
    });

    it('does not grant collision immunity at an arena closure', () => {
        const map = createBattleArenaMap(7);
        const { game, id } = scenario(100, map);
        const state = game.snapshot();
        state.playTicks = RACE.shrinkEveryTicks - 1;
        const mouth = map.cells.findIndex((cell) => cell.x === 0 && cell.y === 25);
        state.players[0].movement = createMovement(mouth, 'left');
        game.restore(state);
        game.input(id, 1, undefined, 1, 'press');
        game.step();
        expect(game.snapshot().players[0]).toMatchObject({ eliminatedAtTick: 600,
            deathMs: RACE.deathMs, boosting: false, boostTicks: 0 });
    });

    it('replays the same budget and tap edges without mutating confirmed score or position', () => {
        const { game, map } = scenario(1);
        const player = game.snapshot().players[0];
        const predicted = reconcilePlayer(map, player, 100, 104, [
            { sequence: 1, targetTick: 101, boost: 'press' },
            { sequence: 2, targetTick: 101, boost: 'release' },
        ]);
        expect(position(map, predicted.movement).x).toBeCloseTo(0.34375);
        expect(predicted).toMatchObject({ score: 0, boosting: false, acknowledgedInput: 2 });
        expect(player.score).toBe(1);
        expect(position(map, player.movement).x).toBe(0);
    });
});
