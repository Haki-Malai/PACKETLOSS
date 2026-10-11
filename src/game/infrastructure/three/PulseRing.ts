import { RingGeometry, type ColorRepresentation, type Mesh, type MeshBasicMaterial } from 'three';

/** Creates an owned ground-plane ring; the default inner radius preserves Ping's original width. */
export function createPulseRingGeometry(innerRadius = 0.985): RingGeometry {
  return new RingGeometry(innerRadius, 1, 64).rotateX(-Math.PI / 2);
}

/** Samples Ping's expansion and fade; an explicit local radius lets attack pulses follow gameplay growth. */
export function samplePulseRing(
  ring: Mesh<RingGeometry, MeshBasicMaterial>,
  progress: number,
  maximumRadius: number,
  color: ColorRepresentation,
  radius = maximumRadius * (0.04 + progress * 0.96),
): void {
  ring.scale.set(radius, 1, radius);
  ring.material.color.set(color);
  ring.material.opacity = (1 - progress) * 0.8;
}
