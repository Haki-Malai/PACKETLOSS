import {
  AnimationMixer,
  BufferGeometry,
  BufferGeometryLoader,
  Camera,
  DataTexture,
  Group,
  LinearFilter,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Texture,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { GhostKey } from '../../domain/entities/GhostEntity';
import { HologramPacket } from './HologramPacket';
import pointStarGeometry from './point-star.json';

type GhostAppearance = GhostKey | 'scared';
type CharacterModel = Pick<GLTF, 'scene' | 'animations'>;
export type CharacterModels = Record<'block' | 'virus', CharacterModel>;

interface Resources {
  geometries: Set<BufferGeometry>;
  materials: Set<Material>;
  textures: Set<Texture>;
}

interface CharacterInstance {
  mixer: AnimationMixer;
  colors: Array<{ material: MeshStandardMaterial; accent: boolean }>;
  appearance?: GhostAppearance;
}

const GHOST_COLORS: Record<GhostAppearance, number> = {
  inky: 0x45ddeb,
  clyde: 0xffa344,
  pinky: 0xff91bd,
  blinky: 0xfa4b60,
  scared: 0x465de5,
};

/** Shared, simulation-driven models. Every model's root sits on the maze ground. */
export class ArcadeAssets {
  readonly pelletGeometry = new BufferGeometryLoader().parse(pointStarGeometry);
  readonly pelletMaterial = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.9,
  });
  readonly powerPelletMaterial = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.9,
  });

  private readonly shadowGeometry = new PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  private readonly shadowTexture = createShadowTexture();
  private readonly shadowMaterial = new MeshBasicMaterial({
    map: this.shadowTexture,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    toneMapped: false,
  });
  private readonly resources: Resources = {
    geometries: new Set([this.pelletGeometry, this.shadowGeometry]),
    materials: new Set([this.pelletMaterial, this.powerPelletMaterial, this.shadowMaterial]),
    textures: new Set([this.shadowTexture]),
  };
  private readonly characters = new Map<Group, CharacterInstance>();
  private readonly packets = new Map<Group, HologramPacket>();
  private disposed = false;

  constructor(private readonly models: CharacterModels) {
    for (const model of Object.values(models)) collectResources(model.scene, this.resources);
  }

  static async load(signal?: AbortSignal): Promise<ArcadeAssets> {
    signal?.throwIfAborted();
    const loader = new GLTFLoader();
    const keys = ['block', 'virus'] as const;
    const results = await Promise.allSettled(keys.map(async (key) => {
      try {
        // The local inspector is a nested URL; resolve dev assets from Vite's root.
        const baseUrl = import.meta.env.DEV ? '/' : import.meta.env.BASE_URL;
        const url = `${baseUrl}assets/models/${key}.glb`;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const model = await loader.parseAsync(await response.arrayBuffer(), '');
        return { key, model };
      } catch (error) {
        signal?.throwIfAborted();
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Unable to load character model ${key}.glb: ${message}`);
      }
    }));
    const models = new Map<keyof CharacterModels, CharacterModel>();
    for (const result of results) {
      if (result.status === 'fulfilled') models.set(result.value.key, result.value.model);
    }
    const failed = results.find((result) => result.status === 'rejected');
    if (failed || signal?.aborted) {
      const resources: Resources = { geometries: new Set(), materials: new Set(), textures: new Set() };
      for (const model of models.values()) collectResources(model.scene, resources);
      disposeResources(resources);
      signal?.throwIfAborted();
      throw failed?.reason;
    }
    return new ArcadeAssets({ block: models.get('block')!, virus: models.get('virus')! });
  }

  createPacket(): Group {
    const packet = new HologramPacket();
    this.packets.set(packet.group, packet);
    return packet.group;
  }

  setPacketFrame(group: Group, frame: number): void {
    this.packets.get(group)?.setFrame(frame);
  }

  setPacketDeathProgress(group: Group, progress: number | null): void {
    this.packets.get(group)?.setDeathProgress(progress);
  }

  setPacketMotion(group: Group, x: number, y: number, amount: number): void {
    this.packets.get(group)?.setMotion(x, y, amount);
  }

  facePacket(group: Group, camera: Camera): void {
    this.packets.get(group)?.faceCamera(camera);
  }

  createGhost(key: GhostKey): Group {
    const group = this.createCharacter(key === 'blinky' || key === 'clyde' ? 'block' : 'virus');
    group.name = key;
    this.setGhostAppearance(group, key);
    return group;
  }

  setGhostAppearance(group: Group, key: GhostAppearance): void {
    const character = this.characters.get(group);
    if (!character || character.appearance === key) return;
    character.appearance = key;
    for (const { material, accent } of character.colors) {
      material.color.setHex(GHOST_COLORS[key]);
      if (accent) material.emissive.setHex(GHOST_COLORS[key]);
    }
  }

  sampleAnimation(timeSeconds: number): void {
    if (this.disposed) return;
    for (const packet of this.packets.values()) packet.sample(timeSeconds);
    for (const character of this.characters.values()) character.mixer.setTime(timeSeconds);
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
    for (const character of this.characters.values()) {
      character.mixer.stopAllAction();
      character.mixer.uncacheRoot(character.mixer.getRoot());
    }
    this.characters.clear();
    for (const packet of this.packets.values()) packet.dispose();
    this.packets.clear();
    disposeResources(this.resources);
  }

  private createCharacter(key: keyof CharacterModels): Group {
    const source = this.models[key];
    const scene = source.scene.clone(true);
    const root = new Group();
    const model = new Group();
    model.name = 'character-model';
    model.add(scene);
    root.add(model);
    const character: CharacterInstance = { mixer: new AnimationMixer(scene), colors: [] };
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const clones = materials.map((material) => {
        const clone = material.clone();
        this.resources.materials.add(clone);
        if (clone instanceof MeshStandardMaterial && /^(identity|accent)(?:[._-]|$)/i.test(clone.name)) {
          character.colors.push({ material: clone, accent: /^accent/i.test(clone.name) });
        }
        return clone;
      });
      mesh.material = Array.isArray(mesh.material) ? clones : clones[0];
    });
    for (const clip of source.animations) character.mixer.clipAction(clip).play();
    this.characters.set(root, character);
    return root;
  }
}

function collectResources(object: Object3D, resources: Resources): void {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    const mesh = child as Mesh<BufferGeometry, Material | Material[]>;
    resources.geometries.add(mesh.geometry);
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      resources.materials.add(material);
      for (const value of Object.values(material)) {
        if (value instanceof Texture) resources.textures.add(value as Texture);
      }
    }
  });
}

function disposeResources(resources: Resources): void {
  for (const geometry of resources.geometries) geometry.dispose();
  for (const material of resources.materials) material.dispose();
  for (const texture of resources.textures) texture.dispose();
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
