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

export const EAT_EFFECT_DURATION_MS = 96;

export function createEatEffect(kind: CollectibleKind, x: number, y: number): EatEffect {
  const size = COLLECTIBLE_CONFIG[kind === 'power' ? 1 : 0].size;
  return { x, y, elapsedMs: 0, durationMs: EAT_EFFECT_DURATION_MS, sizeStart: size, sizeEnd: size * 1.5 };
}
