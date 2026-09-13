import { Camera3D } from '../../engine/camera3d';
import { clamp } from '../../engine/math';
import { ENEMY_CONFIG, INITIAL_LIVES, SPEED, SPRITE_SIZE, TILE_SIZE } from '../../config/constants';
import { resetGameState } from '../../state/gameState';
import { EnemyEntity, EnemyKey } from '../domain/entities/EnemyEntity';
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
import { AnimationSystem } from '../systems/AnimationSystem';
import { CameraSystem } from '../systems/CameraSystem';
import { CollectibleSystem } from '../systems/CollectibleSystem';
import { DebugOverlaySystem } from '../systems/DebugOverlaySystem';
import { EnemyAbilitySystem } from '../systems/EnemyAbilitySystem';
import { EnemyMovementSystem } from '../systems/EnemyMovementSystem';
import { EnemyPacketCollisionSystem } from '../systems/EnemyPacketCollisionSystem';
import { EnemyReleaseSystem } from '../systems/EnemyReleaseSystem';
import { HudSystem } from '../systems/HudSystem';
import { InputSystem } from '../systems/InputSystem';
import { PacketMovementSystem } from '../systems/PacketMovementSystem';
import { RenderSystem } from '../systems/RenderSystem';
import { MapVariant, resolveMapPathsForVariant } from './mapRuntimeConfig';
import { ComposedGame, RuntimeControl } from './contracts';

const ENEMY_KEYS: EnemyKey[] = ['firewall', 'virus', 'ping', 'spam', 'lag'];

export interface GameCompositionOptions {
  mountId?: string;
  mapVariant?: MapVariant;
  rng?: (() => number) | { next(): number; int(maxExclusive: number): number };
}

export class GameCompositionRoot {
  constructor(private readonly options: GameCompositionOptions = {}) {}

  async compose(runtimeControl: RuntimeControl, signal?: AbortSignal): Promise<ComposedGame> {
    const mountId = this.options.mountId ?? 'game-root';
    const mount = document.getElementById(mountId);
    if (!mount) {
      throw new Error(`Game mount element not found: #${mountId}`);
    }

    const mapRepository = new TiledMapRepository();
    const rng = toRandomSource(this.options.rng ?? Math.random);
    const mapVariant = this.options.mapVariant ?? 'default';
    const { mapJsonPath } = resolveMapPathsForVariant(mapVariant);
    const map = await this.loadMapForVariant(mapRepository, mapVariant, mapJsonPath);
    signal?.throwIfAborted();
    const assets = await ArcadeAssets.load(signal);
    let canvas: HTMLCanvasElement | undefined;
    let renderer: ThreeRendererAdapter | undefined;
    let input: BrowserInputAdapter | undefined;
    let renderSystem: RenderSystem | undefined;
    try {
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

      const camera = new Camera3D();
      renderer = new ThreeRendererAdapter(canvas);
      input = new BrowserInputAdapter(canvas);
      const scheduler = new TimerSchedulerAdapter();

      const portalService = new PortalService(collisionGrid, map.portalPairs ?? []);
      const enemyDecisions = new EnemyDecisionService();

      const inputSystem = new InputSystem(input, world, runtimeControl);
      const enemyAbilitySystem = new EnemyAbilitySystem(world, movementRules, portalService, rng);
      const packetSystem = new PacketMovementSystem(world, movementRules, portalService);
      const enemyReleaseSystem = new EnemyReleaseSystem(world, movementRules, jailService, scheduler, rng);
      const enemyMovementSystem = new EnemyMovementSystem(world, movementRules, enemyDecisions, portalService, rng);
      const enemyPacketCollisionSystem = new EnemyPacketCollisionSystem(world, movementRules, SPEED.enemy);
      const animationSystem = new AnimationSystem(world, SPEED.enemy);
      const cameraSystem = new CameraSystem(world, camera, renderer, canvas);
      const collectibleSystem = new CollectibleSystem(world);
      const hudSystem = new HudSystem(mount, () => runtimeControl.pause());
      const debugSystem = new DebugOverlaySystem(world, camera);
      renderSystem = new RenderSystem(world, renderer, camera, collectibleSystem, assets);

      const updateSystems = [
        inputSystem,
        enemyAbilitySystem,
        packetSystem,
        enemyReleaseSystem,
        enemyMovementSystem,
        enemyPacketCollisionSystem,
        animationSystem,
        renderSystem,
        cameraSystem,
        collectibleSystem,
        hudSystem,
        debugSystem,
      ];

      const renderSystems = [renderSystem, debugSystem, hudSystem];

      mount.replaceChildren(canvas);
      return {
        world,
        renderer,
        input,
        scheduler,
        updateSystems,
        renderSystems,
        getRemainingPointCount: () => collectibleSystem.getPointCount(),
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
        assets.dispose();
      }
      canvas?.remove();
      throw error;
    }
  }

  private async loadMapForVariant(
    mapRepository: TiledMapRepository,
    mapVariant: MapVariant,
    mapJsonPath: string,
  ) {
    try {
      return await mapRepository.loadMap(mapJsonPath);
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
