import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeDocument } from './helpers/fakeDom';

const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  destroy: vi.fn(),
  createPacketGame: vi.fn(),
  importShowcase: vi.fn(),
  mountAssetShowcase: vi.fn(),
  disposeShowcase: vi.fn(),
}));
vi.mock('../game/app/createPacketGame', () => ({ createPacketGame: mocks.createPacketGame }));

function installPage(pathname = '/') {
  const document = new FakeDocument();
  const mount = document.createElement('main');
  Object.assign(mount, { id: 'game-root' });
  mount.appendChild(document.createElement('canvas'));
  document.body.appendChild(mount);
  const pagehideListeners = new Set<() => void>();
  const pageshowListeners = new Set<(_event: { persisted: boolean }) => void>();
  const reload = vi.fn();
  vi.stubGlobal('document', document);
  vi.stubGlobal('window', {
    location: { pathname, origin: 'https://packet.test', reload },
    addEventListener: (type: string, listener: () => void) => {
      if (type === 'pagehide') pagehideListeners.add(listener);
      if (type === 'pageshow') pageshowListeners.add(listener);
    },
    removeEventListener: (type: string, listener: () => void) => {
      if (type === 'pagehide') pagehideListeners.delete(listener);
      if (type === 'pageshow') pageshowListeners.delete(listener);
    },
  });
  return {
    document, mount, reload,
    pagehide: () => [...pagehideListeners].forEach((listener) => listener()),
    pageshow: (persisted: boolean) => [...pageshowListeners].forEach((listener) => listener({ persisted })),
  };
}

describe('game startup and development asset route', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('DEV', true);
    vi.stubEnv('BASE_URL', './');
    vi.stubEnv('VITE_GAME_ENV', 'DEMO');
    mocks.start.mockResolvedValue(undefined);
    mocks.createPacketGame.mockReturnValue({ start: mocks.start, destroy: mocks.destroy });
    mocks.mountAssetShowcase.mockResolvedValue(mocks.disposeShowcase);
    vi.doMock('../dev/assets/AssetShowcase', () => {
      mocks.importShowcase();
      return { mountAssetShowcase: mocks.mountAssetShowcase };
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('shows a readable error when WebGL initialization fails', async () => {
    const { mount } = installPage();
    mocks.start.mockRejectedValueOnce(new Error('The 3D game requires WebGL 2.'));
    await import('../main');
    expect(mount.querySelector('[role="alert"]')?.textContent).toBe('The 3D game requires WebGL 2.');
    expect(mount.querySelector('canvas')).toBeNull();
  });

  it.each(['/dev/assets', '/dev/assets/'])('mounts only the showcase at %s in development and disposes it once', async (pathname) => {
    const { mount, pagehide } = installPage(pathname);
    await import('../main');
    await vi.dynamicImportSettled();
    expect(mocks.createPacketGame).not.toHaveBeenCalled();
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.mountAssetShowcase).toHaveBeenCalledWith(mount);
    pagehide();
    pagehide();
    expect(mocks.disposeShowcase).toHaveBeenCalledOnce();
  });

  it('keeps the game route in production without importing the showcase or adding its link', async () => {
    const { document } = installPage('/dev/assets');
    vi.stubEnv('DEV', false);
    await import('../main');
    await vi.dynamicImportSettled();
    expect(mocks.createPacketGame).toHaveBeenCalledOnce();
    expect(mocks.start).toHaveBeenCalledOnce();
    expect(mocks.importShowcase).not.toHaveBeenCalled();
    expect(document.body.querySelector('a')).toBeNull();
  });

  it('starts the normal game and keeps the development Assets link outside its mount', async () => {
    const { document, mount, pagehide } = installPage();
    await import('../main');
    expect(mocks.createPacketGame).toHaveBeenCalledWith({ mountId: 'game-root', mapVariant: 'demo' });
    expect(mocks.importShowcase).not.toHaveBeenCalled();
    const link = document.body.querySelector('a');
    expect(link?.textContent).toBe('Assets');
    expect(link?.getAttribute('href')).toBe('/dev/assets');
    expect(mount.querySelector('a')).toBeNull();
    pagehide();
    pagehide();
    expect(mocks.destroy).toHaveBeenCalledOnce();
    expect(document.body.querySelector('a')).toBeNull();
  });

  it('does not mount a showcase import that completes after the page is disposed', async () => {
    const { pagehide } = installPage('/dev/assets');
    let finishImport!: (_module: { mountAssetShowcase: typeof mocks.mountAssetShowcase }) => void;
    const pendingImport = new Promise<{ mountAssetShowcase: typeof mocks.mountAssetShowcase }>((resolve) => { finishImport = resolve; });
    vi.doMock('../dev/assets/AssetShowcase', () => {
      mocks.importShowcase();
      return pendingImport;
    });
    await import('../main');
    await vi.waitFor(() => expect(mocks.importShowcase).toHaveBeenCalledOnce());
    pagehide();
    finishImport({ mountAssetShowcase: mocks.mountAssetShowcase });
    await vi.dynamicImportSettled();
    expect(mocks.mountAssetShowcase).not.toHaveBeenCalled();
    expect(mocks.createPacketGame).not.toHaveBeenCalled();
  });

  it('reloads a disposed page restored from browser history while ignoring an ordinary pageshow', async () => {
    const { pagehide, pageshow, reload } = installPage();
    await import('../main');
    pageshow(false);
    expect(reload).not.toHaveBeenCalled();
    pagehide();
    expect(mocks.destroy).toHaveBeenCalledOnce();
    pageshow(true);
    expect(reload).toHaveBeenCalledOnce();
  });

  it('disposes a showcase whose setup resolves after pagehide', async () => {
    const { pagehide } = installPage('/dev/assets');
    let finishSetup!: (_dispose: () => void) => void;
    mocks.mountAssetShowcase.mockReturnValueOnce(new Promise<() => void>((resolve) => { finishSetup = resolve; }));
    await import('../main');
    await vi.waitFor(() => expect(mocks.mountAssetShowcase).toHaveBeenCalledOnce());
    pagehide();
    finishSetup(mocks.disposeShowcase);
    await vi.waitFor(() => expect(mocks.disposeShowcase).toHaveBeenCalledOnce());
  });

  it('ignores a startup failure that arrives after disposal instead of replacing another page', async () => {
    const { document, mount, pagehide } = installPage();
    let failStartup!: (_error: Error) => void;
    mocks.start.mockReturnValueOnce(new Promise<void>((_resolve, reject) => { failStartup = reject; }));
    await import('../main');
    pagehide();
    const replacement = document.createElement('section');
    mount.replaceChildren(replacement);
    failStartup(new Error('Late failure'));
    await Promise.resolve();
    expect(mount.children).toEqual([replacement]);
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });
});
