import { ArcadeAssets } from '../../game/infrastructure/three/ArcadeAssets';
import { AssetPreviewViewport } from './AssetPreviewViewport';
import { PowerupPreviewAssets } from './PowerupPreviewAssets';

/** Owns gallery startup and the assets borrowed by its viewport. */
export class AssetPreviewSession {
  private readonly abort = new AbortController();
  private assets: ArcadeAssets | null = null;
  private powerups: PowerupPreviewAssets | null = null;
  private viewport: AssetPreviewViewport | null = null;
  private starting: Promise<AssetPreviewViewport | null> | null = null;
  private disposed = false;

  constructor(private readonly canvas: HTMLCanvasElement) {}

  start(): Promise<AssetPreviewViewport | null> {
    if (this.disposed) return Promise.resolve(null);
    this.starting ??= this.initialize();
    return this.starting;
  }

  /** Cancels startup and disposes the viewport before its borrowed model collections. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.abort.abort();
    const viewport = this.viewport;
    const assets = this.assets;
    const powerups = this.powerups;
    this.viewport = null;
    this.assets = null;
    this.powerups = null;
    try {
      viewport?.dispose();
    } finally {
      assets?.dispose();
      powerups?.dispose();
    }
  }

  /** Loads both model collections before exposing the inspector and its thumbnail renderer. */
  private async initialize(): Promise<AssetPreviewViewport | null> {
    try {
      const assets = await ArcadeAssets.load(this.abort.signal);
      if (this.disposed) {
        assets.dispose();
        return null;
      }
      this.assets = assets;
      const powerups = await PowerupPreviewAssets.load(this.abort.signal);
      if (this.disposed) {
        powerups.dispose();
        return null;
      }
      this.powerups = powerups;
      this.viewport = new AssetPreviewViewport(this.canvas, assets, powerups);
      return this.viewport;
    } catch (error) {
      const cancelled = this.abort.signal.aborted;
      this.dispose();
      if (cancelled) return null;
      throw error;
    }
  }
}
