import { beforeEach, describe, expect, it } from 'vitest';
import { ENEMY_CONFIG, ENEMY_SCARED_DURATION_MS, SPRITE_SIZE } from '../config/constants';
import { EnemyEntity, ENEMY_KEYS } from '../game/domain/entities/EnemyEntity';
import { PacketEntity } from '../game/domain/entities/PacketEntity';
import { EnemyDecisionService } from '../game/domain/services/EnemyDecisionService';
import { setActiveEnemiesScaredWindow } from '../game/domain/services/EnemyScaredStateService';
import { MovementRules } from '../game/domain/services/MovementRules';
import { PortalService } from '../game/domain/services/PortalService';
import type { Direction } from '../game/domain/valueObjects/Direction';
import { CollisionGrid } from '../game/domain/world/CollisionGrid';
import { WorldState } from '../game/domain/world/WorldState';
import { SeededRandom } from '../game/shared/random/SeededRandom';
import { AnimationSystem } from '../game/systems/AnimationSystem';
import { CollectibleSystem } from '../game/systems/CollectibleSystem';
import { EnemyAbilitySystem } from '../game/systems/EnemyAbilitySystem';
import { EnemyMovementSystem } from '../game/systems/EnemyMovementSystem';
import { EnemyPacketCollisionSystem } from '../game/systems/EnemyPacketCollisionSystem';
import { MazeHazardSystem } from '../game/systems/MazeHazardSystem';
import { PacketMovementSystem } from '../game/systems/PacketMovementSystem';
import { prepareTutorialWorld, TutorialController } from '../game/tutorial/TutorialController';
import { TUTORIAL_LESSONS, type TutorialLessonId } from '../game/tutorial/TutorialLesson';
import { getGameState, resetGameState } from '../state/gameState';
import { createHarnessMap } from './helpers/mechanicsDomainMapFactory';

const STEP_MS = 1000 / 60;
/** Runs practice through the same systems and seeded ability order used by live composition. */
function createLesson(lesson: TutorialLessonId) {
  const map = createHarnessMap('demo-map');
  const collisionGrid = new CollisionGrid(map.tiles.map((row) => row.map((tile) => tile.collision)));
  const movement = new MovementRules(map.tileWidth);
  const packet = new PacketEntity({ x: 6, y: 7 }, SPRITE_SIZE.packet, SPRITE_SIZE.packet);
  const enemies = ENEMY_KEYS.map((key) => new EnemyEntity({
    key, tile: { x: 6, y: 8 }, direction: 'right', speed: ENEMY_CONFIG[key].speed,
    displayWidth: SPRITE_SIZE.enemy, displayHeight: SPRITE_SIZE.enemy,
  }));
  for (let i = 0; i < 3; i += 1) enemies.push(new EnemyEntity({
    key: 'spam', isCopy: true, tile: { x: 6, y: 8 }, direction: 'right', speed: ENEMY_CONFIG.spam.speed,
    displayWidth: SPRITE_SIZE.enemy * ENEMY_CONFIG.spam.copyScale,
    displayHeight: SPRITE_SIZE.enemy * ENEMY_CONFIG.spam.copyScale,
  }));
  const world = new WorldState({
    map, tileSize: map.tileWidth, collisionGrid, packet, enemies,
    packetSpawnTile: { x: 6, y: 7 }, enemyJailBounds: { minX: 4, maxX: 8, y: 8 },
  });
  const points = prepareTutorialWorld(lesson, world, movement);
  const collectibles = new CollectibleSystem(world, points);
  const controller = new TutorialController(lesson, world, movement, collectibles);
  const portals = new PortalService(collisionGrid, map.portalPairs);
  const rng = new SeededRandom(1);
  const systems = [
    new EnemyAbilitySystem(world, movement, portals, rng),
    new MazeHazardSystem(world, movement, rng, collectibles),
    new PacketMovementSystem(world, movement, portals),
    new EnemyMovementSystem(world, movement, new EnemyDecisionService(), portals, rng),
    new EnemyPacketCollisionSystem(world, movement),
    new AnimationSystem(world, 1),
    collectibles,
  ];
  const tick = (direction?: Direction, deltaMs = STEP_MS): void => {
    if (controller.getSnapshot().phase !== 'playing') return;
    if (direction) packet.direction.next = direction;
    controller.beforeUpdate();
    world.nextTick();
    systems.forEach((system) => system.update(deltaMs));
    controller.update(deltaMs);
  };
  const advance = (ticks: number, direction?: Direction): void => {
    for (let i = 0; i < ticks && controller.getSnapshot().phase === 'playing'; i += 1) tick(direction);
  };
  return { world, movement, collectibles, controller, tick, advance };
}

