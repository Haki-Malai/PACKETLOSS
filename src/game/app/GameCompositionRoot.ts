import { Camera3D } from '../../engine/camera3d';
import { clamp } from '../../engine/math';
import { ENEMY_CONFIG, INITIAL_LIVES, SPEED, SPRITE_SIZE, TILE_SIZE } from '../../config/constants';
import { resetGameState } from '../../state/gameState';
import { EnemyEntity, ENEMY_KEYS } from '../domain/entities/EnemyEntity';
import { PacketEntity } from '../domain/entities/PacketEntity';
import { EnemyDecisionService } from '../domain/services/EnemyDecisionService';
import { EnemyJailService, getObjectNumberProperty } from '../domain/services/EnemyJailService';
import { MovementRules } from '../domain/services/MovementRules';
import { PortalService } from '../domain/services/PortalService';
import { TilePosition } from '../domain/valueObjects/TilePosition';
import { CollisionGrid } from '../domain/world/CollisionGrid';
import { WorldState } from '../domain/world/WorldState';
import { BrowserInputAdapter } from '../infrastructure/adapters/BrowserInputAdapter';
import { ThreeRendererAdapter } from '../infrastructure/adapters/ThreeRendererAdapter';
import { TimerSchedulerAdapter } from '../infrastructure/adapters/TimerSchedulerAdapter';
import { TiledMapRepository } from '../infrastructure/map/TiledMapRepository';
import { ArcadeAssets } from '../infrastructure/three/ArcadeAssets';
import { toRandomSource } from '../shared/random/RandomSource';
import { SeededRandom } from '../shared/random/SeededRandom';
import { AnimationSystem } from '../systems/AnimationSystem';
import { CameraSystem } from '../systems/CameraSystem';
import { CollectibleSystem } from '../systems/CollectibleSystem';
import { DebugOverlaySystem } from '../systems/DebugOverlaySystem';
import { IS_DEV } from '../../config/environment';
import { EnemyAbilitySystem } from '../systems/EnemyAbilitySystem';
import { MazeHazardSystem } from '../systems/MazeHazardSystem';
import { EnemyMovementSystem } from '../systems/EnemyMovementSystem';
import { EnemyPacketCollisionSystem } from '../systems/EnemyPacketCollisionSystem';
import { EnemyReleaseSystem } from '../systems/EnemyReleaseSystem';
import type { DebugSnapshot } from '../shared/events/DebugSnapshot';
import { InputSystem } from '../systems/InputSystem';
import { PacketMovementSystem } from '../systems/PacketMovementSystem';
import { RenderSystem } from '../systems/RenderSystem';
import { ScoreBonusSystem } from '../systems/ScoreBonusSystem';
import { prepareTutorialWorld, TutorialController } from '../tutorial/TutorialController';
import type { TutorialLessonId } from '../tutorial/TutorialLesson';
import { MapVariant, resolveMapPathsForVariant } from './mapRuntimeConfig';
import type { PreloadedGameResources } from './preloadGameResources';
import { ComposedGame, RuntimeControl } from './contracts';

// Keep the development constructor outside the startup try/catch so production can omit its module.
const DevelopmentDebugSystem = IS_DEV ? DebugOverlaySystem : null;

/** Restores Packet state for a continued level without changing score or lives. */
function resetPacketForLevel(world: WorldState, movementRules: MovementRules): void {
  movementRules.setEntityTile(world.packet, world.packetSpawnTile);
  world.packet.active = true;
  world.packet.direction = { current: 'right', next: 'right' };
  if (world.packet.portalBlinkRemainingMs !== Infinity) {
    world.packet.portalBlinkRemainingMs = 0;
    world.packet.portalBlinkElapsedMs = 0;
  }
  world.packet.deathAnimationRemainingMs = 0;
  world.packet.enemyEatRemainingMs = 0;
  world.packet.deathRecoveryRemainingMs = 0;
  world.packet.deathRecoveryElapsedMs = 0;
  world.packet.deathRecoveryNextToggleAtMs = 0;
  world.packet.deathRecoveryVisible = true;
  world.packetAnimation = {
    frame: 0,
    elapsedMs: 0,
    sequenceIndex: 0,
    active: false,
  };
}

export interface GameCompositionOptions {
  mountId?: string;
  onDebugChange?: (_snapshot: DebugSnapshot) => void;
  mapVariant?: MapVariant;
  tutorialLesson?: TutorialLessonId;
  rng?: (() => number) | { next(): number; int(maxExclusive: number): number };
  preloadedResources?: PreloadedGameResources;
}

export class GameCompositionRoot {
  constructor(private readonly options: GameCompositionOptions = {}) {}

