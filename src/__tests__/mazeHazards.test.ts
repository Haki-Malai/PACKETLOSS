import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { ENEMY_CONFIG, SPRITE_SIZE, TILE_SIZE } from '../config/constants';
import { EnemyEntity } from '../game/domain/entities/EnemyEntity';
import { EnemyNavigationService } from '../game/domain/services/EnemyNavigationService';
import { EnemyJailService } from '../game/domain/services/EnemyJailService';
import { setActiveEnemiesScaredWindow } from '../game/domain/services/EnemyScaredStateService';
import { toWorldPosition } from '../game/domain/services/MovementRules';
import { MovementRules } from '../game/domain/services/MovementRules';
import { CollisionGrid } from '../game/domain/world/CollisionGrid';
import { parseTiledMap, type TiledMap } from '../game/infrastructure/map/TiledParser';
import { SeededRandom } from '../game/shared/random/SeededRandom';
import { TimerSchedulerAdapter } from '../game/infrastructure/adapters/TimerSchedulerAdapter';
import { CollectibleSystem, type CollectiblePoint } from '../game/systems/CollectibleSystem';
import { EnemyPacketCollisionSystem } from '../game/systems/EnemyPacketCollisionSystem';
import { EnemyReleaseSystem } from '../game/systems/EnemyReleaseSystem';
import { MazeHazardSystem } from '../game/systems/MazeHazardSystem';
import { getGameState, resetGameState } from '../state/gameState';
import { createEnemyWorld } from './fixtures/enemyFixtures';
import { createWorld } from './fixtures/renderFixtures';

const openRows = [
  '##############', '#............#', '#............#', '#............#', '#............#',
  '#............#', '#............#', '#............#', '##############',
];

/** Defines an authored real collectible independently of the hazard's placement algorithm. */
function point(x: number, y: number, kind: CollectiblePoint['kind'] = 'base'): CollectiblePoint {
  return { tile: { x, y }, ...toWorldPosition({ x, y }, { x: 0, y: 0 }, TILE_SIZE), kind };
}

/** Walks a cleared row through the movement system, leaving only tile six eligible for the ambush. */
function trojanScenario(withOtherEnemy = false) {
  const fixture = createEnemyWorld(openRows, [
    { key: 'trojan', tile: { x: 11, y: 3 } },
    ...(withOtherEnemy ? [{ key: 'virus' as const, tile: { x: 11, y: 6 } }] : []),
  ], { x: 1, y: 2 });
  // Production corridors carry wall flags while their centers remain walkable.
  for (const collision of [fixture.world.map.tiles[2][6].collision, fixture.world.collisionGrid.getTileAt(6, 2)]) {
    Object.assign(collision, { collides: true, up: true, down: true });
  }
  const collectibles = new CollectibleSystem(fixture.world, [point(4, 1), point(11, 4, 'power')]);
  const hazards = new MazeHazardSystem(fixture.world, fixture.movement, new SeededRandom(4), collectibles);
  for (let step = 0; step < TILE_SIZE * 9; step += 1) fixture.packetMovement.update();
  expect(fixture.world.packet.tile).toEqual({ x: 10, y: 2 });
  return { ...fixture, collectibles, hazards, trojan: fixture.world.enemies[0] };
}

/** Advances the real enemy along the selected route and checks for movement before disguise. */
function walkTrojanToDisguise(scenario: ReturnType<typeof trojanScenario>): void {
  const { hazards, trojan, enemyMovement } = scenario;
  const origin = { ...trojan.tile };
  hazards.update(6000);
  expect(trojan.tile).toEqual(origin);
  expect(trojan.ambushTarget).toEqual({ x: 6, y: 2 });
  expect(trojan.disguised).toBe(false);
  let walked = false;
  for (let step = 0; step < 180 && !trojan.disguised; step += 1) {
    const previous = { x: trojan.x, y: trojan.y };
    enemyMovement.update(1000 / 60);
    const distance = Math.hypot(trojan.x - previous.x, trojan.y - previous.y);
    expect(distance).toBeLessThanOrEqual(trojan.baseSpeed + 1e-6);
    if (distance > 0) walked = true;
    hazards.update(1000 / 60);
  }
  expect(walked).toBe(true);
  expect(trojan.disguised).toBe(true);
  expect(trojan.tile).toEqual({ x: 6, y: 2 });
  expect(trojan.ambushTarget).toBeNull();
}

