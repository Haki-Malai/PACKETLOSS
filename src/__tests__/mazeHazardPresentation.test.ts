import { BufferGeometry, Material, Mesh } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { setActiveEnemiesScaredWindow } from '../game/domain/services/EnemyScaredStateService';
import type { QuarantineWall } from '../game/domain/world/WorldState';
import { QuarantineWalls } from '../game/infrastructure/three/QuarantineWalls';
import { SeededRandom } from '../game/shared/random/SeededRandom';
import { MazeHazardSystem } from '../game/systems/MazeHazardSystem';
import { createEnemyWorld } from './fixtures/enemyFixtures';
import { createRenderHarness } from './fixtures/renderFixtures';

describe('maze hazard presentation', () => {
  it('presents a real simulated ambush as a data bit, reveals the horse, and respects pause and power', () => {
    const { world, movement, packetMovement, enemyMovement } = createEnemyWorld([
      '##############', '#............#', '#............#', '#............#', '#............#',
      '#............#', '#............#', '#............#', '##############',
    ], [{ key: 'trojan', tile: { x: 11, y: 3 } }], { x: 1, y: 2 });
    world.map.collectibleObjects = [{ type: 'pellet', x: 72, y: 24 }];
    const { renderSystem, scene, collectibles } = createRenderHarness({ world });
    const hazards = new MazeHazardSystem(world, movement, new SeededRandom(4), collectibles);
    const trojan = world.enemies[0];
    for (let step = 0; step < 144; step += 1) packetMovement.update();
    hazards.update(6000);
    renderSystem.render();
    const model = scene.getObjectByName('enemy-trojan')!;
    const horse = model.getObjectByName('character-model')!;
    const disguise = model.getObjectByName('trojan-disguise') as Mesh;
    expect(trojan.tile).toEqual({ x: 11, y: 3 });
    expect(horse.visible).toBe(true);
    expect(disguise.visible).toBe(false);
    for (let step = 0; step < 180 && !trojan.disguised; step += 1) {
      enemyMovement.update(1000 / 60);
      hazards.update(1000 / 60);
    }
    expect(trojan.disguised).toBe(true);
    renderSystem.render();
    expect(horse.visible).toBe(true);
    expect(disguise.visible).toBe(false);
    hazards.update(175);
    renderSystem.render();
    expect(horse.visible).toBe(true);
    expect(disguise.visible).toBe(true);
    hazards.update(175);
    renderSystem.render();
    expect(disguise.geometry).toBe((scene.getObjectByName('pellets-base') as Mesh).geometry);
    expect(disguise.visible).toBe(true);
    expect(horse.visible).toBe(false);
    expect(model.position.x).toBe(trojan.x);
    expect(model.position.z).toBe(trojan.y);
    movement.setEntityTile(world.packet, { x: 7, y: 2 });
    hazards.update(0);
    hazards.update(200);
    renderSystem.render();
    expect(horse.visible).toBe(true);
    expect(horse.scale.x).toBeGreaterThan(0);
    expect(horse.scale.x).toBeLessThan(1);
    world.isMoving = false;
    const scale = horse.scale.x;
    hazards.update(1000);
    renderSystem.render();
    expect(horse.scale.x).toBe(scale);
    setActiveEnemiesScaredWindow(world, 6000);
    renderSystem.render();
    expect(horse.scale.x).toBe(1);
    expect(disguise.visible).toBe(false);
    const dispose = vi.spyOn(disguise.geometry, 'dispose');
    renderSystem.destroy();
    renderSystem.destroy();
    expect(dispose).toHaveBeenCalledOnce();
  });

  it('reuses a bounded wall pool while seeking, removes expired pieces, and disposes every owned resource once', () => {
    const walls = new QuarantineWalls(16);
    const records: QuarantineWall[] = [{ tile: { x: 4, y: 2 }, source: { x: 120, y: 56 }, ageMs: 500, durationMs: 7000 }];
    const resources = new Set<BufferGeometry | Material>();
    walls.group.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
      resources.add(mesh.geometry);
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((material) => resources.add(material));
    });
    const disposals = [...resources].map((resource) => vi.spyOn(resource, 'dispose'));
    const slots = [...walls.group.children];
    walls.sync(records);
    const active = walls.group.getObjectByName('quarantine-wall')!;
    expect(active.visible).toBe(true);
    expect(active.position.toArray()).toEqual([72, 0, 40]);
    walls.sync([{ ...records[0], ageMs: 7000 }]);
    expect(active.visible).toBe(false);
    walls.sync(records);
    expect(walls.group.children).toEqual(slots);
    walls.sync([]);
    expect(walls.group.children.every((child) => !child.visible)).toBe(true);
    walls.dispose();
    walls.dispose();
    disposals.forEach((dispose) => expect(dispose).toHaveBeenCalledOnce());
  });
});
