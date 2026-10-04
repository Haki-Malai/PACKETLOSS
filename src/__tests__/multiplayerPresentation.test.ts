import { MultiplayerSynchronization } from '../game/simulation/MultiplayerSynchronization';
import { describe, expect, it, vi } from 'vitest';
import type { MultiplayerConnectionSnapshot } from '../game/infrastructure/adapters/MultiplayerSocketClient';
import { DataRace } from '../game/simulation/DataRace';
import { RACE } from '../game/simulation/types';
import {
    battleRoyaleFollowPlayerId,
    MultiplayerPresentationSession,
    resizeMultiplayerViewport,
    type MultiplayerPresentationDependencies,
    type MultiplayerPresentationStage,
} from '../game/ui/MultiplayerPresentation';
import { createCollisionTile, createMapFixture } from './fixtures/renderFixtures';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

function deferred<T>() {
    let resolve!: (_value: T | PromiseLike<T>) => void;
    let reject!: (_error: unknown) => void;
    const promise = new Promise<T>((done, fail) => {
        resolve = done;
        reject = fail;
    });
    return { promise, resolve, reject };
}

function connection(tick = 10): MultiplayerConnectionSnapshot {
    const map = dataRaceFixture();
    const race = new DataRace(
        map,
        'presentation-match',
        [
            { id: 'alice', name: 'Alice' },
            { id: 'bob', name: 'Bob' },
        ],
        7
    );
    while (race.tick < tick) race.step();
    const snapshot = race.snapshot();
    return {
        phase: 'connected', stalled: false, recoverable: true,
        playerId: snapshot.players[0].id,
        room: null,
        map,
        race: snapshot,
        raceHistory: [snapshot],
        receivedAtMs: tick * 10,
        serverTimeMs: null,
        latencyMs: 40,
        instanceRunId: 'run',
        processGeneration: 'generation',
        warning: null,
        message: '',
    };
}

function createHarness(
    prepare: () => Promise<void> = () => Promise.resolve(),
    isReducedMotion: () => boolean = () => false
) {
    let latest = connection();
    let now = 100;
    let hidden = false;
    let nextFrame = 0;
    let visibilityChanged: () => void = () => undefined;
    let elementResized: () => void = () => undefined;
    const frames = new Map<number, FrameRequestCallback>();
    const operations: string[] = [];
    const cleanupVisibility = vi.fn();
    const cleanupWindowResize = vi.fn();
    const cleanupElementResize = vi.fn();
    const stage = {
        resize: vi.fn((width: number, height: number) => {
            operations.push(`resize:${width}x${height}`);
        }),
        sync: vi.fn<MultiplayerPresentationStage['sync']>((snapshot) => {
            operations.push(`sync:${snapshot.race?.tick ?? 'none'}`);
            return { discontinuity: false };
        }),
        snapCamera: vi.fn(() => operations.push('snap')),
        prepare: vi.fn(async () => {
            operations.push('prepare');
            await prepare();
        }),
        render: vi.fn((elapsedMs: number) => operations.push(`render:${elapsedMs}`)),
        suspend: vi.fn(() => operations.push('suspend')),
        dispose: vi.fn(() => operations.push('dispose')),
    } satisfies MultiplayerPresentationStage;
    const { map: sourceMap } = createMapFixture([[createCollisionTile()]]);
    const dependencies = {
        loadMap: vi.fn(() => Promise.resolve(sourceMap)),
        createStage: vi.fn(() => stage),
        now: () => now,
        requestFrame: vi.fn((callback: FrameRequestCallback) => {
            const id = ++nextFrame;
            frames.set(id, callback);
            return id;
        }),
        cancelFrame: vi.fn((id: number) => frames.delete(id)),
        isHidden: () => hidden,
        observeVisibility: vi.fn((callback: () => void) => {
            visibilityChanged = callback;
            return cleanupVisibility;
        }),
        observeWindowResize: vi.fn(() => cleanupWindowResize),
        observeElementResize: vi.fn((_element: HTMLElement, callback: () => void) => {
            elementResized = callback;
            return cleanupElementResize;
        }),
    } satisfies MultiplayerPresentationDependencies;
    const root = {
        getBoundingClientRect: () => ({ width: 1280, height: 720 }),
    } as HTMLElement;
    const onError = vi.fn();
    const activeMap = latest.map;
    if (!activeMap) throw new Error('Expected a multiplayer map.');
    const synchronization = new MultiplayerSynchronization();
    let publication = 0;
    let accepted: typeof latest.race = null;
    const session = new MultiplayerPresentationSession(
        {
            canvas: {} as HTMLCanvasElement,
            root,
            map: activeMap,
            synchronization,
            getConnectionSnapshot: () => {
                if (latest.race && latest.map && latest.race !== accepted) {
                    synchronization.acceptSnapshot(latest.map, latest.race, latest.playerId, ++publication, now);
                    accepted = latest.race;
                }
                return latest;
            },
            isReducedMotion,
            onError,
        },
        dependencies
    );
    return {
        session,
        stage,
        dependencies,
        frames,
        operations,
        onError,
        setLatest: (snapshot: MultiplayerConnectionSnapshot) => {
            latest = snapshot;
        },
        setNow: (value: number) => {
            now = value;
        },
        setHidden: (value: boolean) => {
            hidden = value;
        },
        visibilityChanged: () => visibilityChanged(),
        elementResized: () => elementResized(),
        cleanupVisibility,
        cleanupWindowResize,
        cleanupElementResize,
        advanceFrame: (timestamp: number) => {
            const frame = frames.entries().next().value;
            if (!frame) throw new Error('No frame is scheduled.');
            frames.delete(frame[0]);
            frame[1](timestamp);
        },
    };
}

