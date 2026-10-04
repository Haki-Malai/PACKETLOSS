import type { RandomSource } from '../../shared/random/RandomSource';

export type MazeGraph = Array<Set<number>>;
export type MazeGraphEdge = readonly [number, number];
export type MazeGraphEdgeGroup = readonly MazeGraphEdge[];

export interface MazeGraphBounds {
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
}

export interface MazeVerticalBreakPlan {
    readonly columns: readonly number[];
    readonly phaseByX: Int8Array;
    readonly forcedCutsByX: readonly (readonly number[])[];
    rejectClose(_x: number, _y: number, _currentRun: number): boolean;
}

export interface MazeGraphCarvePlan {
    readonly width: number;
    readonly height: number;
    readonly bounds: MazeGraphBounds;
    readonly random: RandomSource;
    readonly active: Uint8Array;
    readonly fixedOpen: Set<string>;
    readonly fixedClosed: Set<string>;
    readonly preferredClosed: ReadonlySet<string>;
    readonly verticalBreaks: MazeVerticalBreakPlan;
    readonly targetEdges: number;
    readonly maxVerticalStraightTiles: number;
    readonly maxHorizontalWallTiles: number;
    readonly exhaustiveRepair?: boolean;
    readonly repairVerticalRuns?: boolean;
    groupForEdge(_from: number, _to: number): MazeGraphEdgeGroup;
    isCanonicalEdge(_from: number, _to: number): boolean;
    isCanonicalSquare(_x: number, _y: number): boolean;
    externalExitCount(_cell: number): number;
    acceptGraph(_graph: MazeGraph, _changed: MazeGraphEdgeGroup): boolean;
    repairEndpointNeedsOpening?(
        _graph: MazeGraph,
        _endpoint: number,
        _closingGroup: MazeGraphEdgeGroup
    ): boolean;
    repairOpeningAllowed?(
        _graph: MazeGraph,
        _endpoint: number,
        _openingGroup: MazeGraphEdgeGroup,
        _closingGroup: MazeGraphEdgeGroup
    ): boolean;
    skipVerticalRunColumn?(_x: number): boolean;
}

const DIRECTIONS = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
] as const;

/** Gives an undirected maze edge a stable serialization key. */
export function mazeEdgeKey(from: number, to: number): string {
    return from < to ? `${from}:${to}` : `${to}:${from}`;
}

/** Returns one undirected maze edge in stable endpoint order. */
export function orderedMazeEdge(from: number, to: number): MazeGraphEdge {
    return from < to ? [from, to] : [to, from];
}

/** Creates a reusable validator for one connected graph with no articulation tile. */
export function createNoArticulationValidator(
    active: Uint8Array,
    start: number
): (_graph: MazeGraph) => boolean {
    const expected = active.reduce((total, value) => total + value, 0);
    const visited = new Int32Array(active.length);
    const order = new Int32Array(active.length);
    const low = new Int32Array(active.length);
    let traversal = 0;
    return (graph): boolean => {
        traversal += 1;
        let time = 0;
        let reached = 0;
        let articulation = false;
        /** Finds cut vertices in the physical passage graph. */
        const visit = (cell: number, parent: number): void => {
            visited[cell] = traversal;
            order[cell] = low[cell] = ++time;
            reached += 1;
            let children = 0;
            for (const neighbor of graph[cell]) {
                if (!active[neighbor]) continue;
                if (visited[neighbor] !== traversal) {
                    children += 1;
                    visit(neighbor, cell);
                    low[cell] = Math.min(low[cell], low[neighbor]);
                    if (parent !== -1 && low[neighbor] >= order[cell]) articulation = true;
                } else if (neighbor !== parent) {
                    low[cell] = Math.min(low[cell], order[neighbor]);
                }
            }
            if (parent === -1 && children > 1) articulation = true;
        };
        visit(start, -1);
        return !articulation && reached === expected;
    };
}