  /**
   * Builds the game and its owned resources, including diagnostics only in development.
   *
   * @param runtimeControl - Pause and resume operations bound to the owning runtime.
   * @param signal - Cancels loading before resources can be mounted into a replacement session.
   * @returns The composed game; rejects on startup failure after releasing acquired resources.
   */
  async compose(runtimeControl: RuntimeControl, signal?: AbortSignal): Promise<ComposedGame> {
    const mountId = this.options.mountId ?? 'game-root';
    const mount = document.getElementById(mountId);
    if (!mount) {
      throw new Error(`Game mount element not found: #${mountId}`);
    }

    const rng = this.options.tutorialLesson ? new SeededRandom(1) : toRandomSource(this.options.rng ?? Math.random);
    const mapVariant = this.options.tutorialLesson ? 'demo' : this.options.mapVariant ?? 'default';
    const { mapJsonPath } = resolveMapPathsForVariant(mapVariant);
    let assets: ArcadeAssets | undefined;
    let canvas: HTMLCanvasElement | undefined;
    let renderer: ThreeRendererAdapter | undefined;
    let input: BrowserInputAdapter | undefined;
    let renderSystem: RenderSystem | undefined;
    try {
      const preloaded = this.options.preloadedResources?.take(mapVariant);
      const map = preloaded?.map ?? await this.loadMapForVariant(
        new TiledMapRepository(), mapVariant, mapJsonPath, signal,
      );
      assets = preloaded?.assets;
      signal?.throwIfAborted();
      assets ??= await ArcadeAssets.load(signal);
      signal?.throwIfAborted();
      const tileSize = map.tileWidth || TILE_SIZE;

      canvas = document.createElement('canvas');
      canvas.className = 'block h-full w-full touch-none transition-[filter] duration-200 ease-out';

      const collisionGrid = new CollisionGrid(map.tiles.map((row) => row.map((tile) => ({ ...tile.collision }))));
      const movementRules = new MovementRules(tileSize);
      const jailService = new EnemyJailService();

      const centerTile: TilePosition = {
        x: Math.floor(map.width / 2),
        y: Math.floor(map.height / 2),
      };

      const packetTile = jailService.resolveSpawnTile(map.packetSpawn, centerTile, map);
      const enemyJailBounds = jailService.resolveEnemyJailBounds(map, packetTile);

      const enemyCountRaw = getObjectNumberProperty(map.enemyHome, 'enemyCount') ?? ENEMY_KEYS.length;
      const enemyCount = clamp(Math.round(enemyCountRaw), 0, ENEMY_KEYS.length);

      const packet = new PacketEntity(packetTile, SPRITE_SIZE.packet, SPRITE_SIZE.packet);
      movementRules.setEntityTile(packet, packetTile);

      const enemies: EnemyEntity[] = [];
      const spawnRange = Math.max(1, enemyJailBounds.maxX - enemyJailBounds.minX + 1);
      const spawnY = clamp(enemyJailBounds.y, 0, map.height - 1);
      for (let i = 0; i < enemyCount; i += 1) {
        const randomSpawnX = enemyJailBounds.minX + rng.int(spawnRange);
        const spawnTile = {
          x: clamp(randomSpawnX, 0, map.width - 1),
          y: spawnY,
        };

        const key = ENEMY_KEYS[i];
        const enemy = new EnemyEntity({
          key,
          tile: spawnTile,
          direction: rng.next() < 0.5 ? 'right' : 'left',
          speed: ENEMY_CONFIG[key].speed,
          displayWidth: SPRITE_SIZE.enemy,
          displayHeight: SPRITE_SIZE.enemy,
        });

        movementRules.setEntityTile(enemy, spawnTile);
        enemies.push(enemy);
      }
      // Reserve a bounded copy pool; inactive slots never enter jail release or collisions.
      for (let i = 1; i < ENEMY_CONFIG.spam.maxCount; i += 1) {
        const copy = new EnemyEntity({
          key: 'spam',
          isCopy: true,
          tile: packetTile,
          direction: 'right',
          speed: ENEMY_CONFIG.spam.speed,
          displayWidth: SPRITE_SIZE.enemy * ENEMY_CONFIG.spam.copyScale,
          displayHeight: SPRITE_SIZE.enemy * ENEMY_CONFIG.spam.copyScale,
        });
        movementRules.setEntityTile(copy, packetTile);
        enemies.push(copy);
      }

      resetGameState(0, INITIAL_LIVES);

      const world = new WorldState({
        map,
        tileSize,
        collisionGrid,
        packetSpawnTile: packetTile,
        packet,
        enemies,
        enemyJailBounds,
      });
      const tutorialPoints = this.options.tutorialLesson
        ? prepareTutorialWorld(this.options.tutorialLesson, world, movementRules)
        : undefined;

      const camera = new Camera3D();
      renderer = new ThreeRendererAdapter(canvas, true);
      input = new BrowserInputAdapter(canvas);
      const scheduler = new TimerSchedulerAdapter();

      const portalService = new PortalService(collisionGrid, map.portalPairs ?? []);
      const enemyDecisions = new EnemyDecisionService();
      const gameplayRng = this.options.tutorialLesson ? new SeededRandom(1) : rng;

      const inputSystem = new InputSystem(input, world, runtimeControl, !this.options.tutorialLesson);
      const enemyAbilitySystem = new EnemyAbilitySystem(world, movementRules, portalService, gameplayRng);
      const collectibleSystem = new CollectibleSystem(world, tutorialPoints);
      const scoreBonusSystem = this.options.tutorialLesson ? undefined : new ScoreBonusSystem(world, collectibleSystem);
      const mazeHazardSystem = new MazeHazardSystem(world, movementRules, gameplayRng, collectibleSystem);
      const packetSystem = new PacketMovementSystem(world, movementRules, portalService);
      const enemyReleaseSystem = this.options.tutorialLesson
        ? null
        : new EnemyReleaseSystem(world, movementRules, jailService, scheduler, rng);
      const enemyMovementSystem = new EnemyMovementSystem(world, movementRules, enemyDecisions, portalService, gameplayRng);
      /** Restores the jail roster, then chooses fresh routes before rerelease. */
      const resetEnemiesToJail = (): void => {
        enemyReleaseSystem?.resetToJail();
        enemyMovementSystem.reset();
      };
      const enemyPacketCollisionSystem = new EnemyPacketCollisionSystem(
        world,
        movementRules,
        SPEED.enemy,
        enemyReleaseSystem ? resetEnemiesToJail : undefined,
      );
      const animationSystem = new AnimationSystem(world, SPEED.enemy);
      const cameraSystem = new CameraSystem(world, camera, renderer, canvas, !!this.options.tutorialLesson);
      const tutorial = this.options.tutorialLesson
        ? new TutorialController(this.options.tutorialLesson, world, movementRules, collectibleSystem)
        : undefined;
      const debugSystem = IS_DEV && DevelopmentDebugSystem
        ? new DevelopmentDebugSystem(world, camera, this.options.onDebugChange) : null;
      renderSystem = new RenderSystem(world, renderer, camera, collectibleSystem, assets,
        tutorial ? () => tutorial.getMarkerTiles() : undefined, scoreBonusSystem);

      const updateSystems = [
        inputSystem,
        enemyAbilitySystem,
        mazeHazardSystem,
        packetSystem,
        ...(enemyReleaseSystem ? [enemyReleaseSystem] : []),
        enemyMovementSystem,
        enemyPacketCollisionSystem,
        animationSystem,
        renderSystem,
        cameraSystem,
        collectibleSystem,
        ...(scoreBonusSystem ? [scoreBonusSystem] : []),
        ...(debugSystem ? [debugSystem] : []),
      ];

      const renderSystems = [renderSystem, ...(debugSystem ? [debugSystem] : [])];

      mount.replaceChildren(canvas);
      return {
        world,
        renderer,
        input,
        scheduler,
        updateSystems,
        renderSystems,
        getRemainingPointCount: () => collectibleSystem.getPointCount(),
        /** Refills collectibles and restores actors for an explicitly continued normal level. */
        resetLevel: () => {
          resetPacketForLevel(world, movementRules);
          resetEnemiesToJail();
          const count = collectibleSystem.refill();
          scoreBonusSystem?.refill();
          return count;
        },
        ...(tutorial ? { tutorial } : {}),
        destroy: () => {
          canvas?.remove();
        },
      };
    } catch (error) {
      input?.destroy();
      if (renderSystem) {
        renderSystem.destroy();
      } else {
        renderer?.dispose();
        assets?.dispose();
      }
      canvas?.remove();
      throw error;
    }
  }

  private async loadMapForVariant(
    mapRepository: TiledMapRepository,
    mapVariant: MapVariant,
    mapJsonPath: string,
    signal?: AbortSignal,
  ) {
    try {
      return await (signal
        ? mapRepository.loadMap(mapJsonPath, signal)
        : mapRepository.loadMap(mapJsonPath));
    } catch (error) {
      if (mapVariant === 'demo') {
        throw new Error(
          `DEMO map startup failed while loading "${mapJsonPath}": ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
      throw error;
    }
  }
}
