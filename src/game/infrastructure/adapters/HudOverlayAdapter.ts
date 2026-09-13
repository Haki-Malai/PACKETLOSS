import { GameEvent, gameEvents, getGameState } from '../../../state/gameState';

export class HudOverlayAdapter {
  private readonly container: HTMLDivElement;
  private readonly scoreText: HTMLSpanElement;
  private readonly livesCountText: HTMLSpanElement;
  private readonly onScoreChanged: (_score: number) => void;
  private readonly onLivesChanged: (_lives: number) => void;

  constructor(private readonly mount: HTMLElement, onPause?: () => void) {
    this.mount.querySelector('[data-game-hud]')?.remove();

    this.container = document.createElement('div');
    this.container.className = 'packet-hud';
    this.container.setAttribute('data-game-hud', 'true');

    const scoreSection = document.createElement('div');
    scoreSection.className = 'packet-hud-section';
    scoreSection.setAttribute('data-hud-score', 'true');

    const scoreLabel = document.createElement('span');
    scoreLabel.className = 'packet-hud-label';
    scoreLabel.textContent = 'Score';

    this.scoreText = document.createElement('span');
    this.scoreText.className = 'packet-hud-score';
    this.scoreText.setAttribute('data-hud-score-value', 'true');

    scoreSection.append(scoreLabel, this.scoreText);

    const livesSection = document.createElement('div');
    livesSection.className = 'packet-hud-section';
    livesSection.setAttribute('data-hud-lives', 'true');

    const livesLabel = document.createElement('span');
    livesLabel.className = 'packet-hud-label';
    livesLabel.textContent = 'Lives';

    this.livesCountText = document.createElement('span');
    this.livesCountText.className = 'packet-hud-lives';
    this.livesCountText.setAttribute('data-hud-lives-value', 'true');

    livesSection.append(livesLabel, this.livesCountText);
    this.container.append(scoreSection, livesSection);
    if (onPause) {
      const pause = document.createElement('button');
      pause.type = 'button';
      pause.className = 'packet-button packet-hud-pause';
      pause.textContent = 'Pause';
      pause.setAttribute('data-hud-pause', 'true');
      pause.addEventListener('click', onPause);
      this.container.append(pause);
    }

    const state = getGameState();
    this.setScore(state.score);
    this.setLives(state.lives);

    this.onScoreChanged = (score: number) => {
      this.setScore(score);
    };

    this.onLivesChanged = (lives: number) => {
      this.setLives(lives);
    };

    gameEvents.on(GameEvent.ScoreChanged, this.onScoreChanged);
    gameEvents.on(GameEvent.LivesChanged, this.onLivesChanged);

    this.mount.appendChild(this.container);
  }

  destroy(): void {
    gameEvents.off(GameEvent.ScoreChanged, this.onScoreChanged);
    gameEvents.off(GameEvent.LivesChanged, this.onLivesChanged);
    this.container.remove();
  }

  private setScore(score: number): void {
    this.scoreText.textContent = String(score);
  }

  private setLives(lives: number): void {
    const safeLives = Math.max(0, Math.floor(lives));
    this.livesCountText.textContent = String(safeLives);
  }
}
