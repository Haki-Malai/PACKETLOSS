import { BufferGeometry, ExtrudeGeometry, Float32BufferAttribute, Path, Shape } from 'three';
import type { WorldMapData } from '../../domain/world/WorldState';
import { buildMazeWallFootprint } from '../../domain/world/MazeFootprint';
import type { MazeFootprint } from '../../domain/world/MazeFootprint';
export { buildMazeWallFootprint, buildMazePenFootprint } from '../../domain/world/MazeFootprint';
export type { MazeFootprint } from '../../domain/world/MazeFootprint';

export interface WallContourPoint {
  x: number;
  y: number;
}

export const WALL_HEIGHT = 12;

interface BoundaryEdge {
  start: WallContourPoint;
  end: WallContourPoint;
  direction: number;
  visited: boolean;
}


export function traceWallContours(footprint: MazeFootprint): WallContourPoint[][] {
  const edges: BoundaryEdge[] = [];
  const outgoing = new Map<number, BoundaryEdge[]>();
  const pointKey = (point: WallContourPoint): number => point.y * (footprint.width + 1) + point.x;
  const occupied = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < footprint.width && y < footprint.height
      && Boolean(footprint.solid[y * footprint.width + x]);
  const addEdge = (x: number, y: number, endX: number, endY: number, direction: number): void => {
    const edge = { start: { x, y }, end: { x: endX, y: endY }, direction, visited: false };
    edges.push(edge);
    const key = pointKey(edge.start);
    const neighbors = outgoing.get(key) ?? [];
    neighbors.push(edge);
    outgoing.set(key, neighbors);
  };

  for (let y = 0; y < footprint.height; y += 1) {
    for (let x = 0; x < footprint.width; x += 1) {
      if (!occupied(x, y)) continue;
      if (!occupied(x, y - 1)) addEdge(x, y, x + 1, y, 0);
      if (!occupied(x + 1, y)) addEdge(x + 1, y, x + 1, y + 1, 1);
      if (!occupied(x, y + 1)) addEdge(x + 1, y + 1, x, y + 1, 2);
      if (!occupied(x - 1, y)) addEdge(x, y + 1, x, y, 3);
    }
  }

  const contours: WallContourPoint[][] = [];
  for (const first of edges) {
    if (first.visited) continue;
    const points: WallContourPoint[] = [];
    let edge = first;
    do {
      edge.visited = true;
      points.push(edge.start);
      if (pointKey(edge.end) === pointKey(first.start)) break;
      const candidates = outgoing.get(pointKey(edge.end)) ?? [];
      // Keep occupied pixels on the right; diagonal-only contacts stay separate.
      const next = [1, 0, 3, 2].map((turn) =>
        candidates.find((candidate) => !candidate.visited && candidate.direction === (edge.direction + turn) % 4),
      ).find((candidate) => candidate !== undefined);
      if (!next) throw new Error('Wall footprint contains an open boundary');
      edge = next;
    } while (!edge.visited);

    contours.push(points.filter((point, index) => {
      const previous = points[(index + points.length - 1) % points.length];
      const next = points[(index + 1) % points.length];
      return (point.x - previous.x) * (next.y - point.y) !== (point.y - previous.y) * (next.x - point.x);
    }));
  }
  return contours;
}

function signedArea(contour: WallContourPoint[]): number {
  return contour.reduce((area, point, index) => {
    const next = contour[(index + 1) % contour.length];
    return area + point.x * next.y - next.x * point.y;
  }, 0) / 2;
}

