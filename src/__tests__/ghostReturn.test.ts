import { beforeEach, describe, expect, it } from 'vitest';
import { GhostJailService } from '../game/domain/services/GhostJailService';
import { setActiveGhostsScaredWindow } from '../game/domain/services/GhostScaredStateService';
import { EnemyNavigationService } from '../game/domain/services/EnemyNavigationService';
import { TimerSchedulerAdapter } from '../game/infrastructure/adapters/TimerSchedulerAdapter';
import { GHOST_EAT_DURATION_MS } from '../game/shared/ghostEating';
import { SeededRandom } from '../game/shared/random/SeededRandom';
import { GhostPacketCollisionSystem } from '../game/systems/GhostPacketCollisionSystem';
import { GhostReleaseSystem } from '../game/systems/GhostReleaseSystem';
import { getGameState, resetGameState } from '../state/gameState';
import { createEnemyWorld } from './fixtures/enemyFixtures';
import { MechanicsDomainHarness } from './helpers/mechanicsDomainHarness';

describe('eaten ghost return', () => {
  beforeEach(() => resetGameState(0, 3));

  it('takes the shortest corridor detour without jumps, repeated scores, damage, abilities, or early release', () => {
    const { world, movement, ghostMovement, abilities } = createEnemyWorld([
      '#######', '#.....#', '#.###.#', '#...#.#', '###.#.#', '#.....#', '#######',
    ], [{ key: 'virus', tile: { x: 1, y: 1 } }]);
    const ghost = world.ghosts[0];
    const contactTile = ghost.tile;
    const collisions = new GhostPacketCollisionSystem(world, movement);
    const scheduler = new TimerSchedulerAdapter();
    const release = new GhostReleaseSystem(world, movement, new GhostJailService(), scheduler, new SeededRandom(1));
    setActiveGhostsScaredWindow(world, 6000);
    collisions.update();
    expect(ghost.eatenElapsedMs).toBe(0);
    expect(world.packet.ghostEatRemainingMs).toBe(GHOST_EAT_DURATION_MS);
    ghostMovement.update(GHOST_EAT_DURATION_MS - 1);
    expect([ghost.x, ghost.y]).toEqual([24, 24]);
    expect(ghost.state.soonFree).toBe(false);

    const centers: number[][] = [];
    let distance = 0;
    for (let tick = 0; tick < 100 && ghost.state.dead; tick += 1) {
      const before = { x: ghost.x, y: ghost.y };
      release.update();
      ghostMovement.update(1);
      const step = Math.hypot(ghost.x - before.x, ghost.y - before.y);
      expect(step).toBeLessThanOrEqual(2);
      distance += step;
      if (step > 0 && ghost.moved.x === 0 && ghost.moved.y === 0) centers.push([ghost.tile.x, ghost.tile.y]);
      if (ghost.state.dead) {
        movement.setEntityTile(world.packet, ghost.tile);
        setActiveGhostsScaredWindow(world, 6000);
        abilities.update(1000);
        collisions.update(1);
        expect(ghost.state.scared).toBe(false);
        expect(ghost.abilityRemainingMs).toBeNull();
        expect(ghost.state.soonFree).toBe(false);
      }
    }
    expect(centers).toEqual([[1, 2], [1, 3], [2, 3], [3, 3], [3, 4], [3, 5]]);
    expect(distance).toBe(96);
    expect(ghost.tile).toBe(contactTile);
    expect(ghost.state.dead).toBe(false);
    expect(ghost.state.soonFree).toBe(true);
    expect(ghost.eatenElapsedMs).toBeNull();
    expect(getGameState()).toEqual({ score: 200, lives: 3 });
    release.destroy();
    scheduler.clear();
  });

  it.each([
    { x: 1, offset: 4, expectedDirection: 'right', expectedX: 30 },
    { x: 3, offset: 4, expectedDirection: 'left', expectedX: 58 },
  ])('chooses the shortest endpoint from a fractional edge at x=$x', ({ x, offset, expectedDirection, expectedX }) => {
    const { world, movement, ghostMovement } = createEnemyWorld(['#######', '#.....#', '#######'], [
      { key: 'virus', tile: { x, y: 1 } },
    ], { x, y: 1 });
    const ghost = world.ghosts[0];
    movement.advanceEntity(ghost, 'right', offset);
    movement.syncEntityPosition(ghost);
    ghost.state.scared = true;
    new GhostPacketCollisionSystem(world, movement).update();
    ghostMovement.update(GHOST_EAT_DURATION_MS);
    expect(ghost.direction).toBe(expectedDirection);
    expect(ghost.x).toBe(expectedX);
  });

  it('retreats from an outward portal half-step and returns without taking the teleport shortcut', () => {
    const { world, movement, ghostMovement } = createEnemyWorld(['#######', 'P.....P', '#######'], [
      { key: 'virus', tile: { x: 0, y: 1 }, direction: 'left' },
    ], { x: 0, y: 1 }, [{ from: { x: 0, y: 1 }, to: { x: 6, y: 1 } }]);
    const ghost = world.ghosts[0];
    movement.advanceEntity(ghost, 'left', 3);
    movement.syncEntityPosition(ghost);
    ghost.state.scared = true;
    new GhostPacketCollisionSystem(world, movement).update();
    ghostMovement.update(GHOST_EAT_DURATION_MS);
    expect(ghost.direction).toBe('right');
    expect(ghost.x).toBe(7);
    expect(ghost.tile).toEqual({ x: 0, y: 1 });
    for (let tick = 0; tick < 40 && ghost.state.dead; tick += 1) {
      const previousX = ghost.x;
      ghostMovement.update();
      expect(ghost.x - previousX).toBeGreaterThanOrEqual(0);
      expect(ghost.x - previousX).toBeLessThanOrEqual(2);
    }
    expect(ghost.tile).toEqual(world.ghostJailReturnTile);
    expect(ghost.state.dead).toBe(false);
  });

  it('freezes both the eating and returning phases while paused', () => {
    const { world, movement, ghostMovement } = createEnemyWorld([
      '#######', '#.....#', '#######',
    ], [{ key: 'virus', tile: { x: 1, y: 1 } }]);
    const ghost = world.ghosts[0];
    ghost.state.scared = true;
    const collisions = new GhostPacketCollisionSystem(world, movement);
    collisions.update();
    world.isMoving = false;
    ghostMovement.update(1000);
    collisions.update(1000);
    expect(ghost.eatenElapsedMs).toBe(0);
    expect(world.packet.ghostEatRemainingMs).toBe(GHOST_EAT_DURATION_MS);
    world.isMoving = true;
    ghostMovement.update(GHOST_EAT_DURATION_MS);
    collisions.update(GHOST_EAT_DURATION_MS);
    expect(world.packet.ghostEatRemainingMs).toBe(0);
    expect([ghost.x, ghost.y]).toEqual([26, 24]);
    world.isMoving = false;
    ghostMovement.update(1000);
    expect([ghost.x, ghost.y]).toEqual([26, 24]);
    world.isMoving = true;
    ghostMovement.update();
    expect([ghost.x, ghost.y]).toEqual([28, 24]);
  });

  it('waits harmlessly when an authored corridor has no route to jail', () => {
    const { world, movement, ghostMovement } = createEnemyWorld([
      '#######', '#.#...#', '###...#', '#.....#', '#######',
    ], [{ key: 'virus', tile: { x: 1, y: 1 } }]);
    const ghost = world.ghosts[0];
    ghost.state.scared = true;
    const collisions = new GhostPacketCollisionSystem(world, movement);
    collisions.update();
    ghostMovement.update(GHOST_EAT_DURATION_MS);
    collisions.update(GHOST_EAT_DURATION_MS);
    expect([ghost.x, ghost.y]).toEqual([24, 24]);
    expect(ghost.state.dead).toBe(true);
    expect(ghost.state.soonFree).toBe(false);
    expect(getGameState()).toEqual({ score: 200, lives: 3 });
  });

  it.each(['default-map', 'demo-map'] as const)('can walk from every reachable %s tile into the authored prison', (fixture) => {
    const harness = new MechanicsDomainHarness({ fixture, ghostCount: 0, autoStartSystems: false });
    const { world, portalService } = harness;
    const normal = new EnemyNavigationService(world.collisionGrid, world.tileSize, portalService);
    const returning = new EnemyNavigationService(world.collisionGrid, world.tileSize, portalService, 'returning', world.ghostJailBounds);
    const queue = [world.packetSpawnTile];
    const visited = new Set<string>();
    while (queue.length) {
      const tile = queue.shift()!;
      const key = `${tile.x},${tile.y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      const path = returning.findPath(tile, world.ghostJailReturnTile);
      expect(path).not.toBeNull();
      expect(path?.every((step) => Math.abs(step.destination.x - step.tile.x) + Math.abs(step.destination.y - step.tile.y) === 1)).toBe(true);
      queue.push(...normal.getSteps(tile).map((step) => step.destination));
    }
    expect(visited.size).toBeGreaterThan(90);
    harness.destroy();
  });
});
