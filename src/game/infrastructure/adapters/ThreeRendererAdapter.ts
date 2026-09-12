import {
  ACESFilmicToneMapping, OrthographicCamera, Scene, SRGBColorSpace, WebGLRenderer,
} from 'three';

export interface RendererViewport {
  readonly width: number;
  readonly height: number;
  resize(width: number, height: number): void;
}

export class ThreeRendererAdapter implements RendererViewport {
  private readonly renderer: WebGLRenderer;
  private viewportWidth = 1;
  private viewportHeight = 1;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement) {
    try {
      this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
    } catch {
      throw new Error('The 3D game requires WebGL 2. Enable hardware acceleration or try a browser that supports WebGL 2.');
    }
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
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

  resize(width: number, height: number): void {
    this.viewportWidth = Math.max(1, Math.round(width));
    this.viewportHeight = Math.max(1, Math.round(height));
    const devicePixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio;
    const pixelRatio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? Math.min(devicePixelRatio, 2) : 1;
    this.renderer.setDrawingBufferSize(this.viewportWidth, this.viewportHeight, pixelRatio);
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
