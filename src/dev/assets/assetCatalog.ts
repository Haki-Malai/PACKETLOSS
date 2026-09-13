import {
  GHOST_SCARED_WARNING_DURATION_MS, PACKET_DEATH_ANIMATION, PACKET_DEATH_RECOVERY, PACKET_PORTAL_BLINK,
} from '../../config/constants';
import { EAT_EFFECT_DURATION_MS } from '../../game/shared/pickupEffects';
import { PACKET_CHOMP_FRAME_RATE, PACKET_CHOMP_SEQUENCE } from '../../game/systems/AnimationSystem';

export interface AssetPreviewEntry {
  id: string;
  category: 'Player' | 'Ghosts' | 'Points' | 'Walls' | 'Other';
  name: string;
  state: string;
  source: string;
  durationMs: number;
  loop: boolean;
  thumbnailMs: number;
  transformable?: boolean;
}

export const GHOST_IDENTITIES = ['blinky', 'clyde', 'inky', 'pinky'] as const;
export const WALL_TILE_IDS = [0, 1, 2, 5, 6, 7, 10, 14, 15, 23] as const;
const PLAYER_SOURCE = 'src/game/infrastructure/three/HologramPacket.ts';
const MAZE_SOURCE = 'src/game/infrastructure/three/MazeGeometry.ts';
const EATING_DURATION_MS = PACKET_CHOMP_SEQUENCE.length * 1000 / PACKET_CHOMP_FRAME_RATE;

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
  player('eating', 'Eating', EATING_DURATION_MS, false, 150),
  player('death', 'Death and recovery', PACKET_DEATH_ANIMATION.durationMs + PACKET_DEATH_RECOVERY.durationMs, false, 260),
  player('recovery', 'Recovery blinking', PACKET_DEATH_RECOVERY.durationMs, false, 180),
  player('portal', 'Portal blinking', PACKET_PORTAL_BLINK.durationMs, false, 240),
  ...GHOST_IDENTITIES.flatMap((key): AssetPreviewEntry[] => (['normal', 'scared', 'warning'] as const).map((state): AssetPreviewEntry => ({
    id: `ghost-${key}-${state}`, category: 'Ghosts', name: key[0].toUpperCase() + key.slice(1),
    state: state === 'normal' ? 'Normal' : state === 'scared' ? 'Scared' : 'Scared warning',
    source: `public/assets/models/${key === 'blinky' || key === 'clyde' ? 'block' : 'virus'}.glb`,
    durationMs: state === 'warning' ? GHOST_SCARED_WARNING_DURATION_MS : 6000,
    loop: state !== 'warning', thumbnailMs: state === 'warning' ? 0 : 750,
  }))),
  staticEntry('point-base', 'Points', 'Regular silver star', 'src/game/infrastructure/three/point-star.json'),
  staticEntry('point-power', 'Points', 'Power silver star', 'src/game/infrastructure/three/point-star.json'),
  ...(['base', 'power'] as const).map((kind): AssetPreviewEntry => ({
    id: `effect-${kind}`, category: 'Points', name: kind === 'base' ? 'Regular pickup ring' : 'Power pickup ring',
    state: 'Consumption effect', source: 'src/game/infrastructure/three/PickupPresentation.ts',
    durationMs: EAT_EFFECT_DURATION_MS, loop: false, thumbnailMs: 24,
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
