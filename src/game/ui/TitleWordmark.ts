import {
    ACESFilmicToneMapping,
    Box3,
    type BufferGeometry,
    Color,
    Float32BufferAttribute,
    type InstancedMesh,
    Matrix4,
    type Mesh,
    type MeshBasicMaterial,
    type MeshStandardMaterial,
    Scene,
    SRGBColorSpace,
    Vector3,
    WebGLRenderer,
} from 'three';
import { TILE_SIZE } from '../../config/constants';
import { Camera3D } from '../../engine/camera3d';
import { createEmptyCollisionTile } from '../domain/world/CollisionGrid';
import type { WorldMapData } from '../domain/world/WorldState';
import type { MenuMotion } from '../infrastructure/adapters/LocalProfileStore';
import { MazeScene } from '../infrastructure/three/MazeScene';
import { getPacketSignGlyphCenters } from '../infrastructure/three/PacketSignGeometry';
import { addGameplayLighting } from '../infrastructure/three/ScenePresentation';
import { observeMenuMotion } from './MenuMotion';

/** The map's own wordmark, with occasional single-letter dips independent of gameplay. */
export function mountTitleWordmark(host: HTMLElement, motion: MenuMotion = 'system'): () => void {
    const canvas = document.createElement('canvas');
    canvas.className = 'pointer-events-none block h-full w-full';
    canvas.setAttribute('aria-hidden', 'true');
    const scene = new Scene();
    const camera = new Camera3D();
    let maze: MazeScene | undefined;
    let renderer: WebGLRenderer | undefined;
    let observer: ResizeObserver | undefined;
    let disposed = false;
    let renderedWidth = 0;
    let renderedHeight = 0;
    let renderedRatio = 0;
    const corners: Vector3[] = [];
    let stopObservingMotion: (() => void) | undefined;
    let blinkTimer: ReturnType<typeof setTimeout> | undefined;
    let motionActive = false;
    let dimmedLetter: number | null = null;
    let colors: Float32BufferAttribute;
    let edges: InstancedMesh<BufferGeometry, MeshBasicMaterial>;
    const glyphs: { vertices: number[]; edges: number[] }[] = [];
    const tint = new Color();

    const setLetterBrightness = (letter: number, brightness: number): void => {
        for (const vertex of glyphs[letter].vertices) {
            colors.setXYZ(vertex, brightness, brightness, brightness);
        }
        colors.needsUpdate = true;
        tint.setRGB(brightness, brightness, brightness);
        for (const edge of glyphs[letter].edges) edges.setColorAt(edge, tint);
        if (edges.instanceColor) edges.instanceColor.needsUpdate = true;
    };

    const stopBlink = (): boolean => {
        clearTimeout(blinkTimer);
        blinkTimer = undefined;
        if (dimmedLetter === null) return false;
        setLetterBrightness(dimmedLetter, 1);
        dimmedLetter = null;
        return true;
    };

    const dispose = (): void => {
        if (disposed) return;
        disposed = true;
        stopObservingMotion?.();
        stopBlink();
        observer?.disconnect();
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('webglcontextlost', unavailable);
        maze?.dispose();
        scene.clear();
        renderer?.dispose();
        renderer?.forceContextLoss();
        canvas.remove();
    };

    const unavailable = (): void => {
        if (disposed) return;
        dispose();
        host.dispatchEvent(new Event('packet-wordmark-unavailable', { bubbles: true }));
    };

    const render = (force = false): void => {
        if (disposed || !renderer) return;
        const rect = host.getBoundingClientRect();
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);
        if (width <= 0 || height <= 0) return;
        const deviceRatio = window.devicePixelRatio;
        const ratio =
            Number.isFinite(deviceRatio) && deviceRatio > 0 ? Math.min(deviceRatio, 2) : 1;
        const resized =
            width !== renderedWidth || height !== renderedHeight || ratio !== renderedRatio;
        if (!resized && !force) return;

        if (resized) {
            renderer.setDrawingBufferSize(width, height, ratio);
            camera.setViewport(width, height);
            camera.setZoom(1);
            camera.present(1, ratio);
            let extent = 0;
            for (const corner of corners) {
                const projected = corner.clone().project(camera.camera);
                extent = Math.max(extent, Math.abs(projected.x), Math.abs(projected.y));
            }
            // Fit the full extrusion and its outlines, leaving room on every edge.
            camera.setZoom(0.9 / extent);
            camera.present(1, ratio);
        }
        renderer.render(scene, camera.camera);
        renderedWidth = width;
        renderedHeight = height;
        renderedRatio = ratio;
    };

    const scheduleBlink = (): void => {
        blinkTimer = setTimeout(blink, 5000 + Math.random() * 4000);
    };

    function blink(): void {
        blinkTimer = undefined;
        if (disposed) return;
        try {
            if (dimmedLetter === null) {
                dimmedLetter = Math.floor(Math.random() * glyphs.length);
                setLetterBrightness(dimmedLetter, 0.16);
                render(true);
                blinkTimer = setTimeout(blink, 110);
            } else {
                stopBlink();
                render(true);
                scheduleBlink();
            }
        } catch {
            unavailable();
        }
    }

    const synchronizeMotion = (active: boolean): void => {
        if (disposed || motionActive === active) return;
        motionActive = active;
        try {
            if (stopBlink()) render(true);
            if (active) scheduleBlink();
        } catch {
            unavailable();
        }
    };

    function handleResize(): void {
        try {
            render();
        } catch {
            unavailable();
        }
    }

    try {
        const map: WorldMapData = {
            width: 5,
            height: 1,
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE,
            widthInPixels: 5 * TILE_SIZE,
            heightInPixels: TILE_SIZE,
            tiles: [
                [17, 18, 19, 20, 21].map((localId, x) => ({
                    x,
                    y: 0,
                    rawGid: localId + 1,
                    gid: localId + 1,
                    localId,
                    rotation: 0,
                    flipX: false,
                    flipY: false,
                    collision: createEmptyCollisionTile(),
                })),
            ],
            collisionByGid: new Map(),
            spawnObjects: [],
        };
        maze = new MazeScene({ map });
        const artwork = maze.group.getObjectByName('sign-artwork');
        if (!artwork) throw new Error('The map wordmark could not be created.');
        scene.add(artwork);
        const lettering = artwork.getObjectByName('sign-lettering') as Mesh<
            BufferGeometry,
            MeshStandardMaterial
        >;
        edges = artwork.getObjectByName('sign-edges') as InstancedMesh<
            BufferGeometry,
            MeshBasicMaterial
        >;
        const centers = getPacketSignGlyphCenters(map.widthInPixels - 2);
        centers.forEach(() => glyphs.push({ vertices: [], edges: [] }));
        const glyphAt = (x: number): number =>
            centers.reduce(
                (nearest, center, index) =>
                    Math.abs(center - x) < Math.abs(centers[nearest] - x) ? index : nearest,
                0
            );
        const positions = lettering.geometry.getAttribute('position');
        colors = new Float32BufferAttribute(new Float32Array(positions.count * 3).fill(1), 3);
        lettering.geometry.setAttribute('color', colors);
        lettering.material.vertexColors = true;
        lettering.material.needsUpdate = true;
        for (let vertex = 0; vertex < positions.count; vertex++) {
            glyphs[glyphAt(positions.getX(vertex))].vertices.push(vertex);
        }
        const transform = new Matrix4();
        for (let edge = 0; edge < edges.count; edge++) {
            edges.getMatrixAt(edge, transform);
            glyphs[glyphAt(transform.elements[12])].edges.push(edge);
            edges.setColorAt(edge, tint.setRGB(1, 1, 1));
        }
        // Center the extrusion vertically without changing the authored lettering.
        const bounds = new Box3().setFromObject(artwork);
        artwork.position.y -= bounds.getCenter(new Vector3()).y;
        bounds.setFromObject(artwork);
        for (const x of [bounds.min.x, bounds.max.x]) {
            for (const y of [bounds.min.y, bounds.max.y]) {
                for (const z of [bounds.min.z, bounds.max.z]) corners.push(new Vector3(x, y, z));
            }
        }
        addGameplayLighting(scene);
        scene.background = null;
        camera.setBounds(map.widthInPixels, map.heightInPixels);
        renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.outputColorSpace = SRGBColorSpace;
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.setClearColor(0x000000, 0);
        canvas.addEventListener('webglcontextlost', unavailable);
        host.appendChild(canvas);
        render();
        if (renderedWidth === 0) throw new Error('The title wordmark needs a visible host.');
        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(handleResize);
            observer.observe(host);
        }
        window.addEventListener('resize', handleResize);
        stopObservingMotion = observeMenuMotion(motion, synchronizeMotion);
        if (disposed) {
            stopObservingMotion();
            throw new Error('The title wordmark became unavailable.');
        }
        return dispose;
    } catch (error) {
        dispose();
        throw error;
    }
}
