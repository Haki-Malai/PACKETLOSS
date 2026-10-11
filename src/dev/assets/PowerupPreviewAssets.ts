import {
  AnimationAction, AnimationMixer, Box3, BufferGeometry, LoopOnce, Material, Mesh,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { POWERUP_CATALOG } from './assetCatalog';

interface PowerupPreview {
  model: GLTF;
  mixer: AnimationMixer;
  action: AnimationAction;
  bounds: Box3;
}

/** Owns the gallery's texture-free powerup GLBs and their independently seekable clips. */
export class PowerupPreviewAssets {
  private readonly previews = new Map<string, PowerupPreview>();
  private disposed = false;

  /** Takes ownership of the parsed models for one gallery session. */
  constructor(private readonly models: ReadonlyMap<string, GLTF> = new Map()) {}

  /** Loads the manifest's models and releases completed parses after cancellation or any failure. */
  static async load(signal: AbortSignal): Promise<PowerupPreviewAssets> {
    signal.throwIfAborted();
    const loader = new GLTFLoader();
    const results = await Promise.allSettled(POWERUP_CATALOG.map(async (entry) => {
      try {
        const base = import.meta.env.DEV ? '/' : import.meta.env.BASE_URL;
        const response = await fetch(`${base}assets/models/powerups/${entry.file}`, { signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const model = await loader.parseAsync(await response.arrayBuffer(), '');
        return [entry.id, model] as const;
      } catch (error) {
        signal.throwIfAborted();
        throw new Error(`Unable to load powerup ${entry.file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }));
    const models = new Map<string, GLTF>();
    for (const result of results) if (result.status === 'fulfilled') models.set(...result.value);
    const assets = new PowerupPreviewAssets(models);
    const failed = results.find((result) => result.status === 'rejected');
    if (failed || signal.aborted) {
      assets.dispose();
      signal.throwIfAborted();
      throw failed?.reason;
    }
    return assets;
  }

  /** Caches a clip's full motion envelope so vanished starting poses and long beams frame correctly. */
  get(id: string): PowerupPreview {
    const cached = this.previews.get(id);
    if (cached) return cached;
    const model = this.models.get(id);
    const entry = POWERUP_CATALOG.find((candidate) => candidate.id === id);
    const clip = model?.animations.find((candidate) => candidate.name === entry?.clip);
    if (!model || !clip) throw new Error(`Missing powerup preview or animation: ${id}`);
    const mixer = new AnimationMixer(model.scene);
    const action = mixer.clipAction(clip);
    action.setLoop(LoopOnce, 1);
    action.clampWhenFinished = true;
    const preview = { model, mixer, action, bounds: new Box3() };
    this.previews.set(id, preview);
    const times = new Set([0, clip.duration, ...clip.tracks.flatMap((track) => Array.from(track.times))]);
    for (const time of times) {
      this.sample(id, time * 1000);
      preview.bounds.expandByObject(model.scene);
    }
    this.sample(id, 0);
    return preview;
  }

  /** Samples absolute milliseconds, including rewinding a clamped one-shot after its endpoint. */
  sample(id: string, timeMs: number): void {
    const { action, mixer } = this.get(id);
    action.reset().play();
    mixer.setTime(timeMs / 1000);
  }

  /** Stops mixers and releases every owned geometry/material once when the session ends. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const { mixer, model } of this.previews.values()) {
      mixer.stopAllAction();
      mixer.uncacheRoot(model.scene);
    }
    const resources = new Set<BufferGeometry | Material>();
    for (const model of this.models.values()) {
      model.scene.removeFromParent();
      model.scene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
        resources.add(mesh.geometry);
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) resources.add(material);
      });
    }
    for (const resource of resources) resource.dispose();
    this.previews.clear();
  }
}
