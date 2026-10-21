import { DIRECTION_VECTORS, type Direction } from '../valueObjects/Direction';
import { POWERUP_RULES, type PowerupLaserSegment, type PowerupPoint } from '../../shared/offensivePowerups';
import { firstPowerupWallHit, type PowerupCollisionWorld } from './PowerupCollision';
import { portalOutwardDirection, PORTAL_TRAVEL_FRACTION } from './PortalService';

const EPSILON = 1e-9;
// Unlinked openings retain an offscreen endpoint with finite snapshot and geometry values.
const OFF_MAP_REACH = 10_000;

/** Traces a laser through one portal traversal; a complete loop reuses the existing spans instead of recursing. */
export function traceLaserPath(world: PowerupCollisionWorld, caster: PowerupPoint,
  direction: Direction): PowerupLaserSegment[] {
  const vector = DIRECTION_VECTORS[direction];
  const rule = POWERUP_RULES.laser;
  const portal = firstPortal(world, caster, direction);
  const muzzleDistance = Math.min(rule.muzzle, portal?.distance ?? Infinity);
  const origin = { x: caster.x + vector.dx * muzzleDistance, y: caster.y + vector.dy * muzzleDistance };
  if (firstPowerupWallHit(world, caster, origin, rule.radius, 'beam')) {
    return [{ ...origin, length: 0, delayMs: 0, end: 'wall' }];
  }
  const first = traceSpan(world, origin, direction, 0);
  if (first.end !== 'portal' || !portal) return [first];
  return [first, traceSpan(world, portal.exit, direction, rule.laserGrowMs)];
}

/** Clips a span at the nearest solid wall or outgoing portal mouth, before blocking retired arena cells. */
function traceSpan(world: PowerupCollisionWorld, origin: PowerupPoint, direction: Direction,
  delayMs: number): PowerupLaserSegment {
  const vector = DIRECTION_VECTORS[direction];
  const portal = firstPortal(world, origin, direction);
  const distance = portal?.distance ?? Math.hypot(world.width, world.height);
  const destination = { x: origin.x + vector.dx * distance, y: origin.y + vector.dy * distance };
  const wall = firstPowerupWallHit(world, origin, destination, POWERUP_RULES.laser.radius, 'beam');
  if (wall && (!portal || wall.time * distance < distance - EPSILON)) {
    return { ...origin, length: distance * wall.time, delayMs, end: 'wall' };
  }
  return { ...origin, length: portal ? distance : distance + OFF_MAP_REACH, delayMs,
    end: portal ? 'portal' : 'open' };
}

/** Finds an aligned outgoing mouth, retaining the beam's transverse offset at the paired entrance. */
function firstPortal(world: PowerupCollisionWorld, origin: PowerupPoint, direction: Direction): {
  distance: number; exit: PowerupPoint;
} | null {
  const vector = DIRECTION_VECTORS[direction];
  const halfTile = world.tileSize * PORTAL_TRAVEL_FRACTION;
  let nearest: { distance: number; exit: PowerupPoint } | null = null;
  for (const pair of world.portalPairs ?? []) for (const [from, to] of [[pair.from, pair.to], [pair.to, pair.from]]) {
    if (portalOutwardDirection(from, to) !== direction) continue;
    const center = { x: (from.x + 0.5) * world.tileSize, y: (from.y + 0.5) * world.tileSize };
    const distance = (center.x - origin.x) * vector.dx + (center.y - origin.y) * vector.dy + halfTile;
    const offset = (origin.x - center.x) * -vector.dy + (origin.y - center.y) * vector.dx;
    if (distance < -EPSILON || Math.abs(offset) + POWERUP_RULES.laser.radius > halfTile
      || nearest && nearest.distance <= distance) continue;
    nearest = { distance: Math.max(0, distance), exit: {
      x: (to.x + 0.5) * world.tileSize - vector.dx * halfTile - vector.dy * offset,
      y: (to.y + 0.5) * world.tileSize - vector.dy * halfTile + vector.dx * offset,
    } };
  }
  return nearest;
}
