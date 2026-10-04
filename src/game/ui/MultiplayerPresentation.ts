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
import {
    battleArenaMapAtStage,
    battleArenaOuterBounds,
    createBattleArenaWorldMap,
} from '../simulation/BattleArenaMap';
import { sampleBlinkCadence } from '../shared/blinkCadence';
import type { MultiplayerSynchronization, MultiplayerRenderState } from '../simulation/MultiplayerSynchronization';
import {
    RACE,
    type Pickup,
    type RaceMap,
    type RaceSnapshot,
} from '../simulation/types';


interface PlayerModel {
    color: string;
    packet: HologramPacket;
    labels: PacketLabels;
}

export interface MultiplayerPresentationStage {
    resize(_width: number, _height: number): void;
    sync(
        _connection: MultiplayerConnectionSnapshot,
        _frame: MultiplayerRenderState,
        _now: number,
        _reducedMotion: boolean
    ): { acknowledgedInput?: number; discontinuity: boolean };
    snapCamera(): void;
    prepare(): Promise<void>;
    render(_elapsedMs: number): void;
    suspend(): void;
    dispose(): void;
}

export interface MultiplayerPresentationDependencies {
    loadMap(_map: RaceMap, _signal: AbortSignal): Promise<WorldMapData>;
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

/** Keeps the local death effect in view, then follows the lowest-slot survivor. */
export function battleRoyaleFollowPlayerId(
    race: RaceSnapshot,
    localPlayerId: string | null
): string | null {
    const localPlayer = race.players.find((player) => player.id === localPlayerId);
    if (localPlayer && (localPlayer.eliminatedAtTick === null || localPlayer.deathMs > 0)) {
        return localPlayer.id;
    }
    return [...race.players]
        .filter((player) => player.eliminatedAtTick === null)
        .sort((left, right) => left.slot - right.slot)[0]?.id ?? null;
}

export interface MultiplayerPresentationOptions {
    canvas: HTMLCanvasElement;
    root: HTMLElement;
    map: RaceMap;
    getConnectionSnapshot(): MultiplayerConnectionSnapshot;
    synchronization: MultiplayerSynchronization;
    isReducedMotion?(): boolean;
    onError?(_error: unknown): void;
}

/** Owns multiplayer rendering resources, display-frame scheduling, and disposal. */
export class MultiplayerPresentationSession {
    readonly ready: Promise<void>;

    private readonly abort = new AbortController();
    private readonly cleanups: Array<() => void> = [];
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

