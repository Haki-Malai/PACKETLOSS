import { battleArenaMapAtStage } from './BattleArenaMap';
import { position } from './movement';
import { correctedPoint, crossedPortal, RacePresentationClock,
  reconcileMovement, samplePlayerEffects, sampleRemoteActor, type ActorSample, type Point } from './prediction';
import { RACE, SYNCHRONIZATION, type Direction, type Movement, type RaceMap, type RaceSnapshot, type ScheduledInput } from './types';

export interface SynchronizationDiagnostics {
  correctionMagnitude: number;
  correctionReason: 'none' | 'acknowledgement' | 'topology' | 'movement-disabled' | 'reset';
  snapshotAgeMs: number;
  pendingInputs: number;
  interpolationUnderruns: number;
}
export interface MultiplayerRenderState {
  actors: ReadonlyMap<string, ActorSample>;
  presentationTick: number;
  predictedTick: number;
  stalled: boolean;
}

/** Owns network time, input history, replay, and complete render samples without React or a renderer. */
export class MultiplayerSynchronization {
  private readonly clock = new RacePresentationClock();
  private race: RaceSnapshot | null = null;
  private map: RaceMap | null = null;
  private activeMap: RaceMap | null = null;
  private playerId: string | null = null;
  private snapshots: RaceSnapshot[] = [];
  private publication = -1;
  private receivedAt = 0;
  private rtt: number | null = null;
  private sequence = 0;
  private pending: ScheduledInput[] = [];
  private movement: Movement | null = null;
  private simulatedTick = 0;
  private offset: Point = { x: 0, y: 0 };
  private lastSampleMs: number | null = null;
  private previousMovement: Movement | null = null;
  private readonly previousRemoteMovements = new Map<string, Movement>();
  private remoteTick = 0;
  private wasUnderrun = false;
  readonly diagnostics: SynchronizationDiagnostics = {
    correctionMagnitude: 0, correctionReason: 'none', snapshotAgeMs: 0, pendingInputs: 0, interpolationUnderruns: 0,
  };

  /** Exposes bounded authoritative history for diagnostics; presentation sampling stays here. */
  get history(): readonly RaceSnapshot[] { return this.snapshots; }
  /** Reports the filtered round-trip time in milliseconds. */
  get latencyMs(): number | null { return this.rtt; }

  /** Filters RTT outliers instead of moving the clock by each individual ping sample. */
  observeRoundTrip(ms: number): void {
    if (!Number.isFinite(ms) || ms < 0 || ms > SYNCHRONIZATION.timeoutMs) return;
    this.rtt = this.rtt === null ? ms : this.rtt + (ms - this.rtt) * 0.125;
  }

  /** Clears all connection-owned state; abandoned input never leaks into a new admission. */
  reset(): void {
    this.race = null; this.map = null; this.activeMap = null; this.playerId = null;
    this.snapshots = []; this.publication = -1; this.pending = []; this.sequence = 0;
    this.rtt = null; this.movement = null; this.previousMovement = null; this.remoteTick = 0;
    this.previousRemoteMovements.clear(); this.wasUnderrun = false;
    this.clock.reset(); this.offset = { x: 0, y: 0 }; this.lastSampleMs = null;
    Object.assign(this.diagnostics, { correctionMagnitude: 0, correctionReason: 'reset', snapshotAgeMs: 0,
      pendingInputs: 0, interpolationUnderruns: 0 });
  }

  /** Rebases presentation after visibility changes without discarding already transmitted commands. */
  resetPresentation(): void {
    this.clock.reset(); this.previousMovement = null; this.offset = { x: 0, y: 0 }; this.lastSampleMs = null;
    this.previousRemoteMovements.clear();
    this.restoreMovement();
  }

