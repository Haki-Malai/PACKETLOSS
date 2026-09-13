import { AnimationMixer, BufferGeometry, Group, Material, Mesh, MeshStandardMaterial, Texture } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { ArcadeAssets } from '../game/infrastructure/three/ArcadeAssets';
import { createCharacterAssets, createCharacterModels } from './fixtures/characterFixtures';

function body(group: Group): Mesh<BufferGeometry, MeshStandardMaterial> {
  return group.getObjectByName('body') as Mesh<BufferGeometry, MeshStandardMaterial>;
}

describe('ArcadeAssets', () => {
  it('assigns blocks to Blinky/Clyde and viruses to Inky/Pinky while sharing geometry', () => {
    const models = createCharacterModels();
    const assets = new ArcadeAssets(models);
    for (const [key, source] of [['blinky', 'block'], ['clyde', 'block'], ['inky', 'virus'], ['pinky', 'virus']] as const) {
      const ghost = assets.createGhost(key);
      expect(body(ghost).geometry).toBe(body(models[source].scene).geometry);
      expect(body(ghost).material).not.toBe(body(models[source].scene).material);
    }
    assets.dispose();
  });

  it('keeps shared-shape ghost colors independent while switching scared state and restoring identity', () => {
    const assets = createCharacterAssets();
    const blinky = assets.createGhost('blinky');
    const clyde = assets.createGhost('clyde');
    const initialBlinky = body(blinky).material.color.getHex();
    const initialClyde = body(clyde).material.color.getHex();
    expect(initialBlinky).not.toBe(initialClyde);
    assets.setGhostAppearance(blinky, 'scared');
    expect(body(blinky).material.color.getHex()).not.toBe(initialBlinky);
    expect(body(blinky).material.color.b).toBeGreaterThan(body(blinky).material.color.r);
    expect(body(clyde).material.color.getHex()).toBe(initialClyde);
    assets.setGhostAppearance(blinky, 'blinky');
    expect(body(blinky).material.color.getHex()).toBe(initialBlinky);
    assets.dispose();
  });

  it('samples looping ghost animation without moving its gameplay root', () => {
    const assets = createCharacterAssets();
    const ghost = assets.createGhost('blinky');
    assets.sampleAnimation(0);
    expect(body(ghost).position.y).toBeCloseTo(4);
    assets.sampleAnimation(1.5);
    expect(body(ghost).position.y).toBeCloseTo(4.25);
    expect(ghost.position.y).toBe(0);
    assets.sampleAnimation(6);
    expect(body(ghost).position.y).toBeCloseTo(4);
    assets.dispose();
  });

  it('disposes templates, shared geometry/textures, instance materials, and animation bindings once', () => {
    const models = createCharacterModels();
    const texture = new Texture();
    body(models.block.scene).material.map = texture;
    const assets = new ArcadeAssets(models);
    const packet = assets.createPacket();
    const ghost = assets.createGhost('blinky');
    const resources = new Set<BufferGeometry | Material | Texture>([texture]);
    for (const scene of [...Object.values(models).map((model) => model.scene), packet, ghost]) {
      scene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
        resources.add(mesh.geometry);
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) resources.add(material);
      });
    }
    const spies = [...resources].map((resource) => vi.spyOn(resource, 'dispose'));
    const uncache = vi.spyOn(AnimationMixer.prototype, 'uncacheRoot');
    assets.dispose();
    assets.dispose();
    for (const spy of spies) expect(spy).toHaveBeenCalledOnce();
    expect(uncache).toHaveBeenCalledTimes(1);
    uncache.mockRestore();
  });
});
