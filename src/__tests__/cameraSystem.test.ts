import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Vector3 } from 'three';
import { CAMERA } from '../config/constants';
import { Camera3D } from '../engine/camera3d';
import { CameraSystem } from '../game/systems/CameraSystem';
import { createHarnessMap } from './helpers/mechanicsDomainMapFactory';

describe('CameraSystem', () => {
  let resizeHandler: (() => void) | undefined;
  let addEventListenerSpy: ReturnType<typeof vi.fn>;
  let removeEventListenerSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    resizeHandler = undefined;
    addEventListenerSpy = vi.fn((eventName: string, handler: EventListenerOrEventListenerObject) => {
      if (eventName === 'resize' && typeof handler === 'function') {
        resizeHandler = handler as () => void;
      }
    });
    removeEventListenerSpy = vi.fn();

    vi.stubGlobal('window', {
      innerWidth: 1280,
      innerHeight: 720,
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createSystem() {
    const world = {
      map: { widthInPixels: 448, heightInPixels: 496 },
      packet: { x: 96, y: 128 },
    };
    const camera = {
      setBounds: vi.fn(),
      setZoom: vi.fn(),
      setViewport: vi.fn(),
      startFollow: vi.fn(),
      snapToFollowTarget: vi.fn(),
      update: vi.fn(),
    };
    const renderer = {
      resize: vi.fn(),
    };
    const canvas = { width: 640, height: 480 } as HTMLCanvasElement;

    const system = new CameraSystem(world as never, camera, renderer as never, canvas);
    return { system, world, camera, renderer, canvas };
  }

  it('configures and snaps camera at startup', () => {
    const { system, world, camera, renderer, canvas } = createSystem();

    system.start();

    expect(camera.setBounds).toHaveBeenCalledWith(world.map.widthInPixels, world.map.heightInPixels);
    expect(camera.setZoom).toHaveBeenCalledWith(CAMERA.zoom);
    expect(camera.startFollow).toHaveBeenCalledWith(world.packet, CAMERA.followLerp.x, CAMERA.followLerp.y);
    expect(renderer.resize).toHaveBeenCalledWith(1280, 720);
    expect(camera.setViewport).toHaveBeenCalledWith(canvas.width, canvas.height);
    expect(camera.snapToFollowTarget).toHaveBeenCalledOnce();
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('updates renderer and viewport when resize handler runs', () => {
    const { system, camera, renderer, canvas } = createSystem();
    system.start();

    const stubWindow = globalThis.window as unknown as { innerWidth: number; innerHeight: number };
    stubWindow.innerWidth = 1440;
    stubWindow.innerHeight = 900;
    canvas.width = 800;
    canvas.height = 600;

    resizeHandler?.();

    expect(renderer.resize).toHaveBeenNthCalledWith(2, 1440, 900);
    expect(camera.setViewport).toHaveBeenNthCalledWith(2, 800, 600);
    expect(camera.setZoom).toHaveBeenCalledExactlyOnceWith(CAMERA.zoom);
    expect(camera.snapToFollowTarget).toHaveBeenCalledOnce();
  });

  it('keeps the whole tutorial maze visible after portrait and landscape resizing and staged movement', () => {
    const map = createHarnessMap('demo-map');
    const world = { map, packet: { x: 104, y: 120 } };
    const camera = new Camera3D();
    const canvas = { width: 320, height: 568 } as HTMLCanvasElement;
    const renderer = { resize: vi.fn() };
    const system = new CameraSystem(world as never, camera, renderer as never, canvas, true);
    system.start();

    for (const [width, height] of [[320, 568], [640, 240], [1280, 720]]) {
      canvas.width = width;
      canvas.height = height;
      resizeHandler?.();
      const beforeMove = camera.getRenderPosition();
      world.packet.x = 56;
      world.packet.y = 88;
      system.update();
      expect(camera.getRenderPosition()).toEqual(beforeMove);
      expect(camera.getRenderPosition(0)).toEqual(camera.getRenderPosition(1));
      expect(camera.getZoom()).toBeLessThanOrEqual(CAMERA.zoom);
      camera.present();
      for (const [x, z] of [[0, 0], [map.widthInPixels, 0], [0, map.heightInPixels],
        [map.widthInPixels, map.heightInPixels]]) {
        const screen = new Vector3(x, 0, z).project(camera.camera);
        expect(Math.abs(screen.x)).toBeLessThan(1);
        expect(Math.abs(screen.y)).toBeLessThan(1);
      }
    }
    system.destroy();
  });

  it('forwards update calls and removes resize listener on destroy', () => {
    const { system, camera } = createSystem();
    system.start();

    system.update();
    expect(camera.update).toHaveBeenCalledOnce();

    system.destroy();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
