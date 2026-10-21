import { describe, expect, it } from 'vitest';
import { GameStateStore } from '../state/gameState';
import { PacketEntity } from '../game/domain/entities/PacketEntity';
import { MovementRules } from '../game/domain/services/MovementRules';
import { PortalService } from '../game/domain/services/PortalService';
import { WorldState } from '../game/domain/world/WorldState';
import { CollectibleSystem } from '../game/systems/CollectibleSystem';
import { PowerupSystem } from '../game/systems/PowerupSystem';
import { EnemyPacketCollisionSystem } from '../game/systems/EnemyPacketCollisionSystem';
import { PacketMovementSystem } from '../game/systems/PacketMovementSystem';
import { EndlessMazeStream } from '../game/domain/world/EndlessMazeStream';
import { createCollisionTile, createMapFixture } from './fixtures/pointLayoutFixtures';
import { MechanicsDomainHarness } from './helpers/mechanicsDomainHarness';
import { OFFENSIVE_POWERUPS } from '../game/shared/offensivePowerups';

/** Builds an open authored corridor with scored pickups owned separately from weapon pickups. */
function corridor() {
  const { map, collisionGrid } = createMapFixture([Array.from({ length: 20 }, () => createCollisionTile())],
    [Array.from({ length: 20 }, () => 4)]);
  const packet = new PacketEntity({ x: 0, y: 0 }, 10, 10);
  const movement = new MovementRules(16);
  movement.setEntityTile(packet, packet.tile);
  const gameState = new GameStateStore(200, 3);
  const world = new WorldState({ map, collisionGrid, packet, tileSize: 16, packetSpawnTile: packet.tile,
    enemies: [], enemyJailBounds: { minX: 0, maxX: -1, y: -10 }, gameState });
  const collectibles = new CollectibleSystem(world, [{ tile: { x: 19, y: 0 }, x: 312, y: 8, kind: 'power' }]);
  const bonuses = { getPickups: () => [{ x: 296, y: 8 }] };
  const powerups = new PowerupSystem(world, movement, collectibles, bonuses);
  return { world, movement, collectibles, powerups };
}

/** Moves to an exposed pickup center and invokes the same collection boundary as runtime composition. */
function collectAt(harness: ReturnType<typeof corridor>, index = 0): void {
  const pickup = harness.world.powerupPickups[index];
  harness.movement.setEntityTile(harness.world.packet, { x: Math.floor(pickup.x / 16), y: Math.floor(pickup.y / 16) });
  harness.powerups.collect();
}

