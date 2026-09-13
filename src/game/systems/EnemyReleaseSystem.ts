import {
  ENEMY_JAIL_MOVE_SPEED,
  ENEMY_JAIL_RELEASE_DELAY_MS,
  ENEMY_JAIL_RELEASE_INTERVAL_MS,
} from '../../config/constants';
import { TimerHandle } from '../../engine/timer';
import { EnemyEntity } from '../domain/entities/EnemyEntity';
import { EnemyJailService } from '../domain/services/EnemyJailService';
import { MovementRules } from '../domain/services/MovementRules';
import { Direction } from '../domain/valueObjects/Direction';
import { RandomSource } from '../shared/random/RandomSource';
import { WorldState } from '../domain/world/WorldState';
import { TimerSchedulerAdapter } from '../infrastructure/adapters/TimerSchedulerAdapter';

type ReleaseSide = 'left' | 'right';
type ReleasePhase = 'to_side_center' | 'to_gate_column' | 'cross_gate_once';

interface ReleaseProgress {
  side: ReleaseSide;
  phase: ReleasePhase;
  gateColumnX: number;
  releaseY: number;
}

type MoveOutcome = 'moved' | 'reached';
const POSITION_EPSILON = 0.001;

export class EnemyReleaseSystem {
  private enemyReleaseTimers = new Map<EnemyEntity, TimerHandle>();
  private releaseProgressByEnemy = new Map<EnemyEntity, ReleaseProgress>();
  private nextReleaseSide: ReleaseSide = 'left';

  constructor(
    private readonly world: WorldState,
    private readonly movementRules: MovementRules,
    private readonly jailService: EnemyJailService,
    private readonly scheduler: TimerSchedulerAdapter,
    private readonly rng: RandomSource,
  ) {}

  start(): void {
    this.clearReleaseTimers();
    this.releaseProgressByEnemy.clear();
    this.world.enemiesExitingJail.clear();
    this.nextReleaseSide = 'left';
    this.world.enemies.forEach((enemy, enemyIndex) => {
      const delay = ENEMY_JAIL_RELEASE_DELAY_MS + enemyIndex * ENEMY_JAIL_RELEASE_INTERVAL_MS;
      this.queueEnemyRelease(enemy, delay);
    });
  }

  update(): void {
    this.world.enemies.forEach((enemy) => {
      if (!enemy.active || enemy.state.dead) {
        this.cleanupEnemyReleaseState(enemy);
        enemy.resetAbilities();
        return;
      }
      enemy.speed = enemy.baseSpeed * (enemy.state.scared ? 0.5 : 1);

      if (this.shouldQueueRelease(enemy)) {
        this.queueEnemyRelease(enemy);
      }

      if (this.world.enemiesExitingJail.has(enemy)) {
        this.advanceRelease(enemy);
        return;
      }

      if (!enemy.state.free) {
        this.jailService.moveEnemyInJail(
          enemy,
          this.world.enemyJailBounds,
          this.movementRules,
          this.rng,
          Math.min(ENEMY_JAIL_MOVE_SPEED, enemy.speed),
        );
        this.movementRules.syncEntityPosition(enemy);
      }
    });
  }

  destroy(): void {
    this.clearReleaseTimers();
    this.releaseProgressByEnemy.clear();
    this.world.enemiesExitingJail.clear();
  }

  queueEnemyRelease(enemy: EnemyEntity, delayMs: number = ENEMY_JAIL_RELEASE_DELAY_MS): void {
    if (!enemy.active || enemy.state.dead || enemy.state.free) {
      return;
    }

    enemy.state.soonFree = true;

    const existingTimer = this.enemyReleaseTimers.get(enemy);
    if (existingTimer) {
      existingTimer.cancel();
      this.enemyReleaseTimers.delete(enemy);
    }

    const enemyIndex = Math.max(0, this.world.enemies.indexOf(enemy));
    const queuedOffsetMs =
      delayMs === ENEMY_JAIL_RELEASE_DELAY_MS ? this.resolveQueuedReleaseOffsetMs(enemy) : 0;
    const handle = this.scheduler.delayedCall(delayMs + queuedOffsetMs, () => {
      this.enemyReleaseTimers.delete(enemy);
      this.releaseEnemy(enemy, enemyIndex);
    });
    this.enemyReleaseTimers.set(enemy, handle);
  }

