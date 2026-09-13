import { ENEMY_CONFIG, SPRITE_SIZE, TILE_SIZE } from '../../config/constants';
import { EnemyArchetype, GhostEntity } from '../../game/domain/entities/GhostEntity';
import { PacketEntity } from '../../game/domain/entities/PacketEntity';
import { GhostDecisionService } from '../../game/domain/services/GhostDecisionService';
import { MovementRules } from '../../game/domain/services/MovementRules';
import { PortalService } from '../../game/domain/services/PortalService';
import { Direction } from '../../game/domain/valueObjects/Direction';
import { TilePosition } from '../../game/domain/valueObjects/TilePosition';
import { PortalPair, WorldState } from '../../game/domain/world/WorldState';
import { SeededRandom } from '../../game/shared/random/SeededRandom';
import { EnemyAbilitySystem } from '../../game/systems/EnemyAbilitySystem';
import { GhostMovementSystem } from '../../game/systems/GhostMovementSystem';
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
  const ghosts = specs.map((spec) => {
    const size = SPRITE_SIZE.ghost * (spec.isCopy ? ENEMY_CONFIG.spam.copyScale : 1);
    const ghost = new GhostEntity({
      ...spec, direction: spec.direction ?? 'right', speed: ENEMY_CONFIG[spec.key].speed,
      displayWidth: size, displayHeight: size,
    });
    ghost.state.free = !ghost.isCopy;
    ghost.state.soonFree = false;
    movement.setEntityTile(ghost, spec.tile);
    return ghost;
  });
  const world = new WorldState({
    map, collisionGrid, tileSize: TILE_SIZE, packet, packetSpawnTile: packetTile, ghosts,
    ghostJailBounds: { minX: 1, maxX: map.width - 2, y: map.height - 2 },
  });
  const portals = new PortalService(collisionGrid, portalPairs);
  const rng = new SeededRandom(1337);
  return {
    world, movement, portals,
    abilities: new EnemyAbilitySystem(world, movement, portals, rng),
    ghostMovement: new GhostMovementSystem(world, movement, new GhostDecisionService(), portals, rng),
    packetMovement: new PacketMovementSystem(world, movement, portals),
  };
}
