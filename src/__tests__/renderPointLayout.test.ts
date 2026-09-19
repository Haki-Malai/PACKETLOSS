import { InstancedMesh, Matrix4, Mesh, Quaternion, Scene, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { Camera3D } from '../engine/camera3d';
import { MovementRules } from '../game/domain/services/MovementRules';
import { setPointTransform } from '../game/infrastructure/three/PickupPresentation';
import {
  createCollisionTile, createMapFixture, createRenderHarness, createWorld,
} from './fixtures/renderFixtures';

function renderedPoints(scene: Scene): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  const matrix = new Matrix4();
  const position = new Vector3();
  for (const kind of ['base', 'power']) {
    const mesh = scene.getObjectByName('pellets-' + kind) as InstancedMesh;
    for (let index = 0; index < mesh.count; index += 1) {
      mesh.getMatrixAt(index, matrix);
      position.setFromMatrixPosition(matrix);
      points.push({ x: position.x, y: position.z });
    }
  }
  return points;
}

function createPowerPointHarness() {
  const { map, collisionGrid } = createMapFixture([[createCollisionTile(), createCollisionTile()]]);
  map.collectibleObjects = [{ type: 'pellet', x: 8, y: 8 }, { type: 'power-pellet', x: 24, y: 8 }];
  return createRenderHarness({ world: createWorld(map, collisionGrid, { x: 0, y: 0 }) });
}

function firstPointMatrix(mesh: InstancedMesh): Matrix4 {
  const matrix = new Matrix4();
  mesh.getMatrixAt(0, matrix);
  return matrix;
}

