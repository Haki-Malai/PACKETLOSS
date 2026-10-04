import { battleArenaBounds, battleArenaMapAtStage, isBattleArenaCellActive } from './BattleArenaMap';
import { applyScheduledDirection, createMovement, move, movementEdge, position } from './movement';
import { cloneSnapshot } from './cloneSnapshot';
import { DIRECTIONS, RACE, SYNCHRONIZATION, type PlayerIdentity, type RaceMap, type RacePlayer, type RaceSnapshot, type ScheduledInput } from './types';
import { COLLECTIBLE_CONFIG, PACKET_PORTAL_BLINK, SPRITE_SIZE, TILE_SIZE } from '../../config/constants';
import { isBodyOverlap } from '../domain/valueObjects/CollisionBody';

/** Owns all mutable state for one deterministic authoritative Battle Royale match. */
export class DataRace {
  private state: RaceSnapshot;
  private activeMap: RaceMap;
  private readonly soloDevelopment: boolean;
  private readonly inputs = new Map<string, { sequence: number; targetTick: number; commands: Map<number, ScheduledInput> }>();

  /** Starts play immediately with seeded spawn/pickup ordering and authoritative participant colors. */
  constructor(readonly map: RaceMap, matchId: string, identities: readonly PlayerIdentity[], seed: number,
    slotRotation = 0, soloDevelopment = false) {
    const minimumPlayers = soloDevelopment ? 1 : 2;
    if (identities.length < minimumPlayers || identities.length > 4
      || new Set(identities.map((player) => player.id)).size !== identities.length) {
      throw new Error(`A match requires ${minimumPlayers}–4 distinct players.`);
    }
    this.soloDevelopment = soloDevelopment && identities.length === 1;
    if (map.spawns.length !== 4 || map.pickups.length === 0) throw new Error('Map requires four spawns and pickups.');
    this.activeMap = battleArenaMapAtStage(map, 0);
    this.state = { matchId, mapId: map.id, tick: 0, playTicks: 0, phase: 'playing', movementEnabled: true,
      players: [], enemies: [], pickups: map.pickups.map((point) => ({ ...point })), refill: 0,
      randomState: seed >>> 0, shrinkStage: 0, rankings: [], abortReason: null };
    const participants = [...identities].sort((a, b) => a.id.localeCompare(b.id));
    for (let index = participants.length - 1; index > 0; index -= 1) {
      const other = Math.floor(this.random() * (index + 1));
      [participants[index], participants[other]] = [participants[other], participants[index]];
    }
    this.state.players = participants.map((identity, index) => {
      const slot = (index + slotRotation) % participants.length;
      return { ...identity, slot, color: identity.color ?? RACE.colors[slot],
      score: 0, connected: true, movement: createMovement(map.spawns[slot]), huntMs: 0,
      protectionMs: RACE.protectionMs, portalBlinkMs: 0, deathMs: 0, eliminatedAtTick: null,
      chain: 0, acknowledgedInput: 0 };
    }).sort((a, b) => a.slot - b.slot);
  }

  /** Returns a detached wire snapshot so consumers cannot mutate authoritative state. */
  snapshot(): RaceSnapshot { return cloneSnapshot({ ...this.state, movementEnabled: this.movementEnabled }); }

