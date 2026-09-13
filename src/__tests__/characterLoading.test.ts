import { readFile } from 'node:fs/promises';
import { Box3, BufferGeometry, Group, Material, Mesh } from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ArcadeAssets } from '../game/infrastructure/three/ArcadeAssets';
import { createCharacterModels } from './fixtures/characterFixtures';

function resourceSpies(scene: Group) {
  const resources = new Set<BufferGeometry | Material>();
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
    resources.add(mesh.geometry);
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) resources.add(material);
  });
  return [...resources].map((resource) => vi.spyOn(resource, 'dispose'));
}

describe('Character model loading', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('loads five enemy templates and keeps the full copy pool within the character triangle budget', async () => {
    const fetchModel = vi.fn(async (url: string) => {
      const path = new URL(url, 'https://game.invalid').pathname;
      const file = await readFile(new URL(`../../public${path}`, import.meta.url));
      return new Response(new Uint8Array(file));
    });
    vi.stubGlobal('fetch', fetchModel);
    const parse = vi.spyOn(GLTFLoader.prototype, 'parseAsync');
    const assets = await ArcadeAssets.load();
    const loaded = await Promise.all(parse.mock.results.map((result) => result.value as Promise<GLTF>));
    expect(fetchModel.mock.calls.map(([url]) => url)).toEqual([
      '/assets/models/enemies/firewall.glb', '/assets/models/enemies/virus.glb',
      '/assets/models/enemies/ping.glb', '/assets/models/enemies/spam.glb', '/assets/models/enemies/lag.glb',
    ]);
    for (const model of loaded) {
      expect(model.animations).toHaveLength(1);
      for (const clip of model.animations) {
        expect(clip.name).toBe('idle');
        expect(clip.duration).toBeCloseTo(6);
        expect(clip.tracks.length).toBeGreaterThan(0);
      }
    }
    const packet = assets.createPacket();
    const enemies = (['firewall', 'virus', 'ping', 'spam', 'lag'] as const).map((key) => assets.createGhost(key));
    const copies = Array.from({ length: 3 }, () => {
      const copy = assets.createGhost('spam');
      copy.scale.setScalar(0.8);
      return copy;
    });
    const characters = [packet, ...enemies, ...copies];
    let triangles = 0;
    for (const character of characters) {
      character.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        const mesh = object as Mesh<BufferGeometry>;
        triangles += (mesh.geometry.index?.count ?? mesh.geometry.attributes.position.count) / 3;
      });
    }
    expect(triangles).toBeLessThanOrEqual(100000);

    for (let frame = 0; frame <= 24; frame += 1) {
      assets.sampleAnimation(frame / 4);
      for (const character of characters) {
        const bounds = new Box3().setFromObject(character, true);
        expect(bounds.min.x).toBeGreaterThanOrEqual(-8);
        expect(bounds.max.x).toBeLessThanOrEqual(8);
        expect(bounds.min.z).toBeGreaterThanOrEqual(-8);
        expect(bounds.max.z).toBeLessThanOrEqual(8);
      }
    }
    let sourceTriangles = 0;
    for (const model of loaded) {
      model.scene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        const geometry = (object as Mesh<BufferGeometry>).geometry;
        sourceTriangles += (geometry.index?.count ?? geometry.attributes.position.count) / 3;
      });
    }
    expect(sourceTriangles).toBeLessThanOrEqual(24000);
    for (let frame = 0; frame <= 24; frame += 1) {
      assets.sampleAnimation(frame / 4);
      for (const enemy of enemies) {
        const bounds = new Box3().setFromObject(enemy, true);
        expect(bounds.min.x).toBeGreaterThanOrEqual(-5.5001);
        expect(bounds.max.x).toBeLessThanOrEqual(5.5001);
        expect(bounds.min.z).toBeGreaterThanOrEqual(-5.5001);
        expect(bounds.max.z).toBeLessThanOrEqual(5.5001);
      }
    }
    assets.dispose();
  });

  it('releases completed models, including a late parser result, when a sibling fails', async () => {
    const models = createCharacterModels();
    const disposals = [models.virus, models.ping, models.spam, models.lag].flatMap((model) => resourceSpies(model.scene));
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(new Uint8Array(4)))));
    let finishParse!: (_model: GLTF) => void;
    const lateModel = new Promise<GLTF>((resolve) => { finishParse = resolve; });
    const parse = vi.spyOn(GLTFLoader.prototype, 'parseAsync')
      .mockRejectedValueOnce(new Error('Invalid model'))
      .mockResolvedValueOnce(models.virus as GLTF)
      .mockResolvedValueOnce(models.ping as GLTF)
      .mockResolvedValueOnce(models.spam as GLTF)
      .mockReturnValueOnce(lateModel);
    const loading = ArcadeAssets.load();
    await vi.waitFor(() => expect(parse).toHaveBeenCalledTimes(5));
    finishParse(models.lag as GLTF);
    await expect(loading).rejects.toThrow('Unable to load character model firewall.glb: Invalid model');
    for (const dispose of disposals) expect(dispose).toHaveBeenCalledOnce();
  });

  it('passes cancellation to fetch and disposes models when parsing finishes after abort', async () => {
    const models = createCharacterModels();
    const disposals = Object.values(models).flatMap((model) => resourceSpies(model.scene));
    const abort = new AbortController();
    const fetchModel = vi.fn(() => Promise.resolve(new Response(new Uint8Array(4))));
    vi.stubGlobal('fetch', fetchModel);
    let finishParse!: (_model: GLTF) => void;
    const lateModel = new Promise<GLTF>((resolve) => { finishParse = resolve; });
    const parse = vi.spyOn(GLTFLoader.prototype, 'parseAsync')
      .mockResolvedValueOnce(models.firewall as GLTF)
      .mockResolvedValueOnce(models.virus as GLTF)
      .mockResolvedValueOnce(models.ping as GLTF)
      .mockResolvedValueOnce(models.spam as GLTF)
      .mockReturnValueOnce(lateModel);
    const loading = ArcadeAssets.load(abort.signal);
    await vi.waitFor(() => expect(parse).toHaveBeenCalledTimes(5));
    expect(fetchModel).toHaveBeenCalledWith('/assets/models/enemies/firewall.glb', { signal: abort.signal });
    abort.abort();
    finishParse(models.lag as GLTF);
    await expect(loading).rejects.toMatchObject({ name: 'AbortError' });
    for (const dispose of disposals) expect(dispose).toHaveBeenCalledOnce();
  });
});
