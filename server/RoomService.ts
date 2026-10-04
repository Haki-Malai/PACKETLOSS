import { DataRace } from '../src/game/simulation/DataRace';
import { RACE, type RaceMap, type RaceSnapshot } from '../src/game/simulation/types';
import { encodeRaceSnapshot, type ClientMessage, type RoomState, type ServerMessage } from '../src/game/protocol/messages';

export interface AuthenticatedPlayer { playerId: string; name: string; roomCode?: string; operation: 'create' | 'join' | 'reconnect' }
export interface TicketConsumer {
  consume(ticket: string): Promise<AuthenticatedPlayer | null>;
}
export interface ResultStore { start(result: RaceSnapshot, roomId: string): Promise<void>; save(result: RaceSnapshot): Promise<void> }
export type SendMessage = (message: ServerMessage) => void;
interface Member {
  identity: AuthenticatedPlayer;
  color: string;
  peerId: string | null;
  send: SendMessage | null;
  ready: boolean;
  reservedUntil: number | null;
}
interface Room {
  code: string;
  ownerId: string;
  members: Map<string, Member>;
  race: DataRace | null;
  lastStep: number;
  emptySince: number | null;
  saveState: 'none' | 'pending' | 'saved' | 'failed';
  nextSave: number;
  touchedAt: number;
  starting: boolean;
  seed: number;
  rotation: number;
  pendingResult: RaceSnapshot | null;
  nextSnapshotTick: number;
}
export interface RoomServiceOptions {
  map: RaceMap;
  results: ResultStore;
  now: () => number;
  epochNow: () => number;
  randomId: () => string;
  randomCode: () => string;
  randomSeed: () => number;
  maxRooms?: number;
  snapshotHz?: number;
  instanceRunId?: string;
  processGeneration?: string;
}
export interface RoomStatus {
  ready: boolean;
  draining: boolean;
  activeMatches: number;
  connectedPlayers: number;
  rooms: number;
  idleMs: number;
  pendingResults: number;
  currentTickDebtMs: number;
  maximumTickDebtMs: number;
}

/** Keeps private room ownership, reservations, clocks, and result writes outside gameplay. */
export class RoomService {
  private readonly rooms = new Map<string, Room>();
  private readonly memberships = new Map<string, Room>();
  private draining = false;
  private unhealthyUntil = 0;
  private controlHealthy = true;
  private lastActivity: number;
  private maximumTickDebtMs = 0;

  /** Supplies monotonic time and external persistence as injectable platform adapters. */
  constructor(private readonly options: RoomServiceOptions) {
    const frequency = options.snapshotHz ?? 20;
    if (!Number.isFinite(frequency) || frequency < 1 || frequency > 30) throw new Error('Snapshot rate must be between 1 and 30 Hz.');
    this.lastActivity = options.now();
  }

  /** Reports operational status without starting or otherwise changing the instance. */
  status(): RoomStatus {
    const rooms = [...this.rooms.values()];
    const now = this.options.now();
    const connectedPlayers = rooms.reduce((sum, room) => sum + [...room.members.values()].filter((member) => member.peerId).length, 0);
    const currentTickDebtMs = rooms.reduce((maximum, room) => room.race && ['countdown', 'playing'].includes(room.race.phase)
      ? Math.max(maximum, Math.max(0, now - room.lastStep)) : maximum, 0);
    return { ready: this.controlHealthy && !this.draining && now >= this.unhealthyUntil, draining: this.draining,
      activeMatches: rooms.filter((room) => room.starting || room.race && ['playing', 'countdown'].includes(room.race.phase)).length,
      connectedPlayers, rooms: rooms.length, idleMs: connectedPlayers ? 0 : Math.max(0, now - this.lastActivity),
      pendingResults: rooms.filter((room) => room.saveState === 'pending' || room.saveState === 'failed').length,
      currentTickDebtMs, maximumTickDebtMs: this.maximumTickDebtMs };
  }

  /** Returns detached public room views for in-process development clients, never an HTTP directory. */
  roomStates(): RoomState[] {
    return [...this.rooms.values()].map((room) => this.roomState(room));
  }

