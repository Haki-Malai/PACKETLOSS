import { GhostEntity } from '../entities/GhostEntity';
import { CollisionBody } from '../valueObjects/CollisionBody';

export type GhostPacketContactType = 'body-overlap';
export type GhostPacketCollisionOutcome = 'packet-hit' | 'ghost-hit';

export interface GhostPacketCollision {
  ghost: GhostEntity;
  contact: GhostPacketContactType;
  outcome: GhostPacketCollisionOutcome;
}

export interface GhostCollisionCandidate {
  ghost: GhostEntity;
  body: CollisionBody;
}

export type CollisionOutcomeResolver = (_ghost: GhostEntity) => GhostPacketCollisionOutcome;

export function isBodyOverlap(first: CollisionBody, second: CollisionBody): boolean {
  if (first.radius <= 0 || second.radius <= 0) {
    return false;
  }
  const dx = first.x - second.x;
  const dy = first.y - second.y;
  const combinedRadius = first.radius + second.radius;
  return dx * dx + dy * dy < combinedRadius * combinedRadius;
}

function defaultOutcomeResolver(ghost: GhostEntity): GhostPacketCollisionOutcome {
  return ghost.state.scared ? 'ghost-hit' : 'packet-hit';
}

export function findFirstCollision(params: {
  packet: CollisionBody;
  ghosts: GhostCollisionCandidate[];
  resolveOutcome?: CollisionOutcomeResolver;
}): GhostPacketCollision | null {
  const resolveOutcome = params.resolveOutcome ?? defaultOutcomeResolver;
  if (params.ghosts.length === 0) {
    return null;
  }

  for (const candidate of params.ghosts) {
    if (isBodyOverlap(params.packet, candidate.body)) {
      return {
        ghost: candidate.ghost,
        contact: 'body-overlap',
        outcome: resolveOutcome(candidate.ghost),
      };
    }
  }

  return null;
}
