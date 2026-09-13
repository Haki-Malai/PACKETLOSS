import {
  Group, InstancedMesh, Matrix4,
  Mesh, MeshBasicMaterial, RingGeometry, Scene,
} from 'three';
import { Camera3D } from '../../engine/camera3d';
import { clamp, lerp } from '../../engine/math';
import { PACKET_DEATH_ANIMATION, PACKET_PORTAL_BLINK } from '../../config/constants';
import { GhostEntity } from '../domain/entities/GhostEntity';
import { WorldState } from '../domain/world/WorldState';
import { ThreeRendererAdapter } from '../infrastructure/adapters/ThreeRendererAdapter';
import { ArcadeAssets } from '../infrastructure/three/ArcadeAssets';
import { CollisionDebugScene } from '../infrastructure/three/CollisionDebugScene';
import { MazeScene } from '../infrastructure/three/MazeScene';
import { createEatEffectGeometry, createEatEffectMesh, sampleEatEffect, setPointTransform } from '../infrastructure/three/PickupPresentation';
import { addGameplayLighting } from '../infrastructure/three/ScenePresentation';
import { CollectibleKind, CollectibleSystem, EatEffect } from './CollectibleSystem';
import { EntityPresentation } from './EntityPresentation';
import { resolveGhostAppearance } from './resolveGhostAppearance';

export class RenderSystem {
  readonly scene = new Scene();
  private readonly presentation: EntityPresentation;
  private readonly maze: MazeScene;
  private readonly debug: CollisionDebugScene;
  private readonly packet: Group;
  private readonly packetShadow: Mesh;
  private readonly ghosts = new Map<GhostEntity, Group>();
  private readonly points = new Map<CollectibleKind, InstancedMesh>();
  private readonly effects = new Map<EatEffect, Mesh<RingGeometry, MeshBasicMaterial>>();
  private readonly effectGeometry = createEatEffectGeometry();
  private readonly pointMatrix = new Matrix4();
  private lastPointCount = -1;
  private animationTime = 0;
  private previousAnimationTime = 0;
  private motionX = 0;
  private motionY = 0;
  private motionAmount = 0;
  private previousMotionAmount = 0;
  private previousDeathRemainingMs = 0;
  private destroyed = false;

  constructor(
    private readonly world: WorldState,
    private readonly renderer: Pick<ThreeRendererAdapter, 'render' | 'dispose' | 'pixelRatio'>,
    private readonly camera: Camera3D,
    private readonly collectibles: CollectibleSystem,
    private readonly assets: ArcadeAssets,
  ) {
    this.presentation = new EntityPresentation(world);
    addGameplayLighting(this.scene);
    this.maze = new MazeScene(world);
    this.debug = new CollisionDebugScene(world);
    this.scene.add(this.maze.group, this.debug.group);

    this.packet = this.assets.createPacket();
    this.packet.name = 'packet';
    this.packetShadow = this.assets.createContactShadow(world.packet.displayWidth);
    this.packet.add(this.packetShadow);
    this.scene.add(this.packet);
    for (const ghost of world.ghosts) {
      const model = this.assets.createGhost(ghost.key);
      model.name = 'ghost-' + ghost.key;
      model.add(this.assets.createContactShadow(ghost.displayWidth));
      this.ghosts.set(ghost, model);
      this.scene.add(model);
    }

    const initialPoints = Array.from(this.collectibles.getPoints());
    for (const kind of ['base', 'power'] as const) {
      const count = initialPoints.filter((point) => point.kind === kind).length;
      const material = kind === 'power' ? this.assets.powerPelletMaterial : this.assets.pelletMaterial;
      const points = new InstancedMesh(this.assets.pelletGeometry, material, count);
      points.name = 'pellets-' + kind;
      this.points.set(kind, points);
      this.scene.add(points);
    }
    this.syncPoints();
  }

  capturePreviousState(): void {
    this.presentation.capturePreviousState();
    this.previousAnimationTime = this.animationTime;
    this.previousMotionAmount = this.motionAmount;
    this.previousDeathRemainingMs = this.world.packet.deathAnimationRemainingMs;
  }

