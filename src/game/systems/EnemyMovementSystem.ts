import { EnemyDecisionService } from '../domain/services/EnemyDecisionService';
import { EnemyEntity } from '../domain/entities/EnemyEntity';
import { EnemyNavigationService } from '../domain/services/EnemyNavigationService';
import { MovementRules } from '../domain/services/MovementRules';
import { PortalService } from '../domain/services/PortalService';
import { RandomSource } from '../shared/random/RandomSource';
import { WorldState } from '../domain/world/WorldState';
import { CollisionGrid } from '../domain/world/CollisionGrid';
import { Direction, OPPOSITE_DIRECTION } from '../domain/valueObjects/Direction';
import { ENEMY_EAT_DURATION_MS } from '../shared/enemyEating';

export class EnemyMovementSystem {
  private readonly navigation: EnemyNavigationService;
  private readonly physicalNavigation: EnemyNavigationService;
  private readonly patrolNavigation: EnemyNavigationService;
  private readonly returnNavigation: EnemyNavigationService;
  private readonly returningEnemies = new WeakSet<EnemyEntity>();

  /** Keeps authored patrol selection separate from the live navigation grid's temporary walls. */
  constructor(
    private readonly world: WorldState,
    private readonly movementRules: MovementRules,
    private readonly decisions: EnemyDecisionService,
    private readonly portalService: PortalService,
    private readonly rng: RandomSource,
  ) {
    this.navigation = new EnemyNavigationService(world.collisionGrid, world.tileSize, portalService);
    this.physicalNavigation = new EnemyNavigationService(world.collisionGrid, world.tileSize, portalService, 'physical');
    this.patrolNavigation = new EnemyNavigationService(new CollisionGrid(world.collisionGrid.toArray()), world.tileSize, portalService);
    this.returnNavigation = new EnemyNavigationService(world.collisionGrid, world.tileSize, portalService, 'returning', world.enemyJailBounds);
    this.prepareFirewallPatrols();
  }

  /** Returns the earliest enemy center, portal, or return-form transition within a simulation slice. */
  getSimulationBoundaryMs(maximumMs: number): number {
    let boundaryMs = maximumMs;
    for (const enemy of this.world.enemies) {
      if (!enemy.active || enemy.disguised || enemy.revealRemainingMs > 0) continue;
      if (enemy.state.dead) {
        const collapseRemainingMs = ENEMY_EAT_DURATION_MS - (enemy.eatenElapsedMs ?? 0);
        if (collapseRemainingMs > Number.EPSILON) {
          boundaryMs = Math.min(boundaryMs, collapseRemainingMs);
          continue;
        }
        boundaryMs = Math.min(boundaryMs, this.movementRules.timeForDistance(
          this.movementRules.getDistanceToCenter(enemy, enemy.direction), enemy.baseSpeed * 2));
        continue;
      }
      if (!enemy.state.free || this.world.enemiesExitingJail.has(enemy)) continue;
      const speed = enemy.baseSpeed * (enemy.state.scared ? 0.5 : 1);
      const centerDistance = this.movementRules.getDistanceToCenter(enemy, enemy.direction);
      const portalDistance = enemy.key === 'virus' ? null : this.portalService.getDistanceToTeleport(
        enemy, this.world.collisionGrid, this.world.tileSize);
      const distance = portalDistance === null ? centerDistance : Math.min(centerDistance, portalDistance);
      boundaryMs = Math.min(boundaryMs, this.movementRules.timeForDistance(distance, speed));
    }
    return boundaryMs;
  }

