import { describe, expect, it } from 'vitest';
import { SPEED, SPRITE_SIZE, TILE_SIZE } from '../config/constants';
import { EnemyEntity } from '../game/domain/entities/EnemyEntity';
import { PacketEntity } from '../game/domain/entities/PacketEntity';
import { EnemyDecisionService } from '../game/domain/services/EnemyDecisionService';
import { MovementRules } from '../game/domain/services/MovementRules';
import { PortalService } from '../game/domain/services/PortalService';
import { setEnemyScaredWindow } from '../game/domain/services/EnemyScaredStateService';
import { CollisionGrid, CollisionTile } from '../game/domain/world/CollisionGrid';
import { WorldMapData, WorldState, WorldTile } from '../game/domain/world/WorldState';
import { SeededRandom } from '../game/shared/random/SeededRandom';
import { AnimationSystem } from '../game/systems/AnimationSystem';
import { EnemyMovementSystem } from '../game/systems/EnemyMovementSystem';
import { openTile, wallTile } from './fixtures/collisionFixtures';

const STEP_MS = 1000 / 60;

function createMapFixture(collisionRows: CollisionTile[][]): { map: WorldMapData; collisionGrid: CollisionGrid } {
  const width = collisionRows[0]?.length ?? 0;
  const height = collisionRows.length;
  const tiles: WorldTile[][] = collisionRows.map((row, y) =>
    row.map((collision, x) => ({
      x,
      y,
      rawGid: 1,
      gid: 1,
      localId: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      collision: { ...collision },
    })),
  );

  const map: WorldMapData = {
    width,
    height,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    widthInPixels: width * TILE_SIZE,
    heightInPixels: height * TILE_SIZE,
    tiles,
    collisionByGid: new Map([[1, openTile()]]),
    spawnObjects: [],
  };

  return {
    map,
    collisionGrid: new CollisionGrid(collisionRows.map((row) => row.map((tile) => ({ ...tile })))),
  };
}

describe('enemy scared speed recovery', () => {
  it('restores gameplay speed without skipping the next center or penetrating a blocked wall', () => {
    const collisionRows: CollisionTile[][] = [
      [wallTile(), wallTile(), wallTile(), wallTile(), wallTile()],
      [wallTile(), openTile(), openTile({ right: true }), wallTile({ left: true }), wallTile()],
      [wallTile(), wallTile(), wallTile(), wallTile(), wallTile()],
    ];
    const { map, collisionGrid } = createMapFixture(collisionRows);
    const movementRules = new MovementRules(TILE_SIZE);

    const packet = new PacketEntity({ x: 1, y: 1 }, SPRITE_SIZE.packet, SPRITE_SIZE.packet);
    movementRules.setEntityTile(packet, { x: 1, y: 1 });

    const enemy = new EnemyEntity({
      key: 'spam',
      tile: { x: 1, y: 1 },
      direction: 'right',
      speed: SPEED.enemy,
      displayWidth: SPRITE_SIZE.enemy,
      displayHeight: SPRITE_SIZE.enemy,
    });
    movementRules.setEntityTile(enemy, { x: 1, y: 1 });
    enemy.state.free = true;
    enemy.state.soonFree = false;

    const world = new WorldState({
      map,
      tileSize: TILE_SIZE,
      collisionGrid,
      packetSpawnTile: { x: 1, y: 1 },
      packet,
      enemies: [enemy],
      enemyJailBounds: { minX: 1, maxX: 3, y: 1 },
    });
    world.levelMultiplier = 1.25;

    const enemyMovement = new EnemyMovementSystem(
      world,
      movementRules,
      new EnemyDecisionService(),
      new PortalService(collisionGrid, []),
      new SeededRandom(20260302),
    );
    const animationSystem = new AnimationSystem(world, SPEED.enemy);

    animationSystem.start();
    setEnemyScaredWindow(world, enemy, 1);
    animationSystem.update(0);

    enemyMovement.update();
    animationSystem.update(STEP_MS);

    expect(enemy.state.scared).toBe(false);
    expect(enemy.moved.x).toBe(0.625);
    expect(enemy.speed).toBe(0.625);

    enemyMovement.update();
    expect(enemy.speed).toBe(1.25);
    expect(enemy.moved.x).toBe(1.875);

    let reachedNextCenter = false;
    let maxEnemyTileX = enemy.tile.x;
    for (let i = 0; i < 80; i += 1) {
      enemyMovement.update();
      animationSystem.update(STEP_MS);
      maxEnemyTileX = Math.max(maxEnemyTileX, enemy.tile.x);

      if (enemy.tile.x === 2 && enemy.moved.x === 0) {
        expect(enemy.moved.y).toBe(0);
        reachedNextCenter = true;
        break;
      }
    }

    expect(reachedNextCenter).toBe(true);
    enemyMovement.update();
    expect(enemy.direction).toBe('left');
    expect(maxEnemyTileX).toBeLessThanOrEqual(2);
    expect(enemy.tile.x).not.toBe(3);
  });
});