function containsPoint(contour: WallContourPoint[], point: WallContourPoint): boolean {
  let inside = false;
  for (let i = 0, j = contour.length - 1; i < contour.length; j = i, i += 1) {
    const a = contour[i];
    const b = contour[j];
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

function setPathPoints(path: Path, contour: WallContourPoint[]): void {
  contour.forEach((point, index) => {
    if (index === 0) path.moveTo(point.x, -point.y);
    else path.lineTo(point.x, -point.y);
  });
  path.closePath();
}

export function buildMazeWallGeometry(map: WorldMapData): BufferGeometry {
  return buildMazeWallGeometryFromFootprint(buildMazeWallFootprint(map));
}

export function buildMazeWallEdgeGeometry(
  footprint: MazeFootprint, adjoiningFootprint?: MazeFootprint, includeOuterContours = true,
): BufferGeometry {
  const positions: number[] = [];
  const corners = new Set<string>();
  const adjoins = (x: number, y: number): boolean => {
    if (!adjoiningFootprint) return false;
    const column = Math.floor(x);
    const row = Math.floor(y);
    return column >= 0 && column < adjoiningFootprint.width && row >= 0 && row < adjoiningFootprint.height
      && Boolean(adjoiningFootprint.solid[row * adjoiningFootprint.width + column]);
  };
  for (const contour of traceWallContours(footprint)) {
    if (!includeOuterContours && signedArea(contour) > 0) continue;
    // The square wall profile keeps both rings aligned, including around holes.
    for (const height of [0.08, WALL_HEIGHT + 0.01]) {
      contour.forEach((point, index) => {
        const next = contour[(index + 1) % contour.length];
        const length = Math.abs(next.x - point.x) + Math.abs(next.y - point.y);
        const dx = (next.x - point.x) / length;
        const dy = (next.y - point.y) / length;
        let start = 0;
        // Split only where another presentation layer touches the wall's outside.
        // Keep visible runs continuous instead of emitting a strip for each pixel.
        for (let step = 0; step <= length; step += 1) {
          const hidden = step < length && adjoins(
            point.x + dx * (step + 0.5) + dy * 0.5,
            point.y + dy * (step + 0.5) - dx * 0.5,
          );
          if (hidden || step === length) {
            if (step > start) positions.push(
              point.x + dx * start, height, point.y + dy * start,
              point.x + dx * step, height, point.y + dy * step,
            );
            start = step + 1;
          }
        }
      });
    }
    for (let index = 0; index < contour.length; index += 1) {
      const point = contour[index];
      const previous = contour[(index + contour.length - 1) % contour.length];
      const next = contour[(index + 1) % contour.length];
      // Unit-length boundary steps do not represent full-height wall corners.
      if (Math.hypot(point.x - previous.x, point.y - previous.y) <= 1
        && Math.hypot(next.x - point.x, next.y - point.y) <= 1) continue;
      if ([-0.5, 0.5].some((dx) => [-0.5, 0.5].some((dy) => adjoins(point.x + dx, point.y + dy)))) continue;
      const key = `${point.x}:${point.y}`;
      if (!corners.has(key)) {
        corners.add(key);
        // Diagonal contacts share one straight connection to the top ring.
        positions.push(point.x, 0.08, point.y, point.x, WALL_HEIGHT + 0.01, point.y);
      }
    }
  }
  return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(positions, 3));
}

/** Splits contour runs where authored and temporary pixels meet, preserving one outline per exposed edge. */
export function splitMazeWallEdgesByOwnership(
  edges: BufferGeometry, authored: MazeFootprint,
): { authored: BufferGeometry; temporary: BufferGeometry } {
  const source = edges.getAttribute('position');
  const original: number[] = [];
  const added: number[] = [];
  const isOriginal = (x: number, z: number): boolean => {
    const column = Math.floor(x);
    const row = Math.floor(z);
    return column >= 0 && column < authored.width && row >= 0 && row < authored.height
      && Boolean(authored.solid[row * authored.width + column]);
  };
  for (let index = 0; index < source.count; index += 2) {
    const x1 = source.getX(index);
    const y1 = source.getY(index);
    const z1 = source.getZ(index);
    const x2 = source.getX(index + 1);
    const y2 = source.getY(index + 1);
    const z2 = source.getZ(index + 1);
    const dx = x2 - x1;
    const dz = z2 - z1;
    if (y1 !== y2) {
      const target = [-0.5, 0.5].some((x) => [-0.5, 0.5].some((z) => isOriginal(x1 + x, z1 + z)))
        ? original : added;
      target.push(x1, y1, z1, x2, y2, z2);
      continue;
    }
    const length = Math.abs(dx) + Math.abs(dz);
    if (length === 0) continue;
    const stepX = dx / length;
    const stepZ = dz / length;
    let start = 0;
    let previous = false;
    for (let step = 0; step <= length; step += 1) {
      const x = x1 + stepX * (step + 0.5);
      const z = z1 + stepZ * (step + 0.5);
      const current = step < length && (isOriginal(x + stepZ * 0.5, z - stepX * 0.5)
        || isOriginal(x - stepZ * 0.5, z + stepX * 0.5));
      if (step > start && (step === length || current !== previous)) {
        const target = previous ? original : added;
        target.push(x1 + stepX * start, y1, z1 + stepZ * start,
          x1 + stepX * step, y2, z1 + stepZ * step);
        start = step;
      }
      previous = current;
    }
  }
  return {
    authored: new BufferGeometry().setAttribute('position', new Float32BufferAttribute(original, 3)),
    temporary: new BufferGeometry().setAttribute('position', new Float32BufferAttribute(added, 3)),
  };
}

export function buildMazeWallGeometryFromFootprint(footprint: MazeFootprint): BufferGeometry {
  const contours = traceWallContours(footprint);
  const outlines = contours.filter((contour) => signedArea(contour) > 0).map((contour) => {
    const shape = new Shape();
    setPathPoints(shape, contour);
    return { contour, area: signedArea(contour), shape };
  });
  for (const hole of contours.filter((contour) => signedArea(contour) < 0)) {
    const [a, b] = hole;
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const interior = { x: (a.x + b.x) / 2 + (b.y - a.y) / length * 0.25, y: (a.y + b.y) / 2 - (b.x - a.x) / length * 0.25 };
    const parent = outlines.filter((outline) => containsPoint(outline.contour, interior)).sort((a, b) => a.area - b.area)[0];
    if (parent) {
      const path = new Path();
      setPathPoints(path, hole);
      parent.shape.holes.push(path);
    }
  }

  const geometry = new ExtrudeGeometry(outlines.map(({ shape }) => shape), {
    depth: WALL_HEIGHT,
    steps: 1,
    bevelEnabled: false,
  });
  geometry.rotateX(-Math.PI / 2);
  // One material covers all rails, so tile and contour boundaries need no draw groups.
  geometry.clearGroups();
  return geometry;
}
