export const SCORE_BONUS_TIERS = [
    { kind: 'bug', multiplier: 1.5 },
    { kind: 'key', multiplier: 2 },
    { kind: 'cloud', multiplier: 2.5 },
    { kind: 'wifi', multiplier: 3 },
    { kind: 'chip', multiplier: 4 },
] as const;

export type ScoreBonusKind = (typeof SCORE_BONUS_TIERS)[number]['kind'];

export const SCORE_BONUS_MILESTONES = [0.35, 0.7] as const;
export const SCORE_BONUS_PICKUP_MS = 45_000;
export const SCORE_BONUS_ACTIVE_MS = 15_000;

/** Selects the fixed icon and scoring factor for a one-based level. */
export function scoreBonusTier(level: number): (typeof SCORE_BONUS_TIERS)[number] {
    return SCORE_BONUS_TIERS[Math.min(Math.max(1, level), SCORE_BONUS_TIERS.length) - 1];
}
