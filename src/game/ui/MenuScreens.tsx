import { Fragment, useEffect, useState, type ReactNode, type Ref, type RefObject } from 'react';
import { getTutorialLesson, TUTORIAL_LESSONS } from '../tutorial/TutorialLesson';
import type { MenuMotion } from '../infrastructure/adapters/LocalProfileStore';
import { MenuPanel, MenuButton, MenuColumns, fieldLayout, inputLayout } from './MenuPanel';
import { EnemyGuide, TitleHeading } from './MenuPreviews';
import { ProfileBody, score, duration } from './ProfileScreen';
import type { GameSession, Screen } from './useGameSession';

const titles: Record<
    Exclude<Screen, 'playing' | 'tutorial' | 'result'>,
    readonly [string, string]
> = {
    title: ['A maze arcade game', 'PACKETLOSS'],
    paused: ['Signal on hold', 'PAUSED'],
    settings: ['Make yourself comfortable', 'SETTINGS'],
    help: ['Keep your signal alive', 'HOW TO PLAY'],
    profile: ['On this device', 'PROFILE & RECORDS'],
    loading: ['Connecting', 'Loading the maze'],
    error: ['Signal interrupted', 'Unable to start'],
    confirm: ['One more thing', 'Are you sure?'],
    'tutorial-complete': ['Practice complete', 'READY TO PLAY'],
};

