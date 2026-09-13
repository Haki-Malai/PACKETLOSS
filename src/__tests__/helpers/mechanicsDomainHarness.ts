import { SPEED, SPRITE_SIZE, TILE_SIZE } from '../../config/constants';
import { GhostEntity, GhostKey } from '../../game/domain/entities/GhostEntity';
import { PacketEntity } from '../../game/domain/entities/PacketEntity';
import { GhostDecisionService } from '../../game/domain/services/GhostDecisionService';
import { GhostJailService, getObjectNumberProperty } from '../../game/domain/services/GhostJailService';
import { MovementRules } from '../../game/domain/services/MovementRules';
import { PortalService } from '../../game/domain/services/PortalService';
import { TilePosition } from '../../game/domain/valueObjects/TilePosition';
import { CollisionGrid } from '../../game/domain/world/CollisionGrid';
import { WorldState } from '../../game/domain/world/WorldState';
import { TimerSchedulerAdapter } from '../../game/infrastructure/adapters/TimerSchedulerAdapter';
import { SeededRandom } from '../../game/shared/random/SeededRandom';
import { AnimationSystem } from '../../game/systems/AnimationSystem';
import { GhostMovementSystem } from '../../game/systems/GhostMovementSystem';
import { GhostPacketCollisionSystem } from '../../game/systems/GhostPacketCollisionSystem';
import { GhostReleaseSystem } from '../../game/systems/GhostReleaseSystem';
import { PacketMovementSystem } from '../../game/systems/PacketMovementSystem';
import { createHarnessMap, HarnessFixture } from './mechanicsDomainMapFactory';

const DEFAULT_TICK_MS = 1000 / 60;
const GHOST_KEYS: GhostKey[] = ['inky', 'clyde', 'pinky', 'blinky'];

export interface MechanicsDomainHarnessOptions {
  seed?: number;
  fixture?: HarnessFixture;
  ghostCount?: number;
  autoStartSystems?: boolean;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

export class MechanicsDomainHarness {
  readonly world: WorldState;
  readonly movementRules: MovementRules;
  readonly scheduler: TimerSchedulerAdapter;
  readonly jailService: GhostJailService;
  readonly portalService: PortalService;
  readonly decisions: GhostDecisionService;
  readonly packetSystem: PacketMovementSystem;
  readonly ghostReleaseSystem: GhostReleaseSystem;
  readonly ghostMovementSystem: GhostMovementSystem;
  readonly ghostPacketCollisionSystem: GhostPacketCollisionSystem;
  readonly animationSystem: AnimationSystem;

  constructor(options: MechanicsDomainHarnessOptions = {}) {
    const seed = options.seed ?? 1337;
    const rng = new SeededRandom(seed);
    const fixture = options.fixture ?? 'default-map';

    const safeMap = createHarnessMap(fixture);
    const tileSize = safeMap.tileWidth || TILE_SIZE;

    const collisionGrid = new CollisionGrid(safeMap.tiles.map((row) => row.map((tile) => ({ ...tile.collision }))));
    this.movementRules = new MovementRules(tileSize);
    this.jailService = new GhostJailService();

    const centerTile: TilePosition = {
      x: Math.floor(safeMap.width / 2),
      y: Math.floor(safeMap.height / 2),
    };

    const packetTile = this.jailService.resolveSpawnTile(safeMap.packetSpawn, centerTile, safeMap);
    const ghostJailBounds = this.jailService.resolveGhostJailBounds(safeMap, packetTile);

    const ghostCountRaw = options.ghostCount ?? getObjectNumberProperty(safeMap.ghostHome, 'ghostCount') ?? 4;
    const ghostCount = Math.max(0, Math.round(ghostCountRaw));

    const packet = new PacketEntity(packetTile, SPRITE_SIZE.packet, SPRITE_SIZE.packet);
    this.movementRules.setEntityTile(packet, packetTile);

    const ghosts: GhostEntity[] = [];
    for (let index = 0; index < ghostCount; index += 1) {
      const range = ghostJailBounds.maxX - ghostJailBounds.minX + 1;
      const randomSpawnX = ghostJailBounds.minX + rng.int(Math.max(1, range));
      const spawnTile = {
        x: clamp(randomSpawnX, 0, safeMap.width - 1),
        y: clamp(ghostJailBounds.y, 0, safeMap.height - 1),
      };

      const ghost = new GhostEntity({
        key: GHOST_KEYS[index % GHOST_KEYS.length],
        tile: spawnTile,
        direction: rng.next() < 0.5 ? 'right' : 'left',
        speed: SPEED.ghost,
        displayWidth: SPRITE_SIZE.ghost,
        displayHeight: SPRITE_SIZE.ghost,
      });

      this.movementRules.setEntityTile(ghost, spawnTile);
      ghosts.push(ghost);
    }

    this.world = new WorldState({
      map: safeMap,
      tileSize,
      collisionGrid,
      packetSpawnTile: packetTile,
      packet,
      ghosts,
      ghostJailBounds,
    });

    this.scheduler = new TimerSchedulerAdapter();
    this.portalService = new PortalService(collisionGrid, safeMap.portalPairs ?? []);
    this.decisions = new GhostDecisionService();

    this.packetSystem = new PacketMovementSystem(this.world, this.movementRules, this.portalService);
    this.ghostReleaseSystem = new GhostReleaseSystem(this.world, this.movementRules, this.jailService, this.scheduler, rng);
    this.ghostMovementSystem = new GhostMovementSystem(
      this.world,
      this.movementRules,
      this.decisions,
      this.portalService,
      rng,
    );
    this.ghostPacketCollisionSystem = new GhostPacketCollisionSystem(
      this.world,
      this.movementRules,
      SPEED.ghost,
    );
    this.animationSystem = new AnimationSystem(this.world, SPEED.ghost);

    if (options.autoStartSystems ?? true) {
      this.ghostReleaseSystem.start();
      this.animationSystem.start();
    }
  }

  destroy(): void {
    this.ghostReleaseSystem.destroy();
    this.scheduler.clear();
  }

  stepTick(deltaMs = DEFAULT_TICK_MS): void {
    if (this.world.isMoving) {
      this.world.nextTick();
      this.scheduler.update(deltaMs);
      this.packetSystem.update(deltaMs);
      this.ghostReleaseSystem.update();
      this.ghostMovementSystem.update();
      this.ghostPacketCollisionSystem.update(deltaMs);
      this.animationSystem.update(deltaMs);
    }
  }
}
