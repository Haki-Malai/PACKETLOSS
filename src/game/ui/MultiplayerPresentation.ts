import { InstancedMesh, Matrix4, Scene } from 'three';
import { CAMERA, ENEMY_SCARED_WARNING_DURATION_MS, PACKET_DEATH_RECOVERY, PACKET_PORTAL_BLINK, TILE_SIZE } from '../../config/constants';
import { Camera3D } from '../../engine/camera3d';
import { clamp } from '../../engine/math';
import type { WorldMapData } from '../domain/world/WorldState';
import type { MultiplayerConnectionSnapshot } from '../infrastructure/adapters/MultiplayerSocketClient';
import { ThreeRendererAdapter } from '../infrastructure/adapters/ThreeRendererAdapter';
import { TiledMapRepository } from '../infrastructure/map/TiledMapRepository';
import { HologramPacket } from '../infrastructure/three/HologramPacket';
import { MazeScene } from '../infrastructure/three/MazeScene';
import { MULTIPLAYER_PACKET_APPEARANCES } from '../infrastructure/three/PacketAppearances';
import { PacketLabels } from '../infrastructure/three/PacketLabels';
import {
    createPointGeometry,
    createPointMaterial,
    setPointTransform,
} from '../infrastructure/three/PickupPresentation';
import { addGameplayLighting } from '../infrastructure/three/ScenePresentation';
import { resolveMapPathsForVariant } from '../app/mapRuntimeConfig';
import { position } from '../simulation/movement';
import { sampleBlinkCadence } from '../shared/blinkCadence';
import {
    interpolateRemotePosition,
    LocalMovementPresentation,
    RacePresentationClock,
    type PredictedInput,
} from '../simulation/prediction';
import {
    RACE,
    type Direction,
    type Pickup,
    type RaceMap,
    type RaceSnapshot,
} from '../simulation/types';

const INTERPOLATION_TICKS = 6;

interface PlayerModel {
    color: string;
    packet: HologramPacket;
    labels: PacketLabels;
}

export interface MultiplayerPresentationStage {
    resize(_width: number, _height: number): void;
    sync(
        _connection: MultiplayerConnectionSnapshot,
        _predictedTick: number,
        _presentationTick: number,
        _localPresentation: LocalMovementPresentation,
        _now: number,
        _pendingInputs: readonly PredictedInput[]
    ): { acknowledgedInput?: number; discontinuity: boolean };
    snapCamera(): void;
    prepare(): Promise<void>;
    render(_elapsedMs: number): void;
    suspend(): void;
    dispose(): void;
}

export interface MultiplayerPresentationDependencies {
    loadMap(_signal: AbortSignal): Promise<WorldMapData>;
    createStage(_options: {
        canvas: HTMLCanvasElement;
        map: RaceMap;
        sourceMap: WorldMapData;
    }): MultiplayerPresentationStage;
    now(): number;
    requestFrame(_callback: FrameRequestCallback): number;
    cancelFrame(_frame: number): void;
    isHidden(): boolean;
    observeVisibility(_callback: () => void): () => void;
    observeWindowResize(_callback: () => void): () => void;
    observeElementResize(_element: HTMLElement, _callback: () => void): () => void;
}

export interface MultiplayerPresentationOptions {
    canvas: HTMLCanvasElement;
    root: HTMLElement;
    map: RaceMap;
    getConnectionSnapshot(): MultiplayerConnectionSnapshot;
    onError?(_error: unknown): void;
}

/** Owns multiplayer rendering resources, frame timing, prediction presentation, and disposal. */
export class MultiplayerPresentationSession {
    readonly ready: Promise<void>;

    private readonly abort = new AbortController();
    private readonly cleanups: Array<() => void> = [];
    private readonly localClock = new RacePresentationClock();
    private readonly remoteClock = new RacePresentationClock();
    private readonly localPresentation = new LocalMovementPresentation();
    private pending: PredictedInput[] = [];
    private stage: MultiplayerPresentationStage | null = null;
    private frame: number | null = null;
    private previousFrame: number | null = null;
    private canRender = false;
    private needsCameraSnap = true;
    private disposed = false;

