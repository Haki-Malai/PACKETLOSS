import { describe, expect, it } from 'vitest';
import { GhostEntity } from '../game/domain/entities/GhostEntity';
import {
  findFirstCollision,
  isPixelMaskOverlap,
} from '../game/domain/services/GhostPacketCollisionService';
import { CollisionMaskFrame, CollisionMaskSample } from '../game/domain/valueObjects/CollisionMask';

function makeGhost(tile: { x: number; y: number }): GhostEntity {
  return new GhostEntity({
    key: 'inky',
    tile,
    direction: 'left',
    speed: 1,
    displayWidth: 11,
    displayHeight: 11,
  });
}

function makeMask(width: number, height: number, opaqueIndices: number[]): CollisionMaskFrame {
  const opaque = new Uint8Array(width * height);
  opaqueIndices.forEach((index) => {
    if (index >= 0 && index < opaque.length) {
      opaque[index] = 1;
    }
  });

  return {
    width,
    height,
    opaque,
  };
}

function makeSample(params: {
  x: number;
  y: number;
  width: number;
  height: number;
  mask: CollisionMaskFrame;
  angle?: number;
  flipX?: boolean;
  flipY?: boolean;
}): CollisionMaskSample {
  return {
    x: params.x,
    y: params.y,
    width: params.width,
    height: params.height,
    angle: params.angle ?? 0,
    flipX: params.flipX ?? false,
    flipY: params.flipY ?? false,
    mask: params.mask,
  };
}

describe('GhostPacketCollisionService', () => {
  it('detects collision when opaque mask pixels overlap', () => {
    const ghost = makeGhost({ x: 10, y: 4 });
    const fullMask = makeMask(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);

    const collision = findFirstCollision({
      packet: makeSample({ x: 10, y: 10, width: 3, height: 3, mask: fullMask }),
      ghosts: [
        {
          ghost,
          sample: makeSample({ x: 10, y: 10, width: 3, height: 3, mask: fullMask }),
        },
      ],
    });

    expect(collision?.contact).toBe('pixel-mask-overlap');
    expect(collision?.outcome).toBe('packet-hit');
  });

  it('returns null when only transparent pixels overlap', () => {
    const ghost = makeGhost({ x: 4, y: 4 });
    const transparentMask = makeMask(4, 4, []);

    const collision = findFirstCollision({
      packet: makeSample({ x: 8, y: 8, width: 4, height: 4, mask: transparentMask }),
      ghosts: [
        {
          ghost,
          sample: makeSample({ x: 8, y: 8, width: 4, height: 4, mask: transparentMask }),
        },
      ],
    });

    expect(collision).toBeNull();
  });

  it('applies rotation and flip transforms during overlap detection', () => {
    const rotationPacketMask = makeMask(4, 2, [7]);
    const rotationGhostMask = makeMask(4, 2, [0]);
    const rotationPacket = makeSample({ x: 20, y: 20, width: 4, height: 2, mask: rotationPacketMask });
    const rotationGhostNoTransform = makeSample({ x: 20, y: 20, width: 4, height: 2, mask: rotationGhostMask });
    const rotationGhostRotated = makeSample({
      x: 20,
      y: 20,
      width: 4,
      height: 2,
      mask: rotationGhostMask,
      angle: 180,
    });

    const flipPacketMask = makeMask(4, 2, [3]);
    const flipGhostMask = makeMask(4, 2, [0]);
    const flipPacket = makeSample({ x: 20, y: 20, width: 4, height: 2, mask: flipPacketMask });
    const flipGhostNoTransform = makeSample({ x: 20, y: 20, width: 4, height: 2, mask: flipGhostMask });
    const flipGhostFlipped = makeSample({ x: 20, y: 20, width: 4, height: 2, mask: flipGhostMask, flipX: true });

    expect(isPixelMaskOverlap(rotationPacket, rotationGhostNoTransform)).toBe(false);
    expect(isPixelMaskOverlap(rotationPacket, rotationGhostRotated)).toBe(true);
    expect(isPixelMaskOverlap(flipPacket, flipGhostNoTransform)).toBe(false);
    expect(isPixelMaskOverlap(flipPacket, flipGhostFlipped)).toBe(true);
  });

  it('returns the first collision deterministically in ghost list order', () => {
    const first = makeGhost({ x: 7, y: 7 });
    const second = makeGhost({ x: 7, y: 7 });
    const fullMask = makeMask(2, 2, [0, 1, 2, 3]);

    const collision = findFirstCollision({
      packet: makeSample({ x: 7, y: 7, width: 2, height: 2, mask: fullMask }),
      ghosts: [
        {
          ghost: first,
          sample: makeSample({ x: 7, y: 7, width: 2, height: 2, mask: fullMask }),
        },
        {
          ghost: second,
          sample: makeSample({ x: 7, y: 7, width: 2, height: 2, mask: fullMask }),
        },
      ],
    });

    expect(collision?.ghost).toBe(first);
  });

  it('defaults to ghost-hit outcome when collision ghost is scared', () => {
    const ghost = makeGhost({ x: 5, y: 5 });
    ghost.state.scared = true;
    const fullMask = makeMask(2, 2, [0, 1, 2, 3]);

    const collision = findFirstCollision({
      packet: makeSample({ x: 5, y: 5, width: 2, height: 2, mask: fullMask }),
      ghosts: [
        {
          ghost,
          sample: makeSample({ x: 5, y: 5, width: 2, height: 2, mask: fullMask }),
        },
      ],
    });

    expect(collision?.outcome).toBe('ghost-hit');
  });

  it('supports an overridable outcome resolver for future ghost-hit behavior', () => {
    const ghost = makeGhost({ x: 3, y: 3 });
    const fullMask = makeMask(2, 2, [0, 1, 2, 3]);

    const collision = findFirstCollision({
      packet: makeSample({ x: 3, y: 3, width: 2, height: 2, mask: fullMask }),
      ghosts: [
        {
          ghost,
          sample: makeSample({ x: 3, y: 3, width: 2, height: 2, mask: fullMask }),
        },
      ],
      resolveOutcome: () => 'ghost-hit',
    });

    expect(collision?.outcome).toBe('ghost-hit');
  });

  it('does not report collision for tile swap without overlapping mask pixels', () => {
    const ghost = makeGhost({ x: 6, y: 6 });
    const packetMask = makeMask(2, 2, [0]);
    const ghostMask = makeMask(2, 2, [3]);

    const collision = findFirstCollision({
      packet: makeSample({ x: 16, y: 16, width: 2, height: 2, mask: packetMask }),
      ghosts: [
        {
          ghost,
          sample: makeSample({ x: 16, y: 16, width: 2, height: 2, mask: ghostMask }),
        },
      ],
    });

    expect(collision).toBeNull();
  });
});
