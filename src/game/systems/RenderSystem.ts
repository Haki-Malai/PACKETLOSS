import {
  Color, DirectionalLight, Group, HemisphereLight, InstancedMesh, Matrix4,
  Mesh, MeshBasicMaterial, RingGeometry, Scene,
} from 'three';
import { Camera3D } from '../../engine/camera3d';
import { COLLECTIBLE_CONFIG, PACKET_PORTAL_BLINK } from '../../config/constants';
import { GhostEntity } from '../domain/entities/GhostEntity';
import { WorldState } from '../domain/world/WorldState';
import { ThreeRendererAdapter } from '../infrastructure/adapters/ThreeRendererAdapter';
import { ArcadeAssets } from '../infrastructure/three/ArcadeAssets';
import { CollisionDebugScene } from '../infrastructure/three/CollisionDebugScene';
import { MazeScene } from '../infrastructure/three/MazeScene';
import { CollectibleKind, CollectibleSystem, EatEffect } from './CollectibleSystem';
import { EntityPresentation } from './EntityPresentation';
import { resolveGhostAppearance } from './resolveGhostAppearance';

export class RenderSystem {
  readonly scene = new Scene();
  private readonly presentation: EntityPresentation;
  private readonly assets = new ArcadeAssets();
  private readonly maze: MazeScene;
  private readonly debug: CollisionDebugScene;
  private readonly packet: Group;
  private readonly ghosts = new Map<GhostEntity, Group>();
  private readonly points = new Map<CollectibleKind, InstancedMesh>();
  private readonly effects = new Map<EatEffect, Mesh<RingGeometry, MeshBasicMaterial>>();
  private readonly effectGeometry = new RingGeometry(0.7, 1, 24);
  private readonly pointMatrix = new Matrix4();
  private lastPointCount = -1;
  private destroyed = false;

  constructor(
    private readonly world: WorldState,
    private readonly renderer: Pick<ThreeRendererAdapter, 'render' | 'dispose' | 'pixelRatio'>,
    private readonly camera: Camera3D,
    private readonly collectibles: CollectibleSystem,
  ) {
    this.presentation = new EntityPresentation(world);
    this.scene.background = new Color('#02040b');
    this.scene.add(new HemisphereLight('#a7c5ff', '#160b30', 0.85));
    const key = new DirectionalLight('#c7dfff', 1.4);
    key.position.set(-150, 300, 100);
    this.scene.add(key);
    this.maze = new MazeScene(world);
    this.debug = new CollisionDebugScene(world);
    this.scene.add(this.maze.group, this.debug.group);

    this.packet = this.assets.createPacket();
    this.packet.name = 'packet';
    this.packet.add(this.assets.createContactShadow(world.packet.displayWidth));
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
  }

  render(alpha = 1): void {
    if (this.destroyed) return;
    this.camera.present(alpha, this.renderer.pixelRatio);
    const position = this.presentation.getPosition(this.world.packet, alpha);
    this.packet.position.set(position.x, 0, position.y);
    this.packet.rotation.y = -(this.world.packet.angle * Math.PI) / 180;
    this.packet.visible = this.isPacketVisible();
    this.assets.setPacketFrame(this.packet, this.world.packetAnimation.frame);

    this.ghosts.forEach((model, ghost) => {
      const position = this.presentation.getPosition(ghost, alpha);
      model.position.set(position.x, 0, position.y);
      this.assets.setGhostAppearance(model, resolveGhostAppearance(this.world, ghost),
        this.world.ghostAnimations.get(ghost)?.frame ?? 0, ghost.direction);
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
      const radius = COLLECTIBLE_CONFIG[point.kind === 'power' ? 1 : 0].size / 2;
      this.pointMatrix.makeScale(radius, radius, radius);
      this.pointMatrix.setPosition(point.x, radius + 0.12, point.y);
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
        mesh = new Mesh(this.effectGeometry, new MeshBasicMaterial({
          color: '#c8ba9c', transparent: true, depthWrite: false,
        }));
        mesh.name = 'pellet-effect';
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(effect.x, 0.08, effect.y);
        this.effects.set(effect, mesh);
        this.scene.add(mesh);
      }
      const progress = Math.min(1, effect.elapsedMs / effect.durationMs);
      const opacity = (1 - progress) * (1 - progress);
      const diameter = effect.sizeStart + (effect.sizeEnd - effect.sizeStart) * (1 - opacity);
      mesh.scale.setScalar(diameter / 2);
      mesh.material.opacity = opacity;
    }
  }

  private isPacketVisible(): boolean {
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
