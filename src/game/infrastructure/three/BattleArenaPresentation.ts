import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
} from 'three';
import { TILE_SIZE } from '../../../config/constants';
import { WALL_HEIGHT } from './MazeGeometry';
import { RACE } from '../../simulation/types';

interface BoundaryLayer {
  readonly group: Group;
  readonly material: MeshBasicMaterial;
}

/** Samples one deterministic 0.5–2.5 Hz pulse ramp within the current warning cycle. */
export function battleArenaWarningPulse(playTicks: number, stage: number): number {
  const cycleTicks = Math.max(0, Math.min(
    RACE.shrinkEveryTicks,
    playTicks - stage * RACE.shrinkEveryTicks,
  ));
  const elapsedSeconds = cycleTicks / 60;
  const cycleSeconds = RACE.shrinkEveryTicks / 60;
  const phase = Math.PI * 2 * (0.5 * elapsedSeconds + elapsedSeconds ** 2 / cycleSeconds);
  return 0.55 + 0.45 * (0.5 - 0.5 * Math.cos(phase));
}

/** Presents the authoritative warning and one-second transition around a shrinking square arena. */
export class BattleArenaPresentation {
  readonly group = new Group();

  private readonly geometry = new BoxGeometry(1, 1, 1);
  private readonly warning = this.createLayer('#f4b63f');
  private readonly retiring = this.createLayer('#ff402d', false, false);
  private readonly forming = this.createLayer('#ff7552', false, false);
  private readonly retiredFloor = this.createLayer('#24101f', false, false, 4);
  private readonly settledWallColor = new Color('#1e0d20');
  private stage = -1;

  constructor() {
    this.group.name = 'battle-arena-transition';
    this.group.add(
      this.warning.group,
      this.retiring.group,
      this.forming.group,
      this.retiredFloor.group,
    );
  }

  /** Reconstructs warning cadence and closure progress entirely from authoritative ticks. */
  sync(stage: number, playTicks: number, reducedMotion: boolean): void {
    const boundedStage = Math.max(0, Math.min(RACE.maxShrinkStage, stage));
    if (boundedStage !== this.stage) {
      this.stage = boundedStage;
      this.placeLayer(this.warning, boundedStage + 1);
      this.placeLayer(this.retiring, Math.max(0, boundedStage - 1), TILE_SIZE);
      this.placeLayer(this.forming, boundedStage, TILE_SIZE);
      this.placeFloorLayer(this.retiredFloor, Math.max(0, boundedStage - 1));
    }

    const cycleTick = Math.max(0, playTicks - boundedStage * RACE.shrinkEveryTicks);
    const warningProgress = Math.min(1, cycleTick / RACE.shrinkEveryTicks);
    const pulse = reducedMotion ? 1 : battleArenaWarningPulse(playTicks, boundedStage);
    this.warning.group.visible = boundedStage < RACE.maxShrinkStage;
    this.warning.material.opacity = 0.24 + pulse * 0.58;
    this.warning.material.color.setHSL((38 - warningProgress * 34) / 360, 0.92, 0.62);

    const transitionProgress = Math.min(1, cycleTick / RACE.shrinkTransitionTicks);
    const transitionActive = boundedStage > 0 && transitionProgress < 1 && !reducedMotion;
    this.retiring.group.visible = transitionActive;
    this.forming.group.visible = true;
    this.retiredFloor.group.visible = transitionActive;
    if (transitionActive) {
      this.retiring.group.position.y = -WALL_HEIGHT * transitionProgress;
      this.retiring.material.opacity = 0.8 * (1 - transitionProgress);
      this.retiredFloor.group.position.y = -TILE_SIZE * transitionProgress;
      this.retiredFloor.material.opacity = 0.72 * (1 - transitionProgress);
      this.forming.group.scale.y = Math.max(0.02, transitionProgress);
      this.forming.material.opacity = 0.55 + transitionProgress * 0.45;
      this.forming.material.color.set('#ff7552').lerp(this.settledWallColor, transitionProgress);
    } else {
      this.retiring.group.position.y = 0;
      this.retiredFloor.group.position.y = 0;
      this.forming.group.scale.y = 1;
      this.forming.material.opacity = 1;
      this.forming.material.color.copy(this.settledWallColor);
    }
  }

