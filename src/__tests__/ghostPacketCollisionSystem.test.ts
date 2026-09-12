import { beforeEach, describe, expect, it } from 'vitest';
import {
  PACKET_DEATH_RECOVERY,
  PACKET_PORTAL_BLINK,
} from '../config/constants';
import { getGameState, resetGameState } from '../state/gameState';
import { GhostEntity } from '../game/domain/entities/GhostEntity';
import { MechanicsDomainHarness } from './helpers/mechanicsDomainHarness';

function expectGhostTileUnchanged(ghost: GhostEntity, tile: { x: number; y: number }): void {
  expect(ghost.tile).toEqual(tile);
}

describe('GhostPacketCollisionSystem', () => {
  beforeEach(() => {
    resetGameState(0, 3);
  });

  it('decrements one life and respawns packet without moving the colliding ghost', () => {
    const harness = new MechanicsDomainHarness({ seed: 4101, fixture: 'default-map', ghostCount: 1, autoStartSystems: false });

    try {
      const ghost = harness.world.ghosts[0];
      if (!ghost) {
        throw new Error('expected one ghost');
      }

      harness.movementRules.setEntityTile(harness.world.packet, { x: 20, y: 20 });
      harness.world.packet.direction.current = 'up';
      harness.world.packet.direction.next = 'left';

      harness.movementRules.setEntityTile(ghost, { x: 20, y: 20 });
      ghost.state.free = true;
      ghost.state.scared = false;

      const ghostTileBefore = { ...ghost.tile };

      harness.ghostPacketCollisionSystem.update();

      expect(getGameState().lives).toBe(2);
      expect(harness.world.packet.tile).toEqual(harness.world.packetSpawnTile);
      expect(harness.world.packet.direction.current).toBe('right');
      expect(harness.world.packet.direction.next).toBe('right');
      expect(harness.world.packet.deathRecoveryRemainingMs).toBe(PACKET_DEATH_RECOVERY.durationMs);
      expect(harness.world.packet.deathRecoveryVisible).toBe(true);
      expectGhostTileUnchanged(ghost, ghostTileBefore);
    } finally {
      harness.destroy();
    }
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
      expect(harness.world.packet.tile).toEqual(harness.world.packetSpawnTile);
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

      harness.world.packet.deathRecoveryRemainingMs = 0;
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
