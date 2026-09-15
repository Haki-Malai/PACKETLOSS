import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react';
import { IS_DEV } from '../../config/environment';
import { useEnvironment } from '../../config/EnvironmentContext';
import { getTutorialLesson, TUTORIAL_LESSONS } from '../tutorial/TutorialLesson';
import { DebugOverlay, Hud } from './GameOverlays';
import { MenuInteraction } from './MenuPanel';
import { MenuScreens } from './MenuScreens';
import { useGameSession, type GameShellOptions } from './useGameSession';

export function GameShell(options: GameShellOptions) {
    const { isDev } = useEnvironment();
    const session = useGameSession(options);
    const {
        state,
        store,
        claimPause,
        resume,
        leaveResult,
        back,
        exitTutorial,
        mainMenu,
        nextLesson,
        retrySession,
        pause,
    } = session;
    const root = useRef<HTMLDivElement>(null);
    const surface = useRef<HTMLDivElement>(null);
    const ui = useRef<HTMLElement>(null);
    const menuViewport = useRef<HTMLDivElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const playing = state.screen === 'playing';
    const tutorialPhase = state.tutorial?.phase;

    useLayoutEffect(() => {
        if (playing) {
            const canvas = surface.current?.querySelector('canvas');
            if (canvas) {
                canvas.tabIndex = -1;
                canvas.focus({ preventScroll: true });
            }
        } else {
            const target = state.focusTarget
                ? ui.current?.querySelector<HTMLElement>(state.focusTarget)
                : null;
            (target ?? panel.current)?.focus({ preventScroll: true });
            if (menuViewport.current) menuViewport.current.scrollTop = 0;
        }
    }, [playing, state.navigation, state.focusTarget]);

    useEffect(() => {
        /** Handles the dev lesson skip, then traps menu focus and routes menu shortcuts. */
        function handleKeyDown(event: KeyboardEvent) {
            if (
                IS_DEV &&
                isDev &&
                state.ready &&
                state.tutorialLesson &&
                ['playing', 'tutorial', 'paused'].includes(state.screen) &&
                event.code === 'KeyN' &&
                !event.altKey &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.shiftKey &&
                !event.repeat &&
                !event.defaultPrevented
            ) {
                const target = event.target as HTMLElement | null;
                if (target?.closest('input,select,textarea,[contenteditable="true"]')) return;
                event.preventDefault();
                pause();
                nextLesson();
                return;
            }
            if (playing || event.defaultPrevented) return;
            claimPause();
            if (event.key === 'Tab') {
                const controls = Array.from(
                    ui.current?.querySelectorAll<HTMLElement>('button,input,select,a[href]') ?? []
                ).filter(
                    (control) =>
                        !control.matches(':disabled') && !control.closest('[hidden],[inert]')
                );
                const index = controls.indexOf(document.activeElement as HTMLElement);
                if (controls.length === 0) {
                    event.preventDefault();
                    panel.current?.focus();
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
                if (state.screen === 'paused') resume();
                else if (['settings', 'help', 'profile', 'confirm'].includes(state.screen)) back();
                else if (state.screen === 'tutorial-complete') exitTutorial();
                else if (['loading', 'error', 'result'].includes(state.screen)) {
                    if (state.tutorialLesson) exitTutorial();
                    else if (state.screen === 'result') leaveResult();
                    else mainMenu();
                }
            } else if (event.key === 'Enter' && state.screen === 'tutorial') {
                const target = event.target as HTMLElement | null;
                if (target?.closest('button,input,select,textarea,a,[contenteditable="true"]'))
                    return;
                if (tutorialPhase === 'introduction' || tutorialPhase === 'explanation') {
                    event.preventDefault();
                    resume();
                } else if (tutorialPhase === 'retry') {
                    event.preventDefault();
                    retrySession();
                }
            } else if ((event.code === 'Space' || event.key === ' ') && state.screen === 'paused') {
                const target = event.target as HTMLElement | null;
                if (target?.closest('button,input,select,textarea,a,[contenteditable="true"]'))
                    return;
                event.preventDefault();
                resume();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        playing,
        isDev,
        state.ready,
        state.screen,
        state.tutorialLesson,
        tutorialPhase,
        claimPause,
        resume,
        leaveResult,
        back,
        exitTutorial,
        mainMenu,
        nextLesson,
        retrySession,
        pause,
    ]);

    const lesson = state.tutorial && getTutorialLesson(state.tutorial.lesson);
    return (
        <div
            ref={root}
            className="game-shell relative h-full w-full"
            data-menu-motion={store.getMotion()}
        >
            <div ref={surface} inert={!playing} className="absolute inset-0">
                <div id="packet-scene" className="absolute inset-0" />
                {state.ready && <Hud onPause={pause} />}
            </div>
            <MenuInteraction value={claimPause}>
                <section
                    ref={ui}
                    className="packet-ui absolute inset-0 overflow-hidden"
                    aria-label="Game menu"
                    hidden={playing}
                    data-screen={state.screen}
                    data-backdrop={state.hasGame ? 'scene' : 'title'}
                    onPointerDownCapture={claimPause}
                >
                    <Ambient />
                    <div
                        ref={menuViewport}
                        className="packet-menu-viewport absolute inset-0 flex overflow-y-auto"
                    >
                        <MenuScreens
                            key={state.screen}
                            session={session}
                            panelRef={panel}
                            rootRef={root}
                        />
                    </div>
                </section>
            </MenuInteraction>
            <aside
                className="packet-tutorial-objective absolute flex flex-col gap-2"
                role="status"
                aria-live="polite"
                hidden={!playing || !lesson}
            >
                {lesson && (
                    <>
                        <p className="packet-eyebrow">
                            Practice ·{' '}
                            {TUTORIAL_LESSONS.findIndex((entry) => entry.id === lesson.id) + 1} /{' '}
                            {TUTORIAL_LESSONS.length} · {lesson.title}
                        </p>
                        <p className="packet-copy">{state.tutorial?.objective}</p>
                    </>
                )}
            </aside>
            {IS_DEV && isDev && state.ready && session.debug && (
                <DebugOverlay store={session.debug} />
            )}
        </div>
    );
}

function Ambient() {
    return (
        <div className="packet-ambient" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => {
                const left = i < 4 ? (i % 2 === 0 ? 1 : 98) : ((i * 29 + 5) % 94) + 3;
                const style = {
                    left: `${left}%`,
                    top: `${((i * 17 + 11) % 86) + 7}%`,
                    '--bit-duration': `${11 + (i % 5) * 1.9}s`,
                    '--bit-delay': `${-i * 1.73}s`,
                    '--bit-flip': `${2.7 + (i % 4) * 0.61}s`,
                } as CSSProperties;
                return (
                    <span key={i} className="packet-bit" style={style}>
                        <span>{i % 2}</span>
                        <span>{1 - (i % 2)}</span>
                    </span>
                );
            })}
        </div>
    );
}
