import { BufferGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three';
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

  it('restores player and ghost presentation when changing states without losing the tile guide', () => {
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

    scene.select(entry('ghost-firewall-normal'));
    scene.sample(0, camera);
    const ghost = scene.scene.getObjectByName('ghost-firewall')!.getObjectByName('body') as Mesh<BufferGeometry, MeshStandardMaterial>;
    const eye = scene.scene.getObjectByName('ghost-firewall')!.getObjectByName('eye-left') as Mesh;
    const scaredIndex = eye.morphTargetDictionary!.scared;
    const baseColor = ghost.material.color.getHex();
    scene.select(entry('ghost-firewall-scared'));
    scene.sample(240, camera);
    expect(ghost.material.color.getHex()).not.toBe(baseColor);
    expect(eye.morphTargetInfluences![scaredIndex]).toBe(1);
    scene.select(entry('ghost-firewall-warning'));
    scene.sample(1200, camera);
    expect(ghost.material.color.getHex()).toBe(baseColor);
    expect(eye.morphTargetInfluences![scaredIndex]).toBe(1);
    scene.select(entry('ghost-firewall-normal'));
    scene.sample(0, camera);
    expect(ghost.material.color.getHex()).toBe(baseColor);
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
    { id: 'ghost-virus-scared', midpointMs: 120 },
  ])('seeks directly and backward through the $id entry and exit transitions', ({ id, midpointMs }) => {
    const { assets, scene, camera } = preview();
    const rim = scene.scene.getObjectByName('packet')!.getObjectByName('rim-horizontal-1-1') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const eye = scene.scene.getObjectByName('ghost-virus')!.getObjectByName('eye-left') as Mesh;
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
    const power = scene.scene.getObjectByName('point-power')!;
    expect(scene.bounds.equals(baseBounds)).toBe(true);
    expect(power.matrix.elements[0] / base.matrix.elements[0]).toBeCloseTo(1.6);
    scene.select(entry('player-death'));
    const envelope = scene.bounds.clone();
    for (const time of [0, 400, 900, 2100]) scene.sample(time, camera);
    expect(scene.bounds.equals(envelope)).toBe(true);
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
    expect(star.geometry).toBe(assets.pelletGeometry);

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
    const createGhost = vi.spyOn(assets, 'createGhost');
    const copies = [0, 1, 2].map((index) => scene.scene.getObjectByName(`ghost-spam-copy-${index}`)!);
    scene.select(entry('ghost-spam-split'));
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
    scene.select(entry('ghost-spam-normal'));
    scene.sample(0, camera);
    expect(copies.every((copy) => !copy.visible)).toBe(true);
    expect(scene.scene.getObjectByName('split-pulse')?.visible).toBe(false);
    expect(createGhost).not.toHaveBeenCalled();
    scene.dispose();
    assets.dispose();
  });

  it('rewinds hunter intake and returning enemies and releases intake pixels on selection changes', () => {
    const { assets, scene, camera } = preview();
    const packet = scene.scene.getObjectByName('packet')!;
    const ghost = scene.scene.getObjectByName('ghost-virus')!;
    const bug = ghost.getObjectByName('return-bug')!;
    const collapse = ghost.getObjectByName('ghost-collapse')!;
    scene.select(entry('player-ghost-eating'));
    scene.sample(180, camera);
    expect(packet.getObjectByName('hunter-rig')?.visible).toBe(true);
    const pixels = scene.scene.getObjectByName('ghost-eat-pixels')!;
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

    scene.select(entry('ghost-virus-returning'));
    expect(disposeGeometry).toHaveBeenCalledOnce();
    expect(disposeMaterial).toHaveBeenCalledOnce();
    scene.sample(0, camera);
    const start = ghost.position.clone();
    expect(bug.visible).toBe(true);
    scene.sample(750, camera);
    expect(ghost.position.x).toBeGreaterThan(start.x);
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
    expect(ghost.position.equals(start)).toBe(true);
    scene.select(entry('player-idle'));
    scene.sample(0, camera);
    expect(packet.getObjectByName('hunter-rig')?.visible).toBe(false);
    expect(scene.scene.getObjectByName('ghost-eat-pixels')).toBeUndefined();
    scene.dispose();
    assets.dispose();
  });

  it('samples detection markers and persistent slow zones without leaking effects across selections', () => {
    const { assets, scene, camera } = preview();
    scene.select(entry('ghost-ping-ping'));
    const bounds = scene.bounds.clone();
    scene.sample(300, camera);
    const marker = scene.scene.getObjectByName('ping-target')!;
    expect(marker.visible).toBe(true);
    expect(marker.position.x).toBe(176);
    scene.sample(600, camera);
    expect(marker.visible).toBe(false);
    expect(scene.bounds.equals(bounds)).toBe(true);
    scene.select(entry('ghost-lag-lag'));
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