  /** Advances active and returning enemies for one bounded simulation slice. */
  update(deltaMs = 1000 / 60): void {
    if (!this.world.isMoving || this.world.outcome) return;
    this.world.enemies.forEach((enemy) => {
      if (enemy.active && enemy.state.dead) {
        this.returnToJail(enemy, deltaMs);
        return;
      }
      if (!enemy.active || !enemy.state.free || enemy.disguised || enemy.revealRemainingMs > 0
        || this.world.enemiesExitingJail.has(enemy)) {
        return;
      }

      enemy.speed = enemy.baseSpeed * (enemy.state.scared ? 0.5 : 1);
      if (enemy.moved.x === 0 && enemy.moved.y === 0) {
        const playerTile = {
          x: Math.floor(this.world.packet.x / this.world.tileSize),
          y: Math.floor(this.world.packet.y / this.world.tileSize),
        };
        const navigation = enemy.key === 'virus' ? this.physicalNavigation : this.navigation;
        const direction = this.decisions.chooseEnemyDirection(enemy, playerTile, navigation, this.rng);
        if (!direction) return;
        enemy.direction = direction;
      }
      const collisionTiles = this.world.collisionGrid.getTilesAt(enemy.tile);
      const canMoveCurrent = this.movementRules.canMove(enemy.direction, enemy.moved.y, enemy.moved.x, collisionTiles, 'enemy');
      const canAdvanceOutward = enemy.key !== 'virus'
        && this.portalService.canAdvanceOutward(enemy, this.world.collisionGrid);

      if (canMoveCurrent || canAdvanceOutward) {
        const portalDistance = enemy.key === 'virus' ? null : this.portalService.getDistanceToTeleport(
          enemy, this.world.collisionGrid, this.world.tileSize);
        this.movementRules.advanceEntity(enemy, enemy.direction,
          this.movementRules.movementDistance(enemy.speed, deltaMs), portalDistance ?? Infinity);
      } else {
        this.movementRules.discardPendingDistance(enemy);
      }

      if (enemy.key !== 'virus') {
        this.portalService.tryTeleport(enemy, this.world.collisionGrid, this.world.tick, this.world.tileSize);
      }
      this.movementRules.syncEntityPosition(enemy);
    });
  }

  /** Clears route progress and chooses a fresh Firewall patrol after a roster reset. */
  reset(): void {
    this.decisions.reset();
    this.world.enemies.forEach((enemy) => this.returningEnemies.delete(enemy));
    this.prepareFirewallPatrols();
  }

  /** Advances collapse timing, then moves a harmless enemy toward the jail. */
  private returnToJail(enemy: EnemyEntity, deltaMs: number): void {
    const elapsed = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
    const previousElapsed = enemy.eatenElapsedMs ?? 0;
    enemy.eatenElapsedMs = Math.min(ENEMY_EAT_DURATION_MS, previousElapsed + elapsed);
    if (enemy.eatenElapsedMs < ENEMY_EAT_DURATION_MS) return;
    const movementElapsed = previousElapsed < ENEMY_EAT_DURATION_MS
      ? Math.max(0, previousElapsed + elapsed - ENEMY_EAT_DURATION_MS) : elapsed;
    if (movementElapsed <= 0) return;

    enemy.speed = enemy.baseSpeed * 2;
    const centered = enemy.moved.x === 0 && enemy.moved.y === 0;
    if (centered && enemy.tile.x === this.world.enemyJailReturnTile.x && enemy.tile.y === this.world.enemyJailReturnTile.y) {
      enemy.state.dead = false;
      enemy.state.soonFree = !enemy.isCopy;
      enemy.eatenElapsedMs = null;
      enemy.speed = enemy.baseSpeed;
      this.returningEnemies.delete(enemy);
      if (enemy.isCopy) {
        enemy.active = false;
        this.world.enemyAnimations.delete(enemy);
      } else {
        this.prepareFirewallPatrol(enemy);
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
    this.movementRules.advanceEntity(enemy, enemy.direction,
      this.movementRules.movementDistance(enemy.speed, movementElapsed));
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

  /** Chooses new patrols for active Firewall instances at their current lifecycle origin. */
  private prepareFirewallPatrols(): void {
    this.world.enemies.forEach((enemy) => {
      if (enemy.active && enemy.key === 'firewall') this.prepareFirewallPatrol(enemy);
    });
  }

  /** Chooses Firewall's next patrol from its release tile or current tutorial position. */
  private prepareFirewallPatrol(enemy: EnemyEntity): void {
    const origin = enemy.state.free ? enemy.tile : {
      x: this.world.enemyJailReturnTile.x,
      y: Math.max(0, this.world.enemyJailBounds.y - 1),
    };
    // Select the authored long loop even when temporary walls currently interrupt it.
    this.decisions.prepareFirewallPatrol(enemy, origin, this.patrolNavigation, this.rng);
  }
}
