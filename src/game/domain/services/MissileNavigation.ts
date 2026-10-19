import { CLOCKWISE_DIRECTIONS, DIRECTION_VECTORS, OPPOSITE_DIRECTION, type Direction } from '../valueObjects/Direction';
import { CollisionGrid } from '../world/CollisionGrid';
import { EnemyNavigationService } from './EnemyNavigationService';
import { PortalService } from './PortalService';
import { firstPowerupWallHit, type PowerupCollisionWorld } from './PowerupCollision';
import { POWERUP_RULES, type PowerupCombatActor, type PowerupPoint, type PowerupProjectile } from '../../shared/offensivePowerups';

const CENTER_EPSILON = 1e-7;
const navigationCache = new WeakMap<PowerupCollisionWorld, EnemyNavigationService>();

/** Reads a cardinal heading without introducing diagonal missile movement. */
export function missileHeading(angle: number): Direction {
  const index = Math.round(angle / (Math.PI / 2)) + 1;
  return CLOCKWISE_DIRECTIONS[(index % 4 + 4) % 4];
}

/** Returns positive travel to the next grid center, including a full tile when already centered. */
export function missileCenterDistance(point: PowerupPoint, angle: number, tileSize: number): number {
  const vector = DIRECTION_VECTORS[missileHeading(angle)];
  const axis = vector.dx ? point.x : point.y;
  const offset = ((axis - tileSize / 2) % tileSize + tileSize) % tileSize;
  const distance = (vector.dx || vector.dy) > 0 ? tileSize - offset : offset;
  return distance < CENTER_EPSILON || tileSize - distance < CENTER_EPSILON ? tileSize : distance;
}

/**
 * Chooses clear center turns toward a target, preferring straight untargeted travel without reversing.
 * @returns A legal heading, or null at a dead end where the missile must self-destruct.
 */
export function steerMissile(world: PowerupCollisionWorld, projectile: PowerupProjectile,
  targets: readonly PowerupCombatActor[]): { direction: Direction | null; targetId: string | null } {
  const direction = missileHeading(projectile.angle);
  const candidates = targets.filter((target) => Math.hypot(target.x - projectile.x, target.y - projectile.y)
    <= POWERUP_RULES.missile.targetRange).sort((first, second) =>
    Number(second.id === projectile.targetId) - Number(first.id === projectile.targetId)
    || Math.hypot(first.x - projectile.x, first.y - projectile.y) - Math.hypot(second.x - projectile.x, second.y - projectile.y)
    || first.id.localeCompare(second.id));
  const tile = { x: (projectile.x - world.tileSize / 2) / world.tileSize,
    y: (projectile.y - world.tileSize / 2) / world.tileSize };
  if (Math.abs(tile.x - Math.round(tile.x)) > CENTER_EPSILON
    || Math.abs(tile.y - Math.round(tile.y)) > CENTER_EPSILON) {
    return { direction, targetId: candidates.find((target) => target.id === projectile.targetId)?.id ?? null };
  }
  tile.x = Math.round(tile.x); tile.y = Math.round(tile.y);
  const navigation = missileNavigation(world);
  const steps = navigation.getSteps(tile).filter((step) => step.direction !== OPPOSITE_DIRECTION[direction])
    .sort((first, second) => Number(second.direction === direction) - Number(first.direction === direction));
  for (const target of candidates) {
    const destination = { x: Math.floor(target.x / world.tileSize), y: Math.floor(target.y / world.tileSize) };
    if (destination.x === tile.x && destination.y === tile.y) return { direction: steps[0]?.direction ?? null, targetId: target.id };
    const routes = steps.map((step) => ({ step, path: navigation.findPath(step.destination, destination) }))
      .filter(({ path }) => path !== null && !path.some((part) => part.destination.x === tile.x && part.destination.y === tile.y))
      .sort((first, second) => first.path!.length - second.path!.length);
    if (routes.length) return { direction: routes[0].step.direction, targetId: target.id };
  }
  return { direction: steps[0]?.direction ?? null, targetId: null };
}

/** Caches a portal-free pathfinder whose connections clear the actual missile body and authored wall raster. */
function missileNavigation(world: PowerupCollisionWorld): EnemyNavigationService {
  const cached = navigationCache.get(world);
  if (cached) return cached;
  const width = Math.floor(world.width / world.tileSize), height = Math.floor(world.height / world.tileSize);
  const tiles = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
    const center = { x: (x + 0.5) * world.tileSize, y: (y + 0.5) * world.tileSize };
    /** Tests body clearance across one complete center-to-center corridor segment. */
    const blocked = (direction: Direction): boolean => {
      const vector = DIRECTION_VECTORS[direction];
      return firstPowerupWallHit(world, center, { x: center.x + vector.dx * world.tileSize,
        y: center.y + vector.dy * world.tileSize }, POWERUP_RULES.missile.radius) !== null;
    };
    return { collides: false, penGate: false, portal: false,
      up: blocked('up'), right: blocked('right'), down: blocked('down'), left: blocked('left') };
  }));
  const grid = new CollisionGrid(tiles);
  const navigation = new EnemyNavigationService(grid, world.tileSize, new PortalService(grid), 'physical');
  navigationCache.set(world, navigation);
  return navigation;
}
