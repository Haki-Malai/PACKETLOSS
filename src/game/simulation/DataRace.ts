import { battleArenaBounds, battleArenaMapAtStage, createBattleArenaWorldMap, isBattleArenaCellActive } from './BattleArenaMap';
import { createMovement, movementEdge, position } from './movement';
import { advanceBoost, applyScheduledInput, cancelBoost } from './boost';
import { cloneSnapshot } from './cloneSnapshot';
import { DIRECTIONS, RACE, SYNCHRONIZATION, type BoostAction, type PlayerIdentity, type RaceMap, type RacePlayer, type RaceSnapshot, type ScheduledInput, type ScheduledPowerup } from './types';
import { COLLECTIBLE_CONFIG, PACKET_PORTAL_BLINK, SPRITE_SIZE, TILE_SIZE } from '../../config/constants';
import { isBodyOverlap } from '../domain/valueObjects/CollisionBody';
import { getPowerupMovementLockMs, isPowerupKind as isOffensivePowerup, POWERUP_PICKUP_RADIUS, type OffensivePowerupKind } from '../shared/offensivePowerups';
import { activatePowerup, addPowerupCollection, cancelPowerupCast, createPowerupCombatState, stepPowerupCombat } from './PowerupCombat';
import { createPowerupCollisionWorld } from '../domain/services/PowerupCollision';

