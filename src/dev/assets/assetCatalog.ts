import {
  ENEMY_CONFIG, ENEMY_SCARED_WARNING_DURATION_MS, PACKET_DEATH_ANIMATION, PACKET_DEATH_RECOVERY, PACKET_PORTAL_BLINK,
  TILE_SIZE,
} from '../../config/constants';
import { EAT_EFFECT_DURATION_MS } from '../../game/shared/pickupEffects';
import { ENEMY_EAT_DURATION_MS } from '../../game/shared/enemyEating';
import { ENEMY_KEYS } from '../../game/domain/entities/EnemyEntity';

export interface AssetPreviewEntry {
  id: string;
  category: 'Player' | 'Enemies' | 'Points' | 'Walls' | 'Other';
  name: string;
  state: string;
  source: string;
  durationMs: number;
  loop: boolean;
  thumbnailMs: number;
  transformable?: boolean;
}

export const ENEMY_IDENTITIES = ENEMY_KEYS;
export const WALL_TILE_IDS = [0, 1, 2, 5, 6, 7, 10, 14, 15, 23] as const;
const PLAYER_SOURCE = 'src/game/infrastructure/three/HologramPacket.ts';
const MAZE_SOURCE = 'src/game/infrastructure/three/MazeGeometry.ts';

const player = (state: string, name: string, durationMs = 6000, loop = true, thumbnailMs = 750): AssetPreviewEntry => ({
  id: `player-${state}`, category: 'Player', name: 'Packet', state: name,
  source: PLAYER_SOURCE, durationMs, loop, thumbnailMs,
});

const staticEntry = (id: string, category: AssetPreviewEntry['category'], name: string, source: string, transformable = false): AssetPreviewEntry => ({
  id, category, name, state: 'Static', source, durationMs: 0, loop: false, thumbnailMs: 0, transformable,
});

export const ASSET_CATALOG: readonly AssetPreviewEntry[] = [
  player('idle', 'Idle'),
  player('move-up', 'Moving up'),
  player('move-down', 'Moving down'),
  player('move-left', 'Moving left'),
  player('move-right', 'Moving right'),
  player('eating', 'Star absorption', EAT_EFFECT_DURATION_MS, false, 90),
  player('powered', 'Enemy hunter'),
  player('power-warning', 'Power ending', ENEMY_SCARED_WARNING_DURATION_MS),
  player('enemy-eating', 'Enemy absorption', ENEMY_EAT_DURATION_MS, false, 180),
  player('death', 'Death and recovery', PACKET_DEATH_ANIMATION.durationMs + PACKET_DEATH_RECOVERY.durationMs, false, 260),
  player('recovery', 'Recovery blinking', PACKET_DEATH_RECOVERY.durationMs, false, 180),
  player('portal', 'Portal blinking', PACKET_PORTAL_BLINK.durationMs, false, 240),
  ...ENEMY_IDENTITIES.flatMap((key): AssetPreviewEntry[] => (['normal', 'scared', 'warning', 'eaten', 'returning'] as const).map((state): AssetPreviewEntry => ({
    id: `enemy-${key}-${state}`, category: 'Enemies', name: key[0].toUpperCase() + key.slice(1),
    state: { normal: 'Normal', scared: 'Scared', warning: 'Scared warning', eaten: 'Eaten', returning: 'Return to jail' }[state],
    source: state === 'returning' ? 'src/game/infrastructure/three/ReturnEnemyPresentation.ts' : `public/assets/models/enemies/${key}.glb`,
    durationMs: state === 'warning' ? ENEMY_SCARED_WARNING_DURATION_MS
      : state === 'eaten' ? ENEMY_EAT_DURATION_MS : state === 'returning' ? 2000 : 6000,
    loop: state === 'normal' || state === 'scared',
    thumbnailMs: state === 'warning' ? 0 : state === 'eaten' ? 180 : 750,
  }))),
  ...([
    ['firewall', 'patrol', 'Fixed patrol', TILE_SIZE * 8 / (60 * ENEMY_CONFIG.firewall.speed) * 1000, true, 650],
    ['virus', 'chase', 'Shortest-path pursuit', 2000, false, 550],
    ['ping', 'ping', 'Detection and last-seen pursuit', ENEMY_CONFIG.ping.intervalMs, true, 300],
    ['spam', 'split', 'Splitting into three copies', ENEMY_CONFIG.spam.splitIntervalMs * (ENEMY_CONFIG.spam.maxCount - 1) + ENEMY_CONFIG.spam.splitEffectDurationMs, false,
      ENEMY_CONFIG.spam.splitIntervalMs * (ENEMY_CONFIG.spam.maxCount - 1) + ENEMY_CONFIG.spam.splitEffectDurationMs / 2],
    ['lag', 'lag', 'Lingering slow zones', 6000, true, 3500],
    ['quarantine', 'walls', 'Connected wall extensions', 8000, true, 1800],
    ['trojan', 'disguise', 'Data-bit disguise and reveal', 5000, true, 2200],
  ] as const).map(([key, state, name, durationMs, loop, thumbnailMs]): AssetPreviewEntry => ({
    id: `enemy-${key}-${state}`, category: 'Enemies', name: key[0].toUpperCase() + key.slice(1),
    state: name, source: `public/assets/models/enemies/${key}.glb`, durationMs, loop, thumbnailMs,
  })),
  staticEntry('point-base', 'Points', 'Regular silver star', 'src/game/infrastructure/three/point-star.json'),
  {
    id: 'point-power', category: 'Points', name: 'Power silver star', state: 'Rotate and hover',
    source: 'src/game/infrastructure/three/power-star.json', durationMs: 6000, loop: true, thumbnailMs: 750,
  },
  ...(['base', 'power'] as const).map((kind): AssetPreviewEntry => ({
    id: `effect-${kind}`, category: 'Points', name: kind === 'base' ? 'Regular star absorption' : 'Power star absorption',
    state: 'Absorption and rim pulse', source: 'src/game/infrastructure/three/PickupPresentation.ts',
    durationMs: EAT_EFFECT_DURATION_MS, loop: false, thumbnailMs: 90,
  })),
  ...WALL_TILE_IDS.map((id) => staticEntry(`wall-${id}`, 'Walls', `Wall tile ${id}`, MAZE_SOURCE, true)),
  staticEntry('wall-straight', 'Walls', 'Connected straight walls', MAZE_SOURCE),
  staticEntry('wall-corner', 'Walls', 'Connected corner walls', MAZE_SOURCE),
  staticEntry('other-prison', 'Other', 'Prison tile', MAZE_SOURCE, true),
  staticEntry('other-prison-run', 'Other', 'Connected prison bars', MAZE_SOURCE),
  staticEntry('other-prison-junction', 'Other', 'Prison and wall junction', MAZE_SOURCE),
  staticEntry('other-sign', 'Other', 'PACKETLOSS sign', 'src/game/infrastructure/three/PacketSignGeometry.ts'),
  staticEntry('other-floor', 'Other', 'Maze floor tile', 'src/game/infrastructure/three/MazeScene.ts'),
  staticEntry('other-shadow', 'Other', 'Contact shadow', 'src/game/infrastructure/three/ArcadeAssets.ts'),
];
