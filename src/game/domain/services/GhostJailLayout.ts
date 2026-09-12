import { WorldMapData } from '../world/WorldState';

interface InferredJailAnchor {
  minX: number;
  maxX: number;
  homeY: number;
  centerX: number;
}

interface HorizontalRun {
  minX: number;
  maxX: number;
  y: number;
  length: number;
  centerX: number;
  localId: number;
}

function countLocalIdFrequency(map: WorldMapData): Map<number, number> {
  const counts = new Map<number, number>();
  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const localId = map.tiles[y]?.[x]?.localId;
      if (typeof localId !== 'number') {
        continue;
      }
      counts.set(localId, (counts.get(localId) ?? 0) + 1);
    }
  }
  return counts;
}

function collectPenGateRuns(map: WorldMapData): Array<{ minX: number; maxX: number; y: number; length: number; centerX: number }> {
  const runs: Array<{ minX: number; maxX: number; y: number; length: number; centerX: number }> = [];
  for (let y = 0; y < map.height; y += 1) {
    let x = 0;
    while (x < map.width) {
      if (!map.tiles[y]?.[x]?.collision.penGate) {
        x += 1;
        continue;
      }
      const minX = x;
      while (x < map.width && map.tiles[y]?.[x]?.collision.penGate) {
        x += 1;
      }
      const maxX = x - 1;
      const length = maxX - minX + 1;
      if (length >= 3) {
        runs.push({
          minX,
          maxX,
          y,
          length,
          centerX: minX + Math.floor((maxX - minX) / 2),
        });
      }
    }
  }
  return runs;
}

function collectStructuralRuns(map: WorldMapData): HorizontalRun[] {
  const runs: HorizontalRun[] = [];
  if (map.width < 3 || map.height < 3) {
    return runs;
  }

  for (let y = 1; y < map.height - 1; y += 1) {
    let x = 1;
    while (x < map.width - 1) {
      const localId = map.tiles[y]?.[x]?.localId;
      if (typeof localId !== 'number') {
        x += 1;
        continue;
      }

      const minX = x;
      x += 1;
      while (x < map.width - 1 && map.tiles[y]?.[x]?.localId === localId) {
        x += 1;
      }

      const maxX = x - 1;
      const length = maxX - minX + 1;
      if (length >= 3) {
        runs.push({
          minX,
          maxX,
          y,
          length,
          centerX: minX + Math.floor((maxX - minX) / 2),
          localId,
        });
      }
    }
  }

  return runs;
}

function inferPenGateAnchor(map: WorldMapData): InferredJailAnchor | null {
  const runs = collectPenGateRuns(map);
  if (runs.length === 0) {
    return null;
  }

  const centerX = (map.width - 1) / 2;
  runs.sort((a, b) => {
    const lengthDiff = b.length - a.length;
    if (lengthDiff !== 0) {
      return lengthDiff;
    }
    const centerDistanceDiff = Math.abs(a.centerX - centerX) - Math.abs(b.centerX - centerX);
    if (centerDistanceDiff !== 0) {
      return centerDistanceDiff;
    }
    if (a.y !== b.y) {
      return a.y - b.y;
    }
    return a.minX - b.minX;
  });

  const best = runs[0];
  if (!best) {
    return null;
  }

  const nextY = best.y + 1;
  const maxY = map.height - 1;
  const homeY = nextY < 0 ? 0 : nextY > maxY ? maxY : nextY;
  return {
    minX: best.minX,
    maxX: best.maxX,
    homeY,
    centerX: best.centerX,
  };
}

function inferStructuralAnchor(map: WorldMapData): InferredJailAnchor | null {
  const runs = collectStructuralRuns(map);
  if (runs.length === 0) {
    return null;
  }

  const localIdFrequency = countLocalIdFrequency(map);
  const centerX = (map.width - 1) / 2;
  const centerY = (map.height - 1) / 2;
  const lowerTargetY = Math.floor((map.height - 1) * 0.66);

  runs.sort((a, b) => {
    const lowerHalfDiff = (a.y >= centerY ? 0 : 1) - (b.y >= centerY ? 0 : 1);
    if (lowerHalfDiff !== 0) {
      return lowerHalfDiff;
    }

    const centerDistanceDiff = Math.abs(a.centerX - centerX) - Math.abs(b.centerX - centerX);
    if (centerDistanceDiff !== 0) {
      return centerDistanceDiff;
    }

    const rarityDiff = (localIdFrequency.get(a.localId) ?? Number.MAX_SAFE_INTEGER) -
      (localIdFrequency.get(b.localId) ?? Number.MAX_SAFE_INTEGER);
    if (rarityDiff !== 0) {
      return rarityDiff;
    }

    const lengthDiff = b.length - a.length;
    if (lengthDiff !== 0) {
      return lengthDiff;
    }

    const verticalDiff = Math.abs(a.y - lowerTargetY) - Math.abs(b.y - lowerTargetY);
    if (verticalDiff !== 0) {
      return verticalDiff;
    }

    if (a.y !== b.y) {
      return a.y - b.y;
    }

    return a.minX - b.minX;
  });

  const best = runs[0];
  if (!best) {
    return null;
  }

  return {
    minX: best.minX,
    maxX: best.maxX,
    homeY: best.y,
    centerX: best.centerX,
  };
}

export function inferPacketMarkerRow(map: WorldMapData, jailY: number): number | undefined {
  const candidates: Array<{ y: number; length: number; centerX: number; minX: number }> = [];
  const maxSearchY = Math.min(Math.max(jailY - 1, 0), map.height - 2);
  const centerX = (map.width - 1) / 2;

  for (let y = 1; y <= maxSearchY; y += 1) {
    let x = 1;
    while (x < map.width - 1) {
      const first = map.tiles[y]?.[x]?.localId;
      if (typeof first !== 'number') {
        x += 1;
        continue;
      }

      let lastId = first;
      const minX = x;
      x += 1;
      while (x < map.width - 1) {
        const currentId = map.tiles[y]?.[x]?.localId;
        if (typeof currentId !== 'number' || currentId !== lastId + 1) {
          break;
        }
        lastId = currentId;
        x += 1;
      }

      const maxX = x - 1;
      const length = maxX - minX + 1;
      if (length >= 3) {
        candidates.push({
          y,
          length,
          centerX: minX + Math.floor((maxX - minX) / 2),
          minX,
        });
      }
    }
  }

  if (candidates.length === 0) {
    return undefined;
  }

  candidates.sort((a, b) => {
    const centerDistanceDiff = Math.abs(a.centerX - centerX) - Math.abs(b.centerX - centerX);
    if (centerDistanceDiff !== 0) {
      return centerDistanceDiff;
    }

    const nearJailDiff = (jailY - a.y) - (jailY - b.y);
    if (nearJailDiff !== 0) {
      return nearJailDiff;
    }

    const lengthDiff = b.length - a.length;
    if (lengthDiff !== 0) {
      return lengthDiff;
    }

    if (a.y !== b.y) {
      return b.y - a.y;
    }

    return a.minX - b.minX;
  });

  return candidates[0]?.y;
}

export function inferJailAnchor(map: WorldMapData): InferredJailAnchor | null {
  const penGateAnchor = inferPenGateAnchor(map);
  if (penGateAnchor) {
    return penGateAnchor;
  }

  const structuralAnchor = inferStructuralAnchor(map);
  if (!structuralAnchor) {
    return null;
  }

  return {
    minX: structuralAnchor.minX,
    maxX: structuralAnchor.maxX,
    homeY: structuralAnchor.homeY,
    centerX: structuralAnchor.centerX,
  };
}
