import { GHOST_SCARED_WARNING_DURATION_MS } from '../../config/constants';
import { GhostEntity } from '../domain/entities/GhostEntity';
import { WorldState } from '../domain/world/WorldState';

export type GhostAppearance = GhostEntity['key'] | 'scared';

export function resolveGhostAppearance(world: WorldState, ghost: GhostEntity): GhostAppearance {
  if (!ghost.state.scared) {
    return ghost.key;
  }

  const remaining = world.ghostScaredTimers.get(ghost) ?? 0;
  if (remaining > 0 && remaining <= GHOST_SCARED_WARNING_DURATION_MS) {
    const warning = world.ghostScaredWarnings.get(ghost);
    if (warning?.showBaseColor) {
      return ghost.key;
    }
  }

  return 'scared';
}
