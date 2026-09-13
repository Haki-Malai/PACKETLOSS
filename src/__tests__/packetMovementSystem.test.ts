import { describe, expect, it, vi } from 'vitest';
import { PACKET_DEATH_RECOVERY, PACKET_PORTAL_BLINK } from '../config/constants';
import { openTile } from './fixtures/collisionFixtures';
import { PortalService } from '../game/domain/services/PortalService';
import { MovementRules } from '../game/domain/services/MovementRules';
import { WorldState } from '../game/domain/world/WorldState';
import { PacketMovementSystem } from '../game/systems/PacketMovementSystem';

describe('PacketMovementSystem portal blink', () => {
  it('starts and advances the post-portal blink timer without affecting movement flow', () => {
    const applyBufferedDirectionMock = vi.fn();
    const canMoveMock = vi.fn(() => false);
    const advanceEntityMock = vi.fn();
    const syncEntityPositionMock = vi.fn();
    const tryTeleportMock = vi.fn(() => true);
    const canAdvanceOutwardMock = vi.fn(() => false);

    const world = {
      lagZones: [],
      packet: {
        tile: { x: 0, y: 0 },
        moved: { x: 0, y: 0 },
        direction: { current: 'right', next: 'right' },
        angle: 0,
        flipY: false,
        portalBlinkRemainingMs: 0,
        portalBlinkElapsedMs: 0,
        deathRecoveryRemainingMs: 0,
        deathRecoveryElapsedMs: 0,
        deathRecoveryNextToggleAtMs: 0,
        deathRecoveryVisible: true,
      },
      collisionGrid: {
        getTilesAt: vi.fn(() => ({
          current: openTile(),
          up: openTile(),
          down: openTile(),
          left: openTile(),
          right: openTile(),
        })),
      },
      tileSize: 16,
      tick: 7,
    } as unknown as WorldState;

    const movementRules = {
      applyBufferedDirection: applyBufferedDirectionMock,
      canMove: canMoveMock,
      advanceEntity: advanceEntityMock,
      syncEntityPosition: syncEntityPositionMock,
    } as unknown as MovementRules;

    const portalService = {
      canAdvanceOutward: canAdvanceOutwardMock,
      tryTeleport: tryTeleportMock,
    } as unknown as PortalService;

    const system = new PacketMovementSystem(world, movementRules, portalService);

    system.update(16);
    expect(world.packet.portalBlinkRemainingMs).toBe(PACKET_PORTAL_BLINK.durationMs);
    expect(world.packet.portalBlinkElapsedMs).toBe(0);
    expect(applyBufferedDirectionMock).toHaveBeenCalledOnce();
    expect(advanceEntityMock).not.toHaveBeenCalled();

    tryTeleportMock.mockReturnValue(false);

    system.update(500);
    expect(world.packet.portalBlinkRemainingMs).toBe(PACKET_PORTAL_BLINK.durationMs - 500);
    expect(world.packet.portalBlinkElapsedMs).toBe(500);

    system.update(PACKET_PORTAL_BLINK.durationMs);
    expect(world.packet.portalBlinkRemainingMs).toBe(0);
    expect(world.packet.portalBlinkElapsedMs).toBe(0);
    expect(syncEntityPositionMock).toHaveBeenCalledTimes(3);
  });

  it('advances death recovery blink state and clears it on expiry', () => {
    const world = {
      lagZones: [],
      packet: {
        tile: { x: 0, y: 0 },
        moved: { x: 0, y: 0 },
        direction: { current: 'right', next: 'right' },
        angle: 0,
        flipY: false,
        portalBlinkRemainingMs: 0,
        portalBlinkElapsedMs: 0,
        deathRecoveryRemainingMs: PACKET_DEATH_RECOVERY.durationMs,
        deathRecoveryElapsedMs: 0,
        deathRecoveryNextToggleAtMs: PACKET_DEATH_RECOVERY.blinkStartIntervalMs,
        deathRecoveryVisible: true,
      },
      collisionGrid: {
        getTilesAt: vi.fn(() => ({
          current: openTile(),
          up: openTile(),
          down: openTile(),
          left: openTile(),
          right: openTile(),
        })),
      },
      tileSize: 16,
      tick: 11,
    } as unknown as WorldState;

    const movementRules = {
      applyBufferedDirection: vi.fn(),
      canMove: vi.fn(() => false),
      advanceEntity: vi.fn(),
      syncEntityPosition: vi.fn(),
    } as unknown as MovementRules;

    const portalService = {
      canAdvanceOutward: vi.fn(() => false),
      tryTeleport: vi.fn(() => false),
    } as unknown as PortalService;

    const system = new PacketMovementSystem(world, movementRules, portalService);
    const visibleBefore = world.packet.deathRecoveryVisible;

    system.update(PACKET_DEATH_RECOVERY.blinkStartIntervalMs);
    expect(world.packet.deathRecoveryVisible).toBe(!visibleBefore);
    expect(world.packet.deathRecoveryRemainingMs).toBe(PACKET_DEATH_RECOVERY.durationMs - PACKET_DEATH_RECOVERY.blinkStartIntervalMs);

    system.update(PACKET_DEATH_RECOVERY.durationMs);
    expect(world.packet.deathRecoveryRemainingMs).toBe(0);
    expect(world.packet.deathRecoveryElapsedMs).toBe(0);
    expect(world.packet.deathRecoveryNextToggleAtMs).toBe(0);
    expect(world.packet.deathRecoveryVisible).toBe(true);
  });

  it('allows turning into outward portal direction at center before threshold movement', () => {
    const advanceEntityMock = vi.fn();

    const world = {
      lagZones: [],
      packet: {
        tile: { x: 0, y: 0 },
        moved: { x: 0, y: 0 },
        direction: { current: 'up', next: 'left' },
        angle: 0,
        flipY: false,
        portalBlinkRemainingMs: 0,
        portalBlinkElapsedMs: 0,
        deathRecoveryRemainingMs: 0,
        deathRecoveryElapsedMs: 0,
        deathRecoveryNextToggleAtMs: 0,
        deathRecoveryVisible: true,
      },
      collisionGrid: {
        getTilesAt: vi.fn(() => ({
          current: openTile(),
          up: openTile(),
          down: openTile(),
          left: openTile(),
          right: openTile(),
        })),
      },
      tileSize: 16,
      tick: 12,
    } as unknown as WorldState;

    const movementRules = {
      applyBufferedDirection: vi.fn(),
      canMove: vi.fn(() => false),
      advanceEntity: advanceEntityMock,
      syncEntityPosition: vi.fn(),
    } as unknown as MovementRules;

    const canAdvanceOutwardMock = vi.fn(() => true);
    const portalService = {
      canAdvanceOutward: canAdvanceOutwardMock,
      tryTeleport: vi.fn(() => false),
    } as unknown as PortalService;

    const system = new PacketMovementSystem(world, movementRules, portalService);
    system.update(16);

    expect(world.packet.direction.current).toBe('left');
    expect(advanceEntityMock).toHaveBeenCalledOnce();
    expect(canAdvanceOutwardMock).toHaveBeenCalledWith(expect.objectContaining({ direction: 'left' }), world.collisionGrid);
  });

  it('keeps current direction when buffered portal turn is unavailable', () => {
    const world = {
      lagZones: [],
      packet: {
        tile: { x: 0, y: 0 },
        moved: { x: 0, y: 0 },
        direction: { current: 'up', next: 'left' },
        angle: 0,
        flipY: false,
        portalBlinkRemainingMs: 0,
        deathRecoveryRemainingMs: 0,
      },
      collisionGrid: {
        getTilesAt: vi.fn(() => ({
          current: openTile(),
          up: openTile(),
          down: openTile(),
          left: openTile(),
          right: openTile(),
        })),
      },
      tileSize: 16,
      tick: 13,
    } as unknown as WorldState;

    const movementRules = {
      applyBufferedDirection: vi.fn(),
      canMove: vi.fn(() => false),
      advanceEntity: vi.fn(),
      syncEntityPosition: vi.fn(),
    } as unknown as MovementRules;

    const portalService = {
      canAdvanceOutward: vi.fn(() => false),
      tryTeleport: vi.fn(() => false),
    } as unknown as PortalService;

    new PacketMovementSystem(world, movementRules, portalService).update(16);

    expect(world.packet.direction.current).toBe('up');
  });

  it('treats legal buffered turns as normal movement, not portal overrides', () => {
    const world = {
      lagZones: [],
      packet: {
        tile: { x: 0, y: 0 },
        moved: { x: 0, y: 0 },
        direction: { current: 'up', next: 'right' },
        angle: 0,
        flipY: false,
        portalBlinkRemainingMs: 10,
        deathRecoveryRemainingMs: PACKET_DEATH_RECOVERY.durationMs,
        deathRecoveryElapsedMs: PACKET_DEATH_RECOVERY.durationMs - 1,
        deathRecoveryNextToggleAtMs: PACKET_DEATH_RECOVERY.durationMs,
        deathRecoveryVisible: true,
      },
      collisionGrid: {
        getTilesAt: vi.fn(() => ({
          current: openTile(),
          up: openTile(),
          down: openTile(),
          left: openTile(),
          right: openTile(),
        })),
      },
      tileSize: 16,
      tick: 14,
    } as unknown as WorldState;

    const movementRules = {
      applyBufferedDirection: vi.fn(),
      canMove: vi.fn(() => true),
      advanceEntity: vi.fn(),
      syncEntityPosition: vi.fn(),
    } as unknown as MovementRules;

    const portalService = {
      canAdvanceOutward: vi.fn(() => false),
      tryTeleport: vi.fn(() => false),
    } as unknown as PortalService;

    new PacketMovementSystem(world, movementRules, portalService).update(1);

    expect(world.packet.direction.current).toBe('up');
    expect(world.packet.deathRecoveryNextToggleAtMs).toBe(0);
  });
});
