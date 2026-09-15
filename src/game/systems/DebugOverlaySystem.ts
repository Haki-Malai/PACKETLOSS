import { WorldState } from '../domain/world/WorldState';
import { TilePosition } from '../domain/valueObjects/TilePosition';
import { EMPTY_DEBUG, type DebugSnapshot } from '../shared/events/DebugSnapshot';

interface CameraLike {
  screenToWorld(screenX: number, screenY: number): { x: number; y: number };
}

export class DebugOverlaySystem {
  readonly runsWhenPaused = true;
  readonly updatePhase = 'afterSimulation' as const;
  private lastRenderTimestampMs: number | null = null;
  private smoothedFps: number | null = null;
  private panelsVisible: boolean | null = null;

  /**
   * Connects world diagnostics to the UI without owning DOM elements.
   *
   * @param world - Runtime state to inspect and update with diagnostic text.
   * @param camera - Converts pointer coordinates into world positions.
   * @param onChange - Optional receiver for diagnostic snapshots and visibility resets.
   */
  constructor(
    private readonly world: WorldState,
    private readonly camera: CameraLike,
    private readonly onChange?: (_snapshot: DebugSnapshot) => void,
  ) {}

  /** Clears diagnostics displayed by a previous run before this system starts reporting. */
  start(): void {
    this.onChange?.(EMPTY_DEBUG);
  }

  /** Maps the current pointer to an in-bounds debug tile while collision inspection is enabled. */
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

  /** Publishes tile and frame diagnostics, clearing the overlay and timing when debug is disabled. */
  render(): void {
    if (!this.world.collisionDebugEnabled) {
      if (this.panelsVisible === false) {
        return;
      }
      this.panelsVisible = false;
      this.onChange?.(EMPTY_DEBUG);
      this.world.debugPanelText = '';
      this.lastRenderTimestampMs = null;
      this.smoothedFps = null;
      return;
    }

    if (this.panelsVisible !== true) {
      this.panelsVisible = true;
    }

    if (!this.world.hoveredDebugTile) {
      this.world.debugPanelText = 'Collision Debug\nmove mouse over a block to inspect';
    } else {
      this.world.debugPanelText = this.getTileDebugInfo(this.world.hoveredDebugTile);
    }

    this.onChange?.({ enabled: true, collisionText: this.world.debugPanelText, runtimeText: this.getRuntimeDebugText() });
  }

  /** Clears published diagnostics and resets frame timing for system disposal. */
  destroy(): void {
    this.world.debugPanelText = '';
    this.onChange?.(EMPTY_DEBUG);
    this.lastRenderTimestampMs = null;
    this.smoothedFps = null;
    this.panelsVisible = null;
  }

  /** Samples elapsed render time and formats smoothed FPS, using placeholders before a valid delta. */
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

  /** Reads time in milliseconds, preferring the high-resolution clock when available. */
  private getTimestampMs(): number {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }

    return Date.now();
  }

  /**
   * Formats a tile's collision flags and authored transform for the debug overlay.
   *
   * @param tilePosition - Tile-grid coordinates to inspect.
   * @returns Multiline diagnostic text, including an explicit empty-tile description.
   */
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
      `collides:${collision.collides} penGate:${collision.penGate} portal:${collision.portal}`,
      `edges: up:${collision.up} right:${collision.right} down:${collision.down} left:${collision.left}`,
      `transform: rot:${rotationSteps * 90}deg flipX:${tile.flipX} flipY:${tile.flipY}`,
    ].join('\n');
  }
}
