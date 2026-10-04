import { describe, expect, it, vi } from 'vitest';
import { MemoryResultStore, MemoryTickets, RoomService, type AuthenticatedPlayer } from '../../server/RoomService';
import type { ClientMessage, ServerMessage } from '../game/protocol/messages';
import { RACE } from '../game/simulation/types';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

function last<T>(items: readonly T[]): T {
  return items[items.length - 1];
}

/** Builds a room service with explicit virtual time, randomness, and a captured public transport. */
function fixture(seed = 4) {
  let now = 0, counter = 0;
  const messages: ServerMessage[] = [], results = new MemoryResultStore();
  const rooms = new RoomService({ map: dataRaceFixture(), results, now: () => now, epochNow: () => now,
    randomId: () => `match-${++counter}`, randomCode: () => 'ABC234', randomSeed: () => seed });
  const alice: AuthenticatedPlayer = { playerId: 'alice', name: 'Alice', operation: 'create' };
  const bob: AuthenticatedPlayer = { playerId: 'bob', name: 'Bob', operation: 'join', roomCode: 'ABC234' };
  /** Delivers one validated operation through the same identity binding as WebSockets. */
  const send = (identity: AuthenticatedPlayer, message: ClientMessage, peer = identity.playerId): void => {
    rooms.handle(peer, identity, message, (entry) => messages.push(entry));
  };
  /** Advances authoritative time in fixed increments without manufacturing event-loop stalls. */
  const ticks = (count: number): void => { for (let index = 0; index < count; index += 1) { now += RACE.stepMs; rooms.pump(); } };
  /** Creates, readies, and persists the start of the two-player fixture match. */
  const start = async (): Promise<void> => {
    send(alice, { type: 'create' }); send(bob, { type: 'join', code: 'ABC234' });
    send(alice, { type: 'ready', ready: true }); send(bob, { type: 'ready', ready: true }); send(alice, { type: 'start' });
    await Promise.resolve();
  };
  return { rooms, messages, results, alice, bob, send, ticks, start, jump: (milliseconds: number) => { now += milliseconds; rooms.pump(); } };
}

/** Compares authoritative appearance by identity regardless of roster or spawn ordering. */
function playerColors(players: readonly { id: string; color: string }[]): Record<string, string> {
  return Object.fromEntries(players.map((player) => [player.id, player.color]));
}

