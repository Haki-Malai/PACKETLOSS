import { BufferGeometry, LineSegments, Material, Mesh, OrthographicCamera, Scene } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CAMERA } from '../config/constants';
import { Camera3D } from '../engine/camera3d';
import { AssetPreviewViewport } from '../dev/assets/AssetPreviewViewport';
import { ASSET_CATALOG } from '../dev/assets/assetCatalog';
import { createCharacterAssets } from './fixtures/characterFixtures';

const boundary = vi.hoisted(() => ({
  constructRenderer: vi.fn<(_canvas: HTMLCanvasElement) => void>(),
  render: vi.fn<(_scene: Scene, _camera: OrthographicCamera) => void>(),
  resize: vi.fn(),
  disposeRenderer: vi.fn(),
  constructOrbit: vi.fn<(_camera: OrthographicCamera, _canvas: HTMLCanvasElement) => void>(),
  updateOrbit: vi.fn(),
  disposeOrbit: vi.fn(),
  changes: new Set<() => void>(),
}));

vi.mock('../game/infrastructure/adapters/ThreeRendererAdapter', () => ({
  ThreeRendererAdapter: class {
    readonly pixelRatio = 1;
    readonly render = boundary.render;
    readonly resize = boundary.resize;
    readonly dispose = boundary.disposeRenderer;

    constructor(canvas: HTMLCanvasElement) {
      boundary.constructRenderer(canvas);
    }
  },
}));

vi.mock('three/addons/controls/OrbitControls.js', async () => {
  const { Vector3 } = await import('three');
  return {
    OrbitControls: class {
      readonly target = new Vector3();
      enabled = true;
      enablePan = true;
      enableZoom = true;
      enableDamping = true;

      constructor(private readonly camera: OrthographicCamera, canvas: HTMLCanvasElement) {
        boundary.constructOrbit(camera, canvas);
      }

      addEventListener(_type: string, listener: () => void): void {
        boundary.changes.add(listener);
      }

      removeEventListener(_type: string, listener: () => void): void {
        boundary.changes.delete(listener);
      }

      update(): void {
        this.camera.lookAt(this.target);
        this.camera.updateMatrixWorld();
        boundary.updateOrbit();
      }

      dispose(): void {
        boundary.disposeOrbit();
      }
    },
  };
});

function createViewport() {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  const canvas = { addEventListener, removeEventListener } as unknown as HTMLCanvasElement;
  const assets = createCharacterAssets();
  const viewport = new AssetPreviewViewport(canvas, assets);
  viewport.resize(320, 240);
  return { viewport, assets, canvas, addEventListener, removeEventListener };
}

describe('AssetPreviewViewport presentation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    boundary.changes.clear();
  });

  afterEach(() => vi.restoreAllMocks());

  it('uses the corrected game projection and restores it after inspecting with a separate orbit camera', () => {
    const { viewport, assets, canvas } = createViewport();
    viewport.actualSize();
    viewport.render(0);
    const gameCamera = boundary.render.mock.lastCall![1];
    const expected = new Camera3D();
    expected.setBounds(256, 256);
    expected.setViewport(320, 240);
    expected.setZoom(CAMERA.zoom);
    expected.startFollow({ x: 128, y: 128 }, 1, 1);
    expected.snapToFollowTarget();
    expected.present();
    expect(gameCamera.projectionMatrix.equals(expected.camera.projectionMatrix)).toBe(true);
    expect(gameCamera.quaternion.angleTo(expected.camera.quaternion)).toBeCloseTo(0);
    const corrected = gameCamera.projectionMatrix.clone();

    viewport.setCameraMode('orbit');
    viewport.render(0);
    const orbitCamera = boundary.render.mock.lastCall![1];
    expect(orbitCamera).toBeInstanceOf(OrthographicCamera);
    expect(orbitCamera).not.toBe(gameCamera);
    expect(boundary.constructOrbit).toHaveBeenCalledExactlyOnceWith(orbitCamera, canvas);
    expect(boundary.updateOrbit).toHaveBeenCalled();
    viewport.render(0);
    expect(boundary.render).toHaveBeenCalledTimes(2);
    boundary.changes.forEach((listener) => listener());
    viewport.render(0);
    expect(boundary.render).toHaveBeenCalledTimes(3);

    viewport.setCameraMode('game');
    viewport.render(0);
    expect(boundary.render.mock.lastCall![1]).toBe(gameCamera);
    expect(gameCamera.projectionMatrix.equals(corrected)).toBe(true);
    viewport.dispose();
    assets.dispose();
  });

  it('renders snapshots through the same renderer and immediately copies its actual canvas', () => {
    const { viewport, assets, canvas } = createViewport();
    viewport.render(120);
    const scene = boundary.render.mock.lastCall![0];
    const drawImage = vi.fn();
    const getContext = vi.fn(() => ({ drawImage }));
    const thumbnail = { width: 160, height: 96, getContext } as unknown as HTMLCanvasElement;
    viewport.snapshot(thumbnail, 120);
    expect(boundary.constructRenderer).toHaveBeenCalledExactlyOnceWith(canvas);
    expect(boundary.render).toHaveBeenCalledTimes(2);
    expect(boundary.render.mock.lastCall![0]).toBe(scene);
    expect(getContext).toHaveBeenCalledWith('2d');
    expect(drawImage).toHaveBeenCalledExactlyOnceWith(canvas, 0, 0, 160, 96);
    expect(boundary.render.mock.invocationCallOrder[1]).toBeLessThan(drawImage.mock.invocationCallOrder[0]);
    viewport.dispose();
    assets.dispose();
  });

  it('disposes its scene, controls, adapter and listeners once while retaining borrowed character assets', () => {
    const { viewport, assets, addEventListener, removeEventListener } = createViewport();
    const disposeAssets = vi.spyOn(assets, 'dispose');
    const disposeBorrowedGeometry = vi.spyOn(assets.pelletGeometry, 'dispose');
    viewport.select(ASSET_CATALOG.find((entry) => entry.id === 'effect-base')!);
    viewport.render(20);
    const scene = boundary.render.mock.lastCall![0];
    const owned = ['preview-floor', 'tile-guide', 'pellet-effect'].map((name) => scene.getObjectByName(name) as Mesh<BufferGeometry, Material> | LineSegments<BufferGeometry, Material>);
    const resources = new Set(owned.flatMap((object) => [object.geometry, object.material]));
    const disposals = [...resources].map((resource) => vi.spyOn(resource, 'dispose'));
    expect(addEventListener).toHaveBeenCalledWith('wheel', expect.any(Function), { passive: false });

    viewport.dispose();
    viewport.dispose();
    for (const dispose of disposals) expect(dispose).toHaveBeenCalledOnce();
    expect(boundary.disposeOrbit).toHaveBeenCalledOnce();
    expect(boundary.disposeRenderer).toHaveBeenCalledOnce();
    expect(removeEventListener).toHaveBeenCalledWith('wheel', expect.any(Function));
    expect(boundary.changes.size).toBe(0);
    expect(scene.children).toHaveLength(0);
    expect(disposeAssets).not.toHaveBeenCalled();
    expect(disposeBorrowedGeometry).not.toHaveBeenCalled();
    boundary.render.mockClear();
    viewport.render(100);
    expect(boundary.render).not.toHaveBeenCalled();
    assets.dispose();
  });
});
