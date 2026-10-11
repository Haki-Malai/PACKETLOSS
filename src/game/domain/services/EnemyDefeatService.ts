import type { EnemyEntity } from '../entities/EnemyEntity';
import type { MovementRules } from './MovementRules';
import type { WorldState } from '../world/WorldState';
import { clearEnemyScaredWindow } from './EnemyScaredStateService';

/** Starts the harmless bug transformation and physical jail-return/departure cycle without scoring. */
export function defeatEnemy(
  world: WorldState,
  movementRules: MovementRules,
  enemy: EnemyEntity,
  cause: 'contact' | 'weapon',
): void {
  world.enemiesExitingJail.delete(enemy);
  movementRules.discardPendingDistance(enemy);
  clearEnemyScaredWindow(world, enemy);
  enemy.speed = enemy.baseSpeed;
  enemy.state.free = false;
  enemy.state.soonFree = false;
  enemy.state.dead = true;
  enemy.state.animation = 'default';
  enemy.eatenElapsedMs = 0;
  enemy.defeatCause = cause;
  if (cause === 'weapon') enemy.resetAbilities();
}