describe('solo offensive powerups', () => {
  it.each(['default-map', 'demo-map'] as const)('uses portal return damage and the normal death/respawn flow on %s', (fixture) => {
    const harness = new MechanicsDomainHarness({ fixture, enemyCount: 0, autoStartSystems: false });
    const { world, movementRules } = harness;
    const collision = new EnemyPacketCollisionSystem(world, movementRules, undefined,
      () => system.reset(), () => system.clearForDeath());
    const system = new PowerupSystem(world, movementRules, new CollectibleSystem(world),
      undefined, undefined, harness.portalService, () => collision.hitPacket());
    try {
      const pair = world.map.portalPairs!.find(({ from, to }) => from.y === to.y)!;
      const left = Math.min(pair.from.x, pair.to.x);
      movementRules.setEntityTile(world.packet, { x: left + 2, y: pair.from.y });
      world.packet.direction.current = 'left';
      const position = { x: world.packet.x, y: world.packet.y };
      const before = world.gameState.getSnapshot();
      system.equipDevelopment('laser'); system.activate();
      system.update(650);
      expect(world.packet.deathAnimationRemainingMs).toBe(0);
      world.isMoving = false; system.update(500);
      expect(world.powerupCombat.clockMs).toBeCloseTo(650);
      world.isMoving = true; system.update(170);
      expect(world.packet).toMatchObject({ ...position, deathAnimationRemainingMs: 900 });
      expect(world.gameState.getSnapshot()).toEqual({ score: before.score, lives: before.lives - 1 });
      expect(world.powerupCombat.casts).toEqual([]);
      system.update(100);
      expect(world.gameState.getSnapshot().lives).toBe(before.lives - 1);
      collision.update(900);
      expect(world.packet.deathAnimationRemainingMs).toBe(0);
      expect(world.packet.tile).toEqual(world.packetSpawnTile);
      expect(world.powerupCombat.effects).toEqual([]);
    } finally { system.destroy(); harness.destroy(); }
  });

  it('places two of each weapon away from cores, multipliers, and spawns without affecting scored completion', () => {
    const { world, collectibles, powerups } = corridor();
    expect(world.powerupPickups).toHaveLength(8);
    for (const kind of OFFENSIVE_POWERUPS) expect(world.powerupPickups.filter((pickup) => pickup.kind === kind)).toHaveLength(2);
    expect(new Set(world.powerupPickups.map((pickup) => pickup.x)).size).toBe(8);
    expect(world.powerupPickups.every((pickup) => ![8, 296, 312].includes(pickup.x))).toBe(true);
    expect(collectibles.getPointCount()).toBe(1);
    powerups.destroy();
  });

  it('replaces one inventory slot, consumes once, allows collection during casting, and awards no score', () => {
    const harness = corridor();
    collectAt(harness);
    const first = harness.world.gameState.getPowerupStatus().kind;
    collectAt(harness, 2);
    expect(harness.world.gameState.getPowerupStatus().kind).not.toBe(first);
    expect(harness.powerups.activate()).toBe(true);
    expect(harness.world.gameState.getPowerupStatus()).toEqual({ kind: null, casting: true });
    expect(harness.powerups.activate()).toBe(false);
    collectAt(harness);
    const next = harness.world.gameState.getPowerupStatus().kind;
    expect(next).not.toBeNull();
    expect(harness.powerups.activate()).toBe(false);
    harness.powerups.update(2200);
    expect(harness.world.gameState.getPowerupStatus()).toEqual({ kind: next, casting: false });
    expect(harness.powerups.activate()).toBe(true);
    expect(harness.world.gameState.getSnapshot()).toEqual({ score: 200, lives: 3 });
    expect(harness.collectibles.getPointCount()).toBe(1);
    harness.powerups.destroy();
  });

  it('freezes combat while paused and clears inventory/casts on death, respawn, refill and disposal', () => {
    const harness = corridor();
    collectAt(harness);
    harness.powerups.activate();
    harness.world.isMoving = false;
    harness.powerups.update(1000);
    expect(harness.world.powerupCombat.clockMs).toBe(0);
    harness.world.isMoving = true;
    harness.powerups.clearForDeath();
    expect(harness.world.powerupCombat.casts).toHaveLength(0);
    expect(harness.world.gameState.getPowerupStatus().kind).toBeNull();
    harness.powerups.reset(true);
    expect(harness.world.powerupPickups).toHaveLength(8);
    collectAt(harness);
    harness.powerups.reset();
    expect(harness.world.powerupPickups).toHaveLength(7);
    expect(harness.world.gameState.getPowerupStatus()).toEqual({ kind: null, casting: false });
    harness.powerups.destroy();
    expect(harness.world.powerupPickups).toHaveLength(0);
  });

  it('holds the exact solo position and facing through laser afterglow, then resumes buffered movement', () => {
    const { world, movement, powerups } = corridor();
    const packetMovement = new PacketMovementSystem(world, movement, new PortalService(world.collisionGrid));
    movement.setEntityTile(world.packet, { x: 5, y: 0 });
    packetMovement.update(10);
    const position = { x: world.packet.x, y: world.packet.y };
    world.packet.deathRecoveryRemainingMs = 900;
    powerups.equipDevelopment('laser');
    expect(powerups.activate()).toBe(true);
    world.packet.direction.next = 'left';
    packetMovement.update(1500);
    powerups.update(1500);
    expect(world.packet).toMatchObject({ ...position, angle: 0, direction: { current: 'right', next: 'left' },
      deathRecoveryRemainingMs: 0 });
    expect(world.powerupCombat.casts).toHaveLength(1);
    packetMovement.update(300);
    powerups.update(300);
    expect(world.packet).toMatchObject(position);
    expect(world.powerupCombat.casts).toHaveLength(0);
    packetMovement.update(10);
    expect(world.packet.direction.current).toBe('left');
    expect(world.packet.x).toBeLessThan(position.x);
    powerups.destroy();
  });

  it('makes a ranged enemy harmless immediately, then uses its existing jail return cycle without eating points', () => {
    const harness = new MechanicsDomainHarness({ seed: 4102, fixture: 'default-map', enemyCount: 1, autoStartSystems: false });
    try {
      const enemy = harness.world.enemies[0];
      harness.movementRules.setEntityTile(harness.world.packet, { x: 18, y: 18 });
      harness.movementRules.setEntityTile(enemy, { x: 19, y: 18 });
      enemy.state.free = true;
      const system = new PowerupSystem(harness.world, harness.movementRules, new CollectibleSystem(harness.world));
      system.equipDevelopment('blast');
      system.activate();
      system.update(1200);
      expect(enemy.state).toMatchObject({ free: false, scared: false, dead: true });
      expect(enemy.defeatCause).toBe('weapon');
      expect(harness.world.packet.enemyEatRemainingMs).toBe(0);
      expect(harness.world.gameState.getSnapshot().score).toBe(0);
      harness.movementRules.setEntityTile(harness.world.packet, { x: 1, y: 1 });
      let sawExiting = false;
      for (let tick = 0; tick < 900 && !enemy.state.free; tick += 1) {
        harness.stepTick();
        sawExiting ||= harness.world.enemiesExitingJail.has(enemy);
      }
      expect(sawExiting).toBe(true);
      expect(enemy.state.free).toBe(true);
      system.destroy();
    } finally { harness.destroy(); }
  });

  it('launches along the player corridor after a windup turn on the authored demo maze', () => {
    const harness = new MechanicsDomainHarness({ fixture: 'demo-map', enemyCount: 0, autoStartSystems: false });
    const system = new PowerupSystem(harness.world, harness.movementRules, new CollectibleSystem(harness.world));
    try {
      harness.movementRules.setEntityTile(harness.world.packet, { x: 2, y: 1 });
      system.equipDevelopment('missile');
      expect(system.activate()).toBe(true);
      harness.world.packet.direction.next = 'down';
      for (let frame = 0; frame < 60; frame += 1) {
        harness.packetSystem.update(1000 / 60);
        system.update(1000 / 60);
      }
      expect(harness.world.packet.direction.current).toBe('down');
      expect(harness.world.powerupCombat.projectiles).toHaveLength(1);
      const missile = harness.world.powerupCombat.projectiles[0];
      expect(missile).toMatchObject({ x: 40, angle: Math.PI / 2 });
      expect(missile.y).toBeCloseTo(84);
    } finally { system.destroy(); harness.destroy(); }
  });

  it('keeps retained Endless weapons and released effects aligned and replaces only evicted section content', () => {
    const stream = new EndlessMazeStream(73);
    const packet = new PacketEntity({ x: 12, y: 60 }, 10, 10);
    const movement = new MovementRules(16);
    movement.setEntityTile(packet, packet.tile);
    const { collisionGrid } = createMapFixture(stream.map.tiles.map((row) => row.map((tile) => tile.collision)));
    const world = new WorldState({ map: stream.map, collisionGrid, packet, tileSize: 16, packetSpawnTile: packet.tile,
      enemies: [], enemyJailBounds: { minX: 0, maxX: -1, y: -10 }, gameState: new GameStateStore() });
    world.runMode = 'endless';
    const collectibles = new CollectibleSystem(world, undefined, stream.initialPickupSeed);
    const system = new PowerupSystem(world, movement, collectibles, undefined, stream);
    expect(world.powerupPickups).toHaveLength(5);
    const retained = world.powerupPickups.find((pickup) => pickup.sectionIndex === 0)!;
    const originalY = retained.y;
    system.equipDevelopment('missile');
    system.activate();
    system.update(1000);
    const projectileY = world.powerupCombat.projectiles[0]?.y;
    const cornered = { id: world.powerupCombat.nextId++, ownerId: 'packet', targetId: null,
      x: packet.x, y: packet.y, angle: Math.PI / 2, elapsedMs: 200,
      turns: [{ x: packet.x, y: packet.y - 16, angle: Math.PI / 2, elapsedMs: 100 }] };
    world.powerupCombat.projectiles.push(cornered);
    const beam = { id: world.powerupCombat.nextId++, ownerId: 'packet', kind: 'laser' as const,
      role: 'attack' as const, x: packet.x, y: packet.y, angle: 0, elapsedMs: 700, durationMs: 1800,
      radius: 3.4, length: 100, laserSegments: [
        { x: packet.x + 3, y: packet.y, length: 100, delayMs: 0, end: 'portal' as const },
        { x: 0, y: packet.y, length: 400, delayMs: 170, end: 'portal' as const },
      ] };
    world.powerupCombat.effects.push(beam);
    const { rows } = stream.shift('down');
    packet.tile.y += rows;
    packet.y += rows * 16;
    world.packetSpawnTile.y += rows;
    world.collisionGrid.replaceGrid(world.map.tiles.map((row) => row.map((tile) => tile.collision)));
    const incoming = stream.getSections()[4];
    collectibles.shiftEndlessSection(incoming, rows, 4);
    system.shiftEndlessSection(incoming, rows, 4);
    expect(world.powerupPickups).toHaveLength(5);
    expect(world.powerupPickups.find((pickup) => pickup.id === retained.id)?.y).toBe(originalY + rows * 16);
    expect(world.powerupPickups.some((pickup) => pickup.sectionIndex === -2)).toBe(false);
    expect(world.powerupPickups.some((pickup) => pickup.sectionIndex === 3)).toBe(true);
    if (projectileY !== undefined) expect(world.powerupCombat.projectiles[0]?.y).toBe(projectileY + rows * 16);
    expect(world.powerupCombat.projectiles.find((projectile) => projectile.id === cornered.id)).toEqual({
      ...cornered, y: cornered.y + rows * 16,
      turns: [{ ...cornered.turns[0], y: cornered.turns[0].y + rows * 16 }],
    });
    expect(world.powerupCombat.effects.find((effect) => effect.id === beam.id)?.laserSegments)
      .toEqual(beam.laserSegments.map((segment) => ({ ...segment, y: segment.y + rows * 16 })));
    system.destroy();
  });
});
