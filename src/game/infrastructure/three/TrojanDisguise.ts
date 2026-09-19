import { Group, MathUtils, Mesh, Object3D } from 'three';
import { ENEMY_CONFIG } from '../../../config/constants';
import { ArcadeAssets } from './ArcadeAssets';
import { setPointTransform } from './PickupPresentation';

/** Reuses the real data-bit geometry for a disguise without adding a collectible. */
export class TrojanDisguise {
  private readonly horse: Object3D;
  private readonly shadow: Object3D | undefined;
  private readonly point: Mesh;

  /** Attaches one disguise mesh whose geometry and material remain owned by ArcadeAssets. */
  constructor(model: Group, assets: ArcadeAssets) {
    this.horse = model.getObjectByName('character-model')!;
    this.shadow = model.getObjectByName('contact-shadow');
    this.point = new Mesh(assets.pelletGeometry, assets.pelletMaterial);
    this.point.name = 'trojan-disguise';
    this.point.visible = false;
    model.add(this.point);
  }

  /** Changes a horse into a point at its location, then reverses that form during the reveal. */
  sync(disguised: boolean, revealRemainingMs: number, disguiseRemainingMs = 0): void {
    const entry = MathUtils.smoothstep(ENEMY_CONFIG.trojan.disguiseDurationMs - disguiseRemainingMs, 0, 350);
    const progress = disguised ? 0 : 1 - revealRemainingMs / ENEMY_CONFIG.trojan.revealGraceMs;
    const horseAmount = disguised ? 1 - entry : MathUtils.smoothstep(progress, 0, 0.45);
    const pointAmount = disguised ? entry : 1 - MathUtils.smoothstep(progress, 0, 0.3);
    this.horse.visible = horseAmount > 0;
    this.horse.scale.setScalar(Math.max(0.001, horseAmount));
    if (this.shadow) this.shadow.visible = horseAmount > 0;
    this.point.visible = pointAmount > 0;
    if (this.point.visible) {
      setPointTransform(this.point.matrix, 'base', 0, 0);
      this.point.matrix.decompose(this.point.position, this.point.quaternion, this.point.scale);
      this.point.scale.multiplyScalar(pointAmount);
      this.point.position.y += (1 - pointAmount) * 3;
    }
  }
}
