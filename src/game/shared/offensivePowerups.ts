import type { Direction } from '../domain/valueObjects/Direction';
import { SeededRandom } from './random/SeededRandom';

export const OFFENSIVE_POWERUPS = ['blast', 'reverse-blast', 'laser', 'missile'] as const;
export type PowerupKind = typeof OFFENSIVE_POWERUPS[number];
export type OffensivePowerupKind = PowerupKind;
export const POWERUP_PICKUP_RADIUS = 2.5;
export const POWERUP_DEVELOPMENT_KEYS: Readonly<Partial<Record<string, PowerupKind>>> = {
  Digit1: 'blast', Digit2: 'reverse-blast', Digit3: 'laser', Digit4: 'missile',
};
export interface PowerupPoint { x: number; y: number }
export interface PowerupPickup extends PowerupPoint { id: number; kind: PowerupKind; sectionIndex?: number }
export interface PowerupCast {
  id: number; ownerId: string; kind: PowerupKind; facing: Direction; elapsedMs: number;
  origin: PowerupPoint | null;
}
export interface PowerupProjectile extends PowerupPoint {
  id: number; ownerId: string; targetId: string | null; angle: number; elapsedMs: number;
}
export interface PowerupEffect extends PowerupPoint {
  id: number; ownerId: string; kind: PowerupKind;
  role: 'attack' | 'launch' | 'impact' | 'collection';
  angle: number; elapsedMs: number; durationMs: number; radius: number; length: number;
  source?: PowerupPoint;
}
export interface PowerupCombatState {
  clockMs: number; nextId: number;
  casts: PowerupCast[]; projectiles: PowerupProjectile[]; effects: PowerupEffect[];
}
export interface PowerupCombatActor extends PowerupPoint {
  id: string; radius: number; active: boolean; protected?: boolean;
  previous?: PowerupPoint; teleported?: boolean;
  teleportMotion?: { departure: PowerupPoint; arrival: PowerupPoint; fraction: number };
}
export interface PowerupHit { targetId: string; position: PowerupPoint }

export const POWERUP_RULES = {
  blast: { releaseMs: 450, durationMs: 1600, activeUntilMs: 1600, growUntilMs: 1200, radius: 64 },
  'reverse-blast': { releaseMs: 350, durationMs: 2200, activeUntilMs: 350, radius: 32 },
  laser: { releaseMs: 480, durationMs: 1800, activeUntilMs: 1500, radius: 3.4, laserGrowMs: 170, authoredLength: 64, muzzle: 3 },
  missile: { releaseMs: 360, durationMs: 1000, activeUntilMs: 360, radius: 2,
    speedMultiplier: 2, turnRadiansPerSecond: Math.PI * 2, lifetimeMs: 3000,
    targetRange: 128, muzzle: 5, launchDurationMs: 600, impactDurationMs: 700 },
} as const;

/** Recognizes offensive pickups without treating ordinary points as weapons. */
export function isPowerupKind(value: string): value is PowerupKind {
  return (OFFENSIVE_POWERUPS as readonly string[]).includes(value);
}

/** Recognizes an offensive item at collection and protocol boundaries. */
export const isOffensivePowerup = isPowerupKind;

/** Samples the shared blast damage and visible radius in world units, reaching full size before the fade. */
export function samplePowerupRadius(kind: PowerupKind, elapsedMs: number): number {
  if (kind !== 'blast') return POWERUP_RULES[kind].radius;
  const rule = POWERUP_RULES.blast;
  const fraction = Math.max(0, Math.min(1, (elapsedMs - rule.releaseMs) / (rule.growUntilMs - rule.releaseMs)));
  return rule.radius * (1 - (1 - fraction) ** 3);
}

/** Returns the remaining laser animation time that holds its caster's position and facing. */
export function getPowerupMovementLockMs(state: PowerupCombatState, ownerId: string): number {
  const cast = state.casts.find((candidate) => candidate.ownerId === ownerId && candidate.kind === 'laser');
  return cast ? Math.max(0, POWERUP_RULES.laser.durationMs - cast.elapsedMs) : 0;
}

/** Samples laser growth to the first wall; damage and rendering use the same uncapped reach. */
export function sampleLaserLength(elapsedMs: number, wallDistance: number): number {
  const rule = POWERUP_RULES.laser;
  return wallDistance * Math.max(0, Math.min(1, (elapsedMs - rule.releaseMs) / rule.laserGrowMs));
}

/** Places reproducible, separated pickups; mirrored placement uses the map's world width. */
export function placePowerupPickups(candidates: readonly PowerupPoint[], seed: number, perKind = 2,
  mirrorWidth?: number): PowerupPickup[] {
  const random = new SeededRandom(seed);
  const points = candidates.map((point) => ({ ...point }));
  for (let index = points.length - 1; index > 0; index -= 1) {
    const other = random.int(index + 1);
    [points[index], points[other]] = [points[other], points[index]];
  }
  const pickups: PowerupPickup[] = [];
  const key = (point: PowerupPoint): string => `${point.x},${point.y}`;
  const available = new Map(points.map((point) => [key(point), point]));
  for (const kind of OFFENSIVE_POWERUPS) {
    let remaining = perKind;
    while (remaining > 0) {
      const eligible = points.filter((point) => available.has(key(point)) && (mirrorWidth === undefined
        || point.x < mirrorWidth / 2 && available.has(key({ x: mirrorWidth - point.x, y: point.y }))));
      const point = eligible.find((candidate) => pickups.every((pickup) => Math.hypot(candidate.x - pickup.x,
        candidate.y - pickup.y) >= 48)) ?? eligible[0];
      if (!point) break;
      const add = (position: PowerupPoint): void => {
        pickups.push({ ...position, id: pickups.length + 1, kind });
        available.delete(key(position));
      };
      add(point);
      remaining -= 1;
      if (mirrorWidth !== undefined && remaining > 0) {
        add({ x: mirrorWidth - point.x, y: point.y });
        remaining -= 1;
      }
    }
  }
  return pickups;
}
