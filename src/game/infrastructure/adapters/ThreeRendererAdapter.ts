import {
  ACESFilmicToneMapping, OrthographicCamera, Scene, SRGBColorSpace, WebGLRenderer,
} from 'three';

export interface RendererViewport {
  readonly width: number;
  readonly height: number;
  resize(width: number, height: number): void;
  recordFrame?(elapsedMs: number, active: boolean): void;
}

export class ThreeRendererAdapter implements RendererViewport {
  private readonly renderer: WebGLRenderer;
  private viewportWidth = 1;
  private viewportHeight = 1;
  private appliedWidth = 0;
  private appliedHeight = 0;
  private bufferWidth = 0;
  private bufferHeight = 0;
  private resolutionTier = 0;
  private warmupMs = 0;
  private sampleMs = 0;
  private sampleFrames = 0;
  private wasActive = false;
  private disposed = false;

  /** Creates a renderer, optionally enabling per-run gameplay resolution adaptation. */
  constructor(canvas: HTMLCanvasElement, private readonly adaptiveResolution = false) {
    try {
      this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
    } catch {
      throw new Error('The 3D game requires WebGL 2. Enable hardware acceleration or try a browser that supports WebGL 2.');
    }
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.localClippingEnabled = true;
  }

  get width(): number {
    return this.viewportWidth;
  }

  get height(): number {
    return this.viewportHeight;
  }

  get pixelRatio(): number {
    return this.renderer.getPixelRatio();
  }

  /** Sets the CSS viewport and reallocates only when its physical buffer size changes. */
  resize(width: number, height: number): void {
    const nextWidth = Math.max(1, Math.round(width));
    const nextHeight = Math.max(1, Math.round(height));
    const changed = nextWidth !== this.viewportWidth || nextHeight !== this.viewportHeight;
    this.viewportWidth = nextWidth;
    this.viewportHeight = nextHeight;
    if (changed) this.resetFrameSamples();
    this.updateDrawingBuffer();
  }

  /** Downgrades gameplay resolution after sustained slow active frames. */
  recordFrame(elapsedMs: number, active: boolean): void {
    if (!this.adaptiveResolution || this.disposed) return;
    if (!active) {
      this.resetFrameSamples();
      return;
    }
    if (!this.wasActive) {
      this.wasActive = true;
      return;
    }
    if (!Number.isFinite(elapsedMs) || elapsedMs <= 0 || elapsedMs > 250) return;
    if (this.warmupMs < 2000) {
      this.warmupMs += elapsedMs;
      return;
    }
    this.sampleMs += elapsedMs;
    this.sampleFrames += 1;
    if (this.sampleMs < 2000) return;
    if (this.sampleMs / this.sampleFrames > 20 && this.resolutionTier < 2) {
      this.resolutionTier += 1;
      this.updateDrawingBuffer();
      this.resetFrameSamples();
    } else {
      this.sampleMs = 0;
      this.sampleFrames = 0;
    }
  }

  /** Drops timing history after pauses, resizes, and quality changes. */
  private resetFrameSamples(): void {
    this.warmupMs = 0;
    this.sampleMs = 0;
    this.sampleFrames = 0;
    this.wasActive = false;
  }

  /** Keeps gameplay pixels within the 1080p budget while retaining CSS viewport coordinates. */
  private updateDrawingBuffer(): void {
    const devicePixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio;
    const nativeRatio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
    const budgetRatio = Math.sqrt((1920 * 1080) / (this.viewportWidth * this.viewportHeight));
    const tiers = [1, 5 / 6, 2 / 3];
    const pixelRatio = this.adaptiveResolution
      ? Math.min(nativeRatio, 1, budgetRatio) * tiers[this.resolutionTier]
      : Math.min(nativeRatio, 2);
    const bufferWidth = Math.floor(this.viewportWidth * pixelRatio);
    const bufferHeight = Math.floor(this.viewportHeight * pixelRatio);
    if (this.viewportWidth === this.appliedWidth && this.viewportHeight === this.appliedHeight
      && bufferWidth === this.bufferWidth && bufferHeight === this.bufferHeight) return;
    this.appliedWidth = this.viewportWidth;
    this.appliedHeight = this.viewportHeight;
    this.bufferWidth = bufferWidth;
    this.bufferHeight = bufferHeight;
    this.renderer.setDrawingBufferSize(this.viewportWidth, this.viewportHeight, pixelRatio);
  }

  /** Waits for scene shaders to finish compiling before the first gameplay frame. */
  async prepare(scene: Scene, camera: OrthographicCamera): Promise<void> {
    if (this.disposed) return;
    await this.renderer.compileAsync(scene, camera);
  }

  render(scene: Scene, camera: OrthographicCamera): void {
    if (this.disposed) {
      return;
    }
    this.renderer.render(scene, camera);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.renderer.dispose();
  }
}