  private releaseEnemy(enemy: EnemyEntity, _enemyIndex: number): void {
    if (!enemy.active || enemy.state.dead || enemy.state.free || !enemy.state.soonFree) {
      return;
    }

    const side = this.nextReleaseSide;
    const releaseY = this.resolveReleaseY();
    const gateColumnX = this.resolveGateColumn(side, releaseY);

    this.nextReleaseSide = side === 'left' ? 'right' : 'left';

    this.world.enemiesExitingJail.add(enemy);
    this.releaseProgressByEnemy.set(enemy, {
      side,
      phase: 'to_side_center',
      gateColumnX,
      releaseY,
    });
  }

  private advanceRelease(enemy: EnemyEntity): void {
    const progress = this.releaseProgressByEnemy.get(enemy);
    if (!progress) {
      this.cleanupEnemyReleaseState(enemy);
      return;
    }

    if (progress.phase === 'to_side_center') {
      const sideCenterX = progress.side === 'left' ? this.world.enemyJailBounds.minX : this.world.enemyJailBounds.maxX;
      const sideTarget = { x: sideCenterX, y: this.world.enemyJailBounds.y };
      const outcome = this.moveEnemyTowardTarget(enemy, sideTarget);
      if (outcome === 'reached') {
        progress.phase = 'to_gate_column';
      }
      return;
    }

    if (progress.phase === 'to_gate_column') {
      const gateTarget = { x: progress.gateColumnX, y: this.world.enemyJailBounds.y };
      const outcome = this.moveEnemyTowardTarget(enemy, gateTarget);
      if (outcome === 'reached') {
        progress.phase = 'cross_gate_once';
      }
      return;
    }

    if (progress.phase === 'cross_gate_once') {
      const releaseTarget = { x: progress.gateColumnX, y: progress.releaseY };
      const outcome = this.moveEnemyTowardTarget(enemy, releaseTarget);
      if (outcome === 'reached') {
        this.completeRelease(enemy, progress);
      }
    }
  }

  private clearReleaseTimers(): void {
    this.enemyReleaseTimers.forEach((timer) => {
      timer.cancel();
    });
    this.enemyReleaseTimers.clear();
  }

  private shouldQueueRelease(enemy: EnemyEntity): boolean {
    return !enemy.state.free && enemy.state.soonFree && !this.world.enemiesExitingJail.has(enemy) && !this.enemyReleaseTimers.has(enemy);
  }

  private resolveQueuedReleaseOffsetMs(enemy: EnemyEntity): number {
    let queuedCount = 0;
    this.enemyReleaseTimers.forEach((_handle, queuedEnemy) => {
      if (queuedEnemy !== enemy) {
        queuedCount += 1;
      }
    });
    return queuedCount * ENEMY_JAIL_RELEASE_INTERVAL_MS;
  }

  private resolveReleaseY(): number {
    const releaseY = this.world.enemyJailBounds.y - 1;
    if (releaseY < 0) {
      return 0;
    }
    if (releaseY >= this.world.map.height) {
      return this.world.map.height - 1;
    }
    return releaseY;
  }

  private resolveGateColumn(side: ReleaseSide, releaseY: number): number {
    const columns = this.resolveGateScanColumns(side);
    for (const columnX of columns) {
      if (this.isGateColumnTraversable(columnX, releaseY)) {
        return columnX;
      }
    }
    const minX = this.world.enemyJailBounds.minX;
    const maxX = this.world.enemyJailBounds.maxX;
    return minX + Math.floor((maxX - minX) / 2);
  }

  private resolveGateScanColumns(side: ReleaseSide): number[] {
    const minX = this.world.enemyJailBounds.minX;
    const maxX = this.world.enemyJailBounds.maxX;
    const columns: number[] = [];

    if (side === 'left') {
      for (let x = minX; x <= maxX; x += 1) {
        columns.push(x);
      }
      return columns;
    }

    for (let x = maxX; x >= minX; x -= 1) {
      columns.push(x);
    }
    return columns;
  }