describe('RenderSystem point rendering regression', () => {
  it('turns the power star horizontally so its left tip becomes the facing tip', () => {
    const camera = new Camera3D();
    camera.present();
    const towardViewer = camera.camera.getWorldDirection(new Vector3()).negate();
    const initial = new Matrix4();
    const sampled = new Matrix4();
    setPointTransform(initial, 'power', 0, 0, 0);
    const vertical = new Vector3(0, 0, -1).transformDirection(initial);
    const facingTips = [
      new Vector3(0, 1, 0), new Vector3(-1, 0, 0), new Vector3(0, -1, 0),
      new Vector3(1, 0, 0), new Vector3(0, 1, 0),
    ];
    for (const [quarterTurn, tip] of facingTips.entries()) {
      setPointTransform(sampled, 'power', 0, 0, quarterTurn * 1.5);
      expect(tip.transformDirection(sampled).distanceTo(towardViewer)).toBeLessThan(1e-10);
      expect(new Vector3(0, 0, -1).transformDirection(sampled).distanceTo(vertical)).toBeLessThan(1e-10);
      const center = new Vector3().setFromMatrixPosition(sampled);
      expect(center.x).toBe(0);
      expect(center.z).toBe(0);
    }
  });

  it('renders points on colliding tiles and non-colliding connector tiles', () => {
    const { map, collisionGrid } = createMapFixture([[
      createCollisionTile({ collides: true, left: true }),
      createCollisionTile(),
      createCollisionTile({ collides: true }),
      createCollisionTile({ collides: true, right: true }),
    ]]);
    const { renderSystem, scene } = createRenderHarness({ world: createWorld(map, collisionGrid, { x: 0, y: 0 }) });
    renderSystem.render();

    const points = renderedPoints(scene);
    expect(points).toHaveLength(4);
    expect(points.map(({ x, y }) => `${x},${y}`).sort()).toEqual(['8,8', '24,8', '40,8', '56,8'].sort());
    renderSystem.destroy();
  });

  it('removes only the consumed pellet from the rendered instances', () => {
    const { renderSystem, scene, center, collectibles } = createRenderHarness();
    renderSystem.render();
    const initial = renderedPoints(scene);
    expect(initial).toContainEqual(center);

    collectibles.update(16);
    renderSystem.render();

    expect(renderedPoints(scene)).toEqual(initial.filter((point) => point.x !== center.x || point.y !== center.y));
    expect(scene.getObjectByName('pellet-effect')).toBeDefined();
    renderSystem.destroy();
  });

  it('interpolates power-star rotation and hover, freezes when paused, and leaves regular point buffers untouched', () => {
    const { world, renderSystem, scene } = createPowerPointHarness();
    const base = scene.getObjectByName('pellets-base') as InstancedMesh;
    const power = scene.getObjectByName('pellets-power') as InstancedMesh;
    renderSystem.render();
    expect(power.geometry).not.toBe(base.geometry);
    const initial = firstPointMatrix(power);
    const regular = firstPointMatrix(base);
    const regularVersion = base.instanceMatrix.version;
    const initialBounds = power.boundingSphere!.clone();
    renderSystem.capturePreviousState();
    renderSystem.update(900);
    renderSystem.render(0);
    expect(firstPointMatrix(power).equals(initial)).toBe(true);
    renderSystem.render(0.5);
    const middle = firstPointMatrix(power);
    renderSystem.render(1);
    const end = firstPointMatrix(power);
    const rotation = (matrix: Matrix4) => new Quaternion().setFromRotationMatrix(new Matrix4().extractRotation(matrix));
    expect(rotation(initial).angleTo(rotation(middle))).toBeGreaterThan(0);
    expect(rotation(initial).angleTo(rotation(middle))).toBeLessThan(rotation(initial).angleTo(rotation(end)));
    expect(new Vector3().setFromMatrixPosition(middle).y).not.toBe(new Vector3().setFromMatrixPosition(initial).y);
    expect(new Vector3().setFromMatrixPosition(end).y).not.toBe(new Vector3().setFromMatrixPosition(middle).y);
    expect(power.boundingSphere!.equals(initialBounds)).toBe(false);
    expect(firstPointMatrix(base).equals(regular)).toBe(true);
    expect(base.instanceMatrix.version).toBe(regularVersion);

    world.isMoving = false;
    renderSystem.update(1000);
    for (const alpha of [0, 0.5, 1]) {
      renderSystem.render(alpha);
      expect(firstPointMatrix(power).equals(end)).toBe(true);
    }
    world.isMoving = true;
    renderSystem.capturePreviousState();
    renderSystem.update(300);
    renderSystem.render(0);
    expect(firstPointMatrix(power).equals(end)).toBe(true);
    renderSystem.render(1);
    expect(firstPointMatrix(power).equals(end)).toBe(false);
    expect(base.instanceMatrix.version).toBe(regularVersion);
    renderSystem.destroy();
  });

  it('starts absorbing a power star from its animated pose and keeps its source phase stable between rendered frames', () => {
    const { world, renderSystem, collectibles, scene } = createPowerPointHarness();
    const power = scene.getObjectByName('pellets-power') as InstancedMesh;
    renderSystem.capturePreviousState();
    renderSystem.update(1200);
    renderSystem.render();
    const standing = firstPointMatrix(power);
    new MovementRules(world.tileSize).setEntityTile(world.packet, { x: 1, y: 0 });
    collectibles.update(0);
    renderSystem.render();
    const absorbed = scene.getObjectByName('pellet-effect') as Mesh;
    absorbed.updateMatrix();
    for (const [index, value] of standing.elements.entries()) expect(absorbed.matrix.elements[index]).toBeCloseTo(value, 6);
    expect(absorbed.geometry).toBe(power.geometry);
    expect(power.count).toBe(0);

    renderSystem.capturePreviousState();
    renderSystem.update(60);
    collectibles.update(60);
    renderSystem.render(0);
    const orientation = absorbed.quaternion.clone();
    for (const alpha of [0.5, 1]) {
      renderSystem.render(alpha);
      expect(absorbed.quaternion.equals(orientation)).toBe(true);
    }
    renderSystem.destroy();
  });
});
