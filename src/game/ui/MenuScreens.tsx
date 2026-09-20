import { useEffect, useState, type ReactNode, type Ref, type RefObject } from 'react';
import { getTutorialLesson, TUTORIAL_LESSONS } from '../tutorial/TutorialLesson';
import type { MenuMotion } from '../infrastructure/adapters/LocalProfileStore';
import { CustomSelect, MenuPanel, MenuButton, MenuColumns, fieldLayout } from './MenuPanel';
import { EnemyGuide, ScoreBonusGuide, TitleHeading } from './MenuPreviews';
import { ProfileBody, score, duration } from './ProfileScreen';
import type { GameSession, Screen } from './useGameSession';

const basics = [
    [
        'Move',
        'Arrow keys or WASD. On touchscreens, swipe in the direction you want to go. Turns queue until the corridor allows them.',
    ],
    [
        'Survive',
        'You have three lives. Recovering every point opens a clear checkpoint; continuing refills the maze at higher speed and scoring.',
    ],
    [
        'Pause',
        'Press Space or Escape, use the Pause button, or click/tap the game. Choose Resume when ready.',
    ],
] as const;

const scoring = [
    [
        'Collect',
        'Data bits score 10 points. Larger power cores score 50 and let you eat scared enemies.',
    ],
    [
        'Enemy bonuses',
        'Scared enemies score 200, 400, 800, then 1,600 points. A new power core resets this chain.',
    ],
    [
        'Later levels',
        'Each continued level speeds up gameplay and increases every score award by another 25%.',
    ],
] as const;

const helpPages = [
    { id: 'basics', label: 'Basics' },
    { id: 'scoring', label: 'Scoring' },
    { id: 'enemies', label: 'Enemies' },
] as const;

const titles: Record<
    Exclude<Screen, 'playing' | 'tutorial' | 'result'>,
    readonly [string, string]
