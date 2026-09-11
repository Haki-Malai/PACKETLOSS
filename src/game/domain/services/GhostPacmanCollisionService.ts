import { GhostEntity } from '../entities/GhostEntity';
import { CollisionMaskSample } from '../valueObjects/CollisionMask';

export type GhostPacmanContactType = 'pixel-mask-overlap';
export type GhostPacmanCollisionOutcome = 'pacman-hit' | 'ghost-hit';

interface Aabb {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface PreparedMaskSample {
  sample: CollisionMaskSample;
  bounds: Aabb;
  halfWidth: number;
  halfHeight: number;
  inverseRotation?: { cos: number; sin: number };
  valid: boolean;
}

export interface GhostPacmanCollision {
  ghost: GhostEntity;
  contact: GhostPacmanContactType;
  outcome: GhostPacmanCollisionOutcome;
}

export interface GhostCollisionCandidate {
  ghost: GhostEntity;
  sample: CollisionMaskSample;
}

export type CollisionOutcomeResolver = (_ghost: GhostEntity) => GhostPacmanCollisionOutcome;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function computeAabb(sample: CollisionMaskSample): Aabb {
  const halfWidth = sample.width / 2;
  const halfHeight = sample.height / 2;
  const radians = toRadians(sample.angle);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const corners = [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight },
  ];

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  corners.forEach((corner) => {
    const worldX = sample.x + corner.x * cos - corner.y * sin;
    const worldY = sample.y + corner.x * sin + corner.y * cos;

    minX = Math.min(minX, worldX);
    minY = Math.min(minY, worldY);
    maxX = Math.max(maxX, worldX);
    maxY = Math.max(maxY, worldY);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
  };
}

function intersectAabb(a: Aabb, b: Aabb): Aabb | null {
  const minX = Math.max(a.minX, b.minX);
  const minY = Math.max(a.minY, b.minY);
  const maxX = Math.min(a.maxX, b.maxX);
  const maxY = Math.min(a.maxY, b.maxY);

  if (minX >= maxX || minY >= maxY) {
    return null;
  }

  return { minX, minY, maxX, maxY };
}

function prepareMaskSample(sample: CollisionMaskSample): PreparedMaskSample {
  return {
    sample,
    bounds: computeAabb(sample),
    halfWidth: sample.width / 2,
    halfHeight: sample.height / 2,
    valid: !(sample.width <= 0 || sample.height <= 0 || sample.mask.width <= 0 || sample.mask.height <= 0),
  };
}

function getInverseRotation(prepared: PreparedMaskSample): { cos: number; sin: number } {
  if (!prepared.inverseRotation) {
    const radians = toRadians(-prepared.sample.angle);
    prepared.inverseRotation = { cos: Math.cos(radians), sin: Math.sin(radians) };
  }
  return prepared.inverseRotation;
}

function isOpaqueAt(
  prepared: PreparedMaskSample,
  { cos, sin }: { cos: number; sin: number },
  worldX: number,
  worldY: number,
): boolean {
  const { sample, halfWidth, halfHeight } = prepared;
  const dx = worldX - sample.x;
  const dy = worldY - sample.y;

  let localX = dx * cos - dy * sin;
  let localY = dx * sin + dy * cos;

  if (sample.flipX) {
    localX *= -1;
  }
  if (sample.flipY) {
    localY *= -1;
  }

  const normalizedX = (localX + halfWidth) / sample.width;
  const normalizedY = (localY + halfHeight) / sample.height;

  if (normalizedX < 0 || normalizedX >= 1 || normalizedY < 0 || normalizedY >= 1) {
    return false;
  }

  const x = Math.floor(normalizedX * sample.mask.width);
  const y = Math.floor(normalizedY * sample.mask.height);

  if (x < 0 || x >= sample.mask.width || y < 0 || y >= sample.mask.height) {
    return false;
  }

  const index = y * sample.mask.width + x;
  return (sample.mask.opaque[index] ?? 0) > 0;
}

export function isPixelMaskOverlap(pacman: CollisionMaskSample, ghost: CollisionMaskSample): boolean {
  return isPreparedMaskOverlap(prepareMaskSample(pacman), prepareMaskSample(ghost));
}

function isPreparedMaskOverlap(pacman: PreparedMaskSample, ghost: PreparedMaskSample): boolean {
  if (!pacman.valid || !ghost.valid) {
    return false;
  }

  const overlap = intersectAabb(pacman.bounds, ghost.bounds);
  if (!overlap) {
    return false;
  }

  const pacmanRotation = getInverseRotation(pacman);
  const ghostRotation = getInverseRotation(ghost);
  const startX = Math.floor(overlap.minX);
  const endX = Math.ceil(overlap.maxX);
  const startY = Math.floor(overlap.minY);
  const endY = Math.ceil(overlap.maxY);

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const worldX = x + 0.5;
      const worldY = y + 0.5;

      if (isOpaqueAt(pacman, pacmanRotation, worldX, worldY) && isOpaqueAt(ghost, ghostRotation, worldX, worldY)) {
        return true;
      }
    }
  }

  return false;
}

function defaultOutcomeResolver(ghost: GhostEntity): GhostPacmanCollisionOutcome {
  return ghost.state.scared ? 'ghost-hit' : 'pacman-hit';
}

export function findFirstCollision(params: {
  pacman: CollisionMaskSample;
  ghosts: GhostCollisionCandidate[];
  resolveOutcome?: CollisionOutcomeResolver;
}): GhostPacmanCollision | null {
  const resolveOutcome = params.resolveOutcome ?? defaultOutcomeResolver;
  if (params.ghosts.length === 0) {
    return null;
  }

  const pacman = prepareMaskSample(params.pacman);
  for (const candidate of params.ghosts) {
    if (isPreparedMaskOverlap(pacman, prepareMaskSample(candidate.sample))) {
      return {
        ghost: candidate.ghost,
        contact: 'pixel-mask-overlap',
        outcome: resolveOutcome(candidate.ghost),
      };
    }
  }

  return null;
}
