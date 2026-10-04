import { createMovement, move, position } from './movement';
import { cloneSnapshot } from './cloneSnapshot';
import { DIRECTIONS, RACE, type PlayerIdentity, type RaceMap, type RacePlayer, type RaceSnapshot } from './types';
import { COLLECTIBLE_CONFIG, PACKET_PORTAL_BLINK, SPRITE_SIZE, TILE_SIZE } from '../../config/constants';
import { isBodyOverlap } from '../domain/valueObjects/CollisionBody';

/** Owns all mutable state for one deterministic authoritative Data Race match. */
export class DataRace {
  private state: RaceSnapshot;

  /** Starts play immediately with seeded spawn/pickup ordering and authoritative participant colors. */
  constructor(readonly map: RaceMap, matchId: string, identities: readonly PlayerIdentity[], seed: number, slotRotation = 0) {
    if (identities.length < 2 || identities.length > 4 || new Set(identities.map((player) => player.id)).size !== identities.length) {
      throw new Error('A match requires 2–4 distinct players.');
    }
    if (map.spawns.length !== 4 || map.pickups.length === 0) throw new Error('Map requires four spawns and pickups.');
    this.state = { matchId, mapId: map.id, tick: 0, playTicks: 0, phase: 'playing',
      players: [], enemies: [], pickups: map.pickups.map((point) => ({ ...point })), refill: 0,
      randomState: seed >>> 0, rankings: [], abortReason: null };
    const participants = [...identities].sort((a, b) => a.id.localeCompare(b.id));
    for (let index = participants.length - 1; index > 0; index -= 1) {
      const other = Math.floor(this.random() * (index + 1));
      [participants[index], participants[other]] = [participants[other], participants[index]];
    }
    this.state.players = participants.map((identity, index) => {
      const slot = (index + slotRotation) % participants.length;
      return { ...identity, slot, color: identity.color ?? RACE.colors[slot],
      score: 0, connected: true, movement: createMovement(map.spawns[slot]), huntMs: 0,
      protectionMs: RACE.protectionMs, portalBlinkMs: 0, deathMs: 0, chain: 0, acknowledgedInput: 0 };
    }).sort((a, b) => a.slot - b.slot);
  }

  /** Returns a detached wire snapshot so consumers cannot mutate authoritative state. */
  snapshot(): RaceSnapshot { return cloneSnapshot(this.state); }

  /** Reads lifecycle metadata without allocating the full collectible snapshot. */
  get phase(): RaceSnapshot['phase'] { return this.state.phase; }
  /** Reads the current fixed-step counter for the independent broadcast scheduler. */
  get tick(): number { return this.state.tick; }
  /** Reads the immutable session identity used to reject stale inputs. */
  get matchId(): string { return this.state.matchId; }

  /** Restores trusted replay state, never client authority, discarding enemies from earlier multiplayer snapshots. */
  restore(snapshot: RaceSnapshot): void {
    if (snapshot.matchId !== this.state.matchId || snapshot.mapId !== this.map.id) throw new Error('Snapshot belongs to another session.');
    this.state = cloneSnapshot({ ...snapshot, enemies: [] });
  }

  /** Applies a validated direction once; sequence numbers never grant extra simulation time. */
  input(playerId: string, sequence: number, direction: typeof DIRECTIONS[number]): boolean {
    const player = this.state.players.find((candidate) => candidate.id === playerId);
    if (!player?.connected || sequence <= player.acknowledgedInput || !Number.isSafeInteger(sequence)
      || !DIRECTIONS.includes(direction) || !['countdown', 'playing'].includes(this.state.phase)) return false;
    player.acknowledgedInput = sequence;
    player.movement.queued = direction;
    return true;
  }

  /** Removes a disconnected participant from play while retaining their authoritative score. */
  disconnect(playerId: string): void {
    const player = this.state.players.find((candidate) => candidate.id === playerId);
    if (player) player.connected = false;
  }

