import { describe, expect, it, vi } from 'vitest';
import { GameEvent, GameStateStore } from '../state/gameState';

describe('GameStateStore', () => {
    it('keeps score, lives, bonus state, and events isolated between sessions', () => {
        const first = new GameStateStore();
        const second = new GameStateStore();
        const firstScoreChanged = vi.fn();
        const secondScoreChanged = vi.fn();
        first.on(GameEvent.ScoreChanged, firstScoreChanged);
        second.on(GameEvent.ScoreChanged, secondScoreChanged);

        first.addScore(50);
        first.loseLife();
        first.setScoreBonusStatus({ phase: 'active', kind: 'key', multiplier: 2, seconds: 15 });

        expect(first.getSnapshot()).toEqual({ score: 50, lives: 2 });
        expect(first.getScoreBonusStatus()).toMatchObject({ phase: 'active', multiplier: 2 });
        expect(second.getSnapshot()).toEqual({ score: 0, lives: 3 });
        expect(second.getScoreBonusStatus()).toBeNull();
        expect(firstScoreChanged).toHaveBeenCalledOnce();
        expect(secondScoreChanged).not.toHaveBeenCalled();
    });
});