describe('guided tutorial checkpoints', () => {
  beforeEach(() => resetGameState());

  it('groups consistently titled enemy introductions before advanced mechanics', () => {
    expect(TUTORIAL_LESSONS.map(({ id, title }) => [id, title])).toEqual([
      ['movement', 'Move and turn'],
      ['firewall', 'Meet Firewall'],
      ['virus', 'Meet Virus'],
      ['ping', 'Meet Ping'],
      ['spam', 'Meet Spam'],
      ['lag', 'Meet Lag'],
      ['quarantine', 'Meet Quarantine'],
      ['trojan', 'Meet Trojan'],
      ['power', 'Turn the chase around'],
    ]);
    expect(TUTORIAL_LESSONS.find(({ id }) => id === 'power')?.introduction)
      .toContain('clear Lag zones and Quarantine walls, reveal hidden Trojans');
  });

  it.each(TUTORIAL_LESSONS)('starts the Packet moving automatically in $title', ({ id }) => {
    const lesson = createLesson(id);
    const before = { x: lesson.world.packet.x, y: lesson.world.packet.y };
    lesson.controller.resume();
    lesson.tick();
    expect({ x: lesson.world.packet.x, y: lesson.world.packet.y }).not.toEqual(before);
    expect(lesson.world.packet.direction.current).toBe(lesson.world.packet.direction.next);
  });

  it('starts moving automatically and requires a corner turn plus every data bit', () => {
    const lesson = createLesson('movement');
    const introduction = lesson.controller.getSnapshot();
    expect(lesson.controller.getSnapshot()).toBe(introduction);
    lesson.controller.resume();
    const playing = lesson.controller.getSnapshot();
    expect(lesson.controller.getMarkerTiles()).toEqual([
      { x: 1, y: 1 },
      { x: 1, y: 11 },
      { x: 6, y: 5 },
      { x: 11, y: 3 },
    ]);
    lesson.advance(16);
    expect(lesson.world.packet.tile).toEqual({ x: 7, y: 7 });
    expect(lesson.controller.getSnapshot()).toBe(playing);
    expect(lesson.collectibles.getPointCount()).toBe(4);
    expect(getGameState().score).toBe(0);

    lesson.advance(128, 'up');
    expect(lesson.world.packet.tile).toEqual({ x: 11, y: 3 });
    expect(lesson.collectibles.getPointCount()).toBe(3);
    expect(lesson.controller.getMarkerTiles()).toEqual([
      { x: 1, y: 1 },
      { x: 1, y: 11 },
      { x: 6, y: 5 },
    ]);
    expect(getGameState().score).toBe(10);

    for (const [tile, direction] of [
      [{ x: 1, y: 1 }, 'up'],
      [{ x: 1, y: 11 }, 'down'],
      [{ x: 6, y: 5 }, 'down'],
    ] as const) {
      lesson.movement.setEntityTile(lesson.world.packet, tile);
      lesson.world.packet.direction = { current: direction, next: direction };
      lesson.tick();
    }
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(lesson.world.packet.portalBlinkRemainingMs).toBe(0);
    expect(lesson.collectibles.getPointCount()).toBe(0);
    expect(lesson.controller.getMarkerTiles()).toEqual([]);
    expect(getGameState().score).toBe(40);
  });

  it('runs Firewall’s standard patrol while requiring the marked data bit', () => {
    const lesson = createLesson('firewall');
    const firewall = lesson.world.enemies.find((enemy) => enemy.key === 'firewall')!;
    expect(firewall.tile).toEqual({ x: 11, y: 1 });
    expect(Array.from(lesson.collectibles.getPoints()).map((entry) => entry.tile)).toEqual([
      { x: 1, y: 2 },
    ]);
    lesson.controller.resume();
    for (let step = 0; step < 192; step += 1) {
      lesson.tick();
    }
    lesson.movement.setEntityTile(lesson.world.packet, { x: 1, y: 2 });
    lesson.world.packet.direction = { current: 'left', next: 'left' };
    lesson.tick();
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(lesson.world.packet.tile).toEqual({ x: 1, y: 2 });
    expect(lesson.world.enemies.filter((enemy) => enemy.active).map((enemy) => enemy.key)).toEqual([
      'firewall',
    ]);
    expect(getGameState().lives).toBe(3);
  });

  it('auto-starts toward the bottom-right data bit while Virus follows the real movement', () => {
    const lesson = createLesson('virus');
    expect(Array.from(lesson.collectibles.getPoints()).map((entry) => entry.tile)).toEqual([{ x: 11, y: 11 }]);
    expect(lesson.world.enemies.find((enemy) => enemy.key === 'virus')?.tile).toEqual({ x: 1, y: 1 });
    lesson.controller.resume();
    lesson.advance(80, 'right');
    lesson.advance(64, 'down');
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(lesson.world.packet.tile).toEqual({ x: 11, y: 10 });
    expect(lesson.world.packet.x).toBe(184);
    expect(lesson.world.packet.y).toBeGreaterThan(177.75);
    expect(lesson.world.packet.y).toBeLessThan(184);
    expect(lesson.collectibles.getPointCount()).toBe(0);
    expect(lesson.world.enemies.filter((enemy) => enemy.active).map((enemy) => enemy.key)).toEqual([
      'virus',
    ]);
    expect(getGameState().lives).toBe(3);
  });

  it('supports the full scared chase against Firewall’s standard patrol', () => {
    const lesson = createLesson('power');
    const enemy = lesson.world.enemies.find((entry) => entry.key === 'firewall')!;
    expect(enemy.tile).toEqual({ x: 11, y: 1 });
    expect(Array.from(lesson.collectibles.getPoints()).map((entry) => entry.tile)).toEqual([{ x: 2, y: 6 }]);
    lesson.controller.resume();
    for (let step = 0; step < 64; step += 1) {
      lesson.tick();
    }
    expect(lesson.world.packet.tile).toEqual({ x: 2, y: 7 });
    lesson.advance(32, 'up');
    lesson.advance(16, 'right');
    expect(lesson.world.packet.tile).toEqual({ x: 2, y: 6 });
    expect(lesson.controller.getSnapshot().phase).toBe('playing');
    expect(lesson.controller.getMarkerTiles()).toEqual([enemy.tile]);
    expect(getGameState().score).toBe(50);
    expect(enemy.state.scared).toBe(true);
    lesson.movement.setEntityTile(lesson.world.packet, enemy.tile);
    lesson.tick();
    lesson.advance(90);
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(enemy.state.dead).toBe(true);
    expect(enemy.eatenElapsedMs).toBe(420);
    expect(getGameState()).toEqual({ score: 250, lives: 3 });
  });

  it('auto-starts through a real Ping scan, then requires the data bit at (10,11)', () => {
    const lesson = createLesson('ping');
    expect(Array.from(lesson.collectibles.getPoints()).map((entry) => entry.tile)).toEqual([{ x: 10, y: 11 }]);
    lesson.controller.resume();
    lesson.advance(16);
    expect(lesson.world.packet.tile).toEqual({ x: 7, y: 7 });
    lesson.advance(165);
    expect(lesson.controller.getSnapshot().phase).toBe('explanation');
    expect(lesson.world.enemyEffects.find((effect) => effect.kind === 'ping')?.target?.x).toBeGreaterThan(104);
    expect(lesson.controller.getSnapshot().marker).toEqual({ x: 10, y: 11 });
    lesson.controller.resume();
    lesson.movement.setEntityTile(lesson.world.packet, { x: 10, y: 11 });
    lesson.world.packet.direction = { current: 'down', next: 'down' };
    lesson.tick('down');
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(lesson.collectibles.getPointCount()).toBe(0);
    expect(getGameState().score).toBe(10);
    expect(getGameState().lives).toBe(3);
  });

  it('pauses on a real Spam split, then requires the data bit at (11,1)', () => {
    const lesson = createLesson('spam');
    expect(Array.from(lesson.collectibles.getPoints()).map((entry) => entry.tile)).toEqual([{ x: 11, y: 1 }]);
    lesson.controller.resume();
    lesson.advance(241);
    expect(lesson.controller.getSnapshot().phase).toBe('explanation');
    expect(lesson.world.enemies.filter((enemy) => enemy.isCopy && enemy.active)).toHaveLength(1);
    expect(lesson.controller.getSnapshot().marker).toEqual({ x: 11, y: 1 });
    lesson.controller.resume();
    expect(lesson.controller.getSnapshot().phase).toBe('playing');
    lesson.movement.setEntityTile(lesson.world.packet, { x: 11, y: 1 });
    lesson.world.packet.direction = { current: 'up', next: 'up' };
    lesson.tick('up');
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(lesson.collectibles.getPointCount()).toBe(0);
    expect(getGameState().score).toBe(10);
    expect(getGameState().lives).toBe(3);
  });

  it('preserves the Meet Lag scene and requires actually crossing its zone at half speed', () => {
    const lesson = createLesson('lag');
    lesson.controller.resume();
    lesson.advance(65);
    expect(lesson.controller.getSnapshot().phase).toBe('explanation');
    const zone = lesson.world.lagZones[0];
    const lag = lesson.world.enemies.find((enemy) => enemy.key === 'lag')!;
    const preserved = {
      packet: {
        x: lesson.world.packet.x, y: lesson.world.packet.y,
        tile: { ...lesson.world.packet.tile }, moved: { ...lesson.world.packet.moved },
        direction: { ...lesson.world.packet.direction },
      },
      lag: {
        x: lag.x, y: lag.y, tile: { ...lag.tile }, moved: { ...lag.moved }, direction: lag.direction,
      },
    };
    expect(zone.tile).toEqual({ x: 4, y: 5 });
    lesson.controller.resume();
    expect(lesson.world.lagZones[0]).toBe(zone);
    expect({
      packet: {
        x: lesson.world.packet.x, y: lesson.world.packet.y,
        tile: lesson.world.packet.tile, moved: lesson.world.packet.moved,
        direction: lesson.world.packet.direction,
      },
      lag: { x: lag.x, y: lag.y, tile: lag.tile, moved: lag.moved, direction: lag.direction },
    }).toEqual(preserved);

    lesson.movement.setEntityTile(lesson.world.packet, { x: 3, y: 5 });
    lesson.world.packet.direction = { current: 'right', next: 'right' };
    lesson.movement.setEntityTile(lag, { x: 5, y: 5 });
    lag.direction = 'right';
    lesson.advance(32);
    expect(lesson.controller.getSnapshot().phase).toBe('playing');
    expect(lesson.world.packet.x).toBeLessThan(88);
    lesson.advance(16);
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(lesson.world.packet.tile).toEqual({ x: 5, y: 5 });
    expect(getGameState().lives).toBe(3);
  });

  it('pauses on Quarantine’s actual walls, then requires the marked data bit', () => {
    const lesson = createLesson('quarantine');
    const quarantine = lesson.world.enemies.find((enemy) => enemy.key === 'quarantine')!;
    expect(quarantine.active).toBe(true);
    expect(Array.from(lesson.collectibles.getPoints(), (entry) => entry.tile)).toEqual([{ x: 1, y: 2 }]);
    lesson.controller.resume();
    lesson.advance(360);
    expect(lesson.controller.getSnapshot().phase).toBe('explanation');
    expect(lesson.world.quarantineWalls.length).toBeGreaterThan(0);
    expect(lesson.controller.getSnapshot().marker).toEqual({ x: 1, y: 2 });
    lesson.controller.resume();
    lesson.movement.setEntityTile(lesson.world.packet, { x: 1, y: 2 });
    lesson.world.packet.direction = { current: 'left', next: 'left' };
    lesson.tick();
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(lesson.collectibles.getPointCount()).toBe(0);
    expect(getGameState().lives).toBe(3);
  });

  it('pauses on Trojan’s real disguise and reveal, then requires a safe escape', () => {
    const lesson = createLesson('trojan');
    const trojan = lesson.world.enemies.find((enemy) => enemy.key === 'trojan')!;
    expect(trojan.active).toBe(true);
    expect(lesson.world.packetSpawnTile).toEqual({ x: 1, y: 1 });
    lesson.controller.resume();
    lesson.advance(480);
    expect(lesson.controller.getSnapshot().phase).toBe('explanation');
    expect(trojan.disguised).toBe(true);
    expect(lesson.world.visitedPacketTiles.has(`${trojan.tile.x},${trojan.tile.y}`)).toBe(true);
    expect(lesson.collectibles.getPointCount()).toBe(0);
    expect(lesson.controller.getSnapshot().marker).toEqual(trojan.tile);
    lesson.controller.resume();
    lesson.movement.setEntityTile(lesson.world.packet, trojan.tile);
    lesson.tick();
    expect(lesson.controller.getSnapshot().phase).toBe('explanation');
    expect(trojan.disguised).toBe(false);
    expect(trojan.revealRemainingMs).toBeGreaterThan(0);
    lesson.controller.resume();
    lesson.movement.setEntityTile(lesson.world.packet, { x: 1, y: 3 });
    lesson.tick(undefined, ENEMY_CONFIG.trojan.revealGraceMs);
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(getGameState().lives).toBe(3);
  });

  it('rejects a Quarantine point collected before the walls and keeps Trojan hidden until approached', () => {
    const quarantine = createLesson('quarantine');
    quarantine.controller.resume();
    quarantine.movement.setEntityTile(quarantine.world.packet, { x: 1, y: 2 });
    quarantine.world.packet.direction = { current: 'left', next: 'left' };
    quarantine.tick();
    expect(quarantine.controller.getSnapshot().phase).toBe('retry');

    const trojan = createLesson('trojan');
    trojan.controller.resume();
    trojan.advance(480);
    expect(trojan.controller.getSnapshot().phase).toBe('explanation');
    trojan.controller.resume();
    trojan.tick(undefined, ENEMY_CONFIG.trojan.disguiseDurationMs);
    expect(trojan.controller.getSnapshot().phase).toBe('playing');
    expect(trojan.world.enemies.find((enemy) => enemy.key === 'trojan')?.disguised).toBe(true);
  });

  it('offers retry when required power or a zone expires instead of leaving an impossible goal', () => {
    const power = createLesson('power');
    power.controller.resume();
    power.advance(64);
    power.advance(32, 'up');
    power.advance(16, 'right');
    power.tick('left', ENEMY_SCARED_DURATION_MS + 1);
    expect(power.controller.getSnapshot().phase).toBe('retry');
    expect(power.controller.resume()).toBe(false);

    const lag = createLesson('lag');
    lag.controller.resume();
    lag.advance(65);
    lag.controller.resume();
    lag.tick(undefined, ENEMY_CONFIG.lag.zoneDurationMs + 1);
    expect(lag.controller.getSnapshot().phase).toBe('retry');
  });

  it('gives dangerous contact priority over a collectible goal and supports a fresh retry', () => {
    const lesson = createLesson('firewall');
    lesson.controller.resume();
    const enemy = lesson.world.enemies.find((entry) => entry.key === 'firewall')!;
    lesson.movement.setEntityTile(lesson.world.packet, { x: 8, y: 7 });
    lesson.movement.setEntityTile(enemy, { x: 8, y: 7 });
    lesson.tick();
    expect(lesson.controller.getSnapshot().phase).toBe('retry');
    expect(lesson.collectibles.getPointCount()).toBe(1);
    expect(lesson.controller.resume()).toBe(false);
    resetGameState();
    const retry = createLesson('firewall');
    retry.controller.resume();
    retry.advance(192);
    retry.movement.setEntityTile(retry.world.packet, { x: 1, y: 2 });
    retry.world.packet.direction = { current: 'left', next: 'left' };
    retry.tick();
    expect(retry.controller.getSnapshot().phase).toBe('success');
  });

  it('also accepts a valid turn entered at the corner while collecting sparse bits', () => {
    const lesson = createLesson('movement');
    lesson.controller.resume();
    lesson.advance(80, 'right');
    lesson.advance(64, 'up');
    expect(lesson.world.packet.tile).toEqual({ x: 11, y: 3 });
    expect(lesson.collectibles.getPointCount()).toBe(3);
    for (const [tile, direction] of [
      [{ x: 1, y: 1 }, 'up'],
      [{ x: 1, y: 11 }, 'down'],
      [{ x: 6, y: 5 }, 'down'],
    ] as const) {
      lesson.movement.setEntityTile(lesson.world.packet, tile);
      lesson.world.packet.direction = { current: direction, next: direction };
      lesson.tick();
    }
    expect(lesson.collectibles.getPointCount()).toBe(0);
    expect(lesson.controller.getSnapshot().phase).toBe('success');
  });

  it('rejects a debug-assisted enemy capture that happened before collecting power', () => {
    const lesson = createLesson('power');
    lesson.controller.resume();
    setActiveEnemiesScaredWindow(lesson.world, ENEMY_SCARED_DURATION_MS);
    const enemy = lesson.world.enemies.find((entry) => entry.key === 'firewall')!;
    lesson.movement.setEntityTile(enemy, lesson.world.packet.tile);
    lesson.tick();
    expect(enemy.state.dead).toBe(true);
    lesson.movement.setEntityTile(lesson.world.packet, { x: 2, y: 6 });
    lesson.world.packet.direction = { current: 'up', next: 'up' };
    lesson.tick();
    expect(lesson.collectibles.getPointCount()).toBe(0);
    expect(lesson.controller.getSnapshot().phase).toBe('retry');
  });

  it.each(['ping', 'spam', 'lag'] as const)('retries if %s is eaten before its required demonstration', (id) => {
    const lesson = createLesson(id);
    lesson.controller.resume();
    setActiveEnemiesScaredWindow(lesson.world, ENEMY_SCARED_DURATION_MS);
    const enemy = lesson.world.enemies.find((entry) => entry.key === id)!;
    lesson.movement.setEntityTile(enemy, lesson.world.packet.tile);
    lesson.tick();
    expect(enemy.state.dead).toBe(true);
    expect(lesson.controller.getSnapshot().phase).toBe('retry');
    expect(lesson.controller.resume()).toBe(false);
  });

  it('does not stage the guided Lag crossing around a different zone after debug fear changes its route', () => {
    const lesson = createLesson('lag');
    lesson.controller.resume();
    setActiveEnemiesScaredWindow(lesson.world, ENEMY_SCARED_DURATION_MS);
    lesson.advance(600);
    expect(lesson.world.lagZones[0]?.tile).not.toEqual({ x: 4, y: 5 });
    expect(lesson.controller.getSnapshot().phase).toBe('retry');
  });

  it('does not accept out-of-order collection or debug fear as learned mechanics', () => {
    const movement = createLesson('movement');
    movement.controller.resume();
    movement.movement.setEntityTile(movement.world.packet, { x: 11, y: 3 });
    movement.world.packet.direction = { current: 'right', next: 'right' };
    movement.tick();
    expect(movement.collectibles.getPointCount()).toBe(3);
    expect(movement.controller.getSnapshot().phase).toBe('retry');

    const power = createLesson('power');
    power.controller.resume();
    setActiveEnemiesScaredWindow(power.world, ENEMY_SCARED_DURATION_MS);
    power.tick();
    expect(power.controller.getSnapshot().phase).toBe('playing');
    expect(power.collectibles.getPointCount()).toBe(1);
  });
});
