import { useEffect, useRef, useState } from 'react';
import { IS_DEV } from '../../config/environment';
import { useEnvironment } from '../../config/EnvironmentContext';
import type { CreatePacketGameOptions } from '../app/createPacketGame';
import type { LevelClearCheckpoint, PacketGame, RunResult, RuntimeState } from '../app/contracts';
import type { MapVariant } from '../app/mapRuntimeConfig';
import type { PreloadedGameResources } from '../app/preloadGameResources';
import { LocalProfileStore } from '../infrastructure/adapters/LocalProfileStore';
import { EMPTY_DEBUG, type DebugSnapshot } from '../shared/events/DebugSnapshot';
import {
    getTutorialLesson,
    TUTORIAL_LESSONS,
    type TutorialLessonId,
    type TutorialSnapshot,
} from '../tutorial/TutorialLesson';
import { createDebugStore } from './debugStore';

export type Screen =
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

export interface GameShellOptions {
    mapVariant: MapVariant;
    store?: LocalProfileStore;
    createGame?: (_options: CreatePacketGameOptions) => PacketGame;
    preloadedResources?: PreloadedGameResources;
}

interface ShellState {
    screen: Screen;
    parentScreen: 'title' | 'paused';
    returnAction: string;
    confirmation: {
        message: string;
        action: () => void;
        parent: Screen;
        returnAction: string;
    } | null;
    hasGame: boolean;
    ready: boolean;
    result: RunResult | null;
    levelClear: LevelClearCheckpoint | null;
    tutorial: TutorialSnapshot | null;
    tutorialLesson: TutorialLessonId | null;
    newBest: boolean;
    errorMessage: string;
    focusTarget: string | null;
    navigation: number;
}

/**
 * Owns browser menus and run lifetime; gameplay remains inside PacketGame.
 * Invalidates pending startup work and destroys the current game on effect cleanup.
 *
 * @param options - Map selection and optional profile store or game factory overrides.
 * @returns Menu state, profile/debug stores, and actions for navigating or controlling a run.
 */
