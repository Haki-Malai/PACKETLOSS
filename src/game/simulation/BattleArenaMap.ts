import { SeededRandom } from '../shared/random/SeededRandom';
import type { CollisionTile } from '../domain/world/CollisionGrid';
import {
    carveMazeGraph,
    mazeEdgeKey,
    orderedMazeEdge,
    type MazeGraph,
    type MazeGraphEdge,
    type MazeGraphEdgeGroup,
} from '../domain/world/MazeGraphCarver';
import { buildMazeWallPatterns } from '../domain/world/MazeWallPatterns';
import type { PortalPair, WorldMapData, WorldTile } from '../domain/world/WorldState';
import { DIRECTION_VECTORS } from '../domain/valueObjects/Direction';
import { ENDLESS_SETTINGS } from '../shared/endlessSettings';
import { DIRECTIONS, type Cell, type Direction, type Edge, type RaceMap } from './types';

export const BATTLE_ARENA_SIZE = 49;
export const BATTLE_ARENA_CENTER = 24;
export const BATTLE_ARENA_MAX_STAGE = 20;
export const BATTLE_ARENA_GENERATION_VERSION = 3;
export const BATTLE_ARENA_MAX_VERTICAL_STRAIGHT_TILES =
    ENDLESS_SETTINGS.maxVerticalStraightTiles + 3;
export const BATTLE_ARENA_LOGO = Object.freeze({ minX: 22, maxX: 26, y: 24 });
export const BATTLE_ARENA_PORTAL_ROW = 25;
export const BATTLE_ARENA_PORTAL_COLUMN = 24;

export interface BattleArenaBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

type PhysicalGraph = MazeGraph;
type GraphEdge = MazeGraphEdge;

const CORE_POSITIONS = [
    [1, 1],
    [47, 1],
    [22, 3],
    [26, 3],
    [11, 10],
    [37, 10],
    [3, 24],
    [45, 24],
    [10, 36],
    [38, 36],
    [1, 47],
    [47, 47],
] as const;
const SPAWN_POSITIONS = [
    [11, 21],
    [37, 21],
    [11, 30],
    [37, 30],
] as const;
const WALL_PATTERN_MOTIFS = 12;
const WALL_PATTERN_LOOPS = 4;
const GENERATION_ATTEMPTS = 256;

/** Converts a stable arena coordinate to its cell identifier. */
function cellAt(x: number, y: number): number {
    return y * BATTLE_ARENA_SIZE + x;
}

/** Mixes arena generation attempts into independent deterministic random streams. */
function mixArenaSeed(seed: number, index: number, salt: number): number {
    let value = (seed ^ Math.imul(index, 0x9e3779b1) ^ salt) >>> 0;
    value = Math.imul(value ^ (value >>> 16), 0x85ebca6b);
    value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
    return (value ^ (value >>> 16)) >>> 0;
}

/** Returns whether a coordinate is occupied by the fixed PACKETLOSS lettering. */
function isLogoCoordinate(x: number, y: number): boolean {
    return y === BATTLE_ARENA_LOGO.y && x >= BATTLE_ARENA_LOGO.minX && x <= BATTLE_ARENA_LOGO.maxX;
}

/** Validates and returns the inclusive visible square, including its wall ring. */
export function battleArenaOuterBounds(stage: number): BattleArenaBounds {
    if (!Number.isInteger(stage) || stage < 0 || stage > BATTLE_ARENA_MAX_STAGE) {
        throw new Error(
            `Battle arena stage must be an integer from 0 to ${BATTLE_ARENA_MAX_STAGE}.`
        );
    }
    return {
        minX: stage,
        maxX: BATTLE_ARENA_SIZE - 1 - stage,
        minY: stage,
        maxY: BATTLE_ARENA_SIZE - 1 - stage,
    };
}

/** Returns the inclusive playable centers immediately inside a stage's wall ring. */
export function battleArenaBounds(stage: number): BattleArenaBounds {
    const outer = battleArenaOuterBounds(stage);
    return {
        minX: outer.minX + 1,
        maxX: outer.maxX - 1,
        minY: outer.minY + 1,
        maxY: outer.maxY - 1,
    };
}

