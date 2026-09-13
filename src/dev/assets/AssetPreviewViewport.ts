import { Box3, OrthographicCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CAMERA } from '../../config/constants';
import { Camera3D } from '../../engine/camera3d';
import { ThreeRendererAdapter } from '../../game/infrastructure/adapters/ThreeRendererAdapter';
import { ArcadeAssets } from '../../game/infrastructure/three/ArcadeAssets';
import { AssetPreviewScene } from './AssetPreviewScene';
import type { AssetPreviewEntry } from './assetCatalog';

export type PreviewCameraMode = 'game' | 'orbit';
export interface PreviewTransform {
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

/** One WebGL context serves both the thumbnail snapshots and the live inspector. */
export class AssetPreviewViewport {
  private readonly renderer: ThreeRendererAdapter;
  private readonly preview: AssetPreviewScene;
  private readonly gameCamera = new Camera3D();
  private readonly orbitCamera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 4000);
  private readonly orbit: OrbitControls;
  private mode: PreviewCameraMode = 'game';
  private scaleMode: 'fit' | 'actual' | 'manual' = 'fit';
  private zoom: number = CAMERA.zoom;
  private width = 1;
  private height = 1;
  private dirty = true;
  private tileGuide = false;
  private lastTimeMs = -1;
  private disposed = false;

  constructor(private readonly canvas: HTMLCanvasElement, assets: ArcadeAssets) {
    this.renderer = new ThreeRendererAdapter(canvas);
    let preview: AssetPreviewScene | undefined;
    let orbit: OrbitControls | undefined;
    try {
      preview = new AssetPreviewScene(assets);
      this.preview = preview;
      orbit = new OrbitControls(this.orbitCamera, canvas);
      this.orbit = orbit;
      orbit.enabled = false;
      orbit.enablePan = false;
      orbit.enableZoom = false;
      orbit.enableDamping = false;
      orbit.target.set(128, 4, 128);
      orbit.addEventListener('change', this.invalidate);
      this.gameCamera.setBounds(256, 256);
      this.gameCamera.startFollow({ x: 128, y: 128 }, 1, 1);
      this.resetOrbit();
      canvas.addEventListener('wheel', this.onWheel, { passive: false });
    } catch (error) {
      orbit?.dispose();
      preview?.dispose();
      this.renderer.dispose();
      throw error;
    }
  }

  select(entry: AssetPreviewEntry, transform?: PreviewTransform): void {
    this.preview.select(entry, transform);
    this.lastTimeMs = -1;
    this.dirty = true;
    this.updateProjection();
  }

  resize(width: number, height: number): void {
    const nextWidth = Math.max(1, Math.round(width));
    const nextHeight = Math.max(1, Math.round(height));
    if (nextWidth === this.width && nextHeight === this.height) return;
    this.width = nextWidth;
    this.height = nextHeight;
    this.renderer.resize(nextWidth, nextHeight);
    this.updateProjection();
  }

  setCameraMode(mode: PreviewCameraMode): void {
    this.mode = mode;
    this.orbit.enabled = mode === 'orbit';
    this.updateProjection();
  }

  fit(): void {
    this.scaleMode = 'fit';
    this.updateProjection();
  }

  actualSize(): void {
    this.scaleMode = 'actual';
    this.updateProjection();
  }

  zoomBy(factor: number): void {
    this.scaleMode = 'manual';
    this.zoom = Math.max(0.25, Math.min(80, this.zoom * factor));
    this.updateProjection();
  }

  resetCamera(): void {
    this.mode = 'game';
    this.orbit.enabled = false;
    this.scaleMode = 'fit';
    this.resetOrbit();
    this.updateProjection();
  }

  setTileGuide(visible: boolean): void {
    this.tileGuide = visible;
    this.preview.setTileGuide(visible);
    this.updateProjection();
  }

  render(timeMs: number): void {
    if (this.disposed || (!this.dirty && timeMs === this.lastTimeMs)) return;
    if (this.mode === 'game') this.gameCamera.present(1, this.renderer.pixelRatio);
    const camera = this.mode === 'game' ? this.gameCamera.camera : this.orbitCamera;
    this.preview.sample(timeMs, camera);
    this.renderer.render(this.preview.scene, camera);
    this.lastTimeMs = timeMs;
    this.dirty = false;
  }

  snapshot(target: HTMLCanvasElement, timeMs: number): void {
    this.dirty = true;
    this.render(timeMs);
    // Copy immediately, before WebGL discards the drawing buffer; no persistent buffer is needed.
    target.getContext('2d')?.drawImage(this.canvas, 0, 0, target.width, target.height);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.orbit.removeEventListener('change', this.invalidate);
    this.orbit.dispose();
    this.preview.dispose();
    this.renderer.dispose();
  }

  private readonly invalidate = (): void => {
    this.dirty = true;
  };

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.zoomBy(Math.exp(-Math.sign(event.deltaY) * 0.12));
  };

  private resetOrbit(): void {
    this.orbitCamera.up.set(0, 1, 0);
    this.orbitCamera.position.set(168, 54, 178);
    this.orbit.target.set(128, 4, 128);
    this.orbit.update();
  }

  private updateProjection(): void {
    this.gameCamera.setViewport(this.width, this.height);
    this.orbitCamera.left = -this.width / 2;
    this.orbitCamera.right = this.width / 2;
    this.orbitCamera.top = this.height / 2;
    this.orbitCamera.bottom = -this.height / 2;
    if (this.scaleMode === 'actual') this.zoom = CAMERA.zoom;
    if (this.scaleMode === 'fit') {
      this.applyZoom(1);
      this.gameCamera.snapToFollowTarget();
      this.gameCamera.present(1, this.renderer.pixelRatio);
      this.orbitCamera.updateMatrixWorld();
      const camera = this.mode === 'game' ? this.gameCamera.camera : this.orbitCamera;
      const bounds = this.preview.bounds.clone();
      if (this.tileGuide) {
        bounds.expandByPoint(new Vector3(120, 0, 120));
        bounds.expandByPoint(new Vector3(136, 0, 136));
      }
      this.zoom = fitZoom(bounds, camera);
    }
    this.applyZoom(this.zoom);
    this.gameCamera.snapToFollowTarget();
    this.dirty = true;
  }

  private applyZoom(zoom: number): void {
    this.gameCamera.setZoom(zoom);
    this.orbitCamera.zoom = zoom;
    this.orbitCamera.updateProjectionMatrix();
  }
}

function fitZoom(bounds: Box3, camera: OrthographicCamera): number {
  if (bounds.isEmpty()) return CAMERA.zoom;
  const point = new Vector3();
  let extent = 0;
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        point.set(x, y, z).project(camera);
        extent = Math.max(extent, Math.abs(point.x), Math.abs(point.y));
      }
    }
  }
  return Math.max(0.25, Math.min(80, 0.85 / Math.max(extent, 0.001)));
}