  /** Rejects future joins/starts during deployment while allowing active play and reconnects. */
  drain(): void { this.draining = true; }

  /** Fails admission closed when the authoritative control heartbeat cannot be maintained. */
  setControlHealthy(healthy: boolean): void { this.controlHealthy = healthy; }

  /** Reopens admission after an abandoned deployment only when the simulation is healthy. */
  resume(): void {
    if (!this.controlHealthy || this.options.now() < this.unhealthyUntil) throw new Error('Server is unhealthy.');
    this.draining = false;
  }

  /** Sends an advance warning without relying on client timers to stop authoritative play. */
  warn(reason: 'shutdown' | 'deployment', remainingMs: number): void {
    this.rooms.forEach((room) => this.broadcast(room, { type: 'warning', reason, remainingMs }));
  }

  /** Explicit force shutdown aborts every active match and broadcasts the terminal snapshot. */
  abortAll(reason: string): void {
    this.drain();
    this.rooms.forEach((room) => {
      if (room.race && ['finished', 'aborted'].includes(room.race.phase)) return;
      room.race?.abort(reason);
      this.publishSnapshot(room);
      if (room.race) this.persist(room);
    });
  }

  /** Dispatches validated messages for a server-authenticated identity and transport generation. */
  handle(peerId: string, identity: AuthenticatedPlayer, message: ClientMessage, send: SendMessage): void {
    try {
      if (message.type === 'ping') { send({ type: 'pong', sentAt: message.sentAt, serverTimeMs: this.options.epochNow() }); return; }
      if (message.type === 'create') { this.create(peerId, identity, send); return; }
      if (message.type === 'join') { this.join(peerId, identity, message.code, send); return; }
      const room = this.memberships.get(identity.playerId);
      const member = room?.members.get(identity.playerId);
      if (!room || !member || member.peerId !== peerId) throw new Error('Join a room first.');
      switch (message.type) {
        case 'ready':
          if (room.race || room.starting) throw new Error('Readiness changes are only allowed in the lobby.');
          if (member.ready !== message.ready) room.touchedAt = this.options.now();
          member.ready = message.ready; break;
        case 'start': this.start(room, identity.playerId); break;
        case 'input':
          this.pump();
          if (!room.race || room.race.matchId !== message.matchId) throw new Error('Input belongs to another match.');
          if (!room.race.input(identity.playerId, message.sequence, message.direction)) throw new Error('Stale or inactive input.');
          return;
        case 'leave':
          this.remove(room, identity.playerId); send({ type: 'left' }); break;
        case 'rematch':
          if (this.draining) throw new Error('The server is draining.');
          if (!room.race || !['finished', 'aborted'].includes(room.race.phase)) throw new Error('The match has not ended.');
          if (room.saveState === 'pending' || room.saveState === 'failed') throw new Error('Results are still being saved.');
          room.race = null; room.saveState = 'none';
          room.rotation += 1; room.touchedAt = this.options.now();
          room.members.forEach((entry) => { entry.ready = false; });
          break;
        default: throw new Error('Authentication is already complete.');
      }
      this.publishRoom(room);
    } catch (error) {
      send({ type: 'error', code: 'room_error', message: error instanceof Error ? error.message : 'Room operation failed.' });
    }
  }

  /** Reserves a disconnected participant for thirty monotonic seconds and transfers controls. */
  disconnect(peerId: string, playerId: string): void {
    const room = this.memberships.get(playerId), member = room?.members.get(playerId);
    if (!room || !member || member.peerId !== peerId) return;
    member.peerId = null; member.send = null; member.ready = false;
    member.reservedUntil = this.options.now() + 30000;
    room.race?.disconnect(playerId);
    if (room.race?.phase === 'countdown') {
      room.race.abort('countdown_cancelled'); this.persist(room);
      room.race = null; room.members.forEach((entry) => { entry.ready = false; });
    }
    this.transferOwner(room);
    this.lastActivity = this.options.now();
    this.publishRoom(room);
  }