const STAGE_VALIDATION = Array.from({ length: BATTLE_ARENA_MAX_STAGE + 1 }, (_, stage) => {
    const bounds = battleArenaBounds(stage);
    const active = new Uint8Array(BATTLE_ARENA_SIZE ** 2);
    const portalExits = new Uint8Array(active.length);
    for (const { from, to } of stagePortalPairs(bounds)) {
        portalExits[cellAt(from.x, from.y)] = 1;
        portalExits[cellAt(to.x, to.y)] = 1;
    }
    const cells: number[] = [];
    for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
        for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
            if (isLogoCoordinate(x, y)) continue;
            const cell = cellAt(x, y);
            active[cell] = 1;
            cells.push(cell);
        }
    }
    return { active, cells, portalExits };
});

/** Reflects a stable cell identifier across the arena's vertical center line. */
function mirrorCell(cell: number): number {
    const x = cell % BATTLE_ARENA_SIZE;
    const y = Math.floor(cell / BATTLE_ARENA_SIZE);
    return cellAt(BATTLE_ARENA_SIZE - 1 - x, y);
}

/** Gives an undirected physical connection a canonical serialization key. */
function edgeKey(from: number, to: number): string {
    return mazeEdgeKey(from, to);
}

/** Returns a consistently ordered undirected edge. */
function orderedEdge(from: number, to: number): GraphEdge {
    return orderedMazeEdge(from, to);
}

/** Protects the central lanes and the two fixed bypasses around the logo. */
function isProtectedEdge(from: number, to: number): boolean {
    const ax = from % BATTLE_ARENA_SIZE;
    const ay = Math.floor(from / BATTLE_ARENA_SIZE);
    const bx = to % BATTLE_ARENA_SIZE;
    const by = Math.floor(to / BATTLE_ARENA_SIZE);
    if (ay === by && ay === BATTLE_ARENA_PORTAL_ROW) return true;
    if (ax === bx && ax === BATTLE_ARENA_PORTAL_COLUMN) return true;
    const minX = Math.min(ax, bx),
        maxX = Math.max(ax, bx);
    const minY = Math.min(ay, by),
        maxY = Math.max(ay, by);
    const horizontalBypass =
        ay === by &&
        (ay === BATTLE_ARENA_LOGO.y - 1 || ay === BATTLE_ARENA_PORTAL_ROW + 1) &&
        minX >= BATTLE_ARENA_LOGO.minX - 1 &&
        maxX <= BATTLE_ARENA_LOGO.maxX + 1;
    const verticalBypass =
        ax === bx &&
        (ax === BATTLE_ARENA_LOGO.minX - 1 || ax === BATTLE_ARENA_LOGO.maxX + 1) &&
        minY >= BATTLE_ARENA_LOGO.y - 1 &&
        maxY <= BATTLE_ARENA_LOGO.y + 1;
    return horizontalBypass || verticalBypass;
}

/** Returns one physical edge together with its horizontal mirror. */
function mirroredEdgeGroup(from: number, to: number): MazeGraphEdgeGroup {
    const edge = orderedEdge(from, to);
    const mirror = orderedEdge(mirrorCell(from), mirrorCell(to));
    return edgeKey(...edge) === edgeKey(...mirror) ? [edge] : [edge, mirror];
}

/** Selects one stable representative for each mirrored edge group. */
function isCanonicalEdge(from: number, to: number): boolean {
    const edge = orderedEdge(from, to);
    const mirror = orderedEdge(mirrorCell(from), mirrorCell(to));
    return edgeKey(...edge) <= edgeKey(...mirror);
}

