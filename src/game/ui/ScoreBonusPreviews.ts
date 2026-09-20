import {
    ACESFilmicToneMapping,
    AmbientLight,
    DirectionalLight,
    Mesh,
    OrthographicCamera,
    Scene,
    SRGBColorSpace,
    WebGLRenderer,
    type BufferGeometry,
    type Material,
    type Object3D,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SCORE_BONUS_TIERS } from '../domain/valueObjects/ScoreBonus';

const SIZE = 64;
const SLOT = 4;

/** Releases each parsed GLB resource once after its bitmap preview is copied. */
function disposeModels(models: readonly Object3D[]): void {
    const geometries = new Set<BufferGeometry>();
    const materials = new Set<Material>();
    for (const model of models)
        model.traverse((child) => {
            if (!(child instanceof Mesh)) return;
            const mesh = child as Mesh<BufferGeometry, Material | Material[]>;
            geometries.add(mesh.geometry);
            const owned = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            owned.forEach((material) => materials.add(material));
        });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
}

/** Renders all five authored GLBs once in one WebGL atlas, then retains 2D canvases. */
export function mountScoreBonusPreviews(host: HTMLElement): () => void {
    const abort = new AbortController();
    const models: Object3D[] = [];
    const canvases: HTMLCanvasElement[] = [];
    let disposed = false;
    let renderer: WebGLRenderer | undefined;

    /** Cancels pending loading and removes this page's copied icon canvases. */
    const dispose = (): void => {
        if (disposed) return;
        disposed = true;
        abort.abort();
        canvases.forEach((canvas) => canvas.remove());
        host.querySelectorAll<HTMLElement>('[data-bonus] > span').forEach((fallback) => {
            fallback.hidden = false;
        });
        renderer?.dispose();
        renderer?.forceContextLoss();
        disposeModels(models);
    };

    /** Loads the GLBs, draws their shared atlas, and copies only mounted icon slots. */
    async function initialize(): Promise<void> {
        try {
            const loader = new GLTFLoader();
            const loaded = await Promise.allSettled(
                SCORE_BONUS_TIERS.map(async ({ kind }) => {
                    const url = `${import.meta.env.BASE_URL}assets/models/multipliers/${kind}.glb`;
                    const response = await fetch(url, { signal: abort.signal });
                    if (!response.ok) throw new Error(`Unable to load ${kind} icon`);
                    const gltf = await loader.parseAsync(await response.arrayBuffer(), '');
                    return gltf.scene;
                })
            );
            for (const result of loaded)
                if (result.status === 'fulfilled') models.push(result.value);
            if (disposed || loaded.some((result) => result.status === 'rejected')) {
                disposeModels(models);
                models.length = 0;
                return;
            }
            const scene = new Scene();
            scene.add(new AmbientLight(0xffffff, 2));
            const light = new DirectionalLight(0xffffff, 2.5);
            light.position.set(-3, 10, 4);
            scene.add(light);
            models.forEach((model, index) => {
                model.position.x = index * SLOT;
                model.scale.setScalar(1.25);
                scene.add(model);
            });
            const center = ((models.length - 1) * SLOT) / 2;
            const halfWidth = (models.length * SLOT) / 2;
            const camera = new OrthographicCamera(
                -halfWidth,
                halfWidth,
                SLOT / 2,
                -SLOT / 2,
                0.1,
                50
            );
            camera.up.set(0, 0, -1);
            camera.position.set(center, 20, 0);
            camera.lookAt(center, 0, 0);
            const source = document.createElement('canvas');
            renderer = new WebGLRenderer({ canvas: source, antialias: true, alpha: true });
            renderer.outputColorSpace = SRGBColorSpace;
            renderer.toneMapping = ACESFilmicToneMapping;
            renderer.setSize(SIZE * models.length, SIZE, false);
            renderer.setClearColor(0x000000, 0);
            renderer.render(scene, camera);
            SCORE_BONUS_TIERS.forEach(({ kind }, index) => {
                const slot = host.querySelector<HTMLElement>(`[data-bonus="${kind}"]`);
                if (!slot) return;
                const canvas = document.createElement('canvas');
                canvas.width = SIZE;
                canvas.height = SIZE;
                canvas.className = 'pointer-events-none absolute inset-0 size-full';
                canvas.setAttribute('aria-hidden', 'true');
                const context = canvas.getContext('2d');
                if (!context) return;
                context.drawImage(source, index * SIZE, 0, SIZE, SIZE, 0, 0, SIZE, SIZE);
                slot.appendChild(canvas);
                const fallback = slot.querySelector<HTMLElement>('span');
                if (fallback) fallback.hidden = true;
                canvases.push(canvas);
            });
            renderer.dispose();
            renderer.forceContextLoss();
            renderer = undefined;
            disposeModels(models);
            models.length = 0;
        } catch {
            dispose();
        }
    }
    void initialize();
    return dispose;
}
