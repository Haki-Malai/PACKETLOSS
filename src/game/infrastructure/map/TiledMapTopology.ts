import { CollisionTile } from '../../domain/world/CollisionGrid';
import { PortalPair, WorldTile } from '../../domain/world/WorldState';

type PortalSide = 'left' | 'right' | 'top' | 'bottom';

interface PortalCandidate {
  tile: { x: number; y: number };
  side: PortalSide;
}

export function createBlockingCollisionTile(): CollisionTile {
  return {
    collides: true,
    penGate: false,
    portal: false,
    up: true,
    down: true,
    left: true,
    right: true,
  };
}

function isVoidTile(tile: WorldTile | undefined): boolean {
  return !tile || tile.gid === null;
}

function isFullyBlockingTile(tile: WorldTile | undefined): boolean {
  if (!tile) {
    return true;
  }
  const collision = tile.collision;
  return collision.collides && collision.up && collision.right && collision.down && collision.left;
}

function canBePortalCandidate(tile: WorldTile | undefined): tile is WorldTile {
  if (!tile || tile.gid === null) {
    return false;
  }
  if (tile.collision.penGate) {
    return false;
  }
  return !isFullyBlockingTile(tile);
}

function findInteriorPortalCandidates(tiles: WorldTile[][]): PortalCandidate[] {
  const candidates: PortalCandidate[] = [];
  const height = tiles.length;
  const width = tiles[0]?.length ?? 0;

  if (height < 3 || width < 3) {
    return candidates;
  }

  for (let y = 0; y < height; y += 1) {
    const leftCandidate = tiles[y]?.[1];
    const leftOuter = tiles[y]?.[0];
    if (canBePortalCandidate(leftCandidate) && leftOuter && leftOuter.gid !== null && !leftOuter.collision.left) {
      candidates.push({ tile: { x: 1, y }, side: 'left' });
    }

    const rightCandidate = tiles[y]?.[width - 2];
    const rightOuter = tiles[y]?.[width - 1];
    if (
      canBePortalCandidate(rightCandidate) &&
      rightOuter &&
      rightOuter.gid !== null &&
      !rightOuter.collision.right
    ) {
      candidates.push({ tile: { x: width - 2, y }, side: 'right' });
    }
  }

  for (let x = 0; x < width; x += 1) {
    const topCandidate = tiles[1]?.[x];
    const topOuter = tiles[0]?.[x];
    if (canBePortalCandidate(topCandidate) && topOuter && topOuter.gid !== null && !topOuter.collision.up) {
      candidates.push({ tile: { x, y: 1 }, side: 'top' });
    }

    const bottomCandidate = tiles[height - 2]?.[x];
    const bottomOuter = tiles[height - 1]?.[x];
    if (
      canBePortalCandidate(bottomCandidate) &&
      bottomOuter &&
      bottomOuter.gid !== null &&
      !bottomOuter.collision.down
    ) {
      candidates.push({ tile: { x, y: height - 2 }, side: 'bottom' });
    }
  }

  return candidates;
}

function findBoundaryPortalCandidates(tiles: WorldTile[][]): PortalCandidate[] {
  const candidates: PortalCandidate[] = [];
  for (let y = 0; y < tiles.length; y += 1) {
    for (let x = 0; x < (tiles[y]?.length ?? 0); x += 1) {
      const tile = tiles[y]?.[x];
      if (!tile || tile.gid === null || tile.collision.collides || tile.collision.penGate) {
        continue;
      }

      const upNeighbor = tiles[y - 1]?.[x];
      const downNeighbor = tiles[y + 1]?.[x];
      const leftNeighbor = tiles[y]?.[x - 1];
      const rightNeighbor = tiles[y]?.[x + 1];

      if (isVoidTile(leftNeighbor) && !tile.collision.left) {
        candidates.push({ tile: { x, y }, side: 'left' });
      }
      if (isVoidTile(rightNeighbor) && !tile.collision.right) {
        candidates.push({ tile: { x, y }, side: 'right' });
      }
      if (isVoidTile(upNeighbor) && !tile.collision.up) {
        candidates.push({ tile: { x, y }, side: 'top' });
      }
      if (isVoidTile(downNeighbor) && !tile.collision.down) {
        candidates.push({ tile: { x, y }, side: 'bottom' });
      }
    }
  }
  return candidates;
}

function clearPortalFlags(tiles: WorldTile[][]): void {
  for (let y = 0; y < tiles.length; y += 1) {
    for (let x = 0; x < (tiles[y]?.length ?? 0); x += 1) {
      const tile = tiles[y]?.[x];
      if (!tile || tile.gid === null) {
        continue;
      }
      tile.collision.portal = false;
    }
  }
}

