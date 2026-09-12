import { ExtrudeGeometry, Path, Shape } from 'three';

type Point = readonly [number, number];
interface Glyph {
  outline: readonly Point[];
  holes?: readonly (readonly Point[])[];
}

const GLYPHS: Record<'P' | 'A' | 'C' | 'M' | 'N', Glyph> = {
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
  M: {
    outline: [[0, 0], [0, 10], [2, 10], [4, 6.5], [6, 10], [8, 10], [8, 0], [6, 0], [6, 6.5], [4, 3], [2, 6.5], [2, 0]],
  },
  N: {
    outline: [[0, 0], [0, 10], [2, 10], [6, 3.5], [6, 10], [8, 10], [8, 0], [6, 0], [2, 6.5], [2, 0]],
  },
};

/** Horizontal lettering centered on the plaque; material 0 is faces, 1 is sides. */
export function buildPacmanSignGeometry(width: number, height: number): ExtrudeGeometry {
  const letters = ['P', 'A', 'C', 'M', 'A', 'N'] as const;
  const scaleX = width / 58;
  const scaleY = height / 10;
  const shapes = letters.map((letter, index) => {
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
    depth: 2.6,
    steps: 1,
    bevelEnabled: true,
    bevelSize: Math.min(0.12, scaleX / 3, scaleY / 3),
    bevelOffset: -Math.min(0.12, scaleX / 3, scaleY / 3),
    bevelThickness: 0.2,
    bevelSegments: 2,
  });
  geometry.translate(0, 0, 0.2);
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}
