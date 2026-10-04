import { describe, expect, it } from 'vitest';
import { buildMazeWallPatterns } from '../game/domain/world/MazeWallPatterns';
import { SeededRandom } from '../game/shared/random/SeededRandom';

describe('shared maze wall patterns', () => {
    it('builds deterministic adjacent motifs and complete open loops inside the requested area', () => {
        const patterns = buildMazeWallPatterns(25, 49, new SeededRandom(0x12345678), 12, 4);
        expect(buildMazeWallPatterns(25, 49, new SeededRandom(0x12345678), 12, 4)).toEqual(
            patterns
        );
        expect(patterns.preferredClosed.length).toBeGreaterThan(100);
        expect(patterns.openLoops).toHaveLength(4);

        for (const edge of [
            ...patterns.preferredClosed,
            ...patterns.openLoops.flatMap((loop) => loop.edges),
        ]) {
            for (const point of [edge.from, edge.to]) {
                expect(point.x).toBeGreaterThan(0);
                expect(point.x).toBeLessThan(24);
                expect(point.y).toBeGreaterThan(0);
                expect(point.y).toBeLessThan(48);
            }
            expect(Math.abs(edge.from.x - edge.to.x) + Math.abs(edge.from.y - edge.to.y)).toBe(1);
        }

        for (const loop of patterns.openLoops) {
            const degrees = new Map(loop.cells.map(({ x, y }) => [`${x}:${y}`, 0]));
            loop.edges.forEach(({ from, to }) => {
                const fromKey = `${from.x}:${from.y}`;
                const toKey = `${to.x}:${to.y}`;
                degrees.set(fromKey, (degrees.get(fromKey) ?? 0) + 1);
                degrees.set(toKey, (degrees.get(toKey) ?? 0) + 1);
            });
            expect(
                [...degrees.values()].filter((degree) => degree > 0).every((degree) => degree === 2)
            ).toBe(true);
        }
    });
});
