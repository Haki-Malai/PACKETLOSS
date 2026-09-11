import { beforeEach, describe, expect, it } from 'vitest';
import { getGameState, resetGameState } from '../state/gameState';
import { createRenderHarness, createCollisionTile, toTileCenter } from './fixtures/renderFixtures';

describe('RenderSystem point consumption gate', () => {
  beforeEach(() => {
    resetGameState(0);
  });

  it('does not consume points while Pac-Man is between tile centers', () => {
    const { world, renderSystem, center } = createRenderHarness();

    world.pacman.moved.x = 0.02;
    world.pacman.x = center.x + 0.02;
    renderSystem.update(16);

    expect(getGameState().score).toBe(0);

    world.pacman.moved.x = 0;
    world.pacman.x = center.x;
    renderSystem.update(16);

    expect(getGameState().score).toBeGreaterThan(0);
  });

  it('requires Pac-Man world position to be centered on the point tile before consuming', () => {
    const { world, renderSystem, center } = createRenderHarness();

    world.pacman.moved.x = 0;
    world.pacman.moved.y = 0;
    world.pacman.x = center.x + 0.2;
    world.pacman.y = center.y;
    renderSystem.update(16);

    expect(getGameState().score).toBe(0);

    world.pacman.x = center.x;
    renderSystem.update(16);

    expect(getGameState().score).toBeGreaterThan(0);
  });

  it('starts pacman eat animation only when a point is actually consumed', () => {
    const { world, renderSystem, center } = createRenderHarness();

    world.pacman.moved.x = 0.1;
    world.pacman.x = center.x + 0.1;
    renderSystem.update(16);

    expect(world.pacmanAnimation.active).toBe(false);
    expect(getGameState().score).toBe(0);

    world.pacman.moved.x = 0;
    world.pacman.x = center.x;
    renderSystem.update(16);

    expect(world.pacmanAnimation.active).toBe(true);
    expect(world.pacmanAnimation.frame).toBe(0);
    expect(world.pacmanAnimation.sequenceIndex).toBe(0);
    expect(getGameState().score).toBeGreaterThan(0);
  });

  it('does not trigger pacman eat animation from movement when no point can be consumed', () => {
    const { world, renderSystem, center } = createRenderHarness({
      collisionRows: [[createCollisionTile()]],
      pacmanTile: { x: 0, y: 0 },
    });

    world.pacman.x = center.x + 1;
    world.pacman.moved.x = 1;

    renderSystem.update(16);

    expect(getGameState().score).toBe(0);
    expect(world.pacmanAnimation.active).toBe(false);
    expect(world.pacmanAnimation.frame).toBe(0);
  });

  it('consumes a point only when Pac-Man tile and centered world position overlap the same point tile', () => {
    const { world, renderSystem } = createRenderHarness({
      collisionRows: [[createCollisionTile({ collides: true }), createCollisionTile({ collides: true })]],
      pacmanTile: { x: 1, y: 0 },
    });

    const tileZeroCenter = toTileCenter({ x: 0, y: 0 });
    const tileOneCenter = toTileCenter({ x: 1, y: 0 });

    world.pacman.moved.x = 0;
    world.pacman.moved.y = 0;
    world.pacman.x = tileZeroCenter.x;
    world.pacman.y = tileZeroCenter.y;

    renderSystem.update(16);
    expect(getGameState().score).toBe(0);

    world.pacman.x = tileOneCenter.x;
    world.pacman.y = tileOneCenter.y;
    renderSystem.update(16);

    const consumedScore = getGameState().score;
    expect(consumedScore).toBeGreaterThan(0);

    renderSystem.update(16);
    expect(getGameState().score).toBe(consumedScore);
  });
});