/** Returns the deepest stage at which both ends of an edge remain active. */
function lastActiveStage(edge: GraphEdge): number {
    return Math.min(
        ...edge.flatMap((cell) => {
            const x = cell % BATTLE_ARENA_SIZE;
            const y = Math.floor(cell / BATTLE_ARENA_SIZE);
            return [x - 1, y - 1, BATTLE_ARENA_SIZE - 2 - x, BATTLE_ARENA_SIZE - 2 - y];
        }),
        BATTLE_ARENA_MAX_STAGE
    );
}

/** Checks physical connectivity and two exits per tile, including active portal links. */
function isValidStage(graph: PhysicalGraph, stage: number): boolean {
    const { active, cells, portalExits } = STAGE_VALIDATION[stage];
    for (const cell of cells) {
        let exits = portalExits[cell];
        for (const neighbor of graph[cell]) exits += active[neighbor];
        if (exits < 2) return false;
    }
    const visited = new Uint8Array(graph.length);
    const queue = [cells[0]];
    visited[cells[0]] = 1;
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
        for (const neighbor of graph[queue[cursor]]) {
            if (active[neighbor] && !visited[neighbor]) {
                visited[neighbor] = 1;
                queue.push(neighbor);
            }
        }
    }
    return queue.length === cells.length;
}

/** Checks whether two active cells remain joined after one candidate wall group is removed. */
function hasActivePath(
    graph: PhysicalGraph,
    active: Uint8Array,
    from: number,
    to: number,
    visited: Uint32Array,
    queue: Int32Array,
    search: number
): boolean {
    let head = 0,
        tail = 1;
    queue[0] = from;
    visited[from] = search;
    while (head < tail) {
        const cell = queue[head++];
        for (const neighbor of graph[cell]) {
            if (!active[neighbor] || visited[neighbor] === search) continue;
            if (neighbor === to) return true;
            visited[neighbor] = search;
            queue[tail++] = neighbor;
        }
    }
    return false;
}

/** Validates only the degrees and replacement paths affected by one proposed wall group. */
function acceptsRemoval(
    graph: PhysicalGraph,
    group: readonly GraphEdge[],
    finalStage: number,
    visited: Uint32Array,
    queue: Int32Array,
    nextSearch: () => number
): boolean {
    for (let stage = 0; stage <= finalStage; stage += 1) {
        const { active, portalExits } = STAGE_VALIDATION[stage];
        const endpoints = new Set(group.flat());
        for (const cell of endpoints) {
            if (!active[cell]) continue;
            let exits = portalExits[cell];
            for (const neighbor of graph[cell]) exits += active[neighbor];
            if (exits < 2) return false;
        }
        for (const [from, to] of group) {
            if (
                active[from] &&
                !hasActivePath(graph, active, from, to, visited, queue, nextSearch())
            ) {
                return false;
            }
        }
    }
    return true;
}