describe('Quarantine terrain and Trojan ambushes', () => {
  beforeEach(() => resetGameState());

  it.each([
    ['maze', { x: 24, y: 25 }, { x: 10, y: 10 }],
    ['demo', { x: 6, y: 7 }, { x: 10, y: 5 }],
  ])('finds connected extensions in the authored %s map', (name, spawn, enemyTile) => {
    const tiled = JSON.parse(fs.readFileSync(path.resolve(`public/assets/mazes/default/${name}.json`), 'utf8')) as TiledMap;
    const map = parseTiledMap(tiled);
    const grid = new CollisionGrid(map.tiles.map((row) => row.map((tile) => tile.collision)));
    const world = createWorld(map, grid, spawn);
    const movement = new MovementRules(TILE_SIZE);
    const enemy = new EnemyEntity({ key: 'quarantine', tile: enemyTile, direction: 'right',
      speed: ENEMY_CONFIG.quarantine.speed, displayWidth: SPRITE_SIZE.enemy, displayHeight: SPRITE_SIZE.enemy });
    movement.setEntityTile(enemy, enemyTile);
    enemy.state.free = true;
    world.enemies.push(enemy);
    new MazeHazardSystem(world, movement, new SeededRandom(7), new CollectibleSystem(world, [])).update(5000);
    expect(world.quarantineWalls.length).toBeGreaterThan(0);
    for (const wall of world.quarantineWalls) {
      const neighbor = { x: wall.tile.x + (wall.side === 'right' ? 1 : 0),
        y: wall.tile.y + (wall.side === 'down' ? 1 : 0) };
      expect(grid.getTileAt(wall.tile.x, wall.tile.y)[wall.side]).toBe(true);
      expect(grid.getTileAt(neighbor.x, neighbor.y)[wall.side === 'right' ? 'left' : 'up']).toBe(true);
    }
  });

  it('closes one passage from both sides without blocking a tile’s other exits', () => {
    const { world, movement } = createEnemyWorld(openRows, [], { x: 1, y: 1 });
    const tile = { x: 5, y: 3 };
    const authored = world.collisionGrid.toArray();
    world.collisionGrid.setTemporaryEdges([{ tile, side: 'right' }]);
    expect(movement.canMove('right', 0, 0, world.collisionGrid.getTilesAt(tile))).toBe(false);
    expect(movement.canMove('left', 0, 0, world.collisionGrid.getTilesAt({ x: 6, y: 3 }))).toBe(false);
    expect(movement.canMove('up', 0, 0, world.collisionGrid.getTilesAt(tile))).toBe(true);
    expect(movement.canMove('down', 0, 0, world.collisionGrid.getTilesAt(tile))).toBe(true);
    expect(world.collisionGrid.toArray()).toEqual(authored);
    world.collisionGrid.setTemporaryEdges([]);
    expect(movement.canMove('right', 0, 0, world.collisionGrid.getTilesAt(tile))).toBe(true);
  });

  it('temporarily cuts off a corridor and restores the exact authored collision when walls expire', () => {
    const fixture = createEnemyWorld([
      '##############', '#............#', '##############', '##############', '##############',
      '##############', '##############', '##############', '##############',
    ], [{ key: 'quarantine', tile: { x: 10, y: 1 } }], { x: 2, y: 1 });
    const { world, movement, portals } = fixture;
    for (let x = 1; x <= 12; x += 1) {
      world.map.tiles[1][x].rotation = Math.PI / 2;
      for (const collision of [world.map.tiles[1][x].collision, world.collisionGrid.getTileAt(x, 1)]) {
        Object.assign(collision, { collides: true, up: true, down: true });
      }
    }
    const collectibles = new CollectibleSystem(world, [point(12, 1)]);
    const hazards = new MazeHazardSystem(world, movement, new SeededRandom(7), collectibles);
    const navigation = new EnemyNavigationService(world.collisionGrid, TILE_SIZE, portals);
    const before = world.collisionGrid.toArray();
    expect(navigation.findPath(world.packet.tile, { x: 12, y: 1 })).not.toBeNull();
    hazards.update(4999);
    expect(world.quarantineWalls).toHaveLength(0);
    hazards.update(1);
    expect(world.quarantineWalls).toHaveLength(2);
    expect(navigation.findPath(world.packet.tile, { x: 12, y: 1 })).toBeNull();
    expect(world.map.tiles[1][5].collision).toMatchObject({ collides: true, up: true, down: true, left: false, right: false });
    expect(collectibles.getPointCount()).toBe(1);
    for (const { tile, side } of world.quarantineWalls) {
      const neighbor = { x: tile.x + (side === 'right' ? 1 : 0), y: tile.y + (side === 'down' ? 1 : 0) };
      expect(world.collisionGrid.getTileAt(tile.x, tile.y)[side]).toBe(true);
      expect(world.collisionGrid.getTileAt(neighbor.x, neighbor.y)[side === 'right' ? 'left' : 'up']).toBe(true);
      expect(movement.canMove(side, 0, 0, world.collisionGrid.getTilesAt(tile))).toBe(false);
    }
    // A returned/inactive owner must not recreate walls as the last existing walls expire.
    world.enemies[0].active = false;
    const blockedConnections = world.quarantineWalls.map((wall) => ({ tile: wall.tile, side: wall.side }));
    hazards.update(6999);
    expect(world.quarantineWalls).toHaveLength(2);
    hazards.update(1);
    expect(world.quarantineWalls).toHaveLength(0);
    expect(world.collisionGrid.toArray()).toEqual(before);
    for (const { tile } of blockedConnections) expect(world.collisionGrid.getTileAt(tile.x, tile.y)).toEqual(before[tile.y][tile.x]);
    expect(navigation.findPath(world.packet.tile, { x: 12, y: 1 })).not.toBeNull();
  });

  it('reserves moving bodies, portals, and jail exits, caps walls, and freezes them while paused', () => {
    const rows = [...openRows];
    rows[2] = '#......P.....#';
    const { world, movement } = createEnemyWorld(rows, [{ key: 'quarantine', tile: { x: 10, y: 3 } }], { x: 3, y: 2 });
    movement.advanceEntity(world.packet, 'right', 9);
    movement.syncEntityPosition(world.packet);
    const hazards = new MazeHazardSystem(world, movement, new SeededRandom(9), new CollectibleSystem(world, []));
    for (let cast = 0; cast < 4; cast += 1) {
      hazards.update(5000);
      expect(world.quarantineWalls.length).toBeLessThanOrEqual(4);
      for (const wall of world.quarantineWalls) {
        const position = toWorldPosition(wall.tile, { x: 0, y: 0 }, TILE_SIZE);
        expect(Math.hypot(position.x - world.packet.x, position.y - world.packet.y)).toBeGreaterThan(24);
        expect(Math.max(Math.abs(wall.tile.x - 7), Math.abs(wall.tile.y - 2))).toBeGreaterThan(1);
        expect(wall.tile.y).toBeLessThan(5);
      }
    }
    expect(world.quarantineWalls.length).toBeGreaterThan(0);
    const walls = world.quarantineWalls;
    world.isMoving = false;
    hazards.update(10000);
    expect(world.quarantineWalls).toBe(walls);
    world.isMoving = true;
    setActiveEnemiesScaredWindow(world, 6000);
    expect(world.quarantineWalls).toEqual([]);
    for (const wall of walls) expect(world.collisionGrid.getTileAt(wall.tile.x, wall.tile.y).collides).toBe(false);
    hazards.update(6000);
    expect(world.quarantineWalls).toEqual([]);
  });

  it('walks Trojan to a traversed empty tile outside the real-point neighborhood before hiding', () => {
    const scenario = trojanScenario();
    const { world, collectibles, hazards, trojan, enemyMovement } = scenario;
    const score = getGameState();
    walkTrojanToDisguise(scenario);
    // Tiles 3, 4, and 5 border the real bit at (4,1); tile 7 is too close to the Packet.
    expect(trojan.tile).toEqual({ x: 6, y: 2 });
    expect(world.visitedPacketTiles.has('6,2')).toBe(true);
    enemyMovement.update(500);
    expect(trojan.moved).toEqual({ x: 0, y: 0 });
    expect(collectibles.getPointCount()).toBe(2);
    expect(getGameState()).toEqual(score);
    world.isMoving = false;
    hazards.update(20000);
    expect(trojan.disguised).toBe(true);
    expect(trojan.disguiseRemainingMs).toBe(ENEMY_CONFIG.trojan.disguiseDurationMs);
  });

  it('abandons an ambush when the Packet occupies the selected tile before Trojan arrives', () => {
    const { world, movement, hazards, trojan, enemyMovement } = trojanScenario();
    hazards.update(6000);
    expect(trojan.ambushTarget).toEqual({ x: 6, y: 2 });
    movement.setEntityTile(world.packet, { x: 6, y: 2 });
    for (let step = 0; step < 180 && trojan.ambushTarget; step += 1) {
      enemyMovement.update(1000 / 60);
      hazards.update(1000 / 60);
    }
    expect(trojan.tile).toEqual({ x: 6, y: 2 });
    expect(trojan.ambushTarget).toBeNull();
    expect(trojan.disguised).toBe(false);
    expect(trojan.abilityRemainingMs).toBe(ENEMY_CONFIG.trojan.retryMs);
  });

  it('reveals the horse near the Packet and grants the complete escape window before lethal contact', () => {
    const scenario = trojanScenario();
    const { world, movement, hazards, trojan, enemyMovement, collectibles } = scenario;
    walkTrojanToDisguise(scenario);
    movement.setEntityTile(world.packet, trojan.tile);
    const collision = new EnemyPacketCollisionSystem(world, movement);
    collision.update();
    collectibles.update(0);
    expect(getGameState()).toEqual({ score: 0, lives: 3 });
    hazards.update(0);
    expect(trojan.disguised).toBe(false);
    expect(trojan.revealRemainingMs).toBe(900);
    hazards.update(899);
    enemyMovement.update();
    collision.update();
    expect(trojan.moved).toEqual({ x: 0, y: 0 });
    expect(getGameState().lives).toBe(3);
    hazards.update(1);
    collision.update();
    expect(getGameState().lives).toBe(2);
  });

  it('reveals immediately and becomes edible when a power core suppresses its disguise', () => {
    const scenario = trojanScenario();
    const { world, movement, hazards, trojan } = scenario;
    walkTrojanToDisguise(scenario);
    setActiveEnemiesScaredWindow(world, 6000);
    expect(trojan.disguised).toBe(false);
    expect(trojan.revealRemainingMs).toBe(0);
    hazards.update(6000);
    expect(trojan.disguised).toBe(false);
    movement.setEntityTile(world.packet, trojan.tile);
    new EnemyPacketCollisionSystem(world, movement).update();
    expect(getGameState()).toEqual({ score: 200, lives: 3 });
    expect(trojan.state.dead).toBe(true);
  });

  it('waits when no eligible cleared tile exists, and clears visited history when the level refills', () => {
    const { world, movement, packetMovement } = createEnemyWorld(openRows,
      [{ key: 'trojan', tile: { x: 11, y: 3 } }], { x: 1, y: 2 });
    const collectibles = new CollectibleSystem(world, [point(6, 1, 'power')]);
    const hazards = new MazeHazardSystem(world, movement, new SeededRandom(4), collectibles);
    const trojan = world.enemies[0];
    hazards.update(6000);
    expect(trojan.disguised).toBe(false);
    // Actually traverse one candidate tile, but leave a real power core immediately above it.
    movement.setEntityTile(world.packet, { x: 6, y: 2 });
    packetMovement.update();
    movement.setEntityTile(world.packet, { x: 10, y: 2 });
    hazards.update(1000);
    expect(trojan.disguised).toBe(false);
    expect(trojan.tile).toEqual({ x: 11, y: 3 });
    expect(world.visitedPacketTiles.size).toBe(1);
    collectibles.refill();
    expect(world.visitedPacketTiles.size).toBe(0);
  });

  it('ignores another enemy on the fake point and stays hidden until the Packet approaches', () => {
    const scenario = trojanScenario(true);
    const { world, movement, hazards, trojan } = scenario;
    walkTrojanToDisguise(scenario);
    const otherEnemy = world.enemies[1];
    movement.setEntityTile(otherEnemy, trojan.tile);
    hazards.update(ENEMY_CONFIG.trojan.disguiseDurationMs + 1000);
    expect(trojan.disguised).toBe(true);
    expect(trojan.revealRemainingMs).toBe(0);
    expect(world.enemyEffects.some((effect) => effect.kind === 'trojan')).toBe(false);
  });

  it('clears both abilities and the wall collision layer when the roster returns to jail', () => {
    const { world, movement, packetMovement } = createEnemyWorld(openRows, [
      { key: 'quarantine', tile: { x: 10, y: 3 } }, { key: 'trojan', tile: { x: 11, y: 3 } },
    ], { x: 1, y: 2 });
    const rng = new SeededRandom(4);
    const release = new EnemyReleaseSystem(world, movement, new EnemyJailService(), new TimerSchedulerAdapter(), rng);
    const hazards = new MazeHazardSystem(world, movement, rng, new CollectibleSystem(world, [point(4, 1)]));
    const [quarantine, trojan] = world.enemies;
    quarantine.state.free = false;
    for (let step = 0; step < 144; step += 1) packetMovement.update();
    hazards.update(6000);
    expect(trojan.ambushTarget).not.toBeNull();
    expect(trojan.disguised).toBe(false);
    quarantine.state.free = true;
    hazards.update(5000);
    expect(world.quarantineWalls.length).toBeGreaterThan(0);
    const blocked = world.quarantineWalls.map((wall) => wall.tile);
    release.resetToJail();
    expect(world.quarantineWalls).toEqual([]);
    expect(trojan.disguised).toBe(false);
    expect(trojan.ambushTarget).toBeNull();
    expect(trojan.revealRemainingMs).toBe(0);
    expect(trojan.abilityRemainingMs).toBeNull();
    expect(world.visitedPacketTiles.size).toBeGreaterThan(0);
    for (const tile of blocked) expect(world.collisionGrid.getTileAt(tile.x, tile.y).collides).toBe(false);
    release.destroy();
  });

  it('keeps Firewall patrols legal and restartable while Quarantine changes the live collision grid', () => {
    const { world, movement, enemyMovement } = createEnemyWorld(openRows, [
      { key: 'quarantine', tile: { x: 10, y: 3 } }, { key: 'firewall', tile: { x: 4, y: 3 } },
    ], { x: 1, y: 2 });
    const hazards = new MazeHazardSystem(world, movement, new SeededRandom(6), new CollectibleSystem(world, []));
    hazards.update(5000);
    expect(world.quarantineWalls.length).toBeGreaterThan(0);
    enemyMovement.reset();
    for (let step = 0; step < 360; step += 1) {
      enemyMovement.update();
      hazards.update(1000 / 60);
      const firewall = world.enemies[1];
      expect(world.collisionGrid.getTileAt(Math.floor(firewall.x / 16), Math.floor(firewall.y / 16)).collides).toBe(false);
    }
  });
});
