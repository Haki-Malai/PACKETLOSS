import { Box3, Group, Raycaster, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { GhostEntity } from '../game/domain/entities/GhostEntity';
import { MovementRules } from '../game/domain/services/MovementRules';
import { createCollisionTile, createMapFixture, createRenderHarness, createWorld } from './fixtures/renderFixtures';

describe('RenderSystem ghost pen', () => {
  it('keeps the pen low enough to show ghosts and leaves their northern exit open', () => {
    const { map, collisionGrid } = createMapFixture(
      Array.from({ length: 3 }, () => Array.from({ length: 5 }, () => createCollisionTile())),
    );
    map.tiles[1][2].localId = 16;
    const world = createWorld(map, collisionGrid, { x: 2, y: 0 });
    world.ghostJailBounds = { minX: 1, maxX: 3, y: 1 };
    const ghost = new GhostEntity({
      key: 'inky', tile: { x: 2, y: 1 }, direction: 'right', speed: 1, displayWidth: 11, displayHeight: 11,
    });
    new MovementRules(world.tileSize).setEntityTile(ghost, ghost.tile);
    world.ghosts.push(ghost);
    const { scene, renderSystem } = createRenderHarness({ world });
    renderSystem.render();

    const pen = scene.getObjectByName('ghost-pen') as Group;
    const ghostModel = scene.getObjectByName('ghost-inky') as Group;
    const penBounds = new Box3().setFromObject(pen);
    const ghostBounds = new Box3().setFromObject(ghostModel);
    expect(penBounds.max.y).toBeLessThanOrEqual(2.2);
    expect(penBounds.max.y).toBeLessThan(ghostBounds.max.y);

    const rails = pen.children.filter((object) => object.name === 'pen-rail');
    const ray = new Raycaster(new Vector3(ghost.x, 1, ghost.y), new Vector3(0, 0, -1));
    expect(ray.intersectObjects(rails)).toHaveLength(0);
    for (const direction of [new Vector3(-1, 0, 0), new Vector3(1, 0, 0), new Vector3(0, 0, 1)]) {
      ray.set(new Vector3(ghost.x, 1, ghost.y), direction);
      expect(ray.intersectObjects(rails).length).toBeGreaterThan(0);
    }
    renderSystem.destroy();
  });
});
