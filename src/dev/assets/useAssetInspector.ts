import { useEffect, useRef, useState, type RefObject } from 'react';
import { ASSET_CATALOG, type AssetPreviewEntry } from './assetCatalog';
import { AssetPreviewSession } from './AssetPreviewSession';
import type {
    AssetPreviewViewport,
    PreviewCameraMode,
    PreviewTransform,
} from './AssetPreviewViewport';
import { PreviewPlayback } from './PreviewPlayback';

/**
 * Owns the gallery preview session, thumbnail generation, and playback synchronization.
 * Effect cleanup cancels scheduled frames, disconnects resize observation, and disposes the session.
 *
 * @param selected - Asset to inspect; a new selection resets playback and transforms.
 * @param thumbnails - Canvas targets keyed by catalog entry ID.
 * @param onReady - Stable callback notified when previews start loading and become usable.
 * @returns Mount refs, inspector state, and actions for preview playback and presentation.
 */
export function useAssetInspector(
    selected: AssetPreviewEntry,
    thumbnails: RefObject<Map<string, HTMLCanvasElement>>,
    onReady: (_ready: boolean) => void
) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const viewport = useRef<AssetPreviewViewport | null>(null);
    const [playback] = useState(() => new PreviewPlayback());
    const [attempt, setAttempt] = useState(0);
    const [ready, setReady] = useState(false);
    const [status, setStatus] = useState('Loading models…');
    const [failed, setFailed] = useState(false);
    const [camera, setCamera] = useState<PreviewCameraMode>('game');
    const [guide, setGuide] = useState(false);
    const [transform, setTransform] = useState<PreviewTransform>({
        rotation: 0,
        flipX: false,
        flipY: false,
    });
    const [clock, setClock] = useState({
        timeMs: 0,
        durationMs: 0,
        playing: false,
        speed: 1,
        loop: false,
    });
    const lastTimestamp = useRef<number | undefined>(undefined);

    useEffect(() => {
        const node = canvas.current;
        const container = stage.current;
        if (!node || !container) return;
        const session = new AssetPreviewSession(node);
        let active = true;
        let thumbnailFrame = 0;
        let finishThumbnailFrame: (() => void) | undefined;
        setReady(false);
        onReady(false);
        setFailed(false);
        setStatus('Loading models…');
        /** Fits the active preview to the inspector container's current dimensions. */
        const resize = () =>
            viewport.current?.resize(container.clientWidth, container.clientHeight);
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        /**
         * Loads the preview session and yields between thumbnails before enabling inspection.
         * Ignores cancelled work and disposes failed sessions before exposing an error state.
         */
        async function start() {
            try {
                const view = await session.start();
                if (!view || !active) return;
                view.resize(320, 224);
                let completed = 0;
                for (const entry of ASSET_CATALOG) {
                    if (!active) return;
                    const target = thumbnails.current.get(entry.id);
                    if (target) {
                        view.select(entry);
                        view.snapshot(target, entry.thumbnailMs);
                    }
                    completed += 1;
                    setStatus(`Preparing previews · ${completed} / ${ASSET_CATALOG.length}`);
                    // Yield between snapshots so a model-heavy gallery never monopolizes startup.
                    await new Promise<void>((resolve) => {
                        finishThumbnailFrame = resolve;
                        thumbnailFrame = window.requestAnimationFrame(() => {
                            thumbnailFrame = 0;
                            finishThumbnailFrame = undefined;
                            resolve();
                        });
                    });
                }
                if (!active) return;
                viewport.current = view;
                resize();
                setReady(true);
                onReady(true);
            } catch (error) {
                session.dispose();
                if (!active) return;
                setFailed(true);
                setStatus(
                    error instanceof Error ? error.message : 'The asset previews could not load.'
                );
            }
        }
        void start();
        return () => {
            active = false;
            observer.disconnect();
            window.cancelAnimationFrame(thumbnailFrame);
            finishThumbnailFrame?.();
            viewport.current = null;
            session.dispose();
        };
    }, [attempt, thumbnails, onReady]);

    useEffect(() => {
        playback.select(selected);
        lastTimestamp.current = undefined;
        setTransform({ rotation: 0, flipX: false, flipY: false });
        setClock({
            timeMs: playback.timeMs,
            durationMs: playback.durationMs,
            playing: playback.playing,
            speed: playback.speed,
            loop: playback.loop,
        });
        if (ready) viewport.current?.select(selected);
    }, [selected, playback, ready]);

    useEffect(() => {
        if (ready) viewport.current?.setCameraMode(camera);
    }, [camera, ready]);
    useEffect(() => {
        if (ready) viewport.current?.setTileGuide(guide);
    }, [guide, ready]);

    useEffect(() => {
        if (!ready) return;
        let frame = 0;
        lastTimestamp.current = undefined;
        /** Drops the previous timestamp so hidden-tab time is not added to playback. */
        const resetClock = () => {
            lastTimestamp.current = undefined;
        };
        /**
         * Advances visible playback, renders the preview, and schedules the next frame.
         *
         * @param timestamp - Animation-frame timestamp in milliseconds.
         */
        const tick = (timestamp: number) => {
            if (!document.hidden) {
                playback.advance(
                    lastTimestamp.current === undefined ? 0 : timestamp - lastTimestamp.current
                );
                viewport.current?.render(playback.timeMs);
                setClock((previous) =>
                    previous.timeMs === playback.timeMs && previous.playing === playback.playing
                        ? previous
                        : { ...previous, timeMs: playback.timeMs, playing: playback.playing }
                );
                lastTimestamp.current = timestamp;
            } else resetClock();
            frame = window.requestAnimationFrame(tick);
        };
        document.addEventListener('visibilitychange', resetClock);
        frame = window.requestAnimationFrame(tick);
        return () => {
            window.cancelAnimationFrame(frame);
            document.removeEventListener('visibilitychange', resetClock);
        };
    }, [ready, playback]);

    /**
     * Applies a playback action and immediately synchronizes the controls with its new state.
     * Resets frame timing so elapsed time before the action is not applied afterward.
     *
     * @param action - Mutation to apply to the owned playback controller.
     */
    function control(action: () => void) {
        action();
        lastTimestamp.current = undefined;
        setClock({
            timeMs: playback.timeMs,
            durationMs: playback.durationMs,
            playing: playback.playing,
            speed: playback.speed,
            loop: playback.loop,
        });
    }

    return {
        canvas,
        stage,
        viewport,
        clock,
        ready,
        status,
        failed,
        camera,
        guide,
        transform,
        /** Disposes the previous preview session through effect cleanup and retries loading. */
        retry: () => setAttempt((value) => value + 1),
        /** Toggles playback and refreshes the displayed control state. */
        toggle: () => control(() => playback.toggle()),
        /** Restarts playback from the beginning of the selected preview. */
        replay: () => control(() => playback.replay()),
        /**
         * Seeks the selected preview and synchronizes its timeline controls.
         *
         * @param time - Requested position in milliseconds, clamped by the playback controller.
         */
        seek: (time: number) => control(() => playback.seek(time)),
        /**
         * Changes playback speed without applying elapsed time from before the change.
         *
         * @param speed - Multiplier applied to elapsed preview time.
         */
        setSpeed: (speed: number) =>
            control(() => {
                playback.speed = speed;
            }),
        /** Sets whether playback wraps at the end of the selected preview. */
        setLoop: (loop: boolean) =>
            control(() => {
                playback.loop = loop;
            }),
        setCamera,
        setGuide,
        /** Restores the game camera preset and clears interactive camera adjustments. */
        resetCamera: () => {
            setCamera('game');
            viewport.current?.resetCamera();
        },
        /** Updates the selected asset's rotation and flips while preserving playback position. */
        setTransform: (next: PreviewTransform) => {
            setTransform(next);
            viewport.current?.select(selected, next);
        },
    };
}
