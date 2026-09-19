import { readFile } from 'node:fs/promises';
import { Box3, Group, OrthographicCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArcadeAssets, type CharacterModels } from '../game/infrastructure/three/ArcadeAssets';
import { mountEnemyPortraits } from '../game/ui/EnemyPortraits';
import { createCharacterAssets } from './fixtures/characterFixtures';
import { FakeDocument, FakeElement } from './helpers/fakeDom';

const ENEMIES = ['firewall', 'virus', 'ping', 'spam', 'lag', 'quarantine', 'trojan'] as const;
const boundary = vi.hoisted(() => ({
    renderer: {
        outputColorSpace: '',
        toneMapping: 0,
        setClearColor: vi.fn(),
        setDrawingBufferSize: vi.fn(),
        render: vi.fn<(_scene: Scene, _camera: OrthographicCamera) => void>(),
        dispose: vi.fn(),
        forceContextLoss: vi.fn(),
    },
}));

vi.mock('three', async (importOriginal) => ({
    ...(await importOriginal<typeof import('three')>()),
    WebGLRenderer: vi.fn(function () {
        return boundary.renderer;
    }),
}));

async function flushLoading(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
}

async function loadAuthoredAssets(): Promise<ArcadeAssets> {
    const models = {} as CharacterModels;
    const loader = new GLTFLoader();
    for (const key of ENEMIES) {
        const bytes = await readFile(
            new URL(`../../public/assets/models/enemies/${key}.glb`, import.meta.url)
        );
        models[key] = await loader.parseAsync(Uint8Array.from(bytes).buffer, '');
    }
    return new ArcadeAssets(models);
}

