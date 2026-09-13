import { Camera3D } from '../../engine/camera3d';
import { clamp } from '../../engine/math';
import { ENEMY_CONFIG, INITIAL_LIVES, SPEED, SPRITE_SIZE, TILE_SIZE } from '../../config/constants';
import { resetGameState } from '../../state/gameState';
import { GhostEntity, GhostKey } from '../domain/entities/GhostEntity';
import { PacketEntity } from '../domain/entities/PacketEntity';
import { GhostDecisionService } from '../domain/services/GhostDecisionService';
import { GhostJailService, getObjectNumberProperty } from '../domain/services/GhostJailService';
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
import { GhostMovementSystem } from '../systems/GhostMovementSystem';
import { GhostPacketCollisionSystem } from '../systems/GhostPacketCollisionSystem';
import { GhostReleaseSystem } from '../systems/GhostReleaseSystem';
import { HudSystem } from '../systems/HudSystem';
import { InputSystem } from '../systems/InputSystem';
import { PacketMovementSystem } from '../systems/PacketMovementSystem';
import { PauseOverlaySystem } from '../systems/PauseOverlaySystem';
import { RenderSystem } from '../systems/RenderSystem';
import { MapVariant, resolveMapPathsForVariant } from './mapRuntimeConfig';
import { ComposedGame, RuntimeControl } from './contracts';

const GHOST_KEYS: GhostKey[] = ['firewall', 'virus', 'ping', 'spam', 'lag'];

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
      const jailService = new GhostJailService();

      const centerTile: TilePosition = {
        x: Math.floor(map.width / 2),
        y: Math.floor(map.height / 2),
      };

      const packetTile = jailService.resolveSpawnTile(map.packetSpawn, centerTile, map);
      const ghostJailBounds = jailService.resolveGhostJailBounds(map, packetTile);

      const ghostCountRaw = getObjectNumberProperty(map.ghostHome, 'ghostCount') ?? GHOST_KEYS.length;
      const ghostCount = clamp(Math.round(ghostCountRaw), 0, GHOST_KEYS.length);

      const packet = new PacketEntity(packetTile, SPRITE_SIZE.packet, SPRITE_SIZE.packet);
      movementRules.setEntityTile(packet, packetTile);

      const ghosts: GhostEntity[] = [];
      const spawnRange = Math.max(1, ghostJailBounds.maxX - ghostJailBounds.minX + 1);
      const spawnY = clamp(ghostJailBounds.y, 0, map.height - 1);
      for (let i = 0; i < ghostCount; i += 1) {
        const randomSpawnX = ghostJailBounds.minX + rng.int(spawnRange);
        const spawnTile = {
          x: clamp(randomSpawnX, 0, map.width - 1),
          y: spawnY,
        };

        const key = GHOST_KEYS[i];
        const ghost = new GhostEntity({
          key,
          tile: spawnTile,
          direction: rng.next() < 0.5 ? 'right' : 'left',
          speed: ENEMY_CONFIG[key].speed,
          displayWidth: SPRITE_SIZE.ghost,
          displayHeight: SPRITE_SIZE.ghost,
        });

        movementRules.setEntityTile(ghost, spawnTile);
        ghosts.push(ghost);
      }
      // Reserve a bounded copy pool; inactive slots never enter jail release or collisions.
      for (let i = 1; i < ENEMY_CONFIG.spam.maxCount; i += 1) {
        const copy = new GhostEntity({
          key: 'spam',
          isCopy: true,
          tile: packetTile,
          direction: 'right',
          speed: ENEMY_CONFIG.spam.speed,
          displayWidth: SPRITE_SIZE.ghost * ENEMY_CONFIG.spam.copyScale,
          displayHeight: SPRITE_SIZE.ghost * ENEMY_CONFIG.spam.copyScale,
        });
        movementRules.setEntityTile(copy, packetTile);
        ghosts.push(copy);
      }

      resetGameState(0, INITIAL_LIVES);

      const world = new WorldState({
        map,
        tileSize,
        collisionGrid,
        packetSpawnTile: packetTile,
        packet,
        ghosts,
        ghostJailBounds,
      });

      const camera = new Camera3D();
      renderer = new ThreeRendererAdapter(canvas);
      input = new BrowserInputAdapter(canvas);
      const scheduler = new TimerSchedulerAdapter();

      const portalService = new PortalService(collisionGrid, map.portalPairs ?? []);
      const ghostDecisions = new GhostDecisionService();

      const inputSystem = new InputSystem(input, world, runtimeControl);
      const enemyAbilitySystem = new EnemyAbilitySystem(world, movementRules, portalService, rng);
      const packetSystem = new PacketMovementSystem(world, movementRules, portalService);
      const ghostReleaseSystem = new GhostReleaseSystem(world, movementRules, jailService, scheduler, rng);
      const ghostMovementSystem = new GhostMovementSystem(world, movementRules, ghostDecisions, portalService, rng);
      const ghostPacketCollisionSystem = new GhostPacketCollisionSystem(world, movementRules, SPEED.ghost);
      const animationSystem = new AnimationSystem(world, SPEED.ghost);
      const cameraSystem = new CameraSystem(world, camera, renderer, canvas);
      const collectibleSystem = new CollectibleSystem(world);
      const hudSystem = new HudSystem(mount);
      const pauseOverlaySystem = new PauseOverlaySystem(world, mount);
      const debugSystem = new DebugOverlaySystem(world, camera);
      renderSystem = new RenderSystem(world, renderer, camera, collectibleSystem, assets);

      const updateSystems = [
        inputSystem,
        enemyAbilitySystem,
        packetSystem,
        ghostReleaseSystem,
        ghostMovementSystem,
        ghostPacketCollisionSystem,
        animationSystem,
        renderSystem,
        cameraSystem,
        collectibleSystem,
        hudSystem,
        pauseOverlaySystem,
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
