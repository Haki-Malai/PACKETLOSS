import { z } from 'zod';
import { DIRECTIONS, type RaceMap, type RaceSnapshot } from '../simulation/types';
import { PROTOCOL_VERSION } from './version';

export { PROTOCOL_VERSION } from './version';
const direction = z.enum(DIRECTIONS);
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const finite = z.number().finite();
const identifier = z.string().min(1).max(128);
const movement = z.object({ cell: integer, to: integer.nullable(), progress: z.number().min(0).max(1),
  direction, queued: direction }).strict();
const pickup = z.object({ id: integer, cell: integer, kind: z.enum(['bit', 'core']) }).strict();
const player = z.object({ id: identifier, name: z.string().min(1).max(32), color: z.string().regex(/^#[0-9a-f]{6}$/i),
  slot: z.number().int().min(0).max(3), connected: z.boolean(), score: integer, movement,
  huntMs: finite.nonnegative(), protectionMs: finite.nonnegative(), deathMs: finite.nonnegative(),
  portalBlinkMs: finite.nonnegative().optional(),
  chain: integer, acknowledgedInput: integer }).strict();
const ranking = z.object({ playerId: identifier, name: z.string().max(32), score: integer,
  rank: z.number().int().min(1).max(4) }).strict();
export const raceMapSchema: z.ZodType<RaceMap> = z.object({ id: identifier,
  width: z.number().int().min(1).max(128), height: z.number().int().min(1).max(128),
  cells: z.array(z.object({ x: integer, y: integer, edges: z.array(z.object({ to: integer,
    direction, portal: z.boolean().optional() }).strict()).max(5) }).strict()).max(16384),
  spawns: z.array(integer).length(4), enemyHome: integer, pickups: z.array(pickup).min(1).max(16384) }).strict();
const raceState = { matchId: identifier, mapId: identifier,
  tick: integer, playTicks: integer, phase: z.enum(['countdown', 'playing', 'finished', 'aborted']),
  players: z.array(player).min(2).max(4), enemies: z.array(z.object({ id: z.enum(['firewall', 'virus']),
    movement, phase: z.enum(['pen', 'active', 'eaten', 'returning']), waitMs: finite,
    patrol: z.array(integer).max(65536), patrolIndex: integer }).strict()).max(2),
  refill: integer, randomState: integer, rankings: z.array(ranking).max(4),
  abortReason: z.string().max(128).nullable() };
export const raceSnapshotSchema: z.ZodType<RaceSnapshot> = z.object({
  ...raceState, pickups: z.array(pickup).max(16384),
}).strict();
const pickupSet = z.object({ basis: z.enum(['remaining', 'removed']),
  ids: z.array(integer).max(16384).refine((ids) => new Set(ids).size === ids.length) }).strict();
export const wireRaceSnapshotSchema = z.object({ ...raceState, pickupSet }).strict();
export type WireRaceSnapshot = z.infer<typeof wireRaceSnapshotSchema>;
const roomSchema = z.object({ code: z.string().regex(/^[A-Z2-9]{6}$/), ownerId: identifier,
  phase: z.enum(['lobby', 'countdown', 'playing', 'saving', 'results']), matchId: identifier.nullable(),
  canStart: z.boolean(), players: z.array(z.object({ id: identifier, name: z.string().max(32),
    color: z.string(), ready: z.boolean(), connected: z.boolean(), reservedUntilMs: finite.nullable() }).strict()).max(4) }).strict();
export type RoomState = z.infer<typeof roomSchema>;

export const clientMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('authenticate'), version: z.literal(PROTOCOL_VERSION), ticket: z.string().min(1).max(4096) }).strict(),
  z.object({ type: z.literal('create') }).strict(),
  z.object({ type: z.literal('join'), code: z.string().regex(/^[A-Z2-9]{6}$/) }).strict(),
  z.object({ type: z.literal('ready'), ready: z.boolean() }).strict(),
  z.object({ type: z.literal('start') }).strict(),
  z.object({ type: z.literal('input'), matchId: identifier, sequence: integer, direction }).strict(),
  z.object({ type: z.literal('rematch') }).strict(),
  z.object({ type: z.literal('leave') }).strict(),
  z.object({ type: z.literal('ping'), sentAt: finite }).strict(),
]);
export type ClientMessage = z.infer<typeof clientMessageSchema>;
export const serverMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('authenticated'), version: z.literal(PROTOCOL_VERSION), playerId: identifier,
    instanceRunId: identifier, processGeneration: identifier }).strict(),
  z.object({ type: z.literal('room'), room: roomSchema }).strict(),
  z.object({ type: z.literal('map'), map: raceMapSchema }).strict(),
  z.object({ type: z.literal('snapshot'), snapshot: wireRaceSnapshotSchema, serverTimeMs: finite,
    instanceRunId: identifier, processGeneration: identifier }).strict(),
  z.object({ type: z.literal('error'), code: z.string().max(64), message: z.string().max(256) }).strict(),
  z.object({ type: z.literal('warning'), reason: z.enum(['shutdown', 'deployment']), remainingMs: finite.nonnegative() }).strict(),
  z.object({ type: z.literal('left') }).strict(),
  z.object({ type: z.literal('pong'), sentAt: finite, serverTimeMs: finite }).strict(),
]);
export type ServerMessage = z.infer<typeof serverMessageSchema>;