  /** Accepts a newer publication, restores the completed server tick, and reconciles once. */
  acceptSnapshot(map: RaceMap, race: RaceSnapshot, playerId: string | null, publication: number, nowMs: number): boolean {
    if (race.mapId !== map.id || publication <= this.publication) return false;
    const sameMatch = this.race?.matchId === race.matchId && this.map?.id === map.id && playerId === this.playerId;
    if (sameMatch && this.race && race.tick < this.race.tick) return false;
    const oldRace = this.race;
    const old = sameMatch ? this.localMovement(this.predictionTick(nowMs)) : null;
    if (!sameMatch) {
      this.pending = []; this.snapshots = []; this.sequence = 0; this.previousMovement = null;
      this.previousRemoteMovements.clear(); this.wasUnderrun = false;
      this.offset = { x: 0, y: 0 }; this.clock.reset(); this.remoteTick = 0;
    }
    this.map = map;
    if (!sameMatch || oldRace?.shrinkStage !== race.shrinkStage) {
      this.activeMap = battleArenaMapAtStage(map, race.shrinkStage);
    }
    this.race = race; this.playerId = playerId; this.publication = publication; this.receivedAt = nowMs;
    this.snapshots = [...this.snapshots.filter((snapshot) => snapshot.tick >= race.tick - SYNCHRONIZATION.historyTicks), race].slice(-64);
    const player = race.players.find((candidate) => candidate.id === playerId);
    this.sequence = Math.max(this.sequence, player?.acknowledgedInput ?? 0);
    this.pending = this.pending.filter((input) => input.sequence > (player?.acknowledgedInput ?? 0));
    if (!race.movementEnabled || !player?.connected || player.eliminatedAtTick !== null) this.pending = [];
    this.restoreMovement();
    const current = this.localMovement(this.predictionTick(nowMs));
    this.diagnostics.correctionMagnitude = 0;
    this.diagnostics.correctionReason = 'none';
    if (old && current) {
      const activeMap = this.activeMap!;
      const from = position(activeMap, old), to = position(activeMap, current);
      const error = { x: from.x - to.x, y: from.y - to.y };
      this.diagnostics.correctionMagnitude = Math.hypot(error.x, error.y);
      this.diagnostics.correctionReason = !race.movementEnabled ? 'movement-disabled'
        : oldRace?.shrinkStage !== race.shrinkStage ? 'topology' : 'acknowledgement';
      const safe = race.movementEnabled && oldRace?.shrinkStage === race.shrinkStage
        && Math.hypot(error.x, error.y) <= 1 && correctedPoint(activeMap, current, to, error);
      this.offset = safe ? { x: this.offset.x + error.x, y: this.offset.y + error.y } : { x: 0, y: 0 };
      if (Math.hypot(this.offset.x, this.offset.y) > 1) this.offset = { x: 0, y: 0 };
    }
    this.diagnostics.pendingInputs = this.pending.length;
    return true;
  }

  /** Records intent only after transport accepts it; the currently drawn fractional step stays immutable. */
  submitDirection(direction: Direction, nowMs: number,
    send: (_input: ScheduledInput & { matchId: string }) => boolean): number | null {
    const race = this.race;
    const player = race?.players.find((candidate) => candidate.id === this.playerId);
    if (!race?.movementEnabled || !player?.connected || player.eliminatedAtTick !== null
      || nowMs - this.receivedAt >= SYNCHRONIZATION.maxPredictionTicks * RACE.stepMs || this.pending.length >= 128) return null;
    const targetTick = Math.max(Math.floor(this.predictionTick(nowMs)) + 2,
      this.pending[this.pending.length - 1]?.targetTick ?? 0);
    if (targetTick > race.tick + SYNCHRONIZATION.maxPredictionTicks) return null;
    const input = { matchId: race.matchId, sequence: this.sequence + 1, targetTick, direction };
    if (!send(input)) return null;
    this.sequence = input.sequence;
    this.pending.push(input);
    this.diagnostics.pendingInputs = this.pending.length;
    return input.sequence;
  }

