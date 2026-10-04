import { EventBus } from '../game/shared/events/EventBus';
import { INITIAL_LIVES } from '../config/constants';
import type { ScoreBonusKind } from '../game/domain/valueObjects/ScoreBonus';

export type GameState = {
  score: number;
  lives: number;
};

export type ScoreBonusStatus =
  | { phase: 'available'; count: number }
  | { phase: 'active'; kind: ScoreBonusKind; multiplier: number; seconds: number }
  | null;

export const GameEvent = {
  ScoreChanged: 'score-changed',
  LivesChanged: 'lives-changed',
  BonusChanged: 'bonus-changed',
} as const;

export type GameEventMap = {
  [GameEvent.ScoreChanged]: number;
  [GameEvent.LivesChanged]: number;
  [GameEvent.BonusChanged]: ScoreBonusStatus;
};

/** Owns score, lives, bonus status, and subscriptions for exactly one game session. */
export class GameStateStore {
  private readonly state: GameState;
  private scoreBonusStatus: ScoreBonusStatus = null;
  private readonly eventBus = new EventBus<GameEventMap>();

  constructor(initialScore = 0, initialLives = INITIAL_LIVES) {
    this.state = { score: initialScore, lives: initialLives };
  }

  on<K extends keyof GameEventMap>(event: K, listener: (_payload: GameEventMap[K]) => void): void {
    this.eventBus.on(event, listener);
  }

  off<K extends keyof GameEventMap>(event: K, listener: (_payload: GameEventMap[K]) => void): void {
    this.eventBus.off(event, listener);
  }

  reset(initialScore = 0, initialLives = INITIAL_LIVES): void {
    this.state.score = initialScore;
    this.state.lives = initialLives;
    this.eventBus.emit(GameEvent.ScoreChanged, this.state.score);
    this.eventBus.emit(GameEvent.LivesChanged, this.state.lives);
    this.setScoreBonusStatus(null);
  }

  /** Publishes only visible changes to the multiplier HUD snapshot. */
  setScoreBonusStatus(next: ScoreBonusStatus): void {
    if (!this.scoreBonusStatus && !next) return;
    if (this.scoreBonusStatus?.phase === 'available' && next?.phase === 'available'
      && this.scoreBonusStatus.count === next.count) return;
    if (this.scoreBonusStatus?.phase === 'active' && next?.phase === 'active'
      && this.scoreBonusStatus.kind === next.kind
      && this.scoreBonusStatus.multiplier === next.multiplier
      && this.scoreBonusStatus.seconds === next.seconds) return;
    this.scoreBonusStatus = next;
    this.eventBus.emit(GameEvent.BonusChanged, next);
  }

  getScoreBonusStatus(): ScoreBonusStatus {
    return this.scoreBonusStatus;
  }

  addScore(amount: number): void {
    this.state.score += amount;
    this.eventBus.emit(GameEvent.ScoreChanged, this.state.score);
  }

  setLives(lives: number): void {
    this.state.lives = lives;
    this.eventBus.emit(GameEvent.LivesChanged, this.state.lives);
  }

  loseLife(amount = 1): number {
    const safeAmount = Math.max(0, Math.floor(amount));
    if (safeAmount === 0) return this.state.lives;
    this.state.lives = Math.max(0, this.state.lives - safeAmount);
    this.eventBus.emit(GameEvent.LivesChanged, this.state.lives);
    return this.state.lives;
  }

  getSnapshot(): GameState {
    return { ...this.state };
  }
}

// Compatibility owner for small domain tests and callers that have not constructed a runtime.
const defaultGameState = new GameStateStore();

export function getDefaultGameStateStore(): GameStateStore {
  return defaultGameState;
}

export const gameEvents = {
  on: <K extends keyof GameEventMap>(event: K, listener: (_payload: GameEventMap[K]) => void) =>
    defaultGameState.on(event, listener),
  off: <K extends keyof GameEventMap>(event: K, listener: (_payload: GameEventMap[K]) => void) =>
    defaultGameState.off(event, listener),
};

export function resetGameState(initialScore = 0, initialLives = INITIAL_LIVES): void {
  defaultGameState.reset(initialScore, initialLives);
}

/** Publishes only visible changes to the multiplier HUD snapshot. */
export function setScoreBonusStatus(next: ScoreBonusStatus): void {
  defaultGameState.setScoreBonusStatus(next);
}

/** Returns the stable current multiplier HUD snapshot. */
export function getScoreBonusStatus(): ScoreBonusStatus {
  return defaultGameState.getScoreBonusStatus();
}

export function addScore(amount: number): void {
  defaultGameState.addScore(amount);
}

export function setLives(lives: number): void {
  defaultGameState.setLives(lives);
}

export function loseLife(amount = 1): number {
  return defaultGameState.loseLife(amount);
}

export function getGameState(): GameState {
  return defaultGameState.getSnapshot();
}
