import { BufferGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhostEntity } from '../game/domain/entities/GhostEntity';
import { MovementRules } from '../game/domain/services/MovementRules';
import { setActiveGhostsScaredWindow } from '../game/domain/services/GhostScaredStateService';
import { HologramPacket } from '../game/infrastructure/three/HologramPacket';
import { GhostPacketCollisionSystem } from '../game/systems/GhostPacketCollisionSystem';
import { AnimationSystem } from '../game/systems/AnimationSystem';
import { GHOST_EAT_DURATION_MS } from '../game/shared/ghostEating';
import { resetGameState } from '../state/gameState';
import { createCollisionTile, createMapFixture, createRenderHarness, createWorld } from './fixtures/renderFixtures';
import { createEnemyWorld } from './fixtures/enemyFixtures';

function createEntityHarness(pointType?: 'pellet' | 'power-pellet') {
  const { map, collisionGrid } = createMapFixture(
    Array.from({ length: 2 }, () => Array.from({ length: 4 }, () => createCollisionTile())),
  );
  if (pointType) map.collectibleObjects = [
    { type: pointType, x: 8, y: 8 }, { type: pointType, x: 24, y: 8 }, { type: pointType, x: 40, y: 8 },
  ];
  const world = createWorld(map, collisionGrid, { x: 0, y: 0 });
  const ghost = new GhostEntity({
    key: 'virus', tile: { x: 1, y: 0 }, direction: 'right', speed: 1, displayWidth: 11, displayHeight: 11,
  });
  new MovementRules(world.tileSize).setEntityTile(ghost, ghost.tile);
  world.ghosts.push(ghost);
  const harness = createRenderHarness({ world });
  const packetModel = harness.scene.getObjectByName('packet') as Group;
  const ghostModel = harness.scene.getObjectByName('ghost-virus') as Group;
  return { ...harness, ghost, packetModel, ghostModel };
}

function body(model: Group): Mesh<BufferGeometry, MeshStandardMaterial> {
  return model.getObjectByName('body') as Mesh<BufferGeometry, MeshStandardMaterial>;
}