  /** Advances due ticks without discarding debt, coalesces catch-up snapshots, and expires reservations. */
  pump(): void {
    const now = this.options.now();
    for (const room of this.rooms.values()) {
      for (const [id, member] of room.members) {
        if (member.reservedUntil !== null && member.reservedUntil <= now) this.remove(room, id);
      }
      const connected = [...room.members.values()].some((member) => member.peerId);
      if (room.race?.phase === 'playing' && room.members.size === 0) {
        room.race.abort('room_empty'); this.publishSnapshot(room); this.persist(room);
      }
      if (connected) { room.emptySince = null; this.lastActivity = now; }
      else room.emptySince ??= now;
      if (room.race && ['countdown', 'playing'].includes(room.race.phase)) {
        const debt = now - room.lastStep;
        this.maximumTickDebtMs = Math.max(this.maximumTickDebtMs, debt);
        if (debt > 250) {
          room.race.abort('server_overloaded');
          this.unhealthyUntil = now + 5000;
          this.publishSnapshot(room); this.publishRoom(room); this.persist(room);
        } else {
          let count = 0, snapshotDue = false;
          while (now - room.lastStep >= RACE.stepMs - 1e-6 && count < 15) {
            room.race.step(); room.lastStep += RACE.stepMs; count += 1;
            if (room.race.tick >= room.nextSnapshotTick) {
              snapshotDue = true; room.nextSnapshotTick += 60 / (this.options.snapshotHz ?? 20);
            }
          }
          if (snapshotDue) this.publishSnapshot(room);
        }
      }
      if (room.race?.phase === 'finished' && (room.saveState === 'none'
        || room.saveState === 'failed' && room.nextSave <= now)) this.persist(room);
      else if (room.pendingResult && room.saveState === 'failed' && room.nextSave <= now) this.persist(room);
      const expiryMs = room.race && ['finished', 'aborted'].includes(room.race.phase) ? 300000 : 600000;
      if ((!room.race || ['finished', 'aborted'].includes(room.race.phase))
        && !room.starting && (room.members.size === 0 || now - room.touchedAt >= expiryMs)
        && room.saveState !== 'pending' && room.saveState !== 'failed') {
        this.broadcast(room, { type: 'left' }); room.members.forEach((_member, id) => this.memberships.delete(id));
        this.rooms.delete(room.code); continue;
      }
    }
  }

  /** Creates one private room; the alpha defaults to one concurrent room. */
  private create(peerId: string, identity: AuthenticatedPlayer, send: SendMessage): void {
    if (!this.status().ready) throw new Error('The server is draining or unavailable.');
    if (identity.roomCode || identity.operation !== 'create') throw new Error('This ticket does not authorize creation.');
    if (this.memberships.has(identity.playerId)) throw new Error('Leave your existing room first.');
    if (this.rooms.size >= (this.options.maxRooms ?? 1)) throw new Error('The private server is full.');
    let code = this.options.randomCode();
    while (this.rooms.has(code)) code = this.options.randomCode();
    const room: Room = { code, ownerId: identity.playerId, members: new Map(), race: null,
      lastStep: this.options.now(), emptySince: null, saveState: 'none', nextSave: 0,
      touchedAt: this.options.now(), starting: false, seed: this.options.randomSeed(), rotation: 0, pendingResult: null,
      nextSnapshotTick: 60 / (this.options.snapshotHz ?? 20) };
    this.rooms.set(code, room);
    this.attach(room, peerId, identity, send);
  }

  /** Allows fresh lobby admission or a reserved reconnect, never active-match replacement. */
  private join(peerId: string, identity: AuthenticatedPlayer, code: string, send: SendMessage): void {
    if (identity.roomCode && identity.roomCode !== code) throw new Error('Ticket does not authorize this room.');
    const room = this.rooms.get(code);
    if (!room) throw new Error('Room not found.');
    const existing = room.members.get(identity.playerId);
    const previous = this.memberships.get(identity.playerId);
    if (previous && previous !== room) throw new Error('Leave your existing room first.');
    if (existing?.peerId) throw new Error('This account is already connected.');
    const reserved = existing?.reservedUntil !== null && existing?.reservedUntil !== undefined
      && existing.reservedUntil > this.options.now();
    if (identity.operation !== (reserved ? 'reconnect' : 'join')) throw new Error('Ticket does not authorize this operation.');
    if (room.race && !reserved) throw new Error('Only reserved players can rejoin this match.');
    if (!reserved && !this.status().ready) throw new Error('The server is draining or unavailable.');
    if (!existing && room.members.size >= 4) throw new Error('The room is full.');
    this.attach(room, peerId, identity, send);
    if (room.race) { room.race.reconnect(identity.playerId); this.publishSnapshot(room); }
  }

