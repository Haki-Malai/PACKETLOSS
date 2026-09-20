import { beforeEach, describe, expect, it } from 'vitest';
import { PacketEntity } from '../game/domain/entities/PacketEntity';
import { MovementRules } from '../game/domain/services/MovementRules';
import { WorldState } from '../game/domain/world/WorldState';
import { CollectibleSystem, type CollectiblePoint } from '../game/systems/CollectibleSystem';
import { ScoreBonusSystem } from '../game/systems/ScoreBonusSystem';
import { getGameState, getScoreBonusStatus, resetGameState } from '../state/gameState';
import { createCollisionTile, createMapFixture } from './fixtures/pointLayoutFixtures';

/** Builds a straight authored route with twenty real pickups and five preset bonus tiles. */
function createScenario() {
    const { map, collisionGrid } = createMapFixture([
        Array.from({ length: 20 }, () => createCollisionTile()),
    ]);
    const packet = new PacketEntity({ x: 0, y: 0 }, 10, 10);
    const movement = new MovementRules(16);
    movement.setEntityTile(packet, packet.tile);
    const world = new WorldState({
        map,
        collisionGrid,
        tileSize: 16,
        packet,
        packetSpawnTile: packet.tile,
        enemies: [],
        enemyJailBounds: { minX: 18, maxX: 18, y: 0 },
    });
    const points: CollectiblePoint[] = Array.from({ length: 20 }, (_, x) => ({
        tile: { x, y: 0 },
        x: x * 16 + 8,
        y: 8,
        kind: x === 2 ? 'power' : 'base',
    }));
    const collectibles = new CollectibleSystem(world, points);
    const bonuses = new ScoreBonusSystem(world, collectibles, [
        { x: 5, y: 0 }, { x: 8, y: 0 }, { x: 11, y: 0 }, { x: 14, y: 0 }, { x: 18, y: 0 },
    ]);
    /** Collects one tile and advances the bonus rules in runtime order. */
    const collect = (x: number) => {
        movement.setEntityTile(packet, { x, y: 0 });
        collectibles.update(0);
        bonuses.update(0);
    };
    return { world, movement, collectibles, bonuses, collect };
}

describe('ScoreBonusSystem', () => {
    beforeEach(() => resetGameState());

    it('places all five kinds immediately and keeps them until collected', () => {
        const { bonuses, collectibles, collect } = createScenario();
        expect(bonuses.getPickups()).toEqual([
            { kind: 'bug', multiplier: 1.5, x: 88, y: 8 },
            { kind: 'key', multiplier: 2, x: 136, y: 8 },
            { kind: 'cloud', multiplier: 2.5, x: 184, y: 8 },
            { kind: 'wifi', multiplier: 3, x: 232, y: 8 },
            { kind: 'chip', multiplier: 4, x: 296, y: 8 },
        ]);
        expect(getScoreBonusStatus()).toEqual({ phase: 'available', count: 5 });
        expect(getGameState().score).toBe(0);
        collect(0);
        expect(collectibles.getPointCount()).toBe(19);
        expect(bonuses.getPickups()).toHaveLength(5);
        bonuses.update(60_000);
        expect(bonuses.getPickups()).toHaveLength(5);
    });

    it('uses each icon factor and restarts the active timer on every pickup', () => {
        const { world, movement, bonuses } = createScenario();
        for (const [tile, kind, factor] of [
            [5, 'bug', 1.5], [8, 'key', 3], [11, 'cloud', 7.5],
            [14, 'wifi', 22.5], [18, 'chip', 90],
        ] as const) {
            movement.setEntityTile(world.packet, { x: tile, y: 0 });
            bonuses.update(1_000);
            expect(world.scoreBonusMultiplier).toBe(factor);
            expect(getScoreBonusStatus()).toMatchObject({ kind, multiplier: factor, seconds: 15 });
        }
    });

    it('multiplies a second active pickup, refreshes its timer, and freezes while paused', () => {
        const { world, movement, bonuses, collect } = createScenario();
        for (let x = 0; x < 6; x += 1) collect(x);
        expect(getGameState().score).toBe(100);
        expect(world.scoreBonusMultiplier).toBe(1.5);
        expect(getScoreBonusStatus()).toMatchObject({ kind: 'bug', phase: 'active', seconds: 15 });
        world.levelMultiplier = 1.25;
        const scoreBefore = getGameState().score;
        collect(6);
        expect(getGameState().score - scoreBefore).toBe(19);
        world.isMoving = false;
        bonuses.update(10_000);
        expect(getScoreBonusStatus()).toMatchObject({ seconds: 15 });
        world.isMoving = true;
        bonuses.update(1_000);
        expect(getScoreBonusStatus()).toMatchObject({ seconds: 14 });
        expect(bonuses.getPickups()).toHaveLength(4);
        movement.setEntityTile(world.packet, { x: 8, y: 0 });
        bonuses.update(0);
        expect(world.scoreBonusMultiplier).toBe(3);
        expect(getScoreBonusStatus()).toMatchObject({ kind: 'key', multiplier: 3, seconds: 15 });
        expect(bonuses.getPickups()).toHaveLength(3);
        const stackedScore = getGameState().score;
        collect(7);
        expect(getGameState().score - stackedScore).toBe(38);
        world.packet.deathAnimationRemainingMs = 900;
        bonuses.update(100);
        expect(world.scoreBonusMultiplier).toBe(1);
        expect(getScoreBonusStatus()).toEqual({ phase: 'available', count: 3 });
    });

    it('keeps uncollected icons through death and restores all five on the next level', () => {
        const { world, movement, bonuses, collectibles, collect } = createScenario();
        for (let x = 0; x < 6; x += 1) collect(x);
        world.packet.deathAnimationRemainingMs = 900;
        bonuses.update(60_000);
        expect(bonuses.getPickups().map((pickup) => pickup.kind)).toEqual(['key', 'cloud', 'wifi', 'chip']);
        expect(world.scoreBonusMultiplier).toBe(1);
        world.packet.deathAnimationRemainingMs = 0;
        for (let x = 6; x < 20; x += 1) collect(x);
        expect(collectibles.getPointCount()).toBe(0);
        expect(bonuses.getPickups()).toHaveLength(0);
        expect(world.scoreBonusMultiplier).toBe(1);
        collectibles.refill();
        bonuses.refill();
        expect(bonuses.getPickups().map((pickup) => pickup.kind))
            .toEqual(['bug', 'key', 'cloud', 'wifi', 'chip']);
        movement.setEntityTile(world.packet, { x: 5, y: 0 });
        bonuses.update(0);
        expect(world.scoreBonusMultiplier).toBe(1.5);
    });

    it('starts a fresh factor when the first boost expires before the second pickup', () => {
        const { world, movement, bonuses, collect } = createScenario();
        for (let x = 0; x < 6; x += 1) collect(x);
        expect(world.scoreBonusMultiplier).toBe(1.5);

        bonuses.update(15_000);

        expect(world.scoreBonusMultiplier).toBe(1);
        expect(getScoreBonusStatus()).toEqual({ phase: 'available', count: 4 });
        movement.setEntityTile(world.packet, { x: 8, y: 0 });
        bonuses.update(0);
        expect(world.scoreBonusMultiplier).toBe(2);
        expect(getScoreBonusStatus()).toMatchObject({ kind: 'key', multiplier: 2, seconds: 15 });
    });
});