describe('enemy help portraits', () => {
    let document: FakeDocument & { hidden: boolean };
    let browser: EventTarget & {
        devicePixelRatio: number;
        requestAnimationFrame: ReturnType<
            typeof vi.fn<(_callback: FrameRequestCallback) => number>
        >;
        cancelAnimationFrame: ReturnType<typeof vi.fn<(_id: number) => void>>;
    };
    let preference: EventTarget & { matches: boolean };
    let frames: Map<number, FrameRequestCallback>;
    let contexts: Map<
        FakeElement,
        { clearRect: ReturnType<typeof vi.fn>; drawImage: ReturnType<typeof vi.fn> }
    >;
    let operations: string[];

    beforeEach(() => {
        vi.clearAllMocks();
        document = Object.assign(new FakeDocument(), { hidden: false });
        contexts = new Map();
        operations = [];
        const createElement = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const element = createElement(tag);
            if (tag === 'canvas') {
                const context = {
                    clearRect: vi.fn(),
                    drawImage: vi.fn(() => operations.push('copy')),
                };
                contexts.set(element, context);
                Object.assign(element, { width: 0, height: 0, getContext: () => context });
            }
            return element;
        });
        frames = new Map();
        let nextFrame = 0;
        preference = Object.assign(new EventTarget(), { matches: false });
        browser = Object.assign(new EventTarget(), {
            devicePixelRatio: 3,
            matchMedia: () => preference,
            requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
                frames.set(++nextFrame, callback);
                return nextFrame;
            }),
            cancelAnimationFrame: vi.fn((id: number) => {
                frames.delete(id);
            }),
        });
        vi.stubGlobal('document', document);
        vi.stubGlobal('window', browser);
        boundary.renderer.render.mockImplementation((scene) => {
            const visible = scene.children.filter(
                (child) => child instanceof Group && child.visible
            );
            operations.push(`render:${visible.map((model) => model.name).join(',')}`);
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    function createHost() {
        const host = document.createElement('section');
        const slots = ENEMIES.map((key) => {
            const slot = document.createElement('span');
            slot.setAttribute('data-enemy', key);
            slot.appendChild(document.createElement('img'));
            host.appendChild(slot);
            return slot;
        });
        document.body.appendChild(host);
        return { host, slots };
    }

    function advanceFrame(timestamp: number): void {
        const scheduled = [...frames.values()];
        frames.clear();
        scheduled.forEach((callback) => callback(timestamp));
    }

    it('samples the actual GLB idle clips with stable roots and roomy framing through a single shared renderer', async () => {
        const assets = await loadAuthoredAssets();
        const sample = vi.spyOn(assets, 'sampleAnimation');
        const disposeAssets = vi.spyOn(assets, 'dispose');
        vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
        const { host, slots } = createHost();
        preference.matches = true;
        const views: Array<{ key: string; root: Vector3; center: Vector3; extent: number }> = [];
        boundary.renderer.render.mockImplementation((scene, camera) => {
            scene.updateMatrixWorld(true);
            for (const model of scene.children.filter(
                (child) => child instanceof Group && child.visible
            )) {
                operations.push(`render:${model.name}`);
                const bounds = new Box3().setFromObject(model.getObjectByName('enemy-collapse')!);
                let extent = 0;
                for (const x of [bounds.min.x, bounds.max.x]) {
                    for (const y of [bounds.min.y, bounds.max.y]) {
                        for (const z of [bounds.min.z, bounds.max.z]) {
                            const point = new Vector3(x, y, z).project(camera);
                            extent = Math.max(extent, Math.abs(point.x), Math.abs(point.y));
                        }
                    }
                }
                views.push({
                    key: model.name,
                    root: model.position.clone(),
                    center: bounds.getCenter(new Vector3()),
                    extent,
                });
            }
        });
        const dispose = mountEnemyPortraits(host as unknown as HTMLElement, 'full');
        await flushLoading();
        expect(WebGLRenderer).toHaveBeenCalledOnce();
        expect(boundary.renderer.setDrawingBufferSize).toHaveBeenCalledExactlyOnceWith(80, 80, 2);
        expect(operations).toEqual(ENEMIES.flatMap((key) => [`render:${key}`, 'copy']));
        expect(slots.every((slot) => slot.getAttribute('data-ready') === 'true')).toBe(true);
        expect(slots.every((slot) => slot.querySelector('img') !== null)).toBe(true);
        expect(frames.size).toBe(1);
        advanceFrame(0);
        for (const time of [500, 1500, 3000, 4500, 5999]) advanceFrame(time);
        expect(sample).toHaveBeenLastCalledWith(5.999);
        expect(views.every((view) => view.extent < 1)).toBe(true);
        for (const key of ENEMIES) {
            const samples = views.filter((view) => view.key === key);
            expect(samples.every((view) => view.root.equals(samples[0].root))).toBe(true);
        }
        const firewall = views.filter((view) => view.key === 'firewall');
        expect(firewall.some((view) => view.center.distanceTo(firewall[0].center) > 0.001)).toBe(
            true
        );
        dispose();
        dispose();
        expect(disposeAssets).toHaveBeenCalledOnce();
        expect(boundary.renderer.dispose).toHaveBeenCalledOnce();
        expect(boundary.renderer.forceContextLoss).toHaveBeenCalledOnce();
        expect(frames.size).toBe(0);
        expect(
            slots.every((slot) => slot.children.length === 1 && !slot.hasAttribute('data-ready'))
        ).toBe(true);
    });

    it('renders reduced motion as a static portrait and refreshes only the pixel density on resize', async () => {
        const assets = createCharacterAssets();
        const sample = vi.spyOn(assets, 'sampleAnimation');
        vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
        const { host, slots } = createHost();
        const dispose = mountEnemyPortraits(host as unknown as HTMLElement, 'reduced');
        await flushLoading();
        expect(sample).toHaveBeenCalledExactlyOnceWith(0);
        expect(browser.requestAnimationFrame).not.toHaveBeenCalled();
        browser.devicePixelRatio = 1;
        browser.dispatchEvent(new Event('resize'));
        expect(boundary.renderer.setDrawingBufferSize).toHaveBeenLastCalledWith(80, 80, 1);
        expect(sample).toHaveBeenLastCalledWith(0);
        for (const slot of slots) {
            const canvas = slot.querySelector('canvas')!;
            expect(canvas.getAttribute('aria-hidden')).toBe('true');
            expect(contexts.get(canvas)?.clearRect).toHaveBeenCalledTimes(2);
        }
        dispose();
    });

    it('throttles to 30 fps and excludes reduced-motion and hidden-tab time from the authored timeline', async () => {
        const assets = createCharacterAssets();
        const sample = vi.spyOn(assets, 'sampleAnimation');
        vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
        const { host } = createHost();
        const dispose = mountEnemyPortraits(host as unknown as HTMLElement, 'system');
        await flushLoading();
        advanceFrame(0);
        advanceFrame(16);
        expect(sample).toHaveBeenCalledOnce();
        advanceFrame(34);
        expect(sample).toHaveBeenLastCalledWith(0.034);
        preference.matches = true;
        preference.dispatchEvent(new Event('change'));
        expect(frames.size).toBe(0);
        preference.matches = false;
        preference.dispatchEvent(new Event('change'));
        advanceFrame(5000);
        advanceFrame(5034);
        expect(sample).toHaveBeenLastCalledWith(0.068);
        document.hidden = true;
        document.dispatchEvent(new Event('visibilitychange'));
        expect(frames.size).toBe(0);
        document.hidden = false;
        document.dispatchEvent(new Event('visibilitychange'));
        advanceFrame(10000);
        advanceFrame(10034);
        expect(sample).toHaveBeenLastCalledWith(0.102);
        dispose();
        sample.mockClear();
        preference.dispatchEvent(new Event('change'));
        document.dispatchEvent(new Event('visibilitychange'));
        browser.dispatchEvent(new Event('resize'));
        expect(sample).not.toHaveBeenCalled();
        expect(frames.size).toBe(0);
    });

    it('aborts pending loading and disposes a late success without mounting any canvases', async () => {
        const assets = createCharacterAssets();
        const disposeAssets = vi.spyOn(assets, 'dispose');
        let resolve!: (_assets: ArcadeAssets) => void;
        const loading = new Promise<ArcadeAssets>((done) => {
            resolve = done;
        });
        const load = vi.spyOn(ArcadeAssets, 'load').mockReturnValue(loading);
        const { host, slots } = createHost();
        const dispose = mountEnemyPortraits(host as unknown as HTMLElement, 'full');
        dispose();
        expect(load.mock.calls[0][0]?.aborted).toBe(true);
        resolve(assets);
        await flushLoading();
        expect(disposeAssets).toHaveBeenCalledOnce();
        expect(WebGLRenderer).not.toHaveBeenCalled();
        expect(
            slots.every((slot) => slot.children.length === 1 && !slot.hasAttribute('data-ready'))
        ).toBe(true);
    });

    it('keeps the PNG fallback usable when model loading fails', async () => {
        vi.spyOn(ArcadeAssets, 'load').mockRejectedValue(new Error('Offline'));
        const { host, slots } = createHost();
        const dispose = mountEnemyPortraits(host as unknown as HTMLElement, 'full');
        await flushLoading();
        expect(WebGLRenderer).not.toHaveBeenCalled();
        expect(frames.size).toBe(0);
        expect(
            slots.every((slot) => slot.children.length === 1 && !slot.hasAttribute('data-ready'))
        ).toBe(true);
        dispose();
    });

    it.each(['render failure', 'context loss'])(
        'restores all fallbacks and releases loaded resources after %s',
        async (failure) => {
            const assets = createCharacterAssets();
            const disposeAssets = vi.spyOn(assets, 'dispose');
            vi.spyOn(ArcadeAssets, 'load').mockResolvedValue(assets);
            const { host, slots } = createHost();
            const dispose = mountEnemyPortraits(host as unknown as HTMLElement, 'full');
            await flushLoading();
            if (failure === 'render failure') {
                boundary.renderer.render.mockImplementationOnce(() => {
                    throw new Error('GPU failure');
                });
                advanceFrame(0);
                advanceFrame(34);
            } else {
                const canvas = vi.mocked(WebGLRenderer).mock.calls[0][0]
                    ?.canvas as HTMLCanvasElement;
                canvas.dispatchEvent(new Event('webglcontextlost'));
            }
            dispose();
            expect(disposeAssets).toHaveBeenCalledOnce();
            expect(boundary.renderer.dispose).toHaveBeenCalledOnce();
            expect(frames.size).toBe(0);
            expect(
                slots.every(
                    (slot) => slot.children.length === 1 && !slot.hasAttribute('data-ready')
                )
            ).toBe(true);
        }
    );
});