function preferWalkableCandidates(candidates: PortalCandidate[], tiles: WorldTile[][]): PortalCandidate[] {
  const walkable = candidates.filter((candidate) => {
    const tile = tiles[candidate.tile.y]?.[candidate.tile.x];
    return Boolean(tile && !tile.collision.collides);
  });

  return walkable.length > 0 ? walkable : candidates;
}

function pickCenteredCandidate(candidates: PortalCandidate[], side: PortalSide, width: number, height: number): PortalCandidate | null {
  const centerX = (width - 1) / 2;
  const centerY = (height - 1) / 2;
  const sideCandidates = candidates.filter((candidate) => candidate.side === side);
  if (sideCandidates.length === 0) {
    return null;
  }

  sideCandidates.sort((a, b) => {
    if (side === 'left' || side === 'right') {
      const distanceDiff = Math.abs(a.tile.y - centerY) - Math.abs(b.tile.y - centerY);
      if (distanceDiff !== 0) return distanceDiff;
      if (a.tile.x !== b.tile.x) return side === 'left' ? a.tile.x - b.tile.x : b.tile.x - a.tile.x;
      return a.tile.y - b.tile.y;
    }

    const distanceDiff = Math.abs(a.tile.x - centerX) - Math.abs(b.tile.x - centerX);
    if (distanceDiff !== 0) return distanceDiff;
    if (a.tile.y !== b.tile.y) return side === 'top' ? a.tile.y - b.tile.y : b.tile.y - a.tile.y;
    return a.tile.x - b.tile.x;
  });

  return sideCandidates[0] ?? null;
}

export function inferPortalPairs(tiles: WorldTile[][]): PortalPair[] {
  if (tiles.length === 0 || (tiles[0]?.length ?? 0) === 0) {
    return [];
  }

  clearPortalFlags(tiles);

  const interiorCandidates = findInteriorPortalCandidates(tiles);
  const boundaryCandidates = findBoundaryPortalCandidates(tiles);
  const sides: PortalSide[] = ['left', 'right', 'top', 'bottom'];
  const candidates: PortalCandidate[] = [];

  sides.forEach((side) => {
    const interiorForSide = interiorCandidates.filter((candidate) => candidate.side === side);
    if (interiorForSide.length > 0) {
      candidates.push(...preferWalkableCandidates(interiorForSide, tiles));
      return;
    }
    candidates.push(...boundaryCandidates.filter((candidate) => candidate.side === side));
  });

  const width = tiles[0]?.length ?? 0;
  const height = tiles.length;

  const left = pickCenteredCandidate(candidates, 'left', width, height);
  const right = pickCenteredCandidate(candidates, 'right', width, height);
  const top = pickCenteredCandidate(candidates, 'top', width, height);
  const bottom = pickCenteredCandidate(candidates, 'bottom', width, height);

  const pairs: PortalPair[] = [];
  if (left && right) {
    pairs.push({ from: { ...left.tile }, to: { ...right.tile } });
  }
  if (top && bottom) {
    pairs.push({ from: { ...top.tile }, to: { ...bottom.tile } });
  }

  pairs.forEach((pair) => {
    const from = tiles[pair.from.y]?.[pair.from.x];
    const to = tiles[pair.to.y]?.[pair.to.x];
    if (from) from.collision.portal = true;
    if (to) to.collision.portal = true;
  });

  return pairs;
}

export function applyVoidLeakBoundaryGuards(tiles: WorldTile[][]): void {
  const directions: Array<{ dx: number; dy: number; edge: keyof Pick<CollisionTile, 'up' | 'right' | 'down' | 'left'> }> = [
    { dx: 0, dy: -1, edge: 'up' },
    { dx: 1, dy: 0, edge: 'right' },
    { dx: 0, dy: 1, edge: 'down' },
    { dx: -1, dy: 0, edge: 'left' },
  ];

  for (let y = 0; y < tiles.length; y += 1) {
    for (let x = 0; x < (tiles[y]?.length ?? 0); x += 1) {
      const tile = tiles[y]?.[x];
      if (!tile || tile.gid === null || tile.collision.portal) {
        continue;
      }

      const leaksToVoid = directions.some(({ dx, dy, edge }) => {
        const neighbor = tiles[y + dy]?.[x + dx];
        return isVoidTile(neighbor) && !tile.collision[edge];
      });

      if (leaksToVoid) {
        tile.collision = createBlockingCollisionTile();
      }
    }
  }
}