describe('multiplayer presentation lifecycle', () => {
    it('passes the current app motion preference into every scene sample', async () => {
        const harness = createHarness(() => Promise.resolve(), () => true);
        await harness.session.ready;
        const calls = harness.stage.sync.mock.calls;
        expect(calls[calls.length - 1]?.[3]).toBe(true);
        harness.session.dispose();
    });

    it('shows the local death effect before following the lowest-slot survivor', () => {
        const state = connection().race!;
        const local = state.players[0];
        const survivor = state.players[1];
        local.eliminatedAtTick = state.playTicks;
        local.deathMs = RACE.deathMs;
        expect(battleRoyaleFollowPlayerId(state, local.id)).toBe(local.id);
        local.deathMs = 0;
        expect(battleRoyaleFollowPlayerId(state, local.id)).toBe(survivor.id);
        survivor.eliminatedAtTick = state.playTicks;
        expect(battleRoyaleFollowPlayerId(state, local.id)).toBeNull();
    });

    it('syncs the actor before preparing, then samples the latest state before the first frame', async () => {
        const preparation = deferred<void>();
        const harness = createHarness(() => preparation.promise);
        await Promise.resolve();
        await Promise.resolve();
        expect(harness.operations).toEqual([
            'resize:1280x720',
            'sync:10',
            'snap',
            'prepare',
        ]);
        expect(harness.stage.render).not.toHaveBeenCalled();

        harness.setLatest(connection(12));
        harness.setNow(140);
        preparation.resolve();
        await harness.session.ready;

        expect(harness.operations).toEqual([
            'resize:1280x720',
            'sync:10',
            'snap',
            'prepare',
            'sync:12',
            'snap',
            'render:0',
        ]);
        expect(harness.frames.size).toBe(1);
        harness.session.dispose();
    });

    it('releases a partially prepared session immediately and only once when cancelled', async () => {
        const preparation = deferred<void>();
        const harness = createHarness(() => preparation.promise);
        await Promise.resolve();
        await Promise.resolve();
        const readiness = harness.session.ready;
        harness.session.dispose();
        harness.session.dispose();

        await expect(readiness).rejects.toMatchObject({ name: 'AbortError' });
        expect(harness.stage.dispose).toHaveBeenCalledOnce();
        expect(harness.cleanupVisibility).toHaveBeenCalledOnce();
        expect(harness.cleanupWindowResize).toHaveBeenCalledOnce();
        expect(harness.cleanupElementResize).toHaveBeenCalledOnce();
        expect(harness.frames.size).toBe(0);
        preparation.resolve();
    });

    it('rejects readiness and releases partial resources once when preparation fails', async () => {
        const harness = createHarness(() => Promise.reject(new Error('Shader preparation failed')));

        await expect(harness.session.ready).rejects.toThrow('Shader preparation failed');
        harness.session.dispose();
        expect(harness.stage.dispose).toHaveBeenCalledOnce();
        expect(harness.cleanupVisibility).toHaveBeenCalledOnce();
        expect(harness.cleanupWindowResize).toHaveBeenCalledOnce();
        expect(harness.cleanupElementResize).toHaveBeenCalledOnce();
        expect(harness.frames.size).toBe(0);
    });

    it('suspends while hidden and resumes one loop with fresh timing and a camera snap', async () => {
        const harness = createHarness();
        await harness.session.ready;
        expect(harness.frames.size).toBe(1);

        harness.setHidden(true);
        harness.visibilityChanged();
        expect(harness.stage.suspend).toHaveBeenCalledOnce();
        expect(harness.frames.size).toBe(0);

        harness.setHidden(false);
        harness.visibilityChanged();
        harness.visibilityChanged();
        expect(harness.frames.size).toBe(1);
        const snaps = harness.stage.snapCamera.mock.calls.length;
        harness.advanceFrame(5_000);
        expect(harness.stage.render).toHaveBeenLastCalledWith(0);
        expect(harness.stage.snapCamera).toHaveBeenCalledTimes(snaps + 1);
        expect(harness.frames.size).toBe(1);
        harness.session.dispose();
    });

    it('disposes the active loop when a later frame fails', async () => {
        const harness = createHarness();
        await harness.session.ready;
        harness.stage.render.mockImplementationOnce(() => {
            throw new Error('WebGL context failed');
        });
        harness.advanceFrame(116);

        expect(harness.onError).toHaveBeenCalledWith(expect.objectContaining({
            message: 'WebGL context failed',
        }));
        expect(harness.stage.dispose).toHaveBeenCalledOnce();
        expect(harness.frames.size).toBe(0);
    });

    it('uses the shared 1080p zoom policy and ignores unusable resize measurements', () => {
        const renderer = {
            width: 1,
            height: 1,
            resize: vi.fn((width: number, height: number) => {
                renderer.width = Math.round(width);
                renderer.height = Math.round(height);
            }),
        };
        const camera = { setViewport: vi.fn(), setZoom: vi.fn() };

        resizeMultiplayerViewport(renderer, camera, 1920, 1080);
        expect(camera.setViewport).toHaveBeenLastCalledWith(1920, 1080);
        expect(camera.setZoom).toHaveBeenLastCalledWith(5);
        resizeMultiplayerViewport(renderer, camera, 1280, 720);
        expect(camera.setZoom).toHaveBeenLastCalledWith(10 / 3);
        resizeMultiplayerViewport(renderer, camera, 0, Number.NaN);
        expect(renderer.resize).toHaveBeenCalledTimes(2);
    });
});
