import { BufferGeometry, Color, MathUtils, Matrix4, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { COLLECTIBLE_CONFIG } from '../../../config/constants';
import { STAR_ABSORPTION_DURATION_MS, type CollectibleKind, type EatEffect } from '../../shared/pickupEffects';

const ABSORPTION_COLOR = new Color(0x00d9ff);
const absorptionTarget = new Vector3();

export function setPointTransform(matrix: Matrix4, kind: CollectibleKind, x: number, y: number): void {
  const radius = COLLECTIBLE_CONFIG[kind === 'power' ? 1 : 0].size / 2;
  matrix.makeScale(radius, radius, radius);
  matrix.setPosition(x, radius + 0.12, y);
}

export function createEatEffectMesh(geometry: BufferGeometry, x: number, y: number): Mesh<BufferGeometry, MeshBasicMaterial> {
  // The intake remains visible while passing through the Packet's opaque body.
  const mesh = new Mesh(geometry, new MeshBasicMaterial({
    vertexColors: true, transparent: true, depthWrite: false, depthTest: false, toneMapped: false,
  }));
  mesh.name = 'pellet-effect';
  mesh.renderOrder = 2;
  mesh.position.set(x, 0, y);
  return mesh;
}

export function sampleEatEffect(mesh: Mesh<BufferGeometry, MeshBasicMaterial>, effect: EatEffect, target: Object3D): void {
  const progress = MathUtils.clamp(effect.elapsedMs / STAR_ABSORPTION_DURATION_MS, 0, 1);
  target.getWorldPosition(absorptionTarget);
  const pull = progress * progress;
  const radius = effect.sizeStart / 2;
  mesh.position.set(
    MathUtils.lerp(effect.x, absorptionTarget.x, pull),
    MathUtils.lerp(radius + 0.12, absorptionTarget.y, progress) + Math.sin(progress * Math.PI) * 1.2,
    MathUtils.lerp(effect.y, absorptionTarget.z, pull),
  );
  const diameter = MathUtils.lerp(effect.sizeStart, effect.sizeEnd, 1 - (1 - progress) ** 1.7);
  mesh.scale.setScalar(diameter / 2);
  mesh.rotation.set(0, progress * Math.PI * 0.75, Math.sin(progress * Math.PI) * 0.2);
  mesh.material.color.setHex(0xffffff).lerp(ABSORPTION_COLOR, progress);
  mesh.material.opacity = 1 - MathUtils.smoothstep(progress, 0.7, 1);
  mesh.visible = progress < 1;
}
