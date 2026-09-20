import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Camera3D } from '../engine/camera3d';
import { ENEMY_CONFIG } from '../config/constants';
import { EnemyEntity, ENEMY_KEYS } from '../game/domain/entities/EnemyEntity';
import { PacketEntity } from '../game/domain/entities/PacketEntity';
import { EnemyDecisionService } from '../game/domain/services/EnemyDecisionService';
import { EnemyNavigationService } from '../game/domain/services/EnemyNavigationService';
import { MovementRules } from '../game/domain/services/MovementRules';
import { PortalService } from '../game/domain/services/PortalService';
import { CollisionGrid } from '../game/domain/world/CollisionGrid';
import { EndlessMazeStream } from '../game/domain/world/EndlessMazeStream';
import { WorldState } from '../game/domain/world/WorldState';
import { SeededRandom } from '../game/shared/random/SeededRandom';
import { CollectibleSystem } from '../game/systems/CollectibleSystem';
import { EndlessBonusSystem } from '../game/systems/EndlessBonusSystem';
import { EndlessEncounterSystem } from '../game/systems/EndlessEncounterSystem';
import { EndlessStreamingSystem } from '../game/systems/EndlessStreamingSystem';
import { EnemyMovementSystem } from '../game/systems/EnemyMovementSystem';
import { EnemyPacketCollisionSystem } from '../game/systems/EnemyPacketCollisionSystem';
import { EntityPresentation } from '../game/systems/EntityPresentation';
import { MazeHazardSystem } from '../game/systems/MazeHazardSystem';
import { PacketMovementSystem } from '../game/systems/PacketMovementSystem';
import type { RenderSystem } from '../game/systems/RenderSystem';
import { getGameState, resetGameState } from '../state/gameState';

/** Creates a real generated domain world without constructing a WebGL renderer. */
function setup(seed = 77) {
  const stream = new EndlessMazeStream(seed);
  const map = stream.map;
  const grid = new CollisionGrid(map.tiles.map((row) => row.map((tile) => tile.collision)));
  const movement = new MovementRules(16);
  const spawn = { x: 12, y: 60 };
  const packet = new PacketEntity(spawn, 10, 10);
  movement.setEntityTile(packet, spawn);
  const enemies = ENEMY_KEYS.map((key) => {
    const enemy = new EnemyEntity({ key, tile: spawn, direction: 'right',
      speed: ENEMY_CONFIG[key].speed, displayWidth: 11, displayHeight: 11 });
    movement.setEntityTile(enemy, spawn);
    enemy.active = false;
    return enemy;
  });
  const world = new WorldState({ map, tileSize: 16, collisionGrid: grid, packet,
    packetSpawnTile: spawn, enemies, enemyJailBounds: { minX: 0, maxX: -1, y: -1000 } });
  world.runMode = 'endless';
  const camera = new Camera3D();
  camera.setBounds(map.widthInPixels, map.heightInPixels);
  camera.setViewport(1920, 1080);
  camera.setZoom(5);
  camera.startFollow(packet, 1, 1);
  camera.snapToFollowTarget();
  const portals = new PortalService(grid);
  const movementSystem = new EnemyMovementSystem(world, movement, new EnemyDecisionService(), portals,
    new SeededRandom(seed), () => camera.getVisibleGroundBounds());
  return { stream, world, camera, movement, movementSystem, portals };
}

beforeEach(() => resetGameState(0, 3));