> = {
    title: ['A maze arcade game', 'PACKETLOSS'],
    paused: ['Signal on hold', 'PAUSED'],
    settings: ['Make yourself comfortable', 'SETTINGS'],
    help: ['Keep your signal alive', 'HOW TO PLAY'],
    profile: ['', 'PROFILE & RECORDS'],
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
    const { screen, result, levelClear, tutorial, tutorialLesson } = state;
    if (screen === 'playing') return null;
    const [eyebrow, title] =
        screen === 'tutorial'
            ? [
                  `Practice · Lesson ${TUTORIAL_LESSONS.findIndex((lesson) => lesson.id === tutorialLesson) + 1} of ${TUTORIAL_LESSONS.length}`,
                  tutorialLesson ? getTutorialLesson(tutorialLesson).title : 'Tutorial',
              ]
            : screen === 'result'
              ? levelClear
                  ? ['', 'MAZE CLEARED']
                  : result?.outcome === 'lost'
                    ? ['All lives lost', 'PACKET LOST']
                    : ['All data recovered', 'MAZE CLEARED']
              : titles[screen];
    let body: ReactNode;
    let actions: ReactNode;
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
            break;
        case 'tutorial': {
            if (!tutorial) break;
            body = (
                <>
                    {tutorial.phase === 'retry' && <p className="packet-eyebrow">Try that again</p>}
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
                    {(tutorial.phase === 'explanation' || tutorial.phase === 'retry') && (
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
        case 'result': {
            if (!result && !levelClear) break;
            body = levelClear ? (
                <p className="packet-heading text-[clamp(1.2rem,4vw,2rem)]">
                    GAME IS NOW SPED UP AND SCORING IS INCREASED
                </p>
            ) : (
                <>
                    <p className="packet-result-score">{score(result!.score)}</p>
                    <p className="packet-eyebrow">{state.newBest ? 'NEW BEST' : 'FINAL SCORE'}</p>
                    <dl className="packet-stats">
                        {[
                            ['Best score', score(store.getTopRecords(mapVariant)[0]?.score ?? 0)],
                            ['Levels cleared', String(result!.levelsCleared)],
                            [
                                'Data recovered',
                                `${result!.pointsCollected} / ${result!.totalPoints}`,
                            ],
                            ['Play time', duration(result!.elapsedMs)],
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
                    {levelClear ? (
                        <MenuButton
                            action="continue-level"
                            variant="primary"
                            onClick={s.continueLevel}
                        >
                            Continue
                        </MenuButton>
                    ) : (
                        <MenuButton action="replay" variant="primary" onClick={() => s.startRun()}>
                            {result?.outcome === 'lost' ? 'Try again' : 'Play again'}
                        </MenuButton>
                    )}
                    <MenuButton action="main-menu" onClick={s.leaveResult}>
                        Main menu
                    </MenuButton>
                </>
            );
            break;
        }
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
                    <div className={fieldLayout}>
                        <span>Menu motion</span>
                        <CustomSelect
                            ariaLabel="Menu motion"
                            className="w-full"
                            control="motion"
                            value={store.getMotion()}
                            options={
                                [
                                    { value: 'system', label: 'Follow system' },
                                    { value: 'reduced', label: 'Reduced' },
                                    { value: 'full', label: 'Full' },
                                ] satisfies { value: MenuMotion; label: string }[]
                            }
                            onChange={(value) => {
                                store.setMotion(value);
                                s.refresh('[data-control="motion"]');
                            }}
                        />
                    </div>
                </>
            );
            actions = <FullscreenControl rootRef={rootRef} />;
            break;
        case 'help':
            body = <HelpScreen motion={store.getMotion()} />;
            break;
        case 'profile':
            body = <ProfileBody session={s} />;
            actions = (
                <MenuButton
                    action="clear-records"
                    variant="danger"
                    onClick={() =>
                        s.confirm(
                            'Clear all records? Your name and settings will be kept.',
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
            outcome={screen === 'result' ? (levelClear ? 'cleared' : result?.outcome) : undefined}
            tutorialPhase={screen === 'tutorial' ? tutorial?.phase : undefined}
            actions={actions}
            footer={
                store.getStatusMessage() && (
                    <p className="packet-note" role="status">
                        {store.getStatusMessage()}
                    </p>
                )
            }
        >
            {body}
        </MenuPanel>
    );
}

function HelpScreen({ motion }: { motion: MenuMotion }) {
    const [page, setPage] = useState<(typeof helpPages)[number]['id']>('basics');
    const facts = page === 'scoring' ? scoring : basics;
    const heading = page === 'scoring' ? 'Scoring' : 'The basics';
    const headingId = page === 'scoring' ? 'packet-scoring-heading' : 'packet-basics-heading';

    return (
        <div className="my-4 mb-2 flex min-w-0 flex-col gap-4">
            <nav aria-label="How to play pages">
                <ol className="m-0 grid list-none grid-cols-3 gap-2 p-0">
                    {helpPages.map((step, index) => (
                        <li key={step.id} className="min-w-0">
                            <MenuButton
                                action={`help-${step.id}`}
                                layout="compact"
                                aria-current={page === step.id ? 'step' : undefined}
                                aria-controls="packet-help-content"
                                className={`w-full min-w-0 flex-col gap-1 px-1 text-[0.65rem] sm:text-xs ${page === step.id ? 'border-packet-cyan bg-packet-raised text-packet-focus' : ''}`}
                                onClick={() => setPage(step.id)}
                            >
                                <span className="text-[0.6rem] text-packet-gold" aria-hidden="true">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                {step.label}
                            </MenuButton>
                        </li>
                    ))}
                </ol>
            </nav>
            <div id="packet-help-content">
                {page === 'enemies' ? (
                    <EnemyGuide motion={motion} />
                ) : (
                    <section aria-labelledby={headingId}>
                        <h2 id={headingId} className="packet-record-heading mt-0">
                            {heading}
                        </h2>
                        <MenuColumns>
                            {[facts.slice(0, 2), facts.slice(2)].map((items, index) => (
                                <section key={index}>
                                    <dl className="packet-help">
                                        {items.map(([label, text]) => (
                                            <div key={label}>
                                                <dt>{label}</dt>
                                                <dd>{text}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </section>
                            ))}
                        </MenuColumns>
                        {page === 'scoring' && <ScoreBonusGuide />}
                    </section>
                )}
            </div>
        </div>
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
