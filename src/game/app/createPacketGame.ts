import { GameCompositionOptions, GameCompositionRoot } from './GameCompositionRoot';
import { GameRuntime } from './GameRuntime';
import { PacketGame, RuntimeState } from './contracts';
import { GameStateStore } from '../../state/gameState';

let activeGame: PacketGame | null = null;

export type CreatePacketGameOptions = GameCompositionOptions & {
  onStateChange?: (_state: RuntimeState) => void;
};

export function createPacketGame(options: CreatePacketGameOptions = {}): PacketGame {
  activeGame?.destroy();

  const gameState = options.gameState ?? new GameStateStore();
  const runtime = new GameRuntime(
    new GameCompositionRoot({ ...options, gameState }),
    options.onStateChange,
  );

  const game: PacketGame = {
    start: () => runtime.start(),
    pause: () => runtime.pause(),
    resume: () => runtime.resume(),
    /** Continues the active run from its current maze-clear checkpoint. */
    continueLevel: () => runtime.continueLevel(),
    getGameStateStore: () => runtime.getGameStateStore(),
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
