import { GameCompositionOptions, GameCompositionRoot } from './GameCompositionRoot';
import { GameRuntime } from './GameRuntime';
import { PacketGame } from './contracts';

let activeGame: PacketGame | null = null;

export type CreatePacketGameOptions = GameCompositionOptions;

export function createPacketGame(options: CreatePacketGameOptions = {}): PacketGame {
  activeGame?.destroy();

  const runtime = new GameRuntime(new GameCompositionRoot(options));

  const game: PacketGame = {
    start: () => runtime.start(),
    pause: () => runtime.pause(),
    resume: () => runtime.resume(),
    destroy: () => {
      runtime.destroy();
      if (activeGame === game) {
        activeGame = null;
      }
    },
  };

  activeGame = game;
  return game;
}