export function MenuScreens({
    session: s,
    panelRef,
    rootRef,
}: {
    session: GameSession;
    panelRef: Ref<HTMLDivElement>;
    rootRef: RefObject<HTMLDivElement | null>;
}) {
    const { state, store, mapVariant } = s;
    const { screen, result, tutorial, tutorialLesson } = state;
    if (screen === 'playing') return null;
    const [eyebrow, title] =
        screen === 'tutorial'
            ? [
                  `Practice · Lesson ${TUTORIAL_LESSONS.findIndex((lesson) => lesson.id === tutorialLesson) + 1} of ${TUTORIAL_LESSONS.length}`,
                  tutorialLesson ? getTutorialLesson(tutorialLesson).title : 'Tutorial',
              ]
            : screen === 'result'
              ? result?.outcome === 'lost'
                  ? ['All lives lost', 'PACKET LOST']
                  : ['All data recovered', 'MAZE CLEARED']
              : titles[screen];
    let body: ReactNode;
    let actions: ReactNode;
    let footer: ReactNode;
    const exit = tutorialLesson ? (
        <MenuButton action="exit-tutorial" onClick={s.exitTutorial}>
            Exit tutorial
        </MenuButton>
    ) : (
        <MenuButton action="main-menu" onClick={() => s.mainMenu()}>
            Main menu
        </MenuButton>
    );
    const preferences = (
        <>
            <MenuButton action="settings" onClick={() => s.submenu('settings', 'settings')}>
                Settings
            </MenuButton>
            <MenuButton action="help" onClick={() => s.submenu('help', 'help')}>
                How to play
            </MenuButton>
        </>
    );
    switch (screen) {
        case 'title':
            body = (
                <>
                    <p className="packet-copy">
                        Recover data. Evade enemies. Keep your signal alive.
                    </p>
                    <div
                        data-identity
                        className="mb-2.5 flex flex-wrap items-center justify-between gap-3 font-heading text-[0.72rem] wrap-anywhere text-packet-gold"
                    >
                        <span>{store.getNickname()}</span>
                        <span>BEST {score(store.getTopRecords(mapVariant)[0]?.score ?? 0)}</span>
                    </div>
                </>
            );
            actions = (
                <>
                    <MenuButton action="start" variant="primary" onClick={() => s.startRun()}>
                        Start game
                    </MenuButton>
                    <MenuButton action="profile" onClick={() => s.submenu('profile', 'profile')}>
                        Profile &amp; records
                    </MenuButton>
                    {preferences}
                    <MenuButton action="tutorial" onClick={() => s.startRun('movement')}>
                        Tutorial
                    </MenuButton>
                </>
            );
            footer = <p className="packet-note">Your profile and records stay on this device.</p>;
            break;
        case 'paused':
            body = (
                <p className="packet-copy">
                    {tutorialLesson ? tutorial?.objective : 'Take a breath. The maze can wait.'}
                </p>
            );
            actions = (
                <>
                    <MenuButton action="resume" variant="primary" onClick={s.resume}>
                        Resume
                    </MenuButton>
                    {tutorialLesson ? (
                        <MenuButton action="retry-lesson" onClick={s.retrySession}>
                            Retry lesson
                        </MenuButton>
                    ) : (
                        <MenuButton
                            action="restart"
                            onClick={() =>
                                s.confirm(
                                    'Restart this run? Your unfinished score will not be saved.',
                                    () => s.startRun(),
                                    'restart'
                                )
                            }
                        >
                            Restart
                        </MenuButton>
                    )}
                    {preferences}
                    {tutorialLesson ? (
                        exit
                    ) : (
                        <MenuButton
                            action="main-menu"
                            onClick={() =>
                                s.confirm(
                                    'Leave this run? Your unfinished score will not be saved.',
                                    () => s.mainMenu(),
                                    'main-menu'
                                )
                            }
                        >
                            Main menu
                        </MenuButton>
                    )}
                </>
            );
            footer = (
                <p className="packet-note">
                    {tutorialLesson
                        ? 'Practice is not recorded. Retry this lesson as often as you like.'
                        : 'Escape to resume · Space activates the focused button'}
                </p>
            );
            break;
        case 'tutorial': {
            if (!tutorial) break;
            const next =
                TUTORIAL_LESSONS[
                    TUTORIAL_LESSONS.findIndex((lesson) => lesson.id === tutorial.lesson) + 1
                ];
            body = (
                <>
                    {(tutorial.phase === 'success' || tutorial.phase === 'retry') && (
                        <p className="packet-eyebrow">
                            {tutorial.phase === 'success' ? 'Lesson complete' : 'Try that again'}
                        </p>
                    )}
                    <p className="packet-copy">{tutorial.message}</p>
                </>
            );
            actions = (
                <>
                    {(tutorial.phase === 'introduction' || tutorial.phase === 'explanation') && (
                        <MenuButton action="try-lesson" variant="primary" onClick={s.resume}>
                            {tutorial.phase === 'introduction' ? 'Try it' : 'Continue'}
                        </MenuButton>
                    )}
                    {tutorial.phase === 'success' && (
                        <MenuButton action="next-lesson" variant="primary" onClick={s.nextLesson}>
                            {next ? 'Next lesson' : 'Finish tutorial'}
                        </MenuButton>
                    )}
                    {tutorial.phase !== 'introduction' && (
                        <MenuButton
                            action="retry-lesson"
                            onClick={s.retrySession}
                            variant={tutorial.phase === 'retry' ? 'primary' : ''}
                        >
                            Retry lesson
                        </MenuButton>
                    )}
                    {exit}
                </>
            );
            footer = (
                <p className="packet-note">The maze is paused. Practice scores are not saved.</p>
            );
            break;
        }
        case 'tutorial-complete':
            body = (
                <p className="packet-copy">
                    You have tried every mechanic. Take your signal into the full maze when you are
                    ready.
                </p>
            );
            actions = (
                <>
                    <MenuButton action="start" variant="primary" onClick={() => s.startRun()}>
                        Start game
                    </MenuButton>
                    <MenuButton action="replay-tutorial" onClick={() => s.startRun('movement')}>
                        Replay tutorial
                    </MenuButton>
                    <MenuButton action="exit-tutorial" onClick={s.exitTutorial}>
                        Back to main menu
                    </MenuButton>
                </>
            );
            break;
        case 'result':
            if (!result) break;
            body = (
                <>
                    <p className="packet-result-score">{score(result.score)}</p>
                    <p className="packet-eyebrow">
                        {state.newBest ? 'NEW LOCAL BEST' : 'FINAL SCORE'}
                    </p>
                    <dl className="packet-stats">
                        {[
                            ['Local best', score(store.getTopRecords(mapVariant)[0]?.score ?? 0)],
                            ['Data recovered', `${result.pointsCollected} / ${result.totalPoints}`],
                            ['Play time', duration(result.elapsedMs)],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt>{label}</dt>
                                <dd>{value}</dd>
                            </div>
                        ))}
                    </dl>
                </>
            );
            actions = (
                <>
                    <MenuButton action="replay" variant="primary" onClick={() => s.startRun()}>
                        {result.outcome === 'lost' ? 'Try again' : 'Play again'}
                    </MenuButton>
                    {exit}
                </>
            );
            footer = (
                <p className="packet-note">
                    {store.getStatusMessage()
                        ? 'Your result is available for this session.'
                        : 'Record saved on this device.'}
                </p>
            );
            break;
        case 'loading':
            body = (
                <p className="packet-copy packet-loading" role="status">
                    {tutorialLesson ? 'Preparing your practice lesson…' : 'Preparing your run…'}
                </p>
            );
            actions = exit;
            break;
        case 'error':
            body = (
                <p className="packet-copy" role="alert">
                    {state.errorMessage}
                </p>
            );
            actions = (
                <>
                    <MenuButton action="retry" variant="primary" onClick={s.retrySession}>
                        Retry
                    </MenuButton>
                    {exit}
                </>
            );
            break;
        case 'confirm':
            body = <p className="packet-copy">{state.confirmation?.message}</p>;
            actions = (
                <>
                    <MenuButton action="cancel" variant="primary" onClick={s.back}>
                        Cancel
                    </MenuButton>
                    <MenuButton action="confirm" variant="danger" onClick={s.confirmAction}>
                        Confirm
                    </MenuButton>
                </>
            );
            break;
        case 'settings':
            body = (
                <>
                    <MenuButton action="sound" disabled>
                        Sound — Coming soon
                    </MenuButton>
                    <label className={fieldLayout}>
                        Menu motion
                        <select
                            className={inputLayout}
                            data-control="motion"
                            value={store.getMotion()}
                            onChange={(event) => {
                                store.setMotion(event.target.value as MenuMotion);
                                s.refresh('[data-control="motion"]');
                            }}
                        >
                            <option value="system">Follow system</option>
                            <option value="reduced">Reduced</option>
                            <option value="full">Full</option>
                        </select>
                    </label>
                </>
            );
            actions = <FullscreenControl rootRef={rootRef} />;
            footer = (
                <p className="packet-note">
                    Changes menu effects only. Gameplay motion is unchanged.
                </p>
            );
            break;
        case 'help':
            body = (
                <MenuColumns>
                    <section aria-labelledby="packet-basics-heading">
                        <h2 id="packet-basics-heading" className="packet-record-heading mt-0">
                            The basics
                        </h2>
                        <dl className="packet-help">
                            {[
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
                            ].map(([label, text]) => (
                                <Fragment key={label}>
                                    <dt>{label}</dt>
                                    <dd>{text}</dd>
                                </Fragment>
                            ))}
                        </dl>
                    </section>
                    <EnemyGuide motion={store.getMotion()} />
                </MenuColumns>
            );
            break;
        case 'profile':
            body = <ProfileBody session={s} />;
            actions = (
                <MenuButton
                    action="clear-records"
                    variant="danger"
                    onClick={() =>
                        s.confirm(
                            'Clear all records on this device? Your name and settings will be kept.',
                            s.clearRecords,
                            'clear-records'
                        )
                    }
                >
                    Clear records
                </MenuButton>
            );
            break;
    }
    return (
        <MenuPanel
            panelRef={panelRef}
            eyebrow={eyebrow}
            title={title}
            wide={screen === 'help' || screen === 'profile'}
            centered={screen === 'title'}
            heading={
                screen === 'title'
                    ? (id) => <TitleHeading id={id} motion={store.getMotion()} />
                    : undefined
            }
            onBack={['settings', 'help', 'profile'].includes(screen) ? s.back : undefined}
            outcome={screen === 'result' ? result?.outcome : undefined}
            tutorialPhase={screen === 'tutorial' ? tutorial?.phase : undefined}
            actions={actions}
            footer={
                <>
                    {footer}
                    {store.getStatusMessage() && (
                        <p className="packet-note" role="status">
                            {store.getStatusMessage()}
                        </p>
                    )}
                </>
            }
        >
            {body}
        </MenuPanel>
    );
}

function FullscreenControl({ rootRef }: { rootRef: RefObject<HTMLDivElement | null> }) {
    const [fullscreen, setFullscreen] = useState(() => !!document.fullscreenElement);
    const [failure, setFailure] = useState(false);
    const [requests] = useState(() => ({ active: false }));
    useEffect(() => {
        requests.active = true;
        /** Mirrors browser fullscreen changes, including exits outside the menu control. */
        const synchronize = () => setFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', synchronize);
        return () => {
            requests.active = false;
            document.removeEventListener('fullscreenchange', synchronize);
        };
    }, [requests]);
    if (!document.fullscreenEnabled || typeof rootRef.current?.requestFullscreen !== 'function')
        return null;
    /** Requests a fullscreen toggle and reports rejection only while the control is mounted. */
    async function toggle() {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await rootRef.current?.requestFullscreen();
        } catch {
            if (requests.active) setFailure(true);
        }
    }
    return (
        <>
            <MenuButton
                action="fullscreen"
                onClick={() => {
                    void toggle();
                }}
            >
                {fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            </MenuButton>
            {failure && (
                <p className="packet-note" role="status">
                    Fullscreen is unavailable right now. You can keep playing in this window.
                </p>
            )}
        </>
    );
}