/** Builds one shared-carver attempt with mirrored decisions and fixed central lanes. */
function carveGraphAttempt(seed: number): PhysicalGraph | null {
    const bounds = battleArenaBounds(0);
    const active = STAGE_VALIDATION[0].active;
    const random = new SeededRandom(seed);
    const fixedOpen = new Set<string>();
    const fixedClosed = new Set<string>();
    for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
        for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
            const from = cellAt(x, y);
            if (!active[from]) continue;
            for (const [nx, ny] of [
                [x + 1, y],
                [x, y + 1],
            ]) {
                if (nx > bounds.maxX || ny > bounds.maxY) continue;
                const to = cellAt(nx, ny);
                if (active[to] && isProtectedEdge(from, to)) fixedOpen.add(edgeKey(from, to));
            }
        }
    }
    for (let stage = 0; stage <= BATTLE_ARENA_MAX_STAGE; stage += 1) {
        const stageBounds = battleArenaBounds(stage);
        for (const x of [stageBounds.minX, stageBounds.maxX]) {
            fixedOpen.add(edgeKey(cellAt(x, stageBounds.minY), cellAt(x, stageBounds.minY + 1)));
            fixedOpen.add(edgeKey(cellAt(x, stageBounds.maxY - 1), cellAt(x, stageBounds.maxY)));
        }
    }
    // Echo the short straight frame above the lettering below its portal corridor.
    // The center gap preserves the north/south portal lane; the jail is not copied.
    for (const y of [BATTLE_ARENA_LOGO.y - 2, BATTLE_ARENA_PORTAL_ROW]) {
        for (let x: number = BATTLE_ARENA_LOGO.minX; x <= BATTLE_ARENA_LOGO.maxX; x += 1) {
            if (x === BATTLE_ARENA_PORTAL_COLUMN) continue;
            fixedClosed.add(edgeKey(cellAt(x, y), cellAt(x, y + 1)));
        }
    }
    const patterns = buildMazeWallPatterns(
        BATTLE_ARENA_CENTER + 1,
        BATTLE_ARENA_SIZE,
        random,
        WALL_PATTERN_MOTIFS,
        WALL_PATTERN_LOOPS
    );
    const preferredClosed = new Set<string>();
    for (const { from, to } of patterns.preferredClosed) {
        for (const edge of mirroredEdgeGroup(cellAt(from.x, from.y), cellAt(to.x, to.y))) {
            preferredClosed.add(edgeKey(...edge));
        }
    }
    // Give the full center lane short rails with seeded gaps between them.
    // Mirrored closures can now survive when shrinking turns these tiles into portal mouths.
    for (let y = bounds.minY + random.int(3); y <= bounds.maxY; ) {
        const endY = Math.min(y + 2 + random.int(3), bounds.maxY + 1);
        for (; y < endY; y += 1) {
            const group = mirroredEdgeGroup(
                cellAt(BATTLE_ARENA_PORTAL_COLUMN - 1, y),
                cellAt(BATTLE_ARENA_PORTAL_COLUMN, y)
            );
            if (
                group.some(
                    ([from, to]) => !active[from] || !active[to] || fixedOpen.has(edgeKey(from, to))
                )
            )
                continue;
            for (const edge of group) fixedClosed.add(edgeKey(...edge));
        }
        y += 2 + random.int(3);
    }
    for (const loop of patterns.openLoops) {
        if (loop.cells.some(({ x, y }) => !active[cellAt(x, y)])) continue;
        if (
            loop.edges.some(({ from, to }) =>
                mirroredEdgeGroup(cellAt(from.x, from.y), cellAt(to.x, to.y)).some((edge) =>
                    fixedClosed.has(edgeKey(...edge))
                )
            )
        )
            continue;
        for (const { from, to } of loop.edges) {
            for (const edge of mirroredEdgeGroup(cellAt(from.x, from.y), cellAt(to.x, to.y))) {
                fixedOpen.add(edgeKey(...edge));
            }
        }
    }

    const phaseByX = new Int8Array(BATTLE_ARENA_SIZE).fill(-1);
    for (let x = bounds.minX + 2; x < BATTLE_ARENA_CENTER - 2; x += 1) {
        let phase = mixArenaSeed(seed, x, 0x14cb3a27) % 3;
        if (
            x >= bounds.minX + 5 &&
            phaseByX[x - 1] === phase &&
            phaseByX[x - 2] === phase &&
            phaseByX[x - 3] === phase
        )
            phase = (phase + 1) % 3;
        phaseByX[x] = phase;
    }
    for (let x = bounds.minX; x < BATTLE_ARENA_CENTER; x += 1) {
        const phase = phaseByX[x] >= 0 ? phaseByX[x] : mixArenaSeed(seed, x, 0x51f2a8c7) % 4;
        for (let y = bounds.minY; y < bounds.maxY; y += 1) {
            if (y % 4 !== phase) continue;
            for (const edge of mirroredEdgeGroup(cellAt(x, y), cellAt(x, y + 1))) {
                if (!fixedOpen.has(edgeKey(...edge))) preferredClosed.add(edgeKey(...edge));
            }
        }
    }
    const forcedCutsByX = Array.from({ length: BATTLE_ARENA_SIZE }, () => [] as number[]);
    const visited = new Uint32Array(BATTLE_ARENA_SIZE ** 2);
    const queue = new Int32Array(BATTLE_ARENA_SIZE ** 2);
    let search = 0;
    return carveMazeGraph({
        width: BATTLE_ARENA_SIZE,
        height: BATTLE_ARENA_SIZE,
        bounds,
        random,
        active,
        fixedOpen,
        fixedClosed,
        preferredClosed,
        verticalBreaks: {
            columns: [],
            phaseByX,
            forcedCutsByX,
            rejectClose: (_x, _y, currentRun) => currentRun === 1,
        },
        targetEdges: Math.ceil(STAGE_VALIDATION[0].cells.length * 1.08),
        // Nested perimeters retain more passages than a streaming Endless section, so the same
        // run-repair pass gets three extra tiles rather than weakening any contraction's two-exit rule.
        maxVerticalStraightTiles: BATTLE_ARENA_MAX_VERTICAL_STRAIGHT_TILES,
        maxHorizontalWallTiles: ENDLESS_SETTINGS.maxHorizontalWallTiles,
        groupForEdge: mirroredEdgeGroup,
        isCanonicalEdge,
        isCanonicalSquare: (x) => x < BATTLE_ARENA_CENTER,
        externalExitCount: (cell) => STAGE_VALIDATION[0].portalExits[cell],
        acceptGraph: (graph, changed) => {
            if (changed.length === 0) {
                return STAGE_VALIDATION.every((_, stage) => isValidStage(graph, stage));
            }
            const finalStage = Math.max(...changed.map(lastActiveStage));
            return acceptsRemoval(graph, changed, finalStage, visited, queue, () => ++search);
        },
        repairEndpointNeedsOpening: (graph, endpoint, closingGroup) =>
            STAGE_VALIDATION.some(({ active: stageActive, portalExits }) => {
                if (!stageActive[endpoint]) return false;
                let exits = portalExits[endpoint];
                for (const neighbor of graph[endpoint]) exits += stageActive[neighbor];
                const removed = closingGroup.filter(
                    ([from, to]) =>
                        (from === endpoint && stageActive[to]) ||
                        (to === endpoint && stageActive[from])
                ).length;
                return exits - removed < 2;
            }),
        repairOpeningAllowed: (graph, endpoint, openingGroup, closingGroup) => {
            const opening = openingGroup.find(([from, to]) => from === endpoint || to === endpoint);
            if (!opening) return false;
            const other = opening[0] === endpoint ? opening[1] : opening[0];
            const preservesStageExits = STAGE_VALIDATION.every(
                ({ active: stageActive, portalExits }) => {
                    if (!stageActive[endpoint]) return true;
                    let exits = portalExits[endpoint];
                    for (const neighbor of graph[endpoint]) exits += stageActive[neighbor];
                    const removed = closingGroup.filter(
                        ([from, to]) =>
                            (from === endpoint && stageActive[to]) ||
                            (to === endpoint && stageActive[from])
                    ).length;
                    return exits - removed >= 2 || Boolean(stageActive[other]);
                }
            );
            return preservesStageExits;
        },
        exhaustiveRepair: true,
        repairVerticalRuns: true,
        skipVerticalRunColumn: (x) => x === BATTLE_ARENA_PORTAL_COLUMN,
    });
}

