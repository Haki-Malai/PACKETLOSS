import type { RandomSource } from '../../shared/random/RandomSource';

export interface MazePatternPoint {
    readonly x: number;
    readonly y: number;
}

export interface MazePatternEdge {
    readonly from: MazePatternPoint;
    readonly to: MazePatternPoint;
}

export interface MazeOpenLoop {
    readonly cells: readonly MazePatternPoint[];
    readonly edges: readonly MazePatternEdge[];
}

export interface MazeWallPatterns {
    readonly preferredClosed: readonly MazePatternEdge[];
    readonly openLoops: readonly MazeOpenLoop[];
}

/** Builds seeded rail, ladder, nested-bend, and rectangular-loop maze decisions. */
export function buildMazeWallPatterns(
    width: number,
    height: number,
    random: RandomSource,
    motifCount: number,
    loopCount: number
): MazeWallPatterns {
    const preferredClosed: MazePatternEdge[] = [];
    const openLoops: MazeOpenLoop[] = [];
    /** Records one adjacent connection without assigning graph-specific cell identifiers. */
    const edge = (ax: number, ay: number, bx: number, by: number): MazePatternEdge => ({
        from: { x: ax, y: ay },
        to: { x: bx, y: by },
    });

    for (let motif = 0; motif < motifCount; motif += 1) {
        const x = 2 + random.int(width - 12);
        const y = 2 + random.int(height - 12);
        const length = 4 + random.int(5);
        const horizontal = random.int(2) === 0;
        const kind = motif % 3;
        if (kind === 0) {
            // Parallel rails leave irregular crossings between their ends.
            for (let step = 0; step < length; step += 1) {
                if (horizontal) {
                    preferredClosed.push(edge(x + step, y, x + step, y + 1));
                    preferredClosed.push(edge(x + step + 1, y + 4, x + step + 1, y + 5));
                } else {
                    preferredClosed.push(edge(x, y + step, x + 1, y + step));
                    preferredClosed.push(edge(x + 4, y + step + 1, x + 5, y + step + 1));
                }
            }
        } else if (kind === 1) {
            // Staggered short rungs make offset ladders instead of a full grid.
            for (let rung = 0; rung < 3; rung += 1) {
                for (let step = 0; step < 3; step += 1) {
                    if (horizontal) {
                        preferredClosed.push(
                            edge(
                                x + step + (rung % 2) * 2,
                                y + rung * 3,
                                x + step + (rung % 2) * 2,
                                y + rung * 3 + 1
                            )
                        );
                    } else {
                        preferredClosed.push(
                            edge(
                                x + rung * 3,
                                y + step + (rung % 2) * 2,
                                x + rung * 3 + 1,
                                y + step + (rung % 2) * 2
                            )
                        );
                    }
                }
            }
        } else {
            // Two shifted L-shaped rails form nested turns.
            for (let offset = 0; offset < 2; offset += 1) {
                for (let step = 0; step < length - offset; step += 1) {
                    preferredClosed.push(
                        edge(x + step, y + offset * 2, x + step, y + offset * 2 + 1)
                    );
                    preferredClosed.push(
                        edge(x + length - offset, y + step, x + length - offset + 1, y + step)
                    );
                }
            }
        }
    }

    for (let loop = 0; loop < loopCount; loop += 1) {
        const x = 2 + random.int(width - 10);
        const y = 2 + random.int(height - 9);
        const spanX = 3 + random.int(5);
        const spanY = 2 + random.int(2);
        const edges: MazePatternEdge[] = [];
        for (let step = 0; step < spanX; step += 1) {
            edges.push(edge(x + step, y, x + step + 1, y));
            edges.push(edge(x + step, y + spanY, x + step + 1, y + spanY));
        }
        for (let step = 0; step < spanY; step += 1) {
            edges.push(edge(x, y + step, x, y + step + 1));
            edges.push(edge(x + spanX, y + step, x + spanX, y + step + 1));
        }
        const cells = Array.from({ length: spanY + 1 }, (_, row) =>
            Array.from({ length: spanX + 1 }, (_, column) => ({ x: x + column, y: y + row }))
        ).flat();
        openLoops.push({ cells, edges });
    }

    return { preferredClosed, openLoops };
}
