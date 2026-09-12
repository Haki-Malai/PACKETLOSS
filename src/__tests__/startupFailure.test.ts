import { afterEach, describe, expect, it, vi } from 'vitest';
import { FakeDocument } from './helpers/fakeDom';

const start = vi.hoisted(() => vi.fn());
vi.mock('../game/app/createPacmanGame', () => ({ createPacmanGame: () => ({ start }) }));

describe('game startup', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows a readable error when WebGL initialization fails', async () => {
    const document = new FakeDocument();
    const mount = document.createElement('main');
    Object.assign(mount, { id: 'game-root' });
    mount.appendChild(document.createElement('canvas'));
    document.body.appendChild(mount);
    vi.stubGlobal('document', document);
    start.mockRejectedValueOnce(new Error('The 3D game requires WebGL 2.'));

    await import('../main');

    const message = mount.querySelector('[role="alert"]');
    expect(message?.textContent).toBe('The 3D game requires WebGL 2.');
    expect(mount.querySelector('canvas')).toBeNull();
  });
});
