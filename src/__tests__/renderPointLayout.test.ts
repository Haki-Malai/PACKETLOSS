import { InstancedMesh, Matrix4, Scene, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
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

describe('RenderSystem point rendering regression', () => {
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
});
