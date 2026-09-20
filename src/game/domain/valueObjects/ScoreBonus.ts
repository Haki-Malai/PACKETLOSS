export const SCORE_BONUS_TIERS = [
    { kind: 'bug', multiplier: 1.5 },
    { kind: 'key', multiplier: 2 },
    { kind: 'cloud', multiplier: 2.5 },
    { kind: 'wifi', multiplier: 3 },
    { kind: 'chip', multiplier: 4 },
] as const;

export type ScoreBonusKind = (typeof SCORE_BONUS_TIERS)[number]['kind'];

export const SCORE_BONUS_ACTIVE_MS = 15_000;
