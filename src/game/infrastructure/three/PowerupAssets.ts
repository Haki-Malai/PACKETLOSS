import {
  AnimationMixer, BufferGeometry, Group, LoopOnce, LoopRepeat,
  Material, Mesh, Quaternion, Vector3, type AnimationAction, type Object3D,
} from 'three';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import manifest from '../../../../public/assets/models/powerups/manifest.json';
import { POWERUP_RULES, type PowerupKind } from '../../shared/offensivePowerups';
import { disposeGlbResources, loadGlbCollection } from './GlbResources';

export type PowerupAssetRole = 'pickup' | 'effect' | 'projectile' | 'launch' | 'impact' | 'packet-companion' | 'collection';
export const OFFENSIVE_POWERUP_ASSETS = manifest.assets.filter(({ kind }) => kind !== 'magnet');

export interface PowerupPose {
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
  eyes: Array<{ position: Vector3; scale: Vector3 }>;
  angle: number;
}

/** An independently seekable clone; its geometry remains owned by the asset library. */
export class PowerupModel {
  readonly group = new Group();
  readonly scene: Group;
  private readonly mixer: AnimationMixer;
  private readonly action: AnimationAction;
  private readonly materials = new Set<Material>();
  private readonly clipPlane = { origin: new Vector3(), direction: new Vector3(0, 0, -1), length: 64 };
  private readonly laserSpan: Group | null = null;
  private readonly laserImpact: Group | null = null;
  private elapsedMs = 0;
  private disposed = false;

  /** Clones the canonical GLB with private materials; all effect geometry and animation stay asset-owned. */
  constructor(model: GLTF, clipName: string, private readonly loop: boolean) {
    const clip = model.animations.find(({ name }) => name === clipName);
    if (!clip) throw new Error(`Missing powerup animation: ${clipName}`);
    this.scene = model.scene.clone(true);
    const clones = new Map<Material, Material>();
    this.scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
      const clone = (source: Material): Material => {
        const cached = clones.get(source);
        if (cached) return cached;
        const material = source.clone();
        this.materials.add(material);
        clones.set(source, material);
        return material;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(clone) : clone(mesh.material);
    });
    this.laserSpan = this.scene.getObjectByName('laser-span') as Group | undefined ?? null;
    this.laserImpact = this.scene.getObjectByName('laser-wall-impact') as Group | undefined ?? null;
    if (this.laserSpan) {
      this.scene.traverse((object) => { if (object instanceof Mesh) object.renderOrder = 4; });
      for (const material of this.materials) { material.depthTest = false; material.depthWrite = false; }
    }
    this.group.add(this.scene);
    this.mixer = new AnimationMixer(this.scene);
    this.action = this.mixer.clipAction(clip);
    this.action.setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 1);
    this.action.clampWhenFinished = !loop;
  }

  /** Seeks the same GLB clip used in the Asset Lab, including pause, rewind, and clamped one-shots. */
  sample(elapsedMs: number): void {
    this.elapsedMs = Math.max(0, elapsedMs);
    if (this.laserImpact) this.laserImpact.visible = true;
    this.mixer.stopAllAction();
    this.action.reset().play();
    const duration = this.action.getClip().duration;
    this.mixer.setTime(this.loop ? this.elapsedMs / 1000 : Math.min(duration, this.elapsedMs / 1000));
  }

  /** Adapts an authored beam span; portal continuations omit charge effects and impacts wait for solid contact. */
  clipLaser(x: number, y: number, angle: number, length: number,
    options: { impact?: boolean; continuation?: boolean } = {}): void {
    this.clipPlane.origin.set(x + Math.cos(angle) * POWERUP_RULES.laser.muzzle, 0,
      y + Math.sin(angle) * POWERUP_RULES.laser.muzzle);
    this.clipPlane.direction.set(Math.cos(angle), 0, Math.sin(angle));
    this.clipPlane.length = length;
    if (this.laserSpan) this.laserSpan.scale.z = length / POWERUP_RULES.laser.authoredLength;
    if (this.laserImpact) {
      this.laserImpact.visible = length > 0 && options.impact !== false;
      this.laserImpact.position.set(0, 6.15, -POWERUP_RULES.laser.muzzle - length + 0.04);
    }
    if (options.continuation) this.scene.traverse((object) => {
      if (object.name.startsWith('charge-')) object.visible = false;
    });
    if (this.group.userData.laserClipped) return;
    this.group.userData.laserClipped = true;
    const clipPlane = this.clipPlane;
    for (const material of this.materials) {
      material.transparent = true;
      material.depthTest = false;
      material.depthWrite = false;
      material.customProgramCacheKey = () => 'powerup-beam-endpoint';
      material.onBeforeCompile = (shader) => {
        shader.uniforms.powerupOrigin = { value: this.clipPlane.origin };
        shader.uniforms.powerupDirection = { value: this.clipPlane.direction };
        // Keep the uniform live as topology and visible reach change.
        shader.uniforms.powerupLength = { get value() { return clipPlane.length; } };
        shader.vertexShader = `varying vec3 powerupWorldPosition;\n${shader.vertexShader}`.replace(
          '#include <project_vertex>', '#include <project_vertex>\npowerupWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;',
        );
        shader.fragmentShader = `varying vec3 powerupWorldPosition;\nuniform vec3 powerupOrigin;\nuniform vec3 powerupDirection;\nuniform float powerupLength;\n${shader.fragmentShader}`.replace(
          'void main() {', 'void main() {\nif (dot(powerupWorldPosition - powerupOrigin, powerupDirection) > powerupLength) discard;',
        );
      };
      material.needsUpdate = true;
    }
  }

  /** Retargets authored companion transforms without displaying its duplicate Packet meshes. */
  pose(angle: number): PowerupPose {
    const nodes: Object3D[] = [];
    this.scene.traverse((object) => nodes.push(object));
    const pose = nodes.find(({ name }) => /^packet-pose\d*$/.test(name));
    if (!pose) throw new Error('Missing powerup Packet pose');
    const eyes = ['left', 'right'].map((side) => {
      const eye = nodes.find(({ name }) => name.startsWith(`eye-expression-${side}`));
      if (!eye) throw new Error(`Missing companion ${side} eye`);
      return { position: eye.position.clone(), scale: eye.scale.clone() };
    });
    return { position: pose.position.clone(), rotation: pose.quaternion.clone(), scale: pose.scale.clone(), eyes, angle };
  }

  /** Stops animation bindings and releases private materials; GLB geometry stays with the asset library. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.scene);
    this.group.removeFromParent();
    for (const material of this.materials) material.dispose();
    this.group.clear();
  }
}

/** Owns the offensive models while every pickup and attack owns its animation clone. */
export class PowerupAssets {
  private readonly instances = new Set<PowerupModel>();
  private disposed = false;

