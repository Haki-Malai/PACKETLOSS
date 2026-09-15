import { beforeEach, describe, expect, it } from 'vitest';
import {
  PACKET_DEATH_ANIMATION,
  PACKET_DEATH_RECOVERY,
  PACKET_PORTAL_BLINK,
} from '../config/constants';
import { getGameState, resetGameState } from '../state/gameState';
import { EnemyEntity } from '../game/domain/entities/EnemyEntity';
import { PacketEntity } from '../game/domain/entities/PacketEntity';
import { MovementRules } from '../game/domain/services/MovementRules';
import { PortalService } from '../game/domain/services/PortalService';
import { WorldState } from '../game/domain/world/WorldState';
import { CollectibleSystem } from '../game/systems/CollectibleSystem';
import { EnemyPacketCollisionSystem } from '../game/systems/EnemyPacketCollisionSystem';
import { PacketMovementSystem } from '../game/systems/PacketMovementSystem';
import { createCollisionTile, createMapFixture } from './fixtures/pointLayoutFixtures';
import { MechanicsDomainHarness } from './helpers/mechanicsDomainHarness';

function expectEnemyTileUnchanged(enemy: EnemyEntity, tile: { x: number; y: number }): void {
  expect(enemy.tile).toEqual(tile);
}

describe('EnemyPacketCollisionSystem', () => {
  beforeEach(() => {
    resetGameState(0, 3);
  });

  it('holds Packet at contact for 900 ms, then respawns with recovery while suppressing movement and collection', () => {
    const { map, collisionGrid } = createMapFixture([[createCollisionTile(), createCollisionTile(), createCollisionTile()]]);
    map.collectibleObjects = [{ type: 'pellet', x: 8, y: 8 }, { type: 'power-pellet', x: 24, y: 8 }];
    const packet = new PacketEntity({ x: 0, y: 0 }, 10, 10);
    const enemy = new EnemyEntity({
      key: 'firewall', tile: { x: 1, y: 0 }, direction: 'left', speed: 1, displayWidth: 11, displayHeight: 11,
    });
    const movement = new MovementRules(16);
    movement.setEntityTile(packet, packet.tile);
    movement.setEntityTile(enemy, enemy.tile);
    enemy.state.free = true;
    const world = new WorldState({
      map, collisionGrid, tileSize: 16, packet, packetSpawnTile: { x: 0, y: 0 }, enemies: [enemy],
      enemyJailBounds: { minX: 2, maxX: 2, y: 0 },
    });
    const collisions = new EnemyPacketCollisionSystem(world, movement);
    const packetMovement = new PacketMovementSystem(world, movement, new PortalService(collisionGrid, []));
    const collectibles = new CollectibleSystem(world);
    collectibles.update(0);
    expect(collectibles.getEatEffects()).toHaveLength(1);
    movement.setEntityTile(packet, { x: 1, y: 0 });
    packet.direction.current = 'left';
    packet.direction.next = 'up';
    const contactTile = packet.tile;

    collisions.update();
    expect(getGameState().lives).toBe(2);
    expect(packet.deathAnimationRemainingMs).toBe(PACKET_DEATH_ANIMATION.durationMs);
    expect(packet.deathRecoveryRemainingMs).toBe(0);
    packetMovement.update(899);
    collectibles.update(collectibles.getEatEffects()[0].durationMs);
    collisions.update(899);
    expect(packet.tile).toBe(contactTile);
    expect([packet.x, packet.y]).toEqual([24, 8]);
    expect(packet.direction).toEqual({ current: 'left', next: 'up' });
    expect(packet.deathAnimationRemainingMs).toBe(1);
    expect(getGameState()).toEqual({ lives: 2, score: 10 });
    expect(collectibles.getPointCount()).toBe(1);
    expect(collectibles.getEatEffects()).toHaveLength(0);
    expect(enemy.state.scared).toBe(false);

    enemy.state.scared = true;
    collisions.update();
    expectEnemyTileUnchanged(enemy, { x: 1, y: 0 });
    expect(getGameState().score).toBe(10);
    collisions.update(1);
    expect(packet.deathAnimationRemainingMs).toBe(0);
    expect(packet.tile).toEqual(world.packetSpawnTile);
    expect(packet.tile).not.toBe(contactTile);
    expect([packet.x, packet.y]).toEqual([8, 8]);
    expect(packet.direction).toEqual({ current: 'right', next: 'right' });
    expect(packet.portalBlinkRemainingMs).toBe(0);
    expect(packet.deathRecoveryRemainingMs).toBe(PACKET_DEATH_RECOVERY.durationMs);
    expect(packet.deathRecoveryVisible).toBe(true);
    expectEnemyTileUnchanged(enemy, { x: 1, y: 0 });
    expect(getGameState()).toEqual({ lives: 2, score: 10 });
  });

  it('applies life loss when adjacent-tile bodies overlap in world space', () => {
    const harness = new MechanicsDomainHarness({ seed: 4111, fixture: 'default-map', enemyCount: 1, autoStartSystems: false });

    try {
      const enemy = harness.world.enemies[0];
      if (!enemy) {
        throw new Error('expected one enemy');
      }

      harness.movementRules.setEntityTile(harness.world.packet, { x: 20, y: 20 });
      harness.movementRules.setEntityTile(enemy, { x: 21, y: 20 });
      enemy.state.free = true;
      enemy.state.scared = false;

      harness.world.packet.moved.x = 3;
      harness.world.packet.moved.y = 0;
      harness.movementRules.syncEntityPosition(harness.world.packet);

      enemy.moved.x = -3;
      enemy.moved.y = 0;
      harness.movementRules.syncEntityPosition(enemy);

      harness.enemyPacketCollisionSystem.update();

      expect(getGameState().lives).toBe(2);
      expect(harness.world.packet.tile).toEqual({ x: 20, y: 20 });
      expect(harness.world.packet.x).toBe(331);
      expect(harness.world.packet.deathAnimationRemainingMs).toBe(PACKET_DEATH_ANIMATION.durationMs);
    } finally {
      harness.destroy();
    }
  });

  it('restores every original enemy and clears transient threats when a nonfinal death respawns', () => {
    const harness = new MechanicsDomainHarness({ seed: 4108, fixture: 'default-map', enemyCount: 2 });

    try {
      const initialTiles = harness.world.enemies.map((enemy) => ({ ...enemy.tile }));
      const [dangerous, returning] = harness.world.enemies;
      const contactTile = { x: 18, y: 18 };
      harness.movementRules.setEntityTile(harness.world.packet, contactTile);
      harness.movementRules.setEntityTile(dangerous, contactTile);
      harness.movementRules.setEntityTile(returning, { x: 19, y: 18 });
      dangerous.state.free = true;
      returning.state = { free: false, soonFree: false, scared: true, dead: true, animation: 'scared' };
      returning.eatenElapsedMs = 100;
      harness.world.enemyScaredTimers.set(returning, 500);
      harness.world.enemyEffects = [{ kind: 'ping', x: 8, y: 8, radius: 16, ageMs: 0, durationMs: 600 }];
      harness.world.lagZones = [{
        tile: { x: 17, y: 18 }, x: 280, y: 296, radius: 8, ageMs: 0, durationMs: 4000,
      }];

      harness.enemyPacketCollisionSystem.update();
      expect(harness.world.enemies.map((enemy) => enemy.tile)).not.toEqual(initialTiles);
      harness.enemyPacketCollisionSystem.update(PACKET_DEATH_ANIMATION.durationMs);

      expect(getGameState().lives).toBe(2);
      expect(harness.world.enemies.map((enemy) => enemy.tile)).toEqual(initialTiles);
      expect(harness.world.enemies.every((enemy) => enemy.active && !enemy.state.free
        && enemy.state.soonFree && !enemy.state.scared && !enemy.state.dead)).toBe(true);
      expect(harness.world.enemies.every((enemy) => enemy.eatenElapsedMs === null)).toBe(true);
      expect(harness.world.enemyScaredTimers.size).toBe(0);
      expect(harness.world.enemyEffects).toEqual([]);
      expect(harness.world.lagZones).toEqual([]);
    } finally {
      harness.destroy();
    }
  });

  it('keeps an eaten enemy at contact, then walks home before re-entering normal jail release flow', () => {
    const harness = new MechanicsDomainHarness({ seed: 4102, fixture: 'default-map', enemyCount: 1, autoStartSystems: false });

    try {
      const enemy = harness.world.enemies[0];
      if (!enemy) {
        throw new Error('expected one enemy');
      }

      harness.movementRules.setEntityTile(harness.world.packet, { x: 18, y: 18 });
      harness.movementRules.setEntityTile(enemy, { x: 18, y: 18 });
      enemy.state.free = true;
      enemy.state.scared = true;

      harness.enemyPacketCollisionSystem.update();

      expect(getGameState().lives).toBe(3);
      expect(getGameState().score).toBe(200);
      expect(enemy.tile).toEqual({ x: 18, y: 18 });
      expect(enemy.state.free).toBe(false);
      expect(enemy.state.scared).toBe(false);
      expect(enemy.state.soonFree).toBe(false);
      expect(enemy.state.dead).toBe(true);

      harness.enemyReleaseSystem.update();
      expect(enemy.tile).toEqual({ x: 18, y: 18 });
      harness.movementRules.setEntityTile(harness.world.packet, { x: 1, y: 1 });
      let sawExitingPhase = false;
      for (let tick = 0; tick < 900 && !enemy.state.free; tick += 1) {
        harness.stepTick();
        sawExitingPhase ||= harness.world.enemiesExitingJail.has(enemy);
      }

      expect(sawExitingPhase).toBe(true);
      expect(enemy.state.free).toBe(true);
      expect(enemy.state.soonFree).toBe(false);
    } finally {
      harness.destroy();
    }
  });

  it('ends the final life at 900 ms without respawn, recovery, or further collision scoring', () => {
    const harness = new MechanicsDomainHarness({ seed: 4103, fixture: 'default-map', enemyCount: 1, autoStartSystems: false });

    try {
      resetGameState(0, 1);
      const enemy = harness.world.enemies[0];
      if (!enemy) {
        throw new Error('expected one enemy');
      }

      const contactTile = { x: 18, y: 18 };
      harness.movementRules.setEntityTile(harness.world.packet, contactTile);
      harness.movementRules.setEntityTile(enemy, contactTile);
      enemy.state.free = true;

      harness.enemyPacketCollisionSystem.update();
      expect(getGameState().lives).toBe(0);

      harness.enemyPacketCollisionSystem.update(899);
      expect(harness.world.outcome).toBeNull();
      expect(harness.world.packet.deathAnimationRemainingMs).toBe(1);
      harness.enemyPacketCollisionSystem.update(1);
      expect(harness.world.outcome).toBe('lost');
      expect(harness.world.packet.tile).toEqual(contactTile);
      expect(enemy.tile).toEqual(contactTile);
      expect(harness.world.packet.deathRecoveryRemainingMs).toBe(0);
      enemy.state.scared = true;
      harness.enemyPacketCollisionSystem.update();
      expect(getGameState()).toEqual({ score: 0, lives: 0 });
    } finally {
      harness.destroy();
    }
  });

  it('rounds every scared-enemy chain award with the current level multiplier', () => {
    const harness = new MechanicsDomainHarness({ seed: 4109, fixture: 'default-map', enemyCount: 2 });

    try {
      harness.world.levelMultiplier = 1.25;
      const [first, second] = harness.world.enemies;
      const collisionTile = { x: 18, y: 18 };
      harness.movementRules.setEntityTile(harness.world.packet, collisionTile);
      harness.movementRules.setEntityTile(first, collisionTile);
      harness.movementRules.setEntityTile(second, collisionTile);
      first.state.free = true;
      first.state.scared = true;
      second.state.free = true;
      second.state.scared = true;

      harness.enemyPacketCollisionSystem.update();
      harness.enemyPacketCollisionSystem.update();

      expect(getGameState()).toEqual({ score: 750, lives: 3 });
      expect(first.state.dead).toBe(true);
      expect(second.state.dead).toBe(true);
    } finally {
      harness.destroy();
    }
  });

  it('ignores collisions while Packet death recovery invulnerability is active', () => {
    const harness = new MechanicsDomainHarness({ seed: 4105, fixture: 'default-map', enemyCount: 1, autoStartSystems: false });

    try {
      const enemy = harness.world.enemies[0];
      if (!enemy) {
        throw new Error('expected one enemy');
      }

      harness.movementRules.setEntityTile(harness.world.packet, { x: 13, y: 13 });
      harness.movementRules.setEntityTile(enemy, { x: 13, y: 13 });
      enemy.state.free = true;

      harness.enemyPacketCollisionSystem.update();
      expect(getGameState().lives).toBe(2);

      harness.enemyPacketCollisionSystem.update(PACKET_DEATH_ANIMATION.durationMs);
      harness.movementRules.setEntityTile(harness.world.packet, { x: 13, y: 13 });
      harness.enemyPacketCollisionSystem.update();
      expect(getGameState().lives).toBe(2);
    } finally {
      harness.destroy();
    }
  });

  it('suppresses non-scared packet-hit collisions while post-portal shield is active', () => {
    const harness = new MechanicsDomainHarness({ seed: 4106, fixture: 'default-map', enemyCount: 1, autoStartSystems: false });

    try {
      const enemy = harness.world.enemies[0];
      if (!enemy) {
        throw new Error('expected one enemy');
      }

      const collisionTile = { x: 16, y: 16 };
      harness.movementRules.setEntityTile(harness.world.packet, collisionTile);
      harness.movementRules.setEntityTile(enemy, collisionTile);
      harness.world.packet.portalBlinkRemainingMs = PACKET_PORTAL_BLINK.durationMs;
      enemy.state.free = true;
      enemy.state.scared = false;

      harness.enemyPacketCollisionSystem.update();

      expect(getGameState().lives).toBe(3);
      expect(harness.world.packet.tile).toEqual(collisionTile);
      expect(harness.world.packet.deathRecoveryRemainingMs).toBe(0);
    } finally {
      harness.destroy();
    }
  });

  it('still applies enemy-hit collisions while post-portal shield is active', () => {
    const harness = new MechanicsDomainHarness({ seed: 4107, fixture: 'default-map', enemyCount: 1, autoStartSystems: false });

    try {
      const enemy = harness.world.enemies[0];
      if (!enemy) {
        throw new Error('expected one enemy');
      }

      const collisionTile = { x: 17, y: 17 };
      harness.movementRules.setEntityTile(harness.world.packet, collisionTile);
      harness.movementRules.setEntityTile(enemy, collisionTile);
      harness.world.packet.portalBlinkRemainingMs = PACKET_PORTAL_BLINK.durationMs;
      enemy.state.free = true;
      enemy.state.scared = true;

      harness.enemyPacketCollisionSystem.update();

      expect(getGameState().lives).toBe(3);
      expect(getGameState().score).toBe(200);
      expect(enemy.tile).toEqual(collisionTile);
      expect(enemy.state.dead).toBe(true);
      expect(enemy.state.free).toBe(false);
      expect(enemy.state.scared).toBe(false);
    } finally {
      harness.destroy();
    }
  });

  it('applies at most one life loss when multiple enemies collide in the same tick', () => {
    const harness = new MechanicsDomainHarness({ seed: 4104, fixture: 'default-map', enemyCount: 2, autoStartSystems: false });

    try {
      const [first, second] = harness.world.enemies;
      if (!first || !second) {
        throw new Error('expected two enemies');
      }

      harness.movementRules.setEntityTile(harness.world.packet, { x: 24, y: 24 });
      harness.movementRules.setEntityTile(first, { x: 24, y: 24 });
      harness.movementRules.setEntityTile(second, { x: 24, y: 24 });
      first.state.free = true;
      second.state.free = true;

      harness.enemyPacketCollisionSystem.update();

      expect(getGameState().lives).toBe(2);
    } finally {
      harness.destroy();
    }
  });
});
