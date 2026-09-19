import { ENEMY_CONFIG, SPEED, SPRITE_SIZE, TILE_SIZE } from '../../config/constants';
import { EnemyEntity, EnemyKey } from '../../game/domain/entities/EnemyEntity';
import { PacketEntity } from '../../game/domain/entities/PacketEntity';
import { EnemyDecisionService } from '../../game/domain/services/EnemyDecisionService';
import { EnemyJailService, getObjectNumberProperty } from '../../game/domain/services/EnemyJailService';
import { MovementRules } from '../../game/domain/services/MovementRules';
import { PortalService } from '../../game/domain/services/PortalService';
import { TilePosition } from '../../game/domain/valueObjects/TilePosition';
import { CollisionGrid } from '../../game/domain/world/CollisionGrid';
import { WorldState } from '../../game/domain/world/WorldState';
import { TimerSchedulerAdapter } from '../../game/infrastructure/adapters/TimerSchedulerAdapter';
import { SeededRandom } from '../../game/shared/random/SeededRandom';
import { AnimationSystem } from '../../game/systems/AnimationSystem';
import { EnemyAbilitySystem } from '../../game/systems/EnemyAbilitySystem';
import { EnemyMovementSystem } from '../../game/systems/EnemyMovementSystem';
import { EnemyPacketCollisionSystem } from '../../game/systems/EnemyPacketCollisionSystem';
import { EnemyReleaseSystem } from '../../game/systems/EnemyReleaseSystem';
import { PacketMovementSystem } from '../../game/systems/PacketMovementSystem';
import { createHarnessMap, HarnessFixture } from './mechanicsDomainMapFactory';

const DEFAULT_TICK_MS = 1000 / 60;
const ENEMY_KEYS: EnemyKey[] = ['firewall', 'virus', 'ping', 'spam', 'lag'];

export interface MechanicsDomainHarnessOptions {
  seed?: number;
  fixture?: HarnessFixture;
  enemyCount?: number;
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
  readonly jailService: EnemyJailService;
  readonly portalService: PortalService;
  readonly decisions: EnemyDecisionService;
  readonly packetSystem: PacketMovementSystem;
  readonly enemyReleaseSystem: EnemyReleaseSystem;
  readonly enemyMovementSystem: EnemyMovementSystem;
  readonly enemyPacketCollisionSystem: EnemyPacketCollisionSystem;
  readonly animationSystem: AnimationSystem;
  readonly enemyAbilitySystem: EnemyAbilitySystem;

  constructor(options: MechanicsDomainHarnessOptions = {}) {
    const seed = options.seed ?? 1337;
    const rng = new SeededRandom(seed);
    const fixture = options.fixture ?? 'default-map';

    const safeMap = createHarnessMap(fixture);
    const tileSize = safeMap.tileWidth || TILE_SIZE;

    const collisionGrid = new CollisionGrid(safeMap.tiles.map((row) => row.map((tile) => ({ ...tile.collision }))));
    this.movementRules = new MovementRules(tileSize);
    this.jailService = new EnemyJailService();

    const centerTile: TilePosition = {
      x: Math.floor(safeMap.width / 2),
      y: Math.floor(safeMap.height / 2),
    };

    const packetTile = this.jailService.resolveSpawnTile(safeMap.packetSpawn, centerTile, safeMap);
    const enemyJailBounds = this.jailService.resolveEnemyJailBounds(safeMap, packetTile);

    const enemyCountRaw = options.enemyCount ?? getObjectNumberProperty(safeMap.enemyHome, 'enemyCount') ?? 5;
    const enemyCount = Math.max(0, Math.round(enemyCountRaw));

    const packet = new PacketEntity(packetTile, SPRITE_SIZE.packet, SPRITE_SIZE.packet);
    this.movementRules.setEntityTile(packet, packetTile);

    const enemies: EnemyEntity[] = [];
    for (let index = 0; index < enemyCount; index += 1) {
      const range = enemyJailBounds.maxX - enemyJailBounds.minX + 1;
      const randomSpawnX = enemyJailBounds.minX + rng.int(Math.max(1, range));
      const spawnTile = {
        x: clamp(randomSpawnX, 0, safeMap.width - 1),
        y: clamp(enemyJailBounds.y, 0, safeMap.height - 1),
      };

      const enemy = new EnemyEntity({
        key: ENEMY_KEYS[index % ENEMY_KEYS.length],
        tile: spawnTile,
        direction: rng.next() < 0.5 ? 'right' : 'left',
        speed: ENEMY_CONFIG[ENEMY_KEYS[index % ENEMY_KEYS.length]].speed,
        displayWidth: SPRITE_SIZE.enemy,
        displayHeight: SPRITE_SIZE.enemy,
      });

      this.movementRules.setEntityTile(enemy, spawnTile);
      enemies.push(enemy);
    }

    this.world = new WorldState({
      map: safeMap,
      tileSize,
      collisionGrid,
      packetSpawnTile: packetTile,
      packet,
      enemies,
      enemyJailBounds,
    });

    this.scheduler = new TimerSchedulerAdapter();
    this.portalService = new PortalService(collisionGrid, safeMap.portalPairs ?? []);
    this.decisions = new EnemyDecisionService();

    this.packetSystem = new PacketMovementSystem(this.world, this.movementRules, this.portalService);
    this.enemyAbilitySystem = new EnemyAbilitySystem(this.world, this.movementRules, this.portalService, rng);
    this.enemyReleaseSystem = new EnemyReleaseSystem(this.world, this.movementRules, this.jailService, this.scheduler, rng);
    this.enemyMovementSystem = new EnemyMovementSystem(
      this.world,
      this.movementRules,
      this.decisions,
      this.portalService,
      rng,
    );
    this.enemyPacketCollisionSystem = new EnemyPacketCollisionSystem(
      this.world,
      this.movementRules,
      SPEED.enemy,
      () => {
        this.enemyReleaseSystem.resetToJail();
        this.enemyMovementSystem.reset();
      },
    );
    this.animationSystem = new AnimationSystem(this.world, SPEED.enemy);

    if (options.autoStartSystems ?? true) {
      this.enemyReleaseSystem.start();
      this.animationSystem.start();
    }
  }

  destroy(): void {
    this.enemyReleaseSystem.destroy();
    this.scheduler.clear();
  }

  stepTick(deltaMs = DEFAULT_TICK_MS): void {
    if (this.world.isMoving) {
      this.world.nextTick();
      this.scheduler.update(deltaMs);
      this.enemyAbilitySystem.update(deltaMs);
      this.packetSystem.update(deltaMs);
      this.enemyReleaseSystem.update();
      this.enemyMovementSystem.update();
      this.enemyPacketCollisionSystem.update(deltaMs);
      this.animationSystem.update(deltaMs);
    }
  }
}