/** Places Endless-style symmetric walls while keeping every future arena playable. */
function carveGraph(seed: number): PhysicalGraph {
    for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt += 1) {
        const trialSeed =
            attempt === 0 ? seed ^ 0x7e31a5d9 : mixArenaSeed(seed, attempt, 0x6c39a2e5);
        const graph = carveGraphAttempt(trialSeed);
        if (graph) return graph;
    }
    throw new Error(`Could not generate a Battle Royale arena for seed ${seed}.`);
}

/** Resolves the movement direction between adjacent physical cells. */
function directionBetween(from: number, to: number): Direction {
    const x = from % BATTLE_ARENA_SIZE;
    const y = Math.floor(from / BATTLE_ARENA_SIZE);
    const nx = to % BATTLE_ARENA_SIZE;
    const ny = Math.floor(to / BATTLE_ARENA_SIZE);
    const direction = DIRECTIONS.find((candidate) => {
        const vector = DIRECTION_VECTORS[candidate];
        return x + vector.dx === nx && y + vector.dy === ny;
    });
    if (!direction) throw new Error('Battle arena physical edges must connect adjacent cells.');
    return direction;
}

/** Converts the physical graph to stable serializable cell records. */
function graphCells(graph: PhysicalGraph): Cell[] {
    return graph.map((neighbors, cell) => ({
        x: cell % BATTLE_ARENA_SIZE,
        y: Math.floor(cell / BATTLE_ARENA_SIZE),
        edges: [...neighbors]
            .map((to): Edge => ({ to, direction: directionBetween(cell, to), portal: false }))
            .sort(
                (left, right) =>
                    DIRECTIONS.indexOf(left.direction) - DIRECTIONS.indexOf(right.direction)
            ),
    }));
}

