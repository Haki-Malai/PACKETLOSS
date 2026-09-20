import { clamp, lerp } from '../../engine/math';
import { WorldState } from '../domain/world/WorldState';

type PresentedEntity = Pick<WorldState['packet'], 'x' | 'y' | 'tile'>;

interface PreviousPosition {
  x: number;
  y: number;
  tile: PresentedEntity['tile'];
  output: { x: number; y: number };
  elapsedMs: number;
  discontinuous: boolean;
  samples: Array<{ x: number; y: number; elapsedMs: number }>;
}

export class EntityPresentation {
  private readonly previousPositions = new WeakMap<PresentedEntity, PreviousPosition>();

  constructor(private readonly world: WorldState) {}

  capturePreviousState(): void {
    this.capture(this.world.packet);
    for (const enemy of this.world.enemies) {
      this.capture(enemy);
    }
  }

  /** Records an intermediate simulation position for corridor-following interpolation. */
  recordCurrentState(deltaMs: number): void {
    const elapsed = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
    this.record(this.world.packet, elapsed);
    for (const enemy of this.world.enemies) this.record(enemy, elapsed);
  }

  /** Interpolates through recorded corridor samples, snapping across teleports and resets. */
  getPosition(entity: PresentedEntity, alpha: number): Readonly<{ x: number; y: number }> {
    const previous = this.previousPositions.get(entity);
    // Normal movement preserves the tile object; portals and position resets replace it.
    if (!previous || previous.tile !== entity.tile || previous.discontinuous) {
      return entity;
    }

    const renderAlpha = clamp(alpha, 0, 1);
    const samples = previous.samples;
    const last = samples[samples.length - 1];
    const hasUnrecordedPosition = last.x !== entity.x || last.y !== entity.y;
    const totalMs = previous.elapsedMs || 1;
    const targetMs = totalMs * renderAlpha;
    let from = samples[0];
    let to = samples[1] ?? (hasUnrecordedPosition ? { x: entity.x, y: entity.y, elapsedMs: totalMs } : from);
    for (let i = 1; i < samples.length; i += 1) {
      to = samples[i];
      if (targetMs <= to.elapsedMs) break;
      from = to;
    }
    if (targetMs > to.elapsedMs && hasUnrecordedPosition) {
      from = to;
      to = { x: entity.x, y: entity.y, elapsedMs: totalMs };
    }
    const duration = to.elapsedMs - from.elapsedMs;
    const segmentAlpha = duration > 0 ? clamp((targetMs - from.elapsedMs) / duration, 0, 1) : renderAlpha;
    previous.output.x = lerp(from.x, to.x, segmentAlpha);
    previous.output.y = lerp(from.y, to.y, segmentAlpha);
    return previous.output;
  }

  /** Translates buffered interpolation samples when a rolling maze recenters. */
  translateY(pixels: number): void {
    for (const entity of [this.world.packet, ...this.world.enemies]) {
      const previous = this.previousPositions.get(entity);
      if (!previous) continue;
      previous.y += pixels;
      previous.output.y += pixels;
      previous.samples.forEach((sample) => { sample.y += pixels; });
    }
  }

  private capture(entity: PresentedEntity): void {
    const previous = this.previousPositions.get(entity);
    if (previous) {
      previous.x = entity.x;
      previous.y = entity.y;
      previous.tile = entity.tile;
      previous.elapsedMs = 0;
      previous.discontinuous = false;
      previous.samples = [{ x: entity.x, y: entity.y, elapsedMs: 0 }];
      return;
    }

    this.previousPositions.set(entity, {
      x: entity.x,
      y: entity.y,
      tile: entity.tile,
      output: { x: entity.x, y: entity.y },
      elapsedMs: 0,
      discontinuous: false,
      samples: [{ x: entity.x, y: entity.y, elapsedMs: 0 }],
    });
  }

  /** Adds one entity sample and marks teleport or reset discontinuities. */
  private record(entity: PresentedEntity, elapsedMs: number): void {
    const previous = this.previousPositions.get(entity);
    if (!previous) {
      this.capture(entity);
      return;
    }
    previous.elapsedMs += elapsedMs;
    if (previous.tile !== entity.tile) {
      previous.discontinuous = true;
      return;
    }
    previous.samples.push({ x: entity.x, y: entity.y, elapsedMs: previous.elapsedMs });
  }
}
