import './tailwind.css';
import './style.css';
import './game/ui/gameUi.css';
import { GameShell } from './game/ui/GameShell';
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
  message.className = 'packet-panel packet-copy';
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
  const root = document.getElementById('game-root');
  if (!root) throw new Error('Game mount element not found: #game-root');
  const shell = new GameShell(root, {
    mapVariant: resolveMapVariantFromEnv(import.meta.env.VITE_GAME_ENV),
  });
  disposeActive = () => shell.destroy();
  if (import.meta.env.DEV) {
    assetsLink = document.createElement('a');
    assetsLink.setAttribute('href', new URL('dev/assets', new URL(import.meta.env.BASE_URL, `${window.location.origin}/`)).pathname);
    assetsLink.className = 'packet-button packet-dev-link';
    assetsLink.textContent = 'Assets';
    document.body.appendChild(assetsLink);
  }
}