/** Adds the two bidirectional boundary portal pairs for the requested stage. */
function addStagePortals(cells: Cell[], bounds: BattleArenaBounds): void {
    const links: Array<readonly [number, number, Direction, Direction]> = [
        [
            cellAt(bounds.minX, BATTLE_ARENA_PORTAL_ROW),
            cellAt(bounds.maxX, BATTLE_ARENA_PORTAL_ROW),
            'left',
            'right',
        ],
        [
            cellAt(BATTLE_ARENA_PORTAL_COLUMN, bounds.minY),
            cellAt(BATTLE_ARENA_PORTAL_COLUMN, bounds.maxY),
            'up',
            'down',
        ],
    ];
    for (const [from, to, outward, reverse] of links) {
        cells[from].edges.push({ to, direction: outward, portal: true });
        cells[to].edges.push({ to: from, direction: reverse, portal: true });
    }
}

/**
 * Generates one deterministic mirrored Battle Royale arena.
 *
 * Cell identifiers always equal `y * 49 + x`, including non-traversable logo cells.
 */
export function createBattleArenaMap(seed: number): RaceMap {
    if (!Number.isSafeInteger(seed)) throw new Error('Battle arena seed must be a safe integer.');
    const normalizedSeed = seed >>> 0;
    const cells = graphCells(carveGraph(normalizedSeed));
    const initialBounds = battleArenaBounds(0);
    addStagePortals(cells, initialBounds);
    const cores = new Set(CORE_POSITIONS.map(([x, y]) => cellAt(x, y)));
    const pickups = cells.flatMap((cell, id) =>
        isLogoCoordinate(cell.x, cell.y) ||
        cell.x < initialBounds.minX ||
        cell.x > initialBounds.maxX ||
        cell.y < initialBounds.minY ||
        cell.y > initialBounds.maxY
            ? []
            : [{ id, cell: id, kind: cores.has(id) ? ('core' as const) : ('bit' as const) }]
    );
    return {
        id: `battle-arena-v${BATTLE_ARENA_GENERATION_VERSION}-${normalizedSeed.toString(16).padStart(8, '0')}`,
        width: BATTLE_ARENA_SIZE,
        height: BATTLE_ARENA_SIZE,
        cells,
        spawns: SPAWN_POSITIONS.map(([x, y]) => cellAt(x, y)),
        enemyHome: cellAt(BATTLE_ARENA_CENTER, BATTLE_ARENA_PORTAL_ROW),
        pickups,
        arena: {
            kind: 'battle-arena',
            seed: normalizedSeed,
            version: BATTLE_ARENA_GENERATION_VERSION,
        },
    };
}

/** Returns whether a stable cell belongs to the surviving square at one stage. */
export function isBattleArenaCellActive(map: RaceMap, cell: number, stage: number): boolean {
    const bounds = battleArenaBounds(stage);
    if (!Number.isInteger(cell) || cell < 0 || cell >= map.cells.length) return false;
    if (!map.arena) return true;
    const { x, y } = map.cells[cell];
    return (
        x >= bounds.minX &&
        x <= bounds.maxX &&
        y >= bounds.minY &&
        y <= bounds.maxY &&
        !isLogoCoordinate(x, y)
    );
}

