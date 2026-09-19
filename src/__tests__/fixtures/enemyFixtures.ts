import { ENEMY_CONFIG, SPRITE_SIZE, TILE_SIZE } from '../../config/constants';
import { EnemyArchetype, EnemyEntity } from '../../game/domain/entities/EnemyEntity';
import { PacketEntity } from '../../game/domain/entities/PacketEntity';
import { EnemyDecisionService } from '../../game/domain/services/EnemyDecisionService';
import { MovementRules } from '../../game/domain/services/MovementRules';
import { PortalService } from '../../game/domain/services/PortalService';
import { Direction } from '../../game/domain/valueObjects/Direction';
import { TilePosition } from '../../game/domain/valueObjects/TilePosition';
import { PortalPair, WorldState } from '../../game/domain/world/WorldState';
import { SeededRandom } from '../../game/shared/random/SeededRandom';
import { EnemyAbilitySystem } from '../../game/systems/EnemyAbilitySystem';
import { EnemyMovementSystem } from '../../game/systems/EnemyMovementSystem';
import { PacketMovementSystem } from '../../game/systems/PacketMovementSystem';
import { openTile, wallTile } from './collisionFixtures';
import { createMapFixture } from './pointLayoutFixtures';

interface EnemySpec {
  key: EnemyArchetype;
  tile: TilePosition;
  direction?: Direction;
  isCopy?: boolean;
}

export function createEnemyWorld(
  rows: string[],
  specs: EnemySpec[] = [],
  packetTile: TilePosition = { x: 1, y: 1 },
  portalPairs: PortalPair[] = [],
) {
  const { map, collisionGrid } = createMapFixture(rows.map((row) => [...row].map((cell) =>
    cell === '#' ? wallTile() : openTile({ portal: cell === 'P' }),
  )));
  map.portalPairs = portalPairs;
  const movement = new MovementRules(TILE_SIZE);
  const packet = new PacketEntity(packetTile, SPRITE_SIZE.packet, SPRITE_SIZE.packet);
  movement.setEntityTile(packet, packetTile);
  const enemies = specs.map((spec) => {
    const size = SPRITE_SIZE.enemy * (spec.isCopy ? ENEMY_CONFIG.spam.copyScale : 1);
    const enemy = new EnemyEntity({
      ...spec, direction: spec.direction ?? 'right', speed: ENEMY_CONFIG[spec.key].speed,
      displayWidth: size, displayHeight: size,
    });
    enemy.state.free = !enemy.isCopy;
    enemy.state.soonFree = false;
    movement.setEntityTile(enemy, spec.tile);
    return enemy;
  });
  const world = new WorldState({
    map, collisionGrid, tileSize: TILE_SIZE, packet, packetSpawnTile: packetTile, enemies,
    enemyJailBounds: { minX: 1, maxX: map.width - 2, y: map.height - 2 },
  });
  const portals = new PortalService(collisionGrid, portalPairs);
  const rng = new SeededRandom(1337);
  const decisions = new EnemyDecisionService();
  return {
    world, movement, portals, decisions,
    abilities: new EnemyAbilitySystem(world, movement, portals, rng),
    enemyMovement: new EnemyMovementSystem(world, movement, decisions, portals, rng),
    packetMovement: new PacketMovementSystem(world, movement, portals),
  };
}
