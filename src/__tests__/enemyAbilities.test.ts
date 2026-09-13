import { beforeEach, describe, expect, it } from 'vitest';
import { ENEMY_CONFIG } from '../config/constants';
import { clearAllGhostScaredWindow, setActiveGhostsScaredWindow } from '../game/domain/services/GhostScaredStateService';
import { AnimationSystem } from '../game/systems/AnimationSystem';
import { CollectibleSystem } from '../game/systems/CollectibleSystem';
import { GhostPacketCollisionSystem } from '../game/systems/GhostPacketCollisionSystem';
import { getGameState, resetGameState } from '../state/gameState';
import { createEnemyWorld } from './fixtures/enemyFixtures';

const copies = () => Array.from({ length: 3 }, () => ({
  key: 'spam' as const, tile: { x: 3, y: 3 }, isCopy: true,
}));

describe('enemy abilities', () => {
  beforeEach(() => resetGameState());

  it('pings through walls, snapshots the occupied tile, and retains only the last successful detection', () => {
    const { world, movement, abilities } = createEnemyWorld([
      '############', '#..#.......#', '#..........#', '############',
    ], [{ key: 'ping', tile: { x: 1, y: 1 } }], { x: 4, y: 1 });
    const ping = world.ghosts[0];
    movement.advanceEntity(world.packet, 'right', 9);
    movement.syncEntityPosition(world.packet);
    abilities.update(2999);
    expect(ping.pingTarget).toBeNull();
    abilities.update(1);
    expect(ping.pingTarget).toEqual({ x: 5, y: 1 });
    expect(world.enemyEffects[0].target).toEqual({ x: 81, y: 24 });

    movement.setEntityTile(world.packet, { x: 10, y: 1 });
    abilities.update(3000);
    expect(ping.pingTarget).toEqual({ x: 5, y: 1 });
    expect(world.enemyEffects).toHaveLength(1);
    expect(world.enemyEffects[0].target).toBeUndefined();

    abilities.update(2999);
    movement.setEntityTile(world.packet, ping.tile);
    new GhostPacketCollisionSystem(world, movement).update();
    expect(world.packet.deathAnimationRemainingMs).toBeGreaterThan(0);
    abilities.update(1);
    expect(world.enemyEffects[0].target).toEqual({ x: 24, y: 24 });
  });

  it('caps Spam at four threats and recycles eaten copies after they reach jail', () => {
    const { world, movement, abilities, ghostMovement } = createEnemyWorld([
      '#######', '#.....#', '#.....#', '#.....#', '#.....#', '#.....#', '#######',
    ], [{ key: 'spam', tile: { x: 3, y: 3 } }, ...copies()], { x: 1, y: 1 });
    abilities.update(4000);
    expect(world.ghosts.filter((ghost) => ghost.active)).toHaveLength(2);
    const copy = world.ghosts.find((ghost) => ghost.isCopy && ghost.active)!;
    expect(copy.displayWidth).toBeCloseTo(8.8);
    abilities.update(4000);
    expect(world.ghosts.filter((ghost) => ghost.active)).toHaveLength(4);
    abilities.update(4000);
    expect(world.ghosts.filter((ghost) => ghost.active)).toHaveLength(4);

    setActiveGhostsScaredWindow(world, 6000);
    movement.setEntityTile(world.packet, copy.tile);
    new GhostPacketCollisionSystem(world, movement).update();
    expect(getGameState()).toEqual({ score: 200, lives: 3 });
    expect(copy.active).toBe(true);
    expect(copy.state.dead).toBe(true);
    expect(copy.state.free).toBe(false);
    expect(copy.state.soonFree).toBe(false);
    expect(world.ghostScaredTimers.has(copy)).toBe(false);
    clearAllGhostScaredWindow(world);
    abilities.update(4000);
    expect(world.ghosts.filter((ghost) => ghost.active)).toHaveLength(4);
    for (let tick = 0; tick < 150 && copy.active; tick += 1) ghostMovement.update();
    expect(copy.tile).toEqual(world.ghostJailReturnTile);
    expect(copy.active).toBe(false);
    const oldTile = copy.tile;
    for (let tick = 0; tick < 40 && !copy.active; tick += 1) {
      ghostMovement.update();
      abilities.update(1000);
    }
    expect(copy.active).toBe(true);
    expect(copy.tile).not.toBe(oldTile);
    expect(copy.state.scared).toBe(false);
  });

  it('retries a blocked split after one second and avoids portals and overlapping actors', () => {
    const { world, movement, abilities } = createEnemyWorld([
      '#######', '#######', '#.P...#', '#######',
    ], [{ key: 'spam', tile: { x: 1, y: 2 } }, ...copies()], { x: 5, y: 2 });
    abilities.update(4000);
    expect(world.ghosts.filter((ghost) => ghost.active)).toHaveLength(1);
    movement.setEntityTile(world.ghosts[0], { x: 4, y: 2 });
    abilities.update(999);
    expect(world.ghosts.filter((ghost) => ghost.active)).toHaveLength(1);
    abilities.update(1);
    expect(world.ghosts.find((ghost) => ghost.active && ghost.isCopy)?.tile).toEqual({ x: 3, y: 2 });
  });

  it('drops Lag fields only after traversal and restores slowed movement without skipping a pickup center', () => {
    const { world, movement, abilities, packetMovement } = createEnemyWorld(['#######', '#.....#', '#######'], [
      { key: 'lag', tile: { x: 1, y: 1 } },
    ], { x: 1, y: 1 });
    const lag = world.ghosts[0];
    abilities.update(1000);
    expect(world.lagZones).toHaveLength(0);
    movement.setEntityTile(lag, { x: 2, y: 1 });
    abilities.update(1000);
    expect(world.lagZones).toHaveLength(1);

    world.map.collectibleObjects = [{ type: 'pellet', x: 40, y: 24 }];
    const collectibles = new CollectibleSystem(world);
    movement.advanceEntity(world.packet, 'right', 9);
    movement.syncEntityPosition(world.packet);
    // Overlapping field records must still apply only one slowdown.
    world.lagZones.push({ ...world.lagZones[0] });
    packetMovement.update(0);
    expect(world.packet.x).toBe(33.5);
    expect(world.packet.tile.x).toBe(1);
    abilities.update(4000);
    expect(world.lagZones).toHaveLength(0);
    for (let tick = 0; tick < 7; tick += 1) packetMovement.update(0);
    expect(world.packet.tile).toEqual({ x: 2, y: 1 });
    expect(world.packet.moved).toEqual({ x: 0, y: 0 });
    collectibles.update(0);
    expect(collectibles.getPointCount()).toBe(0);
    expect(getGameState().score).toBe(10);
  });

  it('clears Lag fields on power and resumes abilities with fresh cooldowns while preserving half-base scared speed', () => {
    const { world, movement, abilities, ghostMovement } = createEnemyWorld(['#######', '#.....#', '#######'], [
      { key: 'lag', tile: { x: 1, y: 1 } },
    ], { x: 5, y: 1 });
    const lag = world.ghosts[0];
    abilities.update(0);
    movement.setEntityTile(lag, { x: 2, y: 1 });
    abilities.update(1000);
    expect(world.lagZones).toHaveLength(1);
    setActiveGhostsScaredWindow(world, 6000);
    expect(world.lagZones).toHaveLength(0);
    abilities.update(6000);
    expect(world.lagZones).toHaveLength(0);
    ghostMovement.update();
    expect(lag.speed).toBe(ENEMY_CONFIG.lag.speed / 2);
    const animation = new AnimationSystem(world, 1);
    animation.start();
    animation.update(6000);
    expect(lag.state.scared).toBe(false);
    movement.setEntityTile(lag, { x: 2, y: 1 });
    abilities.update(0);
    movement.setEntityTile(lag, { x: 3, y: 1 });
    abilities.update(999);
    expect(world.lagZones).toHaveLength(0);
    abilities.update(1);
    expect(world.lagZones[0].tile).toEqual({ x: 3, y: 1 });
    ghostMovement.update();
    animation.update(0);
    expect(lag.speed).toBe(ENEMY_CONFIG.lag.speed);
  });
});