  update(deltaMs: number): void {
    if (this.destroyed || !this.world.isMoving) return;
    this.animationTime += deltaMs / 1000;
    const previous = this.presentation.getPosition(this.world.packet, 0);
    if (previous === this.world.packet || this.world.packet.deathAnimationRemainingMs > 0) {
      this.motionX = this.motionY = 0;
      this.motionAmount = this.previousMotionAmount = 0;
      return;
    }
    const x = this.world.packet.x - previous.x;
    const y = this.world.packet.y - previous.y;
    const distance = Math.hypot(x, y);
    if (distance > 0) {
      this.motionX = x / distance;
      this.motionY = y / distance;
      this.motionAmount = 1;
    } else {
      this.motionAmount = Math.max(0, this.motionAmount - deltaMs / 120);
    }
  }

  render(alpha = 1): void {
    if (this.destroyed) return;
    this.camera.present(alpha, this.renderer.pixelRatio);
    const animationAlpha = this.world.isMoving ? clamp(alpha, 0, 1) : 1;
    this.assets.setPacketFrame(this.packet, this.world.packetAnimation.frame);
    this.assets.setPacketMotion(this.packet, this.motionX, this.motionY,
      lerp(this.previousMotionAmount, this.motionAmount, animationAlpha));
    const remaining = this.world.packet.deathAnimationRemainingMs;
    const presentedRemaining = remaining > 0 && this.previousDeathRemainingMs > 0
      ? lerp(this.previousDeathRemainingMs, remaining, animationAlpha) : remaining;
    const deathProgress = remaining > 0 ? 1 - presentedRemaining / PACKET_DEATH_ANIMATION.durationMs : null;
    this.assets.setPacketDeathProgress(this.packet, deathProgress);
    this.packetShadow.visible = deathProgress === null || deathProgress < 0.94;
    this.assets.sampleAnimation(lerp(this.previousAnimationTime, this.animationTime, animationAlpha));
    const position = this.presentation.getPosition(this.world.packet, alpha);
    this.packet.position.set(position.x, 0, position.y);
    this.packet.rotation.y = -(this.world.packet.angle * Math.PI) / 180;
    this.assets.facePacket(this.packet, this.camera.camera);
    this.packet.visible = this.isPacketVisible();

    this.ghosts.forEach((model, ghost) => {
      const position = this.presentation.getPosition(ghost, alpha);
      model.position.set(position.x, 0, position.y);
      this.assets.setGhostAppearance(model, resolveGhostAppearance(this.world, ghost));
    });
    this.syncPoints();
    this.syncEffects();
    this.debug.sync();
    this.renderer.render(this.scene, this.camera.camera);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.maze.dispose();
    this.debug.dispose();
    this.points.forEach((mesh) => mesh.dispose());
    this.effects.forEach((mesh) => mesh.material.dispose());
    this.effects.clear();
    this.effectGeometry.dispose();
    this.assets.dispose();
    this.scene.clear();
    this.renderer.dispose();
  }

  private syncPoints(): void {
    const pointCount = this.collectibles.getPointCount();
    if (pointCount === this.lastPointCount) return;
    this.lastPointCount = pointCount;
    const counts = { base: 0, power: 0 };
    for (const point of this.collectibles.getPoints()) {
      const mesh = this.points.get(point.kind)!;
      setPointTransform(this.pointMatrix, point.kind, point.x, point.y);
      mesh.setMatrixAt(counts[point.kind], this.pointMatrix);
      counts[point.kind] += 1;
    }
    this.points.forEach((mesh, kind) => {
      mesh.count = counts[kind];
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }

  private syncEffects(): void {
    const active = this.collectibles.getEatEffects();
    this.effects.forEach((mesh, effect) => {
      if (!active.includes(effect)) {
        this.scene.remove(mesh);
        mesh.material.dispose();
        this.effects.delete(effect);
      }
    });
    for (const effect of active) {
      let mesh = this.effects.get(effect);
      if (!mesh) {
        mesh = createEatEffectMesh(this.effectGeometry, effect.x, effect.y);
        this.effects.set(effect, mesh);
        this.scene.add(mesh);
      }
      sampleEatEffect(mesh, effect);
    }
  }

  private isPacketVisible(): boolean {
    if (this.world.packet.deathAnimationRemainingMs > 0) return true;
    const deathRecoveryRemaining = this.world.packet.deathRecoveryRemainingMs ?? 0;
    if (deathRecoveryRemaining > 0) {
      return this.world.packet.deathRecoveryVisible ?? true;
    }

    const remaining = this.world.packet.portalBlinkRemainingMs ?? 0;
    if (remaining <= 0) {
      return true;
    }

    const elapsed = this.world.packet.portalBlinkElapsedMs ?? 0;
    const blinkPhase = Math.floor(elapsed / PACKET_PORTAL_BLINK.intervalMs);
    return blinkPhase % 2 === 0;
  }
}
