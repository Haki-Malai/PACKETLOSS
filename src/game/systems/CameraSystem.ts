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

  constructor(
    private readonly world: WorldState,
    private readonly camera: CameraLike,
    private readonly renderer: RendererViewport,
    private readonly canvas: HTMLCanvasElement,
    private readonly fitMaze = false,
  ) {}

  start(): void {
    this.camera.setBounds(this.world.map.widthInPixels, this.world.map.heightInPixels);
    this.camera.setZoom(CAMERA.zoom);
    this.camera.startFollow(this.world.packet, CAMERA.followLerp.x, CAMERA.followLerp.y);

    this.handleResize();
    this.camera.snapToFollowTarget();
    this.onResize = () => {
      this.handleResize();
      if (this.fitMaze) this.camera.snapToFollowTarget();
    };
    window.addEventListener('resize', this.onResize);
  }

  update(): void {
    this.camera.update();
  }

  destroy(): void {
    if (this.onResize) {
      window.removeEventListener('resize', this.onResize);
      this.onResize = undefined;
    }
  }

  private handleResize(): void {
    this.renderer.resize(window.innerWidth, window.innerHeight);

    const viewportWidth = Number.isFinite(this.renderer.width) ? this.renderer.width : this.canvas.width;
    const viewportHeight = Number.isFinite(this.renderer.height) ? this.renderer.height : this.canvas.height;

    this.camera.setViewport(viewportWidth, viewportHeight);
    if (this.fitMaze) {
      this.camera.setZoom(Math.min(CAMERA.zoom,
        viewportWidth / (this.world.map.widthInPixels + 32),
        viewportHeight / (this.world.map.heightInPixels + 32)));
    }
  }
}
