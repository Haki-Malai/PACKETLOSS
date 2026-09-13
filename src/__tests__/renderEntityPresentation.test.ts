import { BufferGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhostEntity } from '../game/domain/entities/GhostEntity';
import { MovementRules } from '../game/domain/services/MovementRules';
import { HologramPacket } from '../game/infrastructure/three/HologramPacket';
import { createCollisionTile, createMapFixture, createRenderHarness, createWorld } from './fixtures/renderFixtures';

function createEntityHarness() {
  const { map, collisionGrid } = createMapFixture(
    Array.from({ length: 2 }, () => Array.from({ length: 4 }, () => createCollisionTile())),
  );
  const world = createWorld(map, collisionGrid, { x: 0, y: 0 });
  const ghost = new GhostEntity({
    key: 'inky', tile: { x: 1, y: 0 }, direction: 'right', speed: 1, displayWidth: 11, displayHeight: 11,
  });
  new MovementRules(world.tileSize).setEntityTile(ghost, ghost.tile);
  world.ghosts.push(ghost);
  const harness = createRenderHarness({ world });
  const packetModel = harness.scene.getObjectByName('packet') as Group;
  const ghostModel = harness.scene.getObjectByName('ghost-inky') as Group;
  return { ...harness, ghost, packetModel, ghostModel };
}

function body(model: Group): Mesh<BufferGeometry, MeshStandardMaterial> {
  return model.getObjectByName('body') as Mesh<BufferGeometry, MeshStandardMaterial>;
}

describe('RenderSystem entity presentation', () => {
  afterEach(() => vi.restoreAllMocks());

  it('switches warning-phase ghosts between scared blue and their base color', () => {
    const { world, ghost, ghostModel, renderSystem } = createEntityHarness();
    renderSystem.render();
    const baseColor = body(ghostModel).material.color.getHex();
    ghost.state.scared = true;
    world.ghostScaredTimers.set(ghost, 600);
    world.ghostScaredWarnings.set(ghost, { elapsedMs: 600, nextToggleAtMs: 660, showBaseColor: false });
    renderSystem.render();
    const scaredMaterial = body(ghostModel).material;
    expect(scaredMaterial.color.getHex()).not.toBe(baseColor);
    expect(scaredMaterial.color.b).toBeGreaterThan(scaredMaterial.color.r);

    world.ghostScaredWarnings.set(ghost, { elapsedMs: 700, nextToggleAtMs: 760, showBaseColor: true });
    renderSystem.render();
    expect(body(ghostModel).material.color.getHex()).toBe(baseColor);
    expect(ghost.state.scared).toBe(true);
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
