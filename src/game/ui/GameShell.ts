import type { CreatePacketGameOptions } from '../app/createPacketGame';
import type { PacketGame, RunResult, RuntimeState } from '../app/contracts';
import type { MapVariant } from '../app/mapRuntimeConfig';
import {
    LocalProfileStore,
    type LocalRunRecord,
    type MenuMotion,
} from '../infrastructure/adapters/LocalProfileStore';
import { createMenuPanel, element, menuButton, type MenuPanel } from './MenuPanel';
import {
    getTutorialLesson,
    TUTORIAL_LESSONS,
    type TutorialLessonId,
    type TutorialSnapshot,
} from '../tutorial/TutorialLesson';

type Screen =
    | 'title'
    | 'loading'
    | 'playing'
    | 'paused'
    | 'result'
    | 'settings'
    | 'help'
    | 'profile'
    | 'confirm'
    | 'tutorial'
    | 'tutorial-complete'
    | 'error';

interface GameShellOptions {
    mapVariant: MapVariant;
    store?: LocalProfileStore;
    createGame?: (_options: CreatePacketGameOptions) => PacketGame;
}

function score(value: number): string {
    return value.toLocaleString('en-US');
}

function duration(elapsedMs: number): string {
    const seconds = Math.floor(elapsedMs / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Owns browser menus and run lifetime; gameplay remains inside PacketGame. */
export class GameShell {
    private readonly viewport = element('div', 'game-viewport');
    private readonly ui = element('section', 'packet-ui');
    private readonly menuViewport = element('div', 'packet-menu-viewport');
    private readonly tutorialObjective = element('aside', 'packet-tutorial-objective');
    private readonly store: LocalProfileStore;
    private disposeMenuPreview: (() => void) | null = null;
    private game: PacketGame | null = null;
    private screen: Screen = 'title';
    private parentScreen: 'title' | 'paused' = 'title';
    private returnAction = '';
    private confirmation: {
        message: string;
        action: () => void;
        parent: Screen;
        returnAction: string;
    } | null = null;
    private panel: HTMLElement | null = null;
    private result: RunResult | null = null;
    private tutorialLesson: TutorialLessonId | null = null;
    private tutorial: TutorialSnapshot | null = null;
    private newBest = false;
    private errorMessage = '';
    private generation = 0;
    private destroyed = false;

    constructor(
        private readonly root: HTMLElement,
        private readonly options: GameShellOptions
    ) {
        this.store = options.store ?? new LocalProfileStore();
        this.viewport.id = 'packet-scene';
        this.ui.setAttribute('aria-label', 'Game menu');
        this.tutorialObjective.setAttribute('role', 'status');
        this.tutorialObjective.setAttribute('aria-live', 'polite');
        this.tutorialObjective.hidden = true;
        this.ui.append(this.createAmbient(), this.menuViewport);
        this.root.classList.add('game-shell');
        this.root.replaceChildren(this.viewport, this.ui, this.tutorialObjective);
        this.applyMotion();
        this.ui.addEventListener('pointerdown', this.claimPause, true);
        window.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('fullscreenchange', this.handleFullscreenChange);
        this.show('title');
    }

    destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;
        this.generation += 1;
        this.game?.destroy();
        this.game = null;
        this.disposeMenuPreview?.();
        this.disposeMenuPreview = null;
        this.ui.removeEventListener('pointerdown', this.claimPause, true);
        window.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        this.ui.remove();
        this.tutorialObjective.remove();
        this.viewport.remove();
        this.root.classList.remove('game-shell');
        this.root.removeAttribute('data-menu-motion');
    }

    private readonly claimPause = (): void => {
        if (this.screen !== 'playing') this.game?.pause();
    };

    private startRun(tutorialLesson?: TutorialLessonId): void {
        if (this.destroyed || this.screen === 'loading') return;
        const generation = ++this.generation;
        this.game?.destroy();
        this.game = null;
        this.result = null;
        this.tutorialLesson = tutorialLesson ?? null;
        this.tutorial = tutorialLesson
            ? {
                  lesson: tutorialLesson,
                  phase: 'introduction',
                  objective: getTutorialLesson(tutorialLesson).objective,
                  message: getTutorialLesson(tutorialLesson).introduction,
                  marker: null,
              }
            : null;
        this.newBest = false;
        const id =
            globalThis.crypto?.randomUUID?.() ??
            `${Date.now()}-${generation}-${Math.random().toString(36).slice(2)}`;
        const nickname = this.store.getNickname();
        this.show('loading');
        void this.initializeRun(generation, id, nickname, tutorialLesson).catch((error: unknown) =>
            this.failStartup(error, generation)
        );
    }

    private async initializeRun(
        generation: number,
        id: string,
        nickname: string,
        tutorialLesson?: TutorialLessonId
    ): Promise<void> {
        const createGame =
            this.options.createGame ?? (await import('../app/createPacketGame')).createPacketGame;
        if (this.destroyed || this.generation !== generation) return;
        const game = createGame({
            mountId: this.viewport.id,
            mapVariant: tutorialLesson ? 'demo' : this.options.mapVariant,
            ...(tutorialLesson ? { tutorialLesson } : {}),
            onStateChange: (state) => {
                if (!this.destroyed && this.generation === generation)
                    this.receiveState(state, id, nickname);
            },
        });
        this.game = game;
        await game.start();
        if (!this.destroyed && this.generation === generation && this.screen === 'loading')
            this.show(tutorialLesson ? 'tutorial' : 'playing');
    }

    private failStartup(error: unknown, generation: number): void {
        if (this.destroyed || this.generation !== generation) return;
        this.generation += 1;
        this.game?.destroy();
        this.game = null;
        this.errorMessage =
            error instanceof Error ? error.message : 'The game could not start. Please try again.';
        this.show('error');
    }

    private receiveState(state: RuntimeState, id: string, nickname: string): void {
        if (this.tutorialLesson) {
            if (!state.tutorial || state.tutorial.lesson !== this.tutorialLesson) return;
            const previous = this.tutorial;
            this.tutorial = state.tutorial;
            if (state.tutorial.phase !== 'playing') {
                this.show('tutorial');
            } else if (state.paused) {
                if (this.screen === 'playing' || this.screen === 'loading') this.show('paused');
            } else if (this.screen !== 'playing' || previous?.objective !== state.tutorial.objective) {
                this.show('playing');
            }
            return;
        }
        if (state.result) {
            if (this.result) return;
            this.result = state.result;
            const best = this.store.getTopRecords(this.options.mapVariant)[0];
            this.newBest = !best || state.result.score > best.score;
            this.store.saveRun({
                ...state.result,
                id,
                nickname,
                map: this.options.mapVariant,
                completedAt: new Date().toISOString(),
            });
            this.show('result');
        } else if (state.paused) {
            if (this.screen === 'playing' || this.screen === 'loading') this.show('paused');
        } else if (!this.result) {
            this.show('playing');
        }
    }

    private mainMenu(): void {
        this.generation += 1;
        this.game?.destroy();
        this.game = null;
        this.result = null;
        this.tutorialLesson = null;
        this.tutorial = null;
        this.viewport.replaceChildren();
        this.show('title');
    }

    private resume(): void {
        if (!this.game || this.result) return;
        if (this.tutorial?.phase === 'success' || this.tutorial?.phase === 'retry') return;
        this.game.resume();
        if (!this.tutorialLesson && this.screen !== 'playing') this.show('playing');
    }

    private exitTutorial(): void {
        this.generation += 1;
        this.game?.destroy();
        this.game = null;
        this.result = null;
        this.tutorialLesson = null;
        this.tutorial = null;
        this.viewport.replaceChildren();
        this.parentScreen = 'title';
        this.returnAction = 'help';
        this.show('help');
        this.ui.querySelector<HTMLElement>('[data-action="try-out"]')?.focus();
    }

    private retrySession(): void {
        this.startRun(this.tutorialLesson ?? undefined);
    }

    private submenu(screen: 'settings' | 'help' | 'profile', action: string): void {
        this.parentScreen = this.game ? 'paused' : 'title';
        this.returnAction = action;
        this.game?.pause();
        this.show(screen);
    }

    private back(): void {
        if (this.screen === 'confirm' && this.confirmation) {
            const { parent, returnAction } = this.confirmation;
            this.confirmation = null;
            this.show(parent);
            this.ui.querySelector<HTMLElement>(`[data-action="${returnAction}"]`)?.focus();
        } else {
            this.show(this.parentScreen);
            this.ui.querySelector<HTMLElement>(`[data-action="${this.returnAction}"]`)?.focus();
        }
    }

    private confirm(message: string, action: () => void, returnAction: string): void {
        this.confirmation = { message, action, parent: this.screen, returnAction };
        this.show('confirm');
    }

    private button(
        label: string,
        action: string,
        callback: () => void,
        variant = ''
    ): HTMLButtonElement {
        return menuButton(
            label,
            action,
            () => {
                this.claimPause();
                callback();
            },
            variant
        );
    }

    private createAmbient(): HTMLElement {
        const ambient = element('div', 'packet-ambient');
        ambient.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < 12; i += 1) {
            const bit = element('span', 'packet-bit');
            const left = i < 4 ? (i % 2 === 0 ? 1 : 98) : ((i * 29 + 5) % 94) + 3;
            bit.style.cssText = `left:${left}%;top:${((i * 17 + 11) % 86) + 7}%;--bit-duration:${11 + (i % 5) * 1.9}s;--bit-delay:${-i * 1.73}s;--bit-flip:${2.7 + (i % 4) * 0.61}s`;
            bit.append(
                element('span', '', String(i % 2)),
                element('span', '', String(1 - (i % 2)))
            );
            ambient.append(bit);
        }
        return ambient;
    }

    private show(screen: Screen): void {
        if (this.destroyed) return;
        this.disposeMenuPreview?.();
        this.disposeMenuPreview = null;
        this.screen = screen;
        this.ui.hidden = screen === 'playing';
        this.tutorialObjective.hidden = screen !== 'playing' || !this.tutorial;
        if (this.tutorial && screen === 'playing') {
            const lesson = getTutorialLesson(this.tutorial.lesson);
            const number = TUTORIAL_LESSONS.findIndex((entry) => entry.id === lesson.id) + 1;
            this.tutorialObjective.replaceChildren(
                element(
                    'p',
                    'packet-eyebrow',
                    `Practice · ${number} / ${TUTORIAL_LESSONS.length} · ${lesson.title}`
                ),
                element('p', 'packet-copy', this.tutorial.objective)
            );
        }
        this.viewport.inert = screen !== 'playing';
        this.ui.setAttribute('data-screen', screen);
        this.ui.setAttribute('data-backdrop', this.game ? 'scene' : 'title');
        this.menuViewport.replaceChildren();
        this.panel = null;
        if (screen === 'playing') {
            const canvas = this.viewport.querySelector('canvas');
            if (canvas) {
                canvas.tabIndex = -1;
                canvas.focus({ preventScroll: true });
            }
            return;
        }

        const titles: Record<Exclude<Screen, 'playing'>, readonly [string, string]> = {
            title: ['A maze arcade game', 'PACKETLOSS'],
            paused: ['Signal on hold', 'PAUSED'],
            result:
                this.result?.outcome === 'lost'
                    ? ['All lives lost', 'PACKET LOST']
                    : ['All data recovered', 'MAZE CLEARED'],
            settings: ['Make yourself comfortable', 'SETTINGS'],
            help: ['Keep your signal alive', 'HOW TO PLAY'],
            profile: ['On this device', 'PROFILE & RECORDS'],
            loading: ['Connecting', 'Loading the maze'],
            error: ['Signal interrupted', 'Unable to start'],
            confirm: ['One more thing', 'Are you sure?'],
            tutorial: [
                `Practice · Lesson ${TUTORIAL_LESSONS.findIndex((lesson) => lesson.id === this.tutorialLesson) + 1} of ${TUTORIAL_LESSONS.length}`,
                this.tutorialLesson ? getTutorialLesson(this.tutorialLesson).title : 'Try Out',
            ],
            'tutorial-complete': ['Practice complete', 'READY TO PLAY'],
        };
        const [eyebrow, title] = titles[screen];
        const panel = createMenuPanel({
            eyebrow,
            title,
            wide: screen === 'help' || screen === 'profile',
            centered: screen === 'title',
            onBack: ['settings', 'help', 'profile'].includes(screen)
                ? () => {
                      this.claimPause();
                      this.back();
                  }
                : undefined,
        });
        this.panel = panel.root;
        this.menuViewport.append(panel.root);
        switch (screen) {
            case 'title':
                this.renderTitle(panel);
                break;
            case 'paused':
                this.renderPause(panel);
                break;
            case 'result':
                this.renderResult(panel);
                break;
            case 'settings':
                this.renderSettings(panel);
                break;
            case 'help':
                this.renderHelp(panel);
                break;
            case 'profile':
                this.renderProfile(panel);
                break;
            case 'tutorial':
                this.renderTutorial(panel);
                break;
            case 'tutorial-complete':
                panel.body.append(
                    element(
                        'p',
                        'packet-copy',
                        'You have tried every mechanic. Take your signal into the full maze when you are ready.'
                    )
                );
                panel.actions.append(
                    this.button('Start game', 'start', () => this.startRun(), 'packet-primary'),
                    this.button('Replay tutorial', 'replay-tutorial', () =>
                        this.startRun('movement')
                    ),
                    this.button('Back to How to play', 'exit-tutorial', () => this.exitTutorial())
                );
                break;
            case 'loading':
                panel.body.append(
                    element(
                        'p',
                        'packet-copy packet-loading',
                        this.tutorialLesson
                            ? 'Preparing your practice lesson…'
                            : 'Preparing your run…'
                    )
                );
                panel.actions.append(this.sessionExitButton());
                panel.body.querySelector('.packet-loading')?.setAttribute('role', 'status');
                break;
            case 'error': {
                const error = element('p', 'packet-copy', this.errorMessage);
                error.setAttribute('role', 'alert');
                panel.body.append(error);
                panel.actions.append(
                    this.button('Retry', 'retry', () => this.retrySession(), 'packet-primary'),
                    this.sessionExitButton()
                );
                break;
            }
            case 'confirm':
                panel.body.append(element('p', 'packet-copy', this.confirmation?.message));
                panel.actions.append(
                    this.button('Cancel', 'cancel', () => this.back(), 'packet-primary'),
                    this.button(
                        'Confirm',
                        'confirm',
                        () => {
                            const action = this.confirmation?.action;
                            this.confirmation = null;
                            action?.();
                        },
                        'packet-danger'
                    )
                );
                break;
        }
        const status = this.store.getStatusMessage();
        if (status) {
            const note = element('p', 'packet-note', status);
            note.setAttribute('role', 'status');
            panel.footer.append(note);
        }
        panel.root.focus({ preventScroll: true });
        this.menuViewport.scrollTop = 0;
    }

    private renderTitle(panel: MenuPanel): void {
        const wordmark = element('div', 'packet-wordmark');
        const titles = panel.heading.parentElement;
        wordmark.append(panel.heading);
        titles?.append(wordmark);
        wordmark.addEventListener('packet-wordmark-unavailable', () => {
            wordmark.removeAttribute('data-ready');
        });
        void import('./TitleWordmark')
            .then(({ mountTitleWordmark }) => {
                if (this.destroyed || this.panel !== panel.root) return;
                this.disposeMenuPreview = mountTitleWordmark(wordmark, this.store.getMotion());
                wordmark.setAttribute('data-ready', 'true');
            })
            .catch(() => {
                // Keep the real text heading usable if the optional WebGL title cannot load.
                wordmark.removeAttribute('data-ready');
            });
        panel.body.append(
            element('p', 'packet-copy', 'Recover data. Evade enemies. Keep your signal alive.')
        );
        const identity = element('div', 'packet-identity');
        identity.append(
            element('span', '', this.store.getNickname()),
            element(
                'span',
                '',
                `BEST ${score(this.store.getTopRecords(this.options.mapVariant)[0]?.score ?? 0)}`
            )
        );
        panel.body.append(identity);
        panel.actions.append(
            this.button('Start game', 'start', () => this.startRun(), 'packet-primary'),
            this.button('Profile & records', 'profile', () => this.submenu('profile', 'profile')),
            this.button('Settings', 'settings', () => this.submenu('settings', 'settings')),
            this.button('How to play', 'help', () => this.submenu('help', 'help'))
        );
        panel.footer.append(
            element('p', 'packet-note', 'Your profile and records stay on this device.')
        );
    }

    private renderPause(panel: MenuPanel): void {
        if (this.tutorialLesson) {
            panel.body.append(element('p', 'packet-copy', this.tutorial?.objective));
            panel.actions.append(
                this.button('Resume', 'resume', () => this.resume(), 'packet-primary'),
                this.button('Retry lesson', 'retry-lesson', () => this.retrySession()),
                this.button('Settings', 'settings', () => this.submenu('settings', 'settings')),
                this.button('How to play', 'help', () => this.submenu('help', 'help')),
                this.sessionExitButton()
            );
            panel.footer.append(
                element(
                    'p',
                    'packet-note',
                    'Practice is not recorded. Retry this lesson as often as you like.'
                )
            );
            return;
        }
        panel.body.append(element('p', 'packet-copy', 'Take a breath. The maze can wait.'));
        panel.actions.append(
            this.button('Resume', 'resume', () => this.resume(), 'packet-primary'),
            this.button('Restart', 'restart', () =>
                this.confirm(
                    'Restart this run? Your unfinished score will not be saved.',
                    () => this.startRun(),
                    'restart'
                )
            ),
            this.button('Settings', 'settings', () => this.submenu('settings', 'settings')),
            this.button('How to play', 'help', () => this.submenu('help', 'help')),
            this.button('Main menu', 'main-menu', () =>
                this.confirm(
                    'Leave this run? Your unfinished score will not be saved.',
                    () => this.mainMenu(),
                    'main-menu'
                )
            )
        );
        panel.footer.append(
            element('p', 'packet-note', 'Escape to resume · Space activates the focused button')
        );
    }

    private sessionExitButton(): HTMLButtonElement {
        return this.tutorialLesson
            ? this.button('Exit tutorial', 'exit-tutorial', () => this.exitTutorial())
            : this.button('Main menu', 'main-menu', () => this.mainMenu());
    }

    private renderTutorial(panel: MenuPanel): void {
        const tutorial = this.tutorial;
        if (!tutorial) return;
        panel.root.setAttribute('data-tutorial-phase', tutorial.phase);
        if (tutorial.phase === 'success' || tutorial.phase === 'retry') {
            panel.body.append(
                element(
                    'p',
                    'packet-eyebrow',
                    tutorial.phase === 'success' ? 'Lesson complete' : 'Try that again'
                )
            );
        }
        panel.body.append(element('p', 'packet-copy', tutorial.message));
        if (tutorial.phase === 'introduction' || tutorial.phase === 'explanation') {
            panel.actions.append(
                this.button(
                    tutorial.phase === 'introduction' ? 'Try it' : 'Continue',
                    'try-lesson',
                    () => this.resume(),
                    'packet-primary'
                )
            );
        } else if (tutorial.phase === 'success') {
            const next =
                TUTORIAL_LESSONS[
                    TUTORIAL_LESSONS.findIndex((lesson) => lesson.id === tutorial.lesson) + 1
                ];
            panel.actions.append(
                this.button(
                    next ? 'Next lesson' : 'Finish tutorial',
                    'next-lesson',
                    () => (next ? this.startRun(next.id) : this.show('tutorial-complete')),
                    'packet-primary'
                )
            );
        }
        if (tutorial.phase !== 'introduction') {
            panel.actions.append(
                this.button(
                    'Retry lesson',
                    'retry-lesson',
                    () => this.retrySession(),
                    tutorial.phase === 'retry' ? 'packet-primary' : ''
                )
            );
        }
        panel.actions.append(this.sessionExitButton());
        panel.footer.append(
            element('p', 'packet-note', 'The maze is paused. Practice scores are not saved.')
        );
    }

    private renderResult(panel: MenuPanel): void {
        const result = this.result;
        if (!result) return;
        panel.root.setAttribute('data-outcome', result.outcome);
        panel.body.append(
            element('p', 'packet-result-score', score(result.score)),
            element('p', 'packet-eyebrow', this.newBest ? 'NEW LOCAL BEST' : 'FINAL SCORE')
        );
        const stats = element('dl', 'packet-stats');
        for (const [label, value] of [
            ['Local best', score(this.store.getTopRecords(this.options.mapVariant)[0]?.score ?? 0)],
            ['Data recovered', `${result.pointsCollected} / ${result.totalPoints}`],
            ['Play time', duration(result.elapsedMs)],
        ]) {
            const stat = element('div');
            stat.append(element('dt', '', label), element('dd', '', value));
            stats.append(stat);
        }
        panel.body.append(stats);
        panel.actions.append(
            this.button(
                result.outcome === 'lost' ? 'Try again' : 'Play again',
                'replay',
                () => this.startRun(),
                'packet-primary'
            ),
            this.button('Main menu', 'main-menu', () => this.mainMenu())
        );
        panel.footer.append(
            element(
                'p',
                'packet-note',
                this.store.getStatusMessage()
                    ? 'Your result is available for this session.'
                    : 'Record saved on this device.'
            )
        );
    }

    private renderSettings(panel: MenuPanel): void {
        const sound = this.button('Sound — Coming soon', 'sound', () => {});
        sound.disabled = true;
        const motionLabel = element('label', 'packet-field', 'Menu motion');
        const motion = element('select', 'packet-input');
        motion.setAttribute('data-control', 'motion');
        for (const [value, label] of [
            ['system', 'Follow system'],
            ['reduced', 'Reduced'],
            ['full', 'Full'],
        ]) {
            const option = element('option', '', label);
            option.value = value;
            motion.append(option);
        }
        motion.value = this.store.getMotion();
        motion.addEventListener('change', () => {
            this.store.setMotion(motion.value as MenuMotion);
            this.applyMotion();
            this.show('settings');
            this.ui.querySelector<HTMLElement>('[data-control="motion"]')?.focus();
        });
        motionLabel.append(motion);
        panel.body.append(sound, motionLabel);
        panel.footer.append(
            element('p', 'packet-note', 'Changes menu effects only. Gameplay motion is unchanged.')
        );
        if (document.fullscreenEnabled && typeof this.root.requestFullscreen === 'function') {
            panel.actions.append(
                this.button(
                    document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen',
                    'fullscreen',
                    () => {
                        void this.toggleFullscreen();
                    }
                )
            );
        }
    }

    private applyMotion(): void {
        this.root.setAttribute('data-menu-motion', this.store.getMotion());
    }

    private readonly handleFullscreenChange = (): void => {
        const button = this.ui.querySelector<HTMLButtonElement>('[data-action="fullscreen"]');
        if (button)
            button.textContent = document.fullscreenElement
                ? 'Exit fullscreen'
                : 'Enter fullscreen';
    };

    private async toggleFullscreen(): Promise<void> {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await this.root.requestFullscreen();
        } catch {
            if (this.destroyed || this.screen !== 'settings') return;
            const note = element(
                'p',
                'packet-note',
                'Fullscreen is unavailable right now. You can keep playing in this window.'
            );
            note.setAttribute('role', 'status');
            this.panel?.querySelector('.packet-panel-footer')?.append(note);
        }
    }

    private renderHelp(panel: MenuPanel): void {
        const layout = element('div', 'packet-columns');
        const basics = element('section', 'packet-basics');
        const heading = element('h2', 'packet-record-heading', 'The basics');
        heading.id = 'packet-basics-heading';
        basics.setAttribute('aria-labelledby', heading.id);
        const instructions = element('dl', 'packet-help');
        for (const [label, text] of [
            [
                'Move',
                'Arrow keys or WASD. On touchscreens, swipe in the direction you want to go. Turns queue until the corridor allows them.',
            ],
            [
                'Collect',
                'Data bits score 10 points. Larger power cores score 50 and let you eat scared enemies for increasing bonuses.',
            ],
            [
                'Survive',
                'You have three lives. Avoid enemies, use the linked portals, and recover all data to clear the maze.',
            ],
            [
                'Pause',
                'Press Space or Escape, use the Pause button, or click/tap the game. Choose Resume when ready.',
            ],
        ]) {
            instructions.append(element('dt', '', label), element('dd', '', text));
        }
        basics.append(heading, instructions);
        const practice = element('div', 'packet-practice-entry');
        const tryOut = this.button(
            'Try Out',
            'try-out',
            () => {
                if (!this.game && !this.tutorialLesson) this.startRun('movement');
            },
            'packet-primary'
        );
        tryOut.disabled = Boolean(this.game || this.tutorialLesson);
        const practiceNote = element(
            'p',
            'packet-note',
            tryOut.disabled
                ? 'Return to the main menu to try the tutorial.'
                : 'Learn each mechanic in a guided practice maze. Pause, try it, and retry as often as you like.'
        );
        practiceNote.id = 'packet-practice-note';
        tryOut.setAttribute('aria-describedby', practiceNote.id);
        practice.append(tryOut, practiceNote);
        basics.append(practice);
        const enemies = this.enemyGuide();
        layout.append(basics, enemies);
        panel.body.append(layout);
        void import('./EnemyPortraits')
            .then(({ mountEnemyPortraits }) => {
                if (this.destroyed || this.panel !== panel.root) return;
                this.disposeMenuPreview = mountEnemyPortraits(enemies, this.store.getMotion());
            })
            .catch(() => {
                // The existing portraits keep the guide readable if previews cannot load.
            });
    }

    private enemyGuide(): HTMLElement {
        const section = element('section', 'packet-enemies');
        const heading = element('h2', 'packet-record-heading', 'Enemies');
        heading.id = 'packet-enemies-heading';
        section.setAttribute('aria-labelledby', heading.id);
        const list = element('ul', 'packet-enemy-list');
        for (const [name, description] of [
            ['Firewall', 'Patrols a fixed route. Watch its loop before crossing its path.'],
            ['Virus', 'Chases you along the shortest route, including portal shortcuts.'],
            [
                'Ping',
                'Scans nearby every three seconds, even through walls, then chases your last detected position.',
            ],
            ['Spam', 'Splits into smaller copies every four seconds, up to four Spam at once.'],
            [
                'Lag',
                'Moves slowly and leaves temporary zones that cut your movement speed in half.',
            ],
        ]) {
            const row = element('li', 'packet-enemy');
            const preview = element('span', 'packet-enemy-portrait');
            preview.setAttribute('data-enemy', name.toLowerCase());
            const portrait = element('img');
            portrait.src = `${import.meta.env.BASE_URL}assets/images/enemies/${name.toLowerCase()}.png`;
            portrait.alt = `${name} enemy`;
            portrait.width = 256;
            portrait.height = 256;
            portrait.loading = 'lazy';
            portrait.decoding = 'async';
            preview.append(portrait);
            const details = element('div');
            details.append(
                element('h3', 'packet-enemy-name', name),
                element('p', 'packet-copy', description)
            );
            row.append(preview, details);
            list.append(row);
        }
        section.append(heading, list);
        return section;
    }

    private renderProfile(panel: MenuPanel): void {
        const label = element('label', 'packet-field', 'Player name');
        const nickname = element('input', 'packet-input');
        nickname.type = 'text';
        nickname.maxLength = 16;
        nickname.value = this.store.getNickname();
        nickname.setAttribute('autocomplete', 'nickname');
        nickname.setAttribute('data-control', 'nickname');
        label.append(nickname);
        const form = element('form', 'packet-name-form');
        const save = menuButton('Save name', 'save-name', this.claimPause);
        save.type = 'submit';
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.store.setNickname(nickname.value);
            this.show('profile');
            this.ui.querySelector<HTMLElement>('[data-control="nickname"]')?.focus();
        });
        form.append(label, save);
        panel.body.append(
            form,
            element(
                'p',
                'packet-note',
                'Optional · Up to 16 characters. Past records keep the name used for that run.'
            )
        );
        const records = element('div', 'packet-columns');
        records.append(
            this.recordSection(
                'TOP SCORES',
                this.store.getTopRecords(this.options.mapVariant),
                false
            ),
            this.recordSection(
                'RECENT RUNS',
                this.store.getRecentRecords(this.options.mapVariant),
                true
            )
        );
        panel.body.append(records);
        panel.actions.append(
            this.button(
                'Clear records',
                'clear-records',
                () =>
                    this.confirm(
                        'Clear all records on this device? Your name and settings will be kept.',
                        () => {
                            this.store.clearRecords();
                            this.show('profile');
                        },
                        'clear-records'
                    ),
                'packet-danger'
            )
        );
    }

    private recordSection(
        title: string,
        records: readonly LocalRunRecord[],
        recent: boolean
    ): HTMLElement {
        const panel = element('section');
        panel.append(element('h2', 'packet-record-heading', title));
        if (records.length === 0) {
            panel.append(element('p', 'packet-copy', 'No runs yet. Your next signal starts here.'));
            return panel;
        }
        const list = element('ol', 'packet-records');
        records.forEach((record, index) => {
            const row = element('li');
            const name = element(
                'span',
                'packet-record-name',
                `${recent ? '' : `${index + 1}. `}${record.nickname}`
            );
            name.append(
                element(
                    'small',
                    '',
                    `${record.outcome === 'cleared' ? 'Cleared' : 'Lost'} · ${duration(record.elapsedMs)} · ${new Date(record.completedAt).toLocaleDateString()}`
                )
            );
            row.append(name, element('strong', '', score(record.score)));
            list.append(row);
        });
        panel.append(list);
        return panel;
    }

    private readonly handleKeyDown = (event: KeyboardEvent): void => {
        if (this.screen === 'playing' || event.defaultPrevented) return;
        this.claimPause();
        if (event.key === 'Tab') {
            const controls = Array.from(
                this.ui.querySelectorAll<HTMLElement>('button,input,select,a')
            ).filter(
                (control) =>
                    !control.hasAttribute('disabled') &&
                    !('disabled' in control && control.disabled) &&
                    !control.hidden
            );
            const index = controls.indexOf(document.activeElement as HTMLElement);
            if (controls.length === 0) {
                event.preventDefault();
                this.panel?.focus();
            } else if (
                index < 0 ||
                (event.shiftKey && index === 0) ||
                (!event.shiftKey && index === controls.length - 1)
            ) {
                event.preventDefault();
                controls[event.shiftKey ? controls.length - 1 : 0].focus();
            }
            return;
        }
        if (event.repeat) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            if (this.screen === 'paused') this.resume();
            else if (['settings', 'help', 'profile', 'confirm'].includes(this.screen)) this.back();
            else if (this.screen === 'tutorial-complete') this.exitTutorial();
            else if (['loading', 'error', 'result'].includes(this.screen)) {
                if (this.tutorialLesson) this.exitTutorial();
                else this.mainMenu();
            }
        } else if ((event.code === 'Space' || event.key === ' ') && this.screen === 'paused') {
            const target = event.target as HTMLElement | null;
            if (target?.closest('button,input,select,textarea,a,[contenteditable="true"]')) return;
            event.preventDefault();
            this.resume();
        }
    };
}
