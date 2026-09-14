import { ENEMY_SCARED_DURATION_MS } from '../../config/constants';
import {
  clearAllEnemyScaredWindow,
  setActiveEnemiesScaredWindow,
} from '../domain/services/EnemyScaredStateService';
import type { WorldState } from '../domain/world/WorldState';

/**
 * Handles development shortcuts after normal input guards have accepted the event.
 *
 * @param world - Active game state to inspect or apply the power shortcut to.
 * @param event - Keyboard event from the gameplay surface.
 * @param allowPowerShortcut - Disables the power cheat during tutorial practice.
 */
export function handleDebugKeyDown(
  world: WorldState,
  event: KeyboardEvent,
  allowPowerShortcut: boolean
): void {
  if (event.code === 'KeyH' && allowPowerShortcut) {
    const shouldEnableScared = world.enemies.some((enemy) => enemy.active && !enemy.state.scared);
    if (shouldEnableScared) {
      setActiveEnemiesScaredWindow(world, ENEMY_SCARED_DURATION_MS);
      world.enemyEatChainCount = 0;
    } else {
      clearAllEnemyScaredWindow(world);
    }
    return;
  }

  if (event.code === 'KeyC') {
    if (event.altKey) {
      event.preventDefault();
      world.collisionDebugEnabled = !world.collisionDebugEnabled;
      if (!world.collisionDebugEnabled) {
        world.hoveredDebugTile = null;
        world.debugPanelText = '';
      }
      return;
    }

    if (event.shiftKey) {
      event.preventDefault();
      void copyDebugPanelText(world);
    }
  }
}

/** Copies current diagnostics and adds feedback to the panel if clipboard access fails. */
async function copyDebugPanelText(world: WorldState): Promise<void> {
  const text = world.debugPanelText;
  if (!text) return;
  const copied = await copyTextToClipboard(text);
  if (!copied) world.debugPanelText = `${text}\ncopy failed (browser blocked clipboard access)`;
}

/**
 * Tries the Clipboard API, then a temporary selected textarea for older browser support.
 *
 * @returns Whether either copy operation succeeded; clipboard errors are handled locally.
 */
async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Ignore clipboard API errors and try fallback copy method.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}