  /** Includes the terminal presentation freeze and the explicit solo-development exception. */
  private get movementEnabled(): boolean { return this.state.phase === 'playing' && !this.outcomeLocked(); }

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
    this.inputs.clear();
    this.activeMap = battleArenaMapAtStage(this.map, this.state.shrinkStage);
  }

  /** Queues bounded tick-stamped intent; late input waits for the next authoritative step. */
  input(playerId: string, sequence: number, direction: typeof DIRECTIONS[number], targetTick = this.state.tick + 1): boolean {
    const player = this.state.players.find((candidate) => candidate.id === playerId);
    const queued = this.inputs.get(playerId);
    if (!player?.connected || player.eliminatedAtTick !== null
      || this.outcomeLocked()
      || sequence <= (queued?.sequence ?? player.acknowledgedInput) || !Number.isSafeInteger(sequence)
      || !Number.isSafeInteger(targetTick) || targetTick < 0
      || targetTick > this.state.tick + SYNCHRONIZATION.maxPredictionTicks
      || targetTick < (queued?.targetTick ?? 0)
      || !DIRECTIONS.includes(direction) || !['countdown', 'playing'].includes(this.state.phase)) return false;
    const commands = queued?.commands ?? new Map<number, ScheduledInput>();
    const effectiveTick = Math.max(this.state.tick + 1, targetTick);
    commands.set(effectiveTick, { sequence, targetTick: effectiveTick, direction });
    this.inputs.set(playerId, { sequence, targetTick, commands });
    return true;
  }

  /** Consumes the newest applicable intent once, before this completed tick's movement. */
  private consumeInput(player: RacePlayer): void {
    const queue = this.inputs.get(player.id);
    if (!queue) return;
    player.acknowledgedInput = applyScheduledDirection(player.movement, [...queue.commands.values()],
      this.state.tick, player.acknowledgedInput);
    for (const tick of queue.commands.keys()) {
      if (tick <= this.state.tick) queue.commands.delete(tick);
    }
  }

  /** Removes a disconnected participant from play while retaining their authoritative score. */
  disconnect(playerId: string): void {
    this.inputs.delete(playerId);
    const player = this.state.players.find((candidate) => candidate.id === playerId);
    if (player) player.connected = false;
  }

  /** Restores a reserved participant at their exact authoritative position or spectator state. */
  reconnect(playerId: string): void {
    const player = this.state.players.find((candidate) => candidate.id === playerId);
    if (!player) throw new Error('Unknown reserved participant.');
    player.connected = true;
  }

  /** Eliminates one active participant without evaluating the winner until the next fixed step. */
  eliminate(playerId: string): void {
    if (!['countdown', 'playing'].includes(this.state.phase)) return;
    const player = this.state.players.find((candidate) => candidate.id === playerId);
    if (player) {
      this.inputs.delete(playerId);
      player.connected = false;
      this.eliminatePlayer(player);
    }
  }

  /** Stops an unhealthy server's match without recording competitive rankings. */
  abort(reason: string): void {
    if (this.state.phase === 'finished' || this.state.phase === 'aborted') return;
    this.state.phase = 'aborted';
    this.inputs.clear();
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
    const outcomeLocked = this.outcomeLocked();
    if (outcomeLocked) this.inputs.clear();
    for (const player of this.state.players) {
      if (player.eliminatedAtTick !== null) {
        player.deathMs = Math.max(0, player.deathMs - RACE.stepMs);
        continue;
      }
      player.huntMs = Math.max(0, player.huntMs - RACE.stepMs);
      player.protectionMs = Math.max(0, player.protectionMs - RACE.stepMs);
      player.portalBlinkMs = Math.max(0, (player.portalBlinkMs ?? 0) - RACE.stepMs);
      if (player.huntMs < 1e-6) { player.huntMs = 0; player.chain = 0; }
      if (!player.connected || outcomeLocked) continue;
      this.consumeInput(player);
      move(this.activeMap, player.movement, RACE.playerSpeed * RACE.stepMs / 1000, true, undefined,
        () => { player.portalBlinkMs = PACKET_PORTAL_BLINK.durationMs; });
    }
    if (outcomeLocked) {
      if (this.state.playTicks >= RACE.matchTicks || this.terminalPresentationComplete()) this.finish();
      return;
    }
    this.shrinkIfDue();
    this.collect();
    if (this.state.playTicks >= RACE.matchTicks) this.finish();
  }

  /** Skips only the remaining closure time for development controls, preserving actor movement and effect timers. */
  advanceToNextClosure(): boolean {
    if (!this.map.arena || this.state.phase !== 'playing' || this.outcomeLocked()
      || this.state.shrinkStage >= RACE.maxShrinkStage) return false;
    this.state.playTicks = (this.state.shrinkStage + 1) * RACE.shrinkEveryTicks;
    this.shrinkIfDue();
    return true;
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
      if (!isBattleArenaCellActive(this.map, pickup.cell, this.state.shrinkStage)) continue;
      const cell = this.activeMap.cells[pickup.cell];
      const config = COLLECTIBLE_CONFIG[pickup.kind === 'core' ? 1 : 0];
      const collector = this.state.players.find((player) => {
        if (!player.connected || player.eliminatedAtTick !== null) return false;
        const current = position(this.activeMap, player.movement);
        return isBodyOverlap({ ...current, radius: SPRITE_SIZE.packet / 2 / TILE_SIZE },
          { x: cell.x, y: cell.y, radius: config.size / 2 / TILE_SIZE });
      });
      if (!collector) { remaining.push(pickup); continue; }
      collector.score += config.score;
      if (pickup.kind === 'core') { collector.huntMs = RACE.huntingMs; collector.chain = 0; }
    }
    if (remaining.length === 0) {
      const refill = this.map.pickups.filter((pickup) =>
        isBattleArenaCellActive(this.map, pickup.cell, this.state.shrinkStage));
      if (refill.length > 0) this.state.refill += 1;
      this.state.pickups = refill.map((point) => ({ ...point }));
    } else this.state.pickups = remaining;
  }

  /** Applies one due contraction after movement, using pre-contraction positions for all survivors. */
  private shrinkIfDue(): void {
    if (!this.map.arena || this.state.shrinkStage >= RACE.maxShrinkStage
      || this.state.playTicks % RACE.shrinkEveryTicks !== 0) return;
    const previousMap = this.activeMap;
    const nextStage = this.state.shrinkStage + 1;
    const nextMap = battleArenaMapAtStage(this.map, nextStage);
    const bounds = battleArenaBounds(nextStage);
    const samples = new Map<RacePlayer, { x: number; y: number }>();
    for (const player of this.state.players) {
      if (player.eliminatedAtTick === null) samples.set(player, position(previousMap, player.movement));
    }
    this.state.shrinkStage = nextStage;
    this.activeMap = nextMap;
    for (const [player, point] of samples) {
      if (point.x <= bounds.minX - 0.5 || point.x >= bounds.maxX + 0.5
        || point.y <= bounds.minY - 0.5 || point.y >= bounds.maxY + 0.5) {
        this.eliminatePlayer(player, previousMap, point);
        continue;
      }
      if (player.movement.to === null || movementEdge(nextMap, player.movement)) continue;
      const endpoints = [player.movement.cell, player.movement.to].filter((cell) =>
        isBattleArenaCellActive(this.map, cell, nextStage));
      const retained = endpoints.map((cell) => {
        const endpoint = this.map.cells[cell];
        return { cell, distance: Math.hypot(point.x - endpoint.x, point.y - endpoint.y) };
      }).sort((a, b) => a.distance - b.distance)[0];
      if (!retained || retained.distance >= 0.5) {
        this.eliminatePlayer(player, previousMap, point);
        continue;
      }
      player.movement = { cell: retained.cell, to: null, progress: 0,
        direction: player.movement.direction, queued: player.movement.queued };
    }
    this.state.pickups = this.state.pickups.filter((pickup) =>
      isBattleArenaCellActive(this.map, pickup.cell, nextStage));
  }

  /** Starts the terminal death effect once while preserving the caught authoritative position. */
  private eliminatePlayer(
    player: RacePlayer,
    map = this.activeMap,
    sampled = position(map, player.movement),
  ): void {
    if (player.eliminatedAtTick !== null) return;
    this.inputs.delete(player.id);
    if (player.movement.to !== null) {
      const nearest = [player.movement.cell, player.movement.to].map((cell) => {
        const endpoint = map.cells[cell];
        return { cell, distance: Math.hypot(sampled.x - endpoint.x, sampled.y - endpoint.y) };
      }).sort((left, right) => left.distance - right.distance)[0];
      player.movement = { cell: nearest.cell, to: null, progress: 0,
        direction: player.movement.direction, queued: player.movement.queued };
    }
    player.eliminatedAtTick = this.state.playTicks;
    player.deathMs = RACE.deathMs;
    player.huntMs = 0;
    player.protectionMs = 0;
    player.portalBlinkMs = 0;
    player.chain = 0;
  }

  /** Holds the terminal scene long enough to show death, closure, and survivor follow effects. */
  private terminalPresentationComplete(): boolean {
    const latestElimination = Math.max(...this.state.players.flatMap((player) =>
      player.eliminatedAtTick === null ? [] : [player.eliminatedAtTick]));
    const presentationTicks = Math.ceil(RACE.deathMs / RACE.stepMs) + RACE.shrinkTransitionTicks;
    return Number.isFinite(latestElimination)
      && this.state.playTicks - latestElimination >= presentationTicks;
  }

  /** Keeps an explicit solo development match active until its only participant is eliminated. */
  private outcomeLocked(): boolean {
    const survivors = this.state.players.filter((player) => player.eliminatedAtTick === null).length;
    return survivors <= (this.soloDevelopment ? 0 : 1);
  }

  /** Freezes play and assigns competition ranks across survivors and elimination cohorts. */
  private finish(): void {
    this.inputs.clear();
    this.state.phase = 'finished';
    const survivors = this.state.players.filter((player) => player.eliminatedAtTick === null)
      .sort((a, b) => b.score - a.score || a.slot - b.slot);
    const eliminated = this.state.players.filter((player) => player.eliminatedAtTick !== null)
      .sort((a, b) => b.eliminatedAtTick! - a.eliminatedAtTick! || a.slot - b.slot);
    this.state.rankings = [...survivors.map((player) => ({ playerId: player.id, name: player.name, score: player.score,
      rank: 1 + survivors.filter((candidate) => candidate.score > player.score).length })),
    ...eliminated.map((player) => ({ playerId: player.id, name: player.name, score: player.score,
      rank: 1 + survivors.length
        + eliminated.filter((candidate) => candidate.eliminatedAtTick! > player.eliminatedAtTick!).length }))];
  }
}
