import { RACE } from '../../simulation/types';
import type { PacketAppearance } from './HologramPacket';

/** Shared cosmetic definitions keep gallery previews identical to multiplayer characters. */
export const MULTIPLAYER_PACKET_APPEARANCES = [
  { name: 'Packet · Sky blue', color: RACE.colors[0], character: 'antenna' },
  { name: 'Packet · Rose', color: RACE.colors[1], character: 'goggles' },
  { name: 'Packet · Lime', color: RACE.colors[2], character: 'crest' },
  { name: 'Packet · Violet', color: RACE.colors[3], character: 'headphones' },
] as const satisfies readonly (PacketAppearance & { name: string })[];
