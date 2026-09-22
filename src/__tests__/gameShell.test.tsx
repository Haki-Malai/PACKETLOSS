// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreatePacketGameOptions } from '../game/app/createPacketGame';
import type { LevelClearCheckpoint, RunResult, RuntimeState } from '../game/app/contracts';
import { LocalProfileStore } from '../game/infrastructure/adapters/LocalProfileStore';
import { GameShell } from '../game/ui/GameShell';
import { mountEnemyPortraits } from '../game/ui/EnemyPortraits';
import { mountScoreBonusPreviews } from '../game/ui/ScoreBonusPreviews';
import { mountTitleWordmark } from '../game/ui/TitleWordmark';
import { StrictMode } from 'react';
import { addScore, resetGameState } from '../state/gameState';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    TUTORIAL_LESSONS,
    type TutorialLessonId,
    type TutorialPhase,
} from '../game/tutorial/TutorialLesson';

vi.mock('../game/ui/TitleWordmark', () => ({ mountTitleWordmark: vi.fn() }));
vi.mock('../game/ui/EnemyPortraits', () => ({ mountEnemyPortraits: vi.fn() }));
vi.mock('../game/ui/ScoreBonusPreviews', () => ({ mountScoreBonusPreviews: vi.fn() }));

const loss: RunResult = {
    outcome: 'lost',
    score: 140,
    lives: 0,
    elapsedMs: 64_500,
    pointsCollected: 14,
    totalPoints: 50,
    levelsCleared: 2,
};

type RuntimeEmission = Omit<RuntimeState, 'levelClear'> & {
    levelClear?: RuntimeState['levelClear'];
};

function pendingStart() {
    let resolve!: () => void;
    let reject!: (_reason: Error) => void;
    const promise = new Promise<void>((done, fail) => {
        resolve = done;
        reject = fail;
    });
    return { promise, resolve, reject };
}

async function flushStart(): Promise<void> {
    await act(async () => {
        await vi.dynamicImportSettled();
    });
}

function setup(starts: Promise<void>[] = [], mapVariant: 'default' | 'demo' = 'demo') {
    let id = 0;
    vi.stubGlobal('crypto', { randomUUID: () => `run-${++id}` });

    let saved: string | null = null;
    const storage = {
        getItem: () => saved,
        setItem: vi.fn((_key: string, value: string) => {
            saved = value;
        }),
    };
    const store = new LocalProfileStore(storage);
    const makeGame = (options: CreatePacketGameOptions) => {
        let disposed = false;
        let canvas: HTMLCanvasElement | undefined;
        return {
            options,
            start: vi.fn(async () => {
                await (starts.shift() ?? Promise.resolve());
                if (disposed) return;
                canvas = document.createElement('canvas');
                document.getElementById(options.mountId!)?.replaceChildren(canvas);
            }),
            pause: vi.fn(),
            resume: vi.fn(),
            continueLevel: vi.fn(),
            destroy: vi.fn(() => {
                disposed = true;
                canvas?.remove();
            }),
            emit: (state: RuntimeEmission) =>
                act(() => options.onStateChange?.({ levelClear: null, ...state })),
        };
    };
    const games: ReturnType<typeof makeGame>[] = [];
    const createGame = vi.fn((options: CreatePacketGameOptions) => {
        const game = makeGame(options);
        games.push(game);
        return game;
    });
    const page = render(
        <StrictMode>
            <GameShell mapVariant={mapVariant} store={store} createGame={createGame} />
        </StrictMode>
    );
    const root = page.container;

    function find<T extends HTMLElement = HTMLElement>(selector: string): T {
        const found = root.querySelector<T>(selector);
        if (!found) throw new Error(`Missing element: ${selector}`);
        return found;
    }
    function action(name: string): HTMLButtonElement {
        return find<HTMLButtonElement>(`[data-action="${name}"]`);
    }
    function key(key: string, target = document.activeElement, shiftKey = false): Event {
        const event = new KeyboardEvent('keydown', {
            key,
            code: key === ' ' ? 'Space' : key,
            shiftKey,
            repeat: false,
            bubbles: true,
            cancelable: true,
        });
        fireEvent(target ?? window, event);
        return event;
    }
    function screen(): string | null {
        return find('[data-screen]').getAttribute('data-screen');
    }
    return {
        root,
        document,
        window,
        unmount: page.unmount,
        store,
        storage,
        games,
        createGame,
        find,
        action,
        key,
        screen,
    };
}

function tutorialState(
    lesson: TutorialLessonId = 'movement',
    phase: TutorialPhase = 'introduction',
    paused = phase !== 'playing'
): RuntimeState {
    return {
        paused,
        result: null,
        levelClear: null,
        tutorial: {
            lesson,
            phase,
            message: 'A paused explanation.',
            objective: 'Reach the marked data bit.',
            marker: null,
        },
    };
}

beforeEach(() => {
    vi.mocked(mountTitleWordmark)
        .mockReset()
        .mockReturnValue(() => {});
    vi.mocked(mountEnemyPortraits)
        .mockReset()
        .mockReturnValue(() => {});
    vi.mocked(mountScoreBonusPreviews)
        .mockReset()
        .mockReturnValue(() => {});
});

afterEach(async () => {
    cleanup();
    for (const key of ['fullscreenEnabled', 'fullscreenElement', 'exitFullscreen'])
        Reflect.deleteProperty(document, key);
    await flushStart();
    vi.unstubAllGlobals();
});

