// @vitest-environment jsdom
import { useEffect } from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    destroy: vi.fn(),
    createPacketGame: vi.fn(),
    importShowcase: vi.fn(),
    setupShowcase: vi.fn(),
    disposeShowcase: vi.fn(),
}));
vi.mock('../game/app/createPacketGame', () => ({ createPacketGame: mocks.createPacketGame }));
vi.mock('../game/ui/TitleWordmark', () => ({ mountTitleWordmark: () => () => {} }));

function ShowcaseStub() {
    useEffect(() => {
        mocks.setupShowcase();
        return mocks.disposeShowcase;
    }, []);
    return <h1>Asset Lab</h1>;
}

async function boot(pathname = '/') {
    window.history.replaceState(null, '', pathname);
    const mount = document.createElement('main');
    mount.id = 'game-root';
    document.body.append(mount);
    await act(async () => {
        await import('../main');
    });
    return mount;
}

async function settle() {
    await act(async () => {
        await vi.dynamicImportSettled();
    });
}
function pagehide() {
    act(() => {
        window.dispatchEvent(new PageTransitionEvent('pagehide'));
    });
}

describe('game startup and development asset route', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        vi.stubEnv('DEV', true);
        vi.stubEnv('BASE_URL', './');
        vi.stubEnv('VITE_GAME_ENV', 'DEMO');
        mocks.start.mockResolvedValue(undefined);
        mocks.createPacketGame.mockReturnValue({
            start: mocks.start,
            pause: mocks.pause,
            resume: mocks.resume,
            continueLevel: vi.fn(),
            destroy: mocks.destroy,
        });
        vi.doMock('../dev/assets/AssetShowcase', () => {
            mocks.importShowcase();
            return { default: ShowcaseStub };
        });
        vi.spyOn(window, 'addEventListener');
    });
    afterEach(async () => {
        pagehide();
        await settle();
        for (const [type, listener] of vi.mocked(window.addEventListener).mock.calls) {
            if (type === 'pageshow') window.removeEventListener(type, listener);
        }
        document.body.replaceChildren();
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it('shows a readable error when WebGL initialization fails', async () => {
        mocks.start.mockRejectedValueOnce(new Error('The 3D game requires WebGL 2.'));
        await boot();
        fireEvent.click(screen.getByRole('button', { name: 'Start game' }));
        await settle();
        expect(screen.getByRole('alert').textContent).toBe('The 3D game requires WebGL 2.');
        expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined();
        expect(screen.getByRole('button', { name: 'Main menu' })).toBeDefined();
    });

    it.each(['/dev/assets', '/dev/assets/'])(
        'mounts only the gallery at %s and cleans up Strict Mode effects',
        async (pathname) => {
            await boot(pathname);
            await settle();
            expect(screen.getByRole('heading', { name: 'Asset Lab' })).toBeDefined();
            expect(mocks.createPacketGame).not.toHaveBeenCalled();
            expect(mocks.start).not.toHaveBeenCalled();
            pagehide();
            pagehide();
            expect(mocks.disposeShowcase.mock.calls.length).toBe(
                mocks.setupShowcase.mock.calls.length
            );
        }
    );

    it('uses the game route in production without importing the gallery or adding its link', async () => {
        vi.stubEnv('DEV', false);
        await boot('/dev/assets');
        await settle();
        expect(screen.getByRole('heading', { name: 'PACKETLOSS' })).toBeDefined();
        expect(mocks.importShowcase).not.toHaveBeenCalled();
        expect(screen.queryByRole('link')).toBeNull();
        expect(mocks.createPacketGame).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Start game' }));
        await settle();
        expect(mocks.start).toHaveBeenCalledOnce();
        expect(mocks.createPacketGame.mock.calls[0]?.[0]).not.toHaveProperty('onDebugChange');
        expect(document.getElementById('collision-debug-panel')).toBeNull();
        expect(document.getElementById('runtime-debug-panel')).toBeNull();
    });

    it('enables the gallery in an explicit development build under the deployment base path', async () => {
        vi.stubEnv('DEV', false);
        vi.stubEnv('MODE', 'development');
        vi.stubEnv('BASE_URL', '/dev/');
        await boot('/dev/dev/assets/');
        await settle();
        expect(screen.getByRole('heading', { name: 'Asset Lab' })).toBeDefined();
        expect(mocks.importShowcase).toHaveBeenCalledOnce();
        expect(mocks.createPacketGame).not.toHaveBeenCalled();
    });

    it('starts once from the title and keeps the development link outside the game mount', async () => {
        const mount = await boot();
        const link = screen.getByRole('link', { name: 'Assets' });
        expect(link.getAttribute('href')).toBe('/dev/assets');
        expect(mount.contains(link)).toBe(false);
        expect(mocks.importShowcase).not.toHaveBeenCalled();
        expect(mocks.createPacketGame).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Start game' }));
        await settle();
        expect(mocks.createPacketGame).toHaveBeenCalledWith(
            expect.objectContaining({
                mountId: 'packet-scene',
                mapVariant: 'demo',
            })
        );
        expect(mocks.createPacketGame.mock.calls[0]?.[0]).toHaveProperty(
            'onDebugChange',
            expect.any(Function)
        );
        expect(mocks.start).toHaveBeenCalledOnce();
        pagehide();
        pagehide();
        expect(mocks.destroy).toHaveBeenCalledOnce();
        expect(document.body.contains(link)).toBe(false);
    });

    it('does not mount a gallery import that completes after page disposal', async () => {
        let finish!: (_module: { default: typeof ShowcaseStub }) => void;
        const pending = new Promise<{ default: typeof ShowcaseStub }>((resolve) => {
            finish = resolve;
        });
        vi.doMock('../dev/assets/AssetShowcase', () => {
            mocks.importShowcase();
            return pending;
        });
        await boot('/dev/assets');
        expect(mocks.importShowcase).toHaveBeenCalledOnce();
        pagehide();
        finish({ default: ShowcaseStub });
        await settle();
        expect(mocks.setupShowcase).not.toHaveBeenCalled();
        expect(mocks.createPacketGame).not.toHaveBeenCalled();
    });

    it('reloads only a page restored from browser history after disposal', async () => {
        await boot();
        const listener = vi
            .mocked(window.addEventListener)
            .mock.calls.find(([type]) => type === 'pageshow')?.[1];
        expect(typeof listener).toBe('function');
        pagehide();
        const reload = vi.fn();
        const browser = window;
        vi.stubGlobal('window', { location: { reload } });
        try {
            (listener as EventListener)(new PageTransitionEvent('pageshow', { persisted: false }));
            expect(reload).not.toHaveBeenCalled();
            (listener as EventListener)(new PageTransitionEvent('pageshow', { persisted: true }));
            expect(reload).toHaveBeenCalledOnce();
        } finally {
            vi.stubGlobal('window', browser);
        }
    });

    it('ignores a late startup failure instead of replacing a subsequent page', async () => {
        let fail!: (_error: Error) => void;
        mocks.start.mockReturnValueOnce(
            new Promise<void>((_resolve, reject) => {
                fail = reject;
            })
        );
        const mount = await boot();
        fireEvent.click(screen.getByRole('button', { name: 'Start game' }));
        await settle();
        pagehide();
        const replacement = document.createElement('section');
        mount.replaceChildren(replacement);
        fail(new Error('Late failure'));
        await settle();
        expect(mount.firstChild).toBe(replacement);
        expect(mocks.destroy).toHaveBeenCalledOnce();
    });
});
