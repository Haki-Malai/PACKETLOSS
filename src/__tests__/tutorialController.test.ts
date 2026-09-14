import { beforeEach, describe, expect, it } from 'vitest';
import { ENEMY_CONFIG, ENEMY_SCARED_DURATION_MS, SPRITE_SIZE } from '../config/constants';
import { EnemyEntity, type EnemyKey } from '../game/domain/entities/EnemyEntity';
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
import { PacketMovementSystem } from '../game/systems/PacketMovementSystem';
import { prepareTutorialWorld, TutorialController } from '../game/tutorial/TutorialController';
import type { TutorialLessonId } from '../game/tutorial/TutorialLesson';
import { getGameState, resetGameState } from '../state/gameState';
import { createHarnessMap } from './helpers/mechanicsDomainMapFactory';

const STEP_MS = 1000 / 60;
const ENEMY_KEYS: readonly EnemyKey[] = ['firewall', 'virus', 'ping', 'spam', 'lag'];

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

  it('requires real input, a corner turn, and a data-bit pickup in the movement lesson', () => {
    const lesson = createLesson('movement');
    const introduction = lesson.controller.getSnapshot();
    expect(lesson.controller.getSnapshot()).toBe(introduction);
    lesson.controller.resume();
    const playing = lesson.controller.getSnapshot();
    lesson.advance(60);
    expect(lesson.world.packet.tile).toEqual({ x: 6, y: 7 });
    expect(lesson.controller.getSnapshot()).toBe(playing);
    expect(lesson.collectibles.getPointCount()).toBe(1);

    lesson.advance(64, 'right');
    lesson.advance(48, 'up');
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(lesson.world.packet.tile).toEqual({ x: 11, y: 5 });
    expect(lesson.world.packet.portalBlinkRemainingMs).toBe(0);
    expect(getGameState().score).toBe(10);
  });

  it.each([
    { id: 'firewall' as const, direction: 'right' as const, destination: { x: 8, y: 7 } },
    { id: 'virus' as const, direction: 'left' as const, destination: { x: 4, y: 7 } },
  ])('makes the $id checkpoint safely reachable while the real enemy moves', ({ id, direction, destination }) => {
    const lesson = createLesson(id);
    lesson.controller.resume();
    lesson.advance(32, direction);
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(lesson.world.packet.tile).toEqual(destination);
    expect(lesson.world.enemies.filter((enemy) => enemy.active).map((enemy) => enemy.key)).toEqual([id]);
    expect(lesson.world.enemies.find((enemy) => enemy.key === id)?.tile).toEqual({ x: 11, y: 6 });
    expect(getGameState().lives).toBe(3);
  });

  it('requires a real outward portal crossing instead of just reaching its entrance', () => {
    const lesson = createLesson('portal');
    lesson.controller.resume();
    lesson.advance(16, 'left');
    expect(lesson.controller.getSnapshot().phase).toBe('playing');
    expect(lesson.world.packet.tile).toEqual({ x: 1, y: 7 });
    lesson.advance(8, 'left');
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(lesson.world.packet.tile).toEqual({ x: 11, y: 7 });
    expect(lesson.world.packet.portalBlinkRemainingMs).toBeGreaterThan(0);
    expect(lesson.collectibles.getPointCount()).toBe(0);
  });

  it('lets the player collect power and catch Firewall within the normal scared window', () => {
    const lesson = createLesson('power');
    lesson.controller.resume();
    lesson.advance(16, 'right');
    expect(lesson.controller.getSnapshot().phase).toBe('explanation');
    expect(getGameState().score).toBe(50);
    const enemy = lesson.world.enemies.find((entry) => entry.key === 'firewall')!;
    expect(enemy.state.scared).toBe(true);
    lesson.controller.resume();
    lesson.advance(90, 'right');
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(enemy.state.dead).toBe(true);
    expect(enemy.eatenElapsedMs).toBe(420);
    expect(getGameState()).toEqual({ score: 250, lives: 3 });
  });

  it.each(['ping', 'spam'] as const)('pauses on the real %s ability, then requires movement to finish', (id) => {
    const lesson = createLesson(id);
    lesson.controller.resume();
    lesson.advance(id === 'ping' ? 181 : 241);
    expect(lesson.controller.getSnapshot().phase).toBe('explanation');
    if (id === 'ping') {
      expect(lesson.world.enemyEffects.find((effect) => effect.kind === 'ping')?.target).toEqual({ x: 104, y: 120 });
    } else {
      expect(lesson.world.enemies.filter((enemy) => enemy.isCopy && enemy.active)).toHaveLength(1);
    }
    lesson.controller.resume();
    lesson.tick();
    expect(lesson.controller.getSnapshot().phase).toBe('playing');
    lesson.advance(32, 'right');
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(getGameState().lives).toBe(3);
  });

  it('keeps the zone created by Lag and requires actually crossing it at half speed', () => {
    const lesson = createLesson('lag');
    lesson.controller.resume();
    lesson.advance(65);
    expect(lesson.controller.getSnapshot().phase).toBe('explanation');
    const zone = lesson.world.lagZones[0];
    expect(zone.tile).toEqual({ x: 4, y: 5 });
    lesson.controller.resume();
    expect(lesson.world.lagZones[0]).toBe(zone);
    lesson.advance(32, 'right');
    expect(lesson.controller.getSnapshot().phase).toBe('playing');
    expect(lesson.world.packet.x).toBeLessThan(88);
    lesson.advance(16, 'right');
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(lesson.world.packet.tile).toEqual({ x: 5, y: 5 });
    expect(getGameState().lives).toBe(3);
  });

  it('shows actual power collection clearing an existing zone and suppressing all three abilities', () => {
    const lesson = createLesson('suppression');
    lesson.controller.resume();
    expect(lesson.world.lagZones).toHaveLength(1);
    lesson.advance(24, 'right');
    expect(lesson.controller.getSnapshot().phase).toBe('success');
    expect(lesson.world.lagZones).toHaveLength(0);
    expect(lesson.world.enemies.filter((enemy) => enemy.active).map((enemy) => [enemy.key, enemy.state.scared]))
      .toEqual([['ping', true], ['spam', true], ['lag', true]]);
    expect(getGameState().score).toBe(50);
  });

  it('offers retry when required power or a zone expires instead of leaving an impossible goal', () => {
    const power = createLesson('power');
    power.controller.resume();
    power.advance(16, 'right');
    power.controller.resume();
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
    retry.advance(32, 'right');
    expect(retry.controller.getSnapshot().phase).toBe('success');
  });

  it('does not mistake zone expiry on the pickup tick for power clearing it', () => {
    const lesson = createLesson('suppression');
    lesson.controller.resume();
    lesson.movement.setEntityTile(lesson.world.packet, { x: 4, y: 5 });
    lesson.tick(undefined, ENEMY_CONFIG.lag.zoneDurationMs);
    expect(getGameState().score).toBe(50);
    expect(lesson.controller.getSnapshot().phase).toBe('retry');
  });

  it('retries when the authored suppression zone expires even while other zones remain', () => {
    const lesson = createLesson('suppression');
    lesson.controller.resume();
    lesson.advance(241);
    expect(lesson.world.lagZones.length).toBeGreaterThan(0);
    expect(lesson.world.lagZones.some((zone) => zone.tile.x === 4 && zone.tile.y === 5)).toBe(false);
    expect(lesson.controller.getSnapshot().phase).toBe('retry');
    expect(lesson.collectibles.getPointCount()).toBe(1);
  });

  it('also accepts a valid turn entered at the corner instead of queuing it early', () => {
    const lesson = createLesson('movement');
    lesson.controller.resume();
    lesson.advance(80, 'right');
    lesson.advance(32, 'up');
    expect(lesson.world.packet.tile).toEqual({ x: 11, y: 5 });
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
    lesson.movement.setEntityTile(lesson.world.packet, { x: 7, y: 7 });
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
    movement.movement.setEntityTile(movement.world.packet, { x: 11, y: 5 });
    movement.world.packet.direction = { current: 'right', next: 'right' };
    movement.tick();
    expect(movement.collectibles.getPointCount()).toBe(0);
    expect(movement.controller.getSnapshot().phase).toBe('retry');

    const power = createLesson('power');
    power.controller.resume();
    setActiveEnemiesScaredWindow(power.world, ENEMY_SCARED_DURATION_MS);
    power.tick();
    expect(power.controller.getSnapshot().phase).toBe('playing');
    expect(power.collectibles.getPointCount()).toBe(1);

    const suppression = createLesson('suppression');
    suppression.controller.resume();
    setActiveEnemiesScaredWindow(suppression.world, ENEMY_SCARED_DURATION_MS);
    suppression.tick();
    expect(suppression.controller.getSnapshot().phase).toBe('retry');
    expect(suppression.collectibles.getPointCount()).toBe(1);
  });
});
