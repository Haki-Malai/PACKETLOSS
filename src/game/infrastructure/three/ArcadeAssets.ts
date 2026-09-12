import {
  BufferGeometry,
  DataTexture,
  Float32BufferAttribute,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
} from 'three';
import { SPRITE_SIZE } from '../../../config/constants';
import type { GhostKey } from '../../domain/entities/GhostEntity';
import type { Direction } from '../../domain/valueObjects/Direction';

type GhostAppearance = GhostKey | 'scared';
type BodyMesh = Mesh<BufferGeometry, MeshStandardMaterial>;

const GHOST_COLORS: Record<GhostAppearance, number> = {
  inky: 0x45ddeb,
  clyde: 0xffa344,
  pinky: 0xff91bd,
  blinky: 0xfa4b60,
  scared: 0x465de5,
};

/** Shared, simulation-driven models. Every model's root sits on the maze ground. */
export class ArcadeAssets {
  readonly pelletGeometry = new SphereGeometry(1, 12, 8);
  readonly pelletMaterial = new MeshStandardMaterial({
    color: 0xd6c6a6,
    roughness: 0.9,
  });
  readonly powerPelletMaterial = new MeshStandardMaterial({
    color: 0xe2d7bd,
    roughness: 0.9,
  });

  private readonly packetGeometries = [0, Math.PI / 12, Math.PI / 6, Math.PI / 4].map(
    createPacketGeometry,
  );
  private readonly packetMaterial = new MeshStandardMaterial({
    color: 0xffd729,
    emissive: 0xffd729,
    emissiveIntensity: 0.25,
    roughness: 0.3,
    metalness: 0.04,
  });
  private readonly ghostGeometries = [createGhostGeometry(0), createGhostGeometry(Math.PI)];
  private readonly ghostMaterials = Object.fromEntries(
    Object.entries(GHOST_COLORS).map(([key, color]) => [
      key,
      new MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2, roughness: 0.38, metalness: 0.02 }),
    ]),
  ) as Record<GhostAppearance, MeshStandardMaterial>;
  private readonly eyeGeometry = new SphereGeometry(1, 16, 12);
  private readonly eyeMaterial = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  private readonly pupilMaterial = new MeshStandardMaterial({ color: 0x102341, roughness: 0.3 });
  private readonly scaredPupilMaterial = new MeshStandardMaterial({ color: 0xffd8b6, roughness: 0.4 });
  private readonly shadowGeometry = new PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  private readonly shadowTexture = createShadowTexture();
  private readonly shadowMaterial = new MeshBasicMaterial({
    map: this.shadowTexture,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    toneMapped: false,
  });
  private readonly packetBodies = new WeakMap<Group, BodyMesh>();
  private readonly ghostParts = new WeakMap<Group, { body: BodyMesh; pupils: BodyMesh[] }>();
  private disposed = false;

  createPacket(): Group {
    const group = new Group();
    group.name = 'packet';
    const body = new Mesh(this.packetGeometries[0], this.packetMaterial);
    body.name = 'body';
    body.position.y = SPRITE_SIZE.packet / 2;
    group.add(body);
    this.packetBodies.set(group, body);

    for (const side of [-1, 1]) {
      const eye = new Mesh(this.eyeGeometry, this.pupilMaterial);
      eye.name = `eye-${side}`;
      eye.scale.set(0.4, 0.18, 0.55);
      eye.position.set(0.8, 9.7, side * 1.6);
      group.add(eye);
    }
    return group;
  }

  setPacketFrame(group: Group, frame: number): void {
    const body = this.packetBodies.get(group);
    if (body) body.geometry = this.packetGeometries[Math.max(0, Math.min(3, Math.trunc(frame)))];
  }

  createGhost(key: GhostKey): Group {
    const group = new Group();
    group.name = key;
    const body = new Mesh(this.ghostGeometries[0], this.ghostMaterials[key]);
    body.name = 'body';
    group.add(body);

    const pupils: BodyMesh[] = [];
    for (const side of [-1, 1]) {
      // Faces look upward and south so both eyes remain legible from the fixed camera.
      const eye = new Group();
      eye.name = `eye-${side}`;
      eye.position.set(side * 1.8, 7.85, 3.4);
      eye.rotation.x = -Math.PI / 4;
      const white = new Mesh(this.eyeGeometry, this.eyeMaterial);
      white.scale.set(1.3, 1.45, 0.8);
      const pupil = new Mesh(this.eyeGeometry, this.pupilMaterial);
      pupil.name = `pupil-${side}`;
      pupil.scale.set(0.56, 0.65, 0.25);
      pupil.position.z = 0.76;
      eye.add(white, pupil);
      group.add(eye);
      pupils.push(pupil);
    }
    this.ghostParts.set(group, { body, pupils });
    this.setGhostAppearance(group, key, 0, 'right');
    return group;
  }

  setGhostAppearance(group: Group, key: GhostAppearance, frame: number, direction: Direction): void {
    const parts = this.ghostParts.get(group);
    if (!parts) return;
    parts.body.geometry = this.ghostGeometries[Math.trunc(frame) % 2];
    parts.body.material = this.ghostMaterials[key];
    for (const pupil of parts.pupils) {
      pupil.material = key === 'scared' ? this.scaredPupilMaterial : this.pupilMaterial;
      pupil.position.x = direction === 'left' ? -0.3 : direction === 'right' ? 0.3 : 0;
      pupil.position.y = direction === 'up' ? 0.3 : direction === 'down' ? -0.3 : 0;
    }
  }

  createContactShadow(diameter: number): Mesh<PlaneGeometry, MeshBasicMaterial> {
    const shadow = new Mesh(this.shadowGeometry, this.shadowMaterial);
    shadow.name = 'contact-shadow';
    shadow.scale.set(diameter, 1, diameter);
    shadow.position.y = 0.035;
    return shadow;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const geometry of [
      this.pelletGeometry,
      ...this.packetGeometries,
      ...this.ghostGeometries,
      this.eyeGeometry,
      this.shadowGeometry,
    ]) geometry.dispose();
    for (const material of [
      this.pelletMaterial,
      this.powerPelletMaterial,
      this.packetMaterial,
      ...Object.values(this.ghostMaterials),
      this.eyeMaterial,
      this.pupilMaterial,
      this.scaredPupilMaterial,
      this.shadowMaterial,
    ]) material.dispose();
    this.shadowTexture.dispose();
  }
}