  private isGateColumnTraversable(columnX: number, releaseY: number): boolean {
    void releaseY;
    const jailTile = { x: columnX, y: this.world.enemyJailBounds.y };
    const jailCollisionTiles = this.world.collisionGrid.getTilesAt(jailTile);
    return this.movementRules.canMove('up', 0, 0, jailCollisionTiles, 'enemyRelease');
  }

  private moveEnemyTowardTarget(enemy: EnemyEntity, targetTile: { x: number; y: number }): MoveOutcome {
    const snappedBeforeMove = this.snapResidualOffsetsAtTargetAxes(enemy, targetTile);
    if (snappedBeforeMove) {
      this.movementRules.syncEntityPosition(enemy);
    }

    if (this.isAtTargetCenter(enemy, targetTile)) {
      return 'reached';
    }

    const direction = this.resolveDirectionTowardTarget(enemy, targetTile);
    if (!direction) {
      return 'reached';
    }

    enemy.direction = direction;
    this.movementRules.advanceEntity(enemy, direction, enemy.speed);
    const snappedAfterMove = this.snapResidualOffsetsAtTargetAxes(enemy, targetTile);
    this.movementRules.syncEntityPosition(enemy);

    if (snappedAfterMove) {
      this.movementRules.syncEntityPosition(enemy);
    }

    return this.isAtTargetCenter(enemy, targetTile) ? 'reached' : 'moved';
  }

  private isAtTargetCenter(enemy: EnemyEntity, targetTile: { x: number; y: number }): boolean {
    return (
      enemy.tile.x === targetTile.x &&
      enemy.tile.y === targetTile.y &&
      Math.abs(enemy.moved.x) <= POSITION_EPSILON &&
      Math.abs(enemy.moved.y) <= POSITION_EPSILON
    );
  }

  private snapResidualOffsetsAtTargetAxes(enemy: EnemyEntity, targetTile: { x: number; y: number }): boolean {
    let changed = false;
    if (enemy.tile.x === targetTile.x && Math.abs(enemy.moved.x) <= enemy.speed) {
      if (Math.abs(enemy.moved.x) > POSITION_EPSILON) {
        enemy.moved.x = 0;
        changed = true;
      }
    }
    if (enemy.tile.y === targetTile.y && Math.abs(enemy.moved.y) <= enemy.speed) {
      if (Math.abs(enemy.moved.y) > POSITION_EPSILON) {
        enemy.moved.y = 0;
        changed = true;
      }
    }
    return changed;
  }

  private resolveDirectionTowardTarget(enemy: EnemyEntity, targetTile: { x: number; y: number }): Direction | null {
    const verticalDirection = this.resolveVerticalDirection(enemy, targetTile.y);
    if (verticalDirection) {
      return verticalDirection;
    }
    return this.resolveHorizontalDirection(enemy, targetTile.x);
  }

  private resolveHorizontalDirection(enemy: EnemyEntity, targetX: number): Direction | null {
    if (enemy.tile.x < targetX) {
      return 'right';
    }
    if (enemy.tile.x > targetX) {
      return 'left';
    }
    if (enemy.moved.x > 0) {
      return 'left';
    }
    if (enemy.moved.x < 0) {
      return 'right';
    }
    return null;
  }

  private resolveVerticalDirection(enemy: EnemyEntity, targetY: number): Direction | null {
    if (enemy.tile.y < targetY) {
      return 'down';
    }
    if (enemy.tile.y > targetY) {
      return 'up';
    }
    if (enemy.moved.y > 0) {
      return 'up';
    }
    if (enemy.moved.y < 0) {
      return 'down';
    }
    return null;
  }

  private completeRelease(enemy: EnemyEntity, progress: ReleaseProgress): void {
    this.cleanupEnemyReleaseState(enemy);
    this.movementRules.setEntityTile(enemy, { x: progress.gateColumnX, y: progress.releaseY });
    enemy.direction = 'up';
    enemy.state.free = true;
    enemy.state.soonFree = false;
    enemy.resetAbilities();
  }

  private cleanupEnemyReleaseState(enemy: EnemyEntity): void {
    const timer = this.enemyReleaseTimers.get(enemy);
    if (timer) {
      timer.cancel();
      this.enemyReleaseTimers.delete(enemy);
    }
    this.releaseProgressByEnemy.delete(enemy);
    this.world.enemiesExitingJail.delete(enemy);
  }
}
