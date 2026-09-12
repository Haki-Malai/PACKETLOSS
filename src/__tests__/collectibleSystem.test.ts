import { beforeEach, describe, expect, it } from 'vitest';
import { GHOST_SCARED_DURATION_MS } from '../config/constants';
import { GhostEntity } from '../game/domain/entities/GhostEntity';
import { PacmanEntity } from '../game/domain/entities/PacmanEntity';
import { MovementRules } from '../game/domain/services/MovementRules';
import { WorldState } from '../game/domain/world/WorldState';
import { CollectibleSystem } from '../game/systems/CollectibleSystem';
import { getGameState, resetGameState } from '../state/gameState';
import { createCollisionTile, createMapFixture } from './fixtures/pointLayoutFixtures';

function createCollectibles(kind: 'pellet' | 'power-pellet' = 'pellet') {
  const { map, collisionGrid } = createMapFixture([[createCollisionTile(), createCollisionTile(), createCollisionTile()]]);
  map.collectibleObjects = [{ type: kind, x: 8, y: 8 }, { type: kind, x: 24, y: 8 }];
  const pacman = new PacmanEntity({ x: 0, y: 0 }, 10, 10);
  const movement = new MovementRules(16);
  movement.setEntityTile(pacman, pacman.tile);
  const ghosts = (['inky', 'blinky'] as const).map((key) => new GhostEntity({
    key, tile: { x: 2, y: 0 }, direction: 'left', speed: 1, displayWidth: 11, displayHeight: 11,
  }));
  const world = new WorldState({
    map, collisionGrid, tileSize: 16, pacman, pacmanSpawnTile: pacman.tile, ghosts,
    ghostJailBounds: { minX: 2, maxX: 2, y: 0 },
  });
  return { world, movement, collectibles: new CollectibleSystem(world) };
}

describe('CollectibleSystem', () => {
  beforeEach(() => resetGameState(0, 3));

  it.each([
    { reason: 'horizontal movement in progress', movedX: 0.02, movedY: 0, x: 8.02, y: 8, tileX: 0 },
    { reason: 'vertical movement in progress', movedX: 0, movedY: 0.02, x: 8, y: 8.02, tileX: 0 },
    { reason: 'world position off center', movedX: 0, movedY: 0, x: 8.2, y: 8, tileX: 0 },
    { reason: 'world position on a different point tile', movedX: 0, movedY: 0, x: 8, y: 8, tileX: 1 },
  ])('waits for matching tile and center when there is $reason', ({ movedX, movedY, x, y, tileX }) => {
    const { world, movement, collectibles } = createCollectibles();
    Object.assign(world.pacman, { x, y, tile: { x: tileX, y: 0 }, moved: { x: movedX, y: movedY } });

    collectibles.update(16);

    expect(getGameState().score).toBe(0);
    expect(collectibles.getPointCount()).toBe(2);
    expect(collectibles.getEatEffects()).toHaveLength(0);
    expect(world.pacmanAnimation.active).toBe(false);

    movement.setEntityTile(world.pacman, { x: 0, y: 0 });
    collectibles.update(16);

    expect(getGameState().score).toBe(10);
    expect(Array.from(collectibles.getPoints()).map((point) => point.tile)).toEqual([{ x: 1, y: 0 }]);
    expect(world.pacmanAnimation.active).toBe(true);
  });

  it('scores each pellet once and lets its collection effect expire without consuming another point', () => {
    const { world, collectibles } = createCollectibles();
    collectibles.update(0);
    const effect = collectibles.getEatEffects()[0];
    expect(effect).toMatchObject({ x: 8, y: 8, elapsedMs: 0 });
    expect(world.pacmanAnimation.active).toBe(true);
    expect(getGameState().score).toBe(10);

    collectibles.update(effect.durationMs / 2);
    expect(collectibles.getEatEffects()).toHaveLength(1);
    expect(effect.elapsedMs).toBe(effect.durationMs / 2);
    collectibles.update(effect.durationMs / 2);

    expect(collectibles.getEatEffects()).toHaveLength(0);
    expect(collectibles.getPointCount()).toBe(1);
    expect(getGameState().score).toBe(10);
  });

  it('does not start an eat animation at a centered tile with no collectible', () => {
    const { world, movement, collectibles } = createCollectibles();
    movement.setEntityTile(world.pacman, { x: 2, y: 0 });
    collectibles.update(16);

    expect(getGameState().score).toBe(0);
    expect(world.pacmanAnimation.active).toBe(false);
    expect(collectibles.getEatEffects()).toHaveLength(0);
    expect(collectibles.getPointCount()).toBe(2);
  });

  it('scares only active ghosts, then refreshes their warning window and resets the bonus chain', () => {
    const { world, movement, collectibles } = createCollectibles('power-pellet');
    const [activeGhost, inactiveGhost] = world.ghosts;
    inactiveGhost.active = false;
    world.ghostEatChainCount = 3;

    collectibles.update(16);

    expect(getGameState().score).toBe(50);
    expect(activeGhost.state.scared).toBe(true);
    expect(world.ghostScaredTimers.get(activeGhost)).toBe(GHOST_SCARED_DURATION_MS);
    expect(inactiveGhost.state.scared).toBe(false);
    expect(world.ghostScaredTimers.has(inactiveGhost)).toBe(false);
    expect(world.ghostEatChainCount).toBe(0);

    world.ghostScaredTimers.set(activeGhost, 200);
    world.ghostScaredWarnings.set(activeGhost, { elapsedMs: 900, nextToggleAtMs: 1000, showBaseColor: true });
    world.ghostEatChainCount = 2;
    movement.setEntityTile(world.pacman, { x: 1, y: 0 });
    collectibles.update(16);

    expect(getGameState().score).toBe(100);
    expect(world.ghostScaredTimers.get(activeGhost)).toBe(GHOST_SCARED_DURATION_MS);
    expect(world.ghostScaredWarnings.has(activeGhost)).toBe(false);
    expect(world.ghostEatChainCount).toBe(0);
    expect(inactiveGhost.state.scared).toBe(false);
  });
});
