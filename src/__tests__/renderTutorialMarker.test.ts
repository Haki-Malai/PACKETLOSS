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
    let targets: readonly Readonly<TilePosition>[] = [{ x: 1, y: 0 }];
    const system = new RenderSystem(world, renderer, camera, new CollectibleSystem(world),
      createCharacterAssets(), () => targets);
    const marker = system.scene.getObjectByName('tutorial-marker') as Group;
    const geometry = new Set<BufferGeometry>();
    const materials = new Set<Material>();
    const drawables: Array<Mesh<BufferGeometry, Material | Material[]>> = [];
    marker.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const drawable = object as Mesh<BufferGeometry, Material | Material[]>;
      drawables.push(drawable);
      geometry.add(drawable.geometry);
      for (const material of Array.isArray(drawable.material) ? drawable.material : [drawable.material]) materials.add(material);
    });
    const disposeSpies = [...geometry, ...materials].map((resource) => vi.spyOn(resource, 'dispose'));
    expect(disposeSpies.length).toBeGreaterThan(0);
    expect(drawables.every((drawable) => drawable.renderOrder > 0)).toBe(true);
    expect([...materials].every((material) => !material.depthTest && !material.depthWrite)).toBe(true);

    world.isMoving = false;
    system.render();
    expect(marker.visible).toBe(true);
    expect(marker.children).toHaveLength(1);
    expect([marker.children[0].position.x, marker.children[0].position.z]).toEqual([24, 8]);
    const frozen = marker.children[0].position.clone();
    system.update(1000);
    system.render(0.5);
    expect(marker.children[0].position.equals(frozen)).toBe(true);

    targets = [{ x: 0, y: 1 }, { x: 1, y: 1 }];
    system.render();
    expect(marker.visible).toBe(true);
    expect(marker.children).toHaveLength(2);
    expect(marker.children.map((target) => [target.position.x, target.position.z])).toEqual([
      [8, 24],
      [24, 24],
    ]);
    targets = [];
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