  /** Binds a peer, preserving reserved appearance or assigning an unused random color, then sends the map. */
  private attach(room: Room, peerId: string, identity: AuthenticatedPlayer, send: SendMessage): void {
    const existing = room.members.get(identity.playerId);
    const available = RACE.colors.filter((color) => ![...room.members.values()].some((member) => member.color === color));
    const color = existing?.color ?? available[(this.options.randomSeed() >>> 0) % available.length];
    room.members.set(identity.playerId, { identity, color, peerId, send, ready: false, reservedUntil: null });
    this.memberships.set(identity.playerId, room);
    room.emptySince = null;
    room.touchedAt = this.options.now();
    this.transferOwner(room);
    send({ type: 'map', map: this.options.map });
    this.publishRoom(room);
  }

  /** Starts play after persisting a connected roster that unanimously readied. */
  private start(room: Room, playerId: string): void {
    if (room.ownerId !== playerId) throw new Error('Only the room creator can start.');
    if (!this.status().ready || room.race || room.starting || room.saveState === 'pending' || room.saveState === 'failed' || room.members.size < 2
      || [...room.members.values()].some((member) => !member.peerId || !member.ready)) throw new Error('Wait until 2–4 connected players are ready.');
    const participants = [...room.members.values()].map((member) => (
      { id: member.identity.playerId, name: member.identity.name, color: member.color }));
    const participantIds = new Set(participants.map((participant) => participant.id));
    const race = new DataRace(this.options.map, this.options.randomId(), participants, room.seed, room.rotation);
    room.starting = true;
    void this.options.results.start(race.snapshot(), room.code).then(() => {
      room.starting = false;
      const rosterChanged = room.members.size !== participantIds.size
        || [...participantIds].some((id) => {
          const member = room.members.get(id); return !member?.peerId || !member.ready;
        });
      if (!this.status().ready || rosterChanged) {
        race.abort('countdown_cancelled'); this.persist(room, race.snapshot());
        this.broadcast(room, { type: 'error', code: 'start_cancelled',
          message: this.draining ? 'The server is preparing to stop.' : 'A player left before the match started.' });
        return;
      }
      room.race = race; room.saveState = 'none'; room.lastStep = this.options.now(); room.touchedAt = this.options.now();
      room.nextSnapshotTick = 60 / (this.options.snapshotHz ?? 20);
      this.publishSnapshot(room); this.publishRoom(room);
    }, () => {
      room.starting = false;
      this.broadcast(room, { type: 'error', code: 'start_failed', message: 'Could not persist match start. Try again.' });
    });
  }

  /** Removes room membership without removing an active match's score from final rankings. */
  private remove(room: Room, playerId: string): void {
    room.race?.disconnect(playerId);
    if (room.race?.phase === 'countdown') {
      room.race.abort('countdown_cancelled'); this.persist(room);
      room.race = null; room.members.forEach((entry) => { entry.ready = false; });
    }
    room.members.delete(playerId); this.memberships.delete(playerId);
    room.touchedAt = this.options.now();
    this.transferOwner(room);
    this.publishRoom(room);
  }

  /** Assigns controls to the earliest connected remaining participant. */
  private transferOwner(room: Room): void {
    if (room.members.get(room.ownerId)?.peerId) return;
    room.ownerId = [...room.members.values()].find((member) => member.peerId)?.identity.playerId ?? room.ownerId;
  }

  /** Publishes the public lobby state to its connected participants. */
  private publishRoom(room: Room): void {
    this.broadcast(room, { type: 'room', room: this.roomState(room) });
  }

