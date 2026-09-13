import { vi } from 'vitest';
import { CAMERA, SPRITE_SIZE } from '../../config/constants';
import { Camera3D } from '../../engine/camera3d';
import { PacketEntity } from '../../game/domain/entities/PacketEntity';
import { EnemyJailService } from '../../game/domain/services/EnemyJailService';
import { RenderSystem } from '../../game/systems/RenderSystem';
import type { ThreeRendererAdapter } from '../../game/infrastructure/adapters/ThreeRendererAdapter';
import { CollectibleSystem } from '../../game/systems/CollectibleSystem';
import { CollisionGrid, CollisionTile, createEmptyCollisionTile } from '../../game/domain/world/CollisionGrid';
import { WorldMapData, WorldState, WorldTile } from '../../game/domain/world/WorldState';
import { createCharacterAssets } from './characterFixtures';

export function createCollisionTile(overrides: Partial<CollisionTile> = {}): CollisionTile {
  return {
    ...createEmptyCollisionTile(),
    ...overrides,
  };
}

export function createMapFixture(collisionRows: CollisionTile[][]): {
  map: WorldMapData;
  collisionGrid: CollisionGrid;
} {
  const height = collisionRows.length;
  const width = collisionRows[0]?.length ?? 0;

  const tiles: WorldTile[][] = collisionRows.map((row, y) =>
    row.map((collision, x) => ({
      x,
      y,
      rawGid: 1,
      gid: 1,
      localId: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      collision: { ...collision },
    })),
  );

  const map: WorldMapData = {
    width,
    height,
    tileWidth: 16,
    tileHeight: 16,
    widthInPixels: width * 16,
    heightInPixels: height * 16,
    tiles,
    collisionByGid: new Map([[1, createCollisionTile()]]),
    spawnObjects: [],
  };

  return {
    map,
    collisionGrid: new CollisionGrid(collisionRows.map((row) => row.map((tile) => ({ ...tile })))),
  };
}

interface RenderHarnessOptions {
  collisionRows?: CollisionTile[][];
  packetTile?: { x: number; y: number };
  world?: WorldState;
}

export function toTileCenter(tile: { x: number; y: number }, tileSize = 16): { x: number; y: number } {
  return {
    x: tile.x * tileSize + tileSize / 2,
    y: tile.y * tileSize + tileSize / 2,
  };
}

export function createWorld(map: WorldMapData, collisionGrid: CollisionGrid, packetTile: { x: number; y: number }): WorldState {
  const center = toTileCenter(packetTile, map.tileWidth);
  const packet = new PacketEntity(packetTile, SPRITE_SIZE.packet, SPRITE_SIZE.packet);
  packet.x = center.x;
  packet.y = center.y;

  return new WorldState({
    map,
    tileSize: map.tileWidth,
    collisionGrid,
    packetSpawnTile: packetTile,
    packet,
    enemies: [],
    enemyJailBounds: new EnemyJailService().resolveEnemyJailBounds(map, packetTile),
  });
}

export function createRenderHarness(options: RenderHarnessOptions = {}) {
  const collisionRows =
    options.collisionRows ?? [[createCollisionTile({ collides: true, left: true }), createCollisionTile({ collides: true, right: true })]];
  const packetTile = options.packetTile ?? { x: 0, y: 0 };
  const { map, collisionGrid } = createMapFixture(collisionRows);
  const world = options.world ?? createWorld(map, collisionGrid, packetTile);
  const center = toTileCenter(world.packet.tile, world.tileSize);

  const renderer = {
    pixelRatio: 1,
    render: vi.fn<ThreeRendererAdapter['render']>(),
    dispose: vi.fn<ThreeRendererAdapter['dispose']>(),
  };

  const camera = new Camera3D();
  camera.setBounds(world.map.widthInPixels, world.map.heightInPixels);
  camera.setZoom(CAMERA.zoom);
  camera.setViewport(800, 600);
  camera.startFollow(world.packet, CAMERA.followLerp.x, CAMERA.followLerp.y);
  camera.snapToFollowTarget();
  const collectibles = new CollectibleSystem(world);
  const renderSystem = new RenderSystem(world, renderer, camera, collectibles, createCharacterAssets());

  return {
    world,
    renderSystem,
    center,
    camera,
    renderer,
    scene: renderSystem.scene,
    collectibles,
  };
}
