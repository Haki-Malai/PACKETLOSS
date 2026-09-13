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

    scene.select(entry('ghost-blinky-normal'));
    scene.sample(0, camera);
    const ghost = scene.scene.getObjectByName('ghost-blinky')!.getObjectByName('body') as Mesh<BufferGeometry, MeshStandardMaterial>;
    const baseColor = ghost.material.color.getHex();
    scene.select(entry('ghost-blinky-scared'));
    scene.sample(0, camera);
    expect(ghost.material.color.getHex()).not.toBe(baseColor);
    scene.select(entry('ghost-blinky-normal'));
    scene.sample(0, camera);
    expect(ghost.material.color.getHex()).toBe(baseColor);

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

  it('disposes replaced maze and effect resources while leaving injected assets owned by the caller', () => {
    const { assets, scene } = preview();
    const disposeAssets = vi.spyOn(assets, 'dispose');
    const disposePointGeometry = vi.spyOn(assets.pelletGeometry, 'dispose');
    scene.select(entry('effect-base'));
    const effect = scene.scene.getObjectByName('pellet-effect') as Mesh<BufferGeometry, MeshBasicMaterial>;
    const disposeEffect = vi.spyOn(effect.material, 'dispose');
    scene.select(entry('wall-2'), { rotation: 90, flipX: true, flipY: false });
    expect(disposeEffect).toHaveBeenCalledOnce();
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
    assets.dispose();
  });
});