describe('GameShell', () => {
    it('returns from mode selection and restores Endless as the default on every visit', async () => {
        const page = setup();
        const user = userEvent.setup();
        expect(page.root.querySelector('[data-action="start-endless"]')).toBeNull();
        for (const exit of ['back', 'escape']) {
            fireEvent.click(page.action('start'));
            expect(page.document.activeElement).toBe(page.action('start-endless'));
            page.key('ArrowDown');
            expect(page.document.activeElement).toBe(page.action('start-level'));
            if (exit === 'back') fireEvent.click(page.action('back'));
            else page.key('Escape');
            expect(page.screen()).toBe('title');
            expect(page.document.activeElement).toBe(page.action('start'));
            expect(page.createGame).not.toHaveBeenCalled();
        }
        fireEvent.click(page.action('start'));
        await user.keyboard('{Enter}');
        await flushStart();
        expect(page.games[0].options.mode).toBe('endless');
    });

    it('moves the shared menu highlight with arrows and activates it with Enter', async () => {
        const page = setup();
        const user = userEvent.setup();
        const start = page.action('start');
        const profile = page.action('profile');
        const titlePanel = page.find('[role="dialog"]');

        expect(start.classList.contains('packet-primary')).toBe(true);
        expect(page.key('ArrowRight').defaultPrevented).toBe(true);
        expect(page.document.activeElement).toBe(profile);
        expect(titlePanel.getAttribute('data-arrow-navigation')).toBe('true');
        expect(profile.classList.contains('packet-primary')).toBe(true);
        expect(start.classList.contains('packet-primary')).toBe(false);
        expect(page.key('ArrowLeft').defaultPrevented).toBe(true);
        expect(page.document.activeElement).toBe(start);
        page.key('Tab');
        expect(titlePanel.getAttribute('data-arrow-navigation')).toBeNull();
        await user.keyboard('{Enter}');
        expect(page.screen()).toBe('mode');
        const endless = page.action('start-endless');
        expect(page.document.activeElement).toBe(endless);
        expect(endless.classList.contains('packet-primary')).toBe(true);
        page.key('ArrowDown');
        expect(page.document.activeElement).toBe(page.action('start-level'));
        await user.keyboard('{Enter}');
        await flushStart();
        const game = page.games[0];
        expect(game.options.mode).toBe('classic');
        expect(page.screen()).toBe('playing');

        game.emit({ paused: true, result: null });
        const resume = page.action('resume');
        const restart = page.action('restart');
        expect(resume.classList.contains('packet-primary')).toBe(true);
        expect(page.key('ArrowDown').defaultPrevented).toBe(true);
        expect(page.document.activeElement).toBe(restart);
        expect(restart.classList.contains('packet-primary')).toBe(true);
        expect(resume.classList.contains('packet-primary')).toBe(false);
        expect(page.key('ArrowUp').defaultPrevented).toBe(true);
        expect(page.document.activeElement).toBe(resume);
        await user.keyboard('{Enter}');
        expect(game.resume).toHaveBeenCalledOnce();

        const levelClear: LevelClearCheckpoint = {
            level: 1,
            score: 50,
            lives: 3,
            elapsedMs: 1_000,
            pointsCollected: 1,
            totalPoints: 1,
            nextMultiplier: 1.25,
        };
        game.emit({ paused: true, result: null, levelClear });
        const continueLevel = page.action('continue-level');
        const mainMenu = page.action('main-menu');
        expect(page.key('ArrowUp').defaultPrevented).toBe(true);
        expect(page.document.activeElement).toBe(mainMenu);
        expect(mainMenu.classList.contains('packet-primary')).toBe(true);
        expect(continueLevel.classList.contains('packet-primary')).toBe(false);
        expect(page.key('ArrowDown').defaultPrevented).toBe(true);
        expect(page.document.activeElement).toBe(continueLevel);
        await user.keyboard('{Enter}');
        expect(game.continueLevel).toHaveBeenCalledOnce();
    });

    it('keeps React overlays outside canvas ownership and ignores diagnostics from a replaced run', async () => {
        resetGameState(70, 2);
        const page = setup();
        fireEvent.click(page.action('start'));
        fireEvent.click(page.action('start-level'));
        await flushStart();
        const first = page.games[0];
        const canvas = page.find('canvas');
        expect(document.activeElement).toBe(canvas);
        expect(page.find('#packet-scene').contains(page.find('[data-game-hud]'))).toBe(false);
        act(() => addScore(30));
        expect(page.find('[data-hud-score-value]').textContent).toBe('100');
        fireEvent.click(page.find('[data-hud-pause]'));
        expect(first.pause).toHaveBeenCalledOnce();
        first.emit({ paused: true, result: null });
        expect(canvas.closest('[inert]')).not.toBeNull();
        fireEvent.click(page.action('restart'));
        fireEvent.click(page.action('confirm'));
        await flushStart();
        expect(page.find('canvas')).not.toBe(canvas);
        expect(page.root.querySelectorAll('[data-game-hud]')).toHaveLength(1);
        act(() =>
            first.options.onDebugChange?.({
                enabled: true,
                collisionText: 'obsolete',
                runtimeText: 'stale',
            })
        );
        expect(page.find('#collision-debug-panel').hidden).toBe(true);
        act(() =>
            page.games[1].options.onDebugChange?.({
                enabled: true,
                collisionText: 'current tile',
                runtimeText: 'fps: 60.0',
            })
        );
        expect(page.find('#collision-debug-panel').textContent).toBe('current tile');
        page.unmount();
        expect(page.root.children).toHaveLength(0);
        expect(page.games[1].destroy).toHaveBeenCalledOnce();
    });
    it('places Tutorial below About in the main menu and keeps help free of practice controls', async () => {
        const page = setup();
        const help = page.action('help');
        const buttons = Array.from(help.parentElement!.children);
        expect(buttons[buttons.indexOf(help) + 1]).toBe(page.action('tutorial'));
        expect(help.textContent).toBe('About');
        expect(page.action('tutorial').textContent).toBe('Tutorial');
        fireEvent.click(page.action('help'));
        expect(
            page.root.querySelector('[data-action="try-out"],[data-action="tutorial"]')
        ).toBeNull();
        expect(page.createGame).not.toHaveBeenCalled();
        fireEvent.click(page.action('back'));
        fireEvent.click(page.action('start'));
        fireEvent.click(page.action('start-level'));
        await flushStart();
        page.games[0].emit({ paused: true, result: null });
        fireEvent.click(page.action('help'));
        expect(
            page.root.querySelector('[data-action="try-out"],[data-action="tutorial"]')
        ).toBeNull();
        expect(page.createGame).toHaveBeenCalledTimes(1);
    });

    it('opens About on Basics and changes sections immediately with arrow navigation', async () => {
        const dispose = vi.fn();
        const disposeBonuses = vi.fn();
        vi.mocked(mountEnemyPortraits).mockReturnValue(dispose);
        vi.mocked(mountScoreBonusPreviews).mockReturnValue(disposeBonuses);
        const page = setup();
        fireEvent.click(page.action('help'));
        expect(page.find('h1').textContent).toBe('ABOUT');
        const stepper = page.find('nav[aria-label="About sections"]');
        expect(page.find('[role="dialog"] header').nextElementSibling?.contains(stepper)).toBe(
            true
        );
        expect(stepper.querySelectorAll('button')).toHaveLength(3);
        expect(
            Array.from(stepper.querySelectorAll('button')).map((button) => button.textContent)
        ).toEqual(['Basics', 'Scoring', 'Enemies']);
        expect(page.action('help-basics').getAttribute('aria-current')).toBe('step');
        expect(page.action('help-basics').classList.contains('packet-primary')).toBe(true);
        expect(
            Array.from(page.root.querySelectorAll('dt')).map((node) => node.textContent)
        ).toEqual(['Move', 'Survive', 'Pause']);
        expect(page.root.querySelector('.packet-enemy')).toBeNull();
        expect(mountEnemyPortraits).not.toHaveBeenCalled();

        expect(page.key('ArrowDown').defaultPrevented).toBe(true);
        expect(page.document.activeElement).toBe(page.action('help-scoring'));
        expect(page.action('help-scoring').getAttribute('aria-current')).toBe('step');
        expect(page.action('help-basics').getAttribute('aria-current')).toBeNull();
        expect(page.action('help-scoring').classList.contains('packet-primary')).toBe(true);
        expect(
            Array.from(page.root.querySelectorAll('dt')).map((node) => node.textContent)
        ).toEqual(['Collect', 'Enemy bonuses', 'Later levels']);
        expect(page.find('#packet-help-content').textContent).toContain('1,600 points');
        expect(page.find('#packet-help-content').textContent).toContain('All five icons wait');
        expect(page.find('#packet-help-content').textContent).toContain('multiply its current value');
        expect(page.root.querySelectorAll('[data-bonus]')).toHaveLength(5);
        await flushStart();
        expect(mountScoreBonusPreviews).toHaveBeenCalledOnce();

        expect(page.key('ArrowRight').defaultPrevented).toBe(true);
        expect(page.document.activeElement).toBe(page.action('help-enemies'));
        await flushStart();
        expect(disposeBonuses).toHaveBeenCalledOnce();
        expect(page.action('help-enemies').getAttribute('aria-current')).toBe('step');
        expect(page.root.querySelectorAll('.packet-enemy')).toHaveLength(7);
        expect(page.root.querySelector('dl')).toBeNull();
        expect(mountEnemyPortraits).toHaveBeenCalledOnce();

        fireEvent.click(page.action('help-scoring'));
        expect(dispose).toHaveBeenCalledOnce();
        fireEvent.click(page.action('back'));
        fireEvent.click(page.action('help'));
        expect(page.action('help-basics').getAttribute('aria-current')).toBe('step');
        expect(page.createGame).not.toHaveBeenCalled();
    });

    it('opens practice paused on the demo map and keeps live objectives outside the menu', async () => {
        const page = setup([], 'default');
        fireEvent.click(page.action('tutorial'));
        await flushStart();
        const game = page.games[0];
        expect(game.options).toMatchObject({ mapVariant: 'demo', tutorialLesson: 'movement' });
        expect(page.screen()).toBe('tutorial');
        expect(page.find('.packet-tutorial-objective').hidden).toBe(true);
        page.key('Escape');
        expect(game.resume).not.toHaveBeenCalled();
        fireEvent.click(page.action('try-lesson'));
        expect(game.resume).toHaveBeenCalledOnce();
        game.emit(tutorialState('movement', 'playing'));
        const objective = page.find('.packet-tutorial-objective');
        expect(page.screen()).toBe('playing');
        expect(objective.hidden).toBe(false);
        expect(page.find('[data-screen]').contains(objective)).toBe(false);
        expect(objective.getAttribute('aria-live')).toBe('polite');
        const announcedCopy = objective.children[1];
        const movingMarker = tutorialState('movement', 'playing');
        game.emit({
            ...movingMarker,
            tutorial: { ...movingMarker.tutorial!, marker: { x: 8, y: 7 } },
        });
        expect(objective.children[1]).toBe(announcedCopy);
        game.emit(tutorialState('movement', 'playing', true));
        expect(page.screen()).toBe('paused');
        expect(objective.hidden).toBe(true);
        fireEvent.click(page.action('help'));
        expect(
            page.root.querySelector('[data-action="try-out"],[data-action="tutorial"]')
        ).toBeNull();
        fireEvent.click(page.action('back'));
        expect(page.screen()).toBe('paused');
        expect(game.resume).toHaveBeenCalledOnce();
        fireEvent.click(page.action('resume'));
        expect(game.resume).toHaveBeenCalledTimes(2);
    });

    it('uses Enter to continue tutorial explanations and retry failed lessons', async () => {
        const page = setup();
        fireEvent.click(page.action('tutorial'));
        await flushStart();
        const movement = page.games[0];
        const panel = page.find('[role="dialog"]');

        expect(page.key('Enter', panel).defaultPrevented).toBe(true);
        expect(movement.resume).toHaveBeenCalledOnce();

        movement.emit(tutorialState('movement', 'explanation'));
        expect(page.key('Enter', page.find('[role="dialog"]')).defaultPrevented).toBe(true);
        expect(movement.resume).toHaveBeenCalledTimes(2);

        movement.emit(tutorialState('movement', 'retry'));
        expect(page.key('Enter', page.find('[role="dialog"]')).defaultPrevented).toBe(true);
        await flushStart();
        expect(movement.destroy).toHaveBeenCalledOnce();
        expect(page.games[1].options.tutorialLesson).toBe('movement');
    });

    it('uses the development N shortcut to skip active practice to the next lesson', async () => {
        const page = setup();
        fireEvent.click(page.action('tutorial'));
        await flushStart();
        const movement = page.games[0];
        movement.emit(tutorialState('movement', 'playing'));
        const event = new KeyboardEvent('keydown', {
            key: 'n',
            code: 'KeyN',
            repeat: false,
            bubbles: true,
            cancelable: true,
        });

        fireEvent(page.find('canvas'), event);
        expect(event.defaultPrevented).toBe(true);
        await flushStart();
        expect(movement.pause).toHaveBeenCalledOnce();
        expect(movement.destroy).toHaveBeenCalledOnce();
        expect(page.games[1].options.tutorialLesson).toBe('firewall');
    });

    it('keeps a retry checkpoint paused through keyboard shortcuts', async () => {
        const page = setup();
        fireEvent.click(page.action('tutorial'));
        await flushStart();
        page.games[0].emit(tutorialState('movement', 'retry'));
        page.key('Escape');
        page.key(' ', page.find('[role="dialog"]'));
        expect(page.screen()).toBe('tutorial');
        expect(page.games[0].resume).not.toHaveBeenCalled();
        fireEvent.click(page.action('retry-lesson'));
        await flushStart();
        expect(page.games[0].destroy).toHaveBeenCalledOnce();
        expect(page.games[1].options.tutorialLesson).toBe('movement');
        expect(page.screen()).toBe('tutorial');
    });

    it('automatically advances all lessons with fresh runtimes and starts the configured normal map', async () => {
        const page = setup([], 'default');
        fireEvent.click(page.action('tutorial'));
        await flushStart();
        for (const [index, lesson] of TUTORIAL_LESSONS.entries()) {
            const game = page.games[index];
            expect(game.options.tutorialLesson).toBe(lesson.id);
            game.emit(tutorialState(lesson.id, 'success'));
            await flushStart();
            if (index < TUTORIAL_LESSONS.length - 1) {
                expect(game.destroy).toHaveBeenCalledOnce();
                game.emit(tutorialState(lesson.id, 'retry'));
                expect(page.find('[data-tutorial-phase]').getAttribute('data-tutorial-phase')).toBe(
                    'introduction'
                );
            }
        }
        expect(page.screen()).toBe('tutorial-complete');
        expect(page.action('exit-tutorial').textContent).toBe('Back to main menu');
        expect(page.store.getRecentRecords('demo')).toEqual([]);
        expect(page.store.getRecentRecords('default')).toEqual([]);
        expect(page.storage.setItem).not.toHaveBeenCalled();
        fireEvent.click(page.action('start'));
        await flushStart();
        expect(page.games[TUTORIAL_LESSONS.length].options).toMatchObject({
            mapVariant: 'default',
        });
        expect(page.games[TUTORIAL_LESSONS.length].options.tutorialLesson).toBeUndefined();
        expect(page.screen()).toBe('playing');
    });

    it('retries a failed lesson startup and returns to the main menu with Tutorial focused on exit', async () => {
        const loading = pendingStart();
        const page = setup([Promise.resolve(), loading.promise]);
        fireEvent.click(page.action('tutorial'));
        await flushStart();
        page.games[0].emit(tutorialState('movement', 'success'));
        loading.reject(new Error('Lesson could not load'));
        await flushStart();
        expect(page.screen()).toBe('error');
        fireEvent.click(page.action('retry'));
        await flushStart();
        expect(page.games[2].options.tutorialLesson).toBe('firewall');
        fireEvent.click(page.action('exit-tutorial'));
        expect(page.screen()).toBe('title');
        expect(page.document.activeElement).toBe(page.action('tutorial'));
        expect(page.games[2].destroy).toHaveBeenCalledOnce();
    });

    it('cancels a loading tutorial without accepting later startup or result callbacks', async () => {
        const loading = pendingStart();
        const page = setup([loading.promise]);
        fireEvent.click(page.action('tutorial'));
        const cancelled = page.games[0];
        fireEvent.click(page.action('exit-tutorial'));
        cancelled.emit({ ...tutorialState('movement', 'success'), result: loss });
        loading.resolve();
        await flushStart();
        expect(page.screen()).toBe('title');
        expect(page.document.activeElement).toBe(page.action('tutorial'));
        expect(cancelled.destroy).toHaveBeenCalledOnce();
        expect(page.storage.setItem).not.toHaveBeenCalled();
    });

    it('keeps one ambient layer across menu navigation, settings changes, gameplay and results', async () => {
        const page = setup();
        await flushStart();
        const ambient = page.find('.packet-ambient');
        const digits = [...ambient.children];
        const viewport = page.find('.packet-menu-viewport');
        expect(ambient.getAttribute('aria-hidden')).toBe('true');
        expect(viewport.contains(ambient)).toBe(false);

        for (const action of ['help', 'settings', 'profile', 'start']) {
            viewport.scrollTop = 200;
            fireEvent.click(page.action(action));
            expect(page.find('.packet-ambient')).toBe(ambient);
            expect(Array.from(ambient.children)).toEqual(digits);
            expect(viewport.scrollTop).toBe(0);
            if (action === 'settings') {
                const motion = page.find<HTMLButtonElement>('[data-control="motion"]');
                fireEvent.click(motion);
                page.key('End', motion);
                page.key('Enter', motion);
                expect(page.find('.packet-ambient')).toBe(ambient);
                expect(page.find('.game-shell').getAttribute('data-menu-motion')).toBe('full');
            }
            fireEvent.click(page.action('back'));
            await flushStart();
        }
        fireEvent.click(page.action('start'));
        fireEvent.click(page.action('start-level'));
        await flushStart();
        expect(page.find('[data-screen]').hidden).toBe(true);
        expect(page.find('.packet-ambient')).toBe(ambient);
        page.games[0].emit({ paused: true, result: null });
        fireEvent.click(page.action('help'));
        page.key('Escape');
        page.games[0].emit({ paused: true, result: loss });
        expect(page.find('[data-screen]').hidden).toBe(false);
        expect(page.find('.packet-ambient')).toBe(ambient);
        page.unmount();
        expect(page.root.contains(ambient)).toBe(false);
    });

    it.each(['settings', 'help', 'profile'])(
        'uses the shared header Back control in %s and restores parent focus',
        async (screen) => {
            const page = setup();
            await flushStart();
            fireEvent.click(page.action(screen));
            const back = page.action('back');
            expect(page.find('[role="dialog"] header').contains(back)).toBe(true);
            expect(back.closest('header')).not.toBeNull();
            expect(page.root.querySelectorAll('[data-action="back"]')).toHaveLength(1);
            expect(back.getAttribute('aria-label')).toBe('Back');
            expect(back.querySelector('span')?.getAttribute('aria-hidden')).toBe('true');
            expect(page.find('[role="dialog"]').getAttribute('aria-labelledby')).toBe(
                page.find('h1').id
            );
            page.key('Tab');
            expect(page.document.activeElement).toBe(back);
            expect(page.key(' ', back).defaultPrevented).toBe(false);
            fireEvent.click(back);
            expect(page.screen()).toBe('title');
            expect(page.document.activeElement).toBe(page.action(screen));
        }
    );

    it.each(['title', 'paused'] as const)(
        'opens animated enemy guidance from %s and releases it on Back',
        async (parent) => {
            const dispose = vi.fn();
            vi.mocked(mountEnemyPortraits).mockReturnValue(dispose);
            const page = setup();
            fireEvent.click(page.action('settings'));
            const motion = page.find<HTMLButtonElement>('[data-control="motion"]');
            fireEvent.click(motion);
            fireEvent.click(page.find('[role="option"][data-value="reduced"]'));
            fireEvent.click(page.action('back'));
            if (parent === 'paused') {
                fireEvent.click(page.action('start'));
                fireEvent.click(page.action('start-level'));
                await flushStart();
                page.games[0].emit({ paused: true, result: null });
            }
            fireEvent.click(page.action('help'));
            fireEvent.click(page.action('help-enemies'));
            await flushStart();
            expect(page.find('h1').textContent).toBe('ABOUT');
            expect(
                Array.from(page.root.querySelectorAll('h3')).map((node) => node.textContent)
            ).toEqual(['Firewall', 'Virus', 'Ping', 'Spam', 'Lag', 'Quarantine', 'Trojan']);
            const guide = page.find('[aria-labelledby="packet-enemies-heading"]');
            expect(guide.getAttribute('aria-labelledby')).toBe('packet-enemies-heading');
            expect(guide.querySelectorAll('ul')).toHaveLength(2);
            expect(mountEnemyPortraits).toHaveBeenCalledExactlyOnceWith(guide, 'reduced');
            for (const preview of guide.querySelectorAll('[data-enemy]')) {
                expect(preview.querySelector('img')?.src).toContain(
                    `/enemies/${preview.getAttribute('data-enemy')}.png`
                );
            }
            if (parent === 'title') expect(page.createGame).not.toHaveBeenCalled();
            else expect(page.games[0].resume).not.toHaveBeenCalled();
            page.key('Escape');
            expect(page.screen()).toBe(parent);
            expect(page.document.activeElement).toBe(page.action('help'));
            expect(dispose).toHaveBeenCalledOnce();
            page.unmount();
            expect(dispose).toHaveBeenCalledOnce();
        }
    );

    it('ignores a delayed portrait import after leaving help or destroying the shell', async () => {
        const page = setup();
        await flushStart();
        fireEvent.click(page.action('help'));
        fireEvent.click(page.action('help-enemies'));
        fireEvent.click(page.action('back'));
        await flushStart();
        expect(mountEnemyPortraits).not.toHaveBeenCalled();
        fireEvent.click(page.action('help'));
        fireEvent.click(page.action('help-enemies'));
        page.unmount();
        await flushStart();
        expect(mountEnemyPortraits).not.toHaveBeenCalled();
    });

    it('keeps all enemy descriptions and fallback portraits when previews cannot initialize', async () => {
        vi.mocked(mountEnemyPortraits).mockImplementationOnce(() => {
            throw new Error('WebGL unavailable');
        });
        const page = setup();
        fireEvent.click(page.action('help'));
        fireEvent.click(page.action('help-enemies'));
        await flushStart();
        expect(page.screen()).toBe('help');
        expect(page.root.querySelectorAll('.packet-enemy-name')).toHaveLength(7);
        expect(
            Array.from(page.root.querySelectorAll<HTMLImageElement>('img')).map(
                (portrait) => portrait.alt
            )
        ).toEqual(['Firewall enemy', 'Virus enemy', 'Ping enemy', 'Spam enemy', 'Lag enemy', 'Quarantine enemy', 'Trojan enemy']);
        fireEvent.click(page.action('back'));
        expect(page.screen()).toBe('title');
        expect(page.createGame).not.toHaveBeenCalled();
    });

    it('mounts the title with the current motion preference and releases it when leaving', async () => {
        const dispose = vi.fn();
        vi.mocked(mountTitleWordmark).mockReturnValue(dispose);
        const page = setup();
        await flushStart();
        const host = page.find('.packet-wordmark');
        expect(mountTitleWordmark).toHaveBeenCalledWith(host, 'system');
        expect(host.getAttribute('data-ready')).toBe('true');
        expect(page.find('h1').textContent).toBe('PACKETLOSS');
        expect(page.createGame).not.toHaveBeenCalled();
        fireEvent.click(page.action('settings'));
        expect(dispose).toHaveBeenCalledOnce();
        const motion = page.find<HTMLButtonElement>('[data-control="motion"]');
        fireEvent.click(motion);
        fireEvent.click(page.find('[role="option"][data-value="reduced"]'));
        fireEvent.click(page.action('back'));
        await flushStart();
        expect(mountTitleWordmark).toHaveBeenLastCalledWith(
            page.find('.packet-wordmark'),
            'reduced'
        );
        page.unmount();
        expect(dispose).toHaveBeenCalledTimes(2);
    });

    it('does not mount a delayed title import after navigation or shell destruction', async () => {
        const page = setup();
        fireEvent.click(page.action('settings'));
        await flushStart();
        expect(mountTitleWordmark).not.toHaveBeenCalled();
        fireEvent.click(page.action('back'));
        page.unmount();
        await flushStart();
        expect(mountTitleWordmark).not.toHaveBeenCalled();
    });

    it('keeps the text title and menu usable when the 3D title fails or loses its context', async () => {
        vi.mocked(mountTitleWordmark).mockImplementationOnce(() => {
            throw new Error('WebGL unavailable');
        });
        const page = setup();
        await flushStart();
        expect(page.find('.packet-wordmark').getAttribute('data-ready')).toBeNull();
        expect(page.find('h1').textContent).toBe('PACKETLOSS');
        fireEvent.click(page.action('settings'));
        fireEvent.click(page.action('back'));
        await flushStart();
        const host = page.find('.packet-wordmark');
        expect(host.getAttribute('data-ready')).toBe('true');
        fireEvent(host, new Event('packet-wordmark-unavailable'));
        expect(host.getAttribute('data-ready')).toBeNull();
        fireEvent.click(page.action('start'));
        fireEvent.click(page.action('start-level'));
        await flushStart();
        expect(page.screen()).toBe('playing');
    });

    it('opens the title without creating a runtime and starts exactly once during loading', async () => {
        const pending = pendingStart();
        const page = setup([pending.promise]);
        expect(page.screen()).toBe('title');
        expect(page.find('h1').textContent).toBe('PACKETLOSS');
        expect(page.createGame).not.toHaveBeenCalled();

        const start = page.action('start');
        fireEvent.click(start);
        fireEvent.click(start);
        expect(page.screen()).toBe('mode');
        expect(page.createGame).not.toHaveBeenCalled();
        const endless = page.action('start-endless');
        fireEvent.click(endless);
        fireEvent.click(endless);
        expect(page.screen()).toBe('loading');
        expect(page.createGame).toHaveBeenCalledOnce();
        expect(page.games[0].start).toHaveBeenCalledOnce();
        expect(page.games[0].options).toMatchObject({
            mountId: 'packet-scene',
            mapVariant: 'demo',
            mode: 'endless',
        });
        expect(typeof page.games[0].options.onStateChange).toBe('function');
        expect(page.find('[role="status"]').textContent).toBe('Preparing your run…');

        pending.resolve();
        await flushStart();
        expect(page.screen()).toBe('playing');
        expect(page.find('[data-screen]').hidden).toBe(true);
    });

    it.each(['resolve', 'reject'] as const)(
        'cancels loading and ignores a late %s or callback after a new run',
        async (completion) => {
            const pending = pendingStart();
            const page = setup([pending.promise]);
            fireEvent.click(page.action('start'));
            fireEvent.click(page.action('start-level'));
            const cancelled = page.games[0];
            fireEvent.click(page.action('main-menu'));
            expect(cancelled.destroy).toHaveBeenCalledOnce();
            expect(page.screen()).toBe('title');
            fireEvent.click(page.action('start'));
            fireEvent.click(page.action('start-level'));
            await flushStart();
            expect(page.screen()).toBe('playing');

            if (completion === 'resolve') pending.resolve();
            else pending.reject(new Error('Late loading failure'));
            cancelled.emit({ paused: false, result: loss });
            await flushStart();
            expect(page.screen()).toBe('playing');
            expect(page.games[1].destroy).not.toHaveBeenCalled();
            expect(page.store.getRecentRecords('demo')).toEqual([]);
        }
    );

    it('shows a startup error and retries with a fresh runtime', async () => {
        const pending = pendingStart();
        const page = setup([pending.promise]);
        fireEvent.click(page.action('start'));
        fireEvent.click(page.action('start-level'));
        pending.reject(new Error('WebGL 2 is required.'));
        await flushStart();
        expect(page.screen()).toBe('error');
        expect(page.find('[role="alert"]').textContent).toBe('WebGL 2 is required.');
        expect(page.games[0].destroy).toHaveBeenCalledOnce();

        fireEvent.click(page.action('retry'));
        await flushStart();
        expect(page.screen()).toBe('playing');
        expect(page.createGame).toHaveBeenCalledTimes(2);
    });

    it('keeps submenu navigation paused, restores focus, and resumes only through an explicit action', async () => {
        const page = setup();
        fireEvent.click(page.action('start'));
        fireEvent.click(page.action('start-level'));
        await flushStart();
        const game = page.games[0];
        game.emit({ paused: true, result: null });
        expect(page.screen()).toBe('paused');
        fireEvent.click(page.find('[data-screen]'));
        expect(game.resume).not.toHaveBeenCalled();

        fireEvent.click(page.action('settings'));
        expect(page.screen()).toBe('settings');
        expect(game.pause).toHaveBeenCalled();
        expect(page.action('sound').disabled).toBe(true);
        expect(page.root.querySelector('[data-action="fullscreen"]')).toBeNull();
        expect(page.root.querySelector('select')).toBeNull();
        const motion = page.find<HTMLButtonElement>('[data-control="motion"]');
        fireEvent.click(motion);
        fireEvent.click(page.find('[role="option"][data-value="reduced"]'));
        expect(page.store.getMotion()).toBe('reduced');
        expect(page.find('.game-shell').getAttribute('data-menu-motion')).toBe('reduced');
        page.key('Escape');
        expect(page.screen()).toBe('paused');
        expect(page.document.activeElement).toBe(page.action('settings'));
        expect(game.resume).not.toHaveBeenCalled();
        fireEvent.click(page.action('resume'));
        expect(game.resume).toHaveBeenCalledOnce();
        expect(page.screen()).toBe('playing');
    });

    it('reflects actual fullscreen state and keeps settings usable when a request is rejected', async () => {
        const page = setup();
        const fullscreen = Object.assign(page.document, {
            fullscreenEnabled: true,
            fullscreenElement: null as HTMLElement | null,
            exitFullscreen: vi.fn(() => Promise.resolve()),
        });
        const requestFullscreen = vi.fn(() => Promise.resolve());
        Object.assign(page.find('.game-shell'), { requestFullscreen });
        fireEvent.click(page.action('settings'));
        expect(page.action('fullscreen').textContent).toBe('Enter fullscreen');
        fireEvent.click(page.action('fullscreen'));
        await flushStart();
        expect(requestFullscreen).toHaveBeenCalledOnce();
        expect(page.action('fullscreen').textContent).toBe('Enter fullscreen');

        fullscreen.fullscreenElement = page.root;
        fireEvent(fullscreen, new Event('fullscreenchange'));
        expect(page.action('fullscreen').textContent).toBe('Exit fullscreen');
        fireEvent.click(page.action('fullscreen'));
        await flushStart();
        expect(fullscreen.exitFullscreen).toHaveBeenCalledOnce();
        fullscreen.fullscreenElement = null;
        fireEvent(fullscreen, new Event('fullscreenchange'));
        expect(page.action('fullscreen').textContent).toBe('Enter fullscreen');
        expect(page.storage.setItem).not.toHaveBeenCalled();

        requestFullscreen.mockRejectedValueOnce(new Error('Browser denied fullscreen'));
        fireEvent.click(page.action('fullscreen'));
        await flushStart();
        expect(page.screen()).toBe('settings');
        expect(page.find('[role="status"]').textContent).toContain('Fullscreen is unavailable');
        fireEvent.click(page.action('back'));
        expect(page.screen()).toBe('title');
    });

    it('keeps a completed result in memory and reports when saving fails', async () => {
        const page = setup();
        page.storage.setItem.mockImplementation(() => {
            throw new Error('Storage blocked');
        });
        fireEvent.click(page.action('start'));
        fireEvent.click(page.action('start-level'));
        await flushStart();
        page.games[0].emit({ paused: false, result: loss });
        expect(page.screen()).toBe('result');
        expect(page.store.getRecentRecords('demo')).toMatchObject([{ ...loss, id: 'run-1' }]);
        expect(page.find('[role="status"]').textContent).toContain('this visit only');
        const copy = Array.from(page.root.querySelectorAll('p'))
            .map((node) => node.textContent)
            .join('\n');
        expect(copy).not.toContain('saved on this device');
        fireEvent.click(page.action('main-menu'));
        fireEvent.click(page.action('profile'));
        expect(page.find('.packet-record-name').textContent).toContain('PLAYER');
    });

    it('requires confirmation before restarting or abandoning an unfinished run', async () => {
        const page = setup();
        fireEvent.click(page.action('start'));
        fireEvent.click(page.action('start-level'));
        await flushStart();
        const firstGame = page.games[0];
        firstGame.emit({ paused: true, result: null });
        fireEvent.click(page.action('restart'));
        expect(page.screen()).toBe('confirm');
        fireEvent.click(page.action('cancel'));
        expect(page.screen()).toBe('paused');
        expect(page.document.activeElement).toBe(page.action('restart'));
        expect(firstGame.destroy).not.toHaveBeenCalled();
        fireEvent.click(page.action('restart'));
        fireEvent.click(page.action('confirm'));
        await flushStart();
        expect(firstGame.destroy).toHaveBeenCalledOnce();
        expect(page.games).toHaveLength(2);
        expect(page.screen()).toBe('playing');

        page.games[1].emit({ paused: true, result: null });
        fireEvent.click(page.action('main-menu'));
        expect(page.screen()).toBe('confirm');
        fireEvent.click(page.action('confirm'));
        expect(page.screen()).toBe('title');
        expect(page.games[1].destroy).toHaveBeenCalledOnce();
        expect(page.store.getRecentRecords('demo')).toEqual([]);
    });

    it('shows a final loss and saves the cumulative run once with its starting nickname', async () => {
        const page = setup();
        page.store.setNickname('START NAME');
        fireEvent.click(page.action('start'));
        fireEvent.click(page.action('start-level'));
        await flushStart();
        page.store.setNickname('LATER NAME');
        const game = page.games[0];
        game.emit({ paused: false, result: loss });
        game.emit({ paused: false, result: loss });
        expect(page.screen()).toBe('result');
        expect(page.find('h1').textContent).toBe('PACKET LOST');
        expect(page.find('[data-outcome]').getAttribute('data-outcome')).toBe('lost');
        expect(
            Array.from(page.find('dl').querySelectorAll('dd')).map((node) => node.textContent)
        ).toEqual(['140', '2', '14 / 50', '1:04']);
        expect(page.store.getRecentRecords('demo')).toMatchObject([
            {
                ...loss,
                id: 'run-1',
                nickname: 'START NAME',
                map: 'demo',
            },
        ]);
        expect(page.storage.setItem).toHaveBeenCalledTimes(3);

        page.key(' ');
        game.emit({ paused: false, result: null });
        expect(page.screen()).toBe('result');
        expect(game.resume).not.toHaveBeenCalled();
        fireEvent.click(page.action('main-menu'));
        expect(page.screen()).toBe('title');
        expect(game.destroy).toHaveBeenCalledOnce();
    });

    it('starts, replays, and restarts endless without mixing its result with classic records', async () => {
        const page = setup();
        fireEvent.click(page.action('start'));
        fireEvent.click(page.action('start-endless'));
        await flushStart();
        expect(page.games[0].options.mode).toBe('endless');
        expect(page.games[0].options.mapVariant).toBe('demo');
        const endlessResult: RunResult = { ...loss, mode: 'endless', score: 850,
            pointsCollected: 27, totalPoints: 27, levelsCleared: 0 };
        page.games[0].emit({ paused: false, result: endlessResult });
        expect(page.screen()).toBe('result');
        expect(Array.from(page.find('dl').querySelectorAll('dd'), (node) => node.textContent))
            .toEqual(['850', '27', '1:04']);
        expect(page.root.textContent).not.toContain('Levels cleared');
        expect(page.store.getTopRecords('default', 'endless')[0]).toMatchObject(endlessResult);
        expect(page.store.getTopRecords('demo')).toEqual([]);

        fireEvent.click(page.action('replay'));
        await flushStart();
        expect(page.games[1].options.mode).toBe('endless');
        page.games[1].emit({ paused: true, result: null });
        fireEvent.click(page.action('restart'));
        fireEvent.click(page.action('confirm'));
        await flushStart();
        expect(page.games[2].options.mode).toBe('endless');
    });

    it('switches the profile record list between classic and endless runs', () => {
        const page = setup();
        page.store.saveRun({ ...loss, id: 'classic', map: 'demo', nickname: 'CLASSIC',
            completedAt: '2026-09-13T12:00:00Z', mode: 'classic' });
        page.store.saveRun({ ...loss, id: 'endless', map: 'default', nickname: 'ENDLESS',
            completedAt: '2026-09-14T12:00:00Z', mode: 'endless', pointsCollected: 32,
            totalPoints: 32 });
        fireEvent.click(page.action('profile'));
        expect(page.root.textContent).toContain('CLASSIC');
        expect(page.root.textContent).not.toContain('ENDLESS');
        fireEvent.click(page.find('[data-control="records-mode"]'));
        fireEvent.click(page.find('[role="option"][data-value="endless"]'));
        expect(page.root.textContent).toContain('ENDLESS');
        expect(page.root.textContent).toContain('32 bits');
        expect(page.root.textContent).not.toContain('CLASSIC');
    });

    it('continues clear checkpoints without saving and confirms before abandoning one', async () => {
        const page = setup();
        fireEvent.click(page.action('start'));
        fireEvent.click(page.action('start-level'));
        await flushStart();
        const game = page.games[0];
        const levelClear: LevelClearCheckpoint = {
            level: 1,
            score: 140,
            lives: 2,
            elapsedMs: 64_500,
            pointsCollected: 50,
            totalPoints: 50,
            nextMultiplier: 1.25,
        };

        game.emit({ paused: true, result: null, levelClear });

        expect(page.screen()).toBe('result');
        expect(page.find('h1').textContent).toBe('MAZE CLEARED');
        expect(page.find('[data-outcome]').getAttribute('data-outcome')).toBe('cleared');
        expect(page.root.textContent).toContain('GAME IS NOW SPED UP AND SCORING IS INCREASED');
        expect(page.root.textContent).not.toContain('Next level runs');
        expect(page.root.querySelector('dl')).toBeNull();
        expect(page.store.getRecentRecords('demo')).toEqual([]);
        page.key(' ');
        expect(game.resume).not.toHaveBeenCalled();

        fireEvent.click(page.action('continue-level'));
        expect(game.continueLevel).toHaveBeenCalledOnce();
        game.emit({ paused: false, result: null });
        expect(page.screen()).toBe('playing');

        game.emit({
            paused: true,
            result: null,
            levelClear: { ...levelClear, level: 2, nextMultiplier: 1.5625 },
        });
        fireEvent.click(page.action('main-menu'));
        expect(page.screen()).toBe('confirm');
        expect(page.root.textContent).toContain('will not be saved');
        fireEvent.click(page.action('cancel'));
        expect(page.screen()).toBe('result');
        expect(page.store.getRecentRecords('demo')).toEqual([]);
    });

    it('saves profile text through its form and clears records only after confirmation', () => {
        const page = setup();
        page.store.saveRun({
            ...loss,
            id: 'past',
            nickname: '<b>OLD</b>',
            map: 'demo',
            completedAt: '2026-09-13T12:00:00Z',
        });
        fireEvent.click(page.action('profile'));
        const nickname = page.find<HTMLInputElement>('[data-control="nickname"]');
        fireEvent.change(nickname, { target: { value: ' <b>ME</b> ' } });
        expect(page.key('ArrowDown', nickname).defaultPrevented).toBe(false);
        const typed = page.key(' ', nickname);
        expect(typed.defaultPrevented).toBe(false);
        const submit = new Event('submit', { cancelable: true, bubbles: true });
        fireEvent(page.find('form'), submit);
        expect(submit.defaultPrevented).toBe(true);
        expect(page.store.getNickname()).toBe('<b>ME</b>');
        expect(page.find<HTMLInputElement>('[data-control="nickname"]').value).toBe('<b>ME</b>');
        expect(page.find('.packet-record-name').textContent).toContain('1. <b>OLD</b>');
        expect(page.root.querySelector('b')).toBeNull();
        expect(page.document.activeElement).toBe(
            page.find<HTMLInputElement>('[data-control="nickname"]')
        );

        fireEvent.click(page.action('clear-records'));
        expect(page.store.getRecentRecords('demo')).toHaveLength(1);
        page.key('Escape');
        expect(page.screen()).toBe('profile');
        fireEvent.click(page.action('clear-records'));
        fireEvent.click(page.action('confirm'));
        expect(page.store.getRecentRecords('demo')).toEqual([]);
        expect(page.store.getNickname()).toBe('<b>ME</b>');
        fireEvent.click(page.action('back'));
        expect(page.screen()).toBe('title');
        expect(page.find('[data-identity]').querySelector('span')?.textContent).toBe('<b>ME</b>');
    });

    it('contains keyboard focus and preserves native button keys before supporting pause shortcuts', async () => {
        const page = setup();
        expect(page.document.activeElement).toBe(page.find('[role="dialog"]'));
        expect(page.key('Tab').defaultPrevented).toBe(true);
        expect(page.document.activeElement).toBe(page.action('start'));
        page.key('Tab', undefined, true);
        expect(page.document.activeElement).toBe(page.action('tutorial'));
        page.key('Tab');
        expect(page.document.activeElement).toBe(page.action('start'));
        fireEvent.click(page.action('start'));
        fireEvent.click(page.action('start-level'));
        await flushStart();
        const game = page.games[0];
        game.emit({ paused: true, result: null });
        const settings = page.action('settings');
        settings.focus();
        expect(page.key('Enter', settings).defaultPrevented).toBe(false);
        expect(game.resume).not.toHaveBeenCalled();
        expect(page.key(' ', settings).defaultPrevented).toBe(false);
        expect(game.resume).not.toHaveBeenCalled();
        fireEvent.click(settings);
        expect(page.screen()).toBe('settings');
        expect(page.action('back').classList.contains('packet-primary')).toBe(true);
        page.key('Tab');
        expect(page.document.activeElement).toBe(page.action('back'));
        page.key('Escape');
        page.find('[role="dialog"]').focus();
        expect(page.key(' ').defaultPrevented).toBe(true);
        expect(game.resume).toHaveBeenCalledOnce();
        expect(page.screen()).toBe('playing');
    });

    it('disposes once and ignores startup completion and keyboard events after destruction', async () => {
        const pending = pendingStart();
        const page = setup([pending.promise]);
        fireEvent.click(page.action('start'));
        fireEvent.click(page.action('start-level'));
        page.unmount();
        page.unmount();
        pending.resolve();
        page.games[0].emit({ paused: false, result: loss });
        await flushStart();
        page.key('Escape');
        expect(page.root.children).toHaveLength(0);
        expect(page.games[0].destroy).toHaveBeenCalledOnce();
        expect(page.games[0].resume).not.toHaveBeenCalled();
        expect(page.store.getRecentRecords('demo')).toEqual([]);
    });
});
