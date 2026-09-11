import { describe, expect, it, vi } from 'vitest';
import { Camera2D } from '../engine/camera';
import { RenderSystem } from '../game/systems/RenderSystem';
import { CanvasRendererAdapter } from '../game/infrastructure/adapters/CanvasRendererAdapter';
import { AssetCatalog } from '../game/infrastructure/assets/AssetCatalog';
import { CollisionGrid } from '../game/domain/world/CollisionGrid';
import { GhostEntity } from '../game/domain/entities/GhostEntity';
import { WorldMapData, WorldState } from '../game/domain/world/WorldState';
import { createCollisionTile } from './fixtures/renderFixtures';

describe('RenderSystem draw order', () => {
  it('draws ghosts before jail foreground tiles so jail overlays ghost sprites', () => {
    const baseTileImage = { id: 'base' } as unknown as HTMLImageElement;
    const jailTileImage = { id: 'jail' } as unknown as HTMLImageElement;
    const ghostSheet = { id: 'ghost-sheet' } as unknown as ReturnType<AssetCatalog['getSpriteSheet']>;
    const pacmanSheet = { id: 'pacman-sheet' } as unknown as ReturnType<AssetCatalog['getSpriteSheet']>;

    const map: WorldMapData = {
      width: 2,
      height: 1,
      tileWidth: 16,
      tileHeight: 16,
      widthInPixels: 32,
      heightInPixels: 16,
      tiles: [
        [
          {
            x: 0,
            y: 0,
            rawGid: 1,
            gid: 1,
            localId: 1,
            imagePath: 'base.png',
            rotation: 0,
            flipX: false,
            flipY: false,
            collision: createCollisionTile(),
          },
          {
            x: 1,
            y: 0,
            rawGid: 17,
            gid: 17,
            localId: 16,
            imagePath: 'jail.png',
            rotation: 0,
            flipX: false,
            flipY: false,
            collision: createCollisionTile(),
          },
        ],
      ],
      collisionByGid: new Map([[1, createCollisionTile()], [17, createCollisionTile()]]),
      imageByGid: new Map([
        [1, 'base.png'],
        [17, 'jail.png'],
      ]),
      spawnObjects: [],
    };

    const ghost = new GhostEntity({
      key: 'inky',
      tile: { x: 0, y: 0 },
      direction: 'right',
      speed: 1,
      displayWidth: 11,
      displayHeight: 11,
    });
    ghost.x = 8;
    ghost.y = 8;

    const world = {
      map,
      tileSize: 16,
      collisionGrid: new CollisionGrid([[createCollisionTile(), createCollisionTile()]]),
      pacmanAnimation: {
        frame: 0,
        elapsedMs: 0,
        sequenceIndex: 0,
        active: false,
      },
      pacman: {
        tile: { x: 0, y: 0 },
        moved: { x: 0, y: 0 },
        x: 8,
        y: 8,
        displayWidth: 10,
        displayHeight: 10,
        angle: 0,
        flipX: false,
        flipY: false,
        portalBlinkRemainingMs: 0,
        portalBlinkElapsedMs: 0,
        deathRecoveryRemainingMs: 0,
        deathRecoveryElapsedMs: 0,
        deathRecoveryNextToggleAtMs: 0,
        deathRecoveryVisible: true,
      },
      ghosts: [ghost],
      ghostScaredTimers: new Map(),
      ghostScaredWarnings: new Map(),
      ghostAnimations: new Map([
        [
          ghost,
          {
            key: 'inkyIdle',
            frame: 0,
            elapsedMs: 0,
            forward: 1,
          },
        ],
      ]),
    } as unknown as WorldState;

    const drawOrder: string[] = [];
    const renderer = {
      clear: vi.fn(),
      beginWorld: vi.fn(),
      endWorld: vi.fn(),
      drawImageCentered: vi.fn((image: unknown) => {
        if (image === baseTileImage) {
          drawOrder.push('base-tile');
        }
        if (image === jailTileImage) {
          drawOrder.push('jail-overlay');
        }
      }),
      drawSpriteFrame: vi.fn((sheet: unknown) => {
        if (sheet === ghostSheet) {
          drawOrder.push('ghost');
        }
        if (sheet === pacmanSheet) {
          drawOrder.push('pacman');
        }
      }),
      context: {
        save: vi.fn(),
        restore: vi.fn(),
        drawImage: vi.fn(),
        globalAlpha: 1,
      } as unknown as CanvasRenderingContext2D,
    } as unknown as CanvasRendererAdapter;

    const assets = {
      getCollectibleImage: () => null,
      getTileImage: (path: string) => {
        if (path === 'base.png') {
          return baseTileImage;
        }

        if (path === 'jail.png') {
          return jailTileImage;
        }

        return undefined;
      },
      getSpriteSheet: (key: string) => {
        if (key === 'pacman') {
          return pacmanSheet;
        }

        if (key === 'inky') {
          return ghostSheet;
        }

        return undefined;
      },
    } as unknown as AssetCatalog;

    const renderSystem = new RenderSystem(world, renderer, {} as Camera2D, assets);
    renderSystem.render();

    expect(drawOrder).toEqual(['base-tile', 'ghost', 'jail-overlay', 'pacman']);
  });
});