describe('endless runtime rules', () => {
  it('teleports through a logo corridor and keeps only resident links after shifts', () => {
    const seed = Array.from({ length: 20 }, (_, index) => index + 1)
      .find((candidate) => new EndlessMazeStream(candidate).getSections()[2].logoRow !== null);
    expect(seed).toBeDefined();
    const { stream, world, camera, movement, movementSystem, portals } = setup(seed);
    const section = stream.getSections()[2];
    const row = stream.localRow(section.index, section.logoRow! + 1);
    const from = { x: 1, y: row };
    const to = { x: 23, y: row };
    const normal = new EnemyNavigationService(world.collisionGrid, 16, portals);
    const physical = new EnemyNavigationService(world.collisionGrid, 16, portals, 'physical');
    expect(normal.getSteps(from).some((step) => step.direction === 'left'
      && step.destination.x === to.x && step.destination.y === to.y)).toBe(true);
    expect(physical.getSteps(from).some((step) => step.direction === 'left')).toBe(false);

    const packetMovement = new PacketMovementSystem(world, movement, portals);
    movement.setEntityTile(world.packet, from);
    world.packet.direction = { current: 'left', next: 'left' };
    world.nextTick();
    packetMovement.update(500);
    expect(world.packet.tile).toEqual(to);
    expect(world.packet.portalBlinkRemainingMs).toBeGreaterThan(0);
    world.packet.direction = { current: 'right', next: 'right' };
    world.nextTick();
    packetMovement.update(500);
    expect(world.packet.tile).toEqual(from);

    const collectibles = new CollectibleSystem(world, undefined, stream.initialPickupSeed);
    const bonuses = new EndlessBonusSystem(world, stream, seed!);
    const hazards = new MazeHazardSystem(world, movement, new SeededRandom(11), collectibles);
    const streaming = new EndlessStreamingSystem(world, stream, portals, camera, collectibles, bonuses,
      movementSystem, hazards, { onEndlessShift: vi.fn() } as unknown as RenderSystem);
    /** Matches every live horizontal link to the section pairs after a stream shift. */
    const checkLinks = (): void => {
      const expected = new Map((world.map.portalPairs ?? []).map((pair) => [pair.from.y, pair.to]));
      for (let y = 0; y < world.map.height; y += 1) {
        expect(portals.getTransition({ x: 1, y }, 'left', world.collisionGrid))
          .toEqual(expected.get(y) ?? null);
      }
    };
    checkLinks();
    movement.setEntityTile(world.packet, { x: 12, y: 47 });
    streaming.update();
    expect(portals.getTransition({ x: 1, y: row + 24 }, 'left', world.collisionGrid))
      .toEqual({ x: 23, y: row + 24 });
    checkLinks();
    movement.setEntityTile(world.packet, { x: 12, y: 72 });
    streaming.update();
    expect(portals.getTransition(from, 'left', world.collisionGrid)).toEqual(to);
    checkLinks();
    for (let shift = 0; shift < 3; shift += 1) {
      movement.setEntityTile(world.packet, { x: 12, y: 47 });
      streaming.update();
      checkLinks();
    }
    expect(stream.getSections().some((resident) => resident.index === section.index)).toBe(false);
  });

  it('rebases Packet, enemies, targets, points, visits, and camera without moving them on screen', () => {
    const { stream, world, camera, movement, movementSystem, portals } = setup();
    const collectibles = new CollectibleSystem(world, undefined, stream.initialPickupSeed);
    const bonuses = new EndlessBonusSystem(world, stream, 77);
    const hazards = new MazeHazardSystem(world, movement, new SeededRandom(11), collectibles);
    const renderShift = vi.fn();
    const streaming = new EndlessStreamingSystem(world, stream, portals, camera, collectibles, bonuses,
      movementSystem, hazards, { onEndlessShift: renderShift } as unknown as RenderSystem);
    const first = Array.from(collectibles.getPoints())[0];
    movement.setEntityTile(world.packet, first.tile);
    collectibles.update(0);
    expect(collectibles.getCollectedCount()).toBe(1);
    const enemy = world.enemies[1];
    enemy.active = true;
    movement.setEntityTile(enemy, { x: 12, y: 60 });
    enemy.pingTarget = { x: 10, y: 62 };
    movement.setEntityTile(world.packet, { x: 12, y: 47 });
    const presentation = new EntityPresentation(world);
    presentation.capturePreviousState();
    world.packet.moved.y = -3;
    movement.syncEntityPosition(world.packet);
    presentation.recordCurrentState(16);
    world.recordPacketVisit();
    world.lagZones.push({ tile: { x: 12, y: 55 }, x: 200, y: 888,
      radius: 8, ageMs: 100, durationMs: 1000 });
    world.quarantineWalls.push({ tile: { x: 8, y: 55 }, side: 'right',
      source: { x: 136, y: 888 }, ageMs: 100, durationMs: 1000 });
    camera.snapToFollowTarget();
    const beforeCamera = camera.getRenderPosition().y;
    const beforePacket = world.packet.y;
    const beforeInterpolated = presentation.getPosition(world.packet, 0.5).y - beforeCamera;
    const remaining = collectibles.getPointCount();
    renderShift.mockImplementation((pixels: number) => presentation.translateY(pixels));
    streaming.update();
    expect(stream.getFirstIndex()).toBe(-3);
    expect(world.packet.tile.y).toBe(71);
    expect(world.packet.moved.y).toBe(-3);
    expect(world.packet.y - camera.getRenderPosition().y).toBeCloseTo(beforePacket - beforeCamera);
    expect(presentation.getPosition(world.packet, 0.5).y - camera.getRenderPosition().y)
      .toBeCloseTo(beforeInterpolated);
    expect(enemy.tile.y).toBe(84);
    expect(enemy.pingTarget).toEqual({ x: 10, y: 86 });
    expect(world.visitedPacketTiles.has('12,71')).toBe(true);
    expect(world.lagZones[0].tile.y).toBe(79);
    expect(world.quarantineWalls[0].tile.y).toBe(79);
    expect(world.quarantineWalls[0].source.y).toBe(1272);
    expect(collectibles.getCollectedCount()).toBe(1);
    expect(collectibles.getPointCount()).toBeGreaterThan(0);
    expect(collectibles.getPointCount()).toBeLessThanOrEqual(remaining + 600);
    expect(renderShift).toHaveBeenCalledExactlyOnceWith(384);
  });

  it('spawns a bounded wave beyond view and gives entrants the remaining power effect', () => {
    const { world, camera, movement, movementSystem, portals } = setup(19);
    const encounters = new EndlessEncounterSystem(world, camera, movement, movementSystem,
      new SeededRandom(91), portals);
    world.powerRemainingMs = 3500;
    world.isMoving = false;
    encounters.update(4999);
    expect(world.powerRemainingMs).toBe(3500);
    world.isMoving = true;
    encounters.update(4999);
    expect(world.enemies.some((enemy) => enemy.active)).toBe(false);
    world.powerRemainingMs = 3000;
    encounters.update(1);
    const active = world.enemies.filter((enemy) => enemy.active);
    expect(active.length).toBeGreaterThanOrEqual(1);
    expect(active.length).toBeLessThanOrEqual(3);
    expect(new Set(active.map((enemy) => enemy.key)).size).toBe(active.length);
    const bounds = camera.getVisibleGroundBounds();
    active.forEach((enemy) => {
      expect(enemy.y < bounds.minY - 48 || enemy.y > bounds.maxY + 48).toBe(true);
      expect(enemy.state.scared).toBe(true);
      expect(world.enemyScaredTimers.get(enemy)).toBeGreaterThan(0);
    });
    movement.setEntityTile(active[0], world.packet.tile);
    encounters.onPacketRespawn();
    expect(active[0].active).toBe(false);
  });

  it('clears only hazards intersecting the visible recovery region', () => {
    const { world, camera, movement, movementSystem, portals } = setup(20);
    camera.setViewport(800, 800);
    camera.snapToFollowTarget();
    const encounters = new EndlessEncounterSystem(world, camera, movement, movementSystem,
      new SeededRandom(91), portals);
    const y = world.packet.y;
    world.lagZones = [
      { tile: { x: 12, y: 60 }, x: world.packet.x, y, radius: 8, ageMs: 0, durationMs: 1000 },
      { tile: { x: 1, y: 60 }, x: 24, y, radius: 8, ageMs: 0, durationMs: 1000 },
    ];
    world.quarantineWalls = [
      { tile: { x: 12, y: 60 }, side: 'right', source: { x: 200, y }, ageMs: 0, durationMs: 1000 },
      { tile: { x: 1, y: 60 }, side: 'right', source: { x: 24, y }, ageMs: 0, durationMs: 1000 },
    ];
    encounters.onPacketRespawn();
    expect(world.lagZones.map((zone) => zone.tile.x)).toEqual([1]);
    expect(world.quarantineWalls.map((wall) => wall.tile.x)).toEqual([1]);
  });

  it('enters a staggered wave one original at a time from the same end', () => {
    const { world, camera, movement, movementSystem, portals } = setup(19);
    let calls = 0;
    const rng = { next: () => 0, int: (_maxExclusive: number) => {
      calls += 1;
      if (calls === 2) return 2; // Three selected originals.
      if (calls === 9) return 1; // Staggered formation after six roster swaps.
      return 0;
    } };
    const encounters = new EndlessEncounterSystem(world, camera, movement, movementSystem, rng, portals);
    encounters.update(5000);
    expect(world.enemies.filter((enemy) => enemy.active)).toHaveLength(1);
    encounters.update(399);
    expect(world.enemies.filter((enemy) => enemy.active)).toHaveLength(1);
    encounters.update(1);
    expect(world.enemies.filter((enemy) => enemy.active)).toHaveLength(2);
    encounters.update(400);
    const active = world.enemies.filter((enemy) => enemy.active);
    expect(active).toHaveLength(3);
    const bounds = camera.getVisibleGroundBounds();
    expect(active.every((enemy) => enemy.y < bounds.minY)).toBe(true);
  });

  it('defers a wave member until an offscreen corridor is available', () => {
    const { world, camera, movement, movementSystem, portals } = setup(18);
    camera.setZoom(0.2);
    camera.snapToFollowTarget();
    const encounters = new EndlessEncounterSystem(world, camera, movement, movementSystem,
      new SeededRandom(91), portals);
    encounters.update(5000);
    expect(world.enemies.some((enemy) => enemy.active)).toBe(false);
    camera.setZoom(5);
    camera.snapToFollowTarget();
    encounters.update(500);
    expect(world.enemies.some((enemy) => enemy.active)).toBe(true);
  });

  it('keeps the exact corridor offset and direction after a nonfinal hit', () => {
    const { world, movement } = setup();
    const enemy = world.enemies[1];
    enemy.active = true;
    enemy.state.free = true;
    movement.setEntityTile(enemy, world.packet.tile);
    world.packet.moved.y = 4;
    movement.syncEntityPosition(world.packet);
    world.packet.direction = { current: 'down', next: 'left' };
    const tile = world.packet.tile;
    const position = { x: world.packet.x, y: world.packet.y };
    const onRespawn = vi.fn(() => { enemy.active = false; });
    const collisions = new EnemyPacketCollisionSystem(world, movement, 1, onRespawn);
    collisions.update(0);
    expect(getGameState().lives).toBe(2);
    collisions.update(900);
    expect(world.packet.tile).toBe(tile);
    expect({ x: world.packet.x, y: world.packet.y }).toEqual(position);
    expect(world.packet.moved.y).toBe(4);
    expect(world.packet.direction).toEqual({ current: 'down', next: 'left' });
    expect(world.packet.deathRecoveryRemainingMs).toBe(1200);
    expect(onRespawn).toHaveBeenCalledOnce();
  });

  it('keeps the rolling window and uncollected pickup count bounded through long reversals', () => {
    const { stream, world, camera, movement, movementSystem, portals } = setup(222);
    const collectibles = new CollectibleSystem(world, undefined, stream.initialPickupSeed);
    const bonuses = new EndlessBonusSystem(world, stream, 222);
    expect(bonuses.getPickups()).toHaveLength(5);
    const hazards = new MazeHazardSystem(world, movement, new SeededRandom(11), collectibles);
    const streaming = new EndlessStreamingSystem(world, stream, portals, camera, collectibles, bonuses,
      movementSystem, hazards, { onEndlessShift: vi.fn() } as unknown as RenderSystem);
    const firstSection = stream.getSections()[2];
    const initialCollected = collectibles.getCollectedCount();
    movement.setEntityTile(world.packet, { x: 12, y: 47 });
    world.isMoving = false;
    streaming.update();
    expect(stream.getFirstIndex()).toBe(-2);
    world.isMoving = true;
    const directions = [...Array<'up'>(12).fill('up'), ...Array<'down'>(12).fill('down')];
    directions.forEach((direction, index) => {
      movement.setEntityTile(world.packet, { x: 12, y: direction === 'up' ? 47 : 72 });
      streaming.update();
      expect(stream.getSections()).toHaveLength(5);
      expect(world.map.tiles).toHaveLength(120);
      expect(world.map.topologyRevision).toBe(index + 1);
      expect(collectibles.getPointCount()).toBeLessThanOrEqual(25 * 120);
      expect(bonuses.getPickups()).toHaveLength(5);
      expect(world.visitedPacketTiles.size).toBeLessThanOrEqual(25 * 120);
    });
    expect(stream.getFirstIndex()).toBe(-2);
    expect(stream.getSections()[2]).not.toBe(firstSection);
    expect(collectibles.getCollectedCount()).toBe(initialCollected);
  });

  it('routes eaten bugs along physical corridors until they leave the camera', () => {
    const { world, camera, movement, movementSystem, portals } = setup(14);
    const enemy = world.enemies.find((candidate) => candidate.key === 'virus')!;
    movement.setEntityTile(enemy, { x: 12, y: 60 });
    enemy.active = true;
    enemy.state.dead = true;
    enemy.state.free = false;
    enemy.eatenElapsedMs = 420;
    const grid = world.collisionGrid;
    const navigation = new EnemyNavigationService(grid, 16, portals, 'physical');
    let moved = false;
    for (let frame = 0; frame < 1000 && enemy.active; frame += 1) {
      const previous = { ...enemy.tile };
      movementSystem.update(16);
      if (enemy.tile.x !== previous.x || enemy.tile.y !== previous.y) {
        moved = true;
        expect(navigation.getSteps(previous).some((step) => step.destination.x === enemy.tile.x
          && step.destination.y === enemy.tile.y)).toBe(true);
      }
    }
    expect(moved).toBe(true);
    expect(enemy.active).toBe(false);
    const bounds = camera.getVisibleGroundBounds();
    expect(enemy.y < bounds.minY - 48 || enemy.y > bounds.maxY + 48).toBe(true);
  });

  it('does not assign a patrol to an eaten Firewall when topology shifts', () => {
    const { world, movement, movementSystem } = setup(31);
    const firewall = world.enemies.find((enemy) => enemy.key === 'firewall')!;
    movement.setEntityTile(firewall, { x: 12, y: 60 });
    firewall.active = true;
    firewall.state.dead = true;
    firewall.state.free = false;
    firewall.eatenElapsedMs = 100;
    expect(() => movementSystem.onTopologyChanged()).not.toThrow();
    expect(firewall.state.dead).toBe(true);
  });
});
