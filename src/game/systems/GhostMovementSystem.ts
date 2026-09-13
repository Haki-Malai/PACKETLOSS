import { GhostDecisionService } from '../domain/services/GhostDecisionService';
import { GhostEntity } from '../domain/entities/GhostEntity';
import { EnemyNavigationService } from '../domain/services/EnemyNavigationService';
import { MovementRules } from '../domain/services/MovementRules';
import { PortalService } from '../domain/services/PortalService';
import { RandomSource } from '../shared/random/RandomSource';
import { WorldState } from '../domain/world/WorldState';
import { Direction, OPPOSITE_DIRECTION } from '../domain/valueObjects/Direction';
import { GHOST_EAT_DURATION_MS } from '../shared/ghostEating';

export class GhostMovementSystem {
  private readonly navigation: EnemyNavigationService;
  private readonly returnNavigation: EnemyNavigationService;
  private readonly returningGhosts = new WeakSet<GhostEntity>();

  constructor(
    private readonly world: WorldState,
    private readonly movementRules: MovementRules,
    private readonly decisions: GhostDecisionService,
    private readonly portalService: PortalService,
    private readonly rng: RandomSource,
  ) {
    this.navigation = new EnemyNavigationService(world.collisionGrid, world.tileSize, portalService);
    this.returnNavigation = new EnemyNavigationService(world.collisionGrid, world.tileSize, portalService, 'returning', world.ghostJailBounds);
  }

  update(deltaMs = 1000 / 60): void {
    if (!this.world.isMoving || this.world.outcome) return;
    this.world.ghosts.forEach((ghost) => {
      if (ghost.active && ghost.state.dead) {
        this.returnToJail(ghost, deltaMs);
        return;
      }
      if (!ghost.active || !ghost.state.free || this.world.ghostsExitingJail.has(ghost)) {
        return;
      }

      ghost.speed = ghost.baseSpeed * (ghost.state.scared ? 0.5 : 1);
      if (ghost.moved.x === 0 && ghost.moved.y === 0) {
        const playerTile = {
          x: Math.floor(this.world.packet.x / this.world.tileSize),
          y: Math.floor(this.world.packet.y / this.world.tileSize),
        };
        const direction = this.decisions.chooseEnemyDirection(ghost, playerTile, this.navigation, this.rng);
        if (!direction) return;
        ghost.direction = direction;
      }
      const collisionTiles = this.world.collisionGrid.getTilesAt(ghost.tile);
      const canMoveCurrent = this.movementRules.canMove(ghost.direction, ghost.moved.y, ghost.moved.x, collisionTiles, 'ghost');
      const canAdvanceOutward = this.portalService.canAdvanceOutward(ghost, this.world.collisionGrid);

      if (canMoveCurrent || canAdvanceOutward) {
        this.movementRules.advanceEntity(ghost, ghost.direction, ghost.speed);
      }

      this.portalService.tryTeleport(ghost, this.world.collisionGrid, this.world.tick, this.world.tileSize);
      this.movementRules.syncEntityPosition(ghost);
    });
  }

  private returnToJail(ghost: GhostEntity, deltaMs: number): void {
    const elapsed = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
    ghost.eatenElapsedMs = Math.min(GHOST_EAT_DURATION_MS, (ghost.eatenElapsedMs ?? 0) + elapsed);
    if (ghost.eatenElapsedMs < GHOST_EAT_DURATION_MS) return;

    ghost.speed = ghost.baseSpeed * 2;
    const centered = ghost.moved.x === 0 && ghost.moved.y === 0;
    if (centered && ghost.tile.x === this.world.ghostJailReturnTile.x && ghost.tile.y === this.world.ghostJailReturnTile.y) {
      ghost.state.dead = false;
      ghost.state.soonFree = !ghost.isCopy;
      ghost.eatenElapsedMs = null;
      ghost.speed = ghost.baseSpeed;
      this.returningGhosts.delete(ghost);
      if (ghost.isCopy) {
        ghost.active = false;
        this.world.ghostAnimations.delete(ghost);
      }
      return;
    }

    if (centered || !this.returningGhosts.has(ghost)) {
      const direction = this.chooseReturnDirection(ghost);
      if (!direction) return;
      ghost.direction = direction;
      this.returningGhosts.add(ghost);
    }
    // The route contains physical corridor edges only; returning ghosts never use portals.
    this.movementRules.advanceEntity(ghost, ghost.direction, ghost.speed);
    this.movementRules.syncEntityPosition(ghost);
  }

  private chooseReturnDirection(ghost: GhostEntity): Direction | null {
    const target = this.world.ghostJailReturnTile;
    const anchorPath = this.returnNavigation.findPath(ghost.tile, target);
    if (ghost.moved.x === 0 && ghost.moved.y === 0) return anchorPath?.[0]?.direction ?? null;

    const offset = ghost.moved.x || ghost.moved.y;
    const outward: Direction = ghost.moved.x !== 0 ? (offset > 0 ? 'right' : 'left') : (offset > 0 ? 'down' : 'up');
    const next = this.returnNavigation.getSteps(ghost.tile).find((step) => step.direction === outward);
    const nextPath = next ? this.returnNavigation.findPath(next.destination, target) : null;
    const fraction = Math.abs(offset) / this.world.tileSize;
    const anchorCost = anchorPath ? fraction + anchorPath.length : Infinity;
    const nextCost = nextPath ? 1 - fraction + nextPath.length : Infinity;
    // An outward portal half-step has no physical next tile, so retreat to its center.
    return nextCost < anchorCost ? outward : OPPOSITE_DIRECTION[outward];
  }
}
