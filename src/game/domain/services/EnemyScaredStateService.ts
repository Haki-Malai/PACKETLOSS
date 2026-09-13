import { EnemyEntity } from '../entities/EnemyEntity';
import { WorldState } from '../world/WorldState';

export function setEnemyScaredWindow(world: WorldState, enemy: EnemyEntity, durationMs: number): void {
  if (!enemy.active || enemy.state.dead) return;
  enemy.state.scared = true;
  enemy.resetAbilities();
  world.enemyScaredTimers.set(enemy, durationMs);
  world.enemyScaredWarnings.delete(enemy);
}

export function clearEnemyScaredWindow(world: WorldState, enemy: EnemyEntity): void {
  enemy.state.scared = false;
  enemy.resetAbilities();
  world.enemyScaredTimers.delete(enemy);
  world.enemyScaredWarnings.delete(enemy);
}

export function setActiveEnemiesScaredWindow(world: WorldState, durationMs: number): void {
  world.lagZones = [];
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
