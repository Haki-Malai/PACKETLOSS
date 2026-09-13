import {
    Box3,
    BufferGeometry,
    Color,
    ExtrudeGeometry,
    InstancedMesh,
    Material,
    Matrix4,
    Mesh,
    OrthographicCamera,
    Scene,
    type Shape,
    Vector3,
    WebGLRenderer,
} from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Camera3D } from '../engine/camera3d';
import { MazeScene } from '../game/infrastructure/three/MazeScene';
import { mountTitleWordmark } from '../game/ui/TitleWordmark';
import { FakeDocument } from './helpers/fakeDom';

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
    observe: vi.fn(),
    disconnect: vi.fn(),
}));

vi.mock('three', async (importOriginal) => ({
    ...(await importOriginal<typeof import('three')>()),
    WebGLRenderer: vi.fn(function () {
        return boundary.renderer;
    }),
}));

function assertArtworkFits(): void {
    const [scene, camera] = boundary.renderer.render.mock.lastCall!;
    const bounds = new Box3().setFromObject(scene.getObjectByName('sign-artwork')!);
    for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
            for (const z of [bounds.min.z, bounds.max.z]) {
                const point = new Vector3(x, y, z).project(camera);
                expect(Math.abs(point.x)).toBeLessThan(1);
                expect(Math.abs(point.y)).toBeLessThan(1);
            }
        }
    }
}

function readGlyphBrightness(): { fill: number; outline: number }[] {
    const [scene] = boundary.renderer.render.mock.lastCall!;
    const lettering = scene.getObjectByName('sign-lettering') as Mesh<ExtrudeGeometry>;
    const edges = scene.getObjectByName('sign-edges') as InstancedMesh;
    const positions = lettering.geometry.getAttribute('position');
    const colors = lettering.geometry.getAttribute('color');
    const shapes = lettering.geometry.parameters.shapes as Shape[];
    return shapes.map((shape) => {
        const points = shape.getPoints();
        const minX = Math.min(...points.map((point) => point.x)) - 0.001;
        const maxX = Math.max(...points.map((point) => point.x)) + 0.001;
        const fill = new Set<number>();
        const outline = new Set<number>();
        for (let vertex = 0; vertex < positions.count; vertex++) {
            if (positions.getX(vertex) >= minX && positions.getX(vertex) <= maxX) {
                fill.add(colors.getX(vertex));
            }
        }
        const transform = new Matrix4();
        const color = new Color();
        for (let edge = 0; edge < edges.count; edge++) {
            edges.getMatrixAt(edge, transform);
            if (transform.elements[12] >= minX && transform.elements[12] <= maxX) {
                edges.getColorAt(edge, color);
                outline.add(color.r);
            }
        }
        expect(fill.size).toBe(1);
        expect(outline.size).toBe(1);
        return { fill: [...fill][0], outline: [...outline][0] };
    });
}

