import {
  AnimationMixer,
  BufferGeometry,
  BufferGeometryLoader,
  Camera,
  Color,
  DataTexture,
  Group,
  LinearFilter,
  Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Texture,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { ENEMY_KEYS, type EnemyKey } from '../../domain/entities/EnemyEntity';
import { SCORE_BONUS_TIERS, type ScoreBonusKind } from '../../domain/valueObjects/ScoreBonus';
import { HologramPacket } from './HologramPacket';
import { ReturnEnemyPresentation } from './ReturnEnemyPresentation';
import { StateTransition } from './StateTransition';
import pointStarGeometry from './point-star.json';
import powerStarGeometry from './power-star.json';

type EnemyAppearance = EnemyKey | 'scared';
type CharacterModel = Pick<GLTF, 'scene' | 'animations'>;
export type CharacterModels = Record<EnemyKey, CharacterModel>;
export type ScoreBonusModels = Record<ScoreBonusKind, CharacterModel>;

interface Resources {
  geometries: Set<BufferGeometry>;
  materials: Set<Material>;
  textures: Set<Texture>;
}

interface CharacterInstance {
  mixer: AnimationMixer;
  collapse: Group;
  returning: ReturnEnemyPresentation;
  returnProgress: number | null;
  colors: Array<{ material: MeshStandardMaterial; accent: boolean }>;
  expressions: Array<{ influences: number[]; index: number }>;
  scared: boolean;
  scaredTint: boolean;
  fearAmount?: number;
  baseColor: Color;
  fear: StateTransition;
  restoration: StateTransition;
}

const ENEMY_COLORS: Record<EnemyAppearance, number> = {
  firewall: 0xff4d45,
  virus: 0xff9c2f,
  ping: 0x68ff72,
  spam: 0xb87cff,
  lag: 0xffe24d,
  quarantine: 0xb846ff,
  trojan: 0xff3849,
  scared: 0x999999,
};
const SCARED_COLOR = new Color(ENEMY_COLORS.scared);

/** Shared, simulation-driven models. Every model's root sits on the maze ground. */
export class ArcadeAssets {
  readonly pelletGeometry = new BufferGeometryLoader().parse(pointStarGeometry);
  readonly powerPelletGeometry = new BufferGeometryLoader().parse(powerStarGeometry);
  readonly pelletMaterial = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.9,
  });
  readonly powerPelletMaterial = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.45,
    metalness: 0.2,
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
    geometries: new Set([this.pelletGeometry, this.powerPelletGeometry, this.shadowGeometry]),
    materials: new Set([this.pelletMaterial, this.powerPelletMaterial, this.shadowMaterial]),
    textures: new Set([this.shadowTexture]),
  };
  private readonly characters = new Map<Group, CharacterInstance>();
  private readonly packets = new Map<Group, HologramPacket>();
  private disposed = false;

  constructor(private readonly models: CharacterModels, private readonly bonusModels?: ScoreBonusModels) {
    for (const model of Object.values(models)) collectResources(model.scene, this.resources);
    if (bonusModels) for (const model of Object.values(bonusModels)) collectResources(model.scene, this.resources);
  }

  /** Loads every roster model and disposes completed loads if a sibling fails or loading is cancelled. */
  static async load(signal?: AbortSignal): Promise<ArcadeAssets> {
    signal?.throwIfAborted();
    const loader = new GLTFLoader();
    /** Fetches one self-contained local GLB with cancellation and a useful asset error. */
    const loadModel = async (folder: string, key: string) => {
      try {
        // The local inspector is a nested URL; resolve dev assets from Vite's root.
        const baseUrl = import.meta.env.DEV ? '/' : import.meta.env.BASE_URL;
        const url = `${baseUrl}assets/models/${folder}/${key}.glb`;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const model = await loader.parseAsync(await response.arrayBuffer(), '');
        return { key, model };
      } catch (error) {
        signal?.throwIfAborted();
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Unable to load model ${folder}/${key}.glb: ${message}`);
      }
    };
    const [results, bonusResults] = await Promise.all([
      Promise.allSettled(ENEMY_KEYS.map((key) => loadModel('enemies', key))),
      Promise.allSettled(SCORE_BONUS_TIERS.map(({ kind }) => loadModel('multipliers', kind))),
    ]);
    const models = new Map<keyof CharacterModels, CharacterModel>();
    for (const result of results) {
      if (result.status === 'fulfilled') models.set(result.value.key as EnemyKey, result.value.model);
    }
    const bonusModels = new Map<ScoreBonusKind, CharacterModel>();
    for (const result of bonusResults) {
      if (result.status === 'fulfilled') bonusModels.set(result.value.key as ScoreBonusKind, result.value.model);
    }
    const failed = [...results, ...bonusResults].find((result) => result.status === 'rejected');
    if (failed || signal?.aborted) {
      const resources: Resources = { geometries: new Set(), materials: new Set(), textures: new Set() };
      for (const model of [...models.values(), ...bonusModels.values()]) collectResources(model.scene, resources);
      disposeResources(resources);
      signal?.throwIfAborted();
      throw failed?.reason;
    }
    return new ArcadeAssets({
      firewall: models.get('firewall')!, virus: models.get('virus')!, ping: models.get('ping')!,
      spam: models.get('spam')!, lag: models.get('lag')!,
      quarantine: models.get('quarantine')!, trojan: models.get('trojan')!,
    }, {
      bug: bonusModels.get('bug')!, key: bonusModels.get('key')!, cloud: bonusModels.get('cloud')!,
      wifi: bonusModels.get('wifi')!, chip: bonusModels.get('chip')!,
    });
  }

  /** Clones one pickup while retaining geometry and materials in this asset owner's lifetime. */
  createScoreBonus(kind: ScoreBonusKind): Group | null {
    return this.bonusModels?.[kind].scene.clone(true) ?? null;
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

  setPacketPower(group: Group, powered: boolean, warning = false, amount?: number): void {
    this.packets.get(group)?.setPower(powered, warning, amount);
  }

  setPacketEnemyEatProgress(group: Group, progress: number | null): void {
    this.packets.get(group)?.setEnemyEatProgress(progress);
  }

  setPacketMotion(group: Group, x: number, y: number, amount: number): void {
    this.packets.get(group)?.setMotion(x, y, amount);
  }

  facePacket(group: Group, camera: Camera): void {
    this.packets.get(group)?.faceCamera(camera);
  }

  createEnemy(key: EnemyKey): Group {
    const group = this.createCharacter(key);
    group.name = key;
    this.setEnemyAppearance(group, key);
    return group;
  }

  setEnemyAppearance(group: Group, key: EnemyAppearance, scared = key === 'scared', amount?: number): void {
    const character = this.characters.get(group);
    if (!character) return;
    character.scared = scared;
    character.fearAmount = amount;
    // Warning flashes retain their crisp cadence without restarting the eye transition.
    if (scared) character.scaredTint = key === 'scared';
  }

  setEnemyReturnProgress(group: Group, progress: number | null, immediate = false): void {
    const character = this.characters.get(group);
    if (!character) return;
    character.returnProgress = progress === null ? null : MathUtils.clamp(progress, 0, 1);
    if (immediate) character.restoration.reset(character.returnProgress ?? 0);
  }

  sampleAnimation(timeSeconds: number): void {
    if (this.disposed) return;
    for (const packet of this.packets.values()) packet.sample(timeSeconds);
    for (const character of this.characters.values()) {
      character.mixer.setTime(timeSeconds);
      // The edible expression wins over idle weight tracks, including when seeking backward.
      const fear = character.fear.sample(character.scared ? 1 : 0, timeSeconds, character.fearAmount);
      this.applyExpression(character, fear);
      const tint = character.scaredTint ? fear : 0;
      for (const { material, accent } of character.colors) {
        material.color.copy(character.baseColor).lerp(SCARED_COLOR, tint);
        if (accent) material.emissive.copy(material.color);
      }
      const progress = character.returnProgress === null
        ? character.restoration.sample(0, timeSeconds)
        : character.restoration.reset(character.returnProgress);
      character.collapse.visible = progress < 1;
      character.collapse.scale.setScalar(1 - MathUtils.smootherstep(progress, 0, 1));
      character.collapse.rotation.y = MathUtils.smootherstep(progress, 0, 1) * Math.PI * 3;
      character.returning.sample(timeSeconds, progress);
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
    const collapse = new Group();
    collapse.name = 'enemy-collapse';
    collapse.add(scene);
    const returning = new ReturnEnemyPresentation(ENEMY_COLORS[key]);
    model.add(collapse, returning.group);
    root.add(model);
    collectResources(returning.group, this.resources);
    const character: CharacterInstance = {
      mixer: new AnimationMixer(scene), collapse, returning, returnProgress: null,
      colors: [], expressions: [], scared: false, scaredTint: true,
      baseColor: new Color(ENEMY_COLORS[key]), fear: new StateTransition(0.24), restoration: new StateTransition(0.28),
    };
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
      const scaredIndex = mesh.morphTargetDictionary?.scared;
      if (scaredIndex !== undefined && mesh.morphTargetInfluences) {
        character.expressions.push({ influences: mesh.morphTargetInfluences, index: scaredIndex });
      }
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
    this.applyExpression(character, 0);
    for (const { material, accent } of character.colors) {
      material.color.copy(character.baseColor);
      if (accent) material.emissive.copy(character.baseColor);
    }
    this.characters.set(root, character);
    return root;
  }

  private applyExpression(character: CharacterInstance, amount: number): void {
    for (const { influences, index } of character.expressions) {
      influences[index] = amount;
    }
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
