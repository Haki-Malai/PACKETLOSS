import { beforeEach, describe, expect, it } from 'vitest';
import {
  PACKET_DEATH_ANIMATION,
  PACKET_DEATH_RECOVERY,
  PACKET_PORTAL_BLINK,
} from '../config/constants';
import { getGameState, resetGameState } from '../state/gameState';
import { GhostEntity } from '../game/domain/entities/GhostEntity';
import { PacketEntity } from '../game/domain/entities/PacketEntity';
import { MovementRules } from '../game/domain/services/MovementRules';
import { PortalService } from '../game/domain/services/PortalService';
import { WorldState } from '../game/domain/world/WorldState';
import { CollectibleSystem } from '../game/systems/CollectibleSystem';
import { GhostPacketCollisionSystem } from '../game/systems/GhostPacketCollisionSystem';
import { PacketMovementSystem } from '../game/systems/PacketMovementSystem';
import { createCollisionTile, createMapFixture } from './fixtures/pointLayoutFixtures';
import { MechanicsDomainHarness } from './helpers/mechanicsDomainHarness';

function expectGhostTileUnchanged(ghost: GhostEntity, tile: { x: number; y: number }): void {
  expect(ghost.tile).toEqual(tile);
}

describe('GhostPacketCollisionSystem', () => {
  beforeEach(() => {
    resetGameState(0, 3);
  });

  it('holds Packet at contact for 900 ms, then respawns with recovery while suppressing movement and collection', () => {
    const { map, collisionGrid } = createMapFixture([[createCollisionTile(), createCollisionTile(), createCollisionTile()]]);
    map.collectibleObjects = [{ type: 'pellet', x: 8, y: 8 }, { type: 'power-pellet', x: 24, y: 8 }];
    const packet = new PacketEntity({ x: 0, y: 0 }, 10, 10);
    const ghost = new GhostEntity({
      key: 'blinky', tile: { x: 1, y: 0 }, direction: 'left', speed: 1, displayWidth: 11, displayHeight: 11,
    });
    const movement = new MovementRules(16);
    movement.setEntityTile(packet, packet.tile);
    movement.setEntityTile(ghost, ghost.tile);
    ghost.state.free = true;
    const world = new WorldState({
      map, collisionGrid, tileSize: 16, packet, packetSpawnTile: { x: 0, y: 0 }, ghosts: [ghost],
      ghostJailBounds: { minX: 2, maxX: 2, y: 0 },
    });
    const collisions = new GhostPacketCollisionSystem(world, movement);
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
    collectibles.update(96);
    collisions.update(899);
    expect(packet.tile).toBe(contactTile);
    expect([packet.x, packet.y]).toEqual([24, 8]);
    expect(packet.direction).toEqual({ current: 'left', next: 'up' });
    expect(packet.deathAnimationRemainingMs).toBe(1);
    expect(getGameState()).toEqual({ lives: 2, score: 10 });
    expect(collectibles.getPointCount()).toBe(1);
    expect(collectibles.getEatEffects()).toHaveLength(0);
    expect(ghost.state.scared).toBe(false);

    ghost.state.scared = true;
    collisions.update();
    expectGhostTileUnchanged(ghost, { x: 1, y: 0 });
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
    expectGhostTileUnchanged(ghost, { x: 1, y: 0 });
    expect(getGameState()).toEqual({ lives: 2, score: 10 });
  });

  it('applies life loss when adjacent-tile bodies overlap in world space', () => {
    const harness = new MechanicsDomainHarness({ seed: 4111, fixture: 'default-map', ghostCount: 1, autoStartSystems: false });

    try {
      const ghost = harness.world.ghosts[0];
      if (!ghost) {
        throw new Error('expected one ghost');
      }

      harness.movementRules.setEntityTile(harness.world.packet, { x: 20, y: 20 });
      harness.movementRules.setEntityTile(ghost, { x: 21, y: 20 });
      ghost.state.free = true;
      ghost.state.scared = false;

      harness.world.packet.moved.x = 3;
      harness.world.packet.moved.y = 0;
      harness.movementRules.syncEntityPosition(harness.world.packet);

      ghost.moved.x = -3;
      ghost.moved.y = 0;
      harness.movementRules.syncEntityPosition(ghost);

      harness.ghostPacketCollisionSystem.update();

      expect(getGameState().lives).toBe(2);
      expect(harness.world.packet.tile).toEqual({ x: 20, y: 20 });
      expect(harness.world.packet.x).toBe(331);
      expect(harness.world.packet.deathAnimationRemainingMs).toBe(PACKET_DEATH_ANIMATION.durationMs);
    } finally {
      harness.destroy();
    }
  });

  it('applies ghost-hit outcome when ghost is scared and re-enters normal jail release flow', () => {
    const harness = new MechanicsDomainHarness({ seed: 4102, fixture: 'default-map', ghostCount: 1, autoStartSystems: false });

    try {
      const ghost = harness.world.ghosts[0];
      if (!ghost) {
        throw new Error('expected one ghost');
      }

      harness.movementRules.setEntityTile(harness.world.packet, { x: 18, y: 18 });
      harness.movementRules.setEntityTile(ghost, { x: 18, y: 18 });
      ghost.state.free = true;
      ghost.state.scared = true;

      harness.ghostPacketCollisionSystem.update();

      expect(getGameState().lives).toBe(3);
      expect(getGameState().score).toBe(200);
      expect(ghost.tile).toEqual(harness.world.ghostJailReturnTile);
      expect(ghost.state.free).toBe(false);
      expect(ghost.state.scared).toBe(false);
      expect(ghost.state.soonFree).toBe(true);

      harness.ghostReleaseSystem.update();
      harness.movementRules.setEntityTile(harness.world.packet, { x: 1, y: 1 });
      let sawExitingPhase = false;
      for (let tick = 0; tick < 900 && !ghost.state.free; tick += 1) {
        harness.stepTick();
        sawExitingPhase ||= harness.world.ghostsExitingJail.has(ghost);
      }

      expect(sawExitingPhase).toBe(true);
      expect(ghost.state.free).toBe(true);
      expect(ghost.state.soonFree).toBe(false);
    } finally {
      harness.destroy();
    }
  });

  it('clamps lives at zero when additional collisions happen after recovery expires', () => {
    const harness = new MechanicsDomainHarness({ seed: 4103, fixture: 'default-map', ghostCount: 1, autoStartSystems: false });

    try {
      resetGameState(0, 1);
      const ghost = harness.world.ghosts[0];
      if (!ghost) {
        throw new Error('expected one ghost');
      }

      harness.movementRules.setEntityTile(harness.world.packet, harness.world.packetSpawnTile);
      harness.movementRules.setEntityTile(ghost, harness.world.packetSpawnTile);
      ghost.state.free = true;

      harness.ghostPacketCollisionSystem.update();
      expect(getGameState().lives).toBe(0);

      harness.ghostPacketCollisionSystem.update(PACKET_DEATH_ANIMATION.durationMs);
      harness.packetSystem.update(PACKET_DEATH_RECOVERY.durationMs);
      harness.ghostPacketCollisionSystem.update();
      expect(getGameState().lives).toBe(0);
    } finally {
      harness.destroy();
    }
  });

  it('ignores collisions while Packet death recovery invulnerability is active', () => {
    const harness = new MechanicsDomainHarness({ seed: 4105, fixture: 'default-map', ghostCount: 1, autoStartSystems: false });

    try {
      const ghost = harness.world.ghosts[0];
      if (!ghost) {
        throw new Error('expected one ghost');
      }

      harness.movementRules.setEntityTile(harness.world.packet, { x: 13, y: 13 });
      harness.movementRules.setEntityTile(ghost, { x: 13, y: 13 });
      ghost.state.free = true;

      harness.ghostPacketCollisionSystem.update();
      expect(getGameState().lives).toBe(2);

      harness.ghostPacketCollisionSystem.update(PACKET_DEATH_ANIMATION.durationMs);
      harness.movementRules.setEntityTile(harness.world.packet, { x: 13, y: 13 });
      harness.ghostPacketCollisionSystem.update();
      expect(getGameState().lives).toBe(2);
    } finally {
      harness.destroy();
    }
  });

  it('suppresses non-scared packet-hit collisions while post-portal shield is active', () => {
    const harness = new MechanicsDomainHarness({ seed: 4106, fixture: 'default-map', ghostCount: 1, autoStartSystems: false });

    try {
      const ghost = harness.world.ghosts[0];
      if (!ghost) {
        throw new Error('expected one ghost');
      }

      const collisionTile = { x: 16, y: 16 };
      harness.movementRules.setEntityTile(harness.world.packet, collisionTile);
      harness.movementRules.setEntityTile(ghost, collisionTile);
      harness.world.packet.portalBlinkRemainingMs = PACKET_PORTAL_BLINK.durationMs;
      ghost.state.free = true;
      ghost.state.scared = false;

      harness.ghostPacketCollisionSystem.update();

      expect(getGameState().lives).toBe(3);
      expect(harness.world.packet.tile).toEqual(collisionTile);
      expect(harness.world.packet.deathRecoveryRemainingMs).toBe(0);
    } finally {
      harness.destroy();
    }
  });

  it('still applies ghost-hit collisions while post-portal shield is active', () => {
    const harness = new MechanicsDomainHarness({ seed: 4107, fixture: 'default-map', ghostCount: 1, autoStartSystems: false });

    try {
      const ghost = harness.world.ghosts[0];
      if (!ghost) {
        throw new Error('expected one ghost');
      }

      const collisionTile = { x: 17, y: 17 };
      harness.movementRules.setEntityTile(harness.world.packet, collisionTile);
      harness.movementRules.setEntityTile(ghost, collisionTile);
      harness.world.packet.portalBlinkRemainingMs = PACKET_PORTAL_BLINK.durationMs;
      ghost.state.free = true;
      ghost.state.scared = true;

      harness.ghostPacketCollisionSystem.update();

      expect(getGameState().lives).toBe(3);
      expect(getGameState().score).toBe(200);
      expect(ghost.tile).toEqual(harness.world.ghostJailReturnTile);
      expect(ghost.state.free).toBe(false);
      expect(ghost.state.scared).toBe(false);
    } finally {
      harness.destroy();
    }
  });

  it('applies at most one life loss when multiple ghosts collide in the same tick', () => {
    const harness = new MechanicsDomainHarness({ seed: 4104, fixture: 'default-map', ghostCount: 2, autoStartSystems: false });

    try {
      const [first, second] = harness.world.ghosts;
      if (!first || !second) {
        throw new Error('expected two ghosts');
      }

      harness.movementRules.setEntityTile(harness.world.packet, { x: 24, y: 24 });
      harness.movementRules.setEntityTile(first, { x: 24, y: 24 });
      harness.movementRules.setEntityTile(second, { x: 24, y: 24 });
      first.state.free = true;
      second.state.free = true;

      harness.ghostPacketCollisionSystem.update();

      expect(getGameState().lives).toBe(2);
    } finally {
      harness.destroy();
    }
  });
});
