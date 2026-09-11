import { Camera2D } from '../../engine/camera';
import { COLLECTIBLE_CONFIG, PACMAN_PORTAL_BLINK } from '../../config/constants';
import { WorldState } from '../domain/world/WorldState';
import { CanvasRendererAdapter } from '../infrastructure/adapters/CanvasRendererAdapter';
import { DeviceRenderMetrics, MapLayerRenderer } from '../infrastructure/adapters/MapLayerRenderer';
import { AssetCatalog } from '../infrastructure/assets/AssetCatalog';
import { CollectibleSystem } from './CollectibleSystem';
import { EntityPresentation } from './EntityPresentation';
import { resolveGhostSpriteSheetKey } from './resolveGhostSpriteSheetKey';

const BACKGROUND_COLOR = '#2d2d2d';
const BASE_POINT_SIZE = COLLECTIBLE_CONFIG[0].size;
const POWER_POINT_SIZE = COLLECTIBLE_CONFIG[1].size;

export class RenderSystem {
  private readonly collectibles: CollectibleSystem;
  private readonly mapRenderer: MapLayerRenderer;
  private readonly presentation: EntityPresentation;

  constructor(
    private readonly world: WorldState,
    private readonly renderer: CanvasRendererAdapter,
    private readonly camera: Camera2D,
    private readonly assets: AssetCatalog,
    collectibles?: CollectibleSystem,
  ) {
    this.collectibles = collectibles ?? new CollectibleSystem(this.world);
    this.mapRenderer = new MapLayerRenderer(this.world.map, this.world.tileSize, this.renderer, this.assets);
    this.presentation = new EntityPresentation(this.world);
  }

  capturePreviousState(): void {
    this.presentation.capturePreviousState();
  }

  update(deltaMs: number): void {
    this.collectibles.update(deltaMs);
  }

  render(alpha = 1): void {
    this.renderer.clear(BACKGROUND_COLOR);

    if (!this.canDrawDeviceSnappedMap()) {
      this.renderer.beginWorld(this.camera, alpha);
      this.mapRenderer.drawWorld(false);
      this.drawPoints();
      this.drawEatEffects();
      this.drawGhosts(alpha);
      this.mapRenderer.drawWorld(true);
      this.drawPacman(alpha);
      this.renderer.endWorld();
      return;
    }

    const metrics = this.resolveDeviceRenderMetrics(alpha);
    this.mapRenderer.drawDevice(false, metrics);
    this.drawPointsDeviceSnapped(metrics);
    this.drawEatEffectsDeviceSnapped(metrics);

    this.renderer.beginWorld(this.camera, alpha, metrics);
    this.drawGhosts(alpha);
    this.renderer.endWorld();

    this.mapRenderer.drawDevice(true, metrics);

    this.renderer.beginWorld(this.camera, alpha, metrics);
    this.drawPacman(alpha);
    this.renderer.endWorld();
  }

  private canDrawDeviceSnappedMap(): boolean {
    const renderer = this.renderer as CanvasRendererAdapter & {
      drawImageDevice?: CanvasRendererAdapter['drawImageDevice'];
      pixelRatio?: number;
      deviceWidth?: number;
      deviceHeight?: number;
    };

    return (
      typeof renderer.drawImageDevice === 'function' &&
      Number.isFinite(renderer.pixelRatio) &&
      Number.isFinite(renderer.deviceWidth) &&
      Number.isFinite(renderer.deviceHeight) &&
      renderer.pixelRatio > 0 &&
      renderer.deviceWidth > 0 &&
      renderer.deviceHeight > 0
    );
  }

  private resolveDeviceRenderMetrics(alpha: number): DeviceRenderMetrics {
    const tileDeviceSize = this.resolveTileDeviceSize();
    const deviceScale = tileDeviceSize / this.world.tileSize;
    const cameraPosition = this.camera.getRenderPosition(alpha);
    return {
      tileDeviceSize,
      deviceScale,
      originX: Math.round(-cameraPosition.x * deviceScale),
      originY: Math.round(-cameraPosition.y * deviceScale),
    };
  }

  private resolveTileDeviceSize(): number {
    return Math.max(1, Math.round(this.world.tileSize * this.camera.getZoom() * this.renderer.pixelRatio));
  }

  private drawPoints(): void {
    const pointImage = this.assets.getCollectibleImage('point');
    if (!pointImage) {
      return;
    }

    for (const point of this.collectibles.getPoints()) {
      const size = point.kind === 'power' ? POWER_POINT_SIZE : BASE_POINT_SIZE;
      this.renderer.drawImageCentered(pointImage, point.x, point.y, size, size, 0, false, false);
    }
  }