/** Owns all mutable state for one deterministic authoritative Battle Royale match. */
export class DataRace {
  private state: RaceSnapshot;
  private activeMap: RaceMap;
  private readonly soloDevelopment: boolean;
  private walls: ReturnType<typeof createPowerupCollisionWorld>;
  private readonly powerupInputs = new Map<string, { sequence: number; targetTick: number; commands: Map<number, ScheduledPowerup> }>();
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
    this.walls = createPowerupCollisionWorld(createBattleArenaWorldMap(map, 0));
    this.state = { matchId, mapId: map.id, tick: 0, playTicks: 0, phase: 'playing', movementEnabled: true,
      players: [], enemies: [], pickups: map.pickups.map((point) => ({ ...point })), refill: 0,
      randomState: seed >>> 0, shrinkStage: 0, rankings: [], abortReason: null, combat: createPowerupCombatState() };
    const participants = [...identities].sort((a, b) => a.id.localeCompare(b.id));
    for (let index = participants.length - 1; index > 0; index -= 1) {
      const other = Math.floor(this.random() * (index + 1));
      [participants[index], participants[other]] = [participants[other], participants[index]];
    }
    this.state.players = participants.map((identity, index) => {
      const slot = (index + slotRotation) % participants.length;
      return { ...identity, slot, color: identity.color ?? RACE.colors[slot],
      score: 0, connected: true, movement: createMovement(map.spawns[slot]), huntMs: 0,
      boosting: false, boostHeld: false, boostTicks: 0, boostCostTicks: 0,
      protectionMs: RACE.protectionMs, portalBlinkMs: 0, deathMs: 0, eliminatedAtTick: null,
      chain: 0, acknowledgedInput: 0, acknowledgedPowerup: 0, heldPowerup: null, deathPosition: null };
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
    this.powerupInputs.clear();
    this.activeMap = battleArenaMapAtStage(this.map, this.state.shrinkStage);
    this.walls = createPowerupCollisionWorld(createBattleArenaWorldMap(this.map, this.state.shrinkStage));
  }

  /** Queues bounded tick-stamped intent; late input waits for the next authoritative step. */
  input(playerId: string, sequence: number, direction: typeof DIRECTIONS[number] | undefined,
    targetTick = this.state.tick + 1, boost?: BoostAction): boolean {
    const player = this.state.players.find((candidate) => candidate.id === playerId);
    const queued = this.inputs.get(playerId);
    if (!player?.connected || player.eliminatedAtTick !== null
      || this.outcomeLocked()
      || sequence <= (queued?.sequence ?? player.acknowledgedInput) || !Number.isSafeInteger(sequence)
      || !Number.isSafeInteger(targetTick) || targetTick < 0
      || targetTick > this.state.tick + SYNCHRONIZATION.maxPredictionTicks
      || targetTick < (queued?.targetTick ?? 0)
      || direction !== undefined && !DIRECTIONS.includes(direction)
      || boost !== undefined && !['press', 'release', 'cancel'].includes(boost)
      || direction === undefined && boost === undefined
      || !['countdown', 'playing'].includes(this.state.phase)) return false;
    const commands = queued?.commands ?? new Map<number, ScheduledInput>();
    if (commands.size >= 128) {
      if (boost !== 'cancel') return false;
      commands.clear();
    }
    const effectiveTick = Math.max(this.state.tick + 1, targetTick);
    commands.set(sequence, { sequence, targetTick: effectiveTick, direction, boost });
    this.inputs.set(playerId, { sequence, targetTick, commands });
    return true;
  }

  /** Consumes ordered boost edges and the final direction before this completed tick's movement. */
  private consumeInput(player: RacePlayer): void {
    const queue = this.inputs.get(player.id);
    if (!queue) return;
    applyScheduledInput(player, [...queue.commands.values()], this.state.tick);
    for (const [sequence, command] of queue.commands) {
      if (command.targetTick <= this.state.tick) queue.commands.delete(sequence);
    }
  }

  /** Queues activation separately from movement so same-tick direction coalescing cannot discard E. */
  activate(playerId: string, sequence: number, targetTick = this.state.tick + 1): boolean {
    const player = this.state.players.find((candidate) => candidate.id === playerId);
    const queued = this.powerupInputs.get(playerId);
    if (!player?.connected || player.eliminatedAtTick !== null || !this.movementEnabled
      || !Number.isSafeInteger(sequence) || sequence <= (queued?.sequence ?? player.acknowledgedPowerup)
      || !Number.isSafeInteger(targetTick) || targetTick < 0
      || targetTick > this.state.tick + SYNCHRONIZATION.maxPredictionTicks
      || targetTick < (queued?.targetTick ?? 0) || (queued?.commands.size ?? 0) >= 128) return false;
    const commands = queued?.commands ?? new Map<number, ScheduledPowerup>();
    commands.set(sequence, { sequence, targetTick: Math.max(this.state.tick + 1, targetTick) });
    this.powerupInputs.set(playerId, { sequence, targetTick, commands });
    return true;
  }

  /** Replaces only an active player's inventory; the transport owns the local-development capability gate. */
  equipPowerup(playerId: string, kind: OffensivePowerupKind): boolean {
    const player = this.state.players.find((candidate) => candidate.id === playerId);
    if (!player?.connected || player.eliminatedAtTick !== null || !this.movementEnabled
      || !isOffensivePowerup(kind)) return false;
    player.heldPowerup = kind;
    return true;
  }

  /** Acknowledges each due E edge once, consuming inventory only when a new cast can start. */
  private consumePowerup(player: RacePlayer): void {
    const queue = this.powerupInputs.get(player.id);
    if (!queue) return;
    for (const command of [...queue.commands.values()].sort((left, right) => left.sequence - right.sequence)) {
      if (command.targetTick > this.state.tick) continue;
      if (player.heldPowerup && activatePowerup(this.state.combat, player.id, player.heldPowerup, player.movement.direction)) {
        player.heldPowerup = null;
      }
      player.acknowledgedPowerup = command.sequence;
      queue.commands.delete(command.sequence);
    }
  }

  /** Removes a disconnected participant from play while retaining their authoritative score. */
  disconnect(playerId: string): void {
    this.inputs.delete(playerId);
    this.powerupInputs.delete(playerId);
    cancelPowerupCast(this.state.combat, playerId);
    const player = this.state.players.find((candidate) => candidate.id === playerId);
    if (player) { player.connected = false; cancelBoost(player); }
  }

  /** Restores a reserved participant at their exact authoritative position or spectator state. */
  reconnect(playerId: string): void {
    const player = this.state.players.find((candidate) => candidate.id === playerId);
    if (!player) throw new Error('Unknown reserved participant.');
    player.connected = true;
    cancelBoost(player);
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
    this.powerupInputs.clear();
    this.state.players.forEach(cancelBoost);
    this.state.abortReason = reason;
    this.state.rankings = [];
  }

  /** Advances one authoritative 60 Hz step, holding laser casters through their animation and supplying current missile release headings. */
  step(): void {
    if (this.state.phase === 'finished' || this.state.phase === 'aborted') return;
    this.state.tick += 1;
    if (this.state.phase === 'countdown') {
      if (this.state.tick >= RACE.countdownTicks) this.state.phase = 'playing';
      return;
    }
    this.state.playTicks += 1;
    const outcomeLocked = this.outcomeLocked();
    if (outcomeLocked) { this.inputs.clear(); this.powerupInputs.clear(); }
    const previous = new Map(this.state.players.map((player) => [player.id, this.worldPosition(player)]));
    const teleported = new Map<string, { departure: { x: number; y: number }; arrival: { x: number; y: number }; fraction: number }>();
    for (const player of this.state.players) {
      if (player.eliminatedAtTick !== null) {
        player.deathMs = Math.max(0, player.deathMs - RACE.stepMs);
        continue;
      }
      player.huntMs = Math.max(0, player.huntMs - RACE.stepMs);
      player.protectionMs = Math.max(0, player.protectionMs - RACE.stepMs);
      player.portalBlinkMs = Math.max(0, (player.portalBlinkMs ?? 0) - RACE.stepMs);
      if (player.huntMs < 1e-6) { player.huntMs = 0; player.chain = 0; }
      if (!player.connected || outcomeLocked) { cancelBoost(player); continue; }
      this.consumeInput(player);
      this.consumePowerup(player);
      advanceBoost(this.activeMap, player, 1, getPowerupMovementLockMs(this.state.combat, player.id) > 0,
        (motion) => {
          player.portalBlinkMs = PACKET_PORTAL_BLINK.durationMs;
          teleported.set(player.id, { fraction: motion.fraction,
            departure: { x: (motion.departure.x + 0.5) * TILE_SIZE, y: (motion.departure.y + 0.5) * TILE_SIZE },
            arrival: { x: (motion.arrival.x + 0.5) * TILE_SIZE, y: (motion.arrival.y + 0.5) * TILE_SIZE } });
        });
    }
    if (outcomeLocked) {
      if (this.state.playTicks >= RACE.matchTicks || this.terminalPresentationComplete()) this.finish();
      return;
    }
    this.shrinkIfDue();
    const actors = this.state.players.map((player) => ({ id: player.id, ...this.worldPosition(player),
      direction: player.movement.direction,
      radius: SPRITE_SIZE.packet / 2, active: player.eliminatedAtTick === null,
      protected: player.protectionMs > 0 || (player.portalBlinkMs ?? 0) > 0,
      previous: previous.get(player.id), teleported: teleported.has(player.id), teleportMotion: teleported.get(player.id) }));
    const hits = stepPowerupCombat(this.state.combat, RACE.stepMs, actors, this.walls, RACE.playerSpeed * TILE_SIZE);
    for (const hit of hits) {
      const player = this.state.players.find((candidate) => candidate.id === hit.targetId);
      if (player) this.eliminatePlayer(player, this.activeMap, {
        x: hit.position.x / TILE_SIZE - 0.5, y: hit.position.y / TILE_SIZE - 0.5 });
    }
    this.collect();
    if (this.state.playTicks >= RACE.matchTicks) this.finish();
  }

  /** Converts authoritative tile-center positions to shared world pixels without moving dead actors. */
  private worldPosition(player: RacePlayer): { x: number; y: number } {
    const point = player.deathPosition ?? position(this.activeMap, player.movement);
    return { x: (point.x + 0.5) * TILE_SIZE, y: (point.y + 0.5) * TILE_SIZE };
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
      const weapon = isOffensivePowerup(pickup.kind);
      const config = COLLECTIBLE_CONFIG[pickup.kind === 'core' ? 1 : 0];
      const collector = this.state.players.find((player) => {
        if (!player.connected || player.eliminatedAtTick !== null) return false;
        const current = position(this.activeMap, player.movement);
        return isBodyOverlap({ ...current, radius: SPRITE_SIZE.packet / 2 / TILE_SIZE },
          { x: cell.x, y: cell.y, radius: (weapon ? POWERUP_PICKUP_RADIUS : config.size / 2) / TILE_SIZE });
      });
      if (!collector) { remaining.push(pickup); continue; }
      if (isOffensivePowerup(pickup.kind)) {
        collector.heldPowerup = pickup.kind;
        addPowerupCollection(this.state.combat, collector.id, pickup.kind,
          { x: (cell.x + 0.5) * TILE_SIZE, y: (cell.y + 0.5) * TILE_SIZE }, this.worldPosition(collector));
        continue;
      }
      collector.score += config.score;
      if (pickup.kind === 'core') { collector.huntMs = RACE.huntingMs; collector.chain = 0; }
    }
    if (!remaining.some((pickup) => pickup.kind === 'bit' || pickup.kind === 'core')) {
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
    this.walls = createPowerupCollisionWorld(createBattleArenaWorldMap(this.map, nextStage));
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
    this.powerupInputs.delete(player.id);
    cancelPowerupCast(this.state.combat, player.id);
    player.heldPowerup = null;
    player.deathPosition = { ...sampled };
    cancelBoost(player);
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
    this.powerupInputs.clear();
    this.state.players.forEach(cancelBoost);
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
