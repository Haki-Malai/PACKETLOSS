import {
  Box3, BufferGeometry, Camera, Float32BufferAttribute, Group, LineBasicMaterial, LineSegments,
  Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, RingGeometry, Scene, Vector3,
} from 'three';
import {
  GHOST_SCARED_WARNING_DURATION_MS, PACKET_DEATH_ANIMATION, PACKET_DEATH_RECOVERY, PACKET_PORTAL_BLINK,
  SPRITE_SIZE, TILE_SIZE,
} from '../../config/constants';
import type { GhostKey } from '../../game/domain/entities/GhostEntity';
import { createEmptyCollisionTile } from '../../game/domain/world/CollisionGrid';
import type { WorldMapData } from '../../game/domain/world/WorldState';
import { ArcadeAssets } from '../../game/infrastructure/three/ArcadeAssets';
import { WALL_HEIGHT } from '../../game/infrastructure/three/MazeGeometry';
import { MazeScene } from '../../game/infrastructure/three/MazeScene';
import {
  createEatEffectGeometry, createEatEffectMesh, sampleEatEffect, setPointTransform,
} from '../../game/infrastructure/three/PickupPresentation';
import { addGameplayLighting, createMazeFloorMaterial } from '../../game/infrastructure/three/ScenePresentation';
import { resolveNextBlinkToggleAt } from '../../game/shared/blinkCadence';
import { createEatEffect, type CollectibleKind } from '../../game/shared/pickupEffects';
import { PACKET_CHOMP_FRAME_RATE, PACKET_CHOMP_SEQUENCE } from '../../game/systems/AnimationSystem';
import { ASSET_CATALOG, GHOST_IDENTITIES, type AssetPreviewEntry } from './assetCatalog';

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
  private readonly ghosts = new Map<GhostKey, Group>();
  private readonly points = new Map<CollectibleKind, Mesh<BufferGeometry, MeshStandardMaterial>>();
  private readonly shadow: Mesh;
  private readonly floor = new Mesh(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2), createMazeFloorMaterial());
  private readonly guide = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ color: 0x334e66, transparent: true, opacity: 0.6 }));
  private readonly effectGeometry = createEatEffectGeometry();
  private effect: Mesh<RingGeometry, MeshBasicMaterial> | undefined;
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
      this.scene.add(this.floor, this.guide);

      this.packet = assets.createPacket();
      this.packet.position.set(CENTER, 0, CENTER);
      this.packetShadow = assets.createContactShadow(SPRITE_SIZE.packet);
      this.packet.add(this.packetShadow);
      this.scene.add(this.packet);
      for (const key of GHOST_IDENTITIES) {
        const ghost = assets.createGhost(key);
        ghost.name = `ghost-${key}`;
        ghost.position.set(CENTER, 0, CENTER);
        ghost.add(assets.createContactShadow(SPRITE_SIZE.ghost));
        this.ghosts.set(key, ghost);
        this.scene.add(ghost);
      }
      for (const kind of ['base', 'power'] as const) {
        const mesh = new Mesh(assets.pelletGeometry, kind === 'base' ? assets.pelletMaterial : assets.powerPelletMaterial);
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
    if (entry.category === 'Player') {
      this.packet.visible = true;
      if (entry.id === 'player-death') this.setBounds(24, 24, 19);
    } else if (entry.category === 'Ghosts') {
      this.ghosts.get(this.ghostKey())!.visible = true;
    } else if (entry.id.startsWith('point-')) {
      this.points.get(this.pointKind())!.visible = true;
      this.setBounds(8, 8, 5);
    } else if (entry.id.startsWith('effect-')) {
      this.effect = createEatEffectMesh(this.effectGeometry, CENTER, CENTER);
      this.scene.add(this.effect);
      this.setBounds(9, 9, 3);
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
    this.updateStage();
  }

  sample(timeMs: number, camera: Camera): void {
    if (this.disposed) return;
    const duration = this.entry.durationMs;
    const elapsed = Math.min(duration, Math.max(0, timeMs));
    const id = this.entry.id;
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
    const eatingFrame = id === 'player-eating'
      ? PACKET_CHOMP_SEQUENCE[Math.floor(elapsed * PACKET_CHOMP_FRAME_RATE / 1000)] ?? 0 : 0;
    this.assets.setPacketFrame(this.packet, eatingFrame);
    this.assets.setPacketMotion(this.packet, movement?.[0] ?? 0, movement?.[1] ?? 0, movement ? 1 : 0);
    this.assets.setPacketDeathProgress(this.packet, deathProgress);
    this.packet.visible = this.entry.category === 'Player' && visible;
    this.packetShadow.visible = deathProgress === null || deathProgress < 0.94;
    this.assets.sampleAnimation(elapsed / 1000);
    this.assets.facePacket(this.packet, camera);

    if (this.entry.category === 'Ghosts') {
      const key = this.ghostKey();
      const scared = id.endsWith('-scared') || (id.endsWith('-warning') && !blinkAt(elapsed, GHOST_SCARED_WARNING_DURATION_MS, false));
      this.assets.setGhostAppearance(this.ghosts.get(key)!, scared ? 'scared' : key);
    }
    if (this.effect) {
      const effect = createEatEffect(this.pointKind(), CENTER, CENTER);
      effect.elapsedMs = elapsed;
      sampleEatEffect(this.effect, effect);
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
    this.maze?.dispose();
    this.effectGeometry.dispose();
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
    this.assets.setPacketFrame(this.packet, 0);
    this.assets.setPacketMotion(this.packet, 0, 0, 0);
    this.assets.setPacketDeathProgress(this.packet, null);
    for (const [key, ghost] of this.ghosts) {
      ghost.visible = false;
      this.assets.setGhostAppearance(ghost, key);
    }
    this.points.forEach((point) => { point.visible = false; });
    this.shadow.visible = false;
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

  private ghostKey(): GhostKey {
    return GHOST_IDENTITIES.find((key) => this.entry.id.startsWith(`ghost-${key}-`))!;
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
