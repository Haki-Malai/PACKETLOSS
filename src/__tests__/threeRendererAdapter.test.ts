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

  it('disposes the renderer once and stops drawing after disposal', () => {
    const adapter = new ThreeRendererAdapter({} as HTMLCanvasElement);
    adapter.render(new Scene(), new OrthographicCamera());
    adapter.dispose();
    adapter.dispose();
    adapter.render(new Scene(), new OrthographicCamera());

    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(renderer.render).toHaveBeenCalledOnce();
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