function createPacketGeometry(halfAngle: number): BufferGeometry {
  const radius = SPRITE_SIZE.packet / 2;
  const sphere = new SphereGeometry(radius, 40, 24, Math.PI + halfAngle, 2 * Math.PI - 2 * halfAngle);
  if (halfAngle === 0) return sphere;
  const geometry = sphere.toNonIndexed();
  sphere.dispose();
  const positions = Array.from(geometry.getAttribute('position').array);
  const normals = Array.from(geometry.getAttribute('normal').array);
  for (const side of [-1, 1]) {
    const normal = [Math.sin(halfAngle), 0, -side * Math.cos(halfAngle)];
    for (let segment = 0; segment < 24; segment += 1) {
      const arcPoint = (index: number): number[] => {
        const theta = (index / 24) * Math.PI;
        return [
          radius * Math.sin(theta) * Math.cos(halfAngle),
          radius * Math.cos(theta),
          side * radius * Math.sin(theta) * Math.sin(halfAngle),
        ];
      };
      const first = arcPoint(segment);
      const second = arcPoint(segment + 1);
      positions.push(0, 0, 0, ...(side === 1 ? first : second), ...(side === 1 ? second : first));
      normals.push(...normal, ...normal, ...normal);
    }
  }
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.deleteAttribute('uv');
  return geometry;
}

function createGhostGeometry(phase: number): BufferGeometry {
  const radius = SPRITE_SIZE.ghost / 2;
  const segments = 48;
  const positions: number[] = [];
  const indices: number[] = [];
  const rings = 12;
  for (let ring = 0; ring < rings; ring += 1) {
    const theta = (Math.max(0, ring - 1) / (rings - 2)) * (Math.PI / 2);
    const ringRadius = radius * Math.cos(theta);
    for (let segment = 0; segment <= segments; segment += 1) {
      const angle = (segment / segments) * 2 * Math.PI;
      const height = ring === 0 ? 0.45 + 0.45 * Math.cos(8 * angle + phase) : 4.3 + radius * Math.sin(theta);
      positions.push(ringRadius * Math.cos(angle), height, ringRadius * Math.sin(angle));
      if (ring < rings - 1 && segment < segments) {
        const a = ring * (segments + 1) + segment;
        const b = a + 1;
        const c = a + segments + 1;
        indices.push(a, c, b, b, c, c + 1);
      }
    }
  }
  const center = positions.length / 3;
  positions.push(0, 0.45, 0);
  for (let segment = 0; segment < segments; segment += 1) indices.push(center, segment, segment + 1);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createShadowTexture(): DataTexture {
  const size = 32;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const radiusSquared = ((x + 0.5 - size / 2) / (size / 2)) ** 2 + ((y + 0.5 - size / 2) / (size / 2)) ** 2;
      pixels[(y * size + x) * 4 + 3] = Math.round(255 * Math.exp(-3 * radiusSquared) * Math.max(0, 1 - radiusSquared));
    }
  }
  const texture = new DataTexture(pixels, size, size);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
