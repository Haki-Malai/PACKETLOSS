import {
    ACESFilmicToneMapping,
    Box3,
    Group,
    Scene,
    SRGBColorSpace,
    Vector3,
    WebGLRenderer,
} from 'three';
import { Camera3D } from '../../engine/camera3d';
import { ENEMY_KEYS } from '../domain/entities/EnemyEntity';
import type { MenuMotion } from '../infrastructure/adapters/LocalProfileStore';
import { ArcadeAssets } from '../infrastructure/three/ArcadeAssets';
import { addGameplayLighting } from '../infrastructure/three/ScenePresentation';
import { observeMenuMotion } from './MenuMotion';

const ENEMIES = ENEMY_KEYS;
const PORTRAIT_SIZE = 80;
const FRAME_INTERVAL_MS = 1000 / 30;

interface Portrait {
    host: HTMLElement;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    model: Group;
}

/** Shared authored idle clips, rendered through one context without a gameplay simulation. */
export function mountEnemyPortraits(host: HTMLElement, motion: MenuMotion): () => void {
    const abort = new AbortController();
    const source = document.createElement('canvas');
    const scene = new Scene();
    const camera = new Camera3D();
    const portraits: Portrait[] = [];
    let motionActive = false;
    let assets: ArcadeAssets | undefined;
    let renderer: WebGLRenderer | undefined;
    let frame: number | null = null;
    let previousTimestamp: number | null = null;
    let elapsedMs = 0;
    let sinceRenderMs = 0;
    let pixelRatio = 0;
    let disposed = false;

    const stopAnimation = (): void => {
        if (frame !== null) window.cancelAnimationFrame(frame);
        frame = null;
        previousTimestamp = null;
        sinceRenderMs = 0;
    };

    const dispose = (): void => {
        if (disposed) return;
        disposed = true;
        abort.abort();
        stopAnimation();
        stopObservingMotion();
        window.removeEventListener('resize', synchronize);
        source.removeEventListener('webglcontextlost', dispose);
        for (const portrait of portraits) {
            portrait.host.removeAttribute('data-ready');
            portrait.canvas.remove();
        }
        scene.clear();
        assets?.dispose();
        renderer?.dispose();
        renderer?.forceContextLoss();
    };

    const render = (): void => {
        if (!assets || !renderer || disposed) return;
        const deviceRatio = window.devicePixelRatio;
        const ratio =
            Number.isFinite(deviceRatio) && deviceRatio > 0 ? Math.min(deviceRatio, 2) : 1;
        if (ratio !== pixelRatio) {
            pixelRatio = ratio;
            renderer.setDrawingBufferSize(PORTRAIT_SIZE, PORTRAIT_SIZE, ratio);
            for (const portrait of portraits) {
                portrait.canvas.width = Math.floor(PORTRAIT_SIZE * ratio);
                portrait.canvas.height = Math.floor(PORTRAIT_SIZE * ratio);
            }
            camera.present(1, ratio);
        }
        assets.sampleAnimation(elapsedMs / 1000);
        for (const portrait of portraits) {
            portrait.model.visible = true;
            renderer.render(scene, camera.camera);
            portrait.context.clearRect(0, 0, portrait.canvas.width, portrait.canvas.height);
            // Copy before the next model replaces the nonpersistent WebGL drawing buffer.
            portrait.context.drawImage(source, 0, 0, portrait.canvas.width, portrait.canvas.height);
            portrait.model.visible = false;
            if (!portrait.canvas.parentElement) portrait.host.appendChild(portrait.canvas);
            portrait.host.setAttribute('data-ready', 'true');
        }
    };

    const tick = (timestamp: number): void => {
        frame = null;
        if (disposed || !motionActive) return;
        if (previousTimestamp !== null) {
            const delta = Math.max(0, timestamp - previousTimestamp);
            elapsedMs += delta;
            sinceRenderMs += delta;
        }
        previousTimestamp = timestamp;
        if (sinceRenderMs >= FRAME_INTERVAL_MS) {
            sinceRenderMs = 0;
            try {
                render();
            } catch {
                dispose();
                return;
            }
        }
        frame = window.requestAnimationFrame(tick);
    };

    function synchronize(): void {
        stopAnimation();
        if (disposed || !assets || document.hidden) return;
        try {
            render();
            if (motionActive) frame = window.requestAnimationFrame(tick);
        } catch {
            dispose();
        }
    }

    const stopObservingMotion = observeMenuMotion(motion, (active) => {
        motionActive = active;
        synchronize();
    });
    window.addEventListener('resize', synchronize);
    void ArcadeAssets.load(abort.signal)
        .then((loaded) => {
            if (disposed) {
                loaded.dispose();
                return;
            }
            assets = loaded;
            addGameplayLighting(scene);
            scene.background = null;
            camera.setBounds(32, 32);
            camera.setViewport(PORTRAIT_SIZE, PORTRAIT_SIZE);
            camera.setZoom(PORTRAIT_SIZE / 18);
            camera.startFollow({ x: 16, y: 16 }, 1, 1);
            camera.snapToFollowTarget();
            renderer = new WebGLRenderer({ canvas: source, antialias: true, alpha: true });
            renderer.outputColorSpace = SRGBColorSpace;
            renderer.toneMapping = ACESFilmicToneMapping;
            renderer.setClearColor(0x000000, 0);
            source.addEventListener('webglcontextlost', dispose);
            for (const key of ENEMIES) {
                const slot = host.querySelector<HTMLElement>(`[data-enemy="${key}"]`);
                if (!slot) continue;
                const canvas = document.createElement('canvas');
                canvas.className = 'pointer-events-none block h-full w-full';
                canvas.setAttribute('aria-hidden', 'true');
                const context = canvas.getContext('2d');
                if (!context) throw new Error('Enemy portraits require a 2D canvas.');
                const model = loaded.createEnemy(key);
                const center = new Box3().setFromObject(model).getCenter(new Vector3());
                model.position.set(16 - center.x, -center.y, 16 - center.z);
                model.visible = false;
                scene.add(model);
                portraits.push({ host: slot, canvas, context, model });
            }
            synchronize();
        })
        .catch(dispose);
    return dispose;
}
