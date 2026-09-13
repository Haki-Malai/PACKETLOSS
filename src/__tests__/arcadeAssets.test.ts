import { AnimationMixer, BufferGeometry, Group, Material, Mesh, MeshStandardMaterial, Texture } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { ArcadeAssets } from '../game/infrastructure/three/ArcadeAssets';
import { createCharacterAssets, createCharacterModels } from './fixtures/characterFixtures';

function body(group: Group): Mesh<BufferGeometry, MeshStandardMaterial> {
  return group.getObjectByName('body') as Mesh<BufferGeometry, MeshStandardMaterial>;
}

describe('ArcadeAssets', () => {
  it('uses a dedicated template for each enemy while sharing its geometry across instances', () => {
    const models = createCharacterModels();
    const assets = new ArcadeAssets(models);
    for (const key of ['firewall', 'virus', 'ping', 'spam', 'lag'] as const) {
      const ghost = assets.createGhost(key);
      expect(body(ghost).geometry).toBe(body(models[key].scene).geometry);
      expect(body(ghost).material).not.toBe(body(models[key].scene).material);
    }
    assets.dispose();
  });

  it('keeps Spam copy materials independent while switching scared state and restoring identity', () => {
    const assets = createCharacterAssets();
    const original = assets.createGhost('spam');
    const copy = assets.createGhost('spam');
    const initialColor = body(original).material.color.getHex();
    expect(body(copy).geometry).toBe(body(original).geometry);
    expect(body(copy).material).not.toBe(body(original).material);
    assets.setGhostAppearance(copy, 'scared');
    assets.sampleAnimation(0);
    expect(body(copy).material.color.getHex()).toBe(initialColor);
    assets.sampleAnimation(0.12);
    const intermediateColor = body(copy).material.color.clone();
    expect(intermediateColor.getHex()).not.toBe(initialColor);
    assets.sampleAnimation(0.24);
    expect(body(copy).material.color.equals(intermediateColor)).toBe(false);
    expect(body(copy).material.color.getHex()).not.toBe(initialColor);
    expect(body(copy).material.color.b).toBeGreaterThan(body(copy).material.color.r);
    expect(body(original).material.color.getHex()).toBe(initialColor);
    assets.setGhostAppearance(copy, 'spam');
    assets.sampleAnimation(0.24);
    assets.sampleAnimation(0.48);
    expect(body(copy).material.color.getHex()).toBe(initialColor);
    assets.dispose();
  });

  it('samples looping ghost animation without moving its gameplay root', () => {
    const assets = createCharacterAssets();
    const ghost = assets.createGhost('firewall');
    assets.sampleAnimation(0);
    expect(body(ghost).position.y).toBeCloseTo(4);
    assets.sampleAnimation(1.5);
    expect(body(ghost).position.y).toBeCloseTo(4.25);
    expect(ghost.position.y).toBe(0);
    assets.sampleAnimation(6);
    expect(body(ghost).position.y).toBeCloseTo(4);
    assets.dispose();
  });

  it('collapses into a return bug and rewinds without changing copies, gameplay roots, or contact shadows', () => {
    const assets = createCharacterAssets();
    const ghost = assets.createGhost('spam');
    const other = assets.createGhost('spam');
    ghost.position.set(20, 0, 40);
    const shadow = assets.createContactShadow(8);
    ghost.add(shadow);
    const shadowPosition = shadow.position.clone();
    const model = ghost.getObjectByName('character-model')!;
    model.scale.setScalar(0.8);
    const collapse = ghost.getObjectByName('ghost-collapse')!;
    const bug = ghost.getObjectByName('return-bug')!;
    assets.setGhostReturnProgress(ghost, 0.5);
    assets.sampleAnimation(1);
    expect(collapse.visible).toBe(true);
    expect(collapse.scale.x).toBeLessThan(1);
    expect(collapse.rotation.y).not.toBe(0);
    expect(other.getObjectByName('ghost-collapse')!.scale.x).toBe(1);
    expect(other.getObjectByName('return-bug')!.visible).toBe(false);

    assets.setGhostReturnProgress(ghost, 1);
    assets.sampleAnimation(1);
    expect(collapse.visible).toBe(false);
    expect(bug.visible).toBe(true);
    expect(model.scale.toArray()).toEqual([0.8, 0.8, 0.8]);
    expect(ghost.position.toArray()).toEqual([20, 0, 40]);
    expect(shadow.position.equals(shadowPosition)).toBe(true);
    const foot = bug.getObjectByName('return-foot-0-0')!;
    const footPose = [foot.position.y, foot.rotation.y];
    assets.sampleAnimation(2);
    expect([foot.position.y, foot.rotation.y]).not.toEqual(footPose);
    assets.sampleAnimation(1);
    expect([foot.position.y, foot.rotation.y]).toEqual(footPose);

    assets.setGhostReturnProgress(ghost, null, true);
    assets.sampleAnimation(0);
    expect(bug.visible).toBe(false);
    expect(collapse.visible).toBe(true);
    expect(collapse.scale.toArray()).toEqual([1, 1, 1]);
    expect(collapse.rotation.y).toBe(0);
    expect(body(ghost).position.y).toBeCloseTo(4);
    assets.dispose();
  });

  it('keeps scared expressions through warning colors and seeking without changing another copy or idle blinks', () => {
    const models = createCharacterModels();
    const assets = new ArcadeAssets(models);
    const original = assets.createGhost('spam');
    const copy = assets.createGhost('spam');
    const eye = (group: Group, side = 'left') => group.getObjectByName(`eye-${side}`) as Mesh;
    const expression = (group: Group, side = 'left') => {
      const mesh = eye(group, side);
      return mesh.morphTargetInfluences![mesh.morphTargetDictionary!.scared];
    };
    assets.setGhostAppearance(copy, 'scared', true, 1);
    assets.sampleAnimation(3);
    expect(expression(copy)).toBe(1);
    expect(expression(copy, 'right')).toBe(1);
    expect(expression(original)).toBe(0);
    expect(expression(models.spam.scene)).toBe(0);
    expect(eye(copy).morphTargetInfluences![0]).toBe(1);
    assets.setGhostAppearance(copy, 'spam', true, 1);
    assets.sampleAnimation(0.5);
    expect(body(copy).material.color.getHex()).toBe(body(original).material.color.getHex());
    expect(expression(copy)).toBe(1);
    assets.setGhostAppearance(copy, 'spam', false, 0);
    assets.sampleAnimation(3);
    expect(expression(copy)).toBe(0);
    expect(expression(copy, 'right')).toBe(0);
    assets.dispose();
  });

  it('preserves authored shell and eye materials while tinting identity and emissive accents', () => {
    const models = createCharacterModels();
    const source = models.firewall.scene;
    for (const name of ['shell-dark', 'eye-core', 'eye-socket', 'accent-edge']) {
      const material = new MeshStandardMaterial({ color: 0x213447, emissive: 0x102030 });
      material.name = name;
      const detail = new Mesh(body(source).geometry, material);
      detail.name = name;
      source.add(detail);
    }
    const assets = new ArcadeAssets(models);
    const ghost = assets.createGhost('firewall');
    const materialOf = (name: string) => (ghost.getObjectByName(name) as Mesh<BufferGeometry, MeshStandardMaterial>).material;
    const normalAccent = materialOf('accent-edge').color.getHex();
    assets.setGhostAppearance(ghost, 'scared', true, 1);
    assets.sampleAnimation(0);
    for (const name of ['shell-dark', 'eye-core', 'eye-socket']) {
      expect(materialOf(name).color.getHex()).toBe(0x213447);
      expect(materialOf(name).emissive.getHex()).toBe(0x102030);
    }
    expect(materialOf('accent-edge').color.getHex()).not.toBe(normalAccent);
    expect(materialOf('accent-edge').emissive.getHex()).toBe(materialOf('accent-edge').color.getHex());
    assets.setGhostAppearance(ghost, 'firewall', false, 0);
    assets.sampleAnimation(0);
    expect(materialOf('accent-edge').color.getHex()).toBe(normalAccent);
    assets.dispose();
  });

  it('eases fear in and out, freezes at a paused time, and reverses an interrupted transition without snapping', () => {
    const assets = createCharacterAssets();
    const ghost = assets.createGhost('virus');
    const eye = ghost.getObjectByName('eye-left') as Mesh;
    const fear = () => eye.morphTargetInfluences![eye.morphTargetDictionary!.scared];
    assets.setGhostAppearance(ghost, 'scared');
    assets.sampleAnimation(1);
    expect(fear()).toBe(0);
    assets.sampleAnimation(1.12);
    expect(fear()).toBeCloseTo(0.5);
    const pausedFear = fear();
    const pausedColor = body(ghost).material.color.clone();
    assets.sampleAnimation(1.12);
    expect(fear()).toBe(pausedFear);
    expect(body(ghost).material.color.equals(pausedColor)).toBe(true);

    assets.setGhostAppearance(ghost, 'virus');
    assets.sampleAnimation(1.12);
    expect(fear()).toBe(pausedFear);
    assets.sampleAnimation(1.24);
    expect(fear()).toBeGreaterThan(0);
    expect(fear()).toBeLessThan(pausedFear);
    assets.sampleAnimation(1.37);
    expect(fear()).toBe(0);
    assets.dispose();
  });

  it('eases the defeated shell through disappearance and restores it gradually at the jail', () => {
    const assets = createCharacterAssets();
    const ghost = assets.createGhost('firewall');
    const shell = ghost.getObjectByName('ghost-collapse')!;
    const bug = ghost.getObjectByName('return-bug')!;
    assets.setGhostReturnProgress(ghost, 0.05);
    assets.sampleAnimation(0);
    expect(shell.scale.x).toBeGreaterThan(0.99);
    expect(shell.rotation.y).toBeLessThan(0.05);
    assets.setGhostReturnProgress(ghost, 0.95);
    assets.sampleAnimation(0.4);
    expect(shell.visible).toBe(true);
    expect(shell.scale.x).toBeLessThan(0.01);
    assets.setGhostReturnProgress(ghost, 1);
    assets.sampleAnimation(0.42);
    expect(shell.visible).toBe(false);
    expect(bug.visible).toBe(true);

    assets.setGhostReturnProgress(ghost, null);
    assets.sampleAnimation(2);
    expect(shell.visible).toBe(false);
    assets.sampleAnimation(2.14);
    expect(shell.scale.x).toBeCloseTo(0.5);
    const scale = shell.scale.x;
    assets.sampleAnimation(2.14);
    expect(shell.scale.x).toBe(scale);
    assets.sampleAnimation(2.29);
    expect(shell.scale.x).toBe(1);
    expect(shell.rotation.y).toBe(0);
    expect(bug.visible).toBe(false);
    assets.dispose();
  });

  it('disposes templates, shared geometry/textures, instance materials, and animation bindings once', () => {
    const models = createCharacterModels();
    const texture = new Texture();
    body(models.spam.scene).material.map = texture;
    const assets = new ArcadeAssets(models);
    const packet = assets.createPacket();
    const ghost = assets.createGhost('spam');
    const copy = assets.createGhost('spam');
    const resources = new Set<BufferGeometry | Material | Texture>([texture]);
    for (const scene of [...Object.values(models).map((model) => model.scene), packet, ghost, copy]) {
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
    expect(uncache).toHaveBeenCalledTimes(2);
    uncache.mockRestore();
  });
});
