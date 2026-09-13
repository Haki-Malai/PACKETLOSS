import { Matrix4, Mesh, MeshBasicMaterial, RingGeometry } from 'three';
import { COLLECTIBLE_CONFIG } from '../../../config/constants';
import type { CollectibleKind, EatEffect } from '../../shared/pickupEffects';

export function setPointTransform(matrix: Matrix4, kind: CollectibleKind, x: number, y: number): void {
  const radius = COLLECTIBLE_CONFIG[kind === 'power' ? 1 : 0].size / 2;
  matrix.makeScale(radius, radius, radius);
  matrix.setPosition(x, radius + 0.12, y);
}

export function createEatEffectGeometry(): RingGeometry {
  return new RingGeometry(0.7, 1, 24);
}

export function createEatEffectMesh(geometry: RingGeometry, x: number, y: number): Mesh<RingGeometry, MeshBasicMaterial> {
  const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: '#c8ba9c', transparent: true, depthWrite: false }));
  mesh.name = 'pellet-effect';
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.08, y);
  return mesh;
}

export function sampleEatEffect(mesh: Mesh<RingGeometry, MeshBasicMaterial>, effect: EatEffect): void {
  const progress = Math.min(1, effect.elapsedMs / effect.durationMs);
  const opacity = (1 - progress) * (1 - progress);
  const diameter = effect.sizeStart + (effect.sizeEnd - effect.sizeStart) * (1 - opacity);
  mesh.scale.setScalar(diameter / 2);
  mesh.material.opacity = opacity;
}