    /** Clears timing and correction history after match, connection, or visibility transitions. */
    reset(): void {
        if (this.disposed) return;
        this.options.synchronization.resetPresentation();
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
        const sourceMap = await this.dependencies.loadMap(this.options.map, this.abort.signal);
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
        const frame = this.options.synchronization.sample(now);
        if (!frame) return false;
        return stage.sync(connection, frame, now,
            this.options.isReducedMotion?.()
                ?? globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
        ).discontinuity;
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
        const camera = new Camera3D({ clampToBounds: !map.arena });
        const scene = new Scene();
        cleanups.push(() => scene.clear());
        let maze = new MazeScene({
            map: sourceMap,
            pulsingPerimeter: map.arena ? battleArenaOuterBounds(0) : undefined,
            nextMap: map.arena ? createBattleArenaWorldMap(map, 1) : undefined,
        });
        cleanups.push(() => maze.dispose());
        let stagedMap = battleArenaMapAtStage(map, 0);
        let renderedStage = 0;
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
        let followedPlayerId: string | null = null;
        const activeCores: Pickup[] = [];
        const instance = new Matrix4();

        return {
            resize: (width, height) =>
                resizeMultiplayerViewport(renderer, camera, width, height),
            sync: (
                connection,
                frame,
                now,
                reducedMotion
            ) => {
                if (connection.map?.id !== map.id || !connection.race) {
                    return { discontinuity: false };
                }
                const race = connection.race;
                const presentationTick = frame.presentationTick;
                if (race.shrinkStage !== renderedStage) {
                    renderedStage = race.shrinkStage;
                    stagedMap = battleArenaMapAtStage(map, renderedStage);
                    scene.remove(maze.group);
                    maze.dispose();
                    maze = new MazeScene({
                        map: createBattleArenaWorldMap(map, renderedStage),
                        pulsingPerimeter: map.arena ? battleArenaOuterBounds(renderedStage) : undefined,
                        nextMap: map.arena && renderedStage < RACE.maxShrinkStage
                            ? createBattleArenaWorldMap(map, renderedStage + 1) : undefined,
                    });
                    scene.add(maze.group);
                    lastPickupKey = '';
                }
                if (map.arena) {
                    const warningActive = race.phase === 'playing' && race.shrinkStage < RACE.maxShrinkStage;
                    const cycleTicks = race.playTicks - race.shrinkStage * RACE.shrinkEveryTicks
                        + Math.max(0, presentationTick - race.tick);
                    maze.syncPerimeterWarning(
                        warningActive ? cycleTicks * RACE.stepMs : null,
                        RACE.shrinkEveryTicks * RACE.stepMs,
                        reducedMotion
                    );
                }
                const nextFollowedPlayerId = battleRoyaleFollowPlayerId(
                    race,
                    connection.playerId
                );
                let discontinuity = nextFollowedPlayerId !== followedPlayerId;
                followedPlayerId = nextFollowedPlayerId;
                discontinuity = syncActors(frame, followedPlayerId, now, players, cameraTarget) || discontinuity;
                const acknowledgedInput = connection.race.players.find(
                    (player) => player.id === connection.playerId
                )?.acknowledgedInput;
                const pickupKey = `${connection.race.matchId}:${connection.race.shrinkStage}:${connection.race.refill}:${connection.race.pickups.length}`;
                if (pickupKey !== lastPickupKey) {
                    lastPickupKey = pickupKey;
                    bits.count = 0;
                    activeCores.length = 0;
                    for (const pickup of connection.race.pickups) {
                        if (pickup.kind === 'core') {
                            activeCores.push(pickup);
                            continue;
                        }
                        const cell = stagedMap.cells[pickup.cell];
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
                    const cell = stagedMap.cells[pickup.cell];
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
    frame: MultiplayerRenderState,
    followedPlayerId: string | null,
    now: number,
    players: PlayerModel[],
    cameraTarget: { x: number; y: number }
): boolean {
    let discontinuity = false;
    for (const model of players) model.packet.group.visible = false;
    for (const { player, point, moving, discontinuity: actorDiscontinuity } of frame.actors.values()) {
        const model = players.find((candidate) => candidate.color === player.color);
        if (!model) continue;
        const { packet } = model;
        const movement = player.movement;
        packet.group.position.set((point.x + 0.5) * TILE_SIZE, 0, (point.y + 0.5) * TILE_SIZE);
        packet.group.visible = player.eliminatedAtTick === null || player.deathMs > 0;
        model.labels.setIdentity(player.name, player.score);
        packet.setScore(player.score);
        const portalVisible = (player.portalBlinkMs ?? 0) <= 0
            || Math.floor((PACKET_PORTAL_BLINK.durationMs - (player.portalBlinkMs ?? 0))
                / PACKET_PORTAL_BLINK.intervalMs) % 2 === 0;
        const recoveryVisible = sampleBlinkCadence(PACKET_DEATH_RECOVERY.durationMs - player.protectionMs,
            PACKET_DEATH_RECOVERY.durationMs, PACKET_DEATH_RECOVERY).visible;
        packet.model.visible = player.deathMs > 0 || (player.protectionMs > 0 ? recoveryVisible : portalVisible);
        packet.setDeathProgress(player.deathMs > 0 ? 1 - player.deathMs / RACE.deathMs : null);
        packet.setPower(player.huntMs > 0, player.huntMs > 0 && player.huntMs <= ENEMY_SCARED_WARNING_DURATION_MS);
        packet.setMotion(
            movement.direction === 'right' ? 1 : movement.direction === 'left' ? -1 : 0,
            movement.direction === 'down' ? 1 : movement.direction === 'up' ? -1 : 0,
            moving ? 1 : 0
        );
        packet.sample(now / 1000);
        if (player.id === followedPlayerId) {
            cameraTarget.x = packet.group.position.x;
            cameraTarget.y = packet.group.position.z;
            discontinuity ||= actorDiscontinuity;
        }
    }
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
    loadMap: (map, signal) => map.arena
        ? Promise.resolve(createBattleArenaWorldMap(map, 0))
        : new TiledMapRepository().loadMap(
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
