import {
  Box3, BufferGeometry, Camera, Float32BufferAttribute, Group, LineBasicMaterial, LineSegments,
  MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Scene, Vector3,
} from 'three';
import {
  ENEMY_CONFIG, ENEMY_SCARED_WARNING_DURATION_MS, PACKET_DEATH_ANIMATION, PACKET_DEATH_RECOVERY, PACKET_PORTAL_BLINK,
  SPRITE_SIZE, TILE_SIZE,
} from '../../config/constants';
import type { EnemyKey } from '../../game/domain/entities/EnemyEntity';
import { createEmptyCollisionTile } from '../../game/domain/world/CollisionGrid';
import type { EnemyEffect, LagZone, WorldMapData } from '../../game/domain/world/WorldState';
import { ArcadeAssets } from '../../game/infrastructure/three/ArcadeAssets';
import { EnemyEffects } from '../../game/infrastructure/three/EnemyEffects';
import { EnemyEatPresentation } from '../../game/infrastructure/three/EnemyEatPresentation';
import { WALL_HEIGHT } from '../../game/infrastructure/three/MazeGeometry';
import { MazeScene } from '../../game/infrastructure/three/MazeScene';
import {
  createEatEffectMesh, sampleEatEffect, setPointTransform,
} from '../../game/infrastructure/three/PickupPresentation';
import { addGameplayLighting, createMazeFloorMaterial } from '../../game/infrastructure/three/ScenePresentation';
import { resolveNextBlinkToggleAt } from '../../game/shared/blinkCadence';
import { createEatEffect, samplePickupPulse, type CollectibleKind } from '../../game/shared/pickupEffects';
import { ENEMY_EAT_DURATION_MS } from '../../game/shared/enemyEating';
import { ASSET_CATALOG, ENEMY_IDENTITIES, type AssetPreviewEntry } from './assetCatalog';

