import { readFile } from 'node:fs/promises';
import { AnimationMixer, Box3, BufferGeometry, Camera, LoopOnce, Material, Mesh, Vector3, type Object3D } from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ASSET_CATALOG, POWERUP_CATALOG } from '../dev/assets/assetCatalog';
import { AssetPreviewScene } from '../dev/assets/AssetPreviewScene';
import { PowerupPreviewAssets } from '../dev/assets/PowerupPreviewAssets';
import { PowerupModel } from '../game/infrastructure/three/PowerupAssets';
import { disposeGlbResources } from '../game/infrastructure/three/GlbResources';
import { createCharacterAssets } from './fixtures/characterFixtures';

/** Fetches real authored files locally without starting a server or substituting their animations. */
async function fetchModel(url: string): Promise<Response> {
  const file = await readFile(new URL(`../../public${url}`, import.meta.url));
  return new Response(new Uint8Array(file));
}

/** Observes ownership of shared mesh resources without imposing an incidental geometry layout. */
function resourceSpies(model: GLTF) {
  const resources = new Set<BufferGeometry | Material>();
  model.scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
    resources.add(mesh.geometry);
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) resources.add(material);
  });
  return [...resources].map((resource) => vi.spyOn(resource, 'dispose'));
}

/** Captures asset-owned poses and morph weights for direct GLB/player/gallery parity, independent of world placement. */
function authoredPose(scene: Object3D) {
  const nodes: Array<{ name: string; position: number[]; rotation: number[]; scale: number[]; weights?: number[] }> = [];
  scene.traverse((node) => nodes.push({ name: node.name, position: node.position.toArray().map((value) => value + 0),
    rotation: node.quaternion.toArray().map((value) => value + 0), scale: node.scale.toArray().map((value) => value + 0),
    weights: node instanceof Mesh ? node.morphTargetInfluences?.slice() : undefined }));
  return nodes;
}

