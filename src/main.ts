import './tailwind.css';
import './style.css';
import { createPacketGame } from './game/app/createPacketGame';
import { resolveMapVariantFromEnv } from './game/app/mapRuntimeConfig';

let disposed = false;
let disposeActive: (() => void) | undefined;
let assetsLink: HTMLAnchorElement | undefined;

function dispose(): void {
  if (disposed) return;
  disposed = true;
  disposeActive?.();
  disposeActive = undefined;
  assetsLink?.remove();
  window.removeEventListener('pagehide', dispose);
}

function showStartupFailure(error: unknown): void {
  if (disposed) return;
  const message = document.createElement('p');
  message.className = 'm-auto max-w-lg p-8 text-center text-white';
  message.setAttribute('role', 'alert');
  message.textContent = error instanceof Error ? error.message : 'The game could not start. Please reload and try again.';
  document.getElementById('game-root')?.replaceChildren(message);
}

function reloadRestoredPage(event: PageTransitionEvent): void {
  if (event.persisted) window.location.reload();
}

window.addEventListener('pagehide', dispose);
window.addEventListener('pageshow', reloadRestoredPage);
import.meta.hot?.dispose(() => {
  dispose();
  window.removeEventListener('pageshow', reloadRestoredPage);
});

if (import.meta.env.DEV && (window.location.pathname === '/dev/assets' || window.location.pathname === '/dev/assets/')) {
  void import('./dev/assets/AssetShowcase').then(async ({ mountAssetShowcase }) => {
    if (disposed) return;
    const root = document.getElementById('game-root');
    if (!root) throw new Error('Game mount element not found: #game-root');
    const cleanup = await Promise.resolve(mountAssetShowcase(root));
    if (disposed) cleanup();
    else disposeActive = cleanup;
  }).catch(showStartupFailure);
} else {
  const game = createPacketGame({
    mountId: 'game-root',
    mapVariant: resolveMapVariantFromEnv(import.meta.env.VITE_GAME_ENV),
  });
  disposeActive = () => game.destroy();
  if (import.meta.env.DEV) {
    assetsLink = document.createElement('a');
    assetsLink.setAttribute('href', new URL('dev/assets', new URL(import.meta.env.BASE_URL, `${window.location.origin}/`)).pathname);
    assetsLink.className = 'fixed bottom-4 right-4 z-50 rounded border border-cyan-400/50 bg-black/80 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-950';
    assetsLink.textContent = 'Assets';
    document.body.appendChild(assetsLink);
  }
  void game.start().catch(showStartupFailure);
}
