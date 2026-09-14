// @vitest-environment jsdom
import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AssetShowcase from '../dev/assets/AssetShowcase';
import { getGameState, resetGameState } from '../state/gameState';

const preview = vi.hoisted(() => ({
    start: vi.fn(),
    disposers: [] as ReturnType<typeof vi.fn>[],
    view: {
        select: vi.fn(),
        snapshot: vi.fn(),
        resize: vi.fn(),
        setCameraMode: vi.fn(),
        setTileGuide: vi.fn(),
        render: vi.fn(),
        fit: vi.fn(),
        actualSize: vi.fn(),
        zoomBy: vi.fn(),
        resetCamera: vi.fn(),
    },
}));
vi.mock('../dev/assets/assetCatalog', () => ({
    ASSET_CATALOG: [
        {
            id: 'player',
            category: 'Player',
            name: 'Packet',
            state: 'Idle',
            source: 'player.ts',
            durationMs: 6000,
            thumbnailMs: 750,
            loop: true,
        },
        {
            id: 'wall',
            category: 'Walls',
            name: 'Corner wall',
            state: 'Static',
            source: 'wall.ts',
            durationMs: 0,
            thumbnailMs: 0,
            loop: false,
            transformable: true,
        },
    ],
}));
vi.mock('../dev/assets/AssetPreviewSession', () => ({
    AssetPreviewSession: class {
        dispose = vi.fn();
        constructor() {
            preview.disposers.push(this.dispose);
        }
        start(): Promise<typeof preview.view | null> {
            return preview.start() as Promise<typeof preview.view | null>;
        }
    },
}));

let frames: Map<number, FrameRequestCallback>;
let disconnect: ReturnType<typeof vi.fn>;

async function frame(timestamp: number) {
    await act(async () => {
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((callback) => callback(timestamp));
        await Promise.resolve();
    });
}
async function loadGallery() {
    await act(async () => {
        await Promise.resolve();
    });
    await frame(0);
    await frame(16);
}

