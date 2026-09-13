import { COLLECTIBLE_CONFIG } from '../../config/constants';

export type CollectibleKind = 'base' | 'power';

export interface EatEffect {
  x: number;
  y: number;
  elapsedMs: number;
  durationMs: number;
  sizeStart: number;
  sizeEnd: number;
}

export const EAT_EFFECT_DURATION_MS = 300;
export const STAR_ABSORPTION_DURATION_MS = 180;

export function samplePickupPulse(elapsedMs: number): number {
  if (elapsedMs <= STAR_ABSORPTION_DURATION_MS || elapsedMs >= EAT_EFFECT_DURATION_MS) return 0;
  return Math.sin(Math.PI * (elapsedMs - STAR_ABSORPTION_DURATION_MS)
    / (EAT_EFFECT_DURATION_MS - STAR_ABSORPTION_DURATION_MS));
}

export function createEatEffect(kind: CollectibleKind, x: number, y: number): EatEffect {
  const size = COLLECTIBLE_CONFIG[kind === 'power' ? 1 : 0].size;
  return { x, y, elapsedMs: 0, durationMs: EAT_EFFECT_DURATION_MS, sizeStart: size, sizeEnd: 0 };
}
