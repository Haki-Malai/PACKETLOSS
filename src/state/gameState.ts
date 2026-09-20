import { EventBus } from '../game/shared/events/EventBus';
import { INITIAL_LIVES } from '../config/constants';
import type { ScoreBonusKind } from '../game/domain/valueObjects/ScoreBonus';

export type GameState = {
  score: number;
  lives: number;
};

export type ScoreBonusStatus = {
  kind: ScoreBonusKind;
  multiplier: number;
  seconds: number;
  phase: 'available' | 'active';
} | null;

export const GameEvent = {
  ScoreChanged: 'score-changed',
  LivesChanged: 'lives-changed',
  BonusChanged: 'bonus-changed',
} as const;

type GameEventMap = {
  [GameEvent.ScoreChanged]: number;
  [GameEvent.LivesChanged]: number;
  [GameEvent.BonusChanged]: ScoreBonusStatus;
};

const state: GameState = {
  score: 0,
  lives: INITIAL_LIVES,
};
let scoreBonusStatus: ScoreBonusStatus = null;

const eventBus = new EventBus<GameEventMap>();

export const gameEvents = {
  on<K extends keyof GameEventMap>(event: K, listener: (_payload: GameEventMap[K]) => void): void {
    eventBus.on(event, listener);
  },
  off<K extends keyof GameEventMap>(event: K, listener: (_payload: GameEventMap[K]) => void): void {
    eventBus.off(event, listener);
  },
  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    eventBus.emit(event, payload);
  },
};

export function resetGameState(initialScore = 0, initialLives = INITIAL_LIVES): void {
  state.score = initialScore;
  state.lives = initialLives;
  gameEvents.emit(GameEvent.ScoreChanged, state.score);
  gameEvents.emit(GameEvent.LivesChanged, state.lives);
  setScoreBonusStatus(null);
}

/** Publishes only visible changes to the multiplier HUD snapshot. */
export function setScoreBonusStatus(next: ScoreBonusStatus): void {
  if (scoreBonusStatus?.kind === next?.kind && scoreBonusStatus?.multiplier === next?.multiplier
    && scoreBonusStatus?.seconds === next?.seconds && scoreBonusStatus?.phase === next?.phase) return;
  scoreBonusStatus = next;
  gameEvents.emit(GameEvent.BonusChanged, next);
}

/** Returns the stable current multiplier HUD snapshot. */
export function getScoreBonusStatus(): ScoreBonusStatus {
  return scoreBonusStatus;
}

export function addScore(amount: number): void {
  state.score += amount;
  gameEvents.emit(GameEvent.ScoreChanged, state.score);
}

export function setLives(lives: number): void {
  state.lives = lives;
  gameEvents.emit(GameEvent.LivesChanged, state.lives);
}

export function loseLife(amount = 1): number {
  const safeAmount = Math.max(0, Math.floor(amount));
  if (safeAmount === 0) {
    return state.lives;
  }

  state.lives = Math.max(0, state.lives - safeAmount);
  gameEvents.emit(GameEvent.LivesChanged, state.lives);
  return state.lives;
}

export function getGameState(): GameState {
  return { ...state };
}