/**
 * Derives authoritative movement edges for a contraction stage while preserving all cell identifiers.
 * Non-arena fixtures are returned unchanged for simulation tests and authored compatibility.
 */
export function battleArenaMapAtStage(map: RaceMap, stage: number): RaceMap {
    const bounds = battleArenaBounds(stage);
    if (!map.arena) return map;
    const cells = map.cells.map(
        (cell, id): Cell => ({
            ...cell,
            edges: isBattleArenaCellActive(map, id, stage)
                ? cell.edges
                      .filter(
                          (edge) => !edge.portal && isBattleArenaCellActive(map, edge.to, stage)
                      )
                      .map((edge) => ({ ...edge }))
                : [],
        })
    );
    addStagePortals(cells, bounds);
    return { ...map, cells };
}

/** Creates one fully blocking void tile outside the surviving arena. */
function voidTile(x: number, y: number): WorldTile {
    return {
        x,
        y,
        rawGid: 0,
        gid: null,
        localId: null,
        rotation: 0,
        flipX: false,
        flipY: false,
        collision: {
            collides: true,
            penGate: false,
            portal: false,
            up: true,
            right: true,
            down: true,
            left: true,
        },
    };
}

/** Keeps the retired ring's floor visible without contributing authored wall pixels. */
function presentationFloorTile(x: number, y: number): WorldTile {
    return {
        x,
        y,
        rawGid: 15,
        gid: 15,
        localId: null,
        rotation: 0,
        flipX: false,
        flipY: false,
        collision: {
            collides: false,
            penGate: false,
            portal: false,
            up: false,
            right: false,
            down: false,
            left: false,
        },
    };
}

/** Builds a fully blocking perimeter tile with its visible rail facing the playable interior. */
function perimeterTile(x: number, y: number, bounds: BattleArenaBounds): WorldTile {
    const left = x === bounds.minX;
    const right = x === bounds.maxX;
    const top = y === bounds.minY;
    const bottom = y === bounds.maxY;
    const portalTip =
        (y === BATTLE_ARENA_PORTAL_ROW && (left || right)) ||
        (x === BATTLE_ARENA_PORTAL_COLUMN && (top || bottom));
    let localId = portalTip ? 23 : 0;
    let rotation = 0;
    let flipX = false;
    if (left && top) localId = 10;
    else if (right && top) {
        localId = 10;
        rotation = Math.PI / 2;
    } else if (right && bottom) {
        localId = 10;
        rotation = Math.PI;
    } else if (left && bottom) {
        localId = 10;
        rotation = (3 * Math.PI) / 2;
    } else if (left) flipX = !portalTip;
    else if (right) flipX = portalTip;
    else if (top) rotation = portalTip ? Math.PI / 2 : (3 * Math.PI) / 2;
    else if (bottom) rotation = portalTip ? (3 * Math.PI) / 2 : Math.PI / 2;
    return {
        x,
        y,
        rawGid: localId + 1,
        gid: localId + 1,
        localId,
        rotation,
        flipX,
        flipY: false,
        collision: {
            collides: true,
            penGate: false,
            portal: false,
            up: true,
            right: true,
            down: true,
            left: true,
        },
    };
}

