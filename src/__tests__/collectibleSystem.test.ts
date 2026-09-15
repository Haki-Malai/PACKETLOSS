import { beforeEach, describe, expect, it } from 'vitest';
import { ENEMY_SCARED_DURATION_MS } from '../config/constants';
import { EnemyEntity } from '../game/domain/entities/EnemyEntity';
import { PacketEntity } from '../game/domain/entities/PacketEntity';
import { MovementRules } from '../game/domain/services/MovementRules';
import { WorldState } from '../game/domain/world/WorldState';
import { CollectibleSystem } from '../game/systems/CollectibleSystem';
import { getGameState, resetGameState } from '../state/gameState';
import { createCollisionTile, createMapFixture } from './fixtures/pointLayoutFixtures';

function createCollectibles(kind: 'pellet' | 'power-pellet' = 'pellet') {
  const { map, collisionGrid } = createMapFixture([[createCollisionTile(), createCollisionTile(), createCollisionTile()]]);
  map.collectibleObjects = [{ type: kind, x: 8, y: 8 }, { type: kind, x: 24, y: 8 }];
  const packet = new PacketEntity({ x: 0, y: 0 }, 10, 10);
  const movement = new MovementRules(16);
  movement.setEntityTile(packet, packet.tile);
  const enemies = (['virus', 'firewall'] as const).map((key) => new EnemyEntity({
    key, tile: { x: 2, y: 0 }, direction: 'left', speed: 1, displayWidth: 11, displayHeight: 11,
  }));
  const world = new WorldState({
    map, collisionGrid, tileSize: 16, packet, packetSpawnTile: packet.tile, enemies,
    enemyJailBounds: { minX: 2, maxX: 2, y: 0 },
  });
  return { world, movement, collectibles: new CollectibleSystem(world) };
}

