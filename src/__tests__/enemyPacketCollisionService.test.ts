import { describe, expect, it } from 'vitest';
import { EnemyEntity } from '../game/domain/entities/EnemyEntity';
import { findFirstCollision, isBodyOverlap } from '../game/domain/services/EnemyPacketCollisionService';
import { CollisionBody } from '../game/domain/valueObjects/CollisionBody';

function makeEnemy(tile: { x: number; y: number }): EnemyEntity {
  return new EnemyEntity({
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

describe('EnemyPacketCollisionService', () => {
  it('detects overlap from renderer-independent circular bodies', () => {
    const enemy = makeEnemy({ x: 10, y: 4 });
    const collision = findFirstCollision({
      packet: body(10, 10),
      enemies: [{ enemy, body: body(14, 10) }],
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

  it('returns the first collision deterministically in enemy list order', () => {
    const first = makeEnemy({ x: 7, y: 7 });
    const second = makeEnemy({ x: 7, y: 7 });
    const collision = findFirstCollision({
      packet: body(7, 7),
      enemies: [
        { enemy: first, body: body(7, 7) },
        { enemy: second, body: body(7, 7) },
      ],
    });

    expect(collision?.enemy).toBe(first);
  });

  it('defaults to enemy-hit outcome when the colliding enemy is scared', () => {
    const enemy = makeEnemy({ x: 5, y: 5 });
    enemy.state.scared = true;
    const collision = findFirstCollision({ packet: body(5, 5), enemies: [{ enemy, body: body(5, 5) }] });
    expect(collision?.outcome).toBe('enemy-hit');
  });

  it('supports an overridable outcome resolver', () => {
    const enemy = makeEnemy({ x: 3, y: 3 });
    const collision = findFirstCollision({
      packet: body(3, 3),
      enemies: [{ enemy, body: body(3, 3) }],
      resolveOutcome: () => 'enemy-hit',
    });
    expect(collision?.outcome).toBe('enemy-hit');
  });
});
