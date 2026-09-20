import { OrthographicCamera, Scene, WebGLRenderer } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThreeRendererAdapter } from '../game/infrastructure/adapters/ThreeRendererAdapter';

const renderer = vi.hoisted(() => {
  let pixelRatio = 1;
  return {
    outputColorSpace: '',
    toneMapping: 0,
    setDrawingBufferSize: vi.fn((_width: number, _height: number, value: number) => { pixelRatio = value; }),
    getPixelRatio: vi.fn(() => pixelRatio),
    compileAsync: vi.fn(async () => {}),
    render: vi.fn(),
    dispose: vi.fn(),
  };
});

vi.mock('three', async (importOriginal) => ({
  ...(await importOriginal<typeof import('three')>()),
  WebGLRenderer: vi.fn(function () {
    return renderer;
  }),
}));

describe('ThreeRendererAdapter', () => {
  beforeEach(() => {
    renderer.setDrawingBufferSize.mockImplementation((_width: number, _height: number, value: number) => {
      renderer.getPixelRatio.mockReturnValue(value);
    });
    renderer.getPixelRatio.mockReturnValue(1);
    renderer.setDrawingBufferSize(1, 1, 1);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('keeps CSS viewport dimensions and adapts the drawing buffer to the capped pixel ratio', () => {
    vi.stubGlobal('window', { devicePixelRatio: 1.5 });
    const canvas = {} as HTMLCanvasElement;
    const adapter = new ThreeRendererAdapter(canvas);
    adapter.resize(640.4, 480.4);

    expect(WebGLRenderer).toHaveBeenCalledWith({ canvas, antialias: true, alpha: false });
    expect(adapter.width).toBe(640);
    expect(adapter.height).toBe(480);
    expect(adapter.pixelRatio).toBe(1.5);
    expect(renderer.setDrawingBufferSize).toHaveBeenCalledExactlyOnceWith(640, 480, 1.5);

    vi.stubGlobal('window', { devicePixelRatio: 3 });
    adapter.resize(320, 240);
    expect(adapter.width).toBe(320);
    expect(adapter.height).toBe(240);
    expect(adapter.pixelRatio).toBe(2);
    expect(renderer.setDrawingBufferSize).toHaveBeenLastCalledWith(320, 240, 2);

    vi.stubGlobal('window', { devicePixelRatio: Number.NaN });
    adapter.resize(320, 240);
    expect(adapter.pixelRatio).toBe(1);
    expect(renderer.setDrawingBufferSize).toHaveBeenLastCalledWith(320, 240, 1);
    adapter.dispose();
  });

  it('caps gameplay rendering to a 1080p pixel budget without changing CSS viewport size', () => {
    vi.stubGlobal('window', { devicePixelRatio: 2 });
    const adapter = new ThreeRendererAdapter({} as HTMLCanvasElement, true);
    adapter.resize(1920, 1080);
    expect(renderer.setDrawingBufferSize).toHaveBeenLastCalledWith(1920, 1080, 1);
    adapter.resize(1920, 1080);
    expect(renderer.setDrawingBufferSize).toHaveBeenCalledTimes(1);

    adapter.resize(2560, 1440);
    expect(adapter.width).toBe(2560);
    expect(adapter.height).toBe(1440);
    expect(adapter.pixelRatio).toBe(0.75);
    expect(renderer.setDrawingBufferSize).toHaveBeenLastCalledWith(2560, 1440, 0.75);

    vi.stubGlobal('window', { devicePixelRatio: 0.8 });
    adapter.resize(1280, 720);
    expect(adapter.pixelRatio).toBe(0.8);
    expect(renderer.setDrawingBufferSize).toHaveBeenLastCalledWith(1280, 720, 0.8);
    adapter.dispose();
  });

  it('downgrades only after sustained slow active frames and stops at the lowest tier', () => {
    vi.stubGlobal('window', { devicePixelRatio: 1 });
    const adapter = new ThreeRendererAdapter({} as HTMLCanvasElement, true);
    adapter.resize(1920, 1080);
    adapter.recordFrame(21, true);
    for (let i = 0; i < 96; i += 1) adapter.recordFrame(21, true);
    expect(adapter.pixelRatio).toBe(1);
    for (let i = 0; i < 96; i += 1) adapter.recordFrame(21, true);
    expect(adapter.pixelRatio).toBe(5 / 6);
    expect(renderer.setDrawingBufferSize).toHaveBeenCalledTimes(2);
    for (let i = 0; i < 193; i += 1) adapter.recordFrame(21, true);
    expect(adapter.pixelRatio).toBe(2 / 3);
    for (let i = 0; i < 192; i += 1) adapter.recordFrame(21, true);
    expect(renderer.setDrawingBufferSize).toHaveBeenCalledTimes(3);
    adapter.dispose();

    const nextRun = new ThreeRendererAdapter({} as HTMLCanvasElement, true);
    nextRun.resize(1920, 1080);
    expect(nextRun.pixelRatio).toBe(1);
    nextRun.dispose();
  });

  it('ignores isolated spikes and restarts sampling after pause and resize', () => {
    vi.stubGlobal('window', { devicePixelRatio: 1 });
    const adapter = new ThreeRendererAdapter({} as HTMLCanvasElement, true);
    adapter.resize(1920, 1080);
    adapter.recordFrame(16, true);
    for (let i = 0; i < 125; i += 1) adapter.recordFrame(16, true);
    adapter.recordFrame(60, true);
    for (let i = 0; i < 122; i += 1) adapter.recordFrame(16, true);
    expect(adapter.pixelRatio).toBe(1);

    for (let i = 0; i < 40; i += 1) adapter.recordFrame(21, true);
    adapter.recordFrame(21, false);
    for (let i = 0; i < 97; i += 1) adapter.recordFrame(21, true);
    expect(adapter.pixelRatio).toBe(1);

    adapter.resize(1280, 720);
    for (let i = 0; i < 97; i += 1) adapter.recordFrame(21, true);
    expect(adapter.pixelRatio).toBe(1);
    for (let i = 0; i < 96; i += 1) adapter.recordFrame(21, true);
    expect(adapter.pixelRatio).toBe(5 / 6);
    adapter.dispose();
  });

  it('disposes the renderer once and stops drawing after disposal', () => {
    const adapter = new ThreeRendererAdapter({} as HTMLCanvasElement);
    adapter.render(new Scene(), new OrthographicCamera());
    adapter.dispose();
    adapter.dispose();
    adapter.render(new Scene(), new OrthographicCamera());

    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(renderer.render).toHaveBeenCalledOnce();
  });

  it('waits for scene shaders before drawing and does not compile after disposal', async () => {
    const adapter = new ThreeRendererAdapter({} as HTMLCanvasElement);
    const scene = new Scene();
    const camera = new OrthographicCamera();
    await adapter.prepare(scene, camera);
    adapter.render(scene, camera);
    expect(renderer.compileAsync).toHaveBeenCalledExactlyOnceWith(scene, camera);
    expect(renderer.compileAsync.mock.invocationCallOrder[0]).toBeLessThan(renderer.render.mock.invocationCallOrder[0]);
    adapter.dispose();
    await adapter.prepare(scene, camera);
    expect(renderer.compileAsync).toHaveBeenCalledTimes(1);
  });

  it('can dispose before the first frame', () => {
    const adapter = new ThreeRendererAdapter({} as HTMLCanvasElement);
    adapter.dispose();
    adapter.dispose();
    adapter.render(new Scene(), new OrthographicCamera());
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(renderer.render).not.toHaveBeenCalled();
  });

  it('reports an understandable WebGL startup failure', () => {
    vi.mocked(WebGLRenderer).mockImplementationOnce(function () {
      throw new Error('Error creating WebGL context.');
    });
    expect(() => new ThreeRendererAdapter({} as HTMLCanvasElement)).toThrow('The 3D game requires WebGL 2.');
  });
});
