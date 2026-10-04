import { describe, expect, it } from 'vitest';
import {
    carveMazeGraph,
    mazeEdgeKey,
    orderedMazeEdge,
    type MazeGraph,
    type MazeGraphEdgeGroup,
} from '../game/domain/world/MazeGraphCarver';
import { SeededRandom } from '../game/shared/random/SeededRandom';

const SIZE = 9;
const at = (x: number, y: number): number => y * SIZE + x;

/** Reflects a test cell across the vertical center line. */
function mirrorCell(cell: number): number {
    return at(SIZE - 1 - (cell % SIZE), Math.floor(cell / SIZE));
}

/** Returns one edge together with its horizontal mirror. */
function mirroredGroup(from: number, to: number): MazeGraphEdgeGroup {
    const edge = orderedMazeEdge(from, to);
    const mirror = orderedMazeEdge(mirrorCell(from), mirrorCell(to));
    return mazeEdgeKey(...edge) === mazeEdgeKey(...mirror) ? [edge] : [edge, mirror];
}

/** Checks connectivity without imposing Endless's articulation constraint. */
function isConnected(graph: MazeGraph): boolean {
    const visited = new Uint8Array(graph.length);
    const queue = [0];
    visited[0] = 1;
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
        for (const neighbor of graph[queue[cursor]]) {
            if (visited[neighbor]) continue;
            visited[neighbor] = 1;
            queue.push(neighbor);
        }
    }
    return queue.length === graph.length;
}

describe('shared maze graph carver', () => {
    it('applies fixed and random decisions as mirrored edge groups', () => {
        const active = new Uint8Array(SIZE ** 2).fill(1);
        const fixedOpenEdge = orderedMazeEdge(at(2, 3), at(3, 3));
        const fixedClosedEdge = orderedMazeEdge(at(1, 1), at(1, 2));
        const graph = carveMazeGraph({
            width: SIZE,
            height: SIZE,
            bounds: { minX: 0, maxX: SIZE - 1, minY: 0, maxY: SIZE - 1 },
            random: new SeededRandom(0x12345678),
            active,
            fixedOpen: new Set([mazeEdgeKey(...fixedOpenEdge)]),
            fixedClosed: new Set([mazeEdgeKey(...fixedClosedEdge)]),
            preferredClosed: new Set(),
            verticalBreaks: {
                columns: [],
                phaseByX: new Int8Array(SIZE).fill(-1),
                forcedCutsByX: Array.from({ length: SIZE }, () => []),
                rejectClose: () => false,
            },
            targetEdges: Math.ceil(active.length * 1.3),
            maxVerticalStraightTiles: SIZE,
            maxHorizontalWallTiles: SIZE,
            groupForEdge: mirroredGroup,
            isCanonicalEdge: (from, to) => {
                const edge = orderedMazeEdge(from, to);
                const mirror = orderedMazeEdge(mirrorCell(from), mirrorCell(to));
                return mazeEdgeKey(...edge) <= mazeEdgeKey(...mirror);
            },
            isCanonicalSquare: (x) => x < Math.floor(SIZE / 2),
            externalExitCount: () => 0,
            acceptGraph: (candidate) => isConnected(candidate),
        });

        expect(graph).not.toBeNull();
        if (!graph) return;
        for (let from = 0; from < graph.length; from += 1) {
            for (const to of graph[from]) {
                expect(graph[mirrorCell(from)].has(mirrorCell(to))).toBe(true);
            }
        }
        for (const [from, to] of mirroredGroup(...fixedOpenEdge)) {
            expect(graph[from].has(to)).toBe(true);
        }
        for (const [from, to] of mirroredGroup(...fixedClosedEdge)) {
            expect(graph[from].has(to)).toBe(false);
        }
        for (let y = 0; y < SIZE - 1; y += 1) {
            for (let x = 0; x < SIZE - 1; x += 1) {
                const topLeft = at(x, y);
                const topRight = at(x + 1, y);
                const bottomLeft = at(x, y + 1);
                const bottomRight = at(x + 1, y + 1);
                expect(
                    graph[topLeft].has(topRight) &&
                        graph[topRight].has(bottomRight) &&
                        graph[bottomLeft].has(bottomRight) &&
                        graph[topLeft].has(bottomLeft)
                ).toBe(false);
            }
        }
    });
});
