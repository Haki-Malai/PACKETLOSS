import { TilePosition } from '../valueObjects/TilePosition';
import type { WallConnection } from './MazeFootprint';

export interface CollisionTile {
  collides: boolean;
  penGate: boolean;
  portal: boolean;
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export type CollisionTiles = Record<'current' | 'up' | 'down' | 'left' | 'right', CollisionTile>;

export const createEmptyCollisionTile = (): CollisionTile => ({
  collides: false,
  penGate: false,
  portal: false,
  up: false,
  down: false,
  left: false,
  right: false,
});

const BOUNDARY_COLLISION_TILE: CollisionTile = Object.freeze({
  collides: true,
  penGate: false,
  portal: false,
  up: true,
  down: true,
  left: true,
  right: true,
});

export class CollisionGrid {
  readonly width: number;
  readonly height: number;
  private temporaryEdges = new Set<string>();

  constructor(private grid: CollisionTile[][]) {
    this.height = grid.length;
    this.width = grid[0]?.length ?? 0;
  }

  /** Replaces authored tiles for a rolling maze while retaining temporary closures. */
  replaceGrid(grid: CollisionTile[][]): void {
    if (grid.length !== this.height || grid.some((row) => row.length !== this.width)) {
      throw new Error('Replacement collision grid dimensions must match.');
    }
    this.grid = grid;
  }

  /** Reads authored collision with temporary passage closures applied symmetrically. */
  getTileAt(x: number, y: number): CollisionTile {
    if (!this.isInBounds(x, y)) return BOUNDARY_COLLISION_TILE;
    const tile = this.grid[y]?.[x];
    if (!tile) return BOUNDARY_COLLISION_TILE;
    const up = this.temporaryEdges.has(`${x},${y - 1},down`);
    const right = this.temporaryEdges.has(`${x},${y},right`);
    const down = this.temporaryEdges.has(`${x},${y},down`);
    const left = this.temporaryEdges.has(`${x - 1},${y},right`);
    return up || right || down || left ? {
      ...tile, up: tile.up || up, right: tile.right || right, down: tile.down || down, left: tile.left || left,
    } : tile;
  }

  getTilesAt(tile: TilePosition): CollisionTiles {
    const { x, y } = tile;
    return {
      current: this.getTileAt(x, y),
      up: this.getTileAt(x, y - 1),
      down: this.getTileAt(x, y + 1),
      left: this.getTileAt(x - 1, y),
      right: this.getTileAt(x + 1, y),
    };
  }

  toArray(): CollisionTile[][] {
    return this.grid.map((row) => row.map((tile) => ({ ...tile })));
  }

  /** Replaces temporary closed connections without modifying authored collision flags. */
  setTemporaryEdges(connections: readonly WallConnection[]): void {
    this.temporaryEdges = new Set(connections.map(({ tile, side }) => `${tile.x},${tile.y},${side}`));
  }

  private isInBounds(x: number, y: number): boolean {
    return y >= 0 && y < this.height && x >= 0 && x < this.width;
  }
}
