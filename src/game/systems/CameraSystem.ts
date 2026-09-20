import { CAMERA } from '../../config/constants';
import { WorldState } from '../domain/world/WorldState';
import { RendererViewport } from '../infrastructure/adapters/ThreeRendererAdapter';

interface CameraLike {
  setBounds(width: number, height: number): void;
  setZoom(zoom: number): void;
  setViewport(width: number, height: number): void;
  startFollow(target: { x: number; y: number }, lerpX: number, lerpY: number): void;
  snapToFollowTarget(): void;
  update(): void;
}

export class CameraSystem {
  readonly updatePhase = 'afterSimulation' as const;
  private onResize?: () => void;
  private resizeObserver?: ResizeObserver;

  constructor(
    private readonly world: WorldState,
    private readonly camera: CameraLike,
    private readonly renderer: RendererViewport,
    private readonly canvas: HTMLCanvasElement,
    private readonly fitMaze = false,
  ) {}

  /** Starts camera tracking and observes the scene mount for viewport changes. */
  start(): void {
    this.camera.setBounds(this.world.map.widthInPixels, this.world.map.heightInPixels);
    this.camera.startFollow(this.world.packet, CAMERA.followLerp.x, CAMERA.followLerp.y);

    this.handleResize();
    this.camera.snapToFollowTarget();
    this.onResize = () => {
      this.handleResize();
      if (this.fitMaze) this.camera.snapToFollowTarget();
    };
    window.addEventListener('resize', this.onResize);
    const container = this.canvas.parentElement;
    if (container && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(container);
    }
  }

  update(): void {
    this.camera.update();
  }

  /** Releases resize listeners and the scene mount observer. */
  destroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    if (this.onResize) {
      window.removeEventListener('resize', this.onResize);
      this.onResize = undefined;
    }
  }

  /** Fits the scene to its CSS container and preserves the 1080px reference framing. */
  private handleResize(): void {
    const container = this.canvas.parentElement;
    const width = container ? container.getBoundingClientRect().width : window.innerWidth;
    const height = container ? container.getBoundingClientRect().height : window.innerHeight;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
    this.renderer.resize(width, height);

    const viewportWidth = Number.isFinite(this.renderer.width) ? this.renderer.width : this.canvas.width;
    const viewportHeight = Number.isFinite(this.renderer.height) ? this.renderer.height : this.canvas.height;

    this.camera.setViewport(viewportWidth, viewportHeight);
    const referenceZoom = CAMERA.zoom * viewportHeight / 1080;
    if (this.fitMaze) {
      this.camera.setZoom(Math.min(referenceZoom,
        viewportWidth / (this.world.map.widthInPixels + 32),
        viewportHeight / (this.world.map.heightInPixels + 32)));
    } else {
      this.camera.setZoom(referenceZoom);
    }
  }
}
