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
  it('draws warning-phase scared ghosts as blue or base sprite based on warning toggle state', () => {
    const map: WorldMapData = {
      width: 1,
      height: 1,
      tileWidth: 16,
      tileHeight: 16,
      widthInPixels: 16,
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
        ],
      ],
      collisionByGid: new Map([[1, createCollisionTile()]]),
      imageByGid: new Map([[1, 'base.png']]),
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
    ghost.state.scared = true;

    const world = {
      map,
      tileSize: 16,
      collisionGrid: new CollisionGrid([[createCollisionTile()]]),
      pacmanAnimation: { frame: 0, elapsedMs: 0, sequenceIndex: 0, active: false },
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
      ghostScaredTimers: new Map([[ghost, 600]]),
      ghostScaredWarnings: new Map([
        [
          ghost,
          {
            elapsedMs: 600,
            nextToggleAtMs: 660,
            showBaseColor: false,
          },
        ],
      ]),
      ghostAnimations: new Map([
        [
          ghost,
          {
            key: 'inkyIdle',
            frame: 3,
            elapsedMs: 0,
            forward: 1,
          },
        ],
      ]),
    } as unknown as WorldState;

    const drawSpriteFrame = vi.fn();
    const renderer = {
      clear: vi.fn(),
      beginWorld: vi.fn(),
      endWorld: vi.fn(),
      drawImageCentered: vi.fn(),
      drawSpriteFrame,
      context: {
        save: vi.fn(),
        restore: vi.fn(),
        drawImage: vi.fn(),
        globalAlpha: 1,
      } as unknown as CanvasRenderingContext2D,
    } as unknown as CanvasRendererAdapter;

    const scaredSheet = { id: 'scared-sheet' } as unknown as ReturnType<AssetCatalog['getSpriteSheet']>;
    const baseSheet = { id: 'base-sheet' } as unknown as ReturnType<AssetCatalog['getSpriteSheet']>;
    const pacmanSheet = { id: 'pacman-sheet' } as unknown as ReturnType<AssetCatalog['getSpriteSheet']>;
    const assets = {
      getCollectibleImage: () => null,
      getTileImage: () => null,
      getSpriteSheet: (key: string) => {
        if (key === 'scared') {
          return scaredSheet;
        }
        if (key === 'inky') {
          return baseSheet;
        }
        if (key === 'pacman') {
          return pacmanSheet;
        }
        return undefined;
      },
    } as unknown as AssetCatalog;

    const renderSystem = new RenderSystem(world, renderer, {} as Camera2D, assets);
    renderSystem.render();

    let drawCalls = drawSpriteFrame.mock.calls as Array<[unknown, ...unknown[]]>;
    expect(drawCalls.some(([sheet]) => sheet === scaredSheet)).toBe(true);
    expect(drawCalls.some(([sheet]) => sheet === baseSheet)).toBe(false);

    world.ghostScaredWarnings.set(ghost, {
      elapsedMs: 700,
      nextToggleAtMs: 760,
      showBaseColor: true,
    });
    drawSpriteFrame.mockClear();
    renderSystem.render();
    drawCalls = drawSpriteFrame.mock.calls as Array<[unknown, ...unknown[]]>;
    expect(drawCalls.some(([sheet]) => sheet === baseSheet)).toBe(true);
    expect(drawCalls.some(([sheet]) => sheet === scaredSheet)).toBe(false);
  });

  it('keeps Pac-Man visible during death recovery even when portal blink phase would hide him', () => {
    const map: WorldMapData = {
      width: 1,
      height: 1,
      tileWidth: 16,
      tileHeight: 16,
      widthInPixels: 16,
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
        ],
      ],
      collisionByGid: new Map([[1, createCollisionTile()]]),
      imageByGid: new Map([[1, 'base.png']]),
      spawnObjects: [],
    };

    const world = {
      map,
      tileSize: 16,
      collisionGrid: new CollisionGrid([[createCollisionTile()]]),
      pacmanAnimation: { frame: 0, elapsedMs: 0, sequenceIndex: 0, active: false },
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
        portalBlinkRemainingMs: 300,
        portalBlinkElapsedMs: 1300,
        deathRecoveryRemainingMs: 500,
        deathRecoveryElapsedMs: 700,
        deathRecoveryNextToggleAtMs: 0,
        deathRecoveryVisible: true,
      },
      ghosts: [],
      ghostScaredTimers: new Map(),
      ghostScaredWarnings: new Map(),
      ghostAnimations: new Map(),
    } as unknown as WorldState;

    const drawSpriteFrame = vi.fn();
    const renderer = {
      clear: vi.fn(),
      beginWorld: vi.fn(),
      endWorld: vi.fn(),
      drawImageCentered: vi.fn(),
      drawSpriteFrame,
      context: {
        save: vi.fn(),
        restore: vi.fn(),
        drawImage: vi.fn(),
        globalAlpha: 1,
      } as unknown as CanvasRenderingContext2D,
    } as unknown as CanvasRendererAdapter;

    const pacmanSheet = { id: 'pacman-sheet' } as unknown as ReturnType<AssetCatalog['getSpriteSheet']>;
    const assets = {
      getCollectibleImage: () => null,
      getTileImage: () => null,
      getSpriteSheet: (key: string) => (key === 'pacman' ? pacmanSheet : undefined),
    } as unknown as AssetCatalog;

    const renderSystem = new RenderSystem(world, renderer, {} as Camera2D, assets);
    renderSystem.render();

    expect(drawSpriteFrame).toHaveBeenCalledWith(
      pacmanSheet,
      0,
      8,
      8,
      10,
      10,
      0,
      false,
      false,
    );
  });
});
