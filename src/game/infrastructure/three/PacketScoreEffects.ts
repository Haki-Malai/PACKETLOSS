export interface PacketScoreTier {
  readonly id: 'quiet' | 'trace' | 'spark' | 'signal' | 'stream' | 'charge' | 'surge' | 'radiant' | 'critical' | 'overload';
  readonly name: string;
  readonly minimumScore: number;
  readonly floatingDigits: number;
  readonly surfaceDigits: number;
  readonly pixelCount: number;
  readonly pixelOpacity: number;
  readonly trailStrength: number;
  readonly glowOpacity: number;
  readonly glowScale: number;
}

/** Ten ordered cosmetic steps; none of these values changes gameplay or power effects. */
export const PACKET_SCORE_TIERS = [
  { id: 'quiet', name: 'Quiet', minimumScore: 0, floatingDigits: 0, surfaceDigits: 0,
    pixelCount: 0, pixelOpacity: 0, trailStrength: 0.08, glowOpacity: 0, glowScale: 1 },
  { id: 'trace', name: 'Trace', minimumScore: 250, floatingDigits: 0, surfaceDigits: 0,
    pixelCount: 2, pixelOpacity: 0.2, trailStrength: 0.14, glowOpacity: 0.02, glowScale: 1.01 },
  { id: 'spark', name: 'Spark', minimumScore: 500, floatingDigits: 2, surfaceDigits: 0,
    pixelCount: 4, pixelOpacity: 0.3, trailStrength: 0.22, glowOpacity: 0.045, glowScale: 1.03 },
  { id: 'signal', name: 'Signal', minimumScore: 1_000, floatingDigits: 4, surfaceDigits: 0,
    pixelCount: 6, pixelOpacity: 0.45, trailStrength: 0.3, glowOpacity: 0.08, glowScale: 1.05 },
  { id: 'stream', name: 'Stream', minimumScore: 2_000, floatingDigits: 5, surfaceDigits: 0,
    pixelCount: 8, pixelOpacity: 0.55, trailStrength: 0.4, glowOpacity: 0.1, glowScale: 1.065 },
  { id: 'charge', name: 'Charge', minimumScore: 3_500, floatingDigits: 6, surfaceDigits: 1,
    pixelCount: 11, pixelOpacity: 0.65, trailStrength: 0.52, glowOpacity: 0.125, glowScale: 1.08 },
  { id: 'surge', name: 'Surge', minimumScore: 5_000, floatingDigits: 8, surfaceDigits: 2,
    pixelCount: 14, pixelOpacity: 0.75, trailStrength: 0.65, glowOpacity: 0.15, glowScale: 1.1 },
  { id: 'radiant', name: 'Radiant', minimumScore: 6_500, floatingDigits: 9, surfaceDigits: 2,
    pixelCount: 15, pixelOpacity: 0.85, trailStrength: 0.76, glowOpacity: 0.18, glowScale: 1.12 },
  { id: 'critical', name: 'Critical', minimumScore: 8_000, floatingDigits: 10, surfaceDigits: 3,
    pixelCount: 17, pixelOpacity: 0.93, trailStrength: 0.88, glowOpacity: 0.215, glowScale: 1.14 },
  { id: 'overload', name: 'Overload', minimumScore: 10_000, floatingDigits: 10, surfaceDigits: 4,
    pixelCount: 18, pixelOpacity: 1, trailStrength: 1, glowOpacity: 0.25, glowScale: 1.16 },
] as const satisfies readonly PacketScoreTier[];

/** Resolves a cosmetic tier from nonnegative score, treating invalid scores as zero. */
export function resolvePacketScoreTier(score: number): PacketScoreTier {
  const safeScore = Number.isFinite(score) ? Math.max(0, score) : 0;
  for (let index = PACKET_SCORE_TIERS.length - 1; index > 0; index -= 1) {
    if (safeScore >= PACKET_SCORE_TIERS[index].minimumScore) return PACKET_SCORE_TIERS[index];
  }
  return PACKET_SCORE_TIERS[0];
}
