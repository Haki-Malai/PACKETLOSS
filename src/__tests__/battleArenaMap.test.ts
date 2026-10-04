import { describe, expect, it } from 'vitest';
import { ENDLESS_SETTINGS } from '../game/shared/endlessSettings';
import {
    BATTLE_ARENA_LOGO,
    BATTLE_ARENA_MAX_STAGE,
    BATTLE_ARENA_MAX_VERTICAL_STRAIGHT_TILES,
    BATTLE_ARENA_PORTAL_COLUMN,
    BATTLE_ARENA_PORTAL_ROW,
    battleArenaBounds,
    battleArenaMapAtStage,
    battleArenaOuterBounds,
    createBattleArenaMap,
    createBattleArenaWorldMap,
} from '../game/simulation/BattleArenaMap';

const MAP_SEED = 0x12345678;
const map = createBattleArenaMap(MAP_SEED);
const alternateMap = createBattleArenaMap(0x87654321);

/** Serializes physical edges once so seed variation has an observable topology check. */
function physicalEdges(mapToRead: typeof map): string[] {
    return mapToRead.cells.flatMap((cell, from) =>
        cell.edges
            .filter((edge) => !edge.portal && from < edge.to)
            .map((edge) => `${from}:${edge.to}`)
    );
}

/** Returns whether one generated map contains an adjacent physical passage. */
function mapHasPhysicalEdge(mapToRead: typeof map, from: number, to: number): boolean {
    return mapToRead.cells[from].edges.some((edge) => !edge.portal && edge.to === to);
}

/** Returns whether one cell belongs to fixed lanes or a nested contraction corner. */
function isProtectedStyleCell(x: number, y: number): boolean {
    if (y === BATTLE_ARENA_PORTAL_ROW || x === BATTLE_ARENA_PORTAL_COLUMN) return true;
    if (
        y === BATTLE_ARENA_LOGO.y - 1 &&
        x >= BATTLE_ARENA_LOGO.minX - 1 &&
        x <= BATTLE_ARENA_LOGO.maxX + 1
    )
        return true;
    if (
        (x === BATTLE_ARENA_LOGO.minX - 1 || x === BATTLE_ARENA_LOGO.maxX + 1) &&
        y >= BATTLE_ARENA_LOGO.y - 1 &&
        y <= BATTLE_ARENA_LOGO.y + 1
    )
        return true;
    return Array.from({ length: BATTLE_ARENA_MAX_STAGE + 1 }, (_, stage) =>
        battleArenaBounds(stage)
    ).some(
        (bounds) =>
            (x === bounds.minX || x === bounds.maxX) && (y === bounds.minY || y === bounds.maxY)
    );
}

