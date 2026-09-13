import { AnimationMixer, BufferGeometry, Group, Material, Mesh, MeshStandardMaterial, Raycaster, Texture, Vector3 } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { ArcadeAssets } from '../game/infrastructure/three/ArcadeAssets';
import { createCharacterAssets, createCharacterModels } from './fixtures/characterFixtures';

function body(group: Group): Mesh<BufferGeometry, MeshStandardMaterial> {
  return group.getObjectByName('body') as Mesh<BufferGeometry, MeshStandardMaterial>;
}

describe('ArcadeAssets', () => {
  it('provides a solid power star with outward-facing volume on every axis', () => {
    const assets = createCharacterAssets();
    const star = new Mesh(assets.powerPelletGeometry, assets.powerPelletMaterial);
    expect(star.geometry).not.toBe(assets.pelletGeometry);
    for (const axis of [
      new Vector3(1, 0, 0), new Vector3(-1, 0, 0), new Vector3(0, 1, 0),
      new Vector3(0, -1, 0), new Vector3(0, 0, 1), new Vector3(0, 0, -1),
    ]) {
      const ray = new Raycaster(axis.clone().multiplyScalar(4), axis.clone().negate());
      const hit = ray.intersectObject(star)[0];
      expect(hit).toBeDefined();
      expect(hit.distance).toBeLessThan(3.5);
      expect(hit.face!.normal.dot(axis)).toBeGreaterThan(0);
    }
    assets.dispose();
  });

  it('uses a dedicated template for each enemy while sharing its geometry across instances', () => {
    const models = createCharacterModels();
    const assets = new ArcadeAssets(models);
    for (const key of ['firewall', 'virus', 'ping', 'spam', 'lag'] as const) {
      const enemy = assets.createEnemy(key);
      expect(body(enemy).geometry).toBe(body(models[key].scene).geometry);
      expect(body(enemy).material).not.toBe(body(models[key].scene).material);
    }
    assets.dispose();
  });

  it('eases a scared Spam copy to neutral grey and restores its identity without changing the original', () => {
    const assets = createCharacterAssets();
    const original = assets.createEnemy('spam');
    const copy = assets.createEnemy('spam');
    const initialColor = body(original).material.color.getHex();
    expect(body(copy).geometry).toBe(body(original).geometry);
    expect(body(copy).material).not.toBe(body(original).material);
    assets.setEnemyAppearance(copy, 'scared');
    assets.sampleAnimation(0);
    expect(body(copy).material.color.getHex()).toBe(initialColor);
    assets.sampleAnimation(0.12);
    const intermediateColor = body(copy).material.color.clone();
    expect(intermediateColor.getHex()).not.toBe(initialColor);
    assets.sampleAnimation(0.24);
    expect(body(copy).material.color.equals(intermediateColor)).toBe(false);
    expect(body(copy).material.color.getHex()).not.toBe(initialColor);
    const grey = body(copy).material.color;
    expect(grey.r).toBeCloseTo(grey.g);
    expect(grey.g).toBeCloseTo(grey.b);
    expect(body(original).material.color.getHex()).toBe(initialColor);
    assets.setEnemyAppearance(copy, 'spam');
    assets.sampleAnimation(0.24);
    assets.sampleAnimation(0.48);
    expect(body(copy).material.color.getHex()).toBe(initialColor);
    assets.dispose();
  });

  it('samples looping enemy animation without moving its gameplay root', () => {
    const assets = createCharacterAssets();
    const enemy = assets.createEnemy('firewall');
    assets.sampleAnimation(0);
    expect(body(enemy).position.y).toBeCloseTo(4);
    assets.sampleAnimation(1.5);
    expect(body(enemy).position.y).toBeCloseTo(4.25);
    expect(enemy.position.y).toBe(0);
    assets.sampleAnimation(6);
    expect(body(enemy).position.y).toBeCloseTo(4);
    assets.dispose();
  });

  it('collapses into a return bug and rewinds without changing copies, gameplay roots, or contact shadows', () => {
    const assets = createCharacterAssets();
    const enemy = assets.createEnemy('spam');
    const other = assets.createEnemy('spam');
    enemy.position.set(20, 0, 40);
    const shadow = assets.createContactShadow(8);
    enemy.add(shadow);
    const shadowPosition = shadow.position.clone();
    const model = enemy.getObjectByName('character-model')!;
    model.scale.setScalar(0.8);
    const collapse = enemy.getObjectByName('enemy-collapse')!;
    const bug = enemy.getObjectByName('return-bug')!;
    assets.setEnemyReturnProgress(enemy, 0.5);
    assets.sampleAnimation(1);
    expect(collapse.visible).toBe(true);
    expect(collapse.scale.x).toBeLessThan(1);
    expect(collapse.rotation.y).not.toBe(0);
    expect(other.getObjectByName('enemy-collapse')!.scale.x).toBe(1);
    expect(other.getObjectByName('return-bug')!.visible).toBe(false);

    assets.setEnemyReturnProgress(enemy, 1);
    assets.sampleAnimation(1);
    expect(collapse.visible).toBe(false);
    expect(bug.visible).toBe(true);
    expect(model.scale.toArray()).toEqual([0.8, 0.8, 0.8]);
    expect(enemy.position.toArray()).toEqual([20, 0, 40]);
    expect(shadow.position.equals(shadowPosition)).toBe(true);
    const foot = bug.getObjectByName('return-foot-0-0')!;
    const footPose = [foot.position.y, foot.rotation.y];
    assets.sampleAnimation(2);
    expect([foot.position.y, foot.rotation.y]).not.toEqual(footPose);
    assets.sampleAnimation(1);
    expect([foot.position.y, foot.rotation.y]).toEqual(footPose);

    assets.setEnemyReturnProgress(enemy, null, true);
    assets.sampleAnimation(0);
    expect(bug.visible).toBe(false);
    expect(collapse.visible).toBe(true);
    expect(collapse.scale.toArray()).toEqual([1, 1, 1]);
    expect(collapse.rotation.y).toBe(0);
    expect(body(enemy).position.y).toBeCloseTo(4);
    assets.dispose();
  });

  it('keeps scared expressions through warning colors and seeking without changing another copy or idle blinks', () => {
    const models = createCharacterModels();
    const assets = new ArcadeAssets(models);
    const original = assets.createEnemy('spam');
    const copy = assets.createEnemy('spam');
    const eye = (group: Group, side = 'left') => group.getObjectByName(`eye-${side}`) as Mesh;
    const expression = (group: Group, side = 'left') => {
      const mesh = eye(group, side);
      return mesh.morphTargetInfluences![mesh.morphTargetDictionary!.scared];
    };
    assets.setEnemyAppearance(copy, 'scared', true, 1);
    assets.sampleAnimation(3);
    expect(expression(copy)).toBe(1);
    expect(expression(copy, 'right')).toBe(1);
    expect(expression(original)).toBe(0);
    expect(expression(models.spam.scene)).toBe(0);
    expect(eye(copy).morphTargetInfluences![0]).toBe(1);
    assets.setEnemyAppearance(copy, 'spam', true, 1);
    assets.sampleAnimation(0.5);
    expect(body(copy).material.color.getHex()).toBe(body(original).material.color.getHex());
    expect(expression(copy)).toBe(1);
    assets.setEnemyAppearance(copy, 'spam', false, 0);
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
    const enemy = assets.createEnemy('firewall');
    const materialOf = (name: string) => (enemy.getObjectByName(name) as Mesh<BufferGeometry, MeshStandardMaterial>).material;
    const normalAccent = materialOf('accent-edge').color.getHex();
    assets.setEnemyAppearance(enemy, 'scared', true, 1);
    assets.sampleAnimation(0);
    for (const name of ['shell-dark', 'eye-core', 'eye-socket']) {
      expect(materialOf(name).color.getHex()).toBe(0x213447);
      expect(materialOf(name).emissive.getHex()).toBe(0x102030);
    }
    expect(materialOf('accent-edge').color.getHex()).not.toBe(normalAccent);
    expect(materialOf('accent-edge').emissive.getHex()).toBe(materialOf('accent-edge').color.getHex());
    assets.setEnemyAppearance(enemy, 'firewall', false, 0);
    assets.sampleAnimation(0);
    expect(materialOf('accent-edge').color.getHex()).toBe(normalAccent);
    assets.dispose();
  });

  it('eases fear in and out, freezes at a paused time, and reverses an interrupted transition without snapping', () => {
    const assets = createCharacterAssets();
    const enemy = assets.createEnemy('virus');
    const eye = enemy.getObjectByName('eye-left') as Mesh;
    const fear = () => eye.morphTargetInfluences![eye.morphTargetDictionary!.scared];
    assets.setEnemyAppearance(enemy, 'scared');
    assets.sampleAnimation(1);
    expect(fear()).toBe(0);
    assets.sampleAnimation(1.12);
    expect(fear()).toBeCloseTo(0.5);
    const pausedFear = fear();
    const pausedColor = body(enemy).material.color.clone();
    assets.sampleAnimation(1.12);
    expect(fear()).toBe(pausedFear);
    expect(body(enemy).material.color.equals(pausedColor)).toBe(true);

    assets.setEnemyAppearance(enemy, 'virus');
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
    const enemy = assets.createEnemy('firewall');
    const shell = enemy.getObjectByName('enemy-collapse')!;
    const bug = enemy.getObjectByName('return-bug')!;
    assets.setEnemyReturnProgress(enemy, 0.05);
    assets.sampleAnimation(0);
    expect(shell.scale.x).toBeGreaterThan(0.99);
    expect(shell.rotation.y).toBeLessThan(0.05);
    assets.setEnemyReturnProgress(enemy, 0.95);
    assets.sampleAnimation(0.4);
    expect(shell.visible).toBe(true);
    expect(shell.scale.x).toBeLessThan(0.01);
    assets.setEnemyReturnProgress(enemy, 1);
    assets.sampleAnimation(0.42);
    expect(shell.visible).toBe(false);
    expect(bug.visible).toBe(true);

    assets.setEnemyReturnProgress(enemy, null);
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
    const enemy = assets.createEnemy('spam');
    const copy = assets.createEnemy('spam');
    const resources = new Set<BufferGeometry | Material | Texture>([
      texture, assets.pelletGeometry, assets.powerPelletGeometry, assets.pelletMaterial, assets.powerPelletMaterial,
    ]);
    for (const scene of [...Object.values(models).map((model) => model.scene), packet, enemy, copy]) {
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
