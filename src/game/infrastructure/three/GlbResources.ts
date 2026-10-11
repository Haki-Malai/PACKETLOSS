import { BufferGeometry, Material, Mesh, Texture, type Object3D } from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';

/** Releases shared mesh resources once, including siblings parsed after a cancelled load. */
export function disposeGlbResources(objects: Iterable<Object3D>): void {
  const resources = new Set<BufferGeometry | Material | Texture>();
  for (const object of objects) {
    object.removeFromParent();
    object.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      const mesh = child as Mesh<BufferGeometry, Material | Material[]>;
      resources.add(mesh.geometry);
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        resources.add(material);
        for (const value of Object.values(material)) if (value instanceof Texture) resources.add(value);
      }
    });
  }
  for (const resource of resources) resource.dispose();
}

/** Loads self-contained GLBs and disposes all completed siblings on failure or cancellation. */
export async function loadGlbCollection(
  folder: string,
  entries: readonly { id: string; file: string }[],
  signal?: AbortSignal,
): Promise<ReadonlyMap<string, GLTF>> {
  signal?.throwIfAborted();
  const loader = new GLTFLoader();
  const results = await Promise.allSettled(entries.map(async ({ id, file }) => {
    try {
      const base = import.meta.env.DEV ? '/' : import.meta.env.BASE_URL;
      const response = await fetch(`${base}assets/models/${folder}/${file}`, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return [id, await loader.parseAsync(await response.arrayBuffer(), '')] as const;
    } catch (error) {
      signal?.throwIfAborted();
      throw new Error(`Unable to load ${folder === 'powerups' ? 'powerup' : 'model'} ${file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }));
  const models = new Map<string, GLTF>();
  for (const result of results) if (result.status === 'fulfilled') models.set(...result.value);
  const failed = results.find((result) => result.status === 'rejected');
  if (failed || signal?.aborted) {
    disposeGlbResources([...models.values()].map(({ scene }) => scene));
    signal?.throwIfAborted();
    throw failed?.reason;
  }
  return models;
}
