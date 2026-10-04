export interface CollisionBody {
  x: number;
  y: number;
  radius: number;
}

/** Tests strict contact between circular gameplay bodies; touching boundaries do not overlap. */
export function isBodyOverlap(first: CollisionBody, second: CollisionBody): boolean {
  if (first.radius <= 0 || second.radius <= 0) return false;
  const dx = first.x - second.x;
  const dy = first.y - second.y;
  const combinedRadius = first.radius + second.radius;
  return dx * dx + dy * dy < combinedRadius * combinedRadius;
}
