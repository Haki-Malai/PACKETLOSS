import { WorldState } from '../domain/world/WorldState';
import { TilePosition } from '../domain/valueObjects/TilePosition';

interface CameraLike {
  screenToWorld(screenX: number, screenY: number): { x: number; y: number };
}

export class DebugOverlaySystem {
  readonly runsWhenPaused = true;
  private collisionPanel?: HTMLPreElement;
  private runtimePanel?: HTMLPreElement;
  private lastRenderTimestampMs: number | null = null;
  private smoothedFps: number | null = null;
  private panelsVisible: boolean | null = null;

  constructor(
    private readonly world: WorldState,
    private readonly camera: CameraLike,
  ) {}

  start(): void {
    this.createPanels();
  }

  update(): void {
    if (!this.world.collisionDebugEnabled) {
      this.world.hoveredDebugTile = null;
      return;
    }

    const pointer = this.world.pointerScreen;
    if (!pointer) {
      return;
    }

    const worldPoint = this.camera.screenToWorld(pointer.x, pointer.y);
    const tileX = Math.floor(worldPoint.x / this.world.tileSize);
    const tileY = Math.floor(worldPoint.y / this.world.tileSize);

    if (tileX < 0 || tileY < 0 || tileX >= this.world.map.width || tileY >= this.world.map.height) {
      this.world.hoveredDebugTile = null;
      return;
    }

    this.world.hoveredDebugTile = { x: tileX, y: tileY };
  }

  render(): void {
    if (!this.collisionPanel || !this.runtimePanel) {
      return;
    }

    if (!this.world.collisionDebugEnabled) {
      if (this.panelsVisible === false) {
        return;
      }
      this.panelsVisible = false;
      this.collisionPanel.style.display = 'none';
      this.collisionPanel.textContent = '';
      this.runtimePanel.style.display = 'none';
      this.runtimePanel.textContent = '';
      this.world.debugPanelText = '';
      this.lastRenderTimestampMs = null;
      this.smoothedFps = null;
      return;
    }

    if (this.panelsVisible !== true) {
      this.panelsVisible = true;
      this.collisionPanel.style.display = 'block';
      this.runtimePanel.style.display = 'block';
    }

    if (!this.world.hoveredDebugTile) {
      this.world.debugPanelText = 'Collision Debug\nmove mouse over a block to inspect';
    } else {
      this.world.debugPanelText = this.getTileDebugInfo(this.world.hoveredDebugTile);
    }

    this.collisionPanel.textContent = this.world.debugPanelText;
    this.runtimePanel.textContent = this.getRuntimeDebugText();
  }

  destroy(): void {
    this.collisionPanel?.remove();
    this.runtimePanel?.remove();
    this.collisionPanel = undefined;
    this.runtimePanel = undefined;
    this.lastRenderTimestampMs = null;
    this.smoothedFps = null;
    this.panelsVisible = null;
  }

  private createPanels(): void {
    this.collisionPanel = this.createCollisionPanel();
    this.runtimePanel = this.createRuntimePanel();
    document.body.append(this.runtimePanel, this.collisionPanel);
  }

  private createCollisionPanel(): HTMLPreElement {
    const panelId = 'collision-debug-panel';
    document.getElementById(panelId)?.remove();

    const panel = document.createElement('pre');
    panel.id = panelId;
    panel.style.position = 'fixed';
    panel.style.left = '8px';
    panel.style.top = '52px';
    panel.style.margin = '0';
    panel.style.padding = '6px 8px';
    panel.style.color = '#ffffff';
    panel.style.background = 'rgba(0, 0, 0, 0.78)';
    panel.style.font = '12px/1.35 monospace';
    panel.style.whiteSpace = 'pre';
    panel.style.pointerEvents = 'none';
    panel.style.zIndex = '9999';
    panel.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    panel.style.borderRadius = '4px';
    panel.style.display = 'none';
    return panel;
  }

  private createRuntimePanel(): HTMLPreElement {
    const panelId = 'runtime-debug-panel';
    document.getElementById(panelId)?.remove();

    const panel = document.createElement('pre');
    panel.id = panelId;
    panel.style.position = 'fixed';
    panel.style.left = '8px';
    panel.style.top = '8px';
    panel.style.margin = '0';
    panel.style.padding = '6px 8px';
    panel.style.color = '#ffffff';
    panel.style.background = 'rgba(0, 0, 0, 0.78)';
    panel.style.font = '12px/1.35 monospace';
    panel.style.whiteSpace = 'pre';
    panel.style.pointerEvents = 'none';
    panel.style.zIndex = '9999';
    panel.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    panel.style.borderRadius = '4px';
    panel.style.display = 'none';
    return panel;
  }

  private getRuntimeDebugText(): string {
    const currentTimestampMs = this.getTimestampMs();
    let frameTimeMs: number | null = null;
    if (this.lastRenderTimestampMs !== null) {
      const deltaMs = currentTimestampMs - this.lastRenderTimestampMs;
      if (Number.isFinite(deltaMs) && deltaMs > 0) {
        frameTimeMs = deltaMs;
      }
    }
    this.lastRenderTimestampMs = currentTimestampMs;

    if (frameTimeMs === null) {
      return ['Runtime Diagnostics', 'fps: --', 'frame: -- ms'].join('\n');
    }

    const instantFps = 1000 / frameTimeMs;
    const smoothing = 0.2;
    this.smoothedFps =
      this.smoothedFps === null ? instantFps : this.smoothedFps + (instantFps - this.smoothedFps) * smoothing;

    return [
      'Runtime Diagnostics',
      `fps: ${this.smoothedFps.toFixed(1)}`,
      `frame: ${frameTimeMs.toFixed(2)} ms`,
    ].join('\n');
  }

  private getTimestampMs(): number {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }

    return Date.now();
  }

  private getTileDebugInfo(tilePosition: TilePosition): string {
    const tile = this.world.map.tiles[tilePosition.y]?.[tilePosition.x];
    const collision = this.world.collisionGrid.getTileAt(tilePosition.x, tilePosition.y);

    if (!tile || tile.gid === null) {
      return [
        'Collision Debug',
        `tile: (${tilePosition.x}, ${tilePosition.y})`,
        'gid: empty',
        'edges: up:false right:false down:false left:false',
      ].join('\n');
    }

    const rotationSteps = ((Math.round(tile.rotation / (Math.PI / 2)) % 4) + 4) % 4;

    return [
      'Collision Debug',
      `tile: (${tilePosition.x}, ${tilePosition.y}) gid:${tile.gid} local:${tile.localId}`,
      `image: ${tile.imagePath}`,
      `collides:${collision.collides} penGate:${collision.penGate} portal:${collision.portal}`,
      `edges: up:${collision.up} right:${collision.right} down:${collision.down} left:${collision.left}`,
      `transform: rot:${rotationSteps * 90}deg flipX:${tile.flipX} flipY:${tile.flipY}`,
    ].join('\n');
  }
}
