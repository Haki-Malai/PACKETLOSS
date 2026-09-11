import { WorldTile } from '../../domain/world/WorldState';
import { AssetCatalog } from '../assets/AssetCatalog';

const BACKGROUND_RGB = { r: 45, g: 45, b: 45 };
const WALL_ALPHA_THRESHOLD = 128;

type TileCanvas = HTMLCanvasElement | OffscreenCanvas;
type TileContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

interface CachedTile extends Pick<WorldTile, 'imagePath' | 'rotation' | 'flipX' | 'flipY'> {
  fillBackground: boolean;
  tileDeviceSize: number;
  image: CanvasImageSource;
}

export class DeviceTileCache {
  private readonly tiles = new Map<string, CanvasImageSource>();
  private readonly tileEntries = new WeakMap<WorldTile, CachedTile>();

  constructor(private readonly assets: AssetCatalog) {}

  get(tile: WorldTile, fillBackground: boolean, tileDeviceSize: number): CanvasImageSource | undefined {
    const entry = this.tileEntries.get(tile);
    if (
      entry &&
      entry.imagePath === tile.imagePath &&
      entry.rotation === tile.rotation &&
      entry.flipX === tile.flipX &&
      entry.flipY === tile.flipY &&
      entry.fillBackground === fillBackground &&
      entry.tileDeviceSize === tileDeviceSize
    ) {
      return entry.image;
    }

    const image = this.getSharedTile(tile, fillBackground, tileDeviceSize);
    if (image) {
      this.tileEntries.set(tile, {
        imagePath: tile.imagePath,
        rotation: tile.rotation,
        flipX: tile.flipX,
        flipY: tile.flipY,
        fillBackground,
        tileDeviceSize,
        image,
      });
    }
    return image;
  }

  private getSharedTile(tile: WorldTile, fillBackground: boolean, tileDeviceSize: number): CanvasImageSource | undefined {
    const cacheKey = [
      tile.imagePath,
      tile.rotation,
      tile.flipX ? 'flip-x' : 'no-flip-x',
      tile.flipY ? 'flip-y' : 'no-flip-y',
      fillBackground ? 'opaque-background' : 'transparent-background',
      tileDeviceSize,
    ].join('|');

    const cached = this.tiles.get(cacheKey);
    if (cached) {
      return cached;
    }

    const image = this.assets.getTileImage(tile.imagePath);
    if (!image) {
      return undefined;
    }

    const tileCanvas = this.createTileCanvas(tileDeviceSize);
    if (!tileCanvas) {
      return undefined;
    }

    const { canvas, context } = tileCanvas;
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, tileDeviceSize, tileDeviceSize);

    context.save();
    context.translate(tileDeviceSize / 2, tileDeviceSize / 2);

    if (tile.rotation !== 0) {
      context.rotate(tile.rotation);
    }

    if (tile.flipX || tile.flipY) {
      context.scale(tile.flipX ? -1 : 1, tile.flipY ? -1 : 1);
    }

    context.drawImage(image, -tileDeviceSize / 2, -tileDeviceSize / 2, tileDeviceSize, tileDeviceSize);
    context.restore();

    this.normalizeTilePixels(context, tileDeviceSize, tileDeviceSize, fillBackground);
    this.tiles.set(cacheKey, canvas);

    return canvas;
  }

  private createTileCanvas(size: number): { canvas: TileCanvas; context: TileContext } | undefined {
    const canvasSize = Math.max(1, Math.ceil(size));

    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(canvasSize, canvasSize);
      const context = canvas.getContext('2d');
      return context ? { canvas, context } : undefined;
    }

    if (typeof document === 'undefined') {
      return undefined;
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const context = canvas.getContext('2d');
    return context ? { canvas, context } : undefined;
  }

  private normalizeTilePixels(
    context: TileContext,
    width: number,
    height: number,
    fillBackground: boolean,
  ): void {
    let imageData: ImageData;

    try {
      imageData = context.getImageData(0, 0, width, height);
    } catch {
      return;
    }

    const data = imageData.data;

    for (let index = 0; index < data.length; index += 4) {
      const alpha = data[index + 3];

      if (alpha < WALL_ALPHA_THRESHOLD) {
        if (fillBackground) {
          data[index] = BACKGROUND_RGB.r;
          data[index + 1] = BACKGROUND_RGB.g;
          data[index + 2] = BACKGROUND_RGB.b;
          data[index + 3] = 255;
        } else {
          data[index] = 0;
          data[index + 1] = 0;
          data[index + 2] = 0;
          data[index + 3] = 0;
        }

        continue;
      }

      data[index + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);
  }
}
