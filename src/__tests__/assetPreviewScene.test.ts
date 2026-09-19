import { BufferGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ASSET_CATALOG } from '../dev/assets/assetCatalog';
import { AssetPreviewScene } from '../dev/assets/AssetPreviewScene';
import { Camera3D } from '../engine/camera3d';
import { createCharacterAssets } from './fixtures/characterFixtures';

function entry(id: string) {
  return ASSET_CATALOG.find((candidate) => candidate.id === id)!;
}

function preview() {
  const assets = createCharacterAssets();
  const scene = new AssetPreviewScene(assets);
  const camera = new Camera3D();
  camera.setBounds(256, 256);
  camera.setViewport(240, 240);
  camera.setZoom(5);
  camera.startFollow({ x: 128, y: 128 }, 1, 1);
  camera.snapToFollowTarget();
  camera.present();
  return { assets, scene, camera: camera.camera };
}

describe('AssetPreviewScene', () => {
  afterEach(() => vi.restoreAllMocks());

  it('rewinds temporary walls and Trojan disguises without retaining them in the next preview', () => {
    const { assets, scene, camera } = preview();
    scene.select(entry('enemy-quarantine-walls'));
    scene.sample(1800, camera);
    const wall = scene.scene.getObjectByName('quarantine-wall')!;
    expect(wall.visible).toBe(true);
    scene.sample(7800, camera);
    expect(wall.visible).toBe(false);
    scene.sample(1800, camera);
    expect(wall.visible).toBe(true);
    scene.select(entry('enemy-trojan-disguise'));
    expect(wall.visible).toBe(false);
    scene.sample(0, camera);
    const trojan = scene.scene.getObjectByName('enemy-trojan')!;
    expect(trojan.getObjectByName('trojan-disguise')?.visible).toBe(false);
    expect(trojan.getObjectByName('character-model')?.visible).toBe(true);
    scene.sample(175, camera);
    expect(trojan.getObjectByName('trojan-disguise')?.visible).toBe(true);
    expect(trojan.getObjectByName('character-model')?.visible).toBe(true);
    scene.sample(350, camera);
    expect(trojan.getObjectByName('trojan-disguise')?.visible).toBe(true);
    expect(trojan.getObjectByName('character-model')?.visible).toBe(false);
    scene.sample(2900, camera);
    expect(trojan.getObjectByName('trojan-disguise')?.visible).toBe(false);
    expect(trojan.getObjectByName('character-model')?.scale.x).toBe(1);
    scene.sample(0, camera);
    expect(trojan.getObjectByName('trojan-disguise')?.visible).toBe(false);
    expect(trojan.getObjectByName('character-model')?.visible).toBe(true);
    scene.select(entry('enemy-trojan-normal'));
    expect(trojan.getObjectByName('trojan-disguise')?.visible).toBe(false);
    expect(trojan.getObjectByName('character-model')?.visible).toBe(true);
    scene.dispose();
    assets.dispose();
  });

  it('restores player and enemy presentation when changing states without losing the tile guide', () => {
    const { assets, scene, camera } = preview();
    const packet = scene.scene.getObjectByName('packet')!;
    const body = packet.getObjectByName('hologram-body')!;
    scene.setTileGuide(true);
    scene.select(entry('player-death'));
    scene.sample(850, camera);
    expect(body.visible).toBe(false);
    scene.select(entry('player-move-left'));
    scene.sample(750, camera);
    expect(body.visible).toBe(true);
    expect(packet.rotation.y).toBeCloseTo(-Math.PI);
    expect(packet.getObjectByName('motion-trail')?.visible).toBe(true);

    scene.select(entry('enemy-firewall-normal'));
    scene.sample(0, camera);
    const enemy = scene.scene.getObjectByName('enemy-firewall')!.getObjectByName('body') as Mesh<BufferGeometry, MeshStandardMaterial>;
    const eye = scene.scene.getObjectByName('enemy-firewall')!.getObjectByName('eye-left') as Mesh;
    const scaredIndex = eye.morphTargetDictionary!.scared;
    const baseColor = enemy.material.color.getHex();
    scene.select(entry('enemy-firewall-scared'));
    scene.sample(240, camera);
    expect(enemy.material.color.getHex()).not.toBe(baseColor);
    expect(eye.morphTargetInfluences![scaredIndex]).toBe(1);
    scene.select(entry('enemy-firewall-warning'));
    scene.sample(1200, camera);
    expect(enemy.material.color.getHex()).toBe(baseColor);
    expect(eye.morphTargetInfluences![scaredIndex]).toBe(1);
    scene.select(entry('enemy-firewall-normal'));
    scene.sample(0, camera);
    expect(enemy.material.color.getHex()).toBe(baseColor);
    expect(eye.morphTargetInfluences![scaredIndex]).toBe(0);

    scene.select(entry('player-idle'));
    scene.sample(0, camera);
    expect(packet.getObjectByName('motion-trail')?.visible).toBe(false);
    expect(packet.getObjectByName('death-effect')?.visible).toBe(false);
    expect(packet.getObjectByName('contact-shadow')?.visible).toBe(true);
    expect(scene.scene.getObjectByName('tile-guide')?.visible).toBe(true);
    scene.dispose();
    assets.dispose();
  });

  it('samples the requested endpoint and leaves loop policy to the preview clock', () => {
    const { assets, scene, camera } = preview();
    const sample = vi.spyOn(assets, 'sampleAnimation');
    scene.select(entry('player-idle'));
    scene.sample(6000, camera);
    expect(sample).toHaveBeenLastCalledWith(6);
    scene.select(entry('player-death'));
    scene.sample(2100, camera);
    const packet = scene.scene.getObjectByName('packet')!;
    expect(packet.visible).toBe(true);
    expect(packet.getObjectByName('hologram-body')?.visible).toBe(true);
    expect(packet.getObjectByName('death-effect')?.visible).toBe(false);
    scene.dispose();
    assets.dispose();
  });

  it.each([
    { id: 'player-powered', midpointMs: 160 },
    { id: 'enemy-virus-scared', midpointMs: 120 },
  ])('seeks directly and backward through the $id entry and exit transitions', ({ id, midpointMs }) => {
    const { assets, scene, camera } = preview();
    const rim = scene.scene.getObjectByName('packet')!.getObjectByName('rim-horizontal-1-1') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const eye = scene.scene.getObjectByName('enemy-virus')!.getObjectByName('eye-left') as Mesh;
    const sampleState = () => id === 'player-powered' ? rim.material.color.r : eye.morphTargetInfluences![eye.morphTargetDictionary!.scared];
    const selected = entry(id);
    scene.select(selected);
    scene.sample(midpointMs, camera);
    const entryMidpoint = sampleState();
    scene.sample(750, camera);
    const active = sampleState();
    scene.sample(0, camera);
    const normal = sampleState();
    expect(entryMidpoint).toBeGreaterThan(normal);
    expect(entryMidpoint).toBeLessThan(active);
    scene.sample(midpointMs, camera);
    expect(sampleState()).toBe(entryMidpoint);

    scene.sample(selected.durationMs - 160, camera);
    const exitMidpoint = sampleState();
    expect(exitMidpoint).toBeGreaterThan(normal);
    expect(exitMidpoint).toBeLessThan(active);
    scene.sample(selected.durationMs, camera);
    expect(sampleState()).toBe(normal);
    scene.sample(selected.durationMs - 160, camera);
    expect(sampleState()).toBe(exitMidpoint);
    scene.select(entry('player-idle'));
    scene.sample(0, camera);
    expect(sampleState()).toBe(normal);
    scene.dispose();
    assets.dispose();
  });

  it('uses matching framing for points while preserving their actual relative sizes', () => {
    const { assets, scene, camera } = preview();
    scene.select(entry('point-base'));
    const baseBounds = scene.bounds.clone();
    const base = scene.scene.getObjectByName('point-base')!;
    scene.select(entry('point-power'));
    scene.sample(1500, camera);
    const power = scene.scene.getObjectByName('point-power')!;
    expect(scene.bounds.equals(baseBounds)).toBe(true);
    const baseScale = new Vector3();
    const powerScale = new Vector3();
    base.matrix.decompose(new Vector3(), new Quaternion(), baseScale);
    power.matrix.decompose(new Vector3(), new Quaternion(), powerScale);
    expect(powerScale.x / baseScale.x).toBeCloseTo(1.6);
    scene.select(entry('player-death'));
    const envelope = scene.bounds.clone();
    for (const time of [0, 400, 900, 2100]) scene.sample(time, camera);
    expect(scene.bounds.equals(envelope)).toBe(true);
    scene.dispose();
    assets.dispose();
  });

  it('rotates and hovers the power star across seeking while the regular star stays static', () => {
    const { assets, scene, camera } = preview();
    const base = scene.scene.getObjectByName('point-base') as Mesh;
    const power = scene.scene.getObjectByName('point-power') as Mesh;
    const baseMatrix = base.matrix.clone();
    scene.select(entry('point-power'));
    scene.sample(750, camera);
    const midway = power.matrix.clone();
    const midwayPosition = new Vector3();
    const midwayRotation = new Quaternion();
    midway.decompose(midwayPosition, midwayRotation, new Vector3());
    expect(power.geometry).toBe(assets.powerPelletGeometry);
    expect(base.geometry).toBe(assets.pelletGeometry);
    expect(power.geometry).not.toBe(base.geometry);
    scene.sample(0, camera);
    const startPosition = new Vector3();
    const startRotation = new Quaternion();
    power.matrix.decompose(startPosition, startRotation, new Vector3());
    expect(midwayPosition.y).not.toBe(startPosition.y);
    expect(midwayRotation.angleTo(startRotation)).toBeGreaterThan(0);
    scene.sample(6000, camera);
    scene.sample(750, camera);
    expect(power.matrix.equals(midway)).toBe(true);
    expect(base.matrix.equals(baseMatrix)).toBe(true);
    scene.select(entry('point-base'));
    scene.sample(4000, camera);
    expect(base.matrix.equals(baseMatrix)).toBe(true);
    scene.dispose();
    assets.dispose();
  });

  it.each(['player-eating', 'effect-base', 'effect-power'])('rewinds %s absorption and its arrival pulse', (id) => {
    const { assets, scene, camera } = preview();
    scene.select(entry(id));
    scene.sample(0, camera);
    const packet = scene.scene.getObjectByName('packet')!;
    const star = scene.scene.getObjectByName('pellet-effect') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const rim = packet.getObjectByName('rim-horizontal-1-1') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const startPosition = star.position.clone();
    const startScale = star.scale.clone();
    const idleRimOpacity = rim.material.opacity;
    expect(packet.visible).toBe(true);
    expect(star.visible).toBe(true);
    expect(star.geometry).toBe(id === 'effect-power' ? assets.powerPelletGeometry : assets.pelletGeometry);

    scene.sample(90, camera);
    expect(star.scale.x).toBeLessThan(startScale.x);
    expect(star.position.y).toBeGreaterThan(startPosition.y);
    scene.sample(180, camera);
    expect(star.visible).toBe(false);
    scene.sample(240, camera);
    expect(rim.material.opacity).toBeGreaterThan(idleRimOpacity);
    scene.sample(300, camera);
    expect(rim.material.opacity).toBe(idleRimOpacity);

    scene.sample(0, camera);
    expect(star.visible).toBe(true);
    expect(star.position.equals(startPosition)).toBe(true);
    expect(star.scale.equals(startScale)).toBe(true);
    expect(rim.material.opacity).toBe(idleRimOpacity);
    scene.dispose();
    assets.dispose();
  });

  it('reuses three Spam copies across seeking and restores isolated normal presentation', () => {
    const { assets, scene, camera } = preview();
    const createEnemy = vi.spyOn(assets, 'createEnemy');
    const copies = [0, 1, 2].map((index) => scene.scene.getObjectByName(`enemy-spam-copy-${index}`)!);
    scene.select(entry('enemy-spam-split'));
    const bounds = scene.bounds.clone();
    scene.sample(3999, camera);
    expect(copies.every((copy) => !copy.visible)).toBe(true);
    scene.sample(4000, camera);
    expect(copies.map((copy) => copy.visible)).toEqual([true, false, false]);
    scene.sample(12000, camera);
    expect(copies.every((copy) => copy.visible)).toBe(true);
    expect(copies[0].getObjectByName('character-model')?.scale.x).toBe(0.8);
    scene.sample(0, camera);
    expect(copies.every((copy) => !copy.visible)).toBe(true);
    expect(scene.bounds.equals(bounds)).toBe(true);
    scene.select(entry('enemy-spam-normal'));
    scene.sample(0, camera);
    expect(copies.every((copy) => !copy.visible)).toBe(true);
    expect(scene.scene.getObjectByName('split-pulse')?.visible).toBe(false);
    expect(createEnemy).not.toHaveBeenCalled();
    scene.dispose();
    assets.dispose();
  });

  it('rewinds hunter intake and returning enemies and releases intake pixels on selection changes', () => {
    const { assets, scene, camera } = preview();
    const packet = scene.scene.getObjectByName('packet')!;
    const enemy = scene.scene.getObjectByName('enemy-virus')!;
    const bug = enemy.getObjectByName('return-bug')!;
    const collapse = enemy.getObjectByName('enemy-collapse')!;
    scene.select(entry('player-enemy-eating'));
    scene.sample(180, camera);
    expect(packet.getObjectByName('hunter-rig')?.visible).toBe(true);
    const pixels = scene.scene.getObjectByName('enemy-eat-pixels')!;
    const pixel = pixels.children[0] as Mesh<BufferGeometry, MeshBasicMaterial>;
    const disposeGeometry = vi.spyOn(pixel.geometry, 'dispose');
    const disposeMaterial = vi.spyOn(pixel.material, 'dispose');
    expect(pixels.visible).toBe(true);
    scene.sample(420, camera);
    expect(bug.visible).toBe(true);
    expect(collapse.visible).toBe(false);
    scene.sample(0, camera);
    expect(bug.visible).toBe(false);
    expect(collapse.visible).toBe(true);

    scene.select(entry('enemy-virus-returning'));
    expect(disposeGeometry).toHaveBeenCalledOnce();
    expect(disposeMaterial).toHaveBeenCalledOnce();
    scene.sample(0, camera);
    const start = enemy.position.clone();
    expect(bug.visible).toBe(true);
    scene.sample(750, camera);
    expect(enemy.position.x).toBeGreaterThan(start.x);
    scene.sample(1540, camera);
    const restoringScale = collapse.scale.clone();
    expect(restoringScale.x).toBeGreaterThan(0);
    expect(restoringScale.x).toBeLessThan(1);
    scene.sample(2000, camera);
    expect(bug.visible).toBe(false);
    expect(collapse.visible).toBe(true);
    scene.sample(1540, camera);
    expect(collapse.scale.equals(restoringScale)).toBe(true);
    scene.sample(0, camera);
    expect(bug.visible).toBe(true);
    expect(enemy.position.equals(start)).toBe(true);
    scene.select(entry('player-idle'));
    scene.sample(0, camera);
    expect(packet.getObjectByName('hunter-rig')?.visible).toBe(false);
    expect(scene.scene.getObjectByName('enemy-eat-pixels')).toBeUndefined();
    scene.dispose();
    assets.dispose();
  });

  it('samples detection markers and persistent slow zones without leaking effects across selections', () => {
    const { assets, scene, camera } = preview();
    scene.select(entry('enemy-ping-ping'));
    const bounds = scene.bounds.clone();
    scene.sample(300, camera);
    const marker = scene.scene.getObjectByName('ping-target')!;
    expect(marker.visible).toBe(true);
    expect(marker.position.x).toBe(176);
    scene.sample(600, camera);
    expect(marker.visible).toBe(false);
    expect(scene.bounds.equals(bounds)).toBe(true);
    scene.select(entry('enemy-lag-lag'));
    scene.sample(3500, camera);
    const zones = scene.scene.getObjectByName('enemy-effects')!.children.filter((child) => child.name === 'lag-zone-fill');
    expect(zones.filter((zone) => zone.visible)).toHaveLength(3);
    scene.sample(0, camera);
    expect(zones.every((zone) => !zone.visible)).toBe(true);
    scene.select(entry('player-idle'));
    scene.sample(0, camera);
    expect(marker.visible).toBe(false);
    expect(scene.scene.getObjectByName('packet')?.position.x).toBe(128);
    scene.dispose();
    assets.dispose();
  });

  it('disposes replaced maze and effect resources while leaving injected assets owned by the caller', () => {
    const { assets, scene } = preview();
    const disposeAssets = vi.spyOn(assets, 'dispose');
    const disposePointGeometry = vi.spyOn(assets.pelletGeometry, 'dispose');
    const disposePointMaterial = vi.spyOn(assets.pelletMaterial, 'dispose');
    scene.select(entry('effect-base'));
    const effect = scene.scene.getObjectByName('pellet-effect') as Mesh<BufferGeometry, MeshBasicMaterial>;
    expect(effect.geometry).toBe(assets.pelletGeometry);
    const disposeEffect = vi.spyOn(effect.material, 'dispose');
    scene.select(entry('wall-2'), { rotation: 90, flipX: true, flipY: false });
    expect(disposeEffect).toHaveBeenCalledOnce();
    expect(scene.scene.getObjectByName('pellet-effect')).toBeUndefined();
    const wall = scene.scene.getObjectByName('walls') as Mesh<BufferGeometry, MeshStandardMaterial>;
    const disposeWall = vi.spyOn(wall.geometry, 'dispose');
    scene.select(entry('other-sign'));
    expect(disposeWall).toHaveBeenCalledOnce();
    scene.dispose();
    scene.dispose();
    expect(disposeEffect).toHaveBeenCalledOnce();
    expect(disposeWall).toHaveBeenCalledOnce();
    expect(disposeAssets).not.toHaveBeenCalled();
    expect(disposePointGeometry).not.toHaveBeenCalled();
    expect(disposePointMaterial).not.toHaveBeenCalled();
    assets.dispose();
  });
});
