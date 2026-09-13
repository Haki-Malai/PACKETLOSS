import {
  AdditiveBlending, BoxGeometry, BufferGeometry, Camera, Color, DataTexture, Float32BufferAttribute,
  Group, LinearFilter, Material, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D,
  PlaneGeometry, Quaternion, Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { StateTransition } from './StateTransition';

interface FloatingPiece {
  mesh: Mesh<BufferGeometry, MeshBasicMaterial>;
  glow?: Mesh<PlaneGeometry, MeshBasicMaterial>;
  phase: number;
  period: number;
  x: number;
  y: number;
  width: number;
  height: number;
  surface?: boolean;
}

const CYAN = 0x00aeff;
const GOLD = 0xffc34d;
const GOLD_COLOR = new Color(GOLD);
const PICKUP_RIM_COLOR = new Color(0xb8f9ff);
const HUNTER_RIM_COLOR = new Color(0xfff1ba);

/** A shaded solid body with readable floating details, sampled only from the game clock. */
export class HologramPacket {
  readonly group = new Group();
  readonly model = new Group();
  private readonly geometry = new Set<BufferGeometry>();
  private readonly materials = new Set<Material>();
  private readonly plane = this.ownGeometry(new PlaneGeometry(1, 1));
  private readonly cube = this.ownGeometry(new BoxGeometry(1, 1, 1));
  private readonly glyphs = [this.ownGeometry(createDigitGeometry(false)), this.ownGeometry(createDigitGeometry(true))];
  private readonly hunterEyes = [-1, 1].map((side) => this.ownGeometry(createHunterEyeGeometry(side)));
  private readonly halo = createHaloTexture();
  private readonly body = new Group();
  private readonly gaze = new Group();
  private readonly eyes: FloatingPiece[] = [];
  private readonly eyeEdges: Mesh<BufferGeometry, MeshBasicMaterial>[] = [];
  private readonly eyeSockets: Mesh<BufferGeometry, MeshStandardMaterial>[] = [];
  private readonly hunterRig = new Group();
  private readonly intake = new Group();
  private readonly intakeJaws: Mesh<PlaneGeometry, MeshBasicMaterial>[] = [];
  private readonly intakeCavity: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private readonly pickupRims = new Set<MeshBasicMaterial>();
  private readonly digits: FloatingPiece[] = [];
  private readonly pixels: Mesh<BufferGeometry, MeshBasicMaterial>[] = [];
  private readonly streaks: FloatingPiece[] = [];
  private readonly trail = new Group();
  private readonly deathEffect = new Group();
  private readonly deathEchoes: Group[] = [];
  private readonly deathScanline: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private readonly glitchActive = { value: 0 };
  private readonly glitchPhase = { value: 0 };
  private readonly glitchCenter = { value: 0 };
  private readonly viewCenter = new Vector3();
  private readonly motion = new Vector3();
  private readonly viewMotion = new Vector3();
  private readonly inverseRoot = new Quaternion();
  private readonly cameraRotation = new Quaternion();
  private readonly powerTransition = new StateTransition(0.32);
  private readonly powerColor = new Color(CYAN);
  private readonly pickupColor = new Color();
  private frame = 0;
  private trailOpacity = 0;
  private deathProgress: number | null = null;
  private powered = false;
  private powerWarning = false;
  private powerAmount: number | undefined;
  private enemyEatProgress: number | null = null;
  private disposed = false;

  constructor() {
    this.group.name = 'packet';
    this.model.name = 'hologram-model';
    this.group.add(this.model);
    this.body.name = 'hologram-body';
    this.body.scale.x = 1.2;
    this.model.add(this.body);
    const pickupTarget = new Object3D();
    pickupTarget.name = 'pickup-target';
    pickupTarget.position.y = 2.15;
    this.body.add(pickupTarget);
    // Fixed, closely matched tones keep scene lighting from darkening the side walls.
    const topMaterial = this.material('core-top', 0x030b11);
    const sideMaterial = this.material('core-side', 0x030a10);
    const core = new Mesh(this.ownGeometry(new RoundedBoxGeometry(5.8, 3.8, 4.2, 1, 0.18)),
      [sideMaterial, sideMaterial, topMaterial, sideMaterial, sideMaterial, sideMaterial]);
    core.name = 'core';
    this.body.add(core);
    const face = new Group();
    face.name = 'top-face';
    face.rotation.x = -Math.PI / 2;
    face.position.y = -0.17;
    face.scale.y = 4.2 / 5.8;
    this.body.add(face);
    this.gaze.name = 'eye-gaze';
    face.add(this.gaze);
    // Broad corner brackets echo the maze's square outlines without fine surface noise.
    for (const x of [-1, 1]) {
      for (const y of [-1, 1]) {
        face.add(this.rect(`rim-horizontal-${x}-${y}`, x * 2.1, y * 2.7, 2.105, 1.45, 0.25, CYAN, 0.85));
        face.add(this.rect(`rim-vertical-${x}-${y}`, x * 2.7, y * 2.1, 2.105, 0.25, 1.45, CYAN, 0.85));
      }
    }
    for (const [i, [angle, x, z, edge]] of [
      [0, 0, 2.13, 2.7], [Math.PI, 0, -2.13, 2.7],
      [Math.PI / 2, 2.93, 0, 1.9], [-Math.PI / 2, -2.93, 0, 1.9],
    ].entries()) {
      const sideFace = new Group();
      sideFace.name = `side-outline-${i}`;
      sideFace.position.set(x, 0, z);
      sideFace.rotation.y = angle;
      this.body.add(sideFace);
      for (const horizontal of [-1, 1]) {
        for (const vertical of [-1, 1]) {
          sideFace.add(this.rect(`side-rim-horizontal-${i}-${horizontal}-${vertical}`,
            horizontal * (edge - 0.45), vertical * 1.7, 0, 1.15, 0.25, CYAN, 0.85));
          sideFace.add(this.rect(`side-rim-vertical-${i}-${horizontal}-${vertical}`,
            horizontal * edge, vertical * 1.25, 0, 0.25, 1.15, CYAN, 0.85));
        }
      }
    }
    for (const [i, [x, y]] of [
      [-2.35, -0.8], [-2.35, 0.8], [2.35, -0.8], [2.35, 0.8],
      [-0.65, 2.25], [0.65, 2.25], [-0.65, -2.25], [0.65, -2.25],
      [0, 2.25], [0, -2.25], [-2.35, 0], [2.35, 0],
    ].entries()) {
      const size = 0.36 + noise(i + 600) * 0.12;
      const pixel = this.rect(`surface-pixel-${i}`, x, y, 2.13, size, size, CYAN, 0.6);
      face.add(pixel);
      this.pixels.push(pixel);
    }
    for (const [i, [x, y]] of [
      [-3.65, 3.5], [3.65, 3.5], [-3.65, -3.5], [3.65, -3.5], [-5.15, 2.9], [5.15, -2.9],
    ].entries()) {
      const size = 0.32 + noise(i + 620) * 0.18;
      this.pixels.push(this.rect(`floating-pixel-${i}`, x, y, 1.5, size, size, CYAN, 0.6));
    }
    // These solid rails trace the depth of the visible top and right surfaces.
    const railMaterial = this.material('depth-edge', 0x287495);
    for (const [i, [x, y, z, width, height, depth]] of [
      [-2.72, 1.84, 0, 0.16, 0.16, 3.8],
      [2.72, 1.84, 0, 0.16, 0.16, 3.8],
      [2.84, -1.72, 0, 0.16, 0.16, 3.8],
      [0, 1.84, -1.92, 5.5, 0.16, 0.16],
      [2.84, 0, -1.92, 0.16, 3.5, 0.16],
    ].entries()) {
      const rail = new Mesh(this.cube, railMaterial);
      rail.name = `depth-edge-${i}`;
      rail.position.set(x, y, z);
      rail.scale.set(width, height, depth);
      this.body.add(rail);
    }

    for (const [i, sideName] of ['left', 'right'].entries()) {
      const x = i === 0 ? -0.86 : 0.86;
      const socket = new Mesh(this.cube, this.surface(`eye-socket-${sideName}`, 0x020812));
      socket.name = `eye-socket-${sideName}`;
      socket.position.set(x, 0.04, 2.13);
      socket.scale.set(1.02, 2.14, 0.2);
      this.eyeSockets.push(socket);
      const glow = this.glow(`glow-eye-${sideName}`, x, 0.04, 2.24, 1.8, 3.1, 0.35);
      const edge: Mesh<BufferGeometry, MeshBasicMaterial> = this.rect(`eye-edge-${sideName}`, x, 0.04, 2.25, 0.72, 1.83, CYAN, 1);
      edge.geometry = this.hunterEyes[i];
      edge.updateMorphTargets();
      this.eyeEdges.push(edge);
      const mesh: Mesh<BufferGeometry, MeshBasicMaterial> = this.rect(`eye-${sideName}`, x, 0.04, 2.27, 0.56, 1.67, 0xe9fdff, 1);
      mesh.geometry = this.hunterEyes[i];
      mesh.updateMorphTargets();
      this.gaze.add(socket, glow, edge, mesh);
      this.eyes.push({ mesh, glow, x, y: 0.04, width: 0.56, height: 1.67, phase: 0, period: 1 });
    }

    this.hunterRig.name = 'hunter-rig';
    this.hunterRig.visible = false;
    face.add(this.hunterRig);
    for (const side of [-1, 1]) {
      const prong = this.rect(`hunter-prong-${side}`, side * 3, 1.4, 2.22, 0.24, 1.5, GOLD, 1);
      prong.rotation.z = -side * 0.32;
      this.hunterRig.add(prong);
    }
    this.intake.name = 'enemy-intake';
    this.intake.position.z = 2.3;
    this.hunterRig.add(this.intake);
    this.intakeCavity = new Mesh(this.plane, this.material('intake-cavity', 0x000205));
    this.intakeCavity.name = 'intake-cavity';
    this.intakeCavity.scale.set(1.72, 0.1, 1);
    this.intake.add(this.intakeCavity);
    for (const [index, side] of [-1, 1].entries()) {
      const jaw = this.rect(index === 0 ? 'intake-jaw-bottom' : 'intake-jaw-top', 0, side * 0.12, 0.02, 1.9, 0.14, GOLD, 1);
      this.intake.add(jaw);
      this.intakeJaws.push(jaw);
    }

    const positions = [
      [-3.65, 1.5], [3.65, -1.5], [-3.65, -1.5], [3.65, 1.5], [-1.4, 3.4], [1.4, -3.4],
      [1.4, 3.4], [-1.4, -3.4], [-4.65, 0], [4.65, 0],
    ];
    positions.forEach(([x, y], i) => {
      const mesh = new Mesh(this.glyphs[i % 2], this.material(`binary-material-${i}`, i % 5 === 0 ? 0x40dcff : CYAN, 1, true));
      mesh.name = `binary-${String(i).padStart(3, '0')}`;
      mesh.userData.glyph = String(i % 2);
      const size = 2.6;
      mesh.scale.setScalar(size);
      mesh.position.z = 1.22;
      this.model.add(mesh);
      this.digits.push({ mesh, x, y, width: size, height: size, phase: i / positions.length, period: 4.2 + noise(i + 110) * 1.2 });
    });
    for (const [i, [x, y]] of [[-1.85, 2.05], [1.85, 2.05], [-1.85, -2.05], [1.85, -2.05]].entries()) {
      const mesh = new Mesh(this.glyphs[i % 2], this.material(`surface-binary-material-${i}`, CYAN, 0.8, true));
      mesh.name = `surface-binary-${i}`;
      mesh.scale.setScalar(1.7);
      face.add(mesh);
      this.digits.push({ mesh, x, y, width: 1.7, height: 1.7, phase: i / 4, period: 3.2 + noise(i + 130), surface: true });
    }

    this.trail.name = 'motion-trail';
    this.model.add(this.trail);
    for (let i = 0; i < 3; i += 1) {
      const width = 0.85 + noise(i + 200) * 0.35;
      const height = 0.28;
      const mesh = this.rect(`glitch-${String(i).padStart(3, '0')}`, 0, 0, 1.08, width, height, CYAN, 1);
      this.trail.add(mesh);
      this.streaks.push({
        mesh, x: -1, y: (i - 1) * 1.25,
        width, height, phase: i / 3, period: 0.7,
      });
    }
    this.deathEffect.name = 'death-effect';
    this.model.add(this.deathEffect);
    this.deathScanline = this.rect('death-scanline', 0, 0, 4.5, 7, 0.07, 0x80efff, 0);
    this.deathEffect.add(this.deathScanline);
    // Reuse the actual body geometry so displaced bands retain its face and solid silhouette.
    for (const [index, color] of [0x35e4ff, 0xff4aab].entries()) {
      const echo = this.body.clone(true);
      echo.name = `death-slice-${index}`;
      const clones = new Map<Material, Material>();
      echo.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
        const tint = (source: Material): Material => {
          const existing = clones.get(source);
          if (existing) return existing;
          const material = source.clone();
          if (material instanceof MeshBasicMaterial || material instanceof MeshStandardMaterial) {
            const brightness = Math.max(material.color.r, material.color.g, material.color.b);
            material.color.copy(new Color(color)).multiplyScalar(brightness);
          }
          material.transparent = true;
          material.depthWrite = false;
          material.blending = AdditiveBlending;
          material.toneMapped = false;
          material.opacity *= 0.85;
          this.clipGlitchBands(material, index * 2);
          this.materials.add(material);
          clones.set(source, material);
          return material;
        };
        mesh.material = Array.isArray(mesh.material) ? mesh.material.map(tint) : tint(mesh.material);
      });
      this.deathEchoes.push(echo);
      this.deathEffect.add(echo);
    }
    this.body.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        this.clipGlitchBands(material, -1);
        if (material instanceof MeshBasicMaterial && /^(side-)?rim-/.test(material.name)) this.pickupRims.add(material);
      }
    });
    this.sample(0);
  }

  sample(timeSeconds: number): void {
    if (this.disposed) return;
    const time = Math.max(0, timeSeconds);
    const pickup = this.deathProgress === null ? this.frame / 3 : 0;
    const hunter = this.deathProgress === null
      ? this.powerTransition.sample(Number(this.powered || this.enemyEatProgress !== null), time, this.powerAmount)
      : this.powerTransition.reset();
    const accent = this.powerColor.setHex(CYAN).lerp(GOLD_COLOR, hunter);
    const warning = this.powerWarning ? MathUtils.lerp(1, 0.6 + Math.sin(time * 16) * 0.4, hunter) : 1;
    this.pickupColor.copy(PICKUP_RIM_COLOR).lerp(HUNTER_RIM_COLOR, hunter);
    this.model.position.x = 0;
    this.model.position.y = 6.15 + Math.sin(time * 1.7) * 0.16;
    this.model.scale.setScalar(1.15 * (1 + Math.sin(time * 2.2) * 0.008));
    this.body.scale.set(1.2, 1, 1);
    for (const material of this.pickupRims) {
      material.color.copy(accent).lerp(this.pickupColor, pickup);
      material.opacity = (0.85 + pickup * 0.15) * warning;
    }
    this.body.visible = true;
    this.glitchActive.value = 0;
    // The upper face's local Y axis points toward negative world Z.
    this.gaze.position.set(this.motion.x * this.trailOpacity * 0.65, -this.motion.z * this.trailOpacity * 0.8, 0);
    this.gaze.position.y = MathUtils.lerp(this.gaze.position.y, 1.05 - this.motion.z * this.trailOpacity * 0.18, hunter);
    const blinkPhase = time % 5.8;
    const blink = blinkPhase > 5.3 && blinkPhase < 5.56 ? 1 - Math.sin((blinkPhase - 5.3) / 0.26 * Math.PI) : 1;
    for (const [index, edge] of this.eyeEdges.entries()) {
      if (edge.morphTargetInfluences) edge.morphTargetInfluences[0] = hunter;
      edge.scale.set(MathUtils.lerp(0.72, 0.98, hunter), MathUtils.lerp(1.83, 1.18, hunter) * blink, 1);
      edge.material.color.copy(accent);
      this.eyeSockets[index].scale.y = MathUtils.lerp(2.14, 1.35, hunter);
    }
    for (const eye of this.eyes) {
      if (eye.mesh.morphTargetInfluences) eye.mesh.morphTargetInfluences[0] = hunter;
      eye.mesh.scale.set(MathUtils.lerp(eye.width, 0.82, hunter), MathUtils.lerp(eye.height, 1, hunter) * blink, 1);
      eye.mesh.material.opacity = 0.96 + Math.sin(time * 2.8) * 0.04;
      if (eye.glow) {
        eye.glow.scale.y = MathUtils.lerp(3.1, 1.9, hunter);
        eye.glow.material.color.copy(accent);
        eye.glow.material.opacity = (0.35 + Math.sin(time * 2.8) * 0.04) * blink;
      }
    }
    this.hunterRig.visible = hunter > 0;
    this.hunterRig.scale.set(MathUtils.lerp(0.55, 1, hunter), hunter, 1);
    const eating = this.deathProgress === null ? this.enemyEatProgress : null;
    const opening = eating === null ? 0 : MathUtils.smoothstep(eating, 0, 0.25) * (1 - MathUtils.smoothstep(eating, 0.75, 0.95));
    this.intakeCavity.scale.y = 0.1 + opening * 0.6;
    for (const [index, jaw] of this.intakeJaws.entries()) {
      jaw.position.y = (index === 0 ? -1 : 1) * (0.12 + opening * 0.3);
      jaw.material.color.setHex(GOLD).lerp(HUNTER_RIM_COLOR, eating === null ? 0 : MathUtils.smoothstep(eating, 0.65, 0.85));
    }
    for (const [i, digit] of this.digits.entries()) {
      const switchTime = time + (this.deathProgress ?? 0) * 8;
      const switchStep = Math.floor(switchTime / (0.8 + noise(i + 320) * 1.4) + digit.phase);
      const value = noise(switchStep * 19 + i * 71 + 840) < 0.5 ? 0 : 1;
      digit.mesh.geometry = this.glyphs[value];
      digit.mesh.userData.glyph = String(value);
      const phase = (time / digit.period + digit.phase) % 1;
      const opacity = MathUtils.smoothstep(phase, 0, 0.1) * (1 - MathUtils.smoothstep(phase, 0.8, 1));
      digit.mesh.position.x = digit.x;
      digit.mesh.position.y = digit.y + (digit.surface ? 0 : (phase - 0.5) * 0.5);
      digit.mesh.position.z = digit.surface ? 2.145 : 1.5 + Math.sin(time * 0.7 + i * 1.4) * 0.35;
      digit.mesh.material.opacity = digit.surface ? 0.45 + opacity * 0.45 : opacity * (i % 2 === 0 ? 1 : 0.9);
      digit.mesh.material.color.setHex(!digit.surface && i % 5 === 0 ? 0x40dcff : CYAN).lerp(GOLD_COLOR, hunter);
      digit.mesh.visible = digit.surface === true || opacity > 0.015;
    }
    for (const [i, pixel] of this.pixels.entries()) {
      const step = Math.floor(time / (0.7 + noise(i + 650) * 1.1));
      pixel.material.opacity = 0.2 + noise(step * 23 + i * 43 + 700) * 0.6;
      pixel.material.color.copy(accent);
    }
    this.trail.visible = this.trailOpacity > 0.01;
    for (const streak of this.streaks) {
      const phase = (time / streak.period + streak.phase) % 1;
      const envelope = MathUtils.smoothstep(phase, 0, 0.09) * (1 - MathUtils.smoothstep(phase, 0.48, 1));
      streak.mesh.position.x = -(3.8 + phase * 1.4);
      streak.mesh.position.y = streak.y;
      streak.mesh.scale.x = streak.width * (1 - phase * 0.3);
      streak.mesh.material.opacity = envelope * this.trailOpacity * 0.75;
      streak.mesh.material.color.copy(accent);
      streak.mesh.visible = envelope > 0.02;
    }
    this.deathEffect.visible = this.deathProgress !== null;
    if (this.deathProgress !== null) this.sampleDeath(this.deathProgress);
  }

  faceCamera(camera: Camera): void {
    this.group.getWorldQuaternion(this.inverseRoot).invert();
    camera.getWorldQuaternion(this.cameraRotation);
    this.model.quaternion.copy(this.inverseRoot).multiply(this.cameraRotation);
    this.cameraRotation.invert();
    // Keep the solid body aligned with the maze's world axes while details face the camera.
    this.body.quaternion.copy(this.cameraRotation);
    for (const echo of this.deathEchoes) echo.quaternion.copy(this.cameraRotation);
    this.model.getWorldPosition(this.viewCenter).applyMatrix4(camera.matrixWorldInverse);
    this.glitchCenter.value = this.viewCenter.y;
    // Project real ground movement into the same camera plane as the floating details.
    this.viewMotion.copy(this.motion).applyQuaternion(this.cameraRotation);
    this.trail.rotation.z = Math.atan2(this.viewMotion.y, this.viewMotion.x);
  }

  setMotion(x: number, y: number, amount: number): void {
    this.motion.set(x, 0, y);
    this.trailOpacity = MathUtils.clamp(amount, 0, 1);
  }

  setDeathProgress(progress: number | null): void {
    this.deathProgress = progress === null ? null : MathUtils.clamp(progress, 0, 1);
    if (this.deathProgress !== null) this.powerTransition.reset();
  }

  setPower(powered: boolean, warning = false, amount?: number): void {
    this.powered = powered;
    this.powerWarning = warning;
    this.powerAmount = amount;
  }

  setEnemyEatProgress(progress: number | null): void {
    this.enemyEatProgress = progress === null ? null : MathUtils.clamp(progress, 0, 1);
  }

  setFrame(frame: number): void {
    this.frame = MathUtils.clamp(frame, 0, 3);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const geometry of this.geometry) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.halo.dispose();
    this.group.clear();
  }

  private sampleDeath(progress: number): void {
    // Quantized, seeded jumps remain identical when paused or scrubbed in the asset inspector.
    const tick = Math.floor(progress * 24);
    const intensity = 0.3 + MathUtils.smoothstep(progress, 0, 0.75) * 0.7;
    const burst = progress > 0.04 && (progress < 0.34 || noise(tick + 1000) > 0.36 - progress * 0.2);
    const dropout = progress >= 0.94 || (progress > 0.35 && noise(tick + 1010) < 0.12 + progress * 0.12);
    this.glitchActive.value = burst ? 1 : 0;
    this.glitchPhase.value = Math.floor(noise(tick + 1020) * 4);
    this.model.position.x = burst ? (noise(tick + 1030) - 0.5) * intensity * 0.65 : 0;
    this.body.visible = !dropout;
    this.trail.visible = false;
    this.gaze.position.x += burst ? (noise(tick + 1040) - 0.5) * 0.55 : 0;
    for (const [index, eye] of this.eyes.entries()) {
      const height = noise(tick * 7 + index + 1050) < intensity * 0.4 ? 0.12 : 1;
      eye.mesh.scale.y = eye.height * height;
      this.eyeEdges[index].scale.y = 1.83 * height;
      if (eye.glow) eye.glow.material.opacity *= height * 0.5;
    }
    for (const [index, echo] of this.deathEchoes.entries()) {
      echo.visible = burst && !dropout;
      echo.position.x = (index === 0 ? -1 : 1) * (0.2 + noise(tick * 3 + index + 1060) * 1.2) * intensity;
    }
    for (const [index, digit] of this.digits.entries()) {
      const value = noise(tick * 31 + index * 17 + 1070) < 0.5 ? 0 : 1;
      digit.mesh.geometry = this.glyphs[value];
      digit.mesh.userData.glyph = String(value);
      digit.mesh.position.x += burst ? (noise(tick * 11 + index + 1080) - 0.5) * intensity * 0.9 : 0;
      digit.mesh.material.opacity *= dropout || noise(tick * 5 + index + 1090) < 0.25 ? 0 : 1;
    }
    for (const pixel of this.pixels) pixel.material.opacity *= dropout ? 0 : burst ? 1.25 : 0.4;
    const terminal = progress > 0.84;
    this.deathScanline.visible = progress < 0.98 && (terminal || (burst && !dropout));
    this.deathScanline.position.y = terminal ? 0 : 2.1 - noise(tick + 1100) * 4.2;
    this.deathScanline.scale.x = terminal ? 7 * (1 - MathUtils.smoothstep(progress, 0.84, 0.98)) : 4 + noise(tick + 1110) * 3;
    this.deathScanline.material.opacity = terminal ? 0.8 : 0.3;
  }

  private clipGlitchBands(material: Material, band: number): void {
    material.customProgramCacheKey = () => `packet-glitch-band-${band}`;
    material.onBeforeCompile = (shader) => {
      shader.uniforms.packetGlitchActive = this.glitchActive;
      shader.uniforms.packetGlitchPhase = this.glitchPhase;
      shader.uniforms.packetGlitchCenter = this.glitchCenter;
      shader.vertexShader = `varying float packetViewY;\n${shader.vertexShader}`.replace(
        '#include <project_vertex>', '#include <project_vertex>\npacketViewY = mvPosition.y;',
      );
      const discard = band < 0
        ? 'if (row < 1.0 || (row >= 2.0 && row < 3.0)) discard;'
        : `if (row < ${band.toFixed(1)} || row >= ${(band + 1).toFixed(1)}) discard;`;
      shader.fragmentShader = `
        uniform float packetGlitchActive;
        uniform float packetGlitchPhase;
        uniform float packetGlitchCenter;
        varying float packetViewY;
        ${shader.fragmentShader}
      `.replace('void main() {', `void main() {
        if (packetGlitchActive > 0.5) {
          float row = mod(floor((packetViewY - packetGlitchCenter) * 2.4) + packetGlitchPhase, 4.0);
          ${discard}
        }
      `);
    };
  }

  private ownGeometry<T extends BufferGeometry>(geometry: T): T {
    this.geometry.add(geometry);
    return geometry;
  }

  private material(name: string, color: number, opacity = 1, additive = false): MeshBasicMaterial {
    const material = new MeshBasicMaterial({ color, opacity, transparent: additive, depthWrite: !additive, toneMapped: false });
    material.name = name;
    if (additive) material.blending = AdditiveBlending;
    this.materials.add(material);
    return material;
  }

  private surface(name: string, color: number): MeshStandardMaterial {
    const material = new MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.08 });
    material.name = name;
    this.materials.add(material);
    return material;
  }

  private rect(name: string, x: number, y: number, z: number, width: number, height: number, color: number, opacity: number): Mesh<PlaneGeometry, MeshBasicMaterial> {
    const mesh = new Mesh(this.plane, this.material(name, color, opacity, true));
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.scale.set(width, height, 1);
    this.model.add(mesh);
    return mesh;
  }

  private glow(name: string, x: number, y: number, z: number, width: number, height: number, opacity: number): Mesh<PlaneGeometry, MeshBasicMaterial> {
    const mesh = this.rect(name, x, y, z, width, height, CYAN, opacity);
    mesh.material.map = this.halo;
    return mesh;
  }
}

