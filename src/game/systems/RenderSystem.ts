import {
  BufferGeometry, Group, InstancedMesh, Matrix4,
  Mesh, MeshBasicMaterial, Object3D, Scene,
} from 'three';
import { Camera3D } from '../../engine/camera3d';
import { IS_DEV } from '../../config/environment';
import { clamp, lerp } from '../../engine/math';
import { ENEMY_CONFIG, ENEMY_SCARED_WARNING_DURATION_MS, PACKET_DEATH_ANIMATION, PACKET_PORTAL_BLINK } from '../../config/constants';
import { EnemyEntity } from '../domain/entities/EnemyEntity';
import type { TilePosition } from '../domain/valueObjects/TilePosition';
import { SCORE_BONUS_TIERS, type ScoreBonusKind } from '../domain/valueObjects/ScoreBonus';
import { WorldState } from '../domain/world/WorldState';
import { ThreeRendererAdapter } from '../infrastructure/adapters/ThreeRendererAdapter';
import { ArcadeAssets } from '../infrastructure/three/ArcadeAssets';
import { CollisionDebugScene } from '../infrastructure/three/CollisionDebugScene';
import { EnemyEffects } from '../infrastructure/three/EnemyEffects';
import { EnemyEatPresentation } from '../infrastructure/three/EnemyEatPresentation';
import { MazeScene } from '../infrastructure/three/MazeScene';
import { QuarantineWalls } from '../infrastructure/three/QuarantineWalls';
import { TrojanDisguise } from '../infrastructure/three/TrojanDisguise';
import { createEatEffectMesh, sampleEatEffect, setPointTransform } from '../infrastructure/three/PickupPresentation';
import { addGameplayLighting } from '../infrastructure/three/ScenePresentation';
import { TutorialMarker } from '../infrastructure/three/TutorialMarker';
import { samplePickupPulse } from '../shared/pickupEffects';
import { ENEMY_EAT_DURATION_MS } from '../shared/enemyEating';
import { CollectibleKind, CollectibleSystem, EatEffect } from './CollectibleSystem';
import { EntityPresentation } from './EntityPresentation';
import { resolveEnemyAppearance } from './resolveEnemyAppearance';
import type { ScoreBonusSystem } from './ScoreBonusSystem';

export class RenderSystem {
  readonly scene = new Scene();
  private readonly presentation: EntityPresentation;
  private readonly maze: MazeScene;
  private readonly debug: CollisionDebugScene | undefined;
  private readonly packet: Group;
  private readonly packetShadow: Mesh;
  private readonly pickupTarget: Object3D;
  private readonly cancelledPickups = new WeakSet<EatEffect>();
  private readonly enemies = new Map<EnemyEntity, Group>();
  private readonly enemyEating = new Map<EnemyEntity, EnemyEatPresentation>();
  private readonly cancelledEnemyEating = new Set<EnemyEntity>();
  private readonly points = new Map<CollectibleKind, InstancedMesh>();
  private readonly effects = new Map<EatEffect, Mesh<BufferGeometry, MeshBasicMaterial>>();
  private readonly enemyEffects = new EnemyEffects();
  private readonly quarantineWalls: QuarantineWalls;
  private readonly trojans = new Map<EnemyEntity, TrojanDisguise>();
  private readonly tutorialMarker: TutorialMarker | undefined;
  private readonly pointMatrix = new Matrix4();
  private readonly powerPoints: Array<{ x: number; y: number }> = [];
  private readonly bonusModels = new Map<ScoreBonusKind, Group>();
  private visibleBonus: Group | null = null;
  private lastPointCount = -1;
  private animationTime = 0;
  private previousAnimationTime = 0;
  private motionX = 0;
  private motionY = 0;
  private motionAmount = 0;
  private previousMotionAmount = 0;
  private previousDeathRemainingMs = 0;
  private previousEnemyEatRemainingMs = 0;
  private destroyed = false;

