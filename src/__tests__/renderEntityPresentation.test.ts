import { BufferGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { describe, expect, it } from 'vitest';
import { GhostEntity } from '../game/domain/entities/GhostEntity';
import { MovementRules } from '../game/domain/services/MovementRules';
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
  const pacmanModel = harness.scene.getObjectByName('pacman') as Group;
  const ghostModel = harness.scene.getObjectByName('ghost-inky') as Group;
  return { ...harness, ghost, pacmanModel, ghostModel };
}

function body(model: Group): Mesh<BufferGeometry, MeshStandardMaterial> {
  return model.getObjectByName('body') as Mesh<BufferGeometry, MeshStandardMaterial>;
}

describe('RenderSystem entity presentation', () => {
  it('switches warning-phase ghosts between scared blue and their base color', () => {
    const { world, ghost, ghostModel, renderSystem } = createEntityHarness();
    renderSystem.render();
    const baseMaterial = body(ghostModel).material;
    ghost.state.scared = true;
    world.ghostScaredTimers.set(ghost, 600);
    world.ghostScaredWarnings.set(ghost, { elapsedMs: 600, nextToggleAtMs: 660, showBaseColor: false });
    renderSystem.render();
    const scaredMaterial = body(ghostModel).material;
    expect(scaredMaterial).not.toBe(baseMaterial);
    expect(scaredMaterial.color.b).toBeGreaterThan(scaredMaterial.color.r);

    world.ghostScaredWarnings.set(ghost, { elapsedMs: 700, nextToggleAtMs: 760, showBaseColor: true });
    renderSystem.render();
    expect(body(ghostModel).material).toBe(baseMaterial);
    expect(ghost.state.scared).toBe(true);
    renderSystem.destroy();
  });

  it('gives death-recovery visibility priority over portal blinking', () => {
    const { world, pacmanModel, renderSystem } = createEntityHarness();
    world.pacman.portalBlinkRemainingMs = 300;
    world.pacman.portalBlinkElapsedMs = 120;
    world.pacman.deathRecoveryRemainingMs = 500;
    world.pacman.deathRecoveryVisible = true;
    renderSystem.render();
    expect(pacmanModel.visible).toBe(true);

    world.pacman.deathRecoveryVisible = false;
    world.pacman.portalBlinkElapsedMs = 240;
    renderSystem.render();
    expect(pacmanModel.visible).toBe(false);

    world.pacman.deathRecoveryRemainingMs = 0;
    renderSystem.render();
    expect(pacmanModel.visible).toBe(true);
    world.pacman.portalBlinkElapsedMs = 360;
    renderSystem.render();
    expect(pacmanModel.visible).toBe(false);
    renderSystem.destroy();
  });

  it('interpolates both entity models while preserving gameplay coordinates', () => {
    const { world, ghost, pacmanModel, ghostModel, renderSystem } = createEntityHarness();
    renderSystem.capturePreviousState();
    world.pacman.x += 8;
    ghost.y += 8;
    renderSystem.render(0.5);

    expect(pacmanModel.position.x).toBe(12);
    expect(pacmanModel.position.z).toBe(8);
    expect(ghostModel.position.x).toBe(24);
    expect(ghostModel.position.z).toBe(12);
    expect(world.pacman.x).toBe(16);
    expect(ghost.y).toBe(16);
    renderSystem.destroy();
  });

  it('shows portal and respawn destinations immediately when tile positions reset', () => {
    const { world, ghost, pacmanModel, ghostModel, renderSystem } = createEntityHarness();
    renderSystem.capturePreviousState();
    const movement = new MovementRules(world.tileSize);
    movement.setEntityTile(world.pacman, { x: 3, y: 1 });
    movement.setEntityTile(ghost, { x: 2, y: 1 });
    renderSystem.render(0.1);

    expect(pacmanModel.position.x).toBe(56);
    expect(pacmanModel.position.z).toBe(24);
    expect(ghostModel.position.x).toBe(40);
    expect(ghostModel.position.z).toBe(24);
    renderSystem.destroy();
  });

  it('uses gameplay mouth frames and direction without advancing animation during rendering', () => {
    const { world, pacmanModel, renderSystem } = createEntityHarness();
    renderSystem.render();
    const closedMouth = body(pacmanModel).geometry;
    world.pacmanAnimation.frame = 3;
    world.pacman.angle = -90;
    renderSystem.render();

    expect(body(pacmanModel).geometry).not.toBe(closedMouth);
    expect(pacmanModel.rotation.y).toBeCloseTo(Math.PI / 2);
    const openMouth = body(pacmanModel).geometry;
    world.isMoving = false;
    renderSystem.render();
    renderSystem.render();
    expect(body(pacmanModel).geometry).toBe(openMouth);
    expect(world.pacmanAnimation.frame).toBe(3);
    renderSystem.destroy();
  });
});
