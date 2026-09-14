import './tailwind.css';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { EnvironmentProvider } from './config/EnvironmentContext';

const mount = document.getElementById('game-root');
if (!mount) throw new Error('Game mount element not found: #game-root');
const root = createRoot(mount);
let disposed = false;

/** Unmounts the React tree once, releasing resources on page exit or hot replacement. */
function dispose(): void {
    if (disposed) return;
    disposed = true;
    root.unmount();
    window.removeEventListener('pagehide', dispose);
}

/** Reloads a back/forward cache restoration because page exit disposed the React root. */
function reloadRestoredPage(event: PageTransitionEvent): void {
    if (event.persisted) window.location.reload();
}

window.addEventListener('pagehide', dispose);
window.addEventListener('pageshow', reloadRestoredPage);
import.meta.hot?.dispose(() => {
    dispose();
    window.removeEventListener('pageshow', reloadRestoredPage);
});
root.render(
    <EnvironmentProvider>
        <App />
    </EnvironmentProvider>
);