  /** Samples local fractional movement and remote buffered actors from the single clock. */
  sample(nowMs: number): MultiplayerRenderState | null {
    const race = this.race, map = this.activeMap;
    if (!race || !map) return null;
    const predictedTick = this.predictionTick(nowMs);
    const leadTicks = (this.rtt ?? 0) / RACE.stepMs + SYNCHRONIZATION.commandSlackTicks;
    const presentationTick = Math.max(0, predictedTick - leadTicks);
    this.remoteTick = Math.max(this.remoteTick, Math.min(race.tick, presentationTick - SYNCHRONIZATION.interpolationTicks));
    const target = race.phase === 'playing' ? this.remoteTick : race.tick;
    const underrun = target >= race.tick;
    if (underrun && !this.wasUnderrun) this.diagnostics.interpolationUnderruns += 1;
    this.wasUnderrun = underrun;
    const actors = new Map<string, ActorSample>();
    const local = this.localMovement(predictedTick);
    const decay = Math.exp(-Math.max(0, nowMs - (this.lastSampleMs ?? nowMs)) / 80);
    this.offset.x *= decay; this.offset.y *= decay;
    for (const player of race.players) {
      if (player.id === this.playerId && local) {
        const raw = position(map, local);
        const point = correctedPoint(map, local, raw, this.offset);
        const discontinuity = this.previousMovement === null || crossedPortal(map, this.previousMovement, local);
        if (!point || discontinuity) this.offset = { x: 0, y: 0 };
        const sampled = samplePlayerEffects(player, Math.max(0, presentationTick - race.tick));
        actors.set(player.id, { player: { ...sampled, movement: local }, point: discontinuity ? raw : point ?? raw, discontinuity,
          moving: race.movementEnabled && player.connected && local.to !== null
            && player.eliminatedAtTick === null && player.deathMs <= 0
            && nowMs - this.receivedAt < SYNCHRONIZATION.maxPredictionTicks * RACE.stepMs });
        this.previousMovement = { ...local };
      } else {
        const sampled = sampleRemoteActor(this.snapshots, target, player.id, map);
        if (sampled) {
          const previous = this.previousRemoteMovements.get(player.id);
          sampled.discontinuity = previous !== undefined && crossedPortal(map, previous, sampled.player.movement);
          this.previousRemoteMovements.set(player.id, sampled.player.movement);
          actors.set(player.id, sampled);
        }
      }
    }
    this.lastSampleMs = nowMs;
    this.diagnostics.snapshotAgeMs = Math.max(0, nowMs - this.receivedAt);
    return { actors, presentationTick, predictedTick, stalled: race.phase === 'playing'
      && this.diagnostics.snapshotAgeMs >= SYNCHRONIZATION.maxPredictionTicks * RACE.stepMs };
  }

  /** Derives prediction lead without changing timestamps of already committed commands. */
  private predictionTick(nowMs: number): number {
    if (!this.race) return 0;
    return this.clock.sample(this.race, this.receivedAt, nowMs,
      (this.rtt ?? 0) + SYNCHRONIZATION.commandSlackTicks * RACE.stepMs);
  }

  /** Restores the local fixed-step base; only acceptance/reset replays from authority. */
  private restoreMovement(): void {
    const player = this.race?.players.find((candidate) => candidate.id === this.playerId);
    this.movement = player ? { ...player.movement } : null;
    this.simulatedTick = this.race?.tick ?? 0;
  }

  /** Advances completed ticks incrementally and samples one disposable fractional step. */
  private localMovement(target: number): Movement | null {
    const race = this.race, map = this.activeMap;
    let movement = this.movement;
    const player = race?.players.find((candidate) => candidate.id === this.playerId);
    if (!race || !map || !movement || !player) return null;
    if (!race.movementEnabled || !player.connected || player.eliminatedAtTick !== null || player.deathMs > 0) return { ...player.movement };
    const capped = Math.max(this.simulatedTick, Math.min(target, race.tick + SYNCHRONIZATION.maxPredictionTicks));
    if (this.simulatedTick < Math.floor(capped)) {
      movement = reconcileMovement(map, { ...player, movement }, this.simulatedTick, Math.floor(capped), this.pending);
      this.movement = movement;
      this.simulatedTick = Math.floor(capped);
    }
    return reconcileMovement(map, { ...player, movement }, this.simulatedTick, capped, this.pending);
  }
}
