import { describe, expect, it, vi } from 'vitest';
import { Camera2D } from '../engine/camera';
import { WorldState } from '../game/domain/world/WorldState';
import { CanvasRendererAdapter } from '../game/infrastructure/adapters/CanvasRendererAdapter';
import { AssetCatalog } from '../game/infrastructure/assets/AssetCatalog';
import { CollectibleSystem } from '../game/systems/CollectibleSystem';
import { RenderSystem } from '../game/systems/RenderSystem';

describe('camera presentation', () => {
  it('uses render alpha for both device-snapped layers and world transforms', () => {
    const world = {
      map: { tiles: [] },
      tileSize: 16,
      pacman: { portalBlinkRemainingMs: 0, deathRecoveryRemainingMs: 0 },
      ghosts: [],
    } as unknown as WorldState;
    const getRenderPosition = vi.fn(() => ({ x: 0, y: 0 }));
    const camera = {
      getZoom: () => 5,
      getRenderPosition,
    } as unknown as Camera2D;
    const beginWorld = vi.fn();
    const renderer = {
      clear: vi.fn(),
      beginWorld,
      endWorld: vi.fn(),
      drawImageDevice: vi.fn(),
      pixelRatio: 1,
      deviceWidth: 640,
      deviceHeight: 480,
    } as unknown as CanvasRendererAdapter;
    const assets = {
      getCollectibleImage: () => undefined,
      getSpriteSheet: () => undefined,
    } as unknown as AssetCatalog;
    const collectibles = {
      getPoints: () => [],
      getEatEffects: () => [],
    } as unknown as CollectibleSystem;

    new RenderSystem(world, renderer, camera, assets, collectibles).render(0.35);

    expect(getRenderPosition).toHaveBeenCalledTimes(1);
    expect(getRenderPosition).toHaveBeenNthCalledWith(1, 0.35);
    expect(beginWorld).toHaveBeenCalledTimes(2);
    const metrics = { tileDeviceSize: 80, deviceScale: 5, originX: -0, originY: -0 };
    expect(beginWorld).toHaveBeenNthCalledWith(1, camera, 0.35, metrics);
    expect(beginWorld).toHaveBeenNthCalledWith(2, camera, 0.35, metrics);
  });
});
