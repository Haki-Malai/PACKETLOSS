export const TILE_SIZE = 16;

export const SPRITE_SIZE = {
  packet: 10,
  enemy: 11,
} as const;

export const SPEED = {
  packet: 1,
  enemy: 1,
} as const;

export const ENEMY_CONFIG = {
  firewall: { speed: 1.15 },
  virus: { speed: 0.85 },
  ping: { speed: 1, intervalMs: 3000, rangeTiles: 8, pulseDurationMs: 600 },
  spam: {
    speed: 1,
    splitIntervalMs: 4000,
    retryMs: 1000,
    maxCount: 4,
    copyScale: 0.8,
    splitEffectDurationMs: 450,
  },
  lag: {
    speed: 0.5,
    dropIntervalMs: 1000,
    zoneDurationMs: 20000,
    radiusTiles: 0.5,
    slowMultiplier: 0.5,
    maxZones: 2,
  },
  quarantine: { speed: 1, intervalMs: 5000, wallDurationMs: 7000, maxWalls: 4, wallsPerCast: 2, rangeTiles: 8 },
  trojan: { speed: 1, intervalMs: 6000, retryMs: 1000, disguiseDurationMs: 10000, revealRangeTiles: 2, revealGraceMs: 600 },
} as const;

export const FIREWALL_MIN_PATROL_STEPS = 16;

export const PACKET_PORTAL_BLINK = {
  durationMs: 1500,
  intervalMs: 120,
} as const;

export const PACKET_DEATH_RECOVERY = {
  durationMs: 1200,
  blinkStartIntervalMs: 60,
  blinkEndIntervalMs: 220,
} as const;

export const PACKET_DEATH_ANIMATION = {
  durationMs: 900,
} as const;

export const CAMERA = {
  zoom: 5,
  followLerp: { x: 0.25, y: 0.25 },
} as const;

export const COARSE_POINTER_MEDIA_QUERY = '(hover: none) and (pointer: coarse)';
export const MOBILE_SWIPE_THRESHOLD_PX = 18;
export const MOBILE_SWIPE_AXIS_LOCK_RATIO = 1.2;
export const MOBILE_TAP_MAX_DELTA_PX = 10;

export const INITIAL_LIVES = 3;
export const LEVEL_MULTIPLIER_STEP = 1.25;
export const ENEMY_JAIL_RELEASE_DELAY_MS = 5000;
export const ENEMY_JAIL_RELEASE_INTERVAL_MS = 900;
export const ENEMY_JAIL_MOVE_SPEED = 0.5;
export const ENEMY_JAIL_RELEASE_ALIGN_TWEEN_MS = 260;
export const ENEMY_JAIL_RELEASE_TWEEN_MS = 650;
export const ENEMY_SCARED_DURATION_MS = 6000;
export const ENEMY_SCARED_WARNING_DURATION_MS = 1200;
export const ENEMY_EAT_CHAIN_SCORES = [200, 400, 800, 1600] as const;

export const COLLECTIBLE_CONFIG: Record<
  number,
  {
    texture: string;
    size: number;
    score: number;
  }
> = {
  0: { texture: 'point', size: 2.5, score: 10 },
  1: { texture: 'point', size: 4, score: 50 },
  2: { texture: 'cherry', size: 4, score: 100 },
  3: { texture: 'strawberry', size: 4, score: 150 },
  4: { texture: 'banana', size: 4, score: 200 },
  5: { texture: 'pear', size: 4, score: 250 },
  6: { texture: 'heart', size: 4, score: 300 },
};