describe('title wordmark lifecycle', () => {
    let notifyResize: () => void;
    let browser: EventTarget & {
        devicePixelRatio: number;
        requestAnimationFrame: ReturnType<typeof vi.fn>;
    };
    let document: FakeDocument & { hidden: boolean };
    let preference: EventTarget & { matches: boolean };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        document = Object.assign(new FakeDocument(), { hidden: false });
        preference = Object.assign(new EventTarget(), { matches: false });
        browser = Object.assign(new EventTarget(), {
            devicePixelRatio: 2.5,
            matchMedia: () => preference,
            requestAnimationFrame: vi.fn(),
        });
        vi.stubGlobal('document', document);
        vi.stubGlobal('window', browser);
        vi.stubGlobal(
            'ResizeObserver',
            class {
                readonly observe = boundary.observe;
                readonly disconnect = boundary.disconnect;
                constructor(callback: () => void) {
                    notifyResize = callback;
                }
            }
        );
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    function createHost(width = 560, height = 140) {
        const size = { width, height };
        const host = Object.assign(document.createElement('div'), {
            getBoundingClientRect: () => size,
        });
        const fallback = document.createElement('h1');
        fallback.textContent = 'PACKETLOSS';
        host.appendChild(fallback);
        document.body.appendChild(host);
        return { host, fallback, size };
    }

    it('renders the map lettering without game startup, and refits it only when viewport dimensions change', () => {
        const { host, fallback, size } = createHost();
        expect(WebGLRenderer).not.toHaveBeenCalled();
        const dispose = mountTitleWordmark(host as unknown as HTMLElement);
        const [scene, camera] = boundary.renderer.render.mock.lastCall!;
        const lettering = scene.getObjectByName('sign-lettering') as Mesh<BufferGeometry, Material>;
        const geometry = lettering.geometry;
        expect(geometry.getAttribute('position').count).toBeGreaterThan(0);
        expect(scene.getObjectByName('sign-edges')).toBeInstanceOf(InstancedMesh);
        expect(scene.getObjectByName('floor')).toBeUndefined();
        expect(host.querySelector('h1')).toBe(fallback);
        expect(host.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true');
        expect(boundary.renderer.setDrawingBufferSize).toHaveBeenCalledExactlyOnceWith(560, 140, 2);
        const gameplayCamera = new Camera3D();
        gameplayCamera.present();
        expect(camera.quaternion.angleTo(gameplayCamera.camera.quaternion)).toBeCloseTo(0);
        assertArtworkFits();
        notifyResize();
        expect(boundary.renderer.render).toHaveBeenCalledOnce();

        size.width = 240;
        size.height = 100;
        notifyResize();
        expect(boundary.renderer.render).toHaveBeenCalledTimes(2);
        expect(lettering.geometry).toBe(geometry);
        assertArtworkFits();
        browser.devicePixelRatio = 1;
        browser.dispatchEvent(new Event('resize'));
        expect(boundary.renderer.setDrawingBufferSize).toHaveBeenLastCalledWith(240, 100, 1);
        expect(browser.requestAnimationFrame).not.toHaveBeenCalled();
        dispose();
    });

    it('releases its actual geometry, materials, observer and context once while preserving fallback content', () => {
        const { host, fallback } = createHost();
        const disposeMaze = vi.spyOn(MazeScene.prototype, 'dispose');
        const dispose = mountTitleWordmark(host as unknown as HTMLElement);
        const [scene] = boundary.renderer.render.mock.lastCall!;
        const resources = new Set<
            BufferGeometry | Material | InstancedMesh<BufferGeometry, Material | Material[]>
        >();
        scene.traverse((object) => {
            if (!(object instanceof Mesh)) return;
            const mesh = object as Mesh<BufferGeometry, Material | Material[]>;
            resources.add(mesh.geometry);
            for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material])
                resources.add(material);
            if (object instanceof InstancedMesh)
                resources.add(object as InstancedMesh<BufferGeometry, Material | Material[]>);
        });
        const disposals = [...resources].map((resource) => vi.spyOn(resource, 'dispose'));
        dispose();
        dispose();
        notifyResize();
        browser.dispatchEvent(new Event('resize'));
        for (const spy of disposals) expect(spy).toHaveBeenCalledOnce();
        expect(disposeMaze).toHaveBeenCalledOnce();
        expect(boundary.disconnect).toHaveBeenCalledOnce();
        expect(boundary.renderer.dispose).toHaveBeenCalledOnce();
        expect(boundary.renderer.forceContextLoss).toHaveBeenCalledOnce();
        expect(boundary.renderer.render).toHaveBeenCalledOnce();
        expect(scene.children).toHaveLength(0);
        expect(host.children).toEqual([fallback]);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('cleans up partial startup and rethrows so the shell can keep its text title', () => {
        const { host, fallback } = createHost();
        const disposeMaze = vi.spyOn(MazeScene.prototype, 'dispose');
        boundary.renderer.render.mockImplementationOnce(() => {
            throw new Error('WebGL rendering failed');
        });
        expect(() => mountTitleWordmark(host as unknown as HTMLElement)).toThrow(
            'WebGL rendering failed'
        );
        expect(disposeMaze).toHaveBeenCalledOnce();
        expect(boundary.renderer.dispose).toHaveBeenCalledOnce();
        expect(host.children).toEqual([fallback]);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('notifies the shell and removes its canvas when the WebGL context is lost', () => {
        const { host, fallback } = createHost();
        const unavailable = vi.fn();
        host.addEventListener('packet-wordmark-unavailable', unavailable);
        const dispose = mountTitleWordmark(host as unknown as HTMLElement);
        const [scene] = boundary.renderer.render.mock.lastCall!;
        const lettering = scene.getObjectByName('sign-lettering') as Mesh<BufferGeometry>;
        const colors = lettering.geometry.getAttribute('color');
        vi.advanceTimersToNextTimer();
        const canvas = host.querySelector('canvas')!;
        canvas.dispatchEvent(new Event('webglcontextlost'));
        canvas.dispatchEvent(new Event('webglcontextlost'));
        dispose();
        expect(unavailable).toHaveBeenCalledOnce();
        expect(boundary.renderer.dispose).toHaveBeenCalledOnce();
        expect(boundary.disconnect).toHaveBeenCalledOnce();
        expect(host.children).toEqual([fallback]);
        expect(vi.getTimerCount()).toBe(0);
        expect([...colors.array].every((value) => value === 1)).toBe(true);
    });

    it('briefly dims only one randomly chosen authored letter and its outline before restoring it', () => {
        const { host } = createHost();
        const startedAt = Date.now();
        const dispose = mountTitleWordmark(host as unknown as HTMLElement, 'full');
        vi.mocked(Math.random).mockReturnValue(0.35);
        const initial = readGlyphBrightness();
        expect(vi.getTimerCount()).toBe(1);
        vi.advanceTimersByTime(4999);
        expect(boundary.renderer.render).toHaveBeenCalledOnce();
        vi.advanceTimersToNextTimer();
        expect(Date.now() - startedAt).toBeGreaterThanOrEqual(5000);
        expect(Date.now() - startedAt).toBeLessThanOrEqual(9000);
        const dimmed = readGlyphBrightness();
        expect(dimmed.filter((glyph, index) => glyph.fill !== initial[index].fill)).toHaveLength(1);
        expect(dimmed[3].fill).toBeLessThan(initial[3].fill);
        expect(dimmed[3].fill).toBeGreaterThan(0);
        expect(dimmed[3].outline).toBe(dimmed[3].fill);
        for (const [index, glyph] of dimmed.entries()) {
            if (index !== 3) expect(glyph).toEqual(initial[index]);
        }
        vi.advanceTimersByTime(110);
        expect(readGlyphBrightness()).toEqual(initial);
        expect(boundary.renderer.render).toHaveBeenCalledTimes(3);
        expect(boundary.renderer.setDrawingBufferSize).toHaveBeenCalledOnce();
        expect(browser.requestAnimationFrame).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(1);
        dispose();
        vi.advanceTimersByTime(20000);
        expect(boundary.renderer.render).toHaveBeenCalledTimes(3);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('keeps Reduced static and suppresses timers while the title starts hidden', () => {
        const { host } = createHost();
        const disposeReduced = mountTitleWordmark(host as unknown as HTMLElement, 'reduced');
        preference.dispatchEvent(new Event('change'));
        document.dispatchEvent(new Event('visibilitychange'));
        expect(vi.getTimerCount()).toBe(0);
        vi.advanceTimersByTime(20000);
        expect(boundary.renderer.render).toHaveBeenCalledOnce();
        disposeReduced();

        document.hidden = true;
        const disposeFull = mountTitleWordmark(host as unknown as HTMLElement, 'full');
        expect(vi.getTimerCount()).toBe(0);
        document.hidden = false;
        preference.matches = true;
        document.dispatchEvent(new Event('visibilitychange'));
        expect(vi.getTimerCount()).toBe(1);
        disposeFull();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('restores a dimmed letter immediately on reduced preference or hiding and restarts with a fresh gap', () => {
        const { host } = createHost();
        const dispose = mountTitleWordmark(host as unknown as HTMLElement);
        const initial = readGlyphBrightness();
        for (const toggle of [
            (disabled: boolean) => {
                preference.matches = disabled;
                preference.dispatchEvent(new Event('change'));
            },
            (disabled: boolean) => {
                document.hidden = disabled;
                document.dispatchEvent(new Event('visibilitychange'));
            },
        ]) {
            vi.advanceTimersToNextTimer();
            expect(readGlyphBrightness()).not.toEqual(initial);
            toggle(true);
            expect(readGlyphBrightness()).toEqual(initial);
            expect(vi.getTimerCount()).toBe(0);
            toggle(false);
            expect(vi.getTimerCount()).toBe(1);
            const renders = boundary.renderer.render.mock.calls.length;
            vi.advanceTimersByTime(4999);
            expect(boundary.renderer.render).toHaveBeenCalledTimes(renders);
        }
        dispose();
        const renders = boundary.renderer.render.mock.calls.length;
        document.dispatchEvent(new Event('visibilitychange'));
        preference.dispatchEvent(new Event('change'));
        expect(boundary.renderer.render).toHaveBeenCalledTimes(renders);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('cancels an in-flight dip and preserves fallback when a blink render fails', () => {
        const { host, fallback } = createHost();
        const unavailable = vi.fn();
        host.addEventListener('packet-wordmark-unavailable', unavailable);
        const dispose = mountTitleWordmark(host as unknown as HTMLElement, 'full');
        boundary.renderer.render.mockImplementationOnce(() => {
            throw new Error('Blink rendering failed');
        });
        vi.advanceTimersToNextTimer();
        expect(unavailable).toHaveBeenCalledOnce();
        expect(vi.getTimerCount()).toBe(0);
        expect(host.children).toEqual([fallback]);
        expect(boundary.renderer.dispose).toHaveBeenCalledOnce();
        document.dispatchEvent(new Event('visibilitychange'));
        dispose();
        expect(boundary.renderer.dispose).toHaveBeenCalledOnce();
    });
});