  /** Builds a detached lobby view without credentials or internal monotonic timestamps. */
  private roomState(room: Room): RoomState {
    const actualPhase = room.race?.phase;
    const phase = actualPhase === 'finished' && room.saveState !== 'saved' ? 'saving' : actualPhase;
    return { code: room.code, ownerId: room.ownerId,
      phase: phase === 'playing' || phase === 'countdown' || phase === 'saving' ? phase : phase ? 'results' : 'lobby',
      matchId: room.race?.matchId ?? null,
      canStart: !room.race && !room.starting && room.saveState !== 'pending' && room.saveState !== 'failed' && !this.draining && room.members.size >= 2
        && [...room.members.values()].every((member) => member.peerId && member.ready),
      players: [...room.members.values()].map((member) => ({ id: member.identity.playerId,
        name: member.identity.name, color: member.color, ready: member.ready, connected: !!member.peerId,
        reservedUntilMs: member.reservedUntil === null ? null
          : this.options.epochNow() + Math.max(0, member.reservedUntil - this.options.now()) })) };
  }

  /** Broadcasts one authoritative snapshot and reports phase changes through the room message. */
  private publishSnapshot(room: Room): void {
    if (!room.race) return;
    const snapshot = room.race.snapshot();
    if (snapshot.phase === 'finished' && room.saveState !== 'saved') return;
    this.broadcast(room, { type: 'snapshot', snapshot: encodeRaceSnapshot(this.options.map, snapshot), serverTimeMs: this.options.epochNow(),
      instanceRunId: this.options.instanceRunId ?? 'local-run', processGeneration: this.options.processGeneration ?? 'local-process' });
    if (snapshot.phase !== 'playing') this.publishRoom(room);
  }

  /** Sends public messages only to the peers currently bound to this room. */
  private broadcast(room: Room, message: ServerMessage): void {
    room.members.forEach((member) => member.send?.(message));
  }

  /** Retries idempotent authoritative result persistence without discarding unsaved results. */
  private persist(room: Room, result?: RaceSnapshot): void {
    if (room.saveState === 'pending') return;
    const terminal = result ?? room.pendingResult ?? room.race?.snapshot();
    if (!terminal || !['finished', 'aborted'].includes(terminal.phase)) return;
    room.pendingResult = terminal;
    room.saveState = 'pending';
    room.touchedAt = this.options.now();
    this.publishRoom(room);
    void this.options.results.save(terminal).then(() => {
      room.saveState = 'saved'; room.pendingResult = null; this.publishSnapshot(room); this.publishRoom(room);
    }, () => {
      room.saveState = 'failed'; room.nextSave = this.options.now() + 5000;
      this.broadcast(room, { type: 'error', code: 'results_retrying', message: 'Result storage is unavailable; retrying.' });
    });
  }
}

/** Provides explicitly local, idempotent result storage for fixtures and development adapters. */
export class MemoryResultStore implements ResultStore {
  readonly results = new Map<string, RaceSnapshot>();
  readonly starts = new Map<string, RaceSnapshot>();
  /** Records a match before play begins. */
  start(result: RaceSnapshot): Promise<void> { this.starts.set(result.matchId, structuredClone(result)); return Promise.resolve(); }
  /** Stores one detached authoritative terminal result per match ID. */
  save(result: RaceSnapshot): Promise<void> {
    if (!this.results.has(result.matchId)) this.results.set(result.matchId, structuredClone(result));
    return Promise.resolve();
  }
}

/** Provides single-use, expiring local credentials without accepting browser-supplied identity. */
export class MemoryTickets implements TicketConsumer {
  private readonly tickets = new Map<string, { identity: AuthenticatedPlayer; expiresAt: number }>();
  /** Uses injectable time so ticket expiration is reproducible in tests. */
  constructor(private readonly now: () => number) {}
  /** Registers an already-authorized opaque ticket for local testing. */
  issue(ticket: string, identity: AuthenticatedPlayer, expiresAt: number): void {
    this.tickets.set(ticket, { identity: { ...identity }, expiresAt });
  }
  /** Consumes a live ticket exactly once. */
  consume(ticket: string): Promise<AuthenticatedPlayer | null> {
    const record = this.tickets.get(ticket); this.tickets.delete(ticket);
    return Promise.resolve(record && record.expiresAt > this.now() ? record.identity : null);
  }
}
