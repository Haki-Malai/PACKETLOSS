import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssetCatalog } from '../game/infrastructure/assets/AssetCatalog';

describe('native tile alpha masks', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uses the native image dimensions and alpha threshold 128, then caches the result', () => {
    const context = {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray([
        0, 0, 255, 0, 0, 0, 255, 127, 0, 0, 255, 128, 0, 0, 255, 255,
      ]) })),
    };
    const dimensions: number[][] = [];
    vi.stubGlobal('OffscreenCanvas', class {
      constructor(public width: number, public height: number) { dimensions.push([width, height]); }
      getContext() { return context; }
    });
    const assets = new AssetCatalog();
    const image = { naturalWidth: 2, naturalHeight: 2 } as HTMLImageElement;
    vi.spyOn(assets, 'getTileImage').mockReturnValue(image);

    const mask = assets.getTileMask('wall.png');
    expect(mask).toEqual({ width: 2, height: 2, opaque: new Uint8Array([0, 0, 1, 1]) });
    expect(dimensions).toEqual([[2, 2]]);
    expect(context.drawImage).toHaveBeenCalledWith(image, 0, 0);
    expect(assets.getTileMask('wall.png')).toBe(mask);
    expect(context.getImageData).toHaveBeenCalledTimes(1);
  });

  it('does not create geometry masks for missing tile images', () => {
    expect(new AssetCatalog().getTileMask('(empty)')).toBeUndefined();
  });
});
