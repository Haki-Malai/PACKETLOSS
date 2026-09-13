import './assetShowcase.css';
import { ASSET_CATALOG, type AssetPreviewEntry } from './assetCatalog';
import { AssetPreviewSession } from './AssetPreviewSession';
import type { AssetPreviewViewport, PreviewCameraMode } from './AssetPreviewViewport';
import { PreviewPlayback } from './PreviewPlayback';

/** Development entrypoint; importing it never constructs or resets a game. */
export function mountAssetShowcase(root: HTMLElement): () => void {
  const previousTitle = document.title;
  document.title = 'Asset Lab · PACKETLOSS';
  root.classList.add('asset-showcase');
  root.innerHTML = `
    <header class="asset-header">
      <div><p class="asset-eyebrow">PACKETLOSS <span>LOCAL DEVELOPMENT</span></p>
        <h1>Asset Lab<span class="asset-heading-dot">.</span></h1>
        <p class="asset-subtitle">The game’s assets. Room to look closer.</p></div>
      <a class="asset-button" data-action="game">Back to game ↗</a>
    </header>
    <div class="asset-workspace">
      <section class="asset-library" aria-label="Asset gallery">
        <div class="asset-library-tools">
          <label class="asset-search"><span>Search assets</span>
            <input type="search" placeholder="Player, scared, wall…" data-control="search"></label>
          <label class="asset-category"><span>Category</span><select data-control="category">
            <option value="">All assets</option><option>Player</option><option>Ghosts</option>
            <option>Points</option><option>Walls</option><option>Other</option>
          </select></label>
        </div>
        <p class="asset-count" data-output="count"></p>
        <div class="asset-gallery" data-output="gallery"></div>
        <p class="asset-empty" data-output="empty" hidden>No assets match this search.</p>
      </section>
      <section class="asset-inspector" aria-label="Asset inspector">
        <div class="asset-inspector-heading"><div>
          <p class="asset-eyebrow" data-output="category">PLAYER</p>
          <h2 data-output="name">Player</h2>
          <p class="asset-source" data-output="source"></p>
        </div><span class="asset-state" data-output="state">Idle</span></div>
        <div class="asset-stage" data-output="stage">
          <canvas class="asset-live-canvas" data-output="canvas" aria-label="Interactive 3D asset preview"></canvas>
          <div class="asset-loading" data-output="loading"><p role="status" data-output="status">Loading models…</p>
            <button type="button" class="asset-button" data-action="retry" hidden>Retry loading</button></div>
          <span class="asset-camera-hint" data-output="camera-hint">Game camera · Scroll to zoom</span>
        </div>
        <fieldset class="asset-controls" data-output="controls" disabled>
          <legend class="asset-sr-only">Inspector controls</legend>
          <div class="asset-control-row">
            <button type="button" class="asset-button asset-primary" data-action="play">Pause</button>
            <button type="button" class="asset-button" data-action="replay">Replay</button>
            <label class="asset-inline-label">Speed <select data-control="speed">
              <option value="0.25">0.25×</option><option value="0.5">0.5×</option>
              <option value="1" selected>1×</option><option value="2">2×</option>
            </select></label>
            <label class="asset-check"><input type="checkbox" data-control="loop"> Loop</label>
          </div>
          <label class="asset-timeline"><span>Timeline <output data-output="time">0.00 / 0.00 s</output></span>
            <input type="range" min="0" max="6000" step="1" value="0" data-control="timeline"></label>
          <div class="asset-control-row asset-camera-controls">
            <label class="asset-inline-label">Camera <select data-control="camera">
              <option value="game">Game View</option><option value="orbit">Orbit</option>
            </select></label>
            <button type="button" class="asset-button" data-action="fit">Fit</button>
            <button type="button" class="asset-button" data-action="actual">Game scale</button>
            <button type="button" class="asset-button" data-action="zoom-out" aria-label="Zoom out">−</button>
            <button type="button" class="asset-button" data-action="zoom-in" aria-label="Zoom in">+</button>
            <button type="button" class="asset-button" data-action="reset">Reset view</button>
            <label class="asset-check"><input type="checkbox" data-control="guide"> Tile guide</label>
          </div>
          <div class="asset-control-row asset-transforms" data-output="transforms" hidden>
            <label class="asset-inline-label">Tile rotation <select data-control="rotation">
              <option value="0">0°</option><option value="90">90°</option>
              <option value="180">180°</option><option value="270">270°</option>
            </select></label>
            <label class="asset-check"><input type="checkbox" data-control="flip-x"> Flip X</label>
            <label class="asset-check"><input type="checkbox" data-control="flip-y"> Flip Y</label>
          </div>
        </fieldset>
        <p class="asset-inspector-note">Live game geometry and materials · Preview changes are temporary</p>
      </section>
    </div>`;

  const find = <T extends Element>(selector: string): T => root.querySelector<T>(selector)!;
  const canvas = find<HTMLCanvasElement>('[data-output="canvas"]');
  const stage = find<HTMLDivElement>('[data-output="stage"]');
  const controls = find<HTMLFieldSetElement>('[data-output="controls"]');
  const loading = find<HTMLDivElement>('[data-output="loading"]');
  const status = find<HTMLParagraphElement>('[data-output="status"]');
  const retry = find<HTMLButtonElement>('[data-action="retry"]');
  const gallery = find<HTMLDivElement>('[data-output="gallery"]');
  const search = find<HTMLInputElement>('[data-control="search"]');
  const category = find<HTMLSelectElement>('[data-control="category"]');
  const play = find<HTMLButtonElement>('[data-action="play"]');
  const replay = find<HTMLButtonElement>('[data-action="replay"]');
  const timeline = find<HTMLInputElement>('[data-control="timeline"]');
  const speed = find<HTMLSelectElement>('[data-control="speed"]');
  const loop = find<HTMLInputElement>('[data-control="loop"]');
  const camera = find<HTMLSelectElement>('[data-control="camera"]');
  const guide = find<HTMLInputElement>('[data-control="guide"]');
  const rotation = find<HTMLSelectElement>('[data-control="rotation"]');
  const flipX = find<HTMLInputElement>('[data-control="flip-x"]');
  const flipY = find<HTMLInputElement>('[data-control="flip-y"]');
  const time = find<HTMLOutputElement>('[data-output="time"]');
  find<HTMLAnchorElement>('[data-action="game"]').href = new URL(import.meta.env.BASE_URL, window.location.origin).href;

  const playback = new PreviewPlayback();
  const listeners = new AbortController();
  const cards = new Map<string, { button: HTMLButtonElement; thumbnail: HTMLCanvasElement }>();
  let selected = ASSET_CATALOG[0];
  let session: AssetPreviewSession | null = null;
  let viewport: AssetPreviewViewport | null = null;
  let disposed = false;
  let frameId = 0;
  let thumbnailFrameId = 0;
  let finishThumbnailFrame: (() => void) | undefined;
  let lastTimestamp: number | undefined;

  const on = (element: EventTarget, event: string, callback: () => void): void => {
    element.addEventListener(event, callback, { signal: listeners.signal });
  };
  const updateClock = (): void => {
    play.textContent = playback.playing ? 'Pause' : 'Play';
    play.setAttribute('aria-pressed', String(playback.playing));
    timeline.value = String(playback.timeMs);
    time.value = `${(playback.timeMs / 1000).toFixed(2)} / ${(playback.durationMs / 1000).toFixed(2)} s`;
  };
  const select = (entry: AssetPreviewEntry): void => {
    selected = entry;
    playback.select(entry);
    lastTimestamp = undefined;
    rotation.value = '0';
    flipX.checked = flipY.checked = false;
    speed.value = '1';
    loop.checked = entry.loop;
    timeline.max = String(entry.durationMs);
    for (const control of [play, replay, timeline, speed, loop]) control.disabled = entry.durationMs === 0;
    find<HTMLElement>('[data-output="name"]').textContent = entry.name;
    find<HTMLElement>('[data-output="category"]').textContent = entry.category;
    find<HTMLElement>('[data-output="state"]').textContent = entry.state;
    find<HTMLElement>('[data-output="source"]').textContent = entry.source;
    find<HTMLElement>('[data-output="transforms"]').hidden = !entry.transformable;
    cards.forEach(({ button }, id) => button.setAttribute('aria-pressed', String(id === entry.id)));
    viewport?.select(entry);
    updateClock();
  };

  for (const entry of ASSET_CATALOG) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'asset-card';
    button.disabled = true;
    button.setAttribute('aria-label', `${entry.name}, ${entry.state}`);
    button.setAttribute('aria-pressed', 'false');
    const thumbnail = document.createElement('canvas');
    thumbnail.width = 320;
    thumbnail.height = 224;
    thumbnail.setAttribute('aria-hidden', 'true');
    const details = document.createElement('span');
    details.className = 'asset-card-details';
    for (const [className, value] of [
      ['asset-card-category', entry.category], ['asset-card-name', entry.name],
      ['asset-card-state', entry.state], ['asset-card-source', entry.source],
    ]) {
      const label = document.createElement('span');
      label.className = className;
      label.textContent = className === 'asset-card-source' ? value.slice(value.lastIndexOf('/') + 1) : value;
      if (className === 'asset-card-source') label.title = value;
      details.append(label);
    }
    button.append(thumbnail, details);
    on(button, 'click', () => select(entry));
    gallery.append(button);
    cards.set(entry.id, { button, thumbnail });
  }

  const filter = (): void => {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const entry of ASSET_CATALOG) {
      const text = `${entry.name} ${entry.state} ${entry.source} ${entry.category}`.toLocaleLowerCase();
      const visible = (!category.value || entry.category === category.value) && text.includes(query);
      cards.get(entry.id)!.button.hidden = !visible;
      if (visible) count += 1;
    }
    find<HTMLElement>('[data-output="count"]').textContent = `${count} of ${ASSET_CATALOG.length} previews`;
    find<HTMLElement>('[data-output="empty"]').hidden = count > 0;
  };
  on(search, 'input', filter);
  on(category, 'change', filter);
  filter();

  on(play, 'click', () => { playback.toggle(); lastTimestamp = undefined; updateClock(); });
  on(replay, 'click', () => { playback.replay(); lastTimestamp = undefined; updateClock(); });
  on(timeline, 'input', () => { playback.seek(Number(timeline.value)); updateClock(); });
  on(speed, 'change', () => { playback.speed = Number(speed.value); });
  on(loop, 'change', () => { playback.loop = loop.checked; });
  const updateCameraHint = (): void => {
    find<HTMLElement>('[data-output="camera-hint"]').textContent = camera.value === 'orbit'
      ? 'Orbit · Drag to rotate · Scroll to zoom' : 'Game camera · Scroll to zoom';
  };
  on(camera, 'change', () => { viewport?.setCameraMode(camera.value as PreviewCameraMode); updateCameraHint(); });
  on(guide, 'change', () => viewport?.setTileGuide(guide.checked));
  on(find('[data-action="fit"]'), 'click', () => viewport?.fit());
  on(find('[data-action="actual"]'), 'click', () => viewport?.actualSize());
  on(find('[data-action="zoom-in"]'), 'click', () => viewport?.zoomBy(1.25));
  on(find('[data-action="zoom-out"]'), 'click', () => viewport?.zoomBy(0.8));
  on(find('[data-action="reset"]'), 'click', () => {
    camera.value = 'game';
    viewport?.resetCamera();
    updateCameraHint();
  });
  const transform = (): void => {
    viewport?.select(selected, { rotation: Number(rotation.value), flipX: flipX.checked, flipY: flipY.checked });
  };
  for (const control of [rotation, flipX, flipY]) on(control, 'change', transform);

  const resize = (): void => {
    viewport?.resize(stage.clientWidth, stage.clientHeight);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  on(document, 'visibilitychange', () => { lastTimestamp = undefined; });

  const tick = (timestamp: number): void => {
    if (disposed) return;
    if (!document.hidden) {
      playback.advance(lastTimestamp === undefined ? 0 : timestamp - lastTimestamp);
      viewport?.render(playback.timeMs);
      updateClock();
      lastTimestamp = timestamp;
    } else {
      lastTimestamp = undefined;
    }
    frameId = window.requestAnimationFrame(tick);
  };
  const start = async (): Promise<void> => {
    session?.dispose();
    const attempt = new AssetPreviewSession(canvas);
    session = attempt;
    viewport = null;
    controls.disabled = true;
    retry.hidden = true;
    loading.hidden = false;
    canvas.style.visibility = 'hidden';
    status.setAttribute('role', 'status');
    status.textContent = 'Loading models…';
    try {
      const view = await attempt.start();
      if (!view || disposed || session !== attempt) return;
      view.resize(320, 224);
      let completed = 0;
      for (const entry of ASSET_CATALOG) {
        if (disposed || session !== attempt) return;
        view.select(entry);
        view.snapshot(cards.get(entry.id)!.thumbnail, entry.thumbnailMs);
        completed += 1;
        status.textContent = `Preparing previews · ${completed} / ${ASSET_CATALOG.length}`;
        // Yield between snapshots so a model-heavy gallery never monopolizes startup.
        await new Promise<void>((resolve) => {
          finishThumbnailFrame = resolve;
          thumbnailFrameId = window.requestAnimationFrame(() => {
            thumbnailFrameId = 0;
            finishThumbnailFrame = undefined;
            resolve();
          });
        });
      }
      if (disposed || session !== attempt) return;
      viewport = view;
      resize();
      viewport.setCameraMode(camera.value as PreviewCameraMode);
      viewport.setTileGuide(guide.checked);
      select(selected);
      controls.disabled = false;
      cards.forEach(({ button }) => { button.disabled = false; });
      viewport.render(0);
      canvas.style.visibility = '';
      loading.hidden = true;
      lastTimestamp = undefined;
      if (!frameId) frameId = window.requestAnimationFrame(tick);
    } catch (error) {
      attempt.dispose();
      if (disposed || session !== attempt) return;
      viewport = null;
      status.setAttribute('role', 'alert');
      status.textContent = error instanceof Error ? error.message : 'The asset previews could not load.';
      retry.hidden = false;
    }
  };
  on(retry, 'click', () => { void start(); });
  void start();

  return () => {
    if (disposed) return;
    disposed = true;
    listeners.abort();
    observer.disconnect();
    window.cancelAnimationFrame(frameId);
    window.cancelAnimationFrame(thumbnailFrameId);
    finishThumbnailFrame?.();
    finishThumbnailFrame = undefined;
    session?.dispose();
    session = null;
    viewport = null;
    root.replaceChildren();
    root.classList.remove('asset-showcase');
    document.title = previousTitle;
  };
}