    constructor(
        private readonly options: MultiplayerPresentationOptions,
        private readonly dependencies: MultiplayerPresentationDependencies = browserDependencies
    ) {
        this.ready = this.initialize().catch((error: unknown) => {
            this.dispose();
            throw error;
        });
    }

    /** Records local intent at the current raw snapshot time for later reconciliation. */
    recordInput(sequence: number, direction: Direction): void {
        if (this.disposed || sequence <= 0) return;
        const connection = this.options.getConnectionSnapshot();
        const race = connection.race;
        if (!race || !['countdown', 'playing'].includes(race.phase)) return;
        this.pending.push({
            sequence,
            tick: this.localClock.sample(
                race,
                connection.receivedAtMs,
                this.dependencies.now(),
                connection.latencyMs ?? 0
            ),
            direction,
        });
    }

    /** Clears timing and correction history after match, connection, or visibility transitions. */
    reset(): void {
        if (this.disposed) return;
        this.pending = [];
        this.localClock.reset();
        this.remoteClock.reset();
        this.localPresentation.reset();
        this.previousFrame = null;
        this.needsCameraSnap = true;
    }

    /** Immediately and idempotently releases every acquired listener, frame, and GPU resource. */
    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.abort.abort();
        if (this.frame !== null) {
            this.dependencies.cancelFrame(this.frame);
            this.frame = null;
        }
        while (this.cleanups.length > 0) this.cleanups.pop()?.();
        this.stage = null;
    }

    /** Loads and prepares the scene before drawing its first current-state frame. */
    private async initialize(): Promise<void> {
        this.cleanups.push(this.dependencies.observeVisibility(this.handleVisibilityChange));
        this.cleanups.push(this.dependencies.observeWindowResize(this.handleResize));
        const sourceMap = await this.dependencies.loadMap(this.abort.signal);
        this.throwIfDisposed();

        const stage = this.dependencies.createStage({
            canvas: this.options.canvas,
            map: this.options.map,
            sourceMap,
        });
        this.stage = stage;
        this.cleanups.push(() => stage.dispose());
        this.handleResize();
        this.cleanups.push(
            this.dependencies.observeElementResize(this.options.root, this.handleResize)
        );

        const beforePrepare = this.dependencies.now();
        this.syncStage(beforePrepare);
        stage.snapCamera();
        await waitForAbort(stage.prepare(), this.abort.signal);
        this.throwIfDisposed();
        this.canRender = true;
        if (this.dependencies.isHidden()) {
            stage.suspend();
            return;
        }
        this.drawFrame(this.dependencies.now());
    }

    /** Reconciles one raw network sample before camera and renderer presentation. */
    private syncStage(now: number): boolean {
        const stage = this.stage;
        if (!stage) return false;
        const connection = this.options.getConnectionSnapshot();
        const race = connection.race;
        if (!race) return false;
        const result = stage.sync(
            connection,
            this.localClock.sample(
                race,
                connection.receivedAtMs,
                now,
                connection.latencyMs ?? 0
            ),
            this.remoteClock.sample(race, connection.receivedAtMs, now),
            this.localPresentation,
            now,
            this.pending
        );
        if (result.acknowledgedInput !== undefined) {
            this.pending = this.pending.filter(
                (input) => input.sequence > result.acknowledgedInput!
            );
        }
        return result.discontinuity;
    }

    /** Draws one frame and schedules exactly one successor while presentation is active. */
    private readonly drawFrame = (now: number): void => {
        this.frame = null;
        if (this.disposed || !this.canRender || this.dependencies.isHidden()) return;
        try {
            const elapsed = this.previousFrame === null ? 0 : now - this.previousFrame;
            this.previousFrame = now;
            const discontinuity = this.syncStage(now);
            if (this.needsCameraSnap || discontinuity) {
                this.stage?.snapCamera();
                this.needsCameraSnap = false;
            }
            this.stage?.render(elapsed);
            this.scheduleFrame();
        } catch (error) {
            this.dispose();
            this.options.onError?.(error);
        }
    };

    /** Stops hidden-tab work and resumes from a fresh current-state camera sample. */
    private readonly handleVisibilityChange = (): void => {
        if (this.disposed) return;
        this.reset();
        if (this.dependencies.isHidden()) {
            if (this.frame !== null) {
                this.dependencies.cancelFrame(this.frame);
                this.frame = null;
            }
            this.stage?.suspend();
            return;
        }
        if (this.canRender) this.scheduleFrame();
    };

    /** Applies the current CSS bounds and requests a camera re-center on the next frame. */
    private readonly handleResize = (): void => {
        if (this.disposed || !this.stage) return;
        const bounds = this.options.root.getBoundingClientRect();
        this.stage.resize(bounds.width, bounds.height);
        this.needsCameraSnap = true;
    };

    private scheduleFrame(): void {
        if (
            this.frame !== null ||
            this.disposed ||
            !this.canRender ||
            this.dependencies.isHidden()
        ) {
            return;
        }
        this.frame = this.dependencies.requestFrame(this.drawFrame);
    }

    private throwIfDisposed(): void {
        if (this.disposed || this.abort.signal.aborted) {
            throw abortError(this.abort.signal);
        }
    }
}

