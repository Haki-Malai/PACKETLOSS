import { ExtrudeGeometry, Path, Shape } from 'three';
import { WALL_HEIGHT } from './MazeGeometry';

type Point = readonly [number, number];
interface Glyph {
  outline: readonly Point[];
  holes?: readonly (readonly Point[])[];
}

const GLYPHS: Record<'P' | 'A' | 'C' | 'K' | 'E' | 'T' | 'L' | 'O' | 'S', Glyph> = {
  P: {
    outline: [[0, 0], [0, 10], [6.5, 10], [8, 8.5], [8, 5.5], [6.5, 4], [2, 4], [2, 0]],
    holes: [[[2, 6], [6, 6], [6, 8], [2, 8]]],
  },
  A: {
    outline: [[0, 0], [0, 8.5], [1.5, 10], [6.5, 10], [8, 8.5], [8, 0], [6, 0], [6, 3.5], [2, 3.5], [2, 0]],
    holes: [[[2, 5.5], [6, 5.5], [6, 8], [2, 8]]],
  },
  C: {
    outline: [[8, 1.5], [6.5, 0], [1.5, 0], [0, 1.5], [0, 8.5], [1.5, 10], [6.5, 10], [8, 8.5], [8, 7], [6, 7], [6, 8], [2, 8], [2, 2], [6, 2], [6, 3], [8, 3]],
  },
  K: {
    outline: [[0, 0], [0, 10], [2, 10], [2, 6], [6, 10], [8, 10], [4.5, 5.5], [8, 0], [5.5, 0], [3, 4], [2, 3], [2, 0]],
  },
  E: {
    outline: [[0, 0], [0, 10], [8, 10], [8, 8], [2, 8], [2, 6], [7, 6], [7, 4], [2, 4], [2, 2], [8, 2], [8, 0]],
  },
  T: {
    outline: [[3, 0], [3, 8], [0, 8], [0, 10], [8, 10], [8, 8], [5, 8], [5, 0]],
  },
  L: {
    outline: [[0, 0], [0, 10], [2, 10], [2, 2], [8, 2], [8, 0]],
  },
  O: {
    outline: [[1.5, 0], [0, 1.5], [0, 8.5], [1.5, 10], [6.5, 10], [8, 8.5], [8, 1.5], [6.5, 0]],
    holes: [[[2, 2], [6, 2], [6, 8], [2, 8]]],
  },
  S: {
    outline: [[0, 1.5], [1.5, 0], [6.5, 0], [8, 1.5], [8, 4], [6.5, 5.5], [2, 5.5], [2, 8], [6, 8], [6, 7], [8, 7], [8, 8.5], [6.5, 10], [1.5, 10], [0, 8.5], [0, 6], [1.5, 4.5], [6, 4.5], [6, 2], [2, 2], [2, 3], [0, 3]],
  },
};

const WORDMARK = ['P', 'A', 'C', 'K', 'E', 'T', 'L', 'O', 'S', 'S'] as const;
const WORDMARK_WIDTH = WORDMARK.length * 10 - 2;

/** Horizontal lettering centered in its authored tile run, with the maze wall profile. */
export function buildPacketSignGeometry(width: number, height: number): ExtrudeGeometry {
  const scaleX = width / WORDMARK_WIDTH;
  const scaleY = height / 10;
  const shapes = WORDMARK.map((letter, index) => {
    const glyph = GLYPHS[letter];
    const addOutline = (path: Path, points: readonly Point[]): void => {
      points.forEach(([x, y], pointIndex) => {
        const px = (x + index * 10) * scaleX - width / 2;
        const py = y * scaleY - height / 2;
        if (pointIndex === 0) path.moveTo(px, py);
        else path.lineTo(px, py);
      });
      path.closePath();
    };
    const shape = new Shape();
    addOutline(shape, glyph.outline);
    for (const outline of glyph.holes ?? []) {
      const hole = new Path();
      addOutline(hole, outline);
      shape.holes.push(hole);
    }
    return shape;
  });
  const geometry = new ExtrudeGeometry(shapes, {
    depth: WALL_HEIGHT,
    steps: 1,
    bevelEnabled: false,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.clearGroups();
  return geometry;
}
