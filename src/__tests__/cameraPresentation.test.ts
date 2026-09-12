import { describe, expect, it, vi } from 'vitest';
import { createCollisionTile, createMapFixture, createRenderHarness, createWorld } from './fixtures/renderFixtures';

describe('camera presentation', () => {
  it('presents camera and entities with the same alpha before drawing the complete scene once', () => {
    const { map, collisionGrid } = createMapFixture(
      Array.from({ length: 20 }, () => Array.from({ length: 20 }, () => createCollisionTile())),
    );
    const world = createWorld(map, collisionGrid, { x: 10, y: 10 });
    const { renderSystem, camera, renderer, scene } = createRenderHarness({ world });
    const present = vi.spyOn(camera, 'present');
    renderSystem.capturePreviousState();
    world.packet.x += 16;
    camera.update();
    const simulationCameraPosition = camera.getRenderPosition();
    let renderedPacketX = 0;
    let renderedCameraX = 0;
    renderer.render.mockImplementationOnce(() => {
      renderedPacketX = scene.getObjectByName('packet')!.position.x;
      renderedCameraX = camera.screenToWorld(400, 300).x;
    });

    renderSystem.render(0.35);

    expect(present).toHaveBeenCalledExactlyOnceWith(0.35, renderer.pixelRatio);
    expect(renderer.render).toHaveBeenCalledExactlyOnceWith(scene, camera.camera);
    expect(renderedPacketX).toBeCloseTo(168 + 16 * 0.35);
    expect(Math.abs(renderedCameraX - (168 + 16 * 0.09 * 0.35))).toBeLessThanOrEqual(0.1);
    expect(camera.getRenderPosition()).toEqual(simulationCameraPosition);
    expect(world.packet.x).toBe(184);
    renderSystem.destroy();
  });
});