/** Applies the shared 1080p gameplay framing policy to a multiplayer viewport. */
export function resizeMultiplayerViewport(
    renderer: Pick<ThreeRendererAdapter, 'resize' | 'width' | 'height'>,
    camera: Pick<Camera3D, 'setViewport' | 'setZoom'>,
    width: number,
    height: number
): void {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
    renderer.resize(width, height);
    camera.setViewport(renderer.width, renderer.height);
    camera.setZoom((CAMERA.zoom * renderer.height) / 1080);
}

/** Creates the concrete Three.js scene used by the browser presentation lifecycle. */
function createThreeStage({
    canvas,
    map,
    sourceMap,
}: {
    canvas: HTMLCanvasElement;
    map: RaceMap;
    sourceMap: WorldMapData;
}): MultiplayerPresentationStage {
    const cleanups: Array<() => void> = [];
    let disposed = false;
    try {
        const renderer = new ThreeRendererAdapter(canvas, true);
        cleanups.push(() => renderer.dispose());
        const camera = new Camera3D();
        const scene = new Scene();
        cleanups.push(() => scene.clear());
        const maze = new MazeScene({ map: sourceMap });
        cleanups.push(() => maze.dispose());
        const resources = new Set<{ dispose(): void }>();
        cleanups.push(() => resources.forEach((resource) => resource.dispose()));
        addGameplayLighting(scene);
        scene.add(maze.group);

        const players = MULTIPLAYER_PACKET_APPEARANCES.map((appearance, slot) => {
            const { color } = appearance;
            const packet = own(resources, new HologramPacket(appearance));
            const labels = own(resources, new PacketLabels(color));
            packet.group.add(labels.group);
            packet.group.name = `race-player-${slot + 1}`;
            packet.group.visible = false;
            scene.add(packet.group);
            return { color, packet, labels };
        });

        const bitGeometry = own(resources, createPointGeometry('base'));
        const coreGeometry = own(resources, createPointGeometry('power'));
        const bitMaterial = own(resources, createPointMaterial('base'));
        const coreMaterial = own(resources, createPointMaterial('power'));
        const bits = own(
            resources,
            new InstancedMesh(bitGeometry, bitMaterial, map.pickups.length)
        );
        const cores = own(
            resources,
            new InstancedMesh(
                coreGeometry,
                coreMaterial,
                map.pickups.filter((pickup) => pickup.kind === 'core').length
            )
        );
        bits.count = cores.count = 0;
        cores.frustumCulled = false;
        scene.add(bits, cores);

        const cameraTarget = { x: 0, y: 0 };
        camera.setBounds(sourceMap.widthInPixels, sourceMap.heightInPixels);
        camera.startFollow(cameraTarget, CAMERA.followLerp.x, CAMERA.followLerp.y);
        let lastPickupKey = '';
        const activeCores: Pickup[] = [];
        const instance = new Matrix4();

        return {
            resize: (width, height) =>
                resizeMultiplayerViewport(renderer, camera, width, height),
            sync: (
                connection,
                predictedTick,
                presentationTick,
                localPresentation,
                now,
                pendingInputs
            ) => {
                if (connection.map?.id !== map.id || !connection.race) {
                    return { discontinuity: false };
                }
                const discontinuity = syncActors(
                    connection.race,
                    connection.raceHistory,
                    map,
                    connection.playerId,
                    predictedTick,
                    presentationTick,
                    localPresentation,
                    now,
                    pendingInputs,
                    players,
                    cameraTarget
                );
                const acknowledgedInput = connection.race.players.find(
                    (player) => player.id === connection.playerId
                )?.acknowledgedInput;
                const pickupKey = `${connection.race.matchId}:${connection.race.refill}:${connection.race.pickups.length}`;
                if (pickupKey !== lastPickupKey) {
                    lastPickupKey = pickupKey;
                    bits.count = 0;
                    activeCores.length = 0;
                    for (const pickup of connection.race.pickups) {
                        if (pickup.kind === 'core') {
                            activeCores.push(pickup);
                            continue;
                        }
                        const cell = map.cells[pickup.cell];
                        setPointTransform(
                            instance,
                            'base',
                            (cell.x + 0.5) * TILE_SIZE,
                            (cell.y + 0.5) * TILE_SIZE
                        );
                        bits.setMatrixAt(bits.count++, instance);
                    }
                    cores.count = activeCores.length;
                    bits.instanceMatrix.needsUpdate = true;
                    bits.computeBoundingSphere();
                }
                activeCores.forEach((pickup, index) => {
                    const cell = map.cells[pickup.cell];
                    setPointTransform(
                        instance,
                        'power',
                        (cell.x + 0.5) * TILE_SIZE,
                        (cell.y + 0.5) * TILE_SIZE,
                        now / 1000
                    );
                    cores.setMatrixAt(index, instance);
                });
                if (cores.count > 0) cores.instanceMatrix.needsUpdate = true;
                return { acknowledgedInput, discontinuity };
            },
            snapCamera: () => camera.snapToFollowTarget(),
            prepare: async () => {
                camera.present(1, renderer.pixelRatio);
                await renderer.prepare(scene, camera.camera);
            },
            render: (elapsedMs) => {
                const frameTicks = clamp(elapsedMs, 0, 250) / RACE.stepMs;
                camera.startFollow(
                    cameraTarget,
                    1 - (1 - CAMERA.followLerp.x) ** frameTicks,
                    1 - (1 - CAMERA.followLerp.y) ** frameTicks
                );
                camera.update();
                camera.present(1, renderer.pixelRatio);
                for (const { packet, labels } of players) {
                    if (packet.group.visible) {
                        packet.faceCamera(camera.camera);
                        labels.faceCamera(camera.camera);
                    }
                }
                renderer.recordFrame(elapsedMs, true);
                renderer.render(scene, camera.camera);
            },
            suspend: () => renderer.recordFrame(0, false),
            dispose: () => {
                if (disposed) return;
                disposed = true;
                while (cleanups.length > 0) cleanups.pop()?.();
            },
        };
    } catch (error) {
        while (cleanups.length > 0) cleanups.pop()?.();
        throw error;
    }
}