  /** Restores a reserved participant at their assigned spawn with fresh protection. */
  reconnect(playerId: string): void {
    const player = this.state.players.find((candidate) => candidate.id === playerId);
    if (!player) throw new Error('Unknown reserved participant.');
    player.connected = true;
    this.respawn(player);
  }

  /** Stops an unhealthy server's match without recording competitive rankings. */
  abort(reason: string): void {
    if (this.state.phase === 'finished' || this.state.phase === 'aborted') return;
    this.state.phase = 'aborted';
    this.state.abortReason = reason;
    this.state.rankings = [];
  }

  /** Advances exactly one 60 Hz step, independent of browser or platform clocks. */
  step(): void {
    if (this.state.phase === 'finished' || this.state.phase === 'aborted') return;
    this.state.tick += 1;
    if (this.state.phase === 'countdown') {
      if (this.state.tick >= RACE.countdownTicks) this.state.phase = 'playing';
      return;
    }
    this.state.playTicks += 1;
    for (const player of this.state.players) {
      if (!player.connected) continue;
      player.huntMs = Math.max(0, player.huntMs - RACE.stepMs);
      player.protectionMs = Math.max(0, player.protectionMs - RACE.stepMs);
      player.portalBlinkMs = Math.max(0, (player.portalBlinkMs ?? 0) - RACE.stepMs);
      if (player.huntMs < 1e-6) { player.huntMs = 0; player.chain = 0; }
      if (player.deathMs > 0) {
        player.deathMs = Math.max(0, player.deathMs - RACE.stepMs);
        if (player.deathMs < 1e-6) this.respawn(player);
      } else move(this.map, player.movement, RACE.playerSpeed * RACE.stepMs / 1000, true, undefined,
        () => { player.portalBlinkMs = PACKET_PORTAL_BLINK.durationMs; });
    }
    this.collect();
    if (this.state.playTicks >= RACE.matchTicks) {
      this.state.phase = 'finished';
      const sorted = [...this.state.players].sort((a, b) => b.score - a.score || a.slot - b.slot);
      this.state.rankings = sorted.map((player) => ({ playerId: player.id, name: player.name, score: player.score,
        rank: 1 + sorted.filter((candidate) => candidate.score > player.score).length }));
    }
  }

  /** Produces session-local seeded randomness; snapshots include its complete state. */
  private random(): number {
    this.state.randomState = (this.state.randomState + 0x6d2b79f5) >>> 0;
    let value = this.state.randomState;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  /** Awards each shared pickup once, then refills without resetting actors or timers. */
  private collect(): void {
    const remaining = [];
    for (const pickup of this.state.pickups) {
      const cell = this.map.cells[pickup.cell];
      const config = COLLECTIBLE_CONFIG[pickup.kind === 'core' ? 1 : 0];
      const collector = this.state.players.find((player) => {
        if (!player.connected || player.deathMs > 0) return false;
        const current = position(this.map, player.movement);
        return isBodyOverlap({ ...current, radius: SPRITE_SIZE.packet / 2 / TILE_SIZE },
          { x: cell.x, y: cell.y, radius: config.size / 2 / TILE_SIZE });
      });
      if (!collector) { remaining.push(pickup); continue; }
      collector.score += config.score;
      if (pickup.kind === 'core') { collector.huntMs = RACE.huntingMs; collector.chain = 0; }
    }
    if (remaining.length === 0) {
      this.state.refill += 1;
      this.state.pickups = this.map.pickups.map((point) => ({ ...point }));
    } else this.state.pickups = remaining;
  }

  /** Respawns only one player; shared pickups and accumulated score survive. */
  private respawn(player: RacePlayer): void {
    player.movement = createMovement(this.map.spawns[player.slot]);
    player.deathMs = 0; player.huntMs = 0; player.chain = 0;
    player.protectionMs = RACE.protectionMs;
    player.portalBlinkMs = 0;
  }
}
