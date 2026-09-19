import { EnemyEntity } from '../entities/EnemyEntity';
import { WorldState } from '../world/WorldState';

/** Starts or refreshes an enemy's scared window without shortening the development override. */
export function setEnemyScaredWindow(world: WorldState, enemy: EnemyEntity, durationMs: number): void {
  if (!enemy.active || enemy.state.dead) return;
  enemy.state.scared = true;
  enemy.resetAbilities();
  world.enemyScaredTimers.set(
    enemy,
    world.debugPowerOverrideEnabled ? Number.POSITIVE_INFINITY : durationMs,
  );
  world.enemyScaredWarnings.delete(enemy);
}

/** Restores the persistent development power override after an enemy state reset. */
export function restoreEnemyDebugPowerOverride(world: WorldState, enemy: EnemyEntity): void {
  if (!world.debugPowerOverrideEnabled) return;
  setEnemyScaredWindow(world, enemy, Number.POSITIVE_INFINITY);
}

export function clearEnemyScaredWindow(world: WorldState, enemy: EnemyEntity): void {
  enemy.state.scared = false;
  enemy.resetAbilities();
  world.enemyScaredTimers.delete(enemy);
  world.enemyScaredWarnings.delete(enemy);
}

/** Suppresses abilities and clears lingering terrain effects when a power core activates. */
export function setActiveEnemiesScaredWindow(world: WorldState, durationMs: number): void {
  world.lagZones = [];
  world.clearQuarantineWalls();
  world.enemies.forEach((enemy) => {
    if (!enemy.active) {
      return;
    }

    setEnemyScaredWindow(world, enemy, durationMs);
  });
}

export function clearAllEnemyScaredWindow(world: WorldState): void {
  world.enemies.forEach((enemy) => {
    clearEnemyScaredWindow(world, enemy);
  });
}