/** Maps authoritative identities and effects to solo Packet variants without changing gameplay. */
function syncActors(
    race: RaceSnapshot,
    history: readonly RaceSnapshot[],
    map: RaceMap,
    localId: string | null,
    predictedTick: number,
    presentationTick: number,
    localPresentation: LocalMovementPresentation,
    now: number,
    pendingInputs: readonly PredictedInput[],
    players: PlayerModel[],
    cameraTarget: { x: number; y: number }
): boolean {
    const interpolationTick =
        race.phase === 'playing'
            ? Math.min(race.tick, presentationTick - INTERPOLATION_TICKS)
            : race.tick;
    let discontinuity = false;
    for (const model of players) model.packet.group.visible = false;
    race.players.forEach((player) => {
        const model = players.find((candidate) => candidate.color === player.color);
        if (!model) return;
        const { packet } = model;
        const local =
            player.id === localId
                ? localPresentation.sample(map, race, player, predictedTick, pendingInputs, now)
                : null;
        const movement = local?.movement ?? player.movement;
        const point = local
            ? local.point
            : interpolateRemotePosition(history, interpolationTick, player.id, false, map) ??
              position(map, movement);
        packet.group.position.set((point.x + 0.5) * TILE_SIZE, 0, (point.y + 0.5) * TILE_SIZE);
        packet.group.visible = player.connected;
        model.labels.setIdentity(player.name, player.score);
        packet.setScore(player.score);
        const portalVisible = (player.portalBlinkMs ?? 0) <= 0
            || Math.floor((PACKET_PORTAL_BLINK.durationMs - (player.portalBlinkMs ?? 0))
                / PACKET_PORTAL_BLINK.intervalMs) % 2 === 0;
        const recoveryVisible = sampleBlinkCadence(PACKET_DEATH_RECOVERY.durationMs - player.protectionMs,
            PACKET_DEATH_RECOVERY.durationMs, PACKET_DEATH_RECOVERY).visible;
        packet.model.visible =
            player.deathMs > 0 ||
            (player.protectionMs > 0 ? recoveryVisible : portalVisible);
        packet.setDeathProgress(player.deathMs > 0 ? 1 - player.deathMs / RACE.deathMs : null);
        packet.setPower(player.huntMs > 0, player.huntMs > 0 && player.huntMs <= ENEMY_SCARED_WARNING_DURATION_MS);
        packet.setMotion(
            movement.direction === 'right' ? 1 : movement.direction === 'left' ? -1 : 0,
            movement.direction === 'down' ? 1 : movement.direction === 'up' ? -1 : 0,
            movement.to !== null && player.deathMs <= 0 ? 1 : 0
        );
        packet.sample(now / 1000);
        if (player.id === localId) {
            cameraTarget.x = packet.group.position.x;
            cameraTarget.y = packet.group.position.z;
            discontinuity = local?.discontinuity ?? false;
        }
    });
    return discontinuity;
}