  /** Creates scene resources, allocating collision inspection geometry only in development. */
  constructor(
    private readonly world: WorldState,
    private readonly renderer: Pick<ThreeRendererAdapter, 'render' | 'dispose' | 'pixelRatio'>,
    private readonly camera: Camera3D,
    private readonly collectibles: CollectibleSystem,
    private readonly assets: ArcadeAssets,
    private readonly getTutorialMarkers?: () => readonly Readonly<TilePosition>[],
    private readonly scoreBonuses?: ScoreBonusSystem,
  ) {
    this.presentation = new EntityPresentation(world);
    addGameplayLighting(this.scene);
    this.maze = new MazeScene(world);
    this.quarantineWalls = new QuarantineWalls(world.tileSize);
    this.debug = IS_DEV ? new CollisionDebugScene(world) : undefined;
    this.scene.add(this.maze.group, this.enemyEffects.group, this.quarantineWalls.group);
    if (this.debug) this.scene.add(this.debug.group);
    if (getTutorialMarkers) {
      this.tutorialMarker = new TutorialMarker(world.tileSize);
      this.tutorialMarker.sync(getTutorialMarkers());
      this.scene.add(this.tutorialMarker.group);
    }

    this.packet = this.assets.createPacket();
    this.pickupTarget = this.packet.getObjectByName('pickup-target')!;
    this.packet.name = 'packet';
    this.packetShadow = this.assets.createContactShadow(world.packet.displayWidth);
    this.packet.add(this.packetShadow);
    this.scene.add(this.packet);
    for (const enemy of world.enemies) {
      const model = this.assets.createEnemy(enemy.key);
      model.name = 'enemy-' + enemy.key;
      model.visible = enemy.active;
      model.getObjectByName('character-model')!.scale.setScalar(enemy.isCopy ? ENEMY_CONFIG.spam.copyScale : 1);
      model.add(this.assets.createContactShadow(enemy.displayWidth));
      if (enemy.key === 'trojan') this.trojans.set(enemy, new TrojanDisguise(model, assets));
      this.enemies.set(enemy, model);
      this.scene.add(model);
    }

    const initialPoints = Array.from(this.collectibles.getPoints());
    for (const kind of ['base', 'power'] as const) {
      const count = initialPoints.filter((point) => point.kind === kind).length;
      const material = kind === 'power' ? this.assets.powerPelletMaterial : this.assets.pelletMaterial;
      const geometry = kind === 'power' ? this.assets.powerPelletGeometry : this.assets.pelletGeometry;
      const points = new InstancedMesh(geometry, material, count);
      points.name = 'pellets-' + kind;
      this.points.set(kind, points);
      this.scene.add(points);
    }
    this.syncPoints();
    if (this.scoreBonuses) {
      for (const { kind } of SCORE_BONUS_TIERS) {
        const model = this.assets.createScoreBonus(kind);
        if (!model) continue;
        model.name = `score-bonus-${kind}`;
        model.scale.setScalar(2.2);
        model.visible = false;
        this.bonusModels.set(kind, model);
        this.scene.add(model);
      }
    }
  }

  capturePreviousState(): void {
    this.presentation.capturePreviousState();
    this.previousAnimationTime = this.animationTime;
    this.previousMotionAmount = this.motionAmount;
    this.previousDeathRemainingMs = this.world.packet.deathAnimationRemainingMs;
    this.previousEnemyEatRemainingMs = this.world.packet.enemyEatRemainingMs;
  }

