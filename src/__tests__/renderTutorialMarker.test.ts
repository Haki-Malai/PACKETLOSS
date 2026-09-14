import { BufferGeometry, Group, Material, Mesh } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Camera3D } from '../engine/camera3d';
import type { TilePosition } from '../game/domain/valueObjects/TilePosition';
import { CollectibleSystem } from '../game/systems/CollectibleSystem';
import { RenderSystem } from '../game/systems/RenderSystem';
import { createCharacterAssets } from './fixtures/characterFixtures';
import { createCollisionTile, createMapFixture, createRenderHarness, createWorld } from './fixtures/renderFixtures';

describe('tutorial marker rendering boundary', () => {
  it('keeps the target visible and synchronized while the lesson is paused, and disposes its resources once', () => {
    const { map, collisionGrid } = createMapFixture([
      [createCollisionTile(), createCollisionTile()],
      [createCollisionTile(), createCollisionTile()],
    ]);
    map.collectibleObjects = [];
    const world = createWorld(map, collisionGrid, { x: 0, y: 0 });
    const camera = new Camera3D();
    camera.setBounds(map.widthInPixels, map.heightInPixels);
    camera.setViewport(320, 240);
    const renderer = { pixelRatio: 1, render: vi.fn(), dispose: vi.fn() };
    let target: Readonly<TilePosition> | null = { x: 1, y: 0 };
    const system = new RenderSystem(world, renderer, camera, new CollectibleSystem(world),
      createCharacterAssets(), () => target);
    const marker = system.scene.getObjectByName('tutorial-marker') as Group;
    const geometry = new Set<BufferGeometry>();
    const materials = new Set<Material>();
    marker.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const drawable = object as Mesh<BufferGeometry, Material | Material[]>;
      geometry.add(drawable.geometry);
      for (const material of Array.isArray(drawable.material) ? drawable.material : [drawable.material]) materials.add(material);
    });
    const disposeSpies = [...geometry, ...materials].map((resource) => vi.spyOn(resource, 'dispose'));
    expect(disposeSpies.length).toBeGreaterThan(0);

    world.isMoving = false;
    system.render();
    expect(marker.visible).toBe(true);
    expect([marker.position.x, marker.position.z]).toEqual([24, 8]);
    const frozen = marker.position.clone();
    system.update(1000);
    system.render(0.5);
    expect(marker.position.equals(frozen)).toBe(true);

    target = { x: 0, y: 1 };
    system.render();
    expect(marker.visible).toBe(true);
    expect([marker.position.x, marker.position.z]).toEqual([8, 24]);
    target = null;
    system.render();
    expect(marker.visible).toBe(false);

    system.destroy();
    system.destroy();
    for (const dispose of disposeSpies) expect(dispose).toHaveBeenCalledTimes(1);
    expect(marker.children).toHaveLength(0);
    expect(renderer.dispose).toHaveBeenCalledTimes(1);
  });

  it('creates no marker scene objects for a normal run', () => {
    const { renderSystem, scene } = createRenderHarness();
    renderSystem.render();
    expect(scene.getObjectByName('tutorial-marker')).toBeUndefined();
    renderSystem.destroy();
  });
});