  private drawPointsDeviceSnapped(metrics: DeviceRenderMetrics): void {
    const pointImage = this.assets.getCollectibleImage('point');
    if (!pointImage) {
      return;
    }

    const context = this.renderer.context;

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.imageSmoothingEnabled = false;

    for (const point of this.collectibles.getPoints()) {
      const size = point.kind === 'power' ? POWER_POINT_SIZE : BASE_POINT_SIZE;
      this.drawCollectibleDeviceSnapped(context, pointImage, point.x, point.y, size, metrics);
    }

    context.restore();
  }

  private drawEatEffects(): void {
    const pointImage = this.assets.getCollectibleImage('point');
    const eatEffects = this.collectibles.getEatEffects();
    if (!pointImage || !eatEffects.length) {
      return;
    }

    const context = this.renderer.context;
    eatEffects.forEach((effect) => {
      const progress = Math.min(1, effect.elapsedMs / effect.durationMs);
      const alpha = (1 - progress) * (1 - progress);
      const growProgress = 1 - alpha;
      const size = effect.sizeStart + (effect.sizeEnd - effect.sizeStart) * growProgress;

      context.save();
      context.globalAlpha = alpha;
      context.drawImage(pointImage, effect.x - size / 2, effect.y - size / 2, size, size);
      context.restore();
    });
  }

  private drawEatEffectsDeviceSnapped(metrics: DeviceRenderMetrics): void {
    const pointImage = this.assets.getCollectibleImage('point');
    const eatEffects = this.collectibles.getEatEffects();
    if (!pointImage || !eatEffects.length) {
      return;
    }

    const context = this.renderer.context;

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.imageSmoothingEnabled = false;

    eatEffects.forEach((effect) => {
      const progress = Math.min(1, effect.elapsedMs / effect.durationMs);
      const alpha = (1 - progress) * (1 - progress);
      const growProgress = 1 - alpha;
      const size = effect.sizeStart + (effect.sizeEnd - effect.sizeStart) * growProgress;

      context.globalAlpha = alpha;
      this.drawCollectibleDeviceSnapped(context, pointImage, effect.x, effect.y, size, metrics);
    });

    context.restore();
  }

  private drawCollectibleDeviceSnapped(
    context: CanvasRenderingContext2D,
    image: CanvasImageSource,
    worldX: number,
    worldY: number,
    worldSize: number,
    metrics: DeviceRenderMetrics,
  ): void {
    const size = Math.max(1, Math.round(worldSize * metrics.deviceScale));
    const x = Math.round(metrics.originX + worldX * metrics.deviceScale - size / 2);
    const y = Math.round(metrics.originY + worldY * metrics.deviceScale - size / 2);

    if (
      x + size < 0 ||
      y + size < 0 ||
      x > this.renderer.deviceWidth ||
      y > this.renderer.deviceHeight
    ) {
      return;
    }

    context.drawImage(image, x, y, size, size);
  }

  private drawPacman(alpha: number): void {
    if (!this.isPacmanVisible()) {
      return;
    }

    const pacmanSheet = this.assets.getSpriteSheet('pacman');
    if (!pacmanSheet) {
      return;
    }

    const position = this.presentation.getPosition(this.world.pacman, alpha);
    this.renderer.drawSpriteFrame(
      pacmanSheet,
      this.world.pacmanAnimation.frame,
      position.x,
      position.y,
      this.world.pacman.displayWidth,
      this.world.pacman.displayHeight,
      (this.world.pacman.angle * Math.PI) / 180,
      this.world.pacman.flipX,
      this.world.pacman.flipY,
    );
  }

  private isPacmanVisible(): boolean {
    const deathRecoveryRemaining = this.world.pacman.deathRecoveryRemainingMs ?? 0;
    if (deathRecoveryRemaining > 0) {
      return this.world.pacman.deathRecoveryVisible ?? true;
    }

    const remaining = this.world.pacman.portalBlinkRemainingMs ?? 0;
    if (remaining <= 0) {
      return true;
    }

    const elapsed = this.world.pacman.portalBlinkElapsedMs ?? 0;
    const blinkPhase = Math.floor(elapsed / PACMAN_PORTAL_BLINK.intervalMs);
    return blinkPhase % 2 === 0;
  }

  private drawGhosts(alpha: number): void {
    this.world.ghosts.forEach((ghost) => {
      const sheetKey = resolveGhostSpriteSheetKey(this.world, ghost);
      const sheet = this.assets.getSpriteSheet(sheetKey);
      if (!sheet) {
        return;
      }

      const frame = this.world.ghostAnimations.get(ghost)?.frame ?? 0;
      const position = this.presentation.getPosition(ghost, alpha);
      this.renderer.drawSpriteFrame(
        sheet,
        frame,
        position.x,
        position.y,
        ghost.displayWidth,
        ghost.displayHeight,
        (ghost.angle * Math.PI) / 180,
        ghost.flipX,
        ghost.flipY,
      );
    });
  }
}