beforeEach(() => {
    vi.clearAllMocks();
    preview.disposers.length = 0;
    preview.start.mockResolvedValue(preview.view);
    frames = new Map();
    let id = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
        frames.set(++id, callback);
        return id;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((key) => {
        frames.delete(key);
    });
    disconnect = vi.fn();
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            disconnect = disconnect;
        }
    );
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() });
});
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('React asset gallery', () => {
    it('filters assets, preserves selection, and exposes preview controls without changing gameplay state', async () => {
        resetGameState(370, 2);
        const user = userEvent.setup();
        render(<AssetShowcase />);
        expect(
            screen.getByRole<HTMLButtonElement>('button', { name: 'Packet, Idle' }).disabled
        ).toBe(true);
        await loadGallery();
        expect(preview.view.snapshot).toHaveBeenCalledTimes(2);
        await user.type(screen.getByRole('searchbox'), 'corner');
        expect(screen.queryByRole('button', { name: 'Packet, Idle' })).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Corner wall, Static' }));
        const inspector = within(screen.getByRole('region', { name: 'Asset inspector' }));
        expect(inspector.getByRole('heading', { name: 'Corner wall' })).toBeDefined();
        expect(inspector.getByRole<HTMLButtonElement>('button', { name: 'Play' }).disabled).toBe(
            true
        );
        expect(document.querySelector('select')).toBeNull();
        await user.click(screen.getByRole('combobox', { name: 'Tile rotation' }));
        await user.click(screen.getByRole('option', { name: '90°' }));
        await user.click(screen.getByRole('checkbox', { name: 'Flip X' }));
        expect(preview.view.select).toHaveBeenLastCalledWith(
            expect.objectContaining({ id: 'wall' }),
            { rotation: 90, flipX: true, flipY: false }
        );
        await user.click(screen.getByRole('combobox', { name: 'Camera' }));
        await user.click(screen.getByRole('option', { name: 'Orbit' }));
        expect(preview.view.setCameraMode).toHaveBeenLastCalledWith('orbit');
        await user.click(screen.getByRole('checkbox', { name: 'Tile guide' }));
        await user.click(screen.getByRole('button', { name: 'Zoom in' }));
        expect(preview.view.setTileGuide).toHaveBeenLastCalledWith(true);
        expect(preview.view.zoomBy).toHaveBeenLastCalledWith(1.25);
        await user.click(screen.getByRole('combobox', { name: 'Category' }));
        await user.click(screen.getByRole('option', { name: 'Player' }));
        expect(screen.getByText('No assets match this search.')).toBeDefined();
        expect(inspector.getByRole('heading', { name: 'Corner wall' })).toBeDefined();
        expect(getGameState()).toEqual({ score: 370, lives: 2 });
    });

    it('drives playback and seeking, freezes hidden time, and releases frames and sessions under Strict Mode', async () => {
        const previousTitle = document.title;
        const page = render(
            <StrictMode>
                <AssetShowcase />
            </StrictMode>
        );
        await loadGallery();
        expect(document.title).toBe('Asset Lab · PACKETLOSS');
        await frame(100);
        await frame(200);
        expect(preview.view.render).toHaveBeenLastCalledWith(100);
        fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
        await frame(300);
        expect(preview.view.render).toHaveBeenLastCalledWith(100);
        fireEvent.change(screen.getByRole('slider', { name: 'Timeline' }), {
            target: { value: '900' },
        });
        await frame(400);
        expect(preview.view.render).toHaveBeenLastCalledWith(900);
        fireEvent.click(screen.getByRole('combobox', { name: 'Speed' }));
        fireEvent.click(screen.getByRole('option', { name: '2×' }));
        fireEvent.click(screen.getByRole('button', { name: 'Replay' }));
        await frame(500);
        await frame(550);
        expect(preview.view.render).toHaveBeenLastCalledWith(100);
        const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
        await frame(1550);
        hidden.mockReturnValue(false);
        await frame(2550);
        expect(preview.view.render).toHaveBeenLastCalledWith(100);
        fireEvent.click(screen.getByRole('button', { name: 'Packet, Idle' }));
        await frame(2600);
        expect(preview.view.render).toHaveBeenLastCalledWith(0);
        page.unmount();
        expect(frames.size).toBe(0);
        expect(disconnect).toHaveBeenCalledTimes(2);
        expect(preview.disposers).toHaveLength(2);
        preview.disposers.forEach((dispose) => expect(dispose).toHaveBeenCalledOnce());
        expect(document.title).toBe(previousTitle);
    });

    it('shows loading failures and retries using a fresh session', async () => {
        preview.start.mockRejectedValueOnce(new Error('Model unavailable'));
        render(<AssetShowcase />);
        await act(async () => {
            await Promise.resolve();
        });
        expect(screen.getByRole('alert').textContent).toBe('Model unavailable');
        fireEvent.click(screen.getByRole('button', { name: 'Retry loading' }));
        await loadGallery();
        expect(screen.queryByRole('alert')).toBeNull();
        expect(
            screen.getByRole<HTMLButtonElement>('button', { name: 'Packet, Idle' }).disabled
        ).toBe(false);
        expect(preview.start).toHaveBeenCalledTimes(2);
    });

    it('ignores a load that completes after leaving and cancels thumbnail preparation', async () => {
        let finish!: (_view: typeof preview.view) => void;
        preview.start.mockReturnValueOnce(
            new Promise<typeof preview.view>((resolve) => {
                finish = resolve;
            })
        );
        const pending = render(<AssetShowcase />);
        pending.unmount();
        await act(async () => {
            finish(preview.view);
            await Promise.resolve();
        });
        expect(preview.view.snapshot).not.toHaveBeenCalled();
        expect(frames.size).toBe(0);
        const preparing = render(<AssetShowcase />);
        await act(async () => {
            await Promise.resolve();
        });
        expect(preview.view.snapshot).toHaveBeenCalledOnce();
        preparing.unmount();
        await frame(16);
        expect(preview.view.snapshot).toHaveBeenCalledOnce();
        expect(frames.size).toBe(0);
        preview.disposers.forEach((dispose) => expect(dispose).toHaveBeenCalledOnce());
    });
});