/** Converts directional walls to the authored silhouettes shared by maze rendering. */
function corridorTile(cell: Cell, presentationOpenings: readonly Direction[] = []): WorldTile {
    const blocked = DIRECTIONS.map(
        (direction) =>
            !presentationOpenings.includes(direction) &&
            !cell.edges.some((edge) => edge.direction === direction)
    );
    const count = blocked.filter(Boolean).length;
    let localId = 14;
    let rotation = 0;
    if (count === 1) {
        localId = 7;
        rotation = ([3, 0, 1, 2][blocked.findIndex(Boolean)] * Math.PI) / 2;
    } else if (count === 2) {
        if ((blocked[0] && blocked[2]) || (blocked[1] && blocked[3])) {
            localId = 1;
            rotation = blocked[0] ? Math.PI / 2 : 0;
        } else {
            localId = 10;
            rotation =
                blocked[1] && blocked[2]
                    ? 0
                    : blocked[2] && blocked[3]
                      ? Math.PI / 2
                      : blocked[3] && blocked[0]
                        ? Math.PI
                        : (3 * Math.PI) / 2;
        }
    }
    const collision: CollisionTile = {
        collides: count > 0,
        penGate: false,
        portal: cell.edges.some((edge) => edge.portal),
        up: blocked[0],
        right: blocked[1],
        down: blocked[2],
        left: blocked[3],
    };
    return {
        x: cell.x,
        y: cell.y,
        rawGid: localId + 1,
        gid: localId + 1,
        localId,
        rotation,
        flipX: false,
        flipY: false,
        collision,
    };
}

/** Builds one of the five fixed PACKETLOSS marker tiles. */
function logoTile(x: number, y: number): WorldTile {
    const localId = 17 + x - BATTLE_ARENA_LOGO.minX;
    return {
        x,
        y,
        rawGid: localId + 1,
        gid: localId + 1,
        localId,
        rotation: 0,
        flipX: false,
        flipY: false,
        collision: {
            collides: true,
            penGate: false,
            portal: false,
            up: true,
            right: true,
            down: true,
            left: true,
        },
    };
}

/** Returns the two moving portal pairs in presentation-map coordinates. */
function stagePortalPairs(bounds: BattleArenaBounds): PortalPair[] {
    return [
        {
            from: { x: bounds.minX, y: BATTLE_ARENA_PORTAL_ROW },
            to: { x: bounds.maxX, y: BATTLE_ARENA_PORTAL_ROW },
        },
        {
            from: { x: BATTLE_ARENA_PORTAL_COLUMN, y: bounds.minY },
            to: { x: BATTLE_ARENA_PORTAL_COLUMN, y: bounds.maxY },
        },
    ];
}

/**
 * Reconstructs renderable wall, collision, and portal data from the same staged graph used by simulation.
 * Retired cells remain in the 49 × 49 coordinate space as blocking void so camera and entity coordinates stay stable.
 */
export function createBattleArenaWorldMap(
    map: RaceMap,
    stage: number,
    renderPerimeter = true
): WorldMapData {
    const bounds = battleArenaBounds(stage);
    const outer = battleArenaOuterBounds(stage);
    const staged = battleArenaMapAtStage(map, stage);
    const tiles = Array.from({ length: map.height }, (_, y) =>
        Array.from({ length: map.width }, (_, x) => {
            const cell = y * map.width + x;
            if (
                map.arena &&
                (x < outer.minX || x > outer.maxX || y < outer.minY || y > outer.maxY)
            ) {
                return voidTile(x, y);
            }
            if (
                map.arena &&
                (x === outer.minX || x === outer.maxX || y === outer.minY || y === outer.maxY)
            ) {
                return renderPerimeter ? perimeterTile(x, y, outer) : presentationFloorTile(x, y);
            }
            if (map.arena && isLogoCoordinate(x, y)) return logoTile(x, y);
            const presentationOpenings: Direction[] = [];
            if (map.arena && !renderPerimeter) {
                if (x === bounds.minX) presentationOpenings.push('left');
                if (x === bounds.maxX) presentationOpenings.push('right');
                if (y === bounds.minY) presentationOpenings.push('up');
                if (y === bounds.maxY) presentationOpenings.push('down');
            }
            return corridorTile(staged.cells[cell], presentationOpenings);
        })
    );
    return {
        width: map.width,
        height: map.height,
        tileWidth: 16,
        tileHeight: 16,
        widthInPixels: map.width * 16,
        heightInPixels: map.height * 16,
        tiles,
        collisionByGid: new Map(),
        portalPairs: map.arena ? stagePortalPairs(bounds) : [],
        spawnObjects: [],
        collectibleObjects: [],
        topologyRevision: stage,
    };
}
