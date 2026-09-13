import { ENEMY_SCARED_WARNING_DURATION_MS } from '../../config/constants';
import { EnemyEntity } from '../domain/entities/EnemyEntity';
import { WorldState } from '../domain/world/WorldState';

export type EnemyAppearance = EnemyEntity['key'] | 'scared';

export function resolveEnemyAppearance(world: WorldState, enemy: EnemyEntity): EnemyAppearance {
  if (!enemy.state.scared) {
    return enemy.key;
  }

  const remaining = world.enemyScaredTimers.get(enemy) ?? 0;
  if (remaining > 0 && remaining <= ENEMY_SCARED_WARNING_DURATION_MS) {
    const warning = world.enemyScaredWarnings.get(enemy);
    if (warning?.showBaseColor) {
      return enemy.key;
    }
  }

  return 'scared';
}
