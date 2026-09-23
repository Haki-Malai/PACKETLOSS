/** Initial Endless mode values kept together for gameplay tuning. */
export const ENDLESS_SETTINGS = {
  width: 25,
  sectionRows: 24,
  residentSections: 5,
  logoChance: 0.5,
  minimumLogoSpacingRows: 24,
  extraStraightRowChance: 0.25,
  straightRunChance: 0.7,
  straightRunMinTiles: 12,
  straightRunMaxTiles: 18,
  maxVerticalStraightTiles: 4,
  maxHorizontalWallTiles: 10,
  powerCoresPerTile: 1 / 180,
  initialPowerCores: { min: 15, max: 17 },
  sectionPowerCores: { min: 3, max: 4 },
  firstEncounterMs: 5000,
  speedStartMultiplier: 1,
  speedScoreScale: 10_000,
  forwardWaveChance: 0.8,
  encounterIntervalDropPerSectionMs: 500,
  encounterIntervalMinMs: 5000,
  encounterIntervalMaxMs: 9000,
  encounterIntervalFloorMinMs: 2000,
  encounterIntervalFloorMaxMs: 4000,
  waveMinEnemies: 1,
  waveMaxEnemies: 3,
  staggeredEntryMs: 400,
  deferredSpawnRetryMs: 500,
  spawnMarginTiles: 3,
  spawnSearchDepthTiles: 8,
  spawnMinCorridorSteps: 8,
  retireMarginTiles: 24,
  retireHorizontalMarginTiles: 6,
  bugExitMarginTiles: 3,
} as const;

/** Returns uncapped Endless simulation speed with diminishing increases for each score point. */
export function endlessSpeedMultiplier(score: number): number {
  return Math.sqrt(ENDLESS_SETTINGS.speedStartMultiplier ** 2 + score / ENDLESS_SETTINGS.speedScoreScale);
}

/** Returns the inclusive wave interval bounds after new sections have been entered. */
export function endlessEncounterInterval(exploredSections: number): { minMs: number; maxMs: number } {
  const reduction = exploredSections * ENDLESS_SETTINGS.encounterIntervalDropPerSectionMs;
  return {
    minMs: Math.max(ENDLESS_SETTINGS.encounterIntervalFloorMinMs,
      ENDLESS_SETTINGS.encounterIntervalMinMs - reduction),
    maxMs: Math.max(ENDLESS_SETTINGS.encounterIntervalFloorMaxMs,
      ENDLESS_SETTINGS.encounterIntervalMaxMs - reduction),
  };
}