  /** Takes ownership of parsed templates, which are never attached to a gameplay scene. */
  constructor(private readonly models: ReadonlyMap<string, GLTF>) {}

  /** Loads only offensive assets and cleans partial loads on any failure or cancellation. */
  static async load(signal?: AbortSignal): Promise<PowerupAssets> {
    const entries = OFFENSIVE_POWERUP_ASSETS.map((entry) => ({ ...entry, id: entry.file }));
    return new PowerupAssets(await loadGlbCollection('powerups', entries, signal));
  }

  /** Creates a private mixer/material instance selected by manifest kind, role, and clip name. */
  create(kind: PowerupKind, role: PowerupAssetRole): PowerupModel {
    if (this.disposed) throw new Error('Powerup assets are disposed');
    const entry = OFFENSIVE_POWERUP_ASSETS.find((candidate) => candidate.kind === kind && candidate.role === role);
    const model = entry && this.models.get(entry.file);
    if (!entry || !model) throw new Error(`Missing powerup asset: ${kind}/${role}`);
    const instance = new PowerupModel(model, entry.clip, entry.loop === true);
    this.instances.add(instance);
    return instance;
  }

  /** Removes an instance from ownership as soon as its simulation effect expires. */
  release(instance: PowerupModel): void {
    instance.dispose();
    this.instances.delete(instance);
  }

  /** Disposes clones before shared templates, including startup cancellation and repeated teardown. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const instance of this.instances) instance.dispose();
    this.instances.clear();
    disposeGlbResources([...this.models.values()].map(({ scene }) => scene));
  }
}
