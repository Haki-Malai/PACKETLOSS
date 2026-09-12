import './tailwind.css';
import './style.css';
import { createPacmanGame } from './game/app/createPacmanGame';
import { resolveMapVariantFromEnv } from './game/app/mapRuntimeConfig';

const game = createPacmanGame({
  mountId: 'game-root',
  mapVariant: resolveMapVariantFromEnv(import.meta.env.VITE_GAME_ENV),
});

void game.start().catch((error: unknown) => {
  const message = document.createElement('p');
  message.className = 'm-auto max-w-lg p-8 text-center text-white';
  message.setAttribute('role', 'alert');
  message.textContent = error instanceof Error ? error.message : 'The game could not start. Please reload and try again.';
  document.getElementById('game-root')?.replaceChildren(message);
});
