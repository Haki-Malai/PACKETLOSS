import {
  BufferGeometry,
  InstancedMesh,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Texture,
} from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Camera3D } from '../engine/camera3d';
import { EnemyEntity } from '../game/domain/entities/EnemyEntity';
import { PacketEntity } from '../game/domain/entities/PacketEntity';
import { CollisionGrid, createEmptyCollisionTile } from '../game/domain/world/CollisionGrid';
import { WorldState, type WorldMapData } from '../game/domain/world/WorldState';
import { CollectibleSystem } from '../game/systems/CollectibleSystem';
import { RenderSystem } from '../game/systems/RenderSystem';
import { createCharacterAssets } from './fixtures/characterFixtures';

function createSceneHarness() {
  const tiles = Array.from({ length: 3 }, (_, y) => Array.from({ length: 4 }, (_, x) => ({
    x,
    y,
    rawGid: 1,
    gid: 1,
    localId: x === 1 && y === 1 ? 16 : x === 1 && y === 2 ? 17 : 1,
    rotation: 0,
    flipX: false,
    flipY: false,
    collision: x === 0 && y === 0
      ? { ...createEmptyCollisionTile(), collides: true, up: true, down: true, left: true, right: true }
      : createEmptyCollisionTile(),
  })));
  const map: WorldMapData = {
    width: 4,
    height: 3,
    tileWidth: 16,
    tileHeight: 16,
    widthInPixels: 64,
    heightInPixels: 48,
    tiles,
    collisionByGid: new Map(),
    spawnObjects: [],
    collectibleObjects: [
      { type: 'pellet', x: 8, y: 24 },
      { type: 'power-pellet', x: 56, y: 24 },
    ],
  };
  const packet = new PacketEntity({ x: 0, y: 1 }, 10, 10);
  packet.x = 8;
  packet.y = 24;
  const enemy = new EnemyEntity({
    key: 'firewall', tile: { x: 2, y: 1 }, direction: 'left', speed: 1, displayWidth: 11, displayHeight: 11,
  });
  enemy.x = 40;
  enemy.y = 24;
  const world = new WorldState({
    map,
    tileSize: 16,
    collisionGrid: new CollisionGrid(tiles.map((row) => row.map((tile) => tile.collision))),
    packetSpawnTile: packet.tile,
    packet,
    enemies: [enemy],
    enemyJailBounds: { minX: 1, maxX: 2, y: 1 },
  });
  const camera = new Camera3D();
  camera.setBounds(64, 48);
  camera.setZoom(5);
  camera.setViewport(160, 120);
  camera.startFollow(world.packet, 0.09, 0.09);
  camera.snapToFollowTarget();
  const renderer = { pixelRatio: 1, render: vi.fn(), dispose: vi.fn() };
  const collectibles = new CollectibleSystem(world);
  const system = new RenderSystem(world, renderer, camera, collectibles, createCharacterAssets());
  return { world, enemy, camera, renderer, collectibles, system };
}

type DisposableResource = BufferGeometry | Material | Texture | InstancedMesh;

function sceneResources(scene: Object3D): Set<DisposableResource> {
  const resources = new Set<DisposableResource>();
  scene.traverse((object) => {
    if (!(object instanceof Mesh || object instanceof LineSegments)) return;
    const drawable = object as Mesh<BufferGeometry, Material | Material[]>;
    resources.add(drawable.geometry);
    const materials = Array.isArray(drawable.material) ? drawable.material : [drawable.material];
    for (const material of materials) {
      resources.add(material);
      if ((material instanceof MeshBasicMaterial || material instanceof MeshStandardMaterial) && material.map) {
        resources.add(material.map);
      }
    }
    if (object instanceof InstancedMesh) resources.add(object);
  });
  return resources;
}

