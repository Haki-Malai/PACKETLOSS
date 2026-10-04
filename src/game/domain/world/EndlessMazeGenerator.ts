import type { CollisionTile } from './CollisionGrid';
import { carveMazeGraph, createNoArticulationValidator, orderedMazeEdge } from './MazeGraphCarver';
import type { WorldMapData, WorldTile } from './WorldState';
import { buildMazeWallPatterns } from './MazeWallPatterns';
import { SeededRandom } from '../../shared/random/SeededRandom';
import { ENDLESS_SETTINGS } from '../../shared/endlessSettings';

export const ENDLESS_WIDTH = ENDLESS_SETTINGS.width;
export const ENDLESS_SECTION_HEIGHT = ENDLESS_SETTINGS.sectionRows;
export const ENDLESS_RESIDENT_SECTIONS = ENDLESS_SETTINGS.residentSections;

export interface EndlessSection {
  readonly index: number;
  readonly map: WorldMapData;
  readonly logoRow: number | null;
}

const DIRECTIONS = [
  { dx: 0, dy: -1, name: 'up' },
  { dx: 1, dy: 0, name: 'right' },
  { dx: 0, dy: 1, name: 'down' },
  { dx: -1, dy: 0, name: 'left' },
] as const;

/** Mixes signed section indices into independent deterministic random streams. */
function mixSeed(seed: number, index: number, salt: number): number {
  let value = (seed ^ Math.imul(index, 0x9e3779b1) ^ salt) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
  return (value ^ (value >>> 16)) >>> 0;
}

