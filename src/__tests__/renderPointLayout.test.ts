import { describe, expect, it, vi } from 'vitest';
import { Camera2D } from '../engine/camera';
import { buildPointLayout } from '../game/domain/services/PointLayoutService';
import { RenderSystem } from '../game/systems/RenderSystem';
import { CanvasRendererAdapter } from '../game/infrastructure/adapters/CanvasRendererAdapter';
import { AssetCatalog } from '../game/infrastructure/assets/AssetCatalog';
import { createCollisionTile, createMapFixture, createWorld, loadProductionMazeFixture, toTileCenter, collectVoidBoundaryForbiddenTiles } from './fixtures/renderFixtures';

describe('RenderSystem point rendering regression', () => {
  it('renders points on both colliding tiles and non-colliding connector tiles', () => {
    const pointImage = { id: 'point' } as unknown as HTMLImageElement;
    const collisionRows = [
      [
        createCollisionTile({ collides: true, left: true }),
        createCollisionTile(),
        createCollisionTile({ collides: true }),
        createCollisionTile({ collides: true, right: true }),
      ],
    ];

    const { map, collisionGrid } = createMapFixture(collisionRows);
    const world = createWorld(map, collisionGrid, { x: 0, y: 0 });

    const drawImageCentered = vi.fn();
    const renderer = {
      clear: vi.fn(),
      beginWorld: vi.fn(),
      endWorld: vi.fn(),
      drawImageCentered,
      drawSpriteFrame: vi.fn(),
      context: {
        save: vi.fn(),
        restore: vi.fn(),
        drawImage: vi.fn(),
        globalAlpha: 1,
      } as unknown as CanvasRenderingContext2D,
    } as unknown as CanvasRendererAdapter;

    const assets = {
      getCollectibleImage: () => pointImage,
      getTileImage: () => null,
      getSpriteSheet: () => null,
    } as unknown as AssetCatalog;

    const renderSystem = new RenderSystem(world, renderer, {} as Camera2D, assets);
    renderSystem.render();

    const pointCalls = drawImageCentered.mock.calls.filter(([image]) => image === pointImage);

    const centers = pointCalls.map(([, x, y]) => `${x},${y}`);
    expect(pointCalls).toHaveLength(4);
    expect(centers).toEqual(['8,8', '24,8', '40,8', '56,8']);
  });

  it('renders one collectible per base point in the production maze before any consumption', () => {
    const pointImage = { id: 'point' } as unknown as HTMLImageElement;
    const { map, collisionGrid, startTile } = loadProductionMazeFixture();
    const world = createWorld(map, collisionGrid, startTile);

    const drawImageCentered = vi.fn();
    const renderer = {
      clear: vi.fn(),
      beginWorld: vi.fn(),
      endWorld: vi.fn(),
      drawImageCentered,
      drawSpriteFrame: vi.fn(),
      context: {
        save: vi.fn(),
        restore: vi.fn(),
        drawImage: vi.fn(),
        globalAlpha: 1,
      } as unknown as CanvasRenderingContext2D,
    } as unknown as CanvasRendererAdapter;

    const assets = {
      getCollectibleImage: () => pointImage,
      getTileImage: () => null,
      getSpriteSheet: () => null,
    } as unknown as AssetCatalog;

    const renderSystem = new RenderSystem(world, renderer, {} as Camera2D, assets);
    renderSystem.render();

    const layout = buildPointLayout({
      map,
      collisionGrid,
      startTile,
      tileSize: map.tileWidth,
    });

    const pointCalls = drawImageCentered.mock.calls.filter(([image]) => image === pointImage);

    expect(pointCalls).toHaveLength(layout.basePoints.length);

    pointCalls.forEach(([, x, y]) => {
      expect(x).toBeGreaterThanOrEqual(map.tileWidth / 2);
      expect(x).toBeLessThanOrEqual(map.widthInPixels - map.tileWidth / 2);
      expect(y).toBeGreaterThanOrEqual(map.tileHeight / 2);
      expect(y).toBeLessThanOrEqual(map.heightInPixels - map.tileHeight / 2);
    });

    const nonCollidingBasePoint = layout.basePoints.find((tile) => !map.tiles[tile.y]?.[tile.x]?.collision.collides);
    expect(nonCollidingBasePoint).toBeDefined();

    const nonCollidingCenter = toTileCenter(nonCollidingBasePoint as { x: number; y: number }, map.tileWidth);
    const renderedPointCenters = new Set(pointCalls.map(([, x, y]) => `${x},${y}`));
    expect(renderedPointCenters.has(`${nonCollidingCenter.x},${nonCollidingCenter.y}`)).toBe(true);

    const forbiddenTiles = collectVoidBoundaryForbiddenTiles(map, collisionGrid, map.tileWidth);

    const forbiddenCenters = forbiddenTiles.map((tile) => {
      const center = toTileCenter(tile, map.tileWidth);
      return `${center.x},${center.y}`;
    });

    expect(forbiddenCenters.some((center) => renderedPointCenters.has(center))).toBe(false);
  });
});