export function useGameSession(options: GameShellOptions) {
    const { isDev } = useEnvironment();
    const [store] = useState(() => options.store ?? new LocalProfileStore());
    const [debug] = useState(() => (IS_DEV && isDev ? createDebugStore() : null));
    const [state, setState] = useState<ShellState>({
        screen: 'title',
        parentScreen: 'title',
        returnAction: '',
        confirmation: null,
        hasGame: false,
        ready: false,
        result: null,
        levelClear: null,
        tutorial: null,
        tutorialLesson: null,
        newBest: false,
        errorMessage: '',
        focusTarget: null,
        navigation: 0,
    });
    // Runtime callbacks and repeated clicks must see transitions before React commits them.
    const current = useRef(state);
    const lifetime = useRef({ active: false, generation: 0, game: null as PacketGame | null });

    useEffect(() => {
        const owner = lifetime.current;
        owner.active = true;
        return () => {
            owner.active = false;
            owner.generation += 1;
            owner.game?.destroy();
            owner.game = null;
            options.preloadedResources?.dispose();
            debug?.publish(EMPTY_DEBUG);
        };
    }, [debug, options.preloadedResources]);

    /** Applies state immediately for runtime callbacks, then schedules React's update if active. */
    function update(patch: Partial<ShellState>) {
        if (!lifetime.current.active) return;
        current.current = { ...current.current, ...patch };
        setState(current.current);
    }

    /**
     * Changes the visible screen and signals that focus and menu scroll should be restored.
     *
     * @param screen - Destination screen.
     * @param focusTarget - Menu CSS selector to focus, or null to focus the panel.
     * @param patch - Additional state changes applied with the navigation.
     */
    function show(
        screen: Screen,
        focusTarget: string | null = null,
        patch: Partial<ShellState> = {}
    ) {
        update({ ...patch, screen, focusTarget, navigation: current.current.navigation + 1 });
    }

    /** Invalidates callbacks before destroying the current game and clearing its diagnostics. */
    function disposeRun() {
        const owner = lifetime.current;
        owner.generation += 1;
        owner.game?.destroy();
        owner.game = null;
        debug?.publish(EMPTY_DEBUG);
    }

    /**
     * Maps runtime notifications to menus and persists each final normal loss once.
     * Level-clear checkpoints remain attached to the active run and are not stored.
     * Tutorial notifications update practice state without saving a run record and advance successes immediately.
     *
     * @param runtime - State reported by the current game.
     * @param id - Identifier captured when this run started.
     * @param nickname - Player name captured at startup so later edits do not change the record.
     */
    function receiveState(runtime: RuntimeState, id: string, nickname: string) {
        const view = current.current;
        if (view.tutorialLesson) {
            if (!runtime.tutorial || runtime.tutorial.lesson !== view.tutorialLesson) return;
            if (runtime.tutorial.phase === 'success') {
                nextLesson();
                return;
            }
            update({ tutorial: runtime.tutorial });
            if (runtime.tutorial.phase !== 'playing') show('tutorial');
            else if (runtime.paused) {
                if (view.screen === 'playing' || view.screen === 'loading') show('paused');
            } else if (
                view.screen !== 'playing' ||
                view.tutorial?.objective !== runtime.tutorial.objective
            )
                show('playing');
            return;
        }
        if (runtime.result) {
            if (view.result) return;
            const best = store.getTopRecords(options.mapVariant)[0];
            store.saveRun({
                ...runtime.result,
                id,
                nickname,
                map: options.mapVariant,
                completedAt: new Date().toISOString(),
            });
            show('result', null, {
                result: runtime.result,
                levelClear: null,
                newBest: !best || runtime.result.score > best.score,
            });
        } else if (runtime.levelClear) {
            show('result', null, {
                result: null,
                levelClear: runtime.levelClear,
                newBest: false,
            });
        } else if (runtime.paused) {
            if (view.screen === 'playing' || view.screen === 'loading') show('paused');
        } else if (!view.result) show('playing', null, { levelClear: null });
    }

    /**
     * Replaces the current run and starts loading, ignoring repeated requests during startup.
     * Late callbacks from replaced runs are ignored; startup failures open the error screen.
     *
     * @param tutorialLesson - Practice lesson to start, or omit for a normal run on the chosen map.
     */
    function startRun(tutorialLesson?: TutorialLessonId) {
        const owner = lifetime.current;
        if (!owner.active || current.current.screen === 'loading') return;
        disposeRun();
        const generation = owner.generation;
        const id =
            globalThis.crypto?.randomUUID?.() ??
            `${Date.now()}-${generation}-${Math.random().toString(36).slice(2)}`;
        const nickname = store.getNickname();
        const tutorial: TutorialSnapshot | null = tutorialLesson
            ? {
                  lesson: tutorialLesson,
                  phase: 'introduction',
                  objective: getTutorialLesson(tutorialLesson).objective,
                  message: getTutorialLesson(tutorialLesson).introduction,
                  marker: null,
              }
            : null;
        show('loading', null, {
            hasGame: false,
            ready: false,
            result: null,
            levelClear: null,
            tutorialLesson: tutorialLesson ?? null,
            tutorial,
            newBest: false,
        });
        /** Checks that this startup attempt still belongs to the mounted session. */
        const valid = () => owner.active && owner.generation === generation;
        /**
         * Loads and starts the game while guarding asynchronous boundaries against cancellation.
         *
         * @returns A promise that settles after startup or cancellation; rejects on startup failure.
         */
        async function initialize() {
            const createGame =
                options.createGame ?? (await import('../app/createPacketGame')).createPacketGame;
            if (!valid()) return;
            const game = createGame({
                mountId: 'packet-scene',
                mapVariant: tutorialLesson ? 'demo' : options.mapVariant,
                ...(options.preloadedResources
                    ? { preloadedResources: options.preloadedResources }
                    : {}),
                ...(tutorialLesson ? { tutorialLesson } : {}),
                /** Forwards state only while the originating run still owns the session. */
                onStateChange: (runtime) => {
                    if (valid()) receiveState(runtime, id, nickname);
                },
                ...(IS_DEV && debug
                    ? {
                          /** Publishes diagnostics only while the originating run owns the session. */
                          onDebugChange: (snapshot: DebugSnapshot) => {
                              if (valid()) debug.publish(snapshot);
                          },
                      }
                    : {}),
            });
            owner.game = game;
            update({ hasGame: true });
            await game.start();
            if (!valid()) return;
            update({ ready: true });
            if (current.current.screen === 'loading') show(tutorialLesson ? 'tutorial' : 'playing');
        }
        void initialize().catch((error: unknown) => {
            if (!valid()) return;
            disposeRun();
            show('error', null, {
                hasGame: false,
                ready: false,
                errorMessage:
                    error instanceof Error
                        ? error.message
                        : 'The game could not start. Please try again.',
            });
        });
    }

    /**
     * Disposes any run and clears session state before returning to the title menu.
     *
     * @param focusTarget - Menu CSS selector to focus, or null to focus the title panel.
     */
    function mainMenu(focusTarget: string | null = null) {
        disposeRun();
        show('title', focusTarget, {
            hasGame: false,
            ready: false,
            result: null,
            levelClear: null,
            tutorialLesson: null,
            tutorial: null,
            confirmation: null,
        });
    }

    /** Resumes a live game unless a result or tutorial success/retry phase requires a menu. */
    function resume() {
        const view = current.current;
        const game = lifetime.current.game;
        if (
            !game ||
            view.result ||
            view.levelClear ||
            view.tutorial?.phase === 'success' ||
            view.tutorial?.phase === 'retry'
        )
            return;
        game.resume();
        if (!view.tutorialLesson && current.current.screen !== 'playing') show('playing');
    }

    /** Continues the current normal run from its acknowledged maze-clear checkpoint. */
    function continueLevel() {
        const view = current.current;
        const game = lifetime.current.game;
        if (!game || view.result || !view.levelClear || view.tutorialLesson) return;
        game.continueLevel();
    }

    /** Leaves a terminal result directly or confirms abandonment from a clear checkpoint. */
    function leaveResult() {
        if (current.current.levelClear) {
            confirm(
                'Leave this run? Your cleared level and current score will not be saved.',
                () => mainMenu(),
                'main-menu'
            );
            return;
        }
        mainMenu();
    }

    /** Makes menu interaction an explicit pause so returning window focus cannot resume play. */
    function claimPause() {
        if (current.current.screen !== 'playing') lifetime.current.game?.pause();
    }

    /**
     * Opens a submenu while keeping any current game paused.
     *
     * @param screen - Submenu to display.
     * @param action - Parent button's data-action value, used to restore focus when returning.
     */
    function submenu(screen: 'settings' | 'help' | 'profile', action: string) {
        lifetime.current.game?.pause();
        show(screen, null, {
            parentScreen: lifetime.current.game ? 'paused' : 'title',
            returnAction: action,
        });
    }

    /** Returns from a submenu or cancels a confirmation, restoring the initiating button's focus. */
    function back() {
        const view = current.current;
        if (view.screen === 'confirm' && view.confirmation) {
            show(view.confirmation.parent, `[data-action="${view.confirmation.returnAction}"]`, {
                confirmation: null,
            });
        } else show(view.parentScreen, `[data-action="${view.returnAction}"]`);
    }

    /**
     * Opens a confirmation without executing the pending action.
     *
     * @param message - Explanation shown before the action is accepted.
     * @param action - Callback invoked only when the player confirms.
     * @param returnAction - Parent button's data-action value to focus when cancelling.
     */
    function confirm(message: string, action: () => void, returnAction: string) {
        show('confirm', null, {
            confirmation: { message, action, parent: current.current.screen, returnAction },
        });
    }

    /** Starts the next practice lesson or displays completion after the final lesson. */
    function nextLesson() {
        const next =
            TUTORIAL_LESSONS[
                TUTORIAL_LESSONS.findIndex(
                    (lesson) => lesson.id === current.current.tutorialLesson
                ) + 1
            ];
        if (next) startRun(next.id);
        else show('tutorial-complete');
    }

    return {
        state,
        store,
        debug,
        mapVariant: options.mapVariant,
        startRun,
        mainMenu,
        resume,
        continueLevel,
        leaveResult,
        claimPause,
        submenu,
        back,
        confirm,
        nextLesson,
        /** Requests an explicit pause from the active game. */
        pause: () => lifetime.current.game?.pause(),
        /** Leaves practice and returns focus to the title menu's Tutorial button. */
        exitTutorial: () => mainMenu('[data-action="tutorial"]'),
        /** Restarts the current practice lesson or normal run after a failed attempt. */
        retrySession: () => startRun(current.current.tutorialLesson ?? undefined),
        /**
         * Rerenders the current menu after profile or preference changes.
         *
         * @param focusTarget - Menu CSS selector to focus, or null to focus the panel.
         */
        refresh: (focusTarget: string | null = null) => show(current.current.screen, focusTarget),
        /** Clears saved run records and refreshes the profile screen. */
        clearRecords: () => {
            store.clearRecords();
            show('profile');
        },
        /** Consumes the pending confirmation before invoking it so it cannot be accepted twice. */
        confirmAction: () => {
            const action = current.current.confirmation?.action;
            update({ confirmation: null });
            action?.();
        },
    };
}

export type GameSession = ReturnType<typeof useGameSession>;
