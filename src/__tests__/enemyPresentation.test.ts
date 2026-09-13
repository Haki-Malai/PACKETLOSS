import { BufferGeometry, LineSegments, Material, Mesh } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { EnemyEntity } from '../game/domain/entities/EnemyEntity';
import type { EnemyEffect, LagZone } from '../game/domain/world/WorldState';
import { EnemyEffects } from '../game/infrastructure/three/EnemyEffects';
import { createCollisionTile, createMapFixture, createRenderHarness, createWorld } from './fixtures/renderFixtures';

describe('enemy presentation', () => {
  it('shows a pooled copy at its activation tile and removes its model and debug marker on deactivation', () => {
    const { map, collisionGrid } = createMapFixture([[createCollisionTile(), createCollisionTile(), createCollisionTile()]]);
    const world = createWorld(map, collisionGrid, { x: 0, y: 0 });
    const original = new EnemyEntity({ key: 'spam', tile: { x: 0, y: 0 }, direction: 'right', speed: 1, displayWidth: 11, displayHeight: 11 });
    const copy = new EnemyEntity({ key: 'spam', tile: { x: 0, y: 0 }, direction: 'right', speed: 1, displayWidth: 8.8, displayHeight: 8.8, isCopy: true });
    world.enemies.push(original, copy);
    world.collisionDebugEnabled = true;
    const { renderSystem, scene } = createRenderHarness({ world });
    const [originalModel, copyModel] = scene.children.filter((object) => object.name === 'enemy-spam');
    const markers = scene.getObjectByName('debug-markers') as LineSegments;
    renderSystem.render();
    expect(copyModel.visible).toBe(false);
    expect(markers.geometry.drawRange.count).toBe(16);
    expect(copyModel.getObjectByName('character-model')?.scale.x).toBe(0.8);
    expect(copyModel.getObjectByName('contact-shadow')?.scale.x).toBe(8.8);

    renderSystem.capturePreviousState();
    copy.active = true;
    copy.tile = { x: 2, y: 0 };
    copy.x = 40;
    copy.y = 8;
    renderSystem.render(0);
    expect(copyModel.visible).toBe(true);
    expect(copyModel.position.x).toBe(40);
    expect(markers.geometry.drawRange.count).toBe(24);
    copy.active = false;
    renderSystem.render();
    expect(copyModel.visible).toBe(false);
    expect(originalModel.visible).toBe(true);
    expect(markers.geometry.drawRange.count).toBe(16);
    renderSystem.destroy();
  });

  it('reuses effect resources as records age, gates detection markers, and disposes shared geometry once', () => {
    const effects = new EnemyEffects();
    const pulse: EnemyEffect = { kind: 'ping', x: 8, y: 8, radius: 128, ageMs: 0, durationMs: 600 };
    const zone: LagZone = { tile: { x: 1, y: 0 }, x: 24, y: 8, radius: 8, ageMs: 0, durationMs: 4000 };
    effects.sync([pulse], [zone]);
    const target = effects.group.getObjectByName('ping-target')!;
    const ring = effects.group.getObjectByName('ping-pulse')!;
    const fill = effects.group.getObjectByName('lag-zone-fill')!;
    expect(target.visible).toBe(false);
    const resources = new Set<BufferGeometry | Material>();
    effects.group.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
      resources.add(mesh.geometry);
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) resources.add(material);
    });
    const disposals = [...resources].map((resource) => vi.spyOn(resource, 'dispose'));
    const children = [...effects.group.children];
    effects.sync([{ ...pulse, ageMs: 300, target: { x: 40, y: 8 } }], [{ ...zone, ageMs: 1500 }]);
    expect(effects.group.children).toEqual(children);
    expect(target.visible).toBe(true);
    expect(target.position.x).toBe(40);
    effects.sync([{ ...pulse, ageMs: 600 }], [{ ...zone, ageMs: 3999 }]);
    expect(ring.visible).toBe(false);
    expect(target.visible).toBe(false);
    expect(fill.visible).toBe(true);
    effects.sync([], [{ ...zone, ageMs: 4000 }]);
    expect(fill.visible).toBe(false);
    effects.dispose();
    effects.dispose();
    for (const dispose of disposals) expect(dispose).toHaveBeenCalledOnce();
  });
});
