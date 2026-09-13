import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HudOverlayAdapter } from '../game/infrastructure/adapters/HudOverlayAdapter';
import { addScore, resetGameState, setLives } from '../state/gameState';
import { FakeDocument } from './helpers/fakeDom';

describe('HudOverlayAdapter', () => {
  let fakeDocument: FakeDocument;

  beforeEach(() => {
    fakeDocument = new FakeDocument();
    vi.stubGlobal('document', fakeDocument as unknown as Document);
    resetGameState(0, 3);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders bottom status bar in mount and updates score/lives display from events', () => {
    const mount = fakeDocument.createElement('div');
    fakeDocument.body.appendChild(mount);

    const onPause = vi.fn();
    const hud = new HudOverlayAdapter(mount as unknown as HTMLElement, onPause);

    const container = mount.querySelector('[data-game-hud]');
    const scoreSection = mount.querySelector('[data-hud-score]');
    const livesSection = mount.querySelector('[data-hud-lives]');
    const scoreValue = mount.querySelector('[data-hud-score-value]');
    const livesValue = mount.querySelector('[data-hud-lives-value]');

    expect(container).not.toBeNull();
    expect(scoreSection).not.toBeNull();
    expect(livesSection).not.toBeNull();
    expect(scoreValue?.textContent).toBe('0');
    expect(livesValue?.textContent).toBe('3');
    mount.querySelector('[data-hud-pause]')?.click();
    expect(onPause).toHaveBeenCalledOnce();

    addScore(120);
    setLives(2);

    expect(scoreValue?.textContent).toBe('120');
    expect(livesValue?.textContent).toBe('2');

    hud.destroy();
    expect(mount.querySelector('[data-game-hud]')).toBeNull();
  });
});
