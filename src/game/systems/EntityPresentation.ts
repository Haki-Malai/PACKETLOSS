import { clamp, lerp } from '../../engine/math';
import { WorldState } from '../domain/world/WorldState';

type PresentedEntity = Pick<WorldState['pacman'], 'x' | 'y' | 'tile'>;

interface PreviousPosition {
  x: number;
  y: number;
  tile: PresentedEntity['tile'];
  output: { x: number; y: number };
}

export class EntityPresentation {
  private readonly previousPositions = new WeakMap<PresentedEntity, PreviousPosition>();

  constructor(private readonly world: WorldState) {}

  capturePreviousState(): void {
    this.capture(this.world.pacman);
    for (const ghost of this.world.ghosts) {
      this.capture(ghost);
    }
  }

  getPosition(entity: PresentedEntity, alpha: number): Readonly<{ x: number; y: number }> {
    const previous = this.previousPositions.get(entity);
    // Normal movement preserves the tile object; portals and position resets replace it.
    if (!previous || previous.tile !== entity.tile) {
      return entity;
    }

    const renderAlpha = clamp(alpha, 0, 1);
    previous.output.x = lerp(previous.x, entity.x, renderAlpha);
    previous.output.y = lerp(previous.y, entity.y, renderAlpha);
    return previous.output;
  }

  private capture(entity: PresentedEntity): void {
    const previous = this.previousPositions.get(entity);
    if (previous) {
      previous.x = entity.x;
      previous.y = entity.y;
      previous.tile = entity.tile;
      return;
    }

    this.previousPositions.set(entity, {
      x: entity.x,
      y: entity.y,
      tile: entity.tile,
      output: { x: entity.x, y: entity.y },
    });
  }
}