/** Parses untrusted JSON and rejects unknown keys, malformed values, and unsupported messages. */
export function parseClientMessage(raw: string): ClientMessage | null {
  try { const result = clientMessageSchema.safeParse(JSON.parse(raw) as unknown); return result.success ? result.data : null; }
  catch { return null; }
}

/** Validates server messages before they affect browser room or presentation state. */
export function parseServerMessage(raw: string): ServerMessage | null {
  try { const result = serverMessageSchema.safeParse(JSON.parse(raw) as unknown); return result.success ? result.data : null; }
  catch { return null; }
}

/** References the immutable map layout instead of repeating thousands of pickup objects at snapshot frequency. */
export function encodeRaceSnapshot(map: RaceMap, snapshot: RaceSnapshot): WireRaceSnapshot {
  if (snapshot.mapId !== map.id) throw new Error('Snapshot belongs to another map.');
  const definitions = new Map(map.pickups.map((point) => [point.id, point]));
  if (definitions.size !== map.pickups.length) throw new Error('Map pickup identifiers must be unique.');
  const remaining = snapshot.pickups.map((point) => {
    const definition = definitions.get(point.id);
    if (!definition || definition.cell !== point.cell || definition.kind !== point.kind) {
      throw new Error('Snapshot contains an unknown pickup.');
    }
    return point.id;
  });
  const remainingSet = new Set(remaining);
  if (remainingSet.size !== remaining.length) throw new Error('Snapshot pickup identifiers must be unique.');
  const removed = map.pickups.flatMap((point) => remainingSet.has(point.id) ? [] : [point.id]);
  const { pickups: _pickups, ...state } = snapshot;
  return { ...state, pickupSet: remaining.length <= removed.length
    ? { basis: 'remaining', ids: remaining } : { basis: 'removed', ids: removed } };
}

/** Rebuilds presentation state only from a validated wire set and the previously validated immutable map. */
export function decodeRaceSnapshot(map: RaceMap, snapshot: WireRaceSnapshot): RaceSnapshot | null {
  if (snapshot.mapId !== map.id) return null;
  const definitions = new Set(map.pickups.map((point) => point.id));
  if (definitions.size !== map.pickups.length || snapshot.pickupSet.ids.some((id) => !definitions.has(id))) return null;
  const listed = new Set(snapshot.pickupSet.ids);
  const pickups = map.pickups.filter((point) => snapshot.pickupSet.basis === 'remaining'
    ? listed.has(point.id) : !listed.has(point.id));
  const { pickupSet: _pickupSet, ...state } = snapshot;
  return { ...state, pickups };
}
