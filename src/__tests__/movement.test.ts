import { describe, expect, it, vi } from 'vitest';
import { applyBufferedDirection, canMove, DEFAULT_TILE_SIZE, BufferedEntity, MovementRules } from '../game/domain/services/MovementRules';
import { CollisionGrid, CollisionTile, CollisionTiles } from '../game/domain/world/CollisionGrid';

const tileSize = DEFAULT_TILE_SIZE;
const tile = (overrides: Partial<CollisionTile> = {}): CollisionTile => ({
  collides: false,
  penGate: false,
  portal: false,
  up: false,
  down: false,
  left: false,
  right: false,
  ...overrides,
});

describe('canMove', () => {
  it('stops entry into a tile that blocks upward movement but allows finishing the step already taken', () => {
    const collisionTiles: CollisionTiles = {
      current: tile({ up: true }),
      down: tile({ up: false }),
      right: tile({ left: false }),
      left: tile(),
      up: tile(),
    };

    expect(canMove('up', 0, 0, collisionTiles, tileSize)).toBe(false);
    expect(canMove('up', -1, 0, collisionTiles, tileSize)).toBe(true);
    expect(canMove('up', -tileSize - 1, 0, collisionTiles, tileSize)).toBe(false);
  });

  it('uses the tile ahead to block downward movement', () => {
    const collisionTiles: CollisionTiles = {
      current: tile(),
      down: tile({ up: true }),
      right: tile({ left: false }),
      left: tile(),
      up: tile(),
    };

    expect(canMove('down', 0, 0, collisionTiles, tileSize)).toBe(false);
    expect(canMove('down', 5, 0, collisionTiles, tileSize)).toBe(true);
    expect(canMove('down', tileSize + 1, 0, collisionTiles, tileSize)).toBe(false);
  });

  it('respects walls on neighboring tiles when moving right but allows clear lateral travel otherwise', () => {
    const blockedRight: CollisionTiles = {
      current: tile(),
      down: tile(),
      right: tile({ left: true }),
      left: tile(),
      up: tile(),
    };
    const clearTiles: CollisionTiles = {
      current: tile({ left: false }),
      down: tile(),
      right: tile({ left: false }),
      left: tile(),
      up: tile(),
    };

    expect(canMove('right', 0, 0, blockedRight, tileSize)).toBe(false);
    expect(canMove('right', 0, 8, blockedRight, tileSize)).toBe(true);
    expect(canMove('right', 0, tileSize + 1, blockedRight, tileSize)).toBe(false);
    expect(canMove('left', 0, 0, clearTiles, tileSize)).toBe(true);
  });

  it('blocks movement when the current tile blocks the crossed edge', () => {
    const collisionTiles: CollisionTiles = {
      current: tile({ right: true }),
      down: tile(),
      right: tile(),
      left: tile(),
      up: tile(),
    };

    expect(canMove('right', 0, 0, collisionTiles, tileSize)).toBe(false);
    expect(canMove('right', 0, 4, collisionTiles, tileSize)).toBe(true);
  });

  it('blocks movement when the neighboring tile blocks the opposite edge', () => {
    const collisionTiles: CollisionTiles = {
      current: tile(),
      down: tile(),
      right: tile(),
      left: tile({ right: true }),
      up: tile(),
    };

    expect(canMove('left', 0, 0, collisionTiles, tileSize)).toBe(false);
    expect(canMove('left', 0, -4, collisionTiles, tileSize)).toBe(true);
  });

  it('allows only release enemies through pen-gate edges but blocks packet and free enemies', () => {
    const collisionTiles: CollisionTiles = {
      current: tile({ down: true, penGate: true }),
      down: tile(),
      right: tile(),
      left: tile(),
      up: tile(),
    };

    expect(canMove('down', 0, 0, collisionTiles, tileSize, 'packet')).toBe(false);
    expect(canMove('down', 0, 0, collisionTiles, tileSize, 'enemy')).toBe(false);
    expect(canMove('down', 0, 0, collisionTiles, tileSize, 'enemyRelease')).toBe(true);
  });

  it('blocks center movement into out-of-bounds neighbors on both axes', () => {
    const grid = new CollisionGrid([[tile()]]);
    const collisionTiles = grid.getTilesAt({ x: 0, y: 0 });

    expect(canMove('left', 0, 0, collisionTiles, tileSize)).toBe(false);
    expect(canMove('right', 0, 0, collisionTiles, tileSize)).toBe(false);
    expect(canMove('up', 0, 0, collisionTiles, tileSize)).toBe(false);
    expect(canMove('down', 0, 0, collisionTiles, tileSize)).toBe(false);
  });
});

describe('applyBufferedDirection', () => {
  const collisionTiles: CollisionTiles = {
    current: tile(),
    down: tile(),
    right: tile(),
    left: tile(),
    up: tile(),
  };

  it('switches to the buffered direction when centered and the path is open', () => {
    const packet: BufferedEntity = { moved: { x: 0, y: 0 }, direction: { current: 'right', next: 'up' } };
    const canMoveSpy = vi.fn(() => true);

    const result = applyBufferedDirection(packet, collisionTiles, tileSize, canMoveSpy);

    expect(result).toBe('up');
    expect(packet.direction.current).toBe('up');
    expect(canMoveSpy).toHaveBeenCalledWith('up', 0, 0, collisionTiles, tileSize, 'packet');
  });

  it('ignores buffered input until packet is centered on a tile', () => {
    const packet: BufferedEntity = { moved: { x: 4, y: 0 }, direction: { current: 'right', next: 'up' } };
    const canMoveSpy = vi.fn(() => true);

    const result = applyBufferedDirection(packet, collisionTiles, tileSize, canMoveSpy);

    expect(result).toBe('right');
    expect(packet.direction.current).toBe('right');
    expect(canMoveSpy).not.toHaveBeenCalled();
  });

  it('reverses immediately while keeping the current corridor position', () => {
    const packet: BufferedEntity = { moved: { x: 4, y: 0 }, direction: { current: 'right', next: 'left' } };

    expect(applyBufferedDirection(packet, collisionTiles, tileSize)).toBe('left');
    expect(packet).toEqual({ moved: { x: 4, y: 0 }, direction: { current: 'left', next: 'left' } });
    expect(canMove('left', 0, 4, collisionTiles, tileSize)).toBe(true);
  });

  it('keeps the current direction if the buffered turn is blocked', () => {
    const packet: BufferedEntity = { moved: { x: 0, y: 0 }, direction: { current: 'right', next: 'up' } };
    const canMoveSpy = vi.fn(() => false);

    const result = applyBufferedDirection(packet, collisionTiles, tileSize, canMoveSpy);

    expect(result).toBe('right');
    expect(packet.direction.current).toBe('right');
    expect(canMoveSpy).toHaveBeenCalledOnce();
  });
});

describe('MovementRules distance carry', () => {
  it('preserves fractional level speed across a tile center', () => {
    const movement = new MovementRules(tileSize);
    const entity = { tile: { x: 0, y: 0 }, moved: { x: 0, y: 0 } };

    for (let tick = 0; tick < 11; tick += 1) {
      movement.advanceEntity(entity, 'right', 1);
      movement.advanceEntity(entity, 'right', 0.5625);
    }

    expect(entity.tile).toEqual({ x: 1, y: 0 });
    expect(entity.moved.x).toBeCloseTo(1.1875);
  });
});
