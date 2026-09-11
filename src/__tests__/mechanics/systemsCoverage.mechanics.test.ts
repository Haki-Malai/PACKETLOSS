import { describe, expect, it, vi } from 'vitest';
import { GhostEntity } from '../../game/domain/entities/GhostEntity';
import { GhostDecisionService } from '../../game/domain/services/GhostDecisionService';
import { MovementRules } from '../../game/domain/services/MovementRules';
import { PortalService } from '../../game/domain/services/PortalService';
import { WorldState } from '../../game/domain/world/WorldState';
import { GhostMovementSystem } from '../../game/systems/GhostMovementSystem';
import { PacmanMovementSystem } from '../../game/systems/PacmanMovementSystem';
import { SeededRandom } from '../../game/shared/random/SeededRandom';
import { openTile } from '../fixtures/collisionFixtures';

describe('pacman movement system coverage', () => {
  it('covers direction visuals and movement gate branches', () => {
    const applyBufferedDirectionMock = vi.fn();
    const canMoveMock = vi.fn(() => true);
    const advanceEntityMock = vi.fn();
    const syncEntityPositionMock = vi.fn();
    const tryTeleportMock = vi.fn();
    const canAdvanceOutwardMock = vi.fn(() => false);

    const world = {
      pacman: {
        tile: { x: 0, y: 0 },
        moved: { x: 0, y: 0 },
        direction: { current: 'right', next: 'right' },
        angle: 0,
        flipY: false,
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
      tick: 3,
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

    const system = new PacmanMovementSystem(world, movementRules, portalService);

    world.pacman.direction.current = 'right';
    world.pacman.direction.next = 'right';
    system.update();
    expect(world.pacman.angle).toBe(0);
    expect(world.pacman.flipY).toBe(false);

    world.pacman.direction.current = 'left';
    world.pacman.direction.next = 'left';
    system.update();
    expect(world.pacman.angle).toBe(180);
    expect(world.pacman.flipY).toBe(true);

    world.pacman.direction.current = 'up';
    world.pacman.direction.next = 'up';
    system.update();
    expect(world.pacman.angle).toBe(-90);

    world.pacman.direction.current = 'down';
    world.pacman.direction.next = 'down';
    canMoveMock.mockReturnValueOnce(false);
    system.update();
    expect(world.pacman.angle).toBe(90);

    expect(applyBufferedDirectionMock).toHaveBeenCalled();
    expect(advanceEntityMock).toHaveBeenCalledTimes(3);
    expect(tryTeleportMock).toHaveBeenCalled();
    expect(syncEntityPositionMock).toHaveBeenCalled();
  });

  it('covers portal blink reset, finite-delta guards, and teleport-triggered blink bootstrap', () => {
    const world = {
      pacman: {
        tile: { x: 0, y: 0 },
        moved: { x: 0, y: 0 },
        direction: { current: 'right', next: 'right' },
        angle: 0,
        flipY: false,
        portalBlinkRemainingMs: 0,
        portalBlinkElapsedMs: 0,
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
      tick: 22,
    } as unknown as WorldState;

    const movementRules = {
      applyBufferedDirection: vi.fn(),
      canMove: vi.fn(() => false),
      advanceEntity: vi.fn(),
      syncEntityPosition: vi.fn(),
    } as unknown as MovementRules;

    const tryTeleportMock = vi.fn(() => true);
    const portalService = {
      canAdvanceOutward: vi.fn(() => false),
      tryTeleport: tryTeleportMock,
    } as unknown as PortalService;

    const system = new PacmanMovementSystem(world, movementRules, portalService);

    world.pacman.portalBlinkRemainingMs = 50;
    world.pacman.portalBlinkElapsedMs = 10;
    system.update(Number.NaN);

    expect(world.pacman.portalBlinkRemainingMs).toBeGreaterThan(0);
    expect(world.pacman.portalBlinkElapsedMs).toBe(0);

    tryTeleportMock.mockReturnValue(false);
    world.pacman.portalBlinkRemainingMs = 30;
    world.pacman.portalBlinkElapsedMs = 5;
    system.update(-15);
    expect(world.pacman.portalBlinkRemainingMs).toBe(30);
    expect(world.pacman.portalBlinkElapsedMs).toBe(5);

    system.update(45);
    expect(world.pacman.portalBlinkRemainingMs).toBe(0);
    expect(world.pacman.portalBlinkElapsedMs).toBe(0);
  });
});

describe('ghost movement system coverage', () => {
  it('covers portal-outward movement and non-centered blocked movement branches', () => {
    const ghost = new GhostEntity({
      key: 'blinky',
      tile: { x: 1, y: 1 },
      direction: 'left',
      speed: 1,
      displayWidth: 10,
      displayHeight: 10,
    });
    ghost.state.free = true;

    const world = {
      ghosts: [ghost],
      ghostsExitingJail: new Set<GhostEntity>(),
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
      tick: 4,
    } as unknown as WorldState;

    const advanceEntityMock = vi.fn();
    const syncEntityPositionMock = vi.fn();
    const movementRules = {
      canMove: vi.fn(() => false),
      advanceEntity: advanceEntityMock,
      syncEntityPosition: syncEntityPositionMock,
    } as unknown as MovementRules;
    const chooseDirectionAtCenterMock = vi.fn(() => 'right');
    const chooseDirectionWhenBlockedMock = vi.fn(() => 'right');
    const decisions = {
      chooseDirectionAtCenter: chooseDirectionAtCenterMock,
      chooseDirectionWhenBlocked: chooseDirectionWhenBlockedMock,
    } as unknown as GhostDecisionService;
    const canAdvanceOutwardMock = vi.fn(() => true);
    const portalService = {
      canAdvanceOutward: canAdvanceOutwardMock,
      tryTeleport: vi.fn(() => false),
    } as unknown as PortalService;

    const system = new GhostMovementSystem(world, movementRules, decisions, portalService, new SeededRandom(14));
    system.update();
    expect(advanceEntityMock).toHaveBeenCalledOnce();
    expect(chooseDirectionAtCenterMock).not.toHaveBeenCalled();

    ghost.moved = { x: 1, y: 0 };
    canAdvanceOutwardMock.mockReturnValue(false);
    system.update();

    expect(chooseDirectionWhenBlockedMock).not.toHaveBeenCalled();
    expect(syncEntityPositionMock).toHaveBeenCalledTimes(2);
  });
});
