import { BoxGeometry, Group, MathUtils, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three';

/** A defeated shell sheds pixels into the Packet while its little return form emerges. */
export class GhostEatPresentation {
  readonly group = new Group();
  private readonly geometry = new BoxGeometry(0.65, 0.65, 0.65);
  private readonly material = new MeshBasicMaterial({
    color: 0xc5f8ff, transparent: true, depthWrite: false, depthTest: false, toneMapped: false,
  });
  private readonly sourcePosition = new Vector3();
  private readonly targetPosition = new Vector3();

  constructor() {
    this.group.name = 'ghost-eat-pixels';
    for (let i = 0; i < 7; i += 1) {
      const pixel = new Mesh(this.geometry, this.material);
      pixel.renderOrder = 3;
      this.group.add(pixel);
    }
  }

  sample(source: Object3D, target: Object3D, progress: number): void {
    const elapsed = MathUtils.clamp(progress, 0, 1);
    this.group.visible = elapsed > 0 && elapsed < 1;
    source.getWorldPosition(this.sourcePosition);
    this.sourcePosition.y += 5;
    target.getWorldPosition(this.targetPosition);
    this.material.color.setRGB(0.56 + elapsed * 0.44, 0.9, 1 - elapsed * 0.65);
    this.material.opacity = 1 - MathUtils.smoothstep(elapsed, 0.8, 1);
    this.group.children.forEach((pixel, i) => {
      const phase = MathUtils.clamp((elapsed - i * 0.045) / 0.65, 0, 1);
      const angle = i * Math.PI * 2 / this.group.children.length + phase * Math.PI;
      const spread = (1 - phase) * 2.5;
      pixel.position.lerpVectors(this.sourcePosition, this.targetPosition, phase * phase);
      pixel.position.x += Math.cos(angle) * spread;
      pixel.position.z += Math.sin(angle) * spread;
      pixel.position.y += Math.sin(phase * Math.PI) * 2;
      pixel.rotation.set(phase * 5 + i, phase * 4, 0);
      pixel.scale.setScalar(1 - phase * 0.85);
      pixel.visible = phase > 0 && phase < 1;
    });
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.group.clear();
  }
}
