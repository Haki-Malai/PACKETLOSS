import { EnemyDecisionService } from '../domain/services/EnemyDecisionService';
import { EnemyEntity } from '../domain/entities/EnemyEntity';
import { EnemyNavigationService } from '../domain/services/EnemyNavigationService';
import { MovementRules } from '../domain/services/MovementRules';
import { PortalService } from '../domain/services/PortalService';
import { RandomSource } from '../shared/random/RandomSource';
import { WorldState } from '../domain/world/WorldState';
import { Direction, OPPOSITE_DIRECTION } from '../domain/valueObjects/Direction';
import { ENEMY_EAT_DURATION_MS } from '../shared/enemyEating';

export class EnemyMovementSystem {
  private readonly navigation: EnemyNavigationService;
  private readonly returnNavigation: EnemyNavigationService;
  private readonly returningEnemies = new WeakSet<EnemyEntity>();

  constructor(
    private readonly world: WorldState,
    private readonly movementRules: MovementRules,
    private readonly decisions: EnemyDecisionService,
    private readonly portalService: PortalService,
    private readonly rng: RandomSource,
  ) {
    this.navigation = new EnemyNavigationService(world.collisionGrid, world.tileSize, portalService);
    this.returnNavigation = new EnemyNavigationService(world.collisionGrid, world.tileSize, portalService, 'returning', world.enemyJailBounds);
  }

  /** Advances active and returning enemies using the current level multiplier. */
  update(deltaMs = 1000 / 60): void {
    if (!this.world.isMoving || this.world.outcome) return;
    this.world.enemies.forEach((enemy) => {
      if (enemy.active && enemy.state.dead) {
        this.returnToJail(enemy, deltaMs);
        return;
      }
      if (!enemy.active || !enemy.state.free || this.world.enemiesExitingJail.has(enemy)) {
        return;
      }

      enemy.speed = enemy.baseSpeed * this.world.levelMultiplier * (enemy.state.scared ? 0.5 : 1);
      if (enemy.moved.x === 0 && enemy.moved.y === 0) {
        const playerTile = {
          x: Math.floor(this.world.packet.x / this.world.tileSize),
          y: Math.floor(this.world.packet.y / this.world.tileSize),
        };
        const direction = this.decisions.chooseEnemyDirection(enemy, playerTile, this.navigation, this.rng);
        if (!direction) return;
        enemy.direction = direction;
      }
      const collisionTiles = this.world.collisionGrid.getTilesAt(enemy.tile);
      const canMoveCurrent = this.movementRules.canMove(enemy.direction, enemy.moved.y, enemy.moved.x, collisionTiles, 'enemy');
      const canAdvanceOutward = this.portalService.canAdvanceOutward(enemy, this.world.collisionGrid);

      if (canMoveCurrent || canAdvanceOutward) {
        this.movementRules.advanceEntity(enemy, enemy.direction, enemy.speed);
      }

      this.portalService.tryTeleport(enemy, this.world.collisionGrid, this.world.tick, this.world.tileSize);
      this.movementRules.syncEntityPosition(enemy);
    });
  }

  /** Clears return-route progress after the enemy roster is restored to jail. */
  reset(): void {
    this.world.enemies.forEach((enemy) => this.returningEnemies.delete(enemy));
  }

  private returnToJail(enemy: EnemyEntity, deltaMs: number): void {
    const elapsed = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
    enemy.eatenElapsedMs = Math.min(ENEMY_EAT_DURATION_MS, (enemy.eatenElapsedMs ?? 0) + elapsed);
    if (enemy.eatenElapsedMs < ENEMY_EAT_DURATION_MS) return;

    enemy.speed = enemy.baseSpeed * this.world.levelMultiplier * 2;
    const centered = enemy.moved.x === 0 && enemy.moved.y === 0;
    if (centered && enemy.tile.x === this.world.enemyJailReturnTile.x && enemy.tile.y === this.world.enemyJailReturnTile.y) {
      enemy.state.dead = false;
      enemy.state.soonFree = !enemy.isCopy;
      enemy.eatenElapsedMs = null;
      enemy.speed = enemy.baseSpeed * this.world.levelMultiplier;
      this.returningEnemies.delete(enemy);
      if (enemy.isCopy) {
        enemy.active = false;
        this.world.enemyAnimations.delete(enemy);
      }
      return;
    }

    if (centered || !this.returningEnemies.has(enemy)) {
      const direction = this.chooseReturnDirection(enemy);
      if (!direction) return;
      enemy.direction = direction;
      this.returningEnemies.add(enemy);
    }
    // The route contains physical corridor edges only; returning enemies never use portals.
    this.movementRules.advanceEntity(enemy, enemy.direction, enemy.speed);
    this.movementRules.syncEntityPosition(enemy);
  }

  private chooseReturnDirection(enemy: EnemyEntity): Direction | null {
    const target = this.world.enemyJailReturnTile;
    const anchorPath = this.returnNavigation.findPath(enemy.tile, target);
    if (enemy.moved.x === 0 && enemy.moved.y === 0) return anchorPath?.[0]?.direction ?? null;

    const offset = enemy.moved.x || enemy.moved.y;
    const outward: Direction = enemy.moved.x !== 0 ? (offset > 0 ? 'right' : 'left') : (offset > 0 ? 'down' : 'up');
    const next = this.returnNavigation.getSteps(enemy.tile).find((step) => step.direction === outward);
    const nextPath = next ? this.returnNavigation.findPath(next.destination, target) : null;
    const fraction = Math.abs(offset) / this.world.tileSize;
    const anchorCost = anchorPath ? fraction + anchorPath.length : Infinity;
    const nextCost = nextPath ? 1 - fraction + nextPath.length : Infinity;
    // An outward portal half-step has no physical next tile, so retreat to its center.
    return nextCost < anchorCost ? outward : OPPOSITE_DIRECTION[outward];
  }
}
