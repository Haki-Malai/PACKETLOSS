import { describe, expect, it } from 'vitest';
import { GhostEntity } from '../game/domain/entities/GhostEntity';
import { findFirstCollision, isBodyOverlap } from '../game/domain/services/GhostPacketCollisionService';
import { CollisionBody } from '../game/domain/valueObjects/CollisionBody';

function makeGhost(tile: { x: number; y: number }): GhostEntity {
  return new GhostEntity({
    key: 'virus',
    tile,
    direction: 'left',
    speed: 1,
    displayWidth: 11,
    displayHeight: 11,
  });
}

function body(x: number, y: number, radius = 5): CollisionBody {
  return { x, y, radius };
}

describe('GhostPacketCollisionService', () => {
  it('detects overlap from renderer-independent circular bodies', () => {
    const ghost = makeGhost({ x: 10, y: 4 });
    const collision = findFirstCollision({
      packet: body(10, 10),
      ghosts: [{ ghost, body: body(14, 10) }],
    });

    expect(collision?.contact).toBe('body-overlap');
    expect(collision?.outcome).toBe('packet-hit');
  });

  it('does not treat separated or merely tangent bodies as collisions', () => {
    expect(isBodyOverlap(body(0, 0), body(11, 0))).toBe(false);
    expect(isBodyOverlap(body(0, 0), body(10, 0))).toBe(false);
    expect(isBodyOverlap(body(0, 0), body(9, 0))).toBe(true);
  });

  it('does not collide when either body has a non-positive radius', () => {
    expect(isBodyOverlap(body(0, 0, 0), body(0, 0))).toBe(false);
    expect(isBodyOverlap(body(0, 0), body(0, 0, -1))).toBe(false);
  });

  it('returns the first collision deterministically in ghost list order', () => {
    const first = makeGhost({ x: 7, y: 7 });
    const second = makeGhost({ x: 7, y: 7 });
    const collision = findFirstCollision({
      packet: body(7, 7),
      ghosts: [
        { ghost: first, body: body(7, 7) },
        { ghost: second, body: body(7, 7) },
      ],
    });

    expect(collision?.ghost).toBe(first);
  });

  it('defaults to ghost-hit outcome when the colliding ghost is scared', () => {
    const ghost = makeGhost({ x: 5, y: 5 });
    ghost.state.scared = true;
    const collision = findFirstCollision({ packet: body(5, 5), ghosts: [{ ghost, body: body(5, 5) }] });
    expect(collision?.outcome).toBe('ghost-hit');
  });

  it('supports an overridable outcome resolver', () => {
    const ghost = makeGhost({ x: 3, y: 3 });
    const collision = findFirstCollision({
      packet: body(3, 3),
      ghosts: [{ ghost, body: body(3, 3) }],
      resolveOutcome: () => 'ghost-hit',
    });
    expect(collision?.outcome).toBe('ghost-hit');
  });
});