export interface AssetPreviewTransform {
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

interface PreviewTile {
  id: number;
  rotation?: number;
  flipX?: boolean;
  flipY?: boolean;
}

type TileCell = number | PreviewTile | null;
const CENTER = 128;
const NO_TRANSFORM: AssetPreviewTransform = { rotation: 0, flipX: false, flipY: false };
const MOVEMENT: Readonly<Record<string, readonly [number, number]>> = {
  'player-move-up': [0, -1], 'player-move-down': [0, 1],
  'player-move-left': [-1, 0], 'player-move-right': [1, 0],
};

/** One reusable inspection scene; its injected character assets belong to the caller. */
export class AssetPreviewScene {
  readonly scene = new Scene();
  readonly bounds = new Box3();
  private readonly packet: Group;
  private readonly packetShadow: Mesh;
  private readonly enemies = new Map<EnemyKey, Group>();
  private readonly spamCopies: Group[] = [];
  private readonly enemyEffects = new EnemyEffects();
  private readonly points = new Map<CollectibleKind, Mesh<BufferGeometry, MeshStandardMaterial>>();
  private readonly shadow: Mesh;
  private readonly floor = new Mesh(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2), createMazeFloorMaterial());
  private readonly guide = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ color: 0x334e66, transparent: true, opacity: 0.6 }));
  private effect: Mesh<BufferGeometry, MeshBasicMaterial> | undefined;
  private enemyEating: EnemyEatPresentation | undefined;
  private maze: MazeScene | undefined;
  private entry = ASSET_CATALOG[0];
  private disposed = false;

  constructor(private readonly assets: ArcadeAssets) {
    try {
      addGameplayLighting(this.scene);
      this.floor.name = 'preview-floor';
      this.floor.position.set(CENTER, -0.06, CENTER);
      this.guide.name = 'tile-guide';
      this.guide.position.set(CENTER, 0.01, CENTER);
      const edge = TILE_SIZE / 2;
      this.guide.geometry.setAttribute('position', new Float32BufferAttribute([
        -edge, 0, -edge, edge, 0, -edge, edge, 0, -edge, edge, 0, edge,
        edge, 0, edge, -edge, 0, edge, -edge, 0, edge, -edge, 0, -edge,
      ], 3));
      this.guide.visible = false;
      this.scene.add(this.floor, this.guide, this.enemyEffects.group);

      this.packet = assets.createPacket();
      this.packet.position.set(CENTER, 0, CENTER);
      this.packetShadow = assets.createContactShadow(SPRITE_SIZE.packet);
      this.packet.add(this.packetShadow);
      this.scene.add(this.packet);
      for (const key of ENEMY_IDENTITIES) {
        const enemy = assets.createEnemy(key);
        enemy.name = `enemy-${key}`;
        enemy.position.set(CENTER, 0, CENTER);
        enemy.add(assets.createContactShadow(SPRITE_SIZE.enemy));
        this.enemies.set(key, enemy);
        this.scene.add(enemy);
      }
      for (let index = 0; index < ENEMY_CONFIG.spam.maxCount - 1; index += 1) {
        const copy = assets.createEnemy('spam');
        copy.name = `enemy-spam-copy-${index}`;
        copy.getObjectByName('character-model')!.scale.setScalar(ENEMY_CONFIG.spam.copyScale);
        copy.add(assets.createContactShadow(SPRITE_SIZE.enemy * ENEMY_CONFIG.spam.copyScale));
        this.spamCopies.push(copy);
        this.scene.add(copy);
      }
      for (const kind of ['base', 'power'] as const) {
        const mesh = new Mesh(kind === 'base' ? assets.pelletGeometry : assets.powerPelletGeometry,
          kind === 'base' ? assets.pelletMaterial : assets.powerPelletMaterial);
        mesh.name = `point-${kind}`;
        mesh.matrixAutoUpdate = false;
        setPointTransform(mesh.matrix, kind, CENTER, CENTER);
        this.points.set(kind, mesh);
        this.scene.add(mesh);
      }
      this.shadow = assets.createContactShadow(SPRITE_SIZE.packet);
      this.shadow.position.set(CENTER, 0.035, CENTER);
      this.scene.add(this.shadow);
      this.select(this.entry);
    } catch (error) {
      this.disposeOwnedResources();
      throw error;
    }
  }

  select(entry: AssetPreviewEntry, transform: AssetPreviewTransform = NO_TRANSFORM): void {
    if (this.disposed) return;
    if (!ASSET_CATALOG.some((candidate) => candidate.id === entry.id)) throw new Error(`Unknown preview asset: ${entry.id}`);
    this.clearSelection();
    this.entry = entry;
    this.setBounds(18, 18, 15);
    if (entry.category === 'Player' || entry.id.startsWith('effect-')) {
      this.packet.visible = true;
      if (entry.id === 'player-death') this.setBounds(24, 24, 19);
      if (entry.id === 'player-eating' || entry.id.startsWith('effect-')) {
        this.effect = createEatEffectMesh(this.pointKind() === 'power' ? this.assets.powerPelletGeometry : this.assets.pelletGeometry, CENTER, CENTER);
        this.scene.add(this.effect);
      }
    } else if (entry.category === 'Enemies') {
      this.enemies.get(this.enemyKey())!.visible = true;
      if (entry.id.endsWith('-patrol') || entry.id.endsWith('-lag')) this.setBounds(52, 52, 15);
      if (entry.id.endsWith('-chase')) this.setBounds(64, 48, 15);
      if (entry.id.endsWith('-split')) this.setBounds(50, 50, 15);
      if (entry.id === 'enemy-ping-ping') {
        const diameter = ENEMY_CONFIG.ping.rangeTiles * TILE_SIZE * 2 + 4;
        this.setBounds(diameter, diameter, 15);
      }
    } else if (entry.id.startsWith('point-')) {
      this.points.get(this.pointKind())!.visible = true;
      this.setBounds(8, 8, 5);
    } else if (entry.id === 'other-shadow') {
      this.shadow.visible = true;
      this.setBounds(14, 14, 2);
    } else {
      const map = buildPreviewMap(entry.id, transform);
      this.maze = new MazeScene({ map });
      this.maze.group.position.set(CENTER - map.widthInPixels / 2, 0, CENTER - map.heightInPixels / 2);
      this.scene.add(this.maze.group);
      this.setBounds(map.widthInPixels + 2, map.heightInPixels + 2, entry.id === 'other-floor' ? 1 : WALL_HEIGHT + 1);
    }
    if (entry.id === 'player-enemy-eating' || entry.id.endsWith('-eaten')) {
      const enemy = this.enemies.get(entry.id === 'player-enemy-eating' ? 'virus' : this.enemyKey())!;
      enemy.visible = true;
      enemy.position.x = CENTER + 7;
      this.packet.position.x = CENTER - 4;
      this.packet.visible = true;
      this.enemyEating = new EnemyEatPresentation();
      this.scene.add(this.enemyEating.group);
      this.setBounds(30, 24, 15);
    } else if (entry.id.endsWith('-returning')) {
      this.maze = new MazeScene({ map: buildPreviewMap('other-prison', NO_TRANSFORM) });
      this.maze.group.position.set(CENTER + 8, 0, CENTER + 8);
      this.scene.add(this.maze.group);
      this.setBounds(54, 54, 15);
    }
    this.updateStage();
  }

  sample(timeMs: number, camera: Camera): void {
    if (this.disposed) return;
    const duration = this.entry.durationMs;
    const elapsed = Math.min(duration, Math.max(0, timeMs));
    const id = this.entry.id;
    if (id === 'point-power') {
      const powerPoint = this.points.get('power')!;
      setPointTransform(powerPoint.matrix, 'power', CENTER, CENTER, elapsed / 1000);
      powerPoint.matrixWorldNeedsUpdate = true;
    }
    let deathProgress: number | null = null;
    let visible = true;
    if (id === 'player-death') {
      if (elapsed < PACKET_DEATH_ANIMATION.durationMs) deathProgress = elapsed / PACKET_DEATH_ANIMATION.durationMs;
      else visible = blinkAt(elapsed - PACKET_DEATH_ANIMATION.durationMs, PACKET_DEATH_RECOVERY.durationMs, true);
    } else if (id === 'player-recovery') {
      visible = blinkAt(elapsed, PACKET_DEATH_RECOVERY.durationMs, true);
    } else if (id === 'player-portal') {
      visible = elapsed >= PACKET_PORTAL_BLINK.durationMs || Math.floor(elapsed / PACKET_PORTAL_BLINK.intervalMs) % 2 === 0;
    }
    const movement = MOVEMENT[id];
    this.packet.rotation.y = movement ? -Math.atan2(movement[1], movement[0]) : 0;
    const eatingFrame = this.effect ? samplePickupPulse(elapsed) * 3 : 0;
    this.assets.setPacketFrame(this.packet, eatingFrame);
    this.assets.setPacketMotion(this.packet, movement?.[0] ?? 0, movement?.[1] ?? 0, movement ? 1 : 0);
    this.assets.setPacketDeathProgress(this.packet, deathProgress);
    const powerAmount = id === 'player-powered'
      ? MathUtils.smootherstep(elapsed, 0, 320) * (1 - MathUtils.smootherstep(elapsed, duration - 320, duration))
      : id === 'player-power-warning' || this.enemyEating !== undefined ? 1 : 0;
    this.assets.setPacketPower(this.packet,
      id === 'player-powered' || id === 'player-power-warning' || this.enemyEating !== undefined,
      id === 'player-power-warning', powerAmount);
    this.assets.setPacketEnemyEatProgress(this.packet,
      this.enemyEating && elapsed < ENEMY_EAT_DURATION_MS ? elapsed / ENEMY_EAT_DURATION_MS : null);
    this.packet.visible = (this.entry.category === 'Player' || this.effect !== undefined || this.enemyEating !== undefined) && visible;
    this.packetShadow.visible = deathProgress === null || deathProgress < 0.94;

    if (this.entry.category === 'Enemies') {
      const key = this.enemyKey();
      const scared = id.endsWith('-scared') || (id.endsWith('-warning') && !blinkAt(elapsed, ENEMY_SCARED_WARNING_DURATION_MS, false));
      const scaredExpression = id.endsWith('-scared') || id.endsWith('-warning');
      const scaredAmount = id.endsWith('-scared')
        ? MathUtils.smootherstep(elapsed, 0, 240) * (1 - MathUtils.smootherstep(elapsed, duration - 320, duration))
        : scaredExpression ? 1 : 0;
      this.assets.setEnemyAppearance(this.enemies.get(key)!, scared ? 'scared' : key, scaredExpression, scaredAmount);
      this.sampleEnemyDemo(elapsed);
      if (id.endsWith('-returning')) {
        const enemy = this.enemies.get(key)!;
        const distance = Math.min(64, elapsed * 64 / 1400);
        enemy.position.set(CENTER - 16 + Math.min(32, distance), 0, CENTER - 16 + Math.max(0, distance - 32));
        this.assets.setEnemyReturnProgress(enemy, elapsed < 1680 ? 1 - MathUtils.smootherstep(elapsed, 1400, 1680) : null, true);
      }
    }
    if (this.enemyEating) {
      const enemy = this.enemies.get(id === 'player-enemy-eating' ? 'virus' : this.enemyKey())!;
      this.assets.setEnemyAppearance(enemy, 'scared', true, 1);
      this.assets.setEnemyReturnProgress(enemy, Math.min(1, elapsed / ENEMY_EAT_DURATION_MS), true);
    }
    this.assets.sampleAnimation(elapsed / 1000);
    this.assets.facePacket(this.packet, camera);
    if (this.enemyEating) {
      this.enemyEating.sample(this.enemies.get(id === 'player-enemy-eating' ? 'virus' : this.enemyKey())!,
        this.packet.getObjectByName('pickup-target')!, elapsed / ENEMY_EAT_DURATION_MS);
    }
    if (this.effect) {
      const effect = createEatEffect(this.pointKind(), CENTER, CENTER);
      effect.elapsedMs = elapsed;
      sampleEatEffect(this.effect, effect, this.packet.getObjectByName('pickup-target')!);
    }
  }

  setTileGuide(visible: boolean): void {
    this.guide.visible = visible;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.clearSelection();
    this.disposeOwnedResources();
  }

  private disposeOwnedResources(): void {
    this.effect?.material.dispose();
    this.enemyEating?.dispose();
    this.maze?.dispose();
    this.enemyEffects.dispose();
    this.floor.geometry.dispose();
    this.floor.material.dispose();
    this.guide.geometry.dispose();
    this.guide.material.dispose();
    this.scene.clear();
  }

  private clearSelection(): void {
    this.packet.visible = false;
    this.packetShadow.visible = true;
    this.packet.rotation.set(0, 0, 0);
    this.packet.position.set(CENTER, 0, CENTER);
    this.assets.setPacketFrame(this.packet, 0);
    this.assets.setPacketMotion(this.packet, 0, 0, 0);
    this.assets.setPacketDeathProgress(this.packet, null);
    this.assets.setPacketPower(this.packet, false, false, 0);
    this.assets.setPacketEnemyEatProgress(this.packet, null);
    for (const [key, enemy] of this.enemies) {
      enemy.visible = false;
      enemy.position.set(CENTER, 0, CENTER);
      this.assets.setEnemyAppearance(enemy, key, false, 0);
      this.assets.setEnemyReturnProgress(enemy, null, true);
    }
    for (const copy of this.spamCopies) {
      copy.visible = false;
      this.assets.setEnemyAppearance(copy, 'spam', false, 0);
    }
    this.enemyEffects.sync([], []);
    this.points.forEach((point) => { point.visible = false; });
    this.shadow.visible = false;
    if (this.enemyEating) {
      this.scene.remove(this.enemyEating.group);
      this.enemyEating.dispose();
      this.enemyEating = undefined;
    }
    if (this.effect) {
      this.scene.remove(this.effect);
      this.effect.material.dispose();
      this.effect = undefined;
    }
    if (this.maze) {
      this.scene.remove(this.maze.group);
      this.maze.dispose();
      this.maze = undefined;
    }
    this.assets.sampleAnimation(0);
  }

  private sampleEnemyDemo(elapsed: number): void {
    const id = this.entry.id;
    const enemy = this.enemies.get(this.enemyKey())!;
    const effects: EnemyEffect[] = [];
    const zones: LagZone[] = [];
    if (id === 'enemy-firewall-patrol' || id === 'enemy-lag-lag') {
      const speed = id === 'enemy-lag-lag' ? ENEMY_CONFIG.lag.speed : ENEMY_CONFIG.firewall.speed;
      const position = patrolAt(elapsed, speed);
      enemy.position.set(position.x, 0, position.y);
    } else if (id === 'enemy-virus-chase') {
      // An authored open-corridor route illustrates pursuit without running game AI in the inspector.
      const distance = elapsed * 60 * ENEMY_CONFIG.virus.speed / 1000;
      enemy.position.set(CENTER - 24 + Math.min(48, distance), 0, CENTER - 16 + Math.min(32, Math.max(0, distance - 48)));
      this.packet.position.set(CENTER + 24, 0, CENTER + 16);
      this.packet.visible = true;
    } else if (id === 'enemy-ping-ping') {
      const target = { x: CENTER + TILE_SIZE * 3, y: CENTER };
      effects.push({ kind: 'ping', x: CENTER, y: CENTER, target,
        radius: ENEMY_CONFIG.ping.rangeTiles * TILE_SIZE, ageMs: elapsed, durationMs: ENEMY_CONFIG.ping.pulseDurationMs });
      enemy.position.set(CENTER + Math.min(TILE_SIZE * 3, elapsed * 60 * ENEMY_CONFIG.ping.speed / 1000), 0, CENTER);
      this.packet.position.set(target.x, 0, target.y + Math.min(TILE_SIZE * 3, elapsed * 0.03));
      this.packet.visible = true;
    } else if (id === 'enemy-spam-split') {
      const count = Math.min(this.spamCopies.length, Math.floor(elapsed / ENEMY_CONFIG.spam.splitIntervalMs));
      const offsets = [[-TILE_SIZE, 0], [TILE_SIZE, 0], [0, TILE_SIZE]];
      this.spamCopies.forEach((copy, index) => {
        copy.visible = index < count;
        copy.position.set(CENTER + offsets[index][0], 0, CENTER + offsets[index][1]);
      });
      if (count > 0) effects.push({ kind: 'split', x: CENTER, y: CENTER, radius: TILE_SIZE,
        ageMs: elapsed - count * ENEMY_CONFIG.spam.splitIntervalMs, durationMs: ENEMY_CONFIG.spam.splitEffectDurationMs });
    }
    if (id === 'enemy-lag-lag') {
      const lastDrop = Math.floor(elapsed / ENEMY_CONFIG.lag.dropIntervalMs);
      for (let drop = Math.max(1, lastDrop - ENEMY_CONFIG.lag.maxZones + 1); drop <= lastDrop; drop += 1) {
        const bornAt = drop * ENEMY_CONFIG.lag.dropIntervalMs;
        const position = patrolAt(bornAt, ENEMY_CONFIG.lag.speed);
        const tile = { x: Math.round((position.x - CENTER) / TILE_SIZE), y: Math.round((position.y - CENTER) / TILE_SIZE) };
        zones.push({ tile, x: CENTER + tile.x * TILE_SIZE, y: CENTER + tile.y * TILE_SIZE,
          radius: TILE_SIZE * ENEMY_CONFIG.lag.radiusTiles, ageMs: elapsed - bornAt, durationMs: ENEMY_CONFIG.lag.zoneDurationMs });
      }
    }
    this.enemyEffects.sync(effects, zones);
  }

  private enemyKey(): EnemyKey {
    return ENEMY_IDENTITIES.find((key) => this.entry.id.startsWith(`enemy-${key}-`))!;
  }

  private pointKind(): CollectibleKind {
    return this.entry.id.endsWith('-power') ? 'power' : 'base';
  }

  private setBounds(width: number, depth: number, height: number): void {
    this.bounds.set(new Vector3(CENTER - width / 2, -0.1, CENTER - depth / 2), new Vector3(CENTER + width / 2, height, CENTER + depth / 2));
  }

  private updateStage(): void {
    const width = Math.max(TILE_SIZE * 2, Math.ceil((this.bounds.max.x - this.bounds.min.x) / TILE_SIZE) * TILE_SIZE);
    const depth = Math.max(TILE_SIZE * 2, Math.ceil((this.bounds.max.z - this.bounds.min.z) / TILE_SIZE) * TILE_SIZE);
    this.floor.scale.set(width, 1, depth);
  }
}