  /** Releases all meshes and materials owned by the arena transition. */
  dispose(): void {
    this.geometry.dispose();
    this.warning.material.dispose();
    this.retiring.material.dispose();
    this.forming.material.dispose();
    this.retiredFloor.material.dispose();
    this.group.clear();
  }

  private createLayer(
    color: string,
    wireframe = true,
    additive = true,
    segments = 8,
  ): BoundaryLayer {
    const material = new MeshBasicMaterial({
      color: new Color(color),
      blending: additive ? AdditiveBlending : NormalBlending,
      depthWrite: false,
      transparent: true,
      wireframe,
    });
    const group = new Group();
    for (let index = 0; index < segments; index += 1) group.add(new Mesh(this.geometry, material));
    return { group, material };
  }

  /** Places boundary rails with one-tile gaps for the horizontal and vertical portals. */
  private placeLayer(
    layer: BoundaryLayer,
    ring: number,
    thickness = 2.5,
    height = WALL_HEIGHT,
  ): void {
    const boundedRing = Math.max(0, Math.min(RACE.maxShrinkStage, ring));
    const minimum = boundedRing;
    const maximum = 48 - boundedRing;
    const rails = layer.group.children as Array<Mesh<BoxGeometry, MeshBasicMaterial>>;
    this.placeSegment(rails[0], true, minimum, 23, minimum, thickness, height);
    this.placeSegment(rails[1], true, 25, maximum, minimum, thickness, height);
    this.placeSegment(rails[2], true, minimum, 23, maximum, thickness, height);
    this.placeSegment(rails[3], true, 25, maximum, maximum, thickness, height);
    this.placeSegment(rails[4], false, minimum, 24, minimum, thickness, height);
    this.placeSegment(rails[5], false, 26, maximum, minimum, thickness, height);
    this.placeSegment(rails[6], false, minimum, 24, maximum, thickness, height);
    this.placeSegment(rails[7], false, 26, maximum, maximum, thickness, height);
  }

  /** Covers the complete retiring ring, including the two portal openings. */
  private placeFloorLayer(layer: BoundaryLayer, ring: number): void {
    const boundedRing = Math.max(0, Math.min(RACE.maxShrinkStage, ring));
    const minimum = (boundedRing + 0.5) * TILE_SIZE;
    const maximum = (48 - boundedRing + 0.5) * TILE_SIZE;
    const center = (minimum + maximum) / 2;
    const span = maximum - minimum + TILE_SIZE;
    const rails = layer.group.children as Array<Mesh<BoxGeometry, MeshBasicMaterial>>;
    rails[0].position.set(center, 0.1, minimum);
    rails[0].scale.set(span, 0.2, TILE_SIZE);
    rails[1].position.set(center, 0.1, maximum);
    rails[1].scale.set(span, 0.2, TILE_SIZE);
    rails[2].position.set(minimum, 0.1, center);
    rails[2].scale.set(TILE_SIZE, 0.2, span);
    rails[3].position.set(maximum, 0.1, center);
    rails[3].scale.set(TILE_SIZE, 0.2, span);
  }

  /** Positions one inclusive run of perimeter cells as a single owned mesh. */
  private placeSegment(
    mesh: Mesh<BoxGeometry, MeshBasicMaterial>,
    horizontal: boolean,
    start: number,
    end: number,
    fixed: number,
    thickness: number,
    height: number,
  ): void {
    const center = ((start + end) / 2 + 0.5) * TILE_SIZE;
    const fixedCenter = (fixed + 0.5) * TILE_SIZE;
    const span = (end - start + 1) * TILE_SIZE;
    mesh.position.set(horizontal ? center : fixedCenter, height / 2, horizontal ? fixedCenter : center);
    mesh.scale.set(horizontal ? span : thickness, height, horizontal ? thickness : span);
  }
}
