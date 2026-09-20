import { addScore } from '../../state/gameState';
import type { WorldState } from '../domain/world/WorldState';

/** Applies the level and temporary bonus factors, rounding one award only once. */
export function awardScore(world: WorldState, baseScore: number): void {
    addScore(Math.round(baseScore * world.levelMultiplier * world.scoreBonusMultiplier));
}