describe('Three.js scene lifecycle', () => {
  it('disposes active and cached GPU resources once, including retired effects and sign lettering', () => {
    const { system, world, enemy, renderer, collectibles } = createSceneHarness();
    const calls = new Map<DisposableResource, () => number>();
    const captureResources = (): void => {
      for (const resource of sceneResources(system.scene)) {
        if (!calls.has(resource)) {
          const spy = vi.spyOn(resource, 'dispose');
          calls.set(resource, () => spy.mock.calls.length);
        }
      }
    };
    collectibles.update(16);
    for (let frame = 0; frame < 4; frame += 1) {
      world.packetAnimation.frame = frame;
      world.enemyAnimations.set(enemy, { key: 'firewallIdle', frame, elapsedMs: 0, forward: 1 });
      system.render();
      captureResources();
    }
    for (const key of ['virus', 'lag', 'spam', 'firewall'] as const) {
      enemy.key = key;
      system.render();
      captureResources();
    }
    enemy.state.scared = true;
    world.enemyScaredTimers.set(enemy, 3000);
    system.render();
    captureResources();
    const effect = system.scene.getObjectByName('pellet-effect') as Mesh<BufferGeometry, MeshBasicMaterial>;
    expect(effect).toBeDefined();
    expect(system.scene.getObjectByName('sign-artwork')).toBeDefined();
    collectibles.update(collectibles.getEatEffects()[0].durationMs);
    system.render();
    expect(system.scene.getObjectByName('pellet-effect')).toBeUndefined();
    expect(calls.get(effect.material)?.()).toBe(1);

    system.destroy();
    system.destroy();

    for (const count of calls.values()) expect(count()).toBe(1);
    expect(system.scene.children).toHaveLength(0);
    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    renderer.render.mockClear();
    system.render();
    expect(renderer.render).not.toHaveBeenCalled();
  });

  it('keeps poses, blinking, eat effects, and projected coordinates fixed between simulation updates', () => {
    const { system, world, enemy, camera, collectibles } = createSceneHarness();
    collectibles.update(16);
    world.isMoving = false;
    world.packetAnimation.frame = 2;
    world.packet.portalBlinkRemainingMs = 1000;
    world.packet.portalBlinkElapsedMs = 120;
    enemy.state.scared = true;
    world.enemyScaredTimers.set(enemy, 700);
    world.enemyScaredWarnings.set(enemy, { elapsedMs: 500, nextToggleAtMs: 600, showBaseColor: true });
    world.enemyAnimations.set(enemy, { key: 'scaredIdle', frame: 3, elapsedMs: 40, forward: 1 });
    system.render();
    const packet = system.scene.getObjectByName('packet')!;
    const enemyModel = system.scene.getObjectByName('enemy-firewall')!;
    const packetBody = packet.getObjectByName('hologram-model')!;
    const enemyBody = enemyModel.getObjectByName('body') as Mesh<BufferGeometry, MeshStandardMaterial>;
    const effect = system.scene.getObjectByName('pellet-effect') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const snapshot = () => ({
      packetPosition: packet.position.toArray(),
      packetVisible: packet.visible,
      packetPose: packetBody.position.toArray(),
      enemyPosition: enemyModel.position.toArray(),
      enemyPose: enemyBody.position.toArray(),
      enemyColor: enemyBody.material.color.getHex(),
      effectScale: effect.scale.toArray(),
      effectOpacity: effect.material.opacity,
      effectElapsed: collectibles.getEatEffects()[0]?.elapsedMs,
      camera: camera.camera.matrixWorld.toArray(),
      projection: camera.camera.projectionMatrix.toArray(),
      pickedPoint: camera.screenToWorld(57, 43),
      warning: { ...world.enemyScaredWarnings.get(enemy) },
    });
    const paused = snapshot();
    expect(paused.packetVisible).toBe(false);
    for (let frame = 0; frame < 20; frame += 1) system.render();
    expect(snapshot()).toEqual(paused);
    system.destroy();
  });

  it('shows collision edges and entity/hover markers only while debug is enabled', () => {
    const { system, world } = createSceneHarness();
    system.render();
    const debug = system.scene.getObjectByName('collision-debug')!;
    const markers = debug.getObjectByName('debug-markers') as LineSegments<BufferGeometry>;
    expect(debug.visible).toBe(false);
    world.collisionDebugEnabled = true;
    world.hoveredDebugTile = { x: 3, y: 2 };
    system.render();
    expect(debug.visible).toBe(true);
    expect(markers.geometry.drawRange.count).toBe(24);
    const positions = markers.geometry.getAttribute('position');
    expect(positions.getX(16)).toBe(49);
    expect(positions.getZ(16)).toBe(33);
    world.hoveredDebugTile = null;
    system.render();
    expect(markers.geometry.drawRange.count).toBe(16);
    world.collisionDebugEnabled = false;
    system.render();
    expect(debug.visible).toBe(false);
    system.destroy();
  });
});
