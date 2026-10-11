import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetPreviewSession } from '../dev/assets/AssetPreviewSession';
import { AssetPreviewViewport } from '../dev/assets/AssetPreviewViewport';
import { ArcadeAssets } from '../game/infrastructure/three/ArcadeAssets';
import { createCharacterAssets } from './fixtures/characterFixtures';
import { PowerupPreviewAssets } from '../dev/assets/PowerupPreviewAssets';

const viewport = vi.hoisted(() => ({ construct: vi.fn(), dispose: vi.fn() }));

vi.mock('../dev/assets/AssetPreviewViewport', () => ({
  AssetPreviewViewport: class {
    constructor(canvas: HTMLCanvasElement, assets: ArcadeAssets, powerups: PowerupPreviewAssets) {
      viewport.construct(canvas, assets, powerups);
    }

    dispose(): void {
      viewport.dispose();
    }
  },
}));

describe('Asset preview session', () => {
  let powerups: PowerupPreviewAssets;
  beforeEach(() => {
    powerups = new PowerupPreviewAssets();
    vi.spyOn(PowerupPreviewAssets, 'load').mockResolvedValue(powerups);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    viewport.construct.mockReset();
    viewport.dispose.mockReset();
  });

  it('shares startup and disposes the viewport before its borrowed assets exactly once', async () => {
    const assets = createCharacterAssets();
    const dispose = vi.spyOn(assets, 'dispose');
    const disposePowerups = vi.spyOn(powerups, 'dispose');
    const load = vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
    const canvas = {} as HTMLCanvasElement;
    const session = new AssetPreviewSession(canvas);
    const starting = session.start();
    expect(session.start()).toBe(starting);
    const result = await starting;
    expect(result).toBeInstanceOf(AssetPreviewViewport);
    expect(session.start()).toBe(starting);
    expect(load).toHaveBeenCalledOnce();
    expect(viewport.construct).toHaveBeenCalledExactlyOnceWith(canvas, assets, powerups);

    session.dispose();
    session.dispose();
    expect(viewport.dispose).toHaveBeenCalledOnce();
    expect(dispose).toHaveBeenCalledOnce();
    expect(disposePowerups).toHaveBeenCalledOnce();
    expect(viewport.dispose.mock.invocationCallOrder[0]).toBeLessThan(disposePowerups.mock.invocationCallOrder[0]);
    expect(viewport.dispose.mock.invocationCallOrder[0]).toBeLessThan(dispose.mock.invocationCallOrder[0]);
    await expect(session.start()).resolves.toBeNull();
  });

  it('does not load or construct a viewport after disposal before startup', async () => {
    const load = vi.spyOn(ArcadeAssets, 'load');
    const session = new AssetPreviewSession({} as HTMLCanvasElement);
    session.dispose();
    await expect(session.start()).resolves.toBeNull();
    expect(load).not.toHaveBeenCalled();
    expect(viewport.construct).not.toHaveBeenCalled();
  });

  it('aborts pending startup and releases late assets without constructing a viewport', async () => {
    const assets = createCharacterAssets();
    const dispose = vi.spyOn(assets, 'dispose');
    let finishLoad!: (_assets: ArcadeAssets) => void;
    const pending = new Promise<ArcadeAssets>((resolve) => { finishLoad = resolve; });
    const load = vi.spyOn(ArcadeAssets, 'load').mockReturnValue(pending);
    const session = new AssetPreviewSession({} as HTMLCanvasElement);
    const starting = session.start();
    const signal = load.mock.calls[0][0];
    expect(signal?.aborted).toBe(false);
    session.dispose();
    expect(signal?.aborted).toBe(true);
    finishLoad(assets);
    await expect(starting).resolves.toBeNull();
    session.dispose();
    expect(dispose).toHaveBeenCalledOnce();
    expect(viewport.construct).not.toHaveBeenCalled();
  });

  it('settles a rejected cancelled load without surfacing a startup failure', async () => {
    let failLoad!: (_error: Error) => void;
    const pending = new Promise<ArcadeAssets>((_resolve, reject) => { failLoad = reject; });
    vi.spyOn(ArcadeAssets, 'load').mockReturnValue(pending);
    const session = new AssetPreviewSession({} as HTMLCanvasElement);
    const starting = session.start();
    session.dispose();
    failLoad(new DOMException('Gallery closed', 'AbortError'));
    await expect(starting).resolves.toBeNull();
    expect(viewport.construct).not.toHaveBeenCalled();
  });

  it('releases late powerup models when the gallery closes during their load', async () => {
    const assets = createCharacterAssets();
    const dispose = vi.spyOn(assets, 'dispose');
    const disposePowerups = vi.spyOn(powerups, 'dispose');
    vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
    let finishLoad!: (_assets: PowerupPreviewAssets) => void;
    vi.spyOn(PowerupPreviewAssets, 'load').mockReturnValue(new Promise((resolve) => { finishLoad = resolve; }));
    const session = new AssetPreviewSession({} as HTMLCanvasElement);
    const starting = session.start();
    await Promise.resolve();
    session.dispose();
    finishLoad(powerups);
    await expect(starting).resolves.toBeNull();
    expect(dispose).toHaveBeenCalledOnce();
    expect(disposePowerups).toHaveBeenCalledOnce();
    expect(viewport.construct).not.toHaveBeenCalled();
  });

  it('releases character assets when powerup loading fails before viewport creation', async () => {
    const assets = createCharacterAssets();
    const dispose = vi.spyOn(assets, 'dispose');
    vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
    const failure = new Error('Unable to load laser-beam.glb');
    vi.spyOn(PowerupPreviewAssets, 'load').mockRejectedValue(failure);
    const session = new AssetPreviewSession({} as HTMLCanvasElement);
    await expect(session.start()).rejects.toBe(failure);
    expect(dispose).toHaveBeenCalledOnce();
    expect(viewport.construct).not.toHaveBeenCalled();
  });

  it('preserves a real loading error and does not retry the failed session', async () => {
    const failure = new Error('Enemy model could not load');
    const load = vi.spyOn(ArcadeAssets, 'load').mockRejectedValue(failure);
    const session = new AssetPreviewSession({} as HTMLCanvasElement);
    await expect(session.start()).rejects.toBe(failure);
    await expect(session.start()).resolves.toBeNull();
    expect(load).toHaveBeenCalledOnce();
    expect(viewport.construct).not.toHaveBeenCalled();
  });

  it('releases loaded assets and preserves a viewport construction failure', async () => {
    const assets = createCharacterAssets();
    const dispose = vi.spyOn(assets, 'dispose');
    vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
    const failure = new Error('WebGL initialization failed');
    viewport.construct.mockImplementationOnce(() => { throw failure; });
    const session = new AssetPreviewSession({} as HTMLCanvasElement);
    await expect(session.start()).rejects.toBe(failure);
    session.dispose();
    expect(dispose).toHaveBeenCalledOnce();
  });
});
