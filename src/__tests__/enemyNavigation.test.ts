import { describe, expect, it, vi } from 'vitest';
import { EnemyDecisionService } from '../game/domain/services/EnemyDecisionService';
import { EnemyNavigationService } from '../game/domain/services/EnemyNavigationService';
import { MovementRules } from '../game/domain/services/MovementRules';
import { PortalService } from '../game/domain/services/PortalService';
import { SeededRandom } from '../game/shared/random/SeededRandom';
import { EnemyMovementSystem } from '../game/systems/EnemyMovementSystem';
import { createPenGateGrid } from './fixtures/collisionFixtures';
import { createEnemyWorld } from './fixtures/enemyFixtures';

describe('enemy navigation', () => {
  it('takes a weighted portal shortcut using the actual outward entry direction', () => {
    const { world, portals } = createEnemyWorld(['#######', 'P.....P', '#######'], [], { x: 1, y: 1 }, [
      { from: { x: 0, y: 1 }, to: { x: 6, y: 1 } },
    ]);
    const navigation = new EnemyNavigationService(world.collisionGrid, 16, portals);
    const path = navigation.findPath({ x: 1, y: 1 }, { x: 5, y: 1 });
    expect(path?.map((step) => step.direction)).toEqual(['left', 'left', 'left']);
    expect(path?.map((step) => step.destination)).toEqual([{ x: 0, y: 1 }, { x: 6, y: 1 }, { x: 5, y: 1 }]);
    expect(path?.reduce((cost, step) => cost + step.cost, 0)).toBe(2.5);
    const returning = new EnemyNavigationService(world.collisionGrid, 16, portals, 'returning');
    expect(returning.findPath({ x: 1, y: 1 }, { x: 5, y: 1 })?.map((step) => step.direction))
      .toEqual(['right', 'right', 'right', 'right']);
  });

  it('keeps Virus on physical corridors when a portal shortcut or outward teleport is available', () => {
    const { world, movement, portals, enemyMovement } = createEnemyWorld([
      '#########', '#P...P..#', '#########',
    ], [{ key: 'virus', tile: { x: 2, y: 1 }, direction: 'left' }], { x: 5, y: 1 }, [
      { from: { x: 1, y: 1 }, to: { x: 5, y: 1 } },
    ]);
    const virus = world.enemies[0];
    const normalRoute = new EnemyNavigationService(world.collisionGrid, 16, portals)
      .findPath(virus.tile, world.packet.tile);
    expect(normalRoute?.[0]?.direction).toBe('left');

    enemyMovement.update();
    expect(virus.direction).toBe('right');

    movement.setEntityTile(virus, { x: 5, y: 1 });
    movement.setEntityTile(world.packet, { x: 7, y: 1 });
    for (let step = 0; step < 40 && virus.tile.x === 5; step += 1) enemyMovement.update();
    expect(virus.tile).toEqual({ x: 6, y: 1 });
  });

  it('excludes blocked portal destinations and keeps pen gates closed for navigation', () => {
    const { world, portals } = createEnemyWorld(['#######', 'P.....#', '#######'], [], { x: 1, y: 1 }, [
      { from: { x: 0, y: 1 }, to: { x: 6, y: 1 } },
    ]);
    const path = new EnemyNavigationService(world.collisionGrid, 16, portals)
      .findPath({ x: 1, y: 1 }, { x: 5, y: 1 });
    expect(path?.map((step) => step.direction)).toEqual(['right', 'right', 'right', 'right']);

    const grid = createPenGateGrid();
    const navigation = new EnemyNavigationService(grid, 16, new PortalService(grid));
    expect(navigation.getSteps({ x: 0, y: 1 }).some((step) => step.direction === 'down')).toBe(false);
    expect(new MovementRules(16).canMove('down', 0, 0, grid.getTilesAt({ x: 0, y: 1 }), 'enemyRelease')).toBe(true);
    expect(new EnemyNavigationService(grid, 16, new PortalService(grid), 'returning')
      .getSteps({ x: 0, y: 1 }).some((step) => step.direction === 'down')).toBe(true);
  });

  it('opens only the authored jail ingress and bounded home row for returning enemies', () => {
    const { world, portals } = createEnemyWorld(['#######', '#.....#', '#######', '#######']);
    const bounds = { minX: 2, maxX: 4, y: 2 };
    const returning = new EnemyNavigationService(world.collisionGrid, 16, portals, 'returning', bounds);
    const directions = (x: number, y: number) => returning.getSteps({ x, y }).map((step) => step.direction);
    expect(directions(3, 1)).toContain('down');
    expect(directions(3, 2)).toEqual(['right', 'left']);
    expect(directions(2, 2)).toEqual(['right']);
    expect(directions(4, 2)).toEqual(['left']);
    expect(directions(1, 1)).not.toContain('down');
    expect(new EnemyNavigationService(world.collisionGrid, 16, portals).getSteps({ x: 3, y: 1 })
      .some((step) => step.direction === 'down')).toBe(false);
  });

  it('breaks equal-distance ties in up/right/down/left order and reports unreachable targets', () => {
    const { world, portals } = createEnemyWorld(['#####', '#...#', '#.#.#', '#...#', '#####']);
    const navigation = new EnemyNavigationService(world.collisionGrid, 16, portals);
    expect(navigation.findPath({ x: 1, y: 2 }, { x: 3, y: 2 })?.[0].direction).toBe('up');
    expect(navigation.findPath({ x: 1, y: 2 }, { x: 2, y: 2 })).toBeNull();
  });

  it('lets Virus reverse toward the occupied player tile while the movement anchor still lags behind', () => {
    const { world, movement, enemyMovement } = createEnemyWorld(['#######', '#.....#', '#######'], [
      { key: 'virus', tile: { x: 4, y: 1 }, direction: 'right' },
    ], { x: 4, y: 1 });
    movement.advanceEntity(world.packet, 'left', 9);
    movement.syncEntityPosition(world.packet);
    expect(world.packet.tile.x).toBe(4);
    enemyMovement.update();
    expect(world.enemies[0].direction).toBe('left');
    expect(world.enemies[0].x).toBeCloseTo(71.15);
  });

  it('sends Firewall to a random target before repeating a long patrol independently of the player', () => {
    const { world, movement, portals } = createEnemyWorld([
      '#######', '#.....#', '#.###.#', '#.#.#.#', '#.###.#', '#.....#', '#######',
    ], [
      { key: 'firewall', tile: { x: 1, y: 1 }, direction: 'up' },
    ], { x: 3, y: 3 });
    const enemy = world.enemies[0];
    const decisions = new EnemyDecisionService();
    const rng = new SeededRandom(1);
    const navigation = new EnemyNavigationService(world.collisionGrid, 16, portals);
    const enemyMovement = new EnemyMovementSystem(world, movement, decisions, portals, rng);
    const patrol = decisions.prepareFirewallPatrol(enemy, enemy.tile, navigation, rng)!;
    expect(patrol.routeLength).toBeGreaterThanOrEqual(16);
    expect(navigation.findPath(enemy.tile, patrol.target)).not.toBeNull();

    for (let step = 0; step < 400 && (
      enemy.tile.x !== patrol.target.x || enemy.tile.y !== patrol.target.y || enemy.moved.x !== 0 || enemy.moved.y !== 0
    ); step += 1) {
      movement.setEntityTile(world.packet, { x: step % 2 === 0 ? 3 : 1, y: 3 });
      enemyMovement.update();
    }
    expect(enemy.tile).toEqual(patrol.target);
    expect(enemy.moved).toEqual({ x: 0, y: 0 });

    let leftTarget = false;
    let completedLoop = false;
    for (let step = 0; step < patrol.routeLength * 20; step += 1) {
      movement.setEntityTile(world.packet, { x: step % 2 === 0 ? 1 : 5, y: 5 });
      enemyMovement.update();
      const atTarget = enemy.tile.x === patrol.target.x && enemy.tile.y === patrol.target.y
        && enemy.moved.x === 0 && enemy.moved.y === 0;
      if (!atTarget) leftTarget = true;
      if (leftTarget && atTarget) {
        completedLoop = true;
        break;
      }
    }
    expect(completedLoop).toBe(true);
  });

  it('rejects a Firewall map without a reachable sixteen-step patrol', () => {
    expect(() => createEnemyWorld(['#####', '#...#', '#.#.#', '#...#', '#####'], [
      { key: 'firewall', tile: { x: 1, y: 1 }, direction: 'down' },
    ], { x: 3, y: 3 })).toThrow('at least 16 steps');
  });

  it('chooses a new Firewall patrol when the enemy roster resets', () => {
    const { decisions, enemyMovement } = createEnemyWorld([
      '#######', '#.....#', '#.....#', '#.....#', '#.....#', '#.....#', '#######',
    ], [{ key: 'firewall', tile: { x: 1, y: 1 } }]);
    const prepare = vi.spyOn(decisions, 'prepareFirewallPatrol');

    enemyMovement.reset();

    expect(prepare).toHaveBeenCalledOnce();
  });
});
