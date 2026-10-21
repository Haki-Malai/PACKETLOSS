import { Box3 } from 'three';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { disposeGlbResources, loadGlbCollection } from '../../game/infrastructure/three/GlbResources';
import { PowerupModel } from '../../game/infrastructure/three/PowerupAssets';
import { POWERUP_CATALOG } from './assetCatalog';

interface PowerupPreview {
  model: GLTF;
  instance: PowerupModel;
  bounds: Box3;
}

/** Previews the canonical powerup GLBs through the same animation player used in gameplay. */
export class PowerupPreviewAssets {
  private readonly previews = new Map<string, PowerupPreview>();
  private disposed = false;

  /** Takes ownership of the parsed models for one gallery session. */
  constructor(private readonly models: ReadonlyMap<string, GLTF> = new Map()) {}

  /** Loads the manifest's models and releases completed parses after cancellation or any failure. */
  static async load(signal: AbortSignal): Promise<PowerupPreviewAssets> {
    return new PowerupPreviewAssets(await loadGlbCollection('powerups', POWERUP_CATALOG, signal));
  }

  /** Caches a clip's full motion envelope so vanished starting poses and long beams frame correctly. */
  get(id: string): PowerupPreview {
    const cached = this.previews.get(id);
    if (cached) return cached;
    const model = this.models.get(id);
    const entry = POWERUP_CATALOG.find((candidate) => candidate.id === id);
    const clip = model?.animations.find((candidate) => candidate.name === entry?.clip);
    if (!model || !entry || !clip) throw new Error(`Missing powerup preview or animation: ${id}`);
    const instance = new PowerupModel(model, entry.clip, false);
    const preview = { model: { ...model, scene: instance.scene }, instance, bounds: new Box3() };
    this.previews.set(id, preview);
    const times = new Set([0, clip.duration, ...clip.tracks.flatMap((track) => Array.from(track.times))]);
    for (const time of times) {
      this.sample(id, time * 1000);
      preview.bounds.expandByObject(instance.scene, true);
    }
    this.sample(id, 0);
    return preview;
  }

  /** Samples absolute milliseconds, including rewinding a clamped one-shot after its endpoint. */
  sample(id: string, timeMs: number): void {
    this.get(id).instance.sample(timeMs);
  }

  /** Stops mixers and releases every owned geometry/material once when the session ends. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const { instance } of this.previews.values()) instance.dispose();
    disposeGlbResources([...this.models.values()].map(({ scene }) => scene));
    this.previews.clear();
  }
}
