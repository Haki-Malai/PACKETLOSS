import { useEffect, useRef, useState, type ComponentProps, type RefObject } from 'react';
import { MenuButton, buttonLayout, fieldLayout, inputLayout } from '../../game/ui/MenuPanel';
import { LocalProfileStore } from '../../game/infrastructure/adapters/LocalProfileStore';
import { ASSET_CATALOG, type AssetPreviewEntry } from './assetCatalog';
import type { PreviewCameraMode } from './AssetPreviewViewport';
import { useAssetInspector } from './useAssetInspector';

/** Development entrypoint; importing it never constructs or resets a game. */
export default function AssetShowcase() {
    const [selected, setSelected] = useState(ASSET_CATALOG[0]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [ready, setReady] = useState(false);
    const [motion] = useState(() => new LocalProfileStore().getMotion());
    const thumbnails = useRef(new Map<string, HTMLCanvasElement>());
    useEffect(() => {
        const previousTitle = document.title;
        document.title = 'Asset Lab · PACKETLOSS';
        return () => {
            document.title = previousTitle;
        };
    }, []);
    const query = search.trim().toLocaleLowerCase();
    const visible = new Set(
        ASSET_CATALOG.filter(
            (entry) =>
                (!category || entry.category === category) &&
                `${entry.name} ${entry.state} ${entry.source} ${entry.category}`
                    .toLocaleLowerCase()
                    .includes(query)
        ).map((entry) => entry.id)
    );
    return (
        <div
            className="game-shell flex h-full flex-col overflow-y-auto bg-packet-void pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] text-packet-text"
            data-menu-motion={motion}
        >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-packet-line px-4 py-5 min-[901px]:px-7">
                <div>
                    <p className="packet-eyebrow">
                        PACKETLOSS{' '}
                        <span className="ml-3 border border-packet-line px-2 py-1 text-packet-muted">
                            LOCAL DEVELOPMENT
                        </span>
                    </p>
                    <h1 className="mt-2 font-heading text-2xl font-bold text-packet-gold min-[901px]:text-3xl">
                        Asset Lab<span className="text-packet-cyan">.</span>
                    </h1>
                    <p className="mt-1 hidden text-sm text-packet-muted min-[901px]:block">
                        The game’s assets. Room to look closer.
                    </p>
                </div>
                <a
                    className={`packet-button shrink-0 px-4 py-3 no-underline ${buttonLayout}`}
                    data-action="game"
                    href={new URL(import.meta.env.BASE_URL, window.location.origin).href}
                >
                    Back to game ↗
                </a>
            </header>
            <div className="flex flex-col min-[901px]:grid min-[901px]:min-h-0 min-[901px]:flex-1 min-[901px]:grid-cols-[minmax(320px,1fr)_minmax(420px,1.2fr)]">
                <section
                    className="min-h-0 border-t border-packet-line p-4 min-[901px]:overflow-y-auto min-[901px]:border-t-0 min-[901px]:border-r min-[901px]:p-5"
                    aria-label="Asset gallery"
                >
                    <div className="flex gap-3">
                        <label className={`${fieldLayout} flex-1`}>
                            Search assets
                            <input
                                className={inputLayout}
                                type="search"
                                placeholder="Player, scared, wall…"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </label>
                        <label className={fieldLayout}>
                            Category
                            <select
                                className={inputLayout}
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                            >
                                <option value="">All assets</option>
                                {['Player', 'Enemies', 'Points', 'Walls', 'Other'].map((value) => (
                                    <option key={value}>{value}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <p className="my-4 text-xs text-packet-muted">
                        {visible.size} of {ASSET_CATALOG.length} previews
                    </p>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
                        {ASSET_CATALOG.map((entry) => (
                            <button
                                key={entry.id}
                                type="button"
                                className="overflow-hidden border border-packet-line bg-packet-surface text-left transition-colors hover:border-packet-cyan disabled:cursor-default disabled:opacity-45 aria-pressed:border-packet-focus aria-pressed:ring-1 aria-pressed:ring-packet-focus"
                                hidden={!visible.has(entry.id)}
                                disabled={!ready}
                                aria-label={`${entry.name}, ${entry.state}`}
                                aria-pressed={selected.id === entry.id}
                                onClick={() => setSelected({ ...entry })}
                            >
                                <canvas
                                    ref={(node) => {
                                        if (node) thumbnails.current.set(entry.id, node);
                                        else thumbnails.current.delete(entry.id);
                                    }}
                                    width={320}
                                    height={224}
                                    aria-hidden="true"
                                    className="aspect-10/7 w-full bg-packet-void"
                                />
                                <span className="grid gap-1 p-3">
                                    <span className="text-xs tracking-wider text-packet-muted uppercase">
                                        {entry.category}
                                    </span>
                                    <span className="font-heading text-sm font-semibold">
                                        {entry.name}
                                    </span>
                                    <span className="text-xs text-packet-cyan">{entry.state}</span>
                                    <span
                                        className="truncate text-xs text-packet-muted"
                                        title={entry.source}
                                    >
                                        {entry.source.slice(entry.source.lastIndexOf('/') + 1)}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                    {visible.size === 0 && (
                        <p className="py-12 text-center text-sm text-packet-muted">
                            No assets match this search.
                        </p>
                    )}
                </section>
                <AssetInspector selected={selected} thumbnails={thumbnails} onReady={setReady} />
            </div>
        </div>
    );
}

function AssetButton(props: ComponentProps<typeof MenuButton>) {
    return <MenuButton {...props} layout="compact" />;
}

function AssetInspector({
    selected,
    thumbnails,
    onReady,
}: {
    selected: AssetPreviewEntry;
    thumbnails: RefObject<Map<string, HTMLCanvasElement>>;
    onReady: (_ready: boolean) => void;
}) {
    const p = useAssetInspector(selected, thumbnails, onReady);
    const animated = selected.durationMs > 0;
    const inlineLabel = 'flex items-center gap-2 text-xs text-packet-muted';
    const selectStyle =
        'min-h-12 border border-packet-line bg-packet-raised px-2 text-sm text-packet-text';
    const checkbox = 'size-4 accent-packet-focus';
    return (
        <section
            className="order-first flex min-h-0 min-w-0 flex-col p-4 min-[901px]:order-none min-[901px]:overflow-y-auto min-[901px]:p-5"
            aria-label="Asset inspector"
        >
            <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
                <div>
                    <p className="packet-eyebrow">{selected.category}</p>
                    <h2 className="mt-1 font-heading text-xl font-semibold">{selected.name}</h2>
                    <p className="mt-1 text-xs break-all text-packet-muted">{selected.source}</p>
                </div>
                <span className="shrink-0 border border-packet-cyan px-3 py-1 text-xs text-packet-cyan">
                    {selected.state}
                </span>
            </div>
            <div
                ref={p.stage}
                className="relative h-[min(48vh,420px)] min-h-60 overflow-hidden border border-packet-line bg-packet-void min-[901px]:flex-1"
            >
                <canvas
                    ref={p.canvas}
                    className={`absolute inset-0 size-full touch-none ${p.ready ? '' : 'invisible'}`}
                    aria-label="Interactive 3D asset preview"
                />
                {!p.ready && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-packet-void px-6 text-center text-sm text-packet-muted">
                        <p role={p.failed ? 'alert' : 'status'}>{p.status}</p>
                        {p.failed && <AssetButton onClick={p.retry}>Retry loading</AssetButton>}
                    </div>
                )}
                <span className="pointer-events-none absolute bottom-3 left-3 bg-packet-void/80 px-2 py-1 text-xs text-packet-muted">
                    {p.camera === 'orbit'
                        ? 'Orbit · Drag to rotate · Scroll to zoom'
                        : 'Game camera · Scroll to zoom'}
                </span>
            </div>
            <fieldset className="mt-4 shrink-0" disabled={!p.ready}>
                <legend className="sr-only">Inspector controls</legend>
                <div className="flex flex-wrap items-center gap-2">
                    <AssetButton
                        variant="primary"
                        onClick={p.toggle}
                        disabled={!animated}
                        aria-pressed={p.clock.playing}
                    >
                        {p.clock.playing ? 'Pause' : 'Play'}
                    </AssetButton>
                    <AssetButton onClick={p.replay} disabled={!animated}>
                        Replay
                    </AssetButton>
                    <label className={inlineLabel}>
                        Speed
                        <select
                            className={selectStyle}
                            disabled={!animated}
                            value={p.clock.speed}
                            onChange={(event) => p.setSpeed(Number(event.target.value))}
                        >
                            {[0.25, 0.5, 1, 2].map((value) => (
                                <option key={value} value={value}>
                                    {value}×
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={`${inlineLabel} min-h-12 px-1`}>
                        <input
                            className={checkbox}
                            type="checkbox"
                            disabled={!animated}
                            checked={p.clock.loop}
                            onChange={(event) => p.setLoop(event.target.checked)}
                        />
                        Loop
                    </label>
                </div>
                <label className="my-4 block text-xs text-packet-muted">
                    <span className="mb-1.5 flex justify-between">
                        Timeline
                        <output className="tabular-nums">
                            {(p.clock.timeMs / 1000).toFixed(2)} /{' '}
                            {(p.clock.durationMs / 1000).toFixed(2)} s
                        </output>
                    </span>
                    <input
                        aria-label="Timeline"
                        className="min-h-11 w-full accent-packet-focus"
                        type="range"
                        min={0}
                        max={p.clock.durationMs}
                        step={1}
                        value={p.clock.timeMs}
                        disabled={!animated}
                        onChange={(event) => p.seek(Number(event.target.value))}
                    />
                </label>
                <div className="flex flex-wrap items-center gap-2 border-t border-packet-line pt-3">
                    <label className={inlineLabel}>
                        Camera
                        <select
                            className={selectStyle}
                            value={p.camera}
                            onChange={(event) =>
                                p.setCamera(event.target.value as PreviewCameraMode)
                            }
                        >
                            <option value="game">Game View</option>
                            <option value="orbit">Orbit</option>
                        </select>
                    </label>
                    <AssetButton onClick={() => p.viewport.current?.fit()}>Fit</AssetButton>
                    <AssetButton onClick={() => p.viewport.current?.actualSize()}>
                        Game scale
                    </AssetButton>
                    <AssetButton
                        aria-label="Zoom out"
                        onClick={() => p.viewport.current?.zoomBy(0.8)}
                    >
                        −
                    </AssetButton>
                    <AssetButton
                        aria-label="Zoom in"
                        onClick={() => p.viewport.current?.zoomBy(1.25)}
                    >
                        +
                    </AssetButton>
                    <AssetButton onClick={p.resetCamera}>Reset view</AssetButton>
                    <label className={`${inlineLabel} min-h-12 px-1`}>
                        <input
                            className={checkbox}
                            type="checkbox"
                            checked={p.guide}
                            onChange={(event) => p.setGuide(event.target.checked)}
                        />
                        Tile guide
                    </label>
                </div>
                {selected.transformable && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-packet-line pt-3">
                        <label className={inlineLabel}>
                            Tile rotation
                            <select
                                className={selectStyle}
                                value={p.transform.rotation}
                                onChange={(event) =>
                                    p.setTransform({
                                        ...p.transform,
                                        rotation: Number(event.target.value),
                                    })
                                }
                            >
                                {[0, 90, 180, 270].map((value) => (
                                    <option key={value} value={value}>
                                        {value}°
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className={`${inlineLabel} min-h-12 px-1`}>
                            <input
                                className={checkbox}
                                type="checkbox"
                                checked={p.transform.flipX}
                                onChange={(event) =>
                                    p.setTransform({ ...p.transform, flipX: event.target.checked })
                                }
                            />
                            Flip X
                        </label>
                        <label className={`${inlineLabel} min-h-12 px-1`}>
                            <input
                                className={checkbox}
                                type="checkbox"
                                checked={p.transform.flipY}
                                onChange={(event) =>
                                    p.setTransform({ ...p.transform, flipY: event.target.checked })
                                }
                            />
                            Flip Y
                        </label>
                    </div>
                )}
            </fieldset>
            <p className="mt-4 shrink-0 text-xs text-packet-muted">
                Live game geometry and materials · Preview changes are temporary
            </p>
        </section>
    );
}
