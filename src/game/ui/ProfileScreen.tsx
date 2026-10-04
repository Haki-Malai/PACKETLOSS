import { useState } from 'react';
import type { LocalRunRecord } from '../infrastructure/adapters/LocalProfileStore';
import type { RunMode } from '../app/contracts';
import { AVATAR_CHOICES, type AvatarChoice } from '../infrastructure/adapters/AccountClient';
import { CustomSelect, MenuButton, MenuColumns, fieldLayout, inputLayout } from './MenuPanel';
import type { GameSession } from './useGameSession';

/** Formats a score with consistent US-English digit grouping. */
export function score(value: number): string {
    return value.toLocaleString('en-US');
}
/**
 * Formats active play time for result and record displays.
 *
 * @param elapsedMs - Active play time in milliseconds.
 * @returns Whole minutes and zero-padded seconds, discarding partial seconds.
 */
export function duration(elapsedMs: number): string {
    const seconds = Math.floor(elapsedMs / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function ProfileBody({ session }: { session: GameSession }) {
    const { store, mapVariant, account } = session;
    const cloudProfile = account.state.profile;
    const [nickname, setNickname] = useState(() => cloudProfile?.nickname ?? store.getNickname());
    const [avatar, setAvatar] = useState<AvatarChoice>(() => cloudProfile?.avatar ?? 'packet');
    const [mode, setMode] = useState<RunMode>('endless');
    const recordsMap = mode === 'endless' ? 'default' : mapVariant;
    const records = cloudProfile ? account.state.records : store.getRecords();
    const topRecords = selectRecords(records, recordsMap, mode, false);
    const recentRecords = selectRecords(records, recordsMap, mode, true);
    return (
        <>
            <CustomSelect
                ariaLabel="Records mode"
                value={mode}
                options={[{ value: 'endless', label: 'Endless' }, { value: 'classic', label: 'Classic' }]}
                onChange={setMode}
                control="records-mode"
            />
            <form
                className="grid gap-3 min-[600px]:grid-cols-[1fr_auto] min-[600px]:items-end"
                onSubmit={(event) => {
                    event.preventDefault();
                    session.claimPause();
                    if (cloudProfile) {
                        void account.updateProfile({ nickname, avatar }).then((saved) => {
                            if (!saved) return;
                            setNickname(nickname.trim().slice(0, 16) || 'PLAYER');
                            session.refresh('[data-control="nickname"]');
                        });
                    } else {
                        store.setNickname(nickname);
                        setNickname(store.getNickname());
                        session.refresh('[data-control="nickname"]');
                    }
                }}
            >
                <label className={fieldLayout}>
                    Player name
                    <input
                        className={inputLayout}
                        type="text"
                        maxLength={16}
                        autoComplete="nickname"
                        data-control="nickname"
                        value={nickname}
                        onChange={(event) => setNickname(event.target.value)}
                    />
                </label>
                {cloudProfile && (
                    <div className={fieldLayout}>
                        <span>Avatar</span>
                        <CustomSelect
                            ariaLabel="Avatar"
                            value={avatar}
                            options={AVATAR_CHOICES.map((value) => ({
                                value,
                                label:
                                    value === 'packet'
                                        ? 'The Packet'
                                        : value[0].toUpperCase() + value.slice(1),
                            }))}
                            onChange={setAvatar}
                            control="profile-avatar"
                        />
                    </div>
                )}
                <MenuButton type="submit" action="save-name">
                    Save profile
                </MenuButton>
            </form>
            {account.hasLocalImport && (
                <MenuButton
                    action="import-records"
                    onClick={() => void account.importLocalRecords()}
                    disabled={account.state.busy}
                >
                    Import local records
                </MenuButton>
            )}
            {account.state.pendingRecords.length > 0 && (
                <MenuButton
                    action="retry-cloud-save"
                    onClick={() => void account.retryPendingRecords()}
                    disabled={account.state.busy}
                >
                    Retry cloud save
                </MenuButton>
            )}
            <MenuColumns>
                <RecordSection title="TOP SCORES" records={topRecords} />
                <RecordSection title="RECENT RUNS" records={recentRecords} recent />
            </MenuColumns>
        </>
    );
}

/** Selects one top or recent record view from local or cloud retained history. */
function selectRecords(
    records: readonly LocalRunRecord[],
    map: LocalRunRecord['map'],
    mode: RunMode,
    recent: boolean
): LocalRunRecord[] {
    return records
        .filter((record) => record.map === map && (record.mode ?? 'classic') === mode)
        .sort((a, b) =>
            recent
                ? Date.parse(b.completedAt) - Date.parse(a.completedAt)
                : b.score - a.score || Date.parse(b.completedAt) - Date.parse(a.completedAt)
        )
        .slice(0, 10);
}

function RecordSection({
    title,
    records,
    recent,
}: {
    title: string;
    records: readonly LocalRunRecord[];
    recent?: boolean;
}) {
    return (
        <section>
            <h2 className="packet-record-heading mt-0">{title}</h2>
            {records.length === 0 ? (
                <p className="packet-copy">No runs yet. Your next signal starts here.</p>
            ) : (
                <ol className="packet-records m-0 list-none p-0">
                    {records.map((record, index) => (
                        <li key={record.id}>
                            <span className="packet-record-name">
                                {recent ? '' : `${index + 1}. `}
                                {record.nickname}
                                <small>
                                    {record.outcome === 'cleared' ? 'Cleared' : 'Lost'} ·{' '}
                                    {record.mode === 'endless'
                                        ? `${record.pointsCollected} bits`
                                        : `${record.levelsCleared} ${record.levelsCleared === 1 ? 'level' : 'levels'}`} ·{' '}
                                    {duration(record.elapsedMs)} ·{' '}
                                    {new Date(record.completedAt).toLocaleDateString()}
                                </small>
                            </span>
                            <strong>{score(record.score)}</strong>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