function own<T extends { dispose(): void }>(resources: Set<{ dispose(): void }>, resource: T): T {
    resources.add(resource);
    return resource;
}

/** Rejects startup immediately on cancellation without waiting for an uncancellable GPU promise. */
function waitForAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
    if (signal.aborted) return Promise.reject(abortError(signal));
    return new Promise<T>((resolve, reject) => {
        const abort = () => reject(abortError(signal));
        signal.addEventListener('abort', abort, { once: true });
        void promise.then(
            (value) => {
                signal.removeEventListener('abort', abort);
                resolve(value);
            },
            (error: unknown) => {
                signal.removeEventListener('abort', abort);
                reject(error instanceof Error ? error : new Error('Unable to prepare presentation.'));
            }
        );
    });
}

function abortError(signal: AbortSignal): Error {
    return signal.reason instanceof Error
        ? signal.reason
        : new DOMException('Presentation cancelled.', 'AbortError');
}

const browserDependencies: MultiplayerPresentationDependencies = {
    loadMap: (signal) =>
        new TiledMapRepository().loadMap(
            resolveMapPathsForVariant('default').mapJsonPath,
            signal
        ),
    createStage: createThreeStage,
    now: () => performance.now(),
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (frame) => cancelAnimationFrame(frame),
    isHidden: () => document.hidden,
    observeVisibility: (callback) => {
        document.addEventListener('visibilitychange', callback);
        return () => document.removeEventListener('visibilitychange', callback);
    },
    observeWindowResize: (callback) => {
        window.addEventListener('resize', callback);
        return () => window.removeEventListener('resize', callback);
    },
    observeElementResize: (element, callback) => {
        if (typeof ResizeObserver === 'undefined') return () => undefined;
        const observer = new ResizeObserver(callback);
        observer.observe(element);
        return () => observer.disconnect();
    },
};
