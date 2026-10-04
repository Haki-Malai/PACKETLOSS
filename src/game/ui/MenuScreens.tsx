import { useEffect, useState, type ReactNode, type Ref, type RefObject } from 'react';
import type { RunMode } from '../app/contracts';
import { getTutorialLesson } from '../tutorial/TutorialLesson';
import type { LocalRunRecord, MenuMotion } from '../infrastructure/adapters/LocalProfileStore';
import {
    CustomSelect,
    MenuPanel,
    MenuButton,
    MenuColumns,
    fieldLayout,
    inputLayout,
} from './MenuPanel';
import { GuestForm, ConfirmAccountForm, LoginForm, RecoveryForm, SignupForm } from './AccountScreens';
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

/** Selects the highest scoring retained record for one map and mode. */
function bestRecord(
    records: readonly LocalRunRecord[],
    map: LocalRunRecord['map'],
    mode: RunMode = 'classic'
): LocalRunRecord | undefined {
    return records
        .filter((record) => record.map === map && (record.mode ?? 'classic') === mode)
        .sort(
            (left, right) =>
                right.score - left.score ||
                Date.parse(right.completedAt) - Date.parse(left.completedAt)
        )[0];
}

const titles: Record<
    Exclude<Screen, 'playing' | 'tutorial' | 'result' | 'multiplayer-playing'>,
    string