describe('seeded Battle Royale arena', () => {
    it('keeps stable cells, mirrored walls, fixed lanes, centered lettering, and twelve mirrored cores', () => {
        expect([map.width, map.height, map.cells.length]).toEqual([49, 49, 49 * 49]);
        expect(map.arena).toEqual({ kind: 'battle-arena', seed: MAP_SEED, version: 3 });
        map.cells.forEach((cell, id) =>
            expect([cell.x, cell.y]).toEqual([id % 49, Math.floor(id / 49)])
        );
        expect(map.spawns.map((id) => [map.cells[id].x, map.cells[id].y])).toEqual([
            [11, 21],
            [37, 21],
            [11, 30],
            [37, 30],
        ]);
        expect(map.pickups).toHaveLength(47 * 47 - 5);

        for (const cell of map.cells) {
            for (const edge of cell.edges.filter((candidate) => !candidate.portal)) {
                const mirroredFrom = cell.y * 49 + 48 - cell.x;
                const target = map.cells[edge.to];
                const mirroredTo = target.y * 49 + 48 - target.x;
                expect(
                    map.cells[mirroredFrom].edges.some(
                        (candidate) => !candidate.portal && candidate.to === mirroredTo
                    )
                ).toBe(true);
            }
        }
        for (let x = 1; x < 47; x += 1) {
            const from = BATTLE_ARENA_PORTAL_ROW * 49 + x;
            expect(map.cells[from].edges.some((edge) => !edge.portal && edge.to === from + 1)).toBe(
                true
            );
        }
        for (let y = 1; y < 47; y += 1) {
            const from = y * 49 + BATTLE_ARENA_PORTAL_COLUMN;
            const touchesLogo = [y, y + 1].some((row) => row === BATTLE_ARENA_LOGO.y);
            expect(
                map.cells[from].edges.some((edge) => !edge.portal && edge.to === from + 49)
            ).toBe(!touchesLogo);
        }

        const cores = map.pickups.filter((pickup) => pickup.kind === 'core');
        expect(cores).toHaveLength(12);
        for (const core of cores) {
            const cell = map.cells[core.cell];
            expect(
                cores.some((candidate) => {
                    const other = map.cells[candidate.cell];
                    return other.x === 48 - cell.x && other.y === cell.y;
                })
            ).toBe(true);
        }
        const world = createBattleArenaWorldMap(map, 0);
        expect(world.tiles[24].slice(22, 27).map((tile) => tile.localId)).toEqual([
            17, 18, 19, 20, 21,
        ]);
        expect(world.tiles.flat().some((tile) => tile.localId === 16)).toBe(false);
        expect(world.tiles[0][0].gid).not.toBeNull();
        expect(world.tiles[0][24].localId).toBe(23);
        expect(physicalEdges(createBattleArenaMap(MAP_SEED))).toEqual(physicalEdges(map));
        expect(physicalEdges(alternateMap)).not.toEqual(physicalEdges(map));
        for (let x = 21; x < 27; x += 1) {
            const from = 23 * 49 + x;
            expect(map.cells[from].edges.some((edge) => !edge.portal && edge.to === from + 1)).toBe(
                true
            );
        }
        for (const x of [21, 27]) {
            for (let y = 23; y < 25; y += 1) {
                const from = y * 49 + x;
                expect(
                    map.cells[from].edges.some((edge) => !edge.portal && edge.to === from + 49)
                ).toBe(true);
            }
        }
        for (const generated of [map, alternateMap]) {
            for (const y of [22, 25]) {
                for (const x of [22, 23, 25, 26]) {
                    expect(mapHasPhysicalEdge(generated, y * 49 + x, (y + 1) * 49 + x)).toBe(false);
                }
                expect(mapHasPhysicalEdge(generated, y * 49 + 24, (y + 1) * 49 + 24)).toBe(true);
            }
            for (const y of [23, 26]) {
                for (let x = 21; x < 27; x += 1) {
                    expect(mapHasPhysicalEdge(generated, y * 49 + x, y * 49 + x + 1)).toBe(true);
                }
            }
        }
    });

    it('uses Endless wall cleanup and mirrored center rails without detached four-corner pillars', () => {
        let horizontalStraights = 0;
        let verticalStraights = 0;
        for (let seed = 1; seed <= 32; seed += 1) {
            const generated = createBattleArenaMap(seed);
            for (const [minY, maxY] of [
                [2, 22],
                [27, 46],
            ]) {
                let run = 0;
                let longestRun = 0;
                let openings = 0;
                for (let y = minY; y <= maxY; y += 1) {
                    const center = y * 49 + 24;
                    const leftOpen = mapHasPhysicalEdge(generated, center, center - 1);
                    expect(mapHasPhysicalEdge(generated, center, center + 1)).toBe(leftOpen);
                    run = leftOpen ? 0 : run + 1;
                    longestRun = Math.max(longestRun, run);
                    if (leftOpen) openings += 1;
                }
                expect(longestRun).toBeGreaterThanOrEqual(2);
                expect(openings).toBeGreaterThanOrEqual(2);
            }
            const unexpectedOpenSquares: Array<[number, number]> = [];
            for (let y = 1; y < 47; y += 1) {
                for (let x = 1; x < 47; x += 1) {
                    const a = y * 49 + x;
                    const b = a + 1;
                    const c = a + 49;
                    const d = c + 1;
                    if (
                        mapHasPhysicalEdge(generated, a, b) &&
                        mapHasPhysicalEdge(generated, a, c) &&
                        mapHasPhysicalEdge(generated, b, d) &&
                        mapHasPhysicalEdge(generated, c, d)
                    )
                        unexpectedOpenSquares.push([x, y]);
                }
            }
            expect({ seed, unexpectedOpenSquares }).toEqual({ seed, unexpectedOpenSquares: [] });

            for (let x = 1; x <= 47; x += 1) {
                if (x === BATTLE_ARENA_PORTAL_COLUMN) continue;
                let run = 1;
                for (let y = 1; y < 47; y += 1) {
                    const protectedBypass =
                        (x === BATTLE_ARENA_LOGO.minX - 1 || x === BATTLE_ARENA_LOGO.maxX + 1) &&
                        y >= BATTLE_ARENA_LOGO.y - 1 &&
                        y <= BATTLE_ARENA_LOGO.y;
                    const touchesLogo = [y, y + 1].some(
                        (row) =>
                            row === BATTLE_ARENA_LOGO.y &&
                            x >= BATTLE_ARENA_LOGO.minX &&
                            x <= BATTLE_ARENA_LOGO.maxX
                    );
                    run =
                        protectedBypass || touchesLogo
                            ? 1
                            : mapHasPhysicalEdge(generated, y * 49 + x, (y + 1) * 49 + x)
                              ? run + 1
                              : 1;
                    expect(run).toBeLessThanOrEqual(BATTLE_ARENA_MAX_VERTICAL_STRAIGHT_TILES);
                }
            }

            for (let y = 1; y < 47; y += 1) {
                let wallRun = 0;
                for (let x = 1; x <= 47; x += 1) {
                    const touchesLogo = [y, y + 1].some(
                        (row) =>
                            row === BATTLE_ARENA_LOGO.y &&
                            x >= BATTLE_ARENA_LOGO.minX &&
                            x <= BATTLE_ARENA_LOGO.maxX
                    );
                    wallRun =
                        touchesLogo || mapHasPhysicalEdge(generated, y * 49 + x, (y + 1) * 49 + x)
                            ? 0
                            : wallRun + 1;
                    expect(wallRun).toBeLessThanOrEqual(ENDLESS_SETTINGS.maxHorizontalWallTiles);
                }
            }

            const eligible = generated.cells.filter(
                ({ x, y }) =>
                    x >= 1 &&
                    x <= 47 &&
                    y >= 1 &&
                    y <= 47 &&
                    !(
                        y === BATTLE_ARENA_LOGO.y &&
                        x >= BATTLE_ARENA_LOGO.minX &&
                        x <= BATTLE_ARENA_LOGO.maxX
                    ) &&
                    !isProtectedStyleCell(x, y)
            );
            const degreeTwo = eligible.filter(
                (cell) => cell.edges.filter((edge) => !edge.portal).length === 2
            );
            let straight = 0;
            for (const cell of degreeTwo) {
                const directions = cell.edges
                    .filter((edge) => !edge.portal)
                    .map((edge) => edge.direction);
                if (directions.includes('left') && directions.includes('right')) {
                    straight += 1;
                    horizontalStraights += 1;
                } else if (directions.includes('up') && directions.includes('down')) {
                    straight += 1;
                    verticalStraights += 1;
                }
            }
            expect(degreeTwo.length / eligible.length).toBeGreaterThan(0.45);
            expect(degreeTwo.length / eligible.length).toBeLessThan(0.85);
            expect(straight / degreeTwo.length).toBeGreaterThan(0.5);
        }
        expect(horizontalStraights).toBeGreaterThan(verticalStraights);
    }, 30_000);

    it.each([map, alternateMap])('keeps all shrink stages connected ($id)', (generated) => {
        let portalMouthsWithOnePhysicalExit = 0;
        for (let stage = 0; stage <= BATTLE_ARENA_MAX_STAGE; stage += 1) {
            const staged = battleArenaMapAtStage(generated, stage);
            const bounds = battleArenaBounds(stage);
            const outer = battleArenaOuterBounds(stage);
            expect([outer.maxX - outer.minX + 1, bounds.maxX - bounds.minX + 1]).toEqual([
                49 - stage * 2,
                47 - stage * 2,
            ]);
            const active = staged.cells
                .map((cell, id) => ({ cell, id }))
                .filter(
                    ({ cell }) =>
                        cell.x >= bounds.minX &&
                        cell.x <= bounds.maxX &&
                        cell.y >= bounds.minY &&
                        cell.y <= bounds.maxY &&
                        !(cell.y === 24 && cell.x >= 22 && cell.x <= 26)
                );
            const activeIds = new Set(active.map(({ id }) => id));
            for (const { cell } of active) {
                const physical = cell.edges.filter(
                    (edge) => !edge.portal && activeIds.has(edge.to)
                );
                expect(physical.length).toBeGreaterThanOrEqual(1);
                expect(
                    cell.edges.filter((edge) => activeIds.has(edge.to)).length
                ).toBeGreaterThanOrEqual(2);
                if (physical.length === 1) {
                    expect(cell.edges.some((edge) => edge.portal)).toBe(true);
                    portalMouthsWithOnePhysicalExit += 1;
                }
            }
            const reached = new Set([active[0].id]);
            const queue = [active[0].id];
            for (let cursor = 0; cursor < queue.length; cursor += 1) {
                for (const edge of staged.cells[queue[cursor]].edges) {
                    if (!edge.portal && activeIds.has(edge.to) && !reached.has(edge.to)) {
                        reached.add(edge.to);
                        queue.push(edge.to);
                    }
                }
            }
            expect(reached.size).toBe(active.length);
            const portals = staged.cells.flatMap((cell, from) =>
                cell.edges.filter((edge) => edge.portal).map((edge) => ({ from, ...edge }))
            );
            expect(portals).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        from: BATTLE_ARENA_PORTAL_ROW * 49 + bounds.minX,
                        to: BATTLE_ARENA_PORTAL_ROW * 49 + bounds.maxX,
                        direction: 'left',
                    }),
                    expect.objectContaining({
                        from: bounds.minY * 49 + BATTLE_ARENA_PORTAL_COLUMN,
                        to: bounds.maxY * 49 + BATTLE_ARENA_PORTAL_COLUMN,
                        direction: 'up',
                    }),
                ])
            );
            expect(portals).toHaveLength(4);

            const world = createBattleArenaWorldMap(generated, stage);
            expect(world.portalPairs).toEqual([
                { from: { x: bounds.minX, y: 25 }, to: { x: bounds.maxX, y: 25 } },
                { from: { x: 24, y: bounds.minY }, to: { x: 24, y: bounds.maxY } },
            ]);
            if (stage > 0) expect(world.tiles[outer.minY - 1][24].gid).toBeNull();
            expect(world.tiles[outer.minY][24].localId).toBe(23);
            expect(world.tiles[24].slice(22, 27).map((tile) => tile.localId)).toEqual([
                17, 18, 19, 20, 21,
            ]);
            expect(world.tiles[outer.minY][outer.minX].collision.collides).toBe(true);
            expect(world.tiles[bounds.minY + 1][bounds.minX].collision.left).toBe(true);
        }
        expect(portalMouthsWithOnePhysicalExit).toBeGreaterThan(0);
    });
});