function noise(index: number): number {
  const value = Math.sin(index * 127.1 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createHaloTexture(): DataTexture {
  const size = 48;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const radius = ((x + 0.5) / size * 2 - 1) ** 2 + ((y + 0.5) / size * 2 - 1) ** 2;
      const offset = (y * size + x) * 4;
      data[offset] = data[offset + 1] = data[offset + 2] = 255;
      data[offset + 3] = Math.round(Math.max(0, Math.exp(-radius * 5) - Math.exp(-5)) * 255);
    }
  }
  const texture = new DataTexture(data, size, size);
  texture.name = 'hologram-soft-glow';
  texture.magFilter = texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function createDigitGeometry(one: boolean): BufferGeometry {
  const rows = one ? ['010', '110', '010', '010', '111'] : ['111', '101', '101', '101', '111'];
  const vertices: number[] = [];
  const normals: number[] = [];
  for (const [row, cells] of rows.entries()) {
    for (let column = 0; column < 3; column += 1) {
      if (cells[column] !== '1') continue;
      const x = (column - 1.5) * 0.12;
      const y = (2.5 - row) * 0.12;
      vertices.push(x, y, 0, x, y - 0.12, 0, x + 0.12, y, 0, x + 0.12, y, 0, x, y - 0.12, 0, x + 0.12, y - 0.12, 0);
      for (let i = 0; i < 6; i += 1) normals.push(0, 0, 1);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  return geometry;
}

function createHunterEyeGeometry(side: number): BufferGeometry {
  const outer = side * 0.5;
  const inner = -outer;
  const vertices = [outer, 0.5, 0, outer, -0.5, 0, inner, 0.18, 0, inner, 0.18, 0, outer, -0.5, 0, inner, -0.5, 0];
  // Mirror the wedge while keeping its visible face toward the camera.
  if (side > 0) {
    for (let triangle = 0; triangle < 2; triangle += 1) {
      const offset = triangle * 9;
      for (let axis = 0; axis < 3; axis += 1) {
        [vertices[offset + 3 + axis], vertices[offset + 6 + axis]] = [vertices[offset + 6 + axis], vertices[offset + 3 + axis]];
      }
    }
  }
  const geometry = new BufferGeometry();
  const rectangle = vertices.map((value, index) => index % 3 === 1 && value > 0 ? 0.5 : value);
  geometry.setAttribute('position', new Float32BufferAttribute(rectangle, 3));
  geometry.morphAttributes.position = [new Float32BufferAttribute(vertices, 3)];
  geometry.computeVertexNormals();
  return geometry;
}