function patrolAt(elapsedMs: number, speed: number): { x: number; y: number } {
  const edge = TILE_SIZE * 2;
  const distance = (elapsedMs * 60 * speed / 1000) % (edge * 4);
  if (distance < edge) return { x: CENTER - TILE_SIZE + distance, y: CENTER - TILE_SIZE };
  if (distance < edge * 2) return { x: CENTER + TILE_SIZE, y: CENTER - TILE_SIZE + distance - edge };
  if (distance < edge * 3) return { x: CENTER + TILE_SIZE - (distance - edge * 2), y: CENTER + TILE_SIZE };
  return { x: CENTER - TILE_SIZE, y: CENTER + TILE_SIZE - (distance - edge * 3) };
}

function blinkAt(elapsedMs: number, durationMs: number, initial: boolean): boolean {
  if (elapsedMs >= durationMs) return true;
  let visible = initial;
  let next = resolveNextBlinkToggleAt(0, durationMs, PACKET_DEATH_RECOVERY);
  while (next > 0 && elapsedMs >= next) {
    visible = !visible;
    next = resolveNextBlinkToggleAt(next, durationMs, PACKET_DEATH_RECOVERY);
  }
  return visible;
}

function buildPreviewMap(id: string, transform: AssetPreviewTransform): WorldMapData {
  let rows: TileCell[][];
  if (id === 'wall-straight') rows = [[0], [0], [0]];
  else if (id === 'wall-corner') rows = [[2, { id: 0, rotation: 90 }], [0, null]];
  else if (id === 'other-prison-run') rows = [[16, 16, 16]];
  else if (id === 'other-prison-junction') rows = [[{ id: 0, flipX: true }, 16, 0]];
  else if (id === 'other-sign') rows = [[17, 18, 19, 20, 21]];
  else if (id === 'other-floor') rows = [[99]];
  else rows = [[{ id: id === 'other-prison' ? 16 : Number(id.slice('wall-'.length)), ...transform }]];
  const width = rows[0].length;
  const height = rows.length;
  return {
    width, height, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE,
    widthInPixels: width * TILE_SIZE, heightInPixels: height * TILE_SIZE,
    tiles: rows.map((row, y) => row.map((cell, x) => {
      const tile: PreviewTile | null = typeof cell === 'number' ? { id: cell } : cell;
      return {
        x, y, rawGid: tile ? tile.id + 1 : 0, gid: tile ? tile.id + 1 : null, localId: tile?.id ?? null,
        rotation: (tile?.rotation ?? 0) * Math.PI / 180, flipX: tile?.flipX ?? false, flipY: tile?.flipY ?? false,
        collision: createEmptyCollisionTile(),
      };
    })),
    collisionByGid: new Map(), spawnObjects: [],
  };
}