/** Carves one seeded maze with shared priorities, cleanup, and corridor-shape limits. */
export function carveMazeGraph(plan: MazeGraphCarvePlan): MazeGraph | null {
    const {
        width,
        height,
        bounds,
        random,
        active,
        fixedOpen,
        fixedClosed,
        preferredClosed,
        verticalBreaks,
    } = plan;
    const at = (x: number, y: number): number => y * width + x;
    /** Normalizes and deduplicates every atomic closure or opening group. */
    const groupFor = (from: number, to: number): MazeGraphEdge[] => {
        const unique = new Map<string, MazeGraphEdge>();
        for (const [a, b] of plan.groupForEdge(from, to)) {
            const edge = orderedMazeEdge(a, b);
            unique.set(mazeEdgeKey(...edge), edge);
        }
        return [...unique.values()];
    };
    const groupHas = (set: ReadonlySet<string>, group: readonly MazeGraphEdge[]): boolean =>
        group.some((edge) => set.has(mazeEdgeKey(...edge)));
    const addGroup = (graph: MazeGraph, group: readonly MazeGraphEdge[]): void => {
        for (const [from, to] of group) {
            graph[from].add(to);
            graph[to].add(from);
        }
    };
    const removeGroup = (graph: MazeGraph, group: readonly MazeGraphEdge[]): void => {
        for (const [from, to] of group) {
            graph[from].delete(to);
            graph[to].delete(from);
        }
    };

    const horizontalWallRuns = new Uint16Array(height);
    for (const x of verticalBreaks.columns) {
        const closed = new Array<boolean>(height - 1).fill(false);
        const impossible = new Set<string>();
        const phase = verticalBreaks.phaseByX[x] ?? -1;
        const forcedCuts = new Set(verticalBreaks.forcedCutsByX[x] ?? []);
        /** Finds a legal continuation of this column's north/south connections. */
        const choose = (y: number, run: number): boolean => {
            if (y === bounds.maxY) return true;
            const state = `${y}:${run}`;
            if (impossible.has(state)) return false;
            const from = at(x, y);
            const to = at(x, y + 1);
            const group = groupFor(from, to);
            const mustClose =
                groupHas(fixedClosed, group) || !active[from] || !active[to] || forcedCuts.has(y);
            const mustOpen = groupHas(fixedOpen, group);
            if (mustClose && mustOpen) return false;
            const options = mustClose
                ? [true]
                : mustOpen
                  ? [false]
                  : (phase >= 0 && y % 4 === phase) || random.next() < 0.15
                    ? [true, false]
                    : [false, true];
            for (const close of options) {
                if (close && verticalBreaks.rejectClose(x, y, run)) continue;
                if (close && horizontalWallRuns[y] >= plan.maxHorizontalWallTiles) continue;
                const nextRun = close ? 1 : run + 1;
                if (nextRun > plan.maxVerticalStraightTiles) continue;
                closed[y] = close;
                if (choose(y + 1, nextRun)) return true;
            }
            impossible.add(state);
            return false;
        };
        if (!choose(bounds.minY, 1)) return null;
        for (let y = bounds.minY; y < bounds.maxY; y += 1) {
            horizontalWallRuns[y] = closed[y] ? horizontalWallRuns[y] + 1 : 0;
            if (closed[y]) {
                for (const edge of groupFor(at(x, y), at(x, y + 1)))
                    fixedClosed.add(mazeEdgeKey(...edge));
            }
        }
    }

    const graph: MazeGraph = Array.from({ length: width * height }, () => new Set<number>());
    for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
        for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
            const from = at(x, y);
            if (!active[from]) continue;
            for (const [nx, ny] of [
                [x + 1, y],
                [x, y + 1],
            ]) {
                if (nx > bounds.maxX || ny > bounds.maxY) continue;
                const to = at(nx, ny);
                if (!active[to]) continue;
                const group = groupFor(from, to);
                if (!groupHas(fixedClosed, group)) addGroup(graph, group);
            }
        }
    }

    const fieldColumns = Math.ceil(width / 5);
    const fields = Array.from({ length: fieldColumns * Math.ceil(height / 6) }, () =>
        random.int(2)
    );
    const candidates: Array<{
        from: number;
        to: number;
        group: MazeGraphEdge[];
        priority: number;
    }> = [];
    const candidateGroups = new Set<string>();
    for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
        for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
            const from = at(x, y);
            if (!active[from]) continue;
            for (const { dx, dy } of [
                { dx: 1, dy: 0 },
                { dx: 0, dy: 1 },
            ]) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx > bounds.maxX || ny > bounds.maxY) continue;
                const to = at(nx, ny);
                if (!active[to] || !graph[from].has(to) || !plan.isCanonicalEdge(from, to))
                    continue;
                const group = groupFor(from, to);
                const groupKey = group
                    .map((edge) => mazeEdgeKey(...edge))
                    .sort()
                    .join('|');
                if (candidateGroups.has(groupKey)) continue;
                candidateGroups.add(groupKey);
                const orientation = fields[Math.floor(y / 6) * fieldColumns + Math.floor(x / 5)];
                candidates.push({
                    from,
                    to,
                    group,
                    priority:
                        random.next() +
                        (orientation === (dx ? 0 : 1) ? 0.8 : 0) +
                        (dy ? 0.35 : 0) +
                        (groupHas(preferredClosed, group) ? 1.5 : 0),
                });
            }
        }
    }
    candidates.sort((left, right) => right.priority - left.priority);
    const priorityByEdge = new Map<string, number>();
    for (const candidate of candidates) {
        for (const edge of candidate.group)
            priorityByEdge.set(mazeEdgeKey(...edge), candidate.priority);
    }
    let remainingEdges = graph.reduce((total, neighbors) => total + neighbors.size, 0) / 2;
    if (!plan.acceptGraph(graph, [])) return null;

    /** Reads a physical north/south passage before tile conversion. */
    const edgeIsOpen = (x: number, y: number): boolean => graph[at(x, y)].has(at(x, y + 1));
    /** Counts one continuous horizontal wall after a north/south passage closes. */
    const horizontalWallLength = (x: number, y: number): number => {
        let length = 1;
        for (let left = x - 1; left >= bounds.minX && !edgeIsOpen(left, y); left -= 1) length += 1;
        for (let right = x + 1; right <= bounds.maxX && !edgeIsOpen(right, y); right += 1)
            length += 1;
        return length;
    };
    const exitCount = (cell: number): number => graph[cell].size + plan.externalExitCount(cell);
    /** Closes one symmetric group only when its endpoints and graph remain valid. */
    const tryClose = (from: number, to: number): boolean => {
        const group = groupFor(from, to);
        if (groupHas(fixedOpen, group) || group.some(([a, b]) => !graph[a].has(b))) return false;
        const endpoints = new Set(group.flat());
        if ([...endpoints].some((cell) => exitCount(cell) <= 2)) return false;
        removeGroup(graph, group);
        const wallFits = group.every(
            ([a, b]) =>
                Math.abs(a - b) !== width ||
                horizontalWallLength(a % width, Math.floor(Math.min(a, b) / width)) <=
                    plan.maxHorizontalWallTiles
        );
        if (wallFits && plan.acceptGraph(graph, group)) {
            remainingEdges -= group.length;
            return true;
        }
        addGroup(graph, group);
        return false;
    };

    /** Returns the four edges around one possible free-floating wall corner. */
    const squareEdges = (x: number, y: number): MazeGraphEdge[] => {
        const a = at(x, y);
        const b = at(x + 1, y);
        const c = at(x, y + 1);
        const d = at(x + 1, y + 1);
        return [
            [a, b],
            [b, d],
            [c, d],
            [a, c],
        ];
    };
    /** Checks whether all four passages around a tile corner are open. */
    const squareIsOpen = (x: number, y: number): boolean =>
        x >= bounds.minX &&
        x < bounds.maxX &&
        y >= bounds.minY &&
        y < bounds.maxY &&
        squareEdges(x, y).every(([from, to]) => graph[from].has(to));
    const squares: Array<{ x: number; y: number }> = [];
    for (let y = bounds.minY; y < bounds.maxY; y += 1) {
        for (let x = bounds.minX; x < bounds.maxX; x += 1) {
            if (plan.isCanonicalSquare(x, y)) squares.push({ x, y });
        }
    }
    for (let index = squares.length - 1; index > 0; index -= 1) {
        const other = random.int(index + 1);
        [squares[index], squares[other]] = [squares[other], squares[index]];
    }
    for (const { x, y } of squares) {
        if (!squareIsOpen(x, y)) continue;
        const square = squareEdges(x, y);
        square.sort(
            ([a, b], [c, d]) =>
                (priorityByEdge.get(mazeEdgeKey(c, d)) ?? 0) -
                (priorityByEdge.get(mazeEdgeKey(a, b)) ?? 0)
        );
        square.some(([from, to]) => tryClose(from, to));
    }

    for (const { from, to } of candidates) {
        if (remainingEdges <= plan.targetEdges) break;
        tryClose(from, to);
    }

    /** Reopens a group only if it cannot create a new open corner. */
    const canOpenWithoutSquare = (group: readonly MazeGraphEdge[]): boolean => {
        addGroup(graph, group);
        const createsSquare = group.some(([from, to]) => {
            const x = Math.min(from % width, to % width);
            const y = Math.min(Math.floor(from / width), Math.floor(to / width));
            return from % width === to % width
                ? (plan.isCanonicalSquare(x - 1, y) && squareIsOpen(x - 1, y)) ||
                      (plan.isCanonicalSquare(x, y) && squareIsOpen(x, y))
                : (plan.isCanonicalSquare(x, y - 1) && squareIsOpen(x, y - 1)) ||
                      (plan.isCanonicalSquare(x, y) && squareIsOpen(x, y));
        });
        removeGroup(graph, group);
        return !createsSquare;
    };
    /** Tries every eligible zero-or-one opening choice for both closing-edge endpoints. */
    const tryExhaustiveRepair = (from: number, to: number): boolean => {
        const closingGroup = groupFor(from, to);
        const endpoints = [from, to];
        const choices = endpoints.map((endpoint): Array<MazeGraphEdge[] | null> => {
            const ex = endpoint % width;
            const ey = Math.floor(endpoint / width);
            const neighbors = DIRECTIONS.map(({ dx, dy }) => ({ x: ex + dx, y: ey + dy })).filter(
                (neighbor) =>
                    neighbor.x >= bounds.minX &&
                    neighbor.x <= bounds.maxX &&
                    neighbor.y >= bounds.minY &&
                    neighbor.y <= bounds.maxY
            );
            for (let index = neighbors.length - 1; index > 0; index -= 1) {
                const other = random.int(index + 1);
                [neighbors[index], neighbors[other]] = [neighbors[other], neighbors[index]];
            }
            const groups = new Map<string, MazeGraphEdge[]>();
            for (const neighbor of neighbors) {
                const other = at(neighbor.x, neighbor.y);
                const group = groupFor(endpoint, other);
                if (
                    !active[other] ||
                    group.some(([a, b]) => graph[a].has(b)) ||
                    groupHas(fixedClosed, group)
                )
                    continue;
                const groupKey = group
                    .map((edge) => mazeEdgeKey(...edge))
                    .sort()
                    .join('|');
                if (!groups.has(groupKey)) groups.set(groupKey, group);
            }
            const needsOpening = plan.repairEndpointNeedsOpening?.(graph, endpoint, closingGroup);
            return needsOpening ? [...groups.values()] : [null, ...groups.values()];
        });
        /** Searches the small Cartesian product while restoring every rejected opening. */
        const search = (endpointIndex: number): boolean => {
            if (endpointIndex === endpoints.length) return tryClose(from, to);
            const endpoint = endpoints[endpointIndex];
            for (const group of choices[endpointIndex]) {
                if (group === null) {
                    if (search(endpointIndex + 1)) return true;
                    continue;
                }
                const alreadyOpen = group.every(([a, b]) => graph[a].has(b));
                if (alreadyOpen) {
                    if (search(endpointIndex + 1)) return true;
                    continue;
                }
                if (
                    plan.repairOpeningAllowed &&
                    !plan.repairOpeningAllowed(graph, endpoint, group, closingGroup)
                )
                    continue;
                addGroup(graph, group);
                if (search(endpointIndex + 1)) return true;
                removeGroup(graph, group);
            }
            return false;
        };
        return search(0);
    };
    /** Repairs as many currently overlong north/south runs as the graph permits. */
    const repairVerticalRunPass = (): boolean => {
        let madeProgress = false;
        const maxRepairs = width * height;
        for (let repair = 0; repair < maxRepairs; repair += 1) {
            let foundViolation = false;
            let repairedViolation = false;
            repairSearch: for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
                if (plan.skipVerticalRunColumn?.(x)) continue;
                let run = 1;
                for (let y = bounds.minY; y < bounds.maxY; y += 1) {
                    run = edgeIsOpen(x, y) ? run + 1 : 1;
                    if (run <= plan.maxVerticalStraightTiles) continue;
                    foundViolation = true;
                    const startY = y - run + 2;
                    const options = Array.from({ length: run - 1 }, (_, offset) => {
                        const edgeY = startY + offset;
                        return orderedMazeEdge(at(x, edgeY), at(x, edgeY + 1));
                    })
                        .filter(([from, to]) => plan.isCanonicalEdge(from, to))
                        .sort(
                            ([a, b], [c, d]) =>
                                (priorityByEdge.get(mazeEdgeKey(c, d)) ?? 0) -
                                (priorityByEdge.get(mazeEdgeKey(a, b)) ?? 0)
                        );
                    for (const [from, to] of options) {
                        const closed = plan.exhaustiveRepair
                            ? tryExhaustiveRepair(from, to)
                            : tryClose(from, to);
                        if (!closed) continue;
                        repairedViolation = true;
                        madeProgress = true;
                        break repairSearch;
                    }
                }
            }
            if (!foundViolation || !repairedViolation) break;
        }
        return madeProgress;
    };
    /** Repairs one currently open square with the selected default or exhaustive policy. */
    const repairOpenSquare = (x: number, y: number, exhaustive: boolean): boolean => {
        const options = squareEdges(x, y).filter(
            ([from, to]) => !groupHas(fixedOpen, groupFor(from, to))
        );
        for (let index = options.length - 1; index > 0; index -= 1) {
            const other = random.int(index + 1);
            [options[index], options[other]] = [options[other], options[index]];
        }
        for (const [from, to] of options) {
            if (exhaustive) {
                if (tryExhaustiveRepair(from, to)) return true;
                continue;
            }
            const closingGroup = groupFor(from, to);
            const opened: MazeGraphEdge[][] = [];
            for (const endpoint of [from, to]) {
                const needsOpening = plan.repairEndpointNeedsOpening
                    ? plan.repairEndpointNeedsOpening(graph, endpoint, closingGroup)
                    : exitCount(endpoint) <= 2;
                if (!needsOpening) continue;
                const ex = endpoint % width;
                const ey = Math.floor(endpoint / width);
                const neighbors = DIRECTIONS.map(({ dx, dy }) => ({
                    x: ex + dx,
                    y: ey + dy,
                })).filter(
                    (neighbor) =>
                        neighbor.x >= bounds.minX &&
                        neighbor.x <= bounds.maxX &&
                        neighbor.y >= bounds.minY &&
                        neighbor.y <= bounds.maxY
                );
                for (let index = neighbors.length - 1; index > 0; index -= 1) {
                    const other = random.int(index + 1);
                    [neighbors[index], neighbors[other]] = [neighbors[other], neighbors[index]];
                }
                const neighbor = neighbors.find(({ x: nx, y: ny }) => {
                    const other = at(nx, ny);
                    const group = groupFor(endpoint, other);
                    return (
                        active[other] &&
                        !graph[endpoint].has(other) &&
                        !groupHas(fixedClosed, group) &&
                        canOpenWithoutSquare(group) &&
                        (!plan.repairOpeningAllowed ||
                            plan.repairOpeningAllowed(graph, endpoint, group, closingGroup))
                    );
                });
                if (!neighbor) break;
                const group = groupFor(endpoint, at(neighbor.x, neighbor.y));
                addGroup(graph, group);
                opened.push(group);
            }
            if (tryClose(from, to)) return true;
            for (const group of opened) removeGroup(graph, group);
        }
        return false;
    };
    /** Runs one repair pass over every canonical square that is currently open. */
    const repairOpenSquarePass = (exhaustive: boolean): boolean => {
        let madeProgress = false;
        for (const { x, y } of squares) {
            if (!squareIsOpen(x, y)) continue;
            if (repairOpenSquare(x, y, exhaustive)) madeProgress = true;
        }
        return madeProgress;
    };
    if (plan.repairVerticalRuns && plan.exhaustiveRepair) {
        const seen = new Set<string>();
        for (let pass = 0; pass < width * height; pass += 1) {
            const signature = graph
                .map((neighbors, from) =>
                    [...neighbors]
                        .filter((to) => from < to)
                        .sort((left, right) => left - right)
                        .join(',')
                )
                .join('|');
            if (seen.has(signature)) break;
            seen.add(signature);
            const verticalProgress = repairVerticalRunPass();
            const squareProgress = repairOpenSquarePass(true);
            if (!verticalProgress && !squareProgress) break;
        }
    } else if (plan.exhaustiveRepair) {
        for (let pass = 0; pass < squares.length; pass += 1) {
            if (!repairOpenSquarePass(true)) break;
        }
    } else {
        if (plan.repairVerticalRuns) repairVerticalRunPass();
        repairOpenSquarePass(false);
    }

    if (squares.some(({ x, y }) => squareIsOpen(x, y)) || !plan.acceptGraph(graph, [])) return null;
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
        if (plan.skipVerticalRunColumn?.(x)) continue;
        let run = 1;
        for (let y = bounds.minY; y < bounds.maxY; y += 1) {
            run = edgeIsOpen(x, y) ? run + 1 : 1;
            if (run > plan.maxVerticalStraightTiles) return null;
        }
        for (const cut of verticalBreaks.forcedCutsByX[x] ?? []) {
            if (edgeIsOpen(x, cut)) return null;
        }
    }
    for (let y = bounds.minY; y < bounds.maxY; y += 1) {
        for (let x = bounds.minX, wallRun = 0; x <= bounds.maxX; x += 1) {
            wallRun = edgeIsOpen(x, y) ? 0 : wallRun + 1;
            if (wallRun > plan.maxHorizontalWallTiles) return null;
        }
    }
    return graph;
}
