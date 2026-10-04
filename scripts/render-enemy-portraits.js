import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';
import { build } from 'esbuild';
import { Box3, Color, Matrix3, Raycaster, Scene, Vector2, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const root = fileURLToPath(new URL('../', import.meta.url));

/** Loads the game's actual model, palette, animation, and camera code without a browser or generated helper file. */
async function loadPresentation() {
    const result = await build({
        stdin: {
            contents: `
                export { ArcadeAssets } from './src/game/infrastructure/three/ArcadeAssets';
                export { addGameplayLighting } from './src/game/infrastructure/three/ScenePresentation';
                export { Camera3D } from './src/engine/camera3d';
                export { ENEMY_KEYS } from './src/game/domain/entities/EnemyEntity';
            `,
            resolveDir: root,
        },
        bundle: true,
        platform: 'node',
        format: 'esm',
        write: false,
        define: { 'import.meta.env.DEV': 'false', 'import.meta.env.BASE_URL': '"/"' },
        plugins: [{
            name: 'shared-three-instance',
            setup(builder) {
                builder.onResolve({ filter: /^three(?:\/|$)/ }, ({ path }) => ({
                    path: import.meta.resolve(path), external: true,
                }));
            },
        }],
    });
    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].contents).toString('base64')}`);
}

/** Encodes RGBA pixels using the PNG format and Node's built-in compression and CRC. */
function pngBuffer(pixels, size) {
    const chunk = (name, data) => {
        const payload = Buffer.concat([Buffer.from(name), data]);
        const buffer = Buffer.alloc(payload.length + 8);
        buffer.writeUInt32BE(data.length);
        payload.copy(buffer, 4);
        buffer.writeUInt32BE(crc32(payload), buffer.length - 4);
        return buffer;
    };
    const header = Buffer.alloc(13);
    header.writeUInt32BE(size, 0);
    header.writeUInt32BE(size, 4);
    header[8] = 8;
    header[9] = 6;
    const rows = Buffer.alloc(size * (size * 4 + 1));
    for (let y = 0; y < size; y += 1) pixels.copy(rows, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
    return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk('IHDR', header), chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
}

/** Samples the nearest real mesh surface, including animated morphs, with shared scene lighting and transparent antialiasing. */
function renderPortrait(scene, camera, size = 256) {
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const normal = new Vector3();
    const normalMatrix = new Matrix3();
    const color = new Color();
    const lightColor = new Color();
    const pixels = Buffer.alloc(size * size * 4);
    const lights = scene.children.filter((object) => object.isLight);
    for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
            let covered = 0;
            const channels = [0, 0, 0];
            for (const dx of [0.25, 0.75]) for (const dy of [0.25, 0.75]) {
                pointer.set((x + dx) / size * 2 - 1, 1 - (y + dy) / size * 2);
                raycaster.setFromCamera(pointer, camera);
                const hit = raycaster.intersectObject(scene, true).find((candidate) => {
                    for (let object = candidate.object; object; object = object.parent) if (!object.visible) return false;
                    return true;
                });
                if (!hit?.face) continue;
                const material = Array.isArray(hit.object.material)
                    ? hit.object.material[hit.face.materialIndex] : hit.object.material;
                normal.copy(hit.normal ?? hit.face.normal).applyMatrix3(normalMatrix.getNormalMatrix(hit.object.matrixWorld)).normalize();
                if (normal.dot(raycaster.ray.direction) > 0) normal.negate();
                lightColor.setRGB(0, 0, 0);
                for (const light of lights) {
                    if (light.isHemisphereLight) {
                        lightColor.add(light.groundColor.clone().lerp(light.color, normal.y * 0.5 + 0.5).multiplyScalar(light.intensity));
                    } else if (light.isDirectionalLight) {
                        const direction = light.position.clone().sub(light.target.position).normalize();
                        lightColor.add(light.color.clone().multiplyScalar(Math.max(0, normal.dot(direction)) * light.intensity));
                    }
                }
                color.copy(material.color).multiply(lightColor);
                if (material.emissive) color.add(material.emissive.clone().multiplyScalar(material.emissiveIntensity));
                color.convertLinearToSRGB();
                channels[0] += Math.min(1, color.r); channels[1] += Math.min(1, color.g); channels[2] += Math.min(1, color.b);
                covered += 1;
            }
            if (!covered) continue;
            const offset = (y * size + x) * 4;
            for (let channel = 0; channel < 3; channel += 1) pixels[offset + channel] = Math.round(channels[channel] / covered * 255);
            pixels[offset + 3] = Math.round(covered / 4 * 255);
        }
    }
    return pngBuffer(pixels, size);
}

/** Renders reusable transparent PNG fallbacks from shipped GLBs entirely in Node, without a browser or native build dependencies. */
export async function renderEnemyPortraits(outputDirectory = resolve(root, 'public/assets/images/enemies')) {
    const { ArcadeAssets, Camera3D, ENEMY_KEYS, addGameplayLighting } = await loadPresentation();
    const loader = new GLTFLoader();
    const models = Object.fromEntries(await Promise.all(ENEMY_KEYS.map(async (key) => {
        const bytes = await readFile(resolve(root, 'public/assets/models/enemies', `${key}.glb`));
        return [key, await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')];
    })));
    const assets = new ArcadeAssets(models);
    try {
        await mkdir(outputDirectory, { recursive: true });
        const camera = new Camera3D();
        camera.setBounds(18, 32);
        camera.setViewport(256, 256);
        camera.setZoom(256 / 18);
        camera.startFollow({ x: 9, y: 16 }, 1, 1);
        camera.snapToFollowTarget();
        camera.present();
        for (const key of ENEMY_KEYS) {
            const scene = new Scene();
            addGameplayLighting(scene);
            scene.background = null;
            const model = assets.createEnemy(key);
            scene.add(model);
            assets.sampleAnimation(23 / 30);
            const center = new Box3().setFromObject(model).getCenter(new Vector3());
            model.position.set(9 - center.x, -center.y, 16 - center.z);
            const png = renderPortrait(scene, camera.camera);
            await writeFile(resolve(outputDirectory, `${key}.png`), png);
            scene.clear();
        }
        return ENEMY_KEYS.map((key) => resolve(outputDirectory, `${key}.png`));
    } finally {
        assets.dispose();
    }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 2 || args[0] !== '--output')) {
        throw new Error('Usage: node scripts/render-enemy-portraits.js [--output DIRECTORY]');
    }
    const files = await renderEnemyPortraits(args[1] ? resolve(args[1]) : undefined);
    console.log(`Rendered ${files.length} enemy portraits in ${resolve(files[0], '..')}`);
}