describe('authoritative private rooms', () => {
  it('randomly assigns distinct colors and preserves remaining players when a lobby seat is replaced', () => {
    const game = fixture(1), alternative = fixture(2);
    game.send(game.alice, { type: 'create' }); alternative.send(alternative.alice, { type: 'create' });
    expect(game.rooms.roomStates()[0].players[0].color).not.toBe(alternative.rooms.roomStates()[0].players[0].color);
    const carol: AuthenticatedPlayer = { playerId: 'carol', name: 'Carol', operation: 'join', roomCode: 'ABC234' };
    const dan: AuthenticatedPlayer = { playerId: 'dan', name: 'Dan', operation: 'join', roomCode: 'ABC234' };
    for (const identity of [game.bob, carol, dan]) game.send(identity, { type: 'join', code: 'ABC234' });
    const before = playerColors(game.rooms.roomStates()[0].players);
    expect(new Set(Object.values(before)).size).toBe(4);
    expect(Object.values(before).every((color) => RACE.colors.some((available) => available === color))).toBe(true);
    game.send(game.bob, { type: 'leave' });
    game.send({ playerId: 'eve', name: 'Eve', operation: 'join', roomCode: 'ABC234' }, { type: 'join', code: 'ABC234' });
    const after = playerColors(game.rooms.roomStates()[0].players);
    expect(after).toEqual({ alice: before.alice, carol: before.carol, dan: before.dan, eve: before.bob });
  });

  it('keeps lobby colors through play, reserved reconnects, results, and rotated rematch spawns', async () => {
    const game = fixture(); await game.start();
    const colors = playerColors(game.rooms.roomStates()[0].players);
    const initial = [...game.results.starts.values()][0];
    expect(playerColors(initial.players)).toEqual(colors);
    expect(playerColors(last(game.messages.filter((message) => message.type === 'snapshot')).snapshot.players)).toEqual(colors);
    game.rooms.disconnect('alice', 'alice');
    const returning = { ...game.alice, operation: 'reconnect' as const, roomCode: 'ABC234' };
    game.send(returning, { type: 'join', code: 'ABC234' }, 'alice-new');
    expect(playerColors(game.rooms.roomStates()[0].players)).toEqual(colors);
    expect(playerColors(last(game.messages.filter((message) => message.type === 'snapshot')).snapshot.players)).toEqual(colors);
    game.ticks(RACE.matchTicks); await Promise.resolve();
    expect(playerColors([...game.results.results.values()][0].players)).toEqual(colors);
    game.send(game.bob, { type: 'rematch' });
    expect(playerColors(game.rooms.roomStates()[0].players)).toEqual(colors);
    game.send(returning, { type: 'ready', ready: true }, 'alice-new');
    game.send(game.bob, { type: 'ready', ready: true }); game.send(game.bob, { type: 'start' });
    await Promise.resolve();
    const rematch = last([...game.results.starts.values()]);
    expect(rematch.matchId).not.toBe(initial.matchId);
    expect(playerColors(rematch.players)).toEqual(colors);
    expect(rematch.players.find((player) => player.id === 'alice')!.slot)
      .not.toBe(initial.players.find((player) => player.id === 'alice')!.slot);
  });

  it('releases an empty lobby and keeps public inspection detached from membership', () => {
    const game = fixture(); game.send(game.alice, { type: 'create' });
    game.rooms.roomStates()[0].players[0].ready = true;
    expect(game.rooms.roomStates()[0].players[0].ready).toBe(false);
    game.send(game.alice, { type: 'leave' }); game.ticks(1);
    expect(game.rooms.status().rooms).toBe(0);
    game.send(game.alice, { type: 'create' });
    expect(game.rooms.status().connectedPlayers).toBe(1);
  });

  it('retains empty rooms while a start or terminal result is still being persisted', async () => {
    const game = fixture();
    let started: (() => void) | undefined, saved: (() => void) | undefined;
    vi.spyOn(game.results, 'start').mockImplementation(() => new Promise<void>((resolve) => { started = resolve; }));
    vi.spyOn(game.results, 'save').mockImplementation(() => new Promise<void>((resolve) => { saved = resolve; }));
    await game.start();
    game.send(game.alice, { type: 'leave' }); game.send(game.bob, { type: 'leave' }); game.ticks(1);
    expect(game.rooms.status().rooms).toBe(1);
    started?.(); await Promise.resolve(); game.ticks(1);
    expect(game.rooms.status().pendingResults).toBe(1);
    expect(game.rooms.status().rooms).toBe(1);
    saved?.(); await Promise.resolve(); game.ticks(1);
    expect(game.rooms.status().rooms).toBe(0);
  });

  it('starts play immediately and keeps the match active when the creator disconnects', async () => {
    const game = fixture(); await game.start();
    const initial = last(game.messages.filter((message) => message.type === 'snapshot'));
    expect(initial.snapshot).toMatchObject({ phase: 'playing', tick: 0, playTicks: 0 });
    game.rooms.disconnect('alice', 'alice');
    const room = last(game.messages.filter((message) => message.type === 'room'));
    expect(room.room).toMatchObject({ phase: 'playing', ownerId: 'bob', matchId: initial.snapshot.matchId });
    expect(room.room.players.find((player) => player.id === 'alice')?.connected).toBe(false);
    expect(game.results.starts.size).toBe(1);
    expect(game.results.results.size).toBe(0);
  });

  it('allows reserved reconnects for thirty seconds and rejects new active-match admissions', async () => {
    const game = fixture(); await game.start();
    game.rooms.disconnect('alice', 'alice');
    game.send({ ...game.alice, operation: 'reconnect', roomCode: 'ABC234' }, { type: 'join', code: 'ABC234' }, 'alice-new');
    const snapshot = last(game.messages.filter((message) => message.type === 'snapshot'));
    expect(snapshot.snapshot.players.find((player) => player.id === 'alice')!.protectionMs).toBe(1200);
    game.send({ playerId: 'new', name: 'New', operation: 'join', roomCode: 'ABC234' }, { type: 'join', code: 'ABC234' });
    expect(last(game.messages)).toMatchObject({ type: 'error' });
  });

  it('aborts an empty match after its reservations expire without declaring winners', async () => {
    const game = fixture(); await game.start();
    game.rooms.disconnect('alice', 'alice'); game.rooms.disconnect('bob', 'bob');
    game.ticks(1801); await Promise.resolve();
    const result = [...game.results.results.values()][0];
    expect(result.phase).toBe('aborted'); expect(result.abortReason).toBe('room_empty'); expect(result.rankings).toEqual([]);
  });

  it('withholds final rankings and blocks rematch until durable persistence succeeds', async () => {
    const game = fixture(); await game.start();
    let finish: (() => void) | undefined;
    vi.spyOn(game.results, 'save').mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    game.ticks(RACE.matchTicks);
    expect(game.messages.some((message) => message.type === 'snapshot' && message.snapshot.phase === 'finished')).toBe(false);
    game.send(game.alice, { type: 'rematch' }); expect(last(game.messages)).toMatchObject({ type: 'error' });
    finish?.(); await Promise.resolve();
    expect(game.messages.some((message) => message.type === 'snapshot' && message.snapshot.phase === 'finished')).toBe(true);
    game.send(game.alice, { type: 'rematch' });
    expect(last(game.messages.filter((message) => message.type === 'room')).room.phase).toBe('lobby');
  });

  it('cancels an asynchronously persisted start when draining begins before play', async () => {
    const game = fixture();
    let finish: (() => void) | undefined;
    vi.spyOn(game.results, 'start').mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    game.send(game.alice, { type: 'create' }); game.send(game.bob, { type: 'join', code: 'ABC234' });
    game.send(game.alice, { type: 'ready', ready: true }); game.send(game.bob, { type: 'ready', ready: true });
    game.send(game.alice, { type: 'start' }); game.rooms.drain(); finish?.(); await Promise.resolve();
    expect(game.messages.some((message) => message.type === 'snapshot')).toBe(false);
    expect(last(game.messages)).toMatchObject({ type: 'error', code: 'start_cancelled' });
  });

  it('cancels an asynchronously persisted start when its frozen roster changes', async () => {
    const game = fixture();
    let finish: (() => void) | undefined;
    vi.spyOn(game.results, 'start').mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    game.send(game.alice, { type: 'create' }); game.send(game.bob, { type: 'join', code: 'ABC234' });
    game.send(game.alice, { type: 'ready', ready: true }); game.send(game.bob, { type: 'ready', ready: true });
    game.send(game.alice, { type: 'start' }); game.send(game.bob, { type: 'leave' });
    finish?.(); await Promise.resolve();
    expect(game.messages.some((message) => message.type === 'snapshot')).toBe(false);
    expect(game.messages.some((message) => message.type === 'error'
      && message.code === 'start_cancelled')).toBe(true);
  });

  it('broadcasts only the current snapshot after catching up and preserves the next scheduled broadcast', async () => {
    const game = fixture(); await game.start();
    game.messages.length = 0;
    game.jump(200);
    expect(game.messages.filter((message) => message.type === 'snapshot')
      .map((message) => message.snapshot.tick)).toEqual([12, 12]);
    game.messages.length = 0;
    game.ticks(2);
    expect(game.messages.filter((message) => message.type === 'snapshot')).toEqual([]);
    game.ticks(1);
    expect(game.messages.filter((message) => message.type === 'snapshot')
      .map((message) => message.snapshot.tick)).toEqual([15, 15]);
  });

  it('expires an inactive lobby despite heartbeats and aborts rather than discarding excessive simulation debt', async () => {
    const idle = fixture(); idle.send(idle.alice, { type: 'create' });
    idle.send(idle.alice, { type: 'ping', sentAt: 1 }); idle.jump(600000);
    expect(idle.rooms.status().rooms).toBe(0);
    const game = fixture(); await game.start(); game.jump(251);
    expect(game.rooms.status().ready).toBe(false);
    expect(last(game.messages.filter((message) => message.type === 'snapshot')).snapshot.abortReason).toBe('server_overloaded');
  });

  it('enforces ticket operation and consumes each local ticket only once', async () => {
    const game = fixture(); game.send(game.alice, { type: 'create' });
    game.send({ ...game.bob, operation: 'create' }, { type: 'join', code: 'ABC234' });
    expect(last(game.messages)).toMatchObject({ type: 'error' });
    const tickets = new MemoryTickets(() => 100);
    tickets.issue('opaque', game.alice, 200);
    expect(await tickets.consume('opaque')).toEqual(game.alice);
    expect(await tickets.consume('opaque')).toBeNull();
  });
});