  /** Advances presentation time and records the latest bounded simulation position. */
  update(deltaMs: number): void {
    if (this.destroyed || !this.world.isMoving) return;
    this.animationTime += deltaMs / 1000;
    this.presentation.recordCurrentState(deltaMs);
    const previous = this.presentation.getPosition(this.world.packet, 0);
    if (previous === this.world.packet || this.world.packet.deathAnimationRemainingMs > 0) {
      // Collection runs later in this tick, so fresh destination stars survive a reset.
      for (const effect of this.collectibles.getEatEffects()) this.cancelledPickups.add(effect);
      for (const enemy of this.world.enemies) {
        if (enemy.eatenElapsedMs !== null && enemy.eatenElapsedMs > 0) this.cancelledEnemyEating.add(enemy);
      }
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

  /** Presents interpolated gameplay and optional development diagnostics without advancing simulation. */
  render(alpha = 1): void {
    if (this.destroyed) return;
    this.camera.present(alpha, this.renderer.pixelRatio);
    const animationAlpha = this.world.isMoving ? clamp(alpha, 0, 1) : 1;
    const activePickups = this.collectibles.getEatEffects();
    if (this.world.packet.deathAnimationRemainingMs > 0) {
      for (const effect of activePickups) this.cancelledPickups.add(effect);
    }
    let pickupPulse = 0;
    for (const effect of activePickups) {
      if (!this.cancelledPickups.has(effect)) pickupPulse = Math.max(pickupPulse, samplePickupPulse(effect.elapsedMs));
    }
    this.assets.setPacketFrame(this.packet, pickupPulse * 3);
    this.assets.setPacketMotion(this.packet, this.motionX, this.motionY,
      lerp(this.previousMotionAmount, this.motionAmount, animationAlpha));
    const remaining = this.world.packet.deathAnimationRemainingMs;
    const presentedRemaining = remaining > 0 && this.previousDeathRemainingMs > 0
      ? lerp(this.previousDeathRemainingMs, remaining, animationAlpha) : remaining;
    const deathProgress = this.world.outcome === 'lost' ? 1
      : remaining > 0 ? 1 - presentedRemaining / PACKET_DEATH_ANIMATION.durationMs : null;
    this.assets.setPacketDeathProgress(this.packet, deathProgress);
    const edibleEnemies = this.world.enemies.filter((enemy) => enemy.active && !enemy.state.dead && enemy.state.scared);
    const powerRemaining = Math.max(0, ...edibleEnemies.map((enemy) => this.world.enemyScaredTimers.get(enemy) ?? Infinity));
    this.assets.setPacketPower(this.packet, edibleEnemies.length > 0,
      powerRemaining > 0 && powerRemaining <= ENEMY_SCARED_WARNING_DURATION_MS);
    const eatRemaining = this.world.packet.enemyEatRemainingMs;
    const presentedEatRemaining = eatRemaining > 0 && this.previousEnemyEatRemainingMs > 0
      ? lerp(this.previousEnemyEatRemainingMs, eatRemaining, animationAlpha) : eatRemaining;
    this.assets.setPacketEnemyEatProgress(this.packet,
      deathProgress === null && eatRemaining > 0 ? 1 - presentedEatRemaining / ENEMY_EAT_DURATION_MS : null);
    this.packetShadow.visible = deathProgress === null || deathProgress < 0.94;
    const position = this.presentation.getPosition(this.world.packet, alpha);
    this.packet.position.set(position.x, 0, position.y);
    this.packet.rotation.y = -(this.world.packet.angle * Math.PI) / 180;
    this.packet.visible = this.isPacketVisible();

    this.enemies.forEach((model, enemy) => {
      model.visible = enemy.active;
      if (!enemy.active) {
        this.assets.setEnemyAppearance(model, enemy.key, false, 0);
        this.assets.setEnemyReturnProgress(model, null, true);
        return;
      }
      const position = this.presentation.getPosition(enemy, alpha);
      model.position.set(position.x, 0, position.y);
      const collapsing = enemy.state.dead && enemy.eatenElapsedMs !== null && enemy.eatenElapsedMs < ENEMY_EAT_DURATION_MS;
      this.assets.setEnemyAppearance(model, collapsing ? 'scared' : resolveEnemyAppearance(this.world, enemy), collapsing || enemy.state.scared);
      this.assets.setEnemyReturnProgress(model,
        enemy.state.dead ? Math.min(1, (enemy.eatenElapsedMs ?? ENEMY_EAT_DURATION_MS) / ENEMY_EAT_DURATION_MS) : null);
      this.trojans.get(enemy)?.sync(enemy.disguised, enemy.revealRemainingMs, enemy.disguiseRemainingMs);
    });
    const presentationTime = lerp(this.previousAnimationTime, this.animationTime, animationAlpha);
    this.assets.sampleAnimation(presentationTime);
    this.assets.facePacket(this.packet, this.camera.camera);
    this.syncPoints(presentationTime);
    this.syncScoreBonus(presentationTime);
    this.syncEffects();
    this.syncEnemyEating();
    this.enemyEffects.sync(this.world.enemyEffects, this.world.lagZones);
    this.maze.syncQuarantineWalls(this.world.quarantineWalls);
    this.quarantineWalls.sync(this.world.quarantineWalls);
    this.tutorialMarker?.sync(this.getTutorialMarkers?.() ?? []);
    this.debug?.sync();
    this.renderer.render(this.scene, this.camera.camera);
  }

  /** Releases scene, diagnostic, asset, and renderer resources once when the run is disposed. */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.maze.dispose();
    this.debug?.dispose();
    this.points.forEach((mesh) => mesh.dispose());
    this.bonusModels.clear();
    this.effects.forEach((mesh) => mesh.material.dispose());
    this.effects.clear();
    this.enemyEating.forEach((effect) => effect.dispose());
    this.enemyEating.clear();
    this.cancelledEnemyEating.clear();
    this.enemyEffects.dispose();
    this.quarantineWalls.dispose();
    this.trojans.clear();
    this.tutorialMarker?.dispose();
    this.assets.dispose();
    this.scene.clear();
    this.renderer.dispose();
  }

  private syncPoints(timeSeconds = 0): void {
    const pointCount = this.collectibles.getPointCount();
    const power = this.points.get('power')!;
    if (pointCount !== this.lastPointCount) {
      this.lastPointCount = pointCount;
      this.powerPoints.length = 0;
      const base = this.points.get('base')!;
      base.count = 0;
      for (const point of this.collectibles.getPoints()) {
        if (point.kind === 'power') {
          this.powerPoints.push(point);
        } else {
          setPointTransform(this.pointMatrix, point.kind, point.x, point.y);
          base.setMatrixAt(base.count++, this.pointMatrix);
        }
      }
      base.instanceMatrix.needsUpdate = true;
      base.computeBoundingSphere();
      power.count = this.powerPoints.length;
    }
    this.powerPoints.forEach((point, index) => {
      setPointTransform(this.pointMatrix, 'power', point.x, point.y, timeSeconds);
      power.setMatrixAt(index, this.pointMatrix);
    });
    power.instanceMatrix.needsUpdate = true;
    power.computeBoundingSphere();
  }

  /** Shows the one available authored pickup using its model prepared at startup. */
  private syncScoreBonus(timeSeconds: number): void {
    const pickup = this.scoreBonuses?.getPickup();
    if (!pickup) {
      if (this.visibleBonus) this.visibleBonus.visible = false;
      this.visibleBonus = null;
      return;
    }
    const model = this.bonusModels.get(pickup.kind);
    if (!model) return;
    if (this.visibleBonus && this.visibleBonus !== model) this.visibleBonus.visible = false;
    this.visibleBonus = model;
    model.visible = true;
    model.position.set(pickup.x, 1.6 + Math.sin(timeSeconds * 3) * 0.25, pickup.y);
    model.rotation.y = timeSeconds * 1.1;
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
      if (this.cancelledPickups.has(effect)) {
        if (mesh) mesh.visible = false;
        continue;
      }
      if (!mesh) {
        const geometry = effect.kind === 'power' ? this.assets.powerPelletGeometry : this.assets.pelletGeometry;
        mesh = createEatEffectMesh(geometry, effect.x, effect.y);
        this.effects.set(effect, mesh);
        this.scene.add(mesh);
      }
      sampleEatEffect(mesh, effect, this.pickupTarget, this.animationTime - effect.elapsedMs / 1000);
    }
  }

  private syncEnemyEating(): void {
    for (const [enemy, model] of this.enemies) {
      const elapsed = enemy.eatenElapsedMs;
      const active = enemy.active && enemy.state.dead && elapsed !== null && elapsed < ENEMY_EAT_DURATION_MS;
      let effect = this.enemyEating.get(enemy);
      if (!active) {
        if (effect) {
          this.scene.remove(effect.group);
          effect.dispose();
          this.enemyEating.delete(enemy);
        }
        this.cancelledEnemyEating.delete(enemy);
        continue;
      }
      if (this.world.packet.deathAnimationRemainingMs > 0) this.cancelledEnemyEating.add(enemy);
      if (this.cancelledEnemyEating.has(enemy)) {
        if (effect) effect.group.visible = false;
        continue;
      }
      if (!effect) {
        effect = new EnemyEatPresentation();
        this.enemyEating.set(enemy, effect);
        this.scene.add(effect.group);
      }
      effect.sample(model, this.pickupTarget, elapsed / ENEMY_EAT_DURATION_MS);
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
