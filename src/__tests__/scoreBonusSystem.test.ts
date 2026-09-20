import { beforeEach, describe, expect, it } from 'vitest';
import { PacketEntity } from '../game/domain/entities/PacketEntity';
import { MovementRules } from '../game/domain/services/MovementRules';
import { WorldState } from '../game/domain/world/WorldState';
import { CollectibleSystem, type CollectiblePoint } from '../game/systems/CollectibleSystem';
import { ScoreBonusSystem } from '../game/systems/ScoreBonusSystem';
import { getGameState, getScoreBonusStatus, resetGameState } from '../state/gameState';
import { createCollisionTile, createMapFixture } from './fixtures/pointLayoutFixtures';

/** Builds a straight authored route with twenty real pickups and a fixed central bonus tile. */
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
    const bonuses = new ScoreBonusSystem(world, collectibles);
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

    it('spawns at exact collectible milestones, queues the second icon, and awards no instant points', () => {
        const { bonuses, collectibles, collect } = createScenario();
        for (let x = 0; x < 6; x += 1) collect(x);
        expect(bonuses.getPickup()).toBeNull();
        const scoreBefore = getGameState().score;
        collect(6);
        expect(getGameState().score).toBe(scoreBefore + 10);
        expect(collectibles.getPointCount()).toBe(13);
        expect(bonuses.getPickup()).toMatchObject({
            kind: 'bug',
            x: 296,
            y: 8,
            remainingMs: 45_000,
        });
        for (let x = 7; x < 14; x += 1) collect(x);
        expect(bonuses.getPickup()?.kind).toBe('bug');
        bonuses.update(45_000);
        expect(bonuses.getPickup()).toMatchObject({ kind: 'bug', x: 296, remainingMs: 45_000 });
        expect(collectibles.getPointCount()).toBe(6);
    });

    it('boosts combined awards once, refreshes without stacking, and freezes while paused', () => {
        const { world, movement, bonuses, collect } = createScenario();
        for (let x = 0; x < 7; x += 1) collect(x);
        movement.setEntityTile(world.packet, { x: 18, y: 0 });
        bonuses.update(0);
        expect(world.scoreBonusMultiplier).toBe(1.5);
        expect(getScoreBonusStatus()).toMatchObject({ kind: 'bug', phase: 'active', seconds: 15 });
        world.levelMultiplier = 1.25;
        const scoreBefore = getGameState().score;
        collect(7);
        expect(getGameState().score - scoreBefore).toBe(19);
        world.isMoving = false;
        bonuses.update(10_000);
        expect(getScoreBonusStatus()?.seconds).toBe(15);
        world.isMoving = true;
        bonuses.update(1_000);
        expect(getScoreBonusStatus()?.seconds).toBe(14);
        for (let x = 8; x < 14; x += 1) collect(x);
        movement.setEntityTile(world.packet, { x: 18, y: 0 });
        bonuses.update(0);
        expect(world.scoreBonusMultiplier).toBe(1.5);
        expect(getScoreBonusStatus()?.seconds).toBe(15);
        world.packet.deathAnimationRemainingMs = 900;
        bonuses.update(100);
        expect(world.scoreBonusMultiplier).toBe(1);
        expect(getScoreBonusStatus()).toBeNull();
    });

    it('keeps an uncollected icon through death and resets cleanly on level clear and refill', () => {
        const { world, movement, bonuses, collectibles, collect } = createScenario();
        for (let x = 0; x < 7; x += 1) collect(x);
        movement.setEntityTile(world.packet, { x: 18, y: 0 });
        world.packet.deathAnimationRemainingMs = 900;
        bonuses.update(1_000);
        expect(bonuses.getPickup()?.remainingMs).toBe(44_000);
        expect(world.scoreBonusMultiplier).toBe(1);
        world.packet.deathAnimationRemainingMs = 0;
        for (let x = 7; x < 20; x += 1) collect(x);
        expect(collectibles.getPointCount()).toBe(0);
        expect(bonuses.getPickup()).toBeNull();
        expect(world.scoreBonusMultiplier).toBe(1);
        collectibles.refill();
        bonuses.refill();
        for (let x = 0; x < 7; x += 1) collect(x);
        expect(bonuses.getPickup()?.kind).toBe('key');
    });

    it('expires a collected boost after fifteen simulation seconds', () => {
        const { world, movement, bonuses, collect } = createScenario();
        for (let x = 0; x < 7; x += 1) collect(x);
        movement.setEntityTile(world.packet, { x: 18, y: 0 });
        bonuses.update(0);
        expect(world.scoreBonusMultiplier).toBe(1.5);

        bonuses.update(15_000);

        expect(world.scoreBonusMultiplier).toBe(1);
        expect(getScoreBonusStatus()).toBeNull();
    });
});
