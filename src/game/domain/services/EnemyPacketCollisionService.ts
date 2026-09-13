import { EnemyEntity } from '../entities/EnemyEntity';
import { CollisionBody } from '../valueObjects/CollisionBody';

export type EnemyPacketContactType = 'body-overlap';
export type EnemyPacketCollisionOutcome = 'packet-hit' | 'enemy-hit';

export interface EnemyPacketCollision {
  enemy: EnemyEntity;
  contact: EnemyPacketContactType;
  outcome: EnemyPacketCollisionOutcome;
}

export interface EnemyCollisionCandidate {
  enemy: EnemyEntity;
  body: CollisionBody;
}

export type CollisionOutcomeResolver = (_enemy: EnemyEntity) => EnemyPacketCollisionOutcome;

export function isBodyOverlap(first: CollisionBody, second: CollisionBody): boolean {
  if (first.radius <= 0 || second.radius <= 0) {
    return false;
  }
  const dx = first.x - second.x;
  const dy = first.y - second.y;
  const combinedRadius = first.radius + second.radius;
  return dx * dx + dy * dy < combinedRadius * combinedRadius;
}

function defaultOutcomeResolver(enemy: EnemyEntity): EnemyPacketCollisionOutcome {
  return enemy.state.scared ? 'enemy-hit' : 'packet-hit';
}

export function findFirstCollision(params: {
  packet: CollisionBody;
  enemies: EnemyCollisionCandidate[];
  resolveOutcome?: CollisionOutcomeResolver;
}): EnemyPacketCollision | null {
  const resolveOutcome = params.resolveOutcome ?? defaultOutcomeResolver;
  if (params.enemies.length === 0) {
    return null;
  }

  for (const candidate of params.enemies) {
    if (isBodyOverlap(params.packet, candidate.body)) {
      return {
        enemy: candidate.enemy,
        contact: 'body-overlap',
        outcome: resolveOutcome(candidate.enemy),
      };
    }
  }

  return null;
}