> = {
    account: 'PACKETLOSS',
    signup: 'CREATE ACCOUNT',
    'confirm-account': 'CONFIRM EMAIL',
    login: 'LOGIN',
    recover: 'RECOVER ACCOUNT',
    title: 'PACKETLOSS',
    multiplayer: 'MULTIPLAYER',
    'multiplayer-start': 'START SERVER',
    'multiplayer-room': 'PRIVATE ROOM',
    'multiplayer-result': 'BATTLE ROYALE RESULTS',
    'multiplayer-reconnect': 'CONNECTION LOST',
    mode: 'PACKETLOSS',
    paused: 'PAUSED',
    settings: 'SETTINGS',
    help: 'ABOUT',
    profile: 'PROFILE & RECORDS',
    loading: 'Loading the maze',
    error: 'Unable to start',
    confirm: 'Are you sure?',
    'tutorial-complete': 'READY TO PLAY',
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
    const [roomCode, setRoomCode] = useState('');
    const visibleRecords = s.account.state.profile ? s.account.state.records : store.getRecords();
    if (screen === 'playing' || screen === 'multiplayer-playing') return null;
    const title =
        screen === 'tutorial'
            ? tutorialLesson
                ? getTutorialLesson(tutorialLesson).title
                : 'Tutorial'
            : screen === 'result'
              ? levelClear
                  ? 'MAZE CLEARED'
                  : result?.outcome === 'lost'
                    ? 'PACKET LOST'
                    : 'MAZE CLEARED'
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
            <MenuButton action="settings" onClick={() => s.submenu('settings')}>
                Settings
            </MenuButton>
            <MenuButton action="help" onClick={() => s.submenu('help')}>
                About
            </MenuButton>
        </>
    );
    switch (screen) {
        case 'account':
            body = s.account.localDevelopment ? <GuestForm session={s} /> : (
                <p className="packet-copy" role={s.account.state.checking ? 'status' : undefined}>
                    {s.account.state.checking
                        ? 'Checking for an existing session…'
                        : 'Save your profile and records across devices, or continue with local play.'}
                </p>
            );
            actions = (
                <>
                    <MenuButton
                        action="signup"
                        variant="primary"
                        onClick={() => s.openAccount('signup', 'account')}
                        disabled={s.account.state.checking}
                    >
                        Signup
                    </MenuButton>
                    <MenuButton
                        action="login"
                        onClick={() => s.openAccount('login', 'account')}
                        disabled={s.account.state.checking}
                    >
                        Login
                    </MenuButton>
                    <MenuButton action="skip" onClick={s.skipAccount}>
                        Skip
                    </MenuButton>
                </>
            );
            break;
        case 'signup':
            body = <SignupForm session={s} />;
            break;
        case 'confirm-account':
            body = <ConfirmAccountForm session={s} />;
            break;
        case 'login':
            body = <LoginForm session={s} />;
            break;
        case 'recover':
            body = <RecoveryForm session={s} />;
            break;
        case 'title':
            body = (
                <div className="mb-2.5 flex flex-col gap-2">
                    <div
                        data-identity
                        className="flex flex-wrap items-center justify-between gap-3 font-heading text-[0.72rem] wrap-anywhere text-packet-gold"
                    >
                        <span>
                            {s.account.state.profile?.nickname ?? store.getNickname()}
                            {s.account.state.profile
                                ? ` · ${s.account.state.profile.avatar.toUpperCase()}`
                                : ''}
                        </span>
                        <span>BEST {score(bestRecord(visibleRecords, mapVariant)?.score ?? 0)}</span>
                    </div>
                    <p className="packet-note" data-multiplayer-status>
                        Multiplayer · {s.multiplayer.availability.state.label}
                    </p>
                </div>
            );
            actions = (
                <>
                    <MenuButton
                        action="multiplayer"
                        variant={s.multiplayer.hasReservation ? '' : 'primary'}
                        disabled={s.multiplayer.availability.state.label !== 'Ready'}
                        onClick={s.openMultiplayer}
                    >
                        Multiplayer
                    </MenuButton>
                    {s.multiplayer.hasReservation && (
                        <MenuButton
                            action="reconnect-multiplayer"
                            variant="primary"
                            disabled={!s.account.state.profile || s.multiplayer.joining}
                            onClick={s.reconnectMultiplayer}
                        >
                            Reconnect multiplayer
                        </MenuButton>
                    )}
                    {s.multiplayer.availability.state.capabilities.canStart &&
                        s.multiplayer.availability.state.label !== 'Ready' && (
                            <MenuButton
                                action="start-multiplayer-server"
                                onClick={s.openMultiplayerStart}
                            >
                                Start multiplayer server
                            </MenuButton>
                        )}
                    <MenuButton action="start" onClick={() => s.submenu('mode')}>
                        Start game
                    </MenuButton>
                    <MenuButton action="profile" onClick={() => s.submenu('profile')}>
                        Profile &amp; records
                    </MenuButton>
                    {!s.account.state.profile && s.account.available && (
                        <>
                            <MenuButton
                                action="signup"
                                onClick={() => s.openAccount('signup', 'title')}
                            >
                                Signup
                            </MenuButton>
                            <MenuButton
                                action="login"
                                onClick={() => s.openAccount('login', 'title')}
                            >
                                Login
                            </MenuButton>
                        </>
                    )}
                    {preferences}
                    <MenuButton action="tutorial" onClick={() => s.startRun('movement')}>
                        Tutorial
                    </MenuButton>
                </>
            );
            break;
        case 'multiplayer':
            body = (
                <div className="flex flex-col gap-4">
                    <p className="packet-copy">
                        Create a private Battle Royale or enter a six-character invite code.
                    </p>
                    <label className={fieldLayout}>
                        Invite code
                        <input
                            className={inputLayout}
                            aria-label="Invite code"
                            value={roomCode}
                            maxLength={6}
                            autoComplete="off"
                            onChange={(event) =>
                                setRoomCode(
                                    event.currentTarget.value
                                        .toUpperCase()
                                        .replace(/[^A-Z2-9]/g, '')
                                        .slice(0, 6)
                                )
                            }
                        />
                    </label>
                </div>
            );
            actions = (
                <>
                    {s.multiplayer.hasReservation && (
                        <MenuButton
                            action="reconnect-room"
                            variant="primary"
                            disabled={!s.account.state.profile || s.multiplayer.joining}
                            onClick={() => void s.multiplayer.reconnect()}
                        >
                            Reconnect room
                        </MenuButton>
                    )}
                    <MenuButton
                        action="create-room"
                        variant={s.multiplayer.hasReservation ? '' : 'primary'}
                        disabled={!s.account.state.profile || s.multiplayer.joining}
                        onClick={() => void s.multiplayer.createRoom()}
                    >
                        Create room
                    </MenuButton>
                    <MenuButton
                        action="join-room"
                        disabled={
                            !s.account.state.profile ||
                            roomCode.length !== 6 ||
                            s.multiplayer.joining
                        }
                        onClick={() => void s.multiplayer.joinRoom(roomCode)}
                    >
                        Join room
                    </MenuButton>
                    {!s.account.state.profile && s.account.available && (
                        <MenuButton action="login" onClick={() => s.openAccount('login', 'title')}>
                            Login to play
                        </MenuButton>
                    )}
                    <MenuButton action="back" onClick={() => s.mainMenu('[data-action="multiplayer"]')}>
                        Back
                    </MenuButton>
                </>
            );
            break;
        case 'multiplayer-start':
            body = (
                <div className="flex flex-col gap-4">
                    <p className="packet-copy">
                        Start one regional server. Availability checks never start it automatically.
                    </p>
                    <label className={fieldLayout}>
                        Region
                        <CustomSelect
                            ariaLabel="Game server region"
                            value={s.multiplayer.region}
                            options={[
                                { value: 'eu', label: 'Europe · Frankfurt' },
                                { value: 'na', label: 'North America · Virginia' },
                            ]}
                            onChange={s.multiplayer.setRegion}
                        />
                    </label>
                </div>
            );
            actions = (
                <>
                    <MenuButton
                        action="confirm-server-start"
                        variant="primary"
                        disabled={s.multiplayer.availability.state.busy}
                        onClick={() => void s.multiplayer.availability.start(s.multiplayer.region)}
                    >
                        Start server
                    </MenuButton>
                    <MenuButton action="back" onClick={() => s.mainMenu()}>
                        Back
                    </MenuButton>
                </>
            );
            break;
        case 'multiplayer-room': {
            const room = s.multiplayer.connection.room;
            const me = room?.players.find(
                (player) => player.id === s.multiplayer.connection.playerId
            );
            body = room ? (
                <div className="flex flex-col gap-4">
                    <p className="packet-eyebrow">Invite code · {room.code}</p>
                    <ol className="m-0 flex list-none flex-col gap-2 p-0">
                        {room.players.map((player) => (
                            <li key={player.id} className="flex justify-between gap-4 text-sm">
                                <span style={{ color: player.color }}>{player.name}</span>
                                <span>{player.connected ? (player.ready ? 'Ready' : 'Waiting') : 'Disconnected'}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            ) : (
                <p className="packet-copy" role="status">Connecting to the private room…</p>
            );
            actions = (
                <>
                    {me && (
                        <MenuButton
                            action="ready"
                            variant={me.ready ? '' : 'primary'}
                            onClick={() => s.multiplayer.setReady(!me.ready)}
                        >
                            {me.ready ? 'Not ready' : 'Ready'}
                        </MenuButton>
                    )}
                    {room?.ownerId === s.multiplayer.connection.playerId && (
                        <MenuButton
                            action="start-match"
                            variant={me?.ready ? 'primary' : ''}
                            disabled={!room.canStart}
                            onClick={s.multiplayer.startMatch}
                        >
                            Start match
                        </MenuButton>
                    )}
                    <MenuButton action="leave-room" onClick={s.leaveMultiplayer}>
                        Leave
                    </MenuButton>
                </>
            );
            break;
        }
        case 'multiplayer-reconnect':
            body = <p className="packet-copy" role="status">{s.multiplayer.message || 'Your place is reserved for 30 seconds.'}</p>;
            actions = (
                <>
                    <MenuButton
                        action="reconnect"
                        variant="primary"
                        disabled={s.multiplayer.joining || ['waiting', 'connecting'].includes(s.multiplayer.recovery.phase)}
                        onClick={() => void s.multiplayer.reconnect()}
                    >
                        Reconnect
                    </MenuButton>
                    <MenuButton action="leave-room" onClick={s.leaveMultiplayer}>
                        Leave
                    </MenuButton>
                </>
            );
            break;
        case 'multiplayer-result': {
            const race = s.multiplayer.connection.race;
            const saving = s.multiplayer.connection.room?.phase === 'saving';
            body = saving ? (
                <p className="packet-copy" role="status">Saving results…</p>
            ) : race ? (
                <div className="flex flex-col gap-3">
                    {race.phase === 'finished'
                        && race.players.every((player) => player.eliminatedAtTick !== null) && (
                        <p className="packet-eyebrow">No survivors</p>
                    )}
                    <ol className="m-0 flex list-none flex-col gap-2 p-0">
                        {race.rankings.map((ranking) => (
                            <li key={ranking.playerId} className="flex justify-between gap-4 text-sm">
                                <span>#{ranking.rank} · {ranking.name}</span>
                                <span>{score(ranking.score)}</span>
                            </li>
                        ))}
                        {race.phase === 'aborted' && (
                            <li className="packet-note">Match interrupted · {race.abortReason}</li>
                        )}
                    </ol>
                </div>
            ) : null;
            actions = (
                <>
                    {!saving && race?.phase === 'finished' && (
                        <MenuButton action="rematch" variant="primary" onClick={s.multiplayer.rematch}>
                            Rematch
                        </MenuButton>
                    )}
                    <MenuButton action="leave-room" onClick={s.leaveMultiplayer}>
                        Leave
                    </MenuButton>
                </>
            );
            break;
        }
        case 'mode':
            actions = (
                <>
                    <MenuButton
                        action="start-endless"
                        variant="primary"
                        onClick={() => s.startRun(undefined, 'endless')}
                    >
                        Endless
                    </MenuButton>
                    <MenuButton
                        action="start-level"
                        onClick={() => s.startRun(undefined, 'classic')}
                    >
                        Classic
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
                                    () => s.startRun(undefined, state.runMode),
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
                            [
                                'Best score',
                                score(
                                    bestRecord(
                                        visibleRecords,
                                        result!.mode === 'endless' ? 'default' : mapVariant,
                                        result!.mode ?? 'classic'
                                    )?.score ?? 0
                                ),
                            ],
                            ...(result!.mode === 'endless'
                                ? []
                                : [['Levels cleared', String(result!.levelsCleared)]]),
                            [
                                'Data recovered',
                                result!.mode === 'endless'
                                    ? String(result!.pointsCollected)
                                    : `${result!.pointsCollected} / ${result!.totalPoints}`,
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
                        <MenuButton
                            action="replay"
                            variant="primary"
                            onClick={() => s.startRun(undefined, state.runMode)}
                        >
                            {result?.outcome === 'lost' ? 'Try again' : 'Play again'}
                        </MenuButton>
                    )}
                    <MenuButton action="main-menu" onClick={s.leaveResult}>
                        Main menu
                    </MenuButton>
                    {!levelClear && !s.account.state.profile && s.account.available && (
                        <>
                            <MenuButton
                                action="signup"
                                onClick={() => s.openAccount('signup', 'result')}
                            >
                                Signup to save this record
                            </MenuButton>
                            <MenuButton
                                action="login"
                                onClick={() => s.openAccount('login', 'result')}
                            >
                                Login
                            </MenuButton>
                        </>
                    )}
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
                <>
                    {!s.account.state.profile && s.account.available && (
                        <>
                            <MenuButton
                                action="signup"
                                onClick={() => s.openAccount('signup', 'title')}
                            >
                                Signup
                            </MenuButton>
                            <MenuButton
                                action="login"
                                onClick={() => s.openAccount('login', 'title')}
                            >
                                Login
                            </MenuButton>
                        </>
                    )}
                    {s.account.state.profile && (
                        <MenuButton action="logout" onClick={() => void s.logout()}>
                            Logout
                        </MenuButton>
                    )}
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
                </>
            );
            break;
    }
    return (
        <MenuPanel
            panelRef={panelRef}
            title={title}
            wide={screen === 'help' || screen === 'profile'}
            compact={screen === 'mode' || screen.startsWith('multiplayer')}
            centered={screen === 'title' || screen === 'account'}
            heading={
                screen === 'title' || screen === 'mode' || screen === 'account'
                    ? (id) => <TitleHeading id={id} motion={store.getMotion()} />
                    : undefined
            }
            onBack={
                [
                    'settings',
                    'help',
                    'profile',
                    'mode',
                    'signup',
                    'confirm-account',
                    'login',
                    'recover',
                    'multiplayer',
                    'multiplayer-start',
                ].includes(screen)
                    ? s.back
                    : undefined
            }
            outcome={screen === 'result' ? (levelClear ? 'cleared' : result?.outcome) : undefined}
            tutorialPhase={screen === 'tutorial' ? tutorial?.phase : undefined}
            actions={actions}
            footer={
                <>
                    {store.getStatusMessage() && (
                        <p className="packet-note" role="status">
                            {store.getStatusMessage()}
                        </p>
                    )}
                    {s.account.state.message &&
                        !['signup', 'confirm-account', 'login', 'recover'].includes(screen) && (
                            <p
                                className="packet-note"
                                role={s.account.state.errorCode ? 'alert' : 'status'}
                            >
                                {s.account.state.message}
                            </p>
                        )}
                    {s.multiplayer.message && (
                        <p className="packet-note" role="alert">{s.multiplayer.message}</p>
                    )}
                </>
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
            <nav aria-label="About sections">
                <ol className="m-0 grid list-none grid-cols-3 gap-2 p-0">
                    {helpPages.map((step) => (
                        <li key={step.id} className="min-w-0">
                            <MenuButton
                                action={`help-${step.id}`}
                                layout="compact"
                                variant={page === step.id ? 'primary' : ''}
                                aria-current={page === step.id ? 'step' : undefined}
                                aria-controls="packet-help-content"
                                className="w-full min-w-0 px-1 text-[0.65rem] sm:text-xs"
                                onFocus={() => setPage(step.id)}
                                onClick={(event) => {
                                    event.currentTarget.focus({ preventScroll: true });
                                    setPage(step.id);
                                }}
                            >
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