describe('RenderSystem entity presentation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetGameState();
  });

  it('keeps the Packet and its shadow cut out after the final death timer reaches zero', () => {
    const { world, ghost, packetModel, renderSystem } = createEntityHarness();
    const movement = new MovementRules(world.tileSize);
    movement.setEntityTile(world.packet, ghost.tile);
    ghost.state.free = true;
    resetGameState(0, 1);
    const collisions = new GhostPacketCollisionSystem(world, movement);
    collisions.update();
    collisions.update(900);
    world.isMoving = false;
    renderSystem.render();
    expect(packetModel.getObjectByName('hologram-body')?.visible).toBe(false);
    expect(packetModel.getObjectByName('contact-shadow')?.visible).toBe(false);
    renderSystem.render(0.5);
    expect(packetModel.getObjectByName('hologram-body')?.visible).toBe(false);
    renderSystem.destroy();
  });

  it.each([
    { pointType: 'pellet', kind: 'base', radius: 1.25 },
    { pointType: 'power-pellet', kind: 'power', radius: 2 },
  ] as const)('absorbs a $pointType into the presented Packet and freezes with the game clock', ({ pointType, kind, radius }) => {
    const { world, packetModel, renderSystem, collectibles, scene } = createEntityHarness(pointType);
    const packetBody = packetModel.getObjectByName('hologram-body')!;
    const hologram = packetModel.getObjectByName('hologram-model')!;
    const eye = packetModel.getObjectByName('eye-left')!;
    const rim = packetModel.getObjectByName('rim-horizontal-1-1') as Mesh<BufferGeometry, MeshBasicMaterial>;
    renderSystem.render();
    const idleScale = packetBody.scale.clone();
    const idleHeight = hologram.position.y;
    const idleEyeScale = eye.scale.clone();
    const idleRimOpacity = rim.material.opacity;
    collectibles.update(0);
    renderSystem.render();
    const star = scene.getObjectByName('pellet-effect') as Mesh<BufferGeometry, MeshBasicMaterial>;
    expect(star.geometry).toBe((scene.getObjectByName(`pellets-${kind}`) as Mesh).geometry);
    expect(star.scale.x).toBe(radius);
    expect(star.position.x).toBe(8);
    const startColor = star.material.color.clone();
    renderSystem.capturePreviousState();
    world.packet.x += 4;
    collectibles.update(90);
    renderSystem.render(0);
    expect(star.position.x).toBe(8);
    renderSystem.render(1);
    expect(star.position.x).toBeGreaterThan(8);
    expect(star.position.x).toBeLessThan(12);
    expect(star.scale.x).toBeLessThan(radius);
    expect(star.rotation.y).not.toBe(0);
    expect(star.material.color.r).toBeLessThan(startColor.r);
    expect(star.material.color.b).toBeGreaterThan(star.material.color.r);

    world.isMoving = false;
    const pausedPosition = star.position.clone();
    const pausedScale = star.scale.clone();
    renderSystem.update(1000);
    for (let frame = 0; frame < 3; frame += 1) renderSystem.render();
    expect(star.position.equals(pausedPosition)).toBe(true);
    expect(star.scale.equals(pausedScale)).toBe(true);
    world.isMoving = true;
    collectibles.update(90);
    renderSystem.render();
    expect(star.visible).toBe(false);
    expect(star.position.distanceTo(packetModel.getObjectByName('pickup-target')!.getWorldPosition(new Vector3()))).toBeCloseTo(0);
    collectibles.update(60);
    renderSystem.render();
    expect(rim.material.opacity).toBeGreaterThan(idleRimOpacity);
    expect(packetBody.scale.equals(idleScale)).toBe(true);
    expect(hologram.position.y).toBe(idleHeight);
    if (kind === 'base') expect(eye.scale.equals(idleEyeScale)).toBe(true);
    else expect(packetModel.getObjectByName('hunter-rig')?.visible).toBe(false);
    collectibles.update(60);
    renderSystem.render();
    expect(scene.getObjectByName('pellet-effect')).toBeUndefined();
    expect(rim.material.opacity).toBe(idleRimOpacity);
    renderSystem.destroy();
  });

  it('shows hunter mode during the edible window and finishes the final ghost intake while return movement continues', () => {
    const { world, movement, ghostMovement } = createEnemyWorld([
      '#######', '#.....#', '#.....#', '#.....#', '#.....#', '#.....#', '#######',
    ], [{ key: 'virus', tile: { x: 3, y: 1 } }], { x: 3, y: 1 });
    const { renderSystem, scene } = createRenderHarness({ world });
    const packet = scene.getObjectByName('packet')!;
    const ghost = scene.getObjectByName('ghost-virus')!;
    const hunter = packet.getObjectByName('hunter-rig')!;
    const collapse = ghost.getObjectByName('ghost-collapse')!;
    const bug = ghost.getObjectByName('return-bug')!;
    const collision = new GhostPacketCollisionSystem(world, movement);
    const animation = new AnimationSystem(world, 1);
    animation.start();
    setActiveGhostsScaredWindow(world, 1000);
    renderSystem.render();
    expect(hunter.visible).toBe(false);
    renderSystem.capturePreviousState();
    renderSystem.update(160);
    renderSystem.render();
    expect(hunter.visible).toBe(true);
    expect(hunter.scale.y).toBeGreaterThan(0);
    expect(hunter.scale.y).toBeLessThan(1);
    const pausedScale = hunter.scale.clone();
    world.isMoving = false;
    renderSystem.update(1000);
    renderSystem.render();
    expect(hunter.scale.equals(pausedScale)).toBe(true);
    world.isMoving = true;
    renderSystem.capturePreviousState();
    renderSystem.update(160);
    renderSystem.render();
    expect(hunter.scale.y).toBe(1);
    animation.update(1000);
    renderSystem.render();
    expect(hunter.visible).toBe(true);
    renderSystem.capturePreviousState();
    renderSystem.update(330);
    renderSystem.render();
    expect(hunter.visible).toBe(false);

    setActiveGhostsScaredWindow(world, 5000);
    collision.update();
    renderSystem.render();
    expect(hunter.visible).toBe(false);
    renderSystem.capturePreviousState();
    ghostMovement.update(210);
    collision.update(210);
    renderSystem.update(210);
    renderSystem.render();
    const pixels = scene.getObjectByName('ghost-eat-pixels')!;
    expect(pixels.visible).toBe(true);
    const positions = pixels.children.map((pixel) => pixel.position.clone());
    world.isMoving = false;
    renderSystem.update(2000);
    renderSystem.render();
    expect(pixels.children.every((pixel, i) => pixel.position.equals(positions[i]))).toBe(true);

    world.isMoving = true;
    renderSystem.capturePreviousState();
    ghostMovement.update(GHOST_EAT_DURATION_MS - 210);
    collision.update(GHOST_EAT_DURATION_MS - 210);
    renderSystem.update(210);
    renderSystem.render();
    expect(hunter.visible).toBe(true);
    expect(collapse.visible).toBe(false);
    expect(bug.visible).toBe(true);
    expect(scene.getObjectByName('ghost-eat-pixels')).toBeUndefined();
    const before = ghost.position.clone();
    renderSystem.capturePreviousState();
    ghostMovement.update();
    renderSystem.update(1000 / 60);
    renderSystem.render(0.5);
    expect(ghost.position.z).toBeGreaterThan(before.z);
    expect(ghost.position.z).toBeLessThan(world.ghosts[0].y);
    renderSystem.capturePreviousState();
    renderSystem.update(330);
    renderSystem.render();
    expect(hunter.visible).toBe(false);
    renderSystem.destroy();
  });

  it('clears a retired Spam copy’s return transition before the slot is reused', () => {
    const { world, movement, ghostMovement, abilities } = createEnemyWorld([
      '#######', '#.....#', '#.....#', '#.....#', '#.....#', '#.....#', '#######',
    ], [
      { key: 'spam', tile: { x: 3, y: 3 } },
      { key: 'spam', tile: { x: 3, y: 3 }, isCopy: true },
    ]);
    const { renderSystem, scene } = createRenderHarness({ world });
    const copy = world.ghosts[1];
    const model = scene.children.filter((object) => object.name === 'ghost-spam')[1];
    abilities.update(4000);
    expect(copy.active).toBe(true);
    setActiveGhostsScaredWindow(world, 5000);
    movement.setEntityTile(world.packet, copy.tile);
    new GhostPacketCollisionSystem(world, movement).update();
    expect(copy.state.dead).toBe(true);
    ghostMovement.update(GHOST_EAT_DURATION_MS);
    renderSystem.render();
    expect(model.getObjectByName('return-bug')!.visible).toBe(true);
    for (let step = 0; step < 200 && copy.active; step += 1) ghostMovement.update();
    expect(copy.active).toBe(false);
    renderSystem.render();
    expect(model.visible).toBe(false);

    const animation = new AnimationSystem(world, 1);
    animation.start();
    animation.update(5000);
    movement.setEntityTile(world.packet, { x: 1, y: 1 });
    movement.setEntityTile(world.ghosts[0], { x: 3, y: 3 });
    abilities.update(4000);
    expect(copy.active).toBe(true);
    renderSystem.render();
    expect(model.visible).toBe(true);
    expect(model.getObjectByName('return-bug')!.visible).toBe(false);
    expect(model.getObjectByName('ghost-collapse')!.scale.x).toBe(1);
    renderSystem.destroy();
  });

  it('keeps consecutive pickups independent during movement and cancels old intake after teleporting', () => {
    const { world, renderSystem, collectibles, scene } = createEntityHarness('pellet');
    collectibles.update(0);
    renderSystem.render();
    const first = scene.getObjectByName('pellet-effect') as Mesh<BufferGeometry, MeshBasicMaterial>;
    collectibles.update(60);
    world.packet.tile.x = 1;
    world.packet.x = 24;
    collectibles.update(0);
    renderSystem.render();
    const stars = scene.children.filter((child) => child.name === 'pellet-effect') as Mesh<BufferGeometry, MeshBasicMaterial>[];
    const second = stars.find((star) => star !== first)!;
    expect(stars).toHaveLength(2);
    expect(first.visible).toBe(true);
    expect(first.position.x).toBeGreaterThan(8);
    expect(second.position.x).toBe(24);
    expect(first.scale.x).toBeLessThan(second.scale.x);
    expect(first.geometry).toBe(second.geometry);
    expect(first.material).not.toBe(second.material);

    const movement = new MovementRules(world.tileSize);
    renderSystem.capturePreviousState();
    movement.setEntityTile(world.packet, { x: 0, y: 0 });
    renderSystem.update(16);
    collectibles.update(0);
    renderSystem.render();
    expect(first.visible).toBe(false);
    expect(second.visible).toBe(false);
    renderSystem.capturePreviousState();
    movement.setEntityTile(world.packet, { x: 2, y: 0 });
    renderSystem.update(16);
    collectibles.update(0);
    renderSystem.capturePreviousState();
    world.packet.x += 0.5;
    renderSystem.update(16);
    collectibles.update(16);
    renderSystem.render();
    const remaining = scene.children.filter((child) => child.name === 'pellet-effect' && child.visible);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].position.x).toBeGreaterThan(40);
    expect(remaining[0].position.x).toBeLessThan(40.5);
    renderSystem.destroy();
  });

  it('suppresses an active intake and its arrival pulse after dangerous contact', () => {
    const { world, ghost, packetModel, renderSystem, collectibles, scene } = createEntityHarness('pellet');
    const movement = new MovementRules(world.tileSize);
    const rim = packetModel.getObjectByName('rim-horizontal-1-1') as Mesh<BufferGeometry, MeshBasicMaterial>;
    renderSystem.render();
    const idleRimOpacity = rim.material.opacity;
    collectibles.update(90);
    renderSystem.render();
    const star = scene.getObjectByName('pellet-effect')!;
    expect(star.visible).toBe(true);

    ghost.state.free = true;
    movement.setEntityTile(ghost, world.packet.tile);
    new GhostPacketCollisionSystem(world, movement).update();
    renderSystem.render();
    expect(star.visible).toBe(false);
    expect(packetModel.getObjectByName('death-effect')?.visible).toBe(true);
    collectibles.update(150);
    renderSystem.render();
    expect(rim.material.opacity).toBe(idleRimOpacity);
    renderSystem.destroy();
  });

  it('keeps scared eyes while warning colors flash and restores angry eyes when edible time ends', () => {
    const { world, ghost, ghostModel, renderSystem } = createEntityHarness();
    renderSystem.render();
    const baseColor = body(ghostModel).material.color.getHex();
    const eye = ghostModel.getObjectByName('eye-left') as Mesh;
    const scaredIndex = eye.morphTargetDictionary!.scared;
    ghost.state.scared = true;
    world.ghostScaredTimers.set(ghost, 600);
    world.ghostScaredWarnings.set(ghost, { elapsedMs: 600, nextToggleAtMs: 660, showBaseColor: false });
    renderSystem.render();
    expect(eye.morphTargetInfluences![scaredIndex]).toBe(0);
    renderSystem.capturePreviousState();
    renderSystem.update(250);
    renderSystem.render();
    const scaredMaterial = body(ghostModel).material;
    expect(scaredMaterial.color.getHex()).not.toBe(baseColor);
    expect(scaredMaterial.color.b).toBeGreaterThan(scaredMaterial.color.r);
    expect(eye.morphTargetInfluences![scaredIndex]).toBe(1);

    world.ghostScaredWarnings.set(ghost, { elapsedMs: 700, nextToggleAtMs: 760, showBaseColor: true });
    renderSystem.render();
    expect(body(ghostModel).material.color.getHex()).toBe(baseColor);
    expect(ghost.state.scared).toBe(true);
    expect(eye.morphTargetInfluences![scaredIndex]).toBe(1);
    ghost.state.scared = false;
    renderSystem.render();
    expect(eye.morphTargetInfluences![scaredIndex]).toBe(1);
    renderSystem.capturePreviousState();
    renderSystem.update(120);
    renderSystem.render();
    expect(eye.morphTargetInfluences![scaredIndex]).toBeCloseTo(0.5);
    renderSystem.capturePreviousState();
    renderSystem.update(130);
    renderSystem.render();
    expect(eye.morphTargetInfluences![scaredIndex]).toBe(0);
    renderSystem.destroy();
  });

  it('gives death-recovery visibility priority over portal blinking', () => {
    const { world, packetModel, renderSystem } = createEntityHarness();
    world.packet.portalBlinkRemainingMs = 300;
    world.packet.portalBlinkElapsedMs = 120;
    world.packet.deathRecoveryRemainingMs = 500;
    world.packet.deathRecoveryVisible = true;
    renderSystem.render();
    expect(packetModel.visible).toBe(true);

    world.packet.deathRecoveryVisible = false;
    world.packet.portalBlinkElapsedMs = 240;
    renderSystem.render();
    expect(packetModel.visible).toBe(false);

    world.packet.deathRecoveryRemainingMs = 0;
    renderSystem.render();
    expect(packetModel.visible).toBe(true);
    world.packet.portalBlinkElapsedMs = 360;
    renderSystem.render();
    expect(packetModel.visible).toBe(false);
    renderSystem.destroy();
  });

  it('interpolates both entity models while preserving gameplay coordinates', () => {
    const { world, ghost, packetModel, ghostModel, renderSystem } = createEntityHarness();
    renderSystem.capturePreviousState();
    world.packet.x += 8;
    ghost.y += 8;
    renderSystem.render(0.5);

    expect(packetModel.position.x).toBe(12);
    expect(packetModel.position.z).toBe(8);
    expect(ghostModel.position.x).toBe(24);
    expect(ghostModel.position.z).toBe(12);
    expect(world.packet.x).toBe(16);
    expect(ghost.y).toBe(16);
    renderSystem.destroy();
  });

  it('shows portal and respawn destinations immediately when tile positions reset', () => {
    const { world, ghost, packetModel, ghostModel, renderSystem } = createEntityHarness();
    renderSystem.capturePreviousState();
    const movement = new MovementRules(world.tileSize);
    movement.setEntityTile(world.packet, { x: 3, y: 1 });
    movement.setEntityTile(ghost, { x: 2, y: 1 });
    renderSystem.render(0.1);

    expect(packetModel.position.x).toBe(56);
    expect(packetModel.position.z).toBe(24);
    expect(ghostModel.position.x).toBe(40);
    expect(ghostModel.position.z).toBe(24);
    renderSystem.destroy();
  });

  it('interpolates animation and freezes the hologram and ghost clips on pause without changing gameplay roots', () => {
    const { world, packetModel, ghostModel, camera, renderSystem } = createEntityHarness();
    const hologram = packetModel.getObjectByName('hologram-model')!;
    const binary = packetModel.getObjectByName('binary-000') as Mesh<BufferGeometry, MeshBasicMaterial>;
    renderSystem.render();
    const initialPose = hologram.position.clone();
    renderSystem.capturePreviousState();
    renderSystem.update(3000);
    world.packetAnimation.frame = 3;
    world.packet.angle = -90;
    renderSystem.render(0.5);

    expect(body(ghostModel).position.y).toBeCloseTo(4.25);
    expect(hologram.position.equals(initialPose)).toBe(false);
    expect(packetModel.rotation.y).toBeCloseTo(Math.PI / 2);
    const facing = new Vector3(0, 0, 1).applyQuaternion(hologram.getWorldQuaternion(new Quaternion()));
    const towardViewer = new Vector3(0, 0, 1).applyQuaternion(camera.camera.getWorldQuaternion(new Quaternion()));
    expect(facing.dot(towardViewer)).toBeCloseTo(1);
    expect(packetModel.position.y).toBe(0);
    expect(packetModel.getObjectByName('contact-shadow')?.position.y).toBeCloseTo(0.035);
    world.isMoving = false;
    renderSystem.render();
    const pausedHeight = hologram.position.y;
    const pausedOpacity = binary.material.opacity;
    renderSystem.update(10000);
    renderSystem.render();
    expect(hologram.position.y).toBe(pausedHeight);
    expect(binary.material.opacity).toBe(pausedOpacity);
    expect(world.packetAnimation.frame).toBe(3);

    world.isMoving = true;
    renderSystem.capturePreviousState();
    renderSystem.update(1500);
    renderSystem.render();
    expect(body(ghostModel).position.y).toBeCloseTo(4.25);
    expect(hologram.position.y).not.toBe(pausedHeight);
    renderSystem.destroy();
  });

  it('directs the trail from actual displacement despite buffered heading and reverses it immediately', () => {
    const motion = vi.spyOn(HologramPacket.prototype, 'setMotion');
    const { world, renderSystem } = createEntityHarness();
    world.packet.angle = 180;
    renderSystem.capturePreviousState();
    world.packet.x += 4;
    renderSystem.update(16);
    renderSystem.render(0.5);
    expect(motion).toHaveBeenLastCalledWith(1, 0, 0.5);

    renderSystem.capturePreviousState();
    world.packet.x -= 4;
    renderSystem.update(16);
    renderSystem.render(0.25);
    expect(motion).toHaveBeenLastCalledWith(-1, 0, 1);

    renderSystem.capturePreviousState();
    world.packet.y -= 4;
    renderSystem.update(16);
    renderSystem.render();
    expect(motion).toHaveBeenLastCalledWith(0, -1, 1);

    renderSystem.capturePreviousState();
    world.packet.y += 4;
    renderSystem.update(16);
    renderSystem.render();
    expect(motion).toHaveBeenLastCalledWith(0, 1, 1);
    renderSystem.destroy();
  });

  it('fades stopped motion over 120 ms, freezes the fade while paused, and clears it on position resets', () => {
    const motion = vi.spyOn(HologramPacket.prototype, 'setMotion');
    const { world, renderSystem } = createEntityHarness();
    renderSystem.update(16);
    renderSystem.render();
    expect(motion).toHaveBeenLastCalledWith(0, 0, 0);

    renderSystem.capturePreviousState();
    world.packet.x += 4;
    renderSystem.update(16);
    renderSystem.render();
    expect(motion).toHaveBeenLastCalledWith(1, 0, 1);
    renderSystem.capturePreviousState();
    renderSystem.update(60);
    renderSystem.render(0.5);
    expect(motion).toHaveBeenLastCalledWith(1, 0, 0.75);

    world.isMoving = false;
    renderSystem.update(10000);
    renderSystem.render(0.2);
    expect(motion).toHaveBeenLastCalledWith(1, 0, 0.5);
    world.isMoving = true;
    renderSystem.capturePreviousState();
    renderSystem.update(60);
    renderSystem.render();
    expect(motion).toHaveBeenLastCalledWith(1, 0, 0);

    const movement = new MovementRules(world.tileSize);
    for (const destination of [{ x: 3, y: 1 }, world.packetSpawnTile]) {
      renderSystem.capturePreviousState();
      world.packet.x += 4;
      renderSystem.update(16);
      renderSystem.render();
      expect(motion).toHaveBeenLastCalledWith(1, 0, 1);
      renderSystem.capturePreviousState();
      movement.setEntityTile(world.packet, destination);
      renderSystem.update(16);
      renderSystem.render(0);
      expect(motion).toHaveBeenLastCalledWith(0, 0, 0);
    }
    renderSystem.destroy();
  });
});
