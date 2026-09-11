import { WorldMapData, WorldTile } from '../../domain/world/WorldState';
import { AssetCatalog } from '../assets/AssetCatalog';
import { CanvasRendererAdapter } from './CanvasRendererAdapter';
import { DeviceTileCache } from './DeviceTileCache';

const JAIL_FOREGROUND_LOCAL_IDS = new Set([16, 17, 18, 19, 20, 21]);

export interface DeviceRenderMetrics {
  tileDeviceSize: number;
  deviceScale: number;
  originX: number;
  originY: number;
}

export class MapLayerRenderer {
  private readonly deviceTileCache: DeviceTileCache;

  constructor(
    private readonly map: WorldMapData,
    private readonly tileSize: number,
    private readonly renderer: CanvasRendererAdapter,
    private readonly assets: AssetCatalog,
  ) {
    this.deviceTileCache = new DeviceTileCache(this.assets);
  }

  drawDevice(jailForegroundOnly: boolean, metrics: DeviceRenderMetrics): void {
    const { tileDeviceSize, originX, originY } = metrics;
    // Include tiles touching a viewport edge, matching the per-tile visibility check.
    const firstRow = Math.max(0, Math.ceil(-originY / tileDeviceSize) - 1);
    const lastRow = Math.min(this.map.tiles.length - 1, Math.floor((this.renderer.deviceHeight - originY) / tileDeviceSize));
    const firstColumn = Math.max(0, Math.ceil(-originX / tileDeviceSize) - 1);
    const lastColumn = Math.min(this.map.width - 1, Math.floor((this.renderer.deviceWidth - originX) / tileDeviceSize));
    if (firstRow > lastRow || firstColumn > lastColumn) {
      return;
    }

    const context = this.renderer.context;
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);

    for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex += 1) {
      const row = this.map.tiles[rowIndex];
      if (!row) {
        continue;
      }
      const rowLastColumn = Math.min(row.length - 1, lastColumn);
      for (let column = firstColumn; column <= rowLastColumn; column += 1) {
        const tile = row[column];
        if (!tile || !this.isRenderableMapTile(tile) || jailForegroundOnly !== this.isJailForegroundTile(tile)) {
          continue;
        }

        const image = this.deviceTileCache.get(tile, !jailForegroundOnly, tileDeviceSize);
        if (!image) {
          continue;
        }

        const x = originX + tile.x * tileDeviceSize;
        const y = originY + tile.y * tileDeviceSize;
        context.drawImage(image, x, y);
      }
    }

    context.restore();
  }

  drawWorld(jailForegroundOnly: boolean): void {
    this.map.tiles.forEach((row) => {
      row.forEach((tile) => {
        if (!this.isRenderableMapTile(tile)) {
          return;
        }

        if (jailForegroundOnly !== this.isJailForegroundTile(tile)) {
          return;
        }

        this.drawMapTile(tile);
      });
    });
  }

  private drawMapTile(tile: WorldTile): void {
    const image = this.assets.getTileImage(tile.imagePath);
    if (!image) {
      return;
    }

    const x = tile.x * this.tileSize + this.tileSize / 2;
    const y = tile.y * this.tileSize + this.tileSize / 2;

    this.renderer.drawImageCentered(
      image,
      x,
      y,
      this.tileSize,
      this.tileSize,
      tile.rotation,
      tile.flipX,
      tile.flipY,
    );
  }

  private isRenderableMapTile(tile: WorldTile): boolean {
    return tile.gid !== null && tile.imagePath !== '(empty)' && tile.imagePath !== '(unknown)';
  }

  private isJailForegroundTile(tile: WorldTile): boolean {
    return tile.localId !== null && JAIL_FOREGROUND_LOCAL_IDS.has(tile.localId);
  }
}
