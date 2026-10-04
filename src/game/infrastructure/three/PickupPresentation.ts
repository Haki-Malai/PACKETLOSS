import {
  BufferGeometry, BufferGeometryLoader, Color, Euler, MathUtils, Matrix4, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, Object3D, Quaternion, Vector3,
} from 'three';
import { COLLECTIBLE_CONFIG } from '../../../config/constants';
import { STAR_ABSORPTION_DURATION_MS, type CollectibleKind, type EatEffect } from '../../shared/pickupEffects';
import pointStarGeometry from './point-star.json';
import powerStarGeometry from './power-star.json';

const POINT_COLORS: Record<CollectibleKind, number> = { base: 0x00d9ff, power: 0xffe24d };
const ABSORPTION_COLOR = new Color(POINT_COLORS.base);
const absorptionTarget = new Vector3();
const absorptionSource = new Matrix4();
const pointPosition = new Vector3();
const pointScale = new Vector3();
const pointRotation = new Euler();
const pointQuaternion = new Quaternion();
const powerSpinAxis = new Vector3(0, 0, -1);
const powerSpin = new Quaternion();

/** Creates the shared star shape for any mode; the caller owns and disposes its geometry. */
export function createPointGeometry(kind: CollectibleKind): BufferGeometry {
  return new BufferGeometryLoader().parse(kind === 'power' ? powerStarGeometry : pointStarGeometry);
}

/** Creates a caller-owned material with the online palette and the star's authored facet shading. */
export function createPointMaterial(kind: CollectibleKind): MeshStandardMaterial {
  const power = kind === 'power';
  return new MeshStandardMaterial({
    color: POINT_COLORS[kind],
    emissive: power ? 0x8a6300 : 0x006a80,
    vertexColors: true,
    roughness: power ? 0.45 : 0.9,
    metalness: power ? 0.2 : 0,
  });
}

/** Samples the shared six-second pickup turn with the gameplay camera's tilt and lean. */
export function samplePickupRotation(rotation: Quaternion, x: number, y: number, timeSeconds: number,
  phaseY = y): void {
  const phase = (x * 0.071 + phaseY * 0.053) % (Math.PI * 2);
  // Match Camera3D's 20-degree tilt and 5-degree side lean before the local vertical spin.
  pointRotation.set(Math.PI / 9, 0, -Math.PI / 36, 'ZXY');
  rotation.setFromEuler(pointRotation);
  rotation.multiply(powerSpin.setFromAxisAngle(powerSpinAxis, timeSeconds * Math.PI / 3 + phase));
}

/** Samples pickup placement and a horizontal power-star turn that brings its left tip toward the viewer. */
export function setPointTransform(matrix: Matrix4, kind: CollectibleKind, x: number, y: number,
  timeSeconds = 0, phaseY = y): void {
  const radius = COLLECTIBLE_CONFIG[kind === 'power' ? 1 : 0].size / 2;
  if (kind === 'power') {
    const phase = (x * 0.071 + phaseY * 0.053) % (Math.PI * 2);
    samplePickupRotation(pointQuaternion, x, y, timeSeconds, phaseY);
    pointPosition.set(x, radius + 0.7 + Math.sin(timeSeconds * Math.PI * 2 / 3 + phase) * 0.35, y);
    pointScale.setScalar(radius);
    matrix.compose(pointPosition, pointQuaternion, pointScale);
    return;
  }
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

/** Samples absorption from the pickup's original pose, adding a local intake turn and shrink. */
export function sampleEatEffect(
  mesh: Mesh<BufferGeometry, MeshBasicMaterial>, effect: EatEffect, target: Object3D,
  startedAtSeconds = 0, phaseY = effect.y,
): void {
  const progress = MathUtils.clamp(effect.elapsedMs / STAR_ABSORPTION_DURATION_MS, 0, 1);
  target.getWorldPosition(absorptionTarget);
  const pull = progress * progress;
  // Continue from the collected star's hover and orientation without snapping back to a flat pose.
  setPointTransform(absorptionSource, effect.kind, effect.x, effect.y, startedAtSeconds, phaseY);
  absorptionSource.decompose(mesh.position, mesh.quaternion, mesh.scale);
  mesh.position.set(
    MathUtils.lerp(effect.x, absorptionTarget.x, pull),
    MathUtils.lerp(mesh.position.y, absorptionTarget.y, progress) + Math.sin(progress * Math.PI) * 1.2,
    MathUtils.lerp(effect.y, absorptionTarget.z, pull),
  );
  const diameter = MathUtils.lerp(effect.sizeStart, effect.sizeEnd, 1 - (1 - progress) ** 1.7);
  mesh.scale.setScalar(diameter / 2);
  pointRotation.set(0, progress * Math.PI * 0.75, Math.sin(progress * Math.PI) * 0.2, 'XYZ');
  mesh.quaternion.multiply(pointQuaternion.setFromEuler(pointRotation));
  mesh.material.color.setHex(POINT_COLORS[effect.kind]).lerp(ABSORPTION_COLOR, progress);
  mesh.material.opacity = 1 - MathUtils.smoothstep(progress, 0.7, 1);
  mesh.visible = progress < 1;
}