/** Returns separated shared seam crossings independent of generation order. */
export function endlessBoundary(seed: number, lowerSectionIndex: number): readonly boolean[] {
  const rng = new SeededRandom(mixSeed(seed, lowerSectionIndex, 0x31f462b9));
  const openings = 8 + rng.int(2);
  const slots = Array.from({ length: ENDLESS_WIDTH - 5 - openings }, (_, x) => x);
  for (let i = slots.length - 1; i > 0; i -= 1) {
    const j = rng.int(i + 1);
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  const selected = new Set(slots.slice(0, openings).sort((a, b) => a - b)
    .map((slot, position) => slot + position + 3));
  return Array.from({ length: ENDLESS_WIDTH }, (_, x) => selected.has(x));
}

/** Makes a production-style side rail that is scenery rather than a corridor. */
function sideRailTile(x: number, y: number): WorldTile {
  return { x, y, rawGid: 1, gid: 1, localId: 0, rotation: 0,
    flipX: x === 0, flipY: false, collision: {
      collides: true, penGate: false, portal: false,
      up: true, right: true, down: true, left: true,
    } };
}

/** Opens the side-rail silhouette at a portal without admitting a physical edge tile. */
function portalTipTile(x: number, y: number): WorldTile {
  return { x, y, rawGid: 24, gid: 24, localId: 23, rotation: 0,
    flipX: x === ENDLESS_WIDTH - 1, flipY: false, collision: {
      collides: true, penGate: false, portal: false,
      up: true, right: true, down: true, left: true,
    } };
}

/** Converts a directional collision mask to a supported authored wall silhouette. */
function wallTile(blocked: number, x: number, y: number): WorldTile {
  const edges = [Boolean(blocked & 1), Boolean(blocked & 2), Boolean(blocked & 4), Boolean(blocked & 8)];
  const count = edges.filter(Boolean).length;
  let localId = 14;
  let rotation = 0;
  if (count === 1) {
    localId = 7;
    rotation = [3, 0, 1, 2][edges.findIndex(Boolean)] * Math.PI / 2;
  } else if (count === 2) {
    if ((edges[0] && edges[2]) || (edges[1] && edges[3])) {
      localId = 1;
      rotation = edges[0] ? Math.PI / 2 : 0;
    } else {
      localId = 10;
      rotation = edges[1] && edges[2] ? 0 : edges[2] && edges[3] ? Math.PI / 2
        : edges[3] && edges[0] ? Math.PI : 3 * Math.PI / 2;
    }
  }
  const collision: CollisionTile = {
    collides: count > 0,
    penGate: false,
    portal: false,
    up: edges[0], right: edges[1], down: edges[2], left: edges[3],
  };
  return { x, y, rawGid: localId + 1, gid: localId + 1, localId, rotation,
    flipX: false, flipY: false, collision };
}

/** Creates a connected, loop-rich section with a centered opening logo when spacing permits. */
export function generateEndlessSection(
  runSeed: number,
  index: number,
  generationSeed: number,
  nearbyLogoRows: readonly number[] = [],
): EndlessSection {
  const logoRng = new SeededRandom(mixSeed(runSeed, index, generationSeed ^ 0x4d125e75));
  const straightRng = new SeededRandom(mixSeed(runSeed, index, generationSeed ^ 0x71b4d6c3));
  const middleRow = Math.floor(ENDLESS_SECTION_HEIGHT / 2);
  const legalLogoRows = Array.from({ length: ENDLESS_SECTION_HEIGHT - 6 }, (_, row) => row + 3)
    .filter((row) => (index !== 0 || row !== middleRow)
      && nearbyLogoRows.every((nearby) =>
        Math.abs(nearby - (index * ENDLESS_SECTION_HEIGHT + row)) >= ENDLESS_SETTINGS.minimumLogoSpacingRows));
  const openingLogoRow = middleRow - 1;
  const logoRow = index === 0 && legalLogoRows.includes(openingLogoRow) ? openingLogoRow
    : logoRng.next() < ENDLESS_SETTINGS.logoChance && legalLogoRows.length > 0
      ? legalLogoRows[logoRng.int(legalLogoRows.length)] : null;
  const straightRow = index === 0 ? middleRow
    : logoRow === null && straightRng.next() < ENDLESS_SETTINGS.extraStraightRowChance
      ? 3 + straightRng.int(ENDLESS_SECTION_HEIGHT - 6) : null;
  let straightRun: { x: number; y: number; length: number } | null = null;
  if (logoRow === null && straightRow === null
    && straightRng.next() < ENDLESS_SETTINGS.straightRunChance) {
    const length = ENDLESS_SETTINGS.straightRunMinTiles + straightRng.int(
      ENDLESS_SETTINGS.straightRunMaxTiles - ENDLESS_SETTINGS.straightRunMinTiles + 1);
    straightRun = { x: 2 + straightRng.int(ENDLESS_WIDTH - length - 2),
      y: 3 + straightRng.int(ENDLESS_SECTION_HEIGHT - 6), length };
  }
  for (let attempt = 0; attempt < 256; attempt += 1) {
    const trialSeed = attempt === 0 ? generationSeed : mixSeed(generationSeed, attempt, 0x6c39a2e5);
    const section = generateSectionCandidate(runSeed, index, trialSeed, logoRow, straightRow, straightRun);
    if (section) return section;
  }
  throw new Error(`Could not generate an Endless section for seed ${runSeed} at index ${index}.`);
}

/** Builds one seeded candidate that meets the escape, lane, and wall-corner rules. */
function generateSectionCandidate(
  runSeed: number,
  index: number,
  generationSeed: number,
  logoRow: number | null,
  straightRow: number | null,
  straightRun: { x: number; y: number; length: number } | null,
): EndlessSection | null {
  const rng = new SeededRandom(mixSeed(runSeed, index, generationSeed));
  const width = ENDLESS_WIDTH;
  const height = ENDLESS_SECTION_HEIGHT;
  const tileCount = width * height;
  const corridorCount = (width - 2) * height;
  /** Converts section-local coordinates to a graph vertex. */
  const at = (x: number, y: number): number => y * width + x;
  const logoX = Math.floor((width - 5) / 2);
  const portalRow = logoRow === null ? null : logoRow + 1;
  const logoCells = new Set<number>();
  if (logoRow !== null) {
    for (let x = logoX; x < logoX + 5; x += 1) logoCells.add(at(x, logoRow));
  }

  // A wide two-lane loop keeps Firewall's 16-step patrol without a long climb.
  const loopSites = Array.from({ length: height - 4 }, (_, row) => row + 2)
    .flatMap((y) => Array.from({ length: width - 10 }, (_, column) => ({ x: column + 2, y })))
    .filter(({ x, y }) => [portalRow, straightRow].every((row) => row === null || row < y || row > y + 1)
      && (straightRun === null || straightRun.y < y || straightRun.y > y + 1
        || x + 7 < straightRun.x || x > straightRun.x + straightRun.length - 1)
      && Array.from({ length: 2 }, (_, row) => Array.from({ length: 8 }, (_, column) =>
        at(x + column, y + row))).flat().every((cell) => !logoCells.has(cell)));
  const loopSite = loopSites[rng.int(loopSites.length)];
  if (!loopSite) return null;
  const { x: loopX, y: loopY } = loopSite;
  /** Gives an undirected graph edge a stable key. */
  const key = (a: number, b: number): string => a < b ? `${a}:${b}` : `${b}:${a}`;
  const fixedOpen = new Set<string>();
  const fixedClosed = new Set<string>();
  const top = endlessBoundary(runSeed, index - 1);
  const bottom = endlessBoundary(runSeed, index);
  const seamPhases = new Int8Array(width).fill(-1);
  for (let x = 3; x < width - 3; x += 1) {
    let phase = mixSeed(runSeed, x, 0x14cb3a27) % 3;
    if (x >= 6 && seamPhases[x - 1] === phase && seamPhases[x - 2] === phase
      && seamPhases[x - 3] === phase) phase = (phase + 1) % 3;
    seamPhases[x] = phase;
  }
  // Outer lanes need paired side exits before a north-south wall can interrupt them.
  /** Chooses irregular breaks no more than four rows apart around portal mouths. */
  const outerBreakRows = (): number[] => {
    const allowed = (row: number): boolean => row !== portalRow && row !== (portalRow ?? 0) - 1;
    const start = [3, 2, 1].find(allowed);
    const end = [height - 4, height - 5, height - 3].find(allowed);
    if (start === undefined || end === undefined) return [];
    const reachable = new Map<number, boolean>();
    /** Checks whether the remaining gap can be covered without adjacent cuts. */
    const canReachEnd = (row: number): boolean => {
      if (row === end) return true;
      if (reachable.has(row)) return reachable.get(row)!;
      const possible = [2, 3, 4].some((gap) => {
        const next = row + gap;
        return next <= end && allowed(next) && canReachEnd(next);
      });
      reachable.set(row, possible);
      return possible;
    };
    const rows = [start];
    while (rows[rows.length - 1] < end) {
      const next = [2, 3, 4].map((gap) => rows[rows.length - 1] + gap)
        .filter((row) => row <= end && allowed(row) && canReachEnd(row));
      if (next.length === 0) return [];
      rows.push(next[rng.int(next.length)]);
    }
    return rows;
  };
  for (const outerX of [1, width - 2]) {
    const innerX = outerX === 1 ? 2 : width - 3;
    const cuts = outerBreakRows();
    if (cuts.length === 0) return null;
    for (const row of cuts) {
      fixedClosed.add(key(at(outerX, row), at(outerX, row + 1)));
      fixedOpen.add(key(at(innerX, row), at(innerX, row + 1)));
      for (const y of [row, row + 1]) {
        const edge = key(at(outerX, y), at(innerX, y));
        fixedClosed.delete(edge);
        fixedOpen.add(edge);
      }
    }
  }
  for (const row of [portalRow, straightRow]) {
    if (row === null) continue;
    for (let x = 1; x < width - 2; x += 1) fixedOpen.add(key(at(x, row), at(x + 1, row)));
  }
  if (straightRun) {
    for (let x = straightRun.x; x < straightRun.x + straightRun.length - 1; x += 1) {
      fixedOpen.add(key(at(x, straightRun.y), at(x + 1, straightRun.y)));
    }
  }
  if (portalRow !== null) {
    for (const x of [1, width - 2]) {
      fixedOpen.add(key(at(x, portalRow - 1), at(x, portalRow)));
      fixedOpen.add(key(at(x, portalRow), at(x, portalRow + 1)));
    }
    // Frame the corridor with matching nine-tile rails, as in the authored signs.
    for (let x = logoX - 2; x <= logoX + 6; x += 1) {
      fixedClosed.add(key(at(x, portalRow - 1), at(x, portalRow)));
      fixedClosed.add(key(at(x, portalRow), at(x, portalRow + 1)));
    }
    for (const x of [logoX - 3, logoX + 7]) {
      fixedOpen.add(key(at(x, portalRow - 1), at(x, portalRow)));
      fixedOpen.add(key(at(x, portalRow), at(x, portalRow + 1)));
    }
  }
  for (let column = loopX; column < loopX + 7; column += 1) {
    fixedOpen.add(key(at(column, loopY), at(column + 1, loopY)));
    fixedOpen.add(key(at(column, loopY + 1), at(column + 1, loopY + 1)));
  }
  fixedOpen.add(key(at(loopX, loopY), at(loopX, loopY + 1)));
  fixedOpen.add(key(at(loopX + 7, loopY), at(loopX + 7, loopY + 1)));
  for (let column = loopX + 1; column < loopX + 7; column += 1) {
    fixedClosed.add(key(at(column, loopY), at(column, loopY + 1)));
  }

  const preferredClosed = new Set<string>();
  /** Biases a valid neighboring connection toward becoming a wall. */
  const preferWall = (ax: number, ay: number, bx: number, by: number): void => {
    if (ax < 0 || bx < 0 || ay < 0 || by < 0 || ax >= width || bx >= width
      || ay >= height || by >= height || logoCells.has(at(ax, ay)) || logoCells.has(at(bx, by))) return;
    preferredClosed.add(key(at(ax, ay), at(bx, by)));
  };
  const wallPatterns = buildMazeWallPatterns(width, height, rng, 6, 2);
  wallPatterns.preferredClosed.forEach(({ from, to }) =>
    preferWall(from.x, from.y, to.x, to.y));
  for (const loop of wallPatterns.openLoops) {
    const edges = loop.edges.map(({ from, to }) => key(at(from.x, from.y), at(to.x, to.y)));
    const cells = loop.cells.map(({ x, y }) => at(x, y));
    if (cells.some((cell) => logoCells.has(cell)) || edges.some((edge) => fixedClosed.has(edge))) continue;
    edges.forEach((edge) => fixedOpen.add(edge));
  }

  const active = new Uint8Array(tileCount);
  for (let y = 0; y < height; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      if (!logoCells.has(at(x, y))) active[at(x, y)] = 1;
    }
  }
  const forcedCutsByX = Array.from({ length: width }, () => [] as number[]);
  for (let x = 1; x < width - 1; x += 1) {
    const phase = seamPhases[x];
    if (phase < 0) continue;
    const nominalBottom = phase + height - 4;
    const topCut = fixedOpen.has(key(at(x, phase), at(x, phase + 1))) ? 0
      : phase === (logoRow ?? -1) - 1 && (x === logoX - 1 || x === logoX + 5)
        ? phase - 1 : phase;
    const bottomCut = fixedOpen.has(key(at(x, nominalBottom), at(x, nominalBottom + 1)))
      ? height - 2 : nominalBottom;
    forcedCutsByX[x].push(topCut, bottomCut);
  }
  const hasTwoEscapes = createNoArticulationValidator(active, at(1, 0));
  const graph = carveMazeGraph({
    width,
    height,
    bounds: { minX: 1, maxX: width - 2, minY: 0, maxY: height - 1 },
    random: rng,
    active,
    fixedOpen,
    fixedClosed,
    preferredClosed,
    verticalBreaks: {
      columns: Array.from({ length: width - 2 }, (_, column) => column + 1),
      phaseByX: seamPhases,
      forcedCutsByX,
      rejectClose: (x, y, run) => run === 1 && (x === 1 || x === width - 2
        || (y === logoRow && (x === logoX - 1 || x === logoX + 5))),
    },
    targetEdges: Math.ceil((corridorCount - logoCells.size) * 1.08),
    maxVerticalStraightTiles: ENDLESS_SETTINGS.maxVerticalStraightTiles,
    maxHorizontalWallTiles: ENDLESS_SETTINGS.maxHorizontalWallTiles,
    groupForEdge: (from, to) => [orderedMazeEdge(from, to)],
    isCanonicalEdge: () => true,
    isCanonicalSquare: () => true,
    externalExitCount: (cell) => {
      const x = cell % width;
      const y = Math.floor(cell / width);
      return (y === 0 && top[x] ? 1 : 0) + (y === height - 1 && bottom[x] ? 1 : 0);
    },
    acceptGraph: (candidate) => hasTwoEscapes(candidate),
  });
  if (!graph) return null;

  const tiles: WorldTile[][] = [];
  for (let y = 0; y < height; y += 1) {
    const row: WorldTile[] = [];
    for (let x = 0; x < width; x += 1) {
      const position = at(x, y);
      if (x === 0 || x === width - 1) {
        row.push(y === portalRow ? portalTipTile(x, y) : sideRailTile(x, y));
        continue;
      }
      if (logoCells.has(position)) {
        const localId = 17 + x - logoX;
        row.push({ x, y, rawGid: localId + 1, gid: localId + 1, localId, rotation: 0,
          flipX: false, flipY: false, collision: {
            collides: true, penGate: false, portal: false,
            up: true, right: true, down: true, left: true,
          } });
        continue;
      }
      let blocked = 0;
      DIRECTIONS.forEach(({ dx, dy }, direction) => {
        const nx = x + dx;
        const ny = y + dy;
        const open = nx >= 0 && nx < width && ny >= 0 && ny < height
          ? graph[position].has(at(nx, ny))
          : nx >= 0 && nx < width && ny < 0 ? top[x]
            : nx >= 0 && nx < width && ny >= height ? bottom[x] : false;
        if (!open) blocked |= 1 << direction;
      });
      const portalMouth = y === portalRow && (x === 1 || x === width - 2);
      if (portalMouth) blocked &= x === 1 ? ~8 : ~2;
      if (portalMouth && blocked !== 0) return null;
      const tile = wallTile(blocked, x, y);
      if (portalMouth) tile.collision.portal = true;
      row.push(tile);
    }
    tiles.push(row);
  }
  const map: WorldMapData = {
    width, height, tileWidth: 16, tileHeight: 16, widthInPixels: width * 16,
    heightInPixels: height * 16, tiles, collisionByGid: new Map(),
    portalPairs: portalRow === null ? [] : [{ from: { x: 1, y: portalRow },
      to: { x: width - 2, y: portalRow } }],
    spawnObjects: [], collectibleObjects: [],
  };
  return { index, map, logoRow };
}
