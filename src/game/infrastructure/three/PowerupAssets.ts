import {
  AdditiveBlending, AnimationMixer, BoxGeometry, BufferGeometry, Group, LoopOnce, LoopRepeat,
  Material, MathUtils, Mesh, MeshBasicMaterial, Quaternion, RingGeometry, SphereGeometry, TorusGeometry, Vector3,
  type AnimationAction, type Color, type MeshStandardMaterial, type Object3D,
} from 'three';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import manifest from '../../../../public/assets/models/powerups/manifest.json';
import { POWERUP_RULES, samplePowerupRadius, type PowerupKind } from '../../shared/offensivePowerups';
import { disposeGlbResources, loadGlbCollection } from './GlbResources';
import { createPulseRingGeometry, samplePulseRing } from './PulseRing';

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
  private readonly impactGeometry = new Set<BufferGeometry>();
  private readonly clipPlane = { origin: new Vector3(), direction: new Vector3(0, 0, -1), length: 64 };
  private readonly laserSpan: Group | null = null;
  private readonly blastPulse: Group | null = null;
  private laserImpact: Group | null = null;
  private elapsedMs = 0;
  private disposed = false;

  /** Clones materials for independent effects; blast replaces its burst with a privately owned Ping pulse. */
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
    const muzzle = this.scene.getObjectByName('muzzle-anchor');
    if (muzzle && this.scene.getObjectByName('beam-white-core')) {
      this.laserSpan = new Group();
      this.laserSpan.name = 'laser-span';
      this.laserSpan.add(...muzzle.children.filter(({ name }) => /^(beam-|helical-beam-filament)/.test(name)));
      muzzle.add(this.laserSpan);
    }
    const blastFront = this.scene.getObjectByName('expanding-shock-front') as Mesh<BufferGeometry, MeshStandardMaterial> | undefined;
    if (blastFront) {
      for (const child of this.scene.children) child.visible = false;
      this.blastPulse = this.createBlastPulse(blastFront.material.color);
      this.scene.add(this.blastPulse);
    }
    this.group.add(this.scene);
    this.mixer = new AnimationMixer(this.scene);
    this.action = this.mixer.clipAction(clip);
    this.action.setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 1);
    this.action.clampWhenFinished = !loop;
  }

  /** Seeks absolute simulation age, samples blast pulses, and resets beam transforms before clipping. */
  sample(elapsedMs: number): void {
    this.elapsedMs = Math.max(0, elapsedMs);
    if (this.laserSpan) this.laserSpan.scale.z = 1;
    if (this.laserImpact) this.laserImpact.visible = false;
    this.mixer.stopAllAction();
    this.action.reset().play();
    const duration = this.action.getClip().duration;
    this.mixer.setTime(this.loop ? Math.max(0, elapsedMs) / 1000 : Math.min(duration, Math.max(0, elapsedMs) / 1000));
    if (this.blastPulse) this.setBlastRadius(samplePowerupRadius('blast', this.elapsedMs));
  }

  /** Stretches the complete beam to gameplay reach, sampling wall contact and drawing above the Packet. */
  clipLaser(x: number, y: number, angle: number, length: number): void {
    this.clipPlane.origin.set(x + Math.cos(angle) * POWERUP_RULES.laser.muzzle, 0,
      y + Math.sin(angle) * POWERUP_RULES.laser.muzzle);
    this.clipPlane.direction.set(Math.cos(angle), 0, Math.sin(angle));
    this.clipPlane.length = length;
    if (this.laserSpan) {
      this.laserSpan.scale.z = length / POWERUP_RULES.laser.authoredLength;
      for (const part of this.laserSpan.children) {
        if (/^(beam-white-core|beam-blue-envelope|helical-beam-filament)/.test(part.name)) part.scale.z = 1;
      }
      if (!this.laserImpact) {
        this.laserImpact = this.createLaserImpact();
        this.scene.add(this.laserImpact);
      }
      this.sampleLaserImpact(length);
    }
    if (this.group.userData.laserClipped) return;
    this.group.userData.laserClipped = true;
    this.scene.traverse((object) => {
      if (object instanceof Mesh) object.renderOrder = 4;
    });
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

  /** Creates one owned white contact flare, cyan pressure ring, and sparks without duplicating GLB geometry. */
  private createLaserImpact(): Group {
    const impact = new Group();
    impact.name = 'laser-wall-impact';
    const core = new SphereGeometry(1, 12, 8);
    const ring = new TorusGeometry(1.9, 0.16, 6, 24);
    const spark = new BoxGeometry(1, 1, 1);
    for (const geometry of [core, ring, spark]) this.impactGeometry.add(geometry);
    for (let index = 0; index < 10; index += 1) {
      const material = new MeshBasicMaterial({
        color: index === 0 || index % 3 === 0 ? 0xe9fdff : 0x40bcff,
        transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, toneMapped: false,
      });
      this.materials.add(material);
      const mesh = new Mesh(index === 0 ? core : index === 1 ? ring : spark, material);
      mesh.name = index === 0 ? 'laser-impact-core' : index === 1 ? 'laser-impact-ring' : `laser-impact-spark-${index - 2}`;
      impact.add(mesh);
    }
    return impact;
  }

  /** Holds contact on the wall after beam growth; sparks fly back toward the caster and fade with afterglow. */
  private sampleLaserImpact(length: number): void {
    const impact = this.laserImpact;
    if (!impact) return;
    const rule = POWERUP_RULES.laser;
    const contactMs = rule.releaseMs + rule.laserGrowMs;
    impact.visible = length > 0 && this.elapsedMs >= contactMs && this.elapsedMs < rule.durationMs;
    impact.position.set(0, 6.15, -rule.muzzle - length + 0.04);
    const age = Math.max(0, this.elapsedMs - contactMs) / 1000;
    const fade = 1 - MathUtils.smoothstep(this.elapsedMs, rule.activeUntilMs, rule.durationMs);
    const pulse = 0.8 + Math.sin(age * 28) * 0.2;
    for (const [index, object] of impact.children.entries()) {
      const mesh = object as Mesh<BufferGeometry, MeshBasicMaterial>;
      if (index < 2) {
        mesh.scale.setScalar(index === 0 ? 1.1 + pulse * 0.35 : 0.85 + pulse * 0.25);
        mesh.scale.z = index === 0 ? 0.12 : 1;
        mesh.material.opacity = fade * (index === 0 ? 0.95 : 0.75) * pulse;
        continue;
      }
      const phase = (age * 3.5 + (index - 2) / 8) % 1;
      const angle = (index - 2) * Math.PI / 4 + age * 0.4;
      mesh.position.set(Math.cos(angle) * phase * 5, Math.sin(angle) * phase * 5, 0.1 + phase * 4);
      mesh.rotation.z = angle - Math.PI / 2;
      mesh.scale.set(0.42, 1.8 + phase * 2.4, 0.42);
      mesh.material.opacity = fade * (1 - phase);
    }
  }

  /** Creates a wide Ping pulse in the original blast color with a broad pressure wave and hot flash. */
  private createBlastPulse(color: Color): Group {
    const pulse = new Group();
    pulse.name = 'blast-ping-pulse';
    pulse.visible = false;
    const ring = createPulseRingGeometry(0.72);
    const pressure = new RingGeometry(0.6, 1, 64).rotateX(-Math.PI / 2);
    const flash = new SphereGeometry(1, 12, 8);
    for (const geometry of [ring, pressure, flash]) this.impactGeometry.add(geometry);
    for (let index = 0; index < 3; index += 1) {
      const material = new MeshBasicMaterial({
        color: index === 2 ? 0xe9fdff : color,
        transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, toneMapped: false,
      });
      this.materials.add(material);
      const mesh = new Mesh(index === 0 ? ring : index === 1 ? pressure : flash, material);
      mesh.name = index === 0 ? 'blast-pulse-front' : index === 1 ? 'blast-pressure-ring'
        : 'blast-impact-flash';
      mesh.position.y = index === 0 ? 0.12 : index === 1 ? 0.14 : 0.35;
      pulse.add(mesh);
    }
    return pulse;
  }

  /** Samples the shared Ping pulse at the damage radius with impact accents on the same absolute clock. */
  setBlastRadius(radius: number): void {
    const pulse = this.blastPulse;
    if (!pulse) return;
    const rule = POWERUP_RULES.blast;
    const age = Math.max(0, this.elapsedMs - rule.releaseMs);
    const progress = MathUtils.clamp(age / (rule.durationMs - rule.releaseMs), 0, 1);
    pulse.visible = this.elapsedMs >= rule.releaseMs && progress < 1;
    const front = pulse.children[0] as Mesh<RingGeometry, MeshBasicMaterial>;
    samplePulseRing(front, progress, rule.radius, front.material.color, radius);
    const flash = Math.max(0, 1 - age / 240);
    for (const [index, object] of pulse.children.entries()) {
      const mesh = object as Mesh<BufferGeometry, MeshBasicMaterial>;
      if (index === 0) continue;
      if (index === 1) {
        mesh.scale.set(radius * 0.94, 1, radius * 0.94);
        mesh.material.opacity = (1 - progress) ** 2 * 0.75;
      } else {
        mesh.scale.set(16 + (1 - flash) * 16, 0.35, 16 + (1 - flash) * 16);
        mesh.material.opacity = flash ** 2;
      }
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

  /** Stops animation bindings and releases private materials and impact geometry once. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.scene);
    this.group.removeFromParent();
    for (const material of this.materials) material.dispose();
    for (const geometry of this.impactGeometry) geometry.dispose();
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
