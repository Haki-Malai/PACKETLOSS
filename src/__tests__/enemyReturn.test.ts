import { beforeEach, describe, expect, it } from 'vitest';
import { EnemyJailService } from '../game/domain/services/EnemyJailService';
import { setActiveEnemiesScaredWindow } from '../game/domain/services/EnemyScaredStateService';
import { EnemyNavigationService } from '../game/domain/services/EnemyNavigationService';
import { TimerSchedulerAdapter } from '../game/infrastructure/adapters/TimerSchedulerAdapter';
import { ENEMY_EAT_DURATION_MS } from '../game/shared/enemyEating';
import { SeededRandom } from '../game/shared/random/SeededRandom';
import { EnemyPacketCollisionSystem } from '../game/systems/EnemyPacketCollisionSystem';
import { EnemyReleaseSystem } from '../game/systems/EnemyReleaseSystem';
import { getGameState, resetGameState } from '../state/gameState';
import { createEnemyWorld } from './fixtures/enemyFixtures';
import { MechanicsDomainHarness } from './helpers/mechanicsDomainHarness';

describe('eaten enemy return', () => {
  beforeEach(() => resetGameState(0, 3));

  it('takes the shortest corridor detour without jumps, repeated scores, damage, abilities, or early release', () => {
    const { world, movement, enemyMovement, abilities } = createEnemyWorld([
      '#######', '#.....#', '#.###.#', '#...#.#', '###.#.#', '#.....#', '#######',
    ], [{ key: 'virus', tile: { x: 1, y: 1 } }]);
    const enemy = world.enemies[0];
    const contactTile = enemy.tile;
    const collisions = new EnemyPacketCollisionSystem(world, movement);
    const scheduler = new TimerSchedulerAdapter();
    const release = new EnemyReleaseSystem(world, movement, new EnemyJailService(), scheduler, new SeededRandom(1));
    setActiveEnemiesScaredWindow(world, 6000);
    collisions.update();
    expect(enemy.eatenElapsedMs).toBe(0);
    expect(world.packet.enemyEatRemainingMs).toBe(ENEMY_EAT_DURATION_MS);
    enemyMovement.update(ENEMY_EAT_DURATION_MS - 1);
    expect([enemy.x, enemy.y]).toEqual([24, 24]);
    expect(enemy.state.soonFree).toBe(false);

    const centers: number[][] = [];
    let distance = 0;
    for (let tick = 0; tick < 100 && enemy.state.dead; tick += 1) {
      const before = { x: enemy.x, y: enemy.y };
      const maximumMs = 1000 / 60;
      const sliceMs = Math.min(
        release.getSimulationBoundaryMs(maximumMs),
        enemyMovement.getSimulationBoundaryMs(maximumMs),
      );
      release.update(sliceMs);
      enemyMovement.update(sliceMs);
      const step = Math.hypot(enemy.x - before.x, enemy.y - before.y);
      expect(step).toBeLessThanOrEqual(2);
      distance += step;
      if (step > 0 && enemy.moved.x === 0 && enemy.moved.y === 0) centers.push([enemy.tile.x, enemy.tile.y]);
      if (enemy.state.dead) {
        movement.setEntityTile(world.packet, enemy.tile);
        setActiveEnemiesScaredWindow(world, 6000);
        abilities.update(1000);
        collisions.update(sliceMs);
        expect(enemy.state.scared).toBe(false);
        expect(enemy.abilityRemainingMs).toBeNull();
        expect(enemy.state.soonFree).toBe(false);
      }
    }
    expect(centers).toEqual([[1, 2], [1, 3], [2, 3], [3, 3], [3, 4], [3, 5]]);
    expect(distance).toBe(96);
    expect(enemy.tile).toBe(contactTile);
    expect(enemy.state.dead).toBe(false);
    expect(enemy.state.soonFree).toBe(true);
    expect(enemy.eatenElapsedMs).toBeNull();
    expect(getGameState()).toEqual({ score: 200, lives: 3 });
    release.destroy();
    scheduler.clear();
  });

  it.each([
    { x: 1, offset: 4, expectedDirection: 'right', expectedX: 30 },
    { x: 3, offset: 4, expectedDirection: 'left', expectedX: 58 },
  ])('chooses the shortest endpoint from a fractional edge at x=$x', ({ x, offset, expectedDirection, expectedX }) => {
    const { world, movement, enemyMovement } = createEnemyWorld(['#######', '#.....#', '#######'], [
      { key: 'virus', tile: { x, y: 1 } },
    ], { x, y: 1 });
    const enemy = world.enemies[0];
    movement.advanceEntity(enemy, 'right', offset);
    movement.syncEntityPosition(enemy);
    enemy.state.scared = true;
    new EnemyPacketCollisionSystem(world, movement).update();
    enemyMovement.update(ENEMY_EAT_DURATION_MS);
    enemyMovement.update();
    expect(enemy.direction).toBe(expectedDirection);
    expect(enemy.x).toBe(expectedX);
  });

  it('retreats from an outward portal half-step and returns without taking the teleport shortcut', () => {
    const { world, movement, enemyMovement } = createEnemyWorld(['#######', 'P.....P', '#######'], [
      { key: 'virus', tile: { x: 0, y: 1 }, direction: 'left' },
    ], { x: 0, y: 1 }, [{ from: { x: 0, y: 1 }, to: { x: 6, y: 1 } }]);
    const enemy = world.enemies[0];
    movement.advanceEntity(enemy, 'left', 3);
    movement.syncEntityPosition(enemy);
    enemy.state.scared = true;
    new EnemyPacketCollisionSystem(world, movement).update();
    enemyMovement.update(ENEMY_EAT_DURATION_MS);
    enemyMovement.update();
    expect(enemy.direction).toBe('right');
    expect(enemy.x).toBe(7);
    expect(enemy.tile).toEqual({ x: 0, y: 1 });
    for (let tick = 0; tick < 40 && enemy.state.dead; tick += 1) {
      const previousX = enemy.x;
      enemyMovement.update(enemyMovement.getSimulationBoundaryMs(1000 / 60));
      expect(enemy.x - previousX).toBeGreaterThanOrEqual(0);
      expect(enemy.x - previousX).toBeLessThanOrEqual(2);
    }
    expect(enemy.tile).toEqual(world.enemyJailReturnTile);
    expect(enemy.state.dead).toBe(false);
  });

  it('freezes both the eating and returning phases while paused', () => {
    const { world, movement, enemyMovement } = createEnemyWorld([
      '#######', '#.....#', '#######',
    ], [{ key: 'virus', tile: { x: 1, y: 1 } }]);
    const enemy = world.enemies[0];
    enemy.state.scared = true;
    const collisions = new EnemyPacketCollisionSystem(world, movement);
    collisions.update();
    world.isMoving = false;
    enemyMovement.update(1000);
    collisions.update(1000);
    expect(enemy.eatenElapsedMs).toBe(0);
    expect(world.packet.enemyEatRemainingMs).toBe(ENEMY_EAT_DURATION_MS);
    world.isMoving = true;
    enemyMovement.update(ENEMY_EAT_DURATION_MS);
    collisions.update(ENEMY_EAT_DURATION_MS);
    expect(world.packet.enemyEatRemainingMs).toBe(0);
    expect([enemy.x, enemy.y]).toEqual([24, 24]);
    enemyMovement.update();
    expect([enemy.x, enemy.y]).toEqual([26, 24]);
    world.isMoving = false;
    enemyMovement.update(1000);
    expect([enemy.x, enemy.y]).toEqual([26, 24]);
    world.isMoving = true;
    enemyMovement.update();
    expect([enemy.x, enemy.y]).toEqual([28, 24]);
  });

  it('waits harmlessly when an authored corridor has no route to jail', () => {
    const { world, movement, enemyMovement } = createEnemyWorld([
      '#######', '#.#...#', '###...#', '#.....#', '#######',
    ], [{ key: 'virus', tile: { x: 1, y: 1 } }]);
    const enemy = world.enemies[0];
    enemy.state.scared = true;
    const collisions = new EnemyPacketCollisionSystem(world, movement);
    collisions.update();
    enemyMovement.update(ENEMY_EAT_DURATION_MS);
    collisions.update(ENEMY_EAT_DURATION_MS);
    expect([enemy.x, enemy.y]).toEqual([24, 24]);
    expect(enemy.state.dead).toBe(true);
    expect(enemy.state.soonFree).toBe(false);
    expect(getGameState()).toEqual({ score: 200, lives: 3 });
  });

  it.each(['default-map', 'demo-map'] as const)('can walk from every reachable %s tile into the authored prison', (fixture) => {
    const harness = new MechanicsDomainHarness({ fixture, enemyCount: 0, autoStartSystems: false });
    const { world, portalService } = harness;
    const normal = new EnemyNavigationService(world.collisionGrid, world.tileSize, portalService);
    const returning = new EnemyNavigationService(world.collisionGrid, world.tileSize, portalService, 'returning', world.enemyJailBounds);
    const queue = [world.packetSpawnTile];
    const visited = new Set<string>();
    while (queue.length) {
      const tile = queue.shift()!;
      const key = `${tile.x},${tile.y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      const path = returning.findPath(tile, world.enemyJailReturnTile);
      expect(path).not.toBeNull();
      expect(path?.every((step) => Math.abs(step.destination.x - step.tile.x) + Math.abs(step.destination.y - step.tile.y) === 1)).toBe(true);
      queue.push(...normal.getSteps(tile).map((step) => step.destination));
    }
    expect(visited.size).toBeGreaterThan(90);
    harness.destroy();
  });
});
