import { buildMazePenFootprint, buildMazeWallFootprint, extendMazeWallFootprint, TILE_FOOTPRINTS,
  type WallConnection } from '../world/MazeFootprint';
import type { PortalPair, WorldMapData } from '../world/WorldState';
import type { PowerupPoint } from '../../shared/offensivePowerups';

export interface PowerupCollisionWorld {
  width: number; height: number; solid: Uint8Array; tileSize: number;
  portalPairs?: readonly PortalPair[];
}
export interface PowerupWallHit { time: number; position: PowerupPoint }
const EPSILON = 1e-9;

/** Builds authored blockers and current portal links, including prison and temporary rails. */
export function createPowerupCollisionWorld(map: WorldMapData,
  temporaryWalls: readonly WallConnection[] = []): PowerupCollisionWorld {
  const walls = extendMazeWallFootprint(map, buildMazeWallFootprint(map), temporaryWalls);
  const pen = buildMazePenFootprint(map);
  for (let index = 0; index < walls.solid.length; index += 1) walls.solid[index] |= pen.solid[index];
  for (const row of map.tiles) for (const tile of row) {
    if (!tile.collision.collides || tile.localId !== null && TILE_FOOTPRINTS[tile.localId]) continue;
    for (let y = tile.y * map.tileHeight; y < (tile.y + 1) * map.tileHeight; y += 1) {
      walls.solid.fill(1, y * walls.width + tile.x * map.tileWidth,
        y * walls.width + (tile.x + 1) * map.tileWidth);
    }
  }
  return { ...walls, tileSize: map.tileWidth, portalPairs: map.portalPairs };
}

/** Samples a physical segment without allocating or crossing a teleport discontinuity. */
export function interpolatePowerupPoint(from: PowerupPoint, to: PowerupPoint, time: number): PowerupPoint {
  return { x: from.x + (to.x - from.x) * time, y: from.y + (to.y - from.y) * time };
}

/** Returns the first contact of moving circles, expressed as a fraction of their shared movement interval. */
export function sweepPowerupBodies(from: PowerupPoint, to: PowerupPoint, radius: number,
  targetFrom: PowerupPoint, targetTo: PowerupPoint, targetRadius: number): number | null {
  return expandingCircleContact({ x: from.x - targetFrom.x, y: from.y - targetFrom.y },
    { x: to.x - targetTo.x, y: to.y - targetTo.y }, radius + targetRadius, radius + targetRadius);
}

/** Finds first contact against a linearly expanding circular envelope, including crossings between samples. */
export function expandingCircleContact(from: PowerupPoint, to: PowerupPoint,
  fromRadius: number, toRadius: number): number | null {
  const dx = to.x - from.x, dy = to.y - from.y, growth = toRadius - fromRadius;
  const c = from.x * from.x + from.y * from.y - fromRadius * fromRadius;
  if (c <= EPSILON) return 0;
  const a = dx * dx + dy * dy - growth * growth;
  const b = 2 * (from.x * dx + from.y * dy - fromRadius * growth);
  if (Math.abs(a) < EPSILON) {
    if (Math.abs(b) < EPSILON) return null;
    const time = -c / b;
    return time >= 0 && time <= 1 ? time : null;
  }
  const discriminant = b * b - 4 * a * c;
  if (discriminant < -EPSILON) return null;
  const root = Math.sqrt(Math.max(0, discriminant));
  const times = [(-b - root) / (2 * a), (-b + root) / (2 * a)]
    .filter((time) => time >= -EPSILON && time <= 1 + EPSILON).sort((first, second) => first - second);
  return times.length ? Math.max(0, Math.min(1, times[0])) : null;
}

/** Finds bounded circle impacts or flat-front beam contact with solid walls; beams can leave open map edges. */
export function firstPowerupWallHit(world: PowerupCollisionWorld, from: PowerupPoint,
  to: PowerupPoint, radius: number, shape: 'circle' | 'beam' = 'circle'): PowerupWallHit | null {
  const horizontal = Math.abs(to.x - from.x) >= Math.abs(to.y - from.y);
  const padX = shape === 'beam' && horizontal ? 0 : radius;
  const padY = shape === 'beam' && !horizontal ? 0 : radius;
  let earliest = shape === 'beam' ? null : boundaryContact(world, from, to, padX, padY);
  const minX = Math.max(0, Math.ceil(Math.min(from.x, to.x) - padX) - 1);
  const maxX = Math.min(world.width - 1, Math.floor(Math.max(from.x, to.x) + padX));
  const minY = Math.max(0, Math.ceil(Math.min(from.y, to.y) - padY) - 1);
  const maxY = Math.min(world.height - 1, Math.floor(Math.max(from.y, to.y) + padY));
  for (let y = minY; y <= maxY; y += 1) for (let x = minX; x <= maxX; x += 1) {
    if (!world.solid[y * world.width + x]) continue;
    const time = shape === 'beam'
      ? segmentRectangleContact(from, to, x - padX, y - padY, x + 1 + padX, y + 1 + padY)
      : circleRectangleContact(from, to, radius, x, y, x + 1, y + 1);
    if (time !== null && (earliest === null || time < earliest)) earliest = time;
  }
  return earliest === null ? null : { time: earliest, position: interpolatePowerupPoint(from, to, earliest) };
}

/** Finds where a body first leaves its padded map bounds, including open portal mouths. */
function boundaryContact(world: PowerupCollisionWorld, from: PowerupPoint, to: PowerupPoint,
  padX: number, padY: number): number | null {
  if (from.x < padX || from.y < padY || from.x > world.width - padX || from.y > world.height - padY) return 0;
  let time: number | null = null;
  for (const [start, end, low, high] of [[from.x, to.x, padX, world.width - padX],
    [from.y, to.y, padY, world.height - padY]]) {
    const candidate = end < low ? (low - start) / (end - start)
      : end > high ? (high - start) / (end - start) : null;
    if (candidate !== null && (time === null || candidate < time)) time = candidate;
  }
  return time;
}

/** Sweeps a circle against a rectangle using two strips and four exact rounded corners. */
function circleRectangleContact(from: PowerupPoint, to: PowerupPoint, radius: number,
  minX: number, minY: number, maxX: number, maxY: number): number | null {
  const times = [segmentRectangleContact(from, to, minX - radius, minY, maxX + radius, maxY),
    segmentRectangleContact(from, to, minX, minY - radius, maxX, maxY + radius)];
  for (const x of [minX, maxX]) for (const y of [minY, maxY]) {
    times.push(sweepPowerupBodies(from, to, radius, { x, y }, { x, y }, 0));
  }
  const valid = times.filter((time): time is number => time !== null);
  return valid.length ? Math.min(...valid) : null;
}

/** Clips a segment to an axis-aligned strip and returns its first contact. */
function segmentRectangleContact(from: PowerupPoint, to: PowerupPoint,
  minX: number, minY: number, maxX: number, maxY: number): number | null {
  let enter = 0, leave = 1;
  for (const [start, end, low, high] of [[from.x, to.x, minX, maxX], [from.y, to.y, minY, maxY]]) {
    const distance = end - start;
    if (Math.abs(distance) < EPSILON) { if (start < low || start > high) return null; continue; }
    const first = (low - start) / distance, second = (high - start) / distance;
    enter = Math.max(enter, Math.min(first, second));
    leave = Math.min(leave, Math.max(first, second));
    if (enter > leave + EPSILON) return null;
  }
  return enter <= 1 && leave >= 0 ? Math.max(0, enter) : null;
}