describe('Powerup asset previews', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('plays every powerup GLB unchanged in gameplay and the gallery, including seek and rewind', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const previews = await PowerupPreviewAssets.load(new AbortController().signal);
    for (const entry of POWERUP_CATALOG) {
      const bytes = await readFile(new URL(`../../public/assets/models/powerups/${entry.file}`, import.meta.url));
      const raw = await new GLTFLoader().parseAsync(new Uint8Array(bytes).buffer, '');
      const clip = raw.animations.find((candidate) => candidate.name === entry.clip)!;
      const mixer = new AnimationMixer(raw.scene);
      const action = mixer.clipAction(clip);
      action.setLoop(LoopOnce, 1); action.clampWhenFinished = true;
      const gameplay = new PowerupModel(raw, entry.clip, false);
      const preview = previews.get(entry.id);
      const sourceMeshes = new Map<string, Mesh>();
      raw.scene.traverse((node) => { if (node instanceof Mesh) sourceMeshes.set(node.name, node as Mesh); });
      const runtimeMeshes: Mesh[] = [];
      gameplay.scene.traverse((node) => { if (node instanceof Mesh) runtimeMeshes.push(node as Mesh); });
      expect(runtimeMeshes).toHaveLength(sourceMeshes.size);
      for (const node of runtimeMeshes) expect(node.geometry).toBe(sourceMeshes.get(node.name)!.geometry);
      for (const time of [0, entry.thumbnailMs, entry.durationMs - 1, entry.durationMs + 100, entry.thumbnailMs]) {
        mixer.stopAllAction();
        action.reset().play(); mixer.setTime(Math.min(clip.duration, time / 1000));
        gameplay.sample(time); previews.sample(entry.id, time);
        expect(authoredPose(gameplay.scene)).toEqual(authoredPose(raw.scene));
        expect(authoredPose(preview.model.scene)).toEqual(authoredPose(raw.scene));
      }
      gameplay.dispose(); mixer.stopAllAction(); mixer.uncacheRoot(raw.scene);
      disposeGlbResources([raw.scene]);
    }
    previews.dispose();
  });

  it('loads every authored clip and selects each in the gallery with stable full-animation framing', async () => {
    const fetch = vi.fn(fetchModel);
    vi.stubGlobal('fetch', fetch);
    const powerups = await PowerupPreviewAssets.load(new AbortController().signal);
    const assets = createCharacterAssets();
    const scene = new AssetPreviewScene(assets, powerups);
    const camera = new Camera();
    const disposers = [];
    expect(POWERUP_CATALOG).toHaveLength(22);
    expect(ASSET_CATALOG.filter((entry) => entry.category === 'Powerups')).toEqual(POWERUP_CATALOG);
    for (const entry of POWERUP_CATALOG) {
      const preview = powerups.get(entry.id);
      disposers.push(...resourceSpies(preview.model));
      expect(preview.model.animations.find((clip) => clip.name === entry.clip)!.duration * 1000).toBeCloseTo(entry.durationMs, 2);
      scene.select(entry);
      scene.sample(entry.thumbnailMs, camera);
      expect(preview.model.scene.parent).toBe(scene.scene);
      const envelope = scene.bounds.clone();
      expect(envelope.containsBox(new Box3().setFromObject(preview.model.scene, true))).toBe(true);
      expect(envelope.getCenter(new Vector3()).x).toBeCloseTo(128);
      expect(envelope.getCenter(new Vector3()).z).toBeCloseTo(128);
      scene.sample(entry.durationMs, camera);
      scene.sample(0, camera);
      expect(scene.bounds.equals(envelope)).toBe(true);
      scene.select(ASSET_CATALOG.find((candidate) => candidate.id === 'player-idle')!);
      expect(preview.model.scene.parent).toBeNull();
    }
    expect(fetch).toHaveBeenCalledTimes(22);
    scene.dispose();
    for (const dispose of disposers) expect(dispose).not.toHaveBeenCalled();
    powerups.dispose();
    powerups.dispose();
    for (const dispose of disposers) expect(dispose).toHaveBeenCalledOnce();
    assets.dispose();
  });

  it('rewinds the laser after its clamped endpoint and restores blast ring morphs on seeking', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const powerups = await PowerupPreviewAssets.load(new AbortController().signal);
    const laser = powerups.get('powerup-laser-beam');
    const core = laser.model.scene.getObjectByName('beam-white-core')!;
    expect(laser.bounds.max.z - laser.bounds.min.z).toBeGreaterThanOrEqual(64);
    powerups.sample('powerup-laser-beam', 730);
    const activeScale = core.scale.clone();
    expect(activeScale.x).toBeGreaterThan(0.5);
    powerups.sample('powerup-laser-beam', 1800);
    expect(core.scale.x).toBeLessThan(0.01);
    powerups.sample('powerup-laser-beam', 730);
    expect(core.scale.equals(activeScale)).toBe(true);
    const blast = powerups.get('powerup-blast-burst');
    const ring = blast.model.scene.getObjectByName('blast-pulse-front') as Mesh;
    powerups.sample('powerup-blast-burst', 700);
    expect(ring.morphTargetInfluences![0]).toBeCloseTo(0);
    powerups.sample('powerup-blast-burst', 1600);
    expect(ring.morphTargetInfluences![0]).toBeCloseTo(1);
    powerups.sample('powerup-blast-burst', 700);
    expect(ring.morphTargetInfluences![0]).toBeCloseTo(0);
    powerups.dispose();
  });

  it('releases parsed sibling models when one powerup file fails to load', async () => {
    vi.stubGlobal('fetch', (url: string) => url.endsWith('/laser-beam.glb')
      ? Promise.resolve(new Response(null, { status: 404 })) : fetchModel(url));
    const disposers: ReturnType<typeof resourceSpies> = [];
    const loader = new GLTFLoader();
    const parseAsync = loader.parseAsync.bind(loader);
    const parse = vi.spyOn(GLTFLoader.prototype, 'parseAsync').mockImplementation(async (data, path) => {
      const model = await parseAsync(data, path);
      disposers.push(...resourceSpies(model));
      return model;
    });
    await expect(PowerupPreviewAssets.load(new AbortController().signal)).rejects.toThrow('laser-beam.glb: HTTP 404');
    const models = await Promise.all(parse.mock.results.map((result) => result.value as Promise<GLTF>));
    expect(models).toHaveLength(21);
    for (const dispose of disposers) expect(dispose).toHaveBeenCalledOnce();
  });

  it('disposes late parse results after cancellation, even when they share geometry', async () => {
    vi.stubGlobal('fetch', fetchModel);
    const file = await readFile(new URL('../../public/assets/models/powerups/magnet-pickup.glb', import.meta.url));
    const model = await new GLTFLoader().parseAsync(new Uint8Array(file).buffer, '');
    const disposers = resourceSpies(model);
    let finish!: (_model: GLTF) => void;
    const pending = new Promise<GLTF>((resolve) => { finish = resolve; });
    const parse = vi.spyOn(GLTFLoader.prototype, 'parseAsync').mockReturnValue(pending);
    const abort = new AbortController();
    const starting = PowerupPreviewAssets.load(abort.signal);
    await vi.waitFor(() => expect(parse).toHaveBeenCalledTimes(22));
    abort.abort();
    finish(model);
    await expect(starting).rejects.toMatchObject({ name: 'AbortError' });
    for (const dispose of disposers) expect(dispose).toHaveBeenCalledOnce();
  });
});