describe('CollectibleSystem', () => {
  beforeEach(() => resetGameState(0, 3));

  it.each([
    { reason: 'horizontal movement in progress', movedX: 0.02, movedY: 0, x: 8.02, y: 8, tileX: 0 },
    { reason: 'vertical movement in progress', movedX: 0, movedY: 0.02, x: 8, y: 8.02, tileX: 0 },
    { reason: 'world position off center', movedX: 0, movedY: 0, x: 8.2, y: 8, tileX: 0 },
    { reason: 'world position on a different point tile', movedX: 0, movedY: 0, x: 8, y: 8, tileX: 1 },
  ])('waits for matching tile and center when there is $reason', ({ movedX, movedY, x, y, tileX }) => {
    const { world, movement, collectibles } = createCollectibles();
    Object.assign(world.packet, { x, y, tile: { x: tileX, y: 0 }, moved: { x: movedX, y: movedY } });

    collectibles.update(16);

    expect(getGameState().score).toBe(0);
    expect(collectibles.getPointCount()).toBe(2);
    expect(collectibles.getEatEffects()).toHaveLength(0);
    expect(world.packetAnimation.active).toBe(false);

    movement.setEntityTile(world.packet, { x: 0, y: 0 });
    collectibles.update(16);

    expect(getGameState().score).toBe(10);
    expect(Array.from(collectibles.getPoints()).map((point) => point.tile)).toEqual([{ x: 1, y: 0 }]);
    expect(world.packetAnimation.active).toBe(true);
  });

  it('scores each pellet once and lets its collection effect expire without consuming another point', () => {
    const { world, collectibles } = createCollectibles();
    collectibles.update(0);
    const effect = collectibles.getEatEffects()[0];
    expect(effect).toMatchObject({ x: 8, y: 8, elapsedMs: 0 });
    expect(world.packetAnimation.active).toBe(true);
    expect(getGameState().score).toBe(10);

    collectibles.update(effect.durationMs / 2);
    expect(collectibles.getEatEffects()).toHaveLength(1);
    expect(effect.elapsedMs).toBe(effect.durationMs / 2);
    collectibles.update(effect.durationMs / 2);

    expect(collectibles.getEatEffects()).toHaveLength(0);
    expect(collectibles.getPointCount()).toBe(1);
    expect(getGameState().score).toBe(10);
  });

  it.each([
    { kind: 'pellet' as const, expectedScore: 13 },
    { kind: 'power-pellet' as const, expectedScore: 63 },
  ])('rounds level-scaled $kind awards from their base value', ({ kind, expectedScore }) => {
    const { world, collectibles } = createCollectibles(kind);
    world.levelMultiplier = 1.25;

    collectibles.update(0);

    expect(getGameState().score).toBe(expectedScore);
  });

  it('restores the exact initial layout and clears completed-level pickup effects', () => {
    const { world, movement, collectibles } = createCollectibles();
    collectibles.update(0);
    movement.setEntityTile(world.packet, { x: 1, y: 0 });
    collectibles.update(0);
    expect(collectibles.getPointCount()).toBe(0);
    expect(collectibles.getEatEffects()).toHaveLength(2);

    expect(collectibles.refill()).toBe(2);

    expect(Array.from(collectibles.getPoints()).map((point) => point.tile)).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
    expect(collectibles.getEatEffects()).toHaveLength(0);
  });

  it('does not start an eat animation at a centered tile with no collectible', () => {
    const { world, movement, collectibles } = createCollectibles();
    movement.setEntityTile(world.packet, { x: 2, y: 0 });
    collectibles.update(16);

    expect(getGameState().score).toBe(0);
    expect(world.packetAnimation.active).toBe(false);
    expect(collectibles.getEatEffects()).toHaveLength(0);
    expect(collectibles.getPointCount()).toBe(2);
  });

  it('scares only active enemies, then refreshes their warning window and resets the bonus chain', () => {
    const { world, movement, collectibles } = createCollectibles('power-pellet');
    const [activeEnemy, inactiveEnemy] = world.enemies;
    inactiveEnemy.active = false;
    world.enemyEatChainCount = 3;

    collectibles.update(16);

    expect(getGameState().score).toBe(50);
    expect(activeEnemy.state.scared).toBe(true);
    expect(world.enemyScaredTimers.get(activeEnemy)).toBe(ENEMY_SCARED_DURATION_MS);
    expect(inactiveEnemy.state.scared).toBe(false);
    expect(world.enemyScaredTimers.has(inactiveEnemy)).toBe(false);
    expect(world.enemyEatChainCount).toBe(0);

    world.enemyScaredTimers.set(activeEnemy, 200);
    world.enemyScaredWarnings.set(activeEnemy, { elapsedMs: 900, nextToggleAtMs: 1000, showBaseColor: true });
    world.enemyEatChainCount = 2;
    movement.setEntityTile(world.packet, { x: 1, y: 0 });
    collectibles.update(16);

    expect(getGameState().score).toBe(100);
    expect(world.enemyScaredTimers.get(activeEnemy)).toBe(ENEMY_SCARED_DURATION_MS);
    expect(world.enemyScaredWarnings.has(activeEnemy)).toBe(false);
    expect(world.enemyEatChainCount).toBe(0);
    expect(inactiveEnemy.state.scared).toBe(false);
  });

  it('keeps the development power override active when a real power core is collected', () => {
    const { world, collectibles } = createCollectibles('power-pellet');
    world.debugPowerOverrideEnabled = true;
    world.enemyScaredTimers.set(world.enemies[0], Number.POSITIVE_INFINITY);
    world.enemies[0].state.scared = true;

    collectibles.update(16);

    expect(world.debugPowerOverrideEnabled).toBe(true);
    expect(world.enemies.every((enemy) => enemy.state.scared)).toBe(true);
    expect(
      world.enemies.every(
        (enemy) => world.enemyScaredTimers.get(enemy) === Number.POSITIVE_INFINITY,
      ),
    ).toBe(true);
  });
});
