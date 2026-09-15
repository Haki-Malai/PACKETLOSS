import { useState } from 'react';
import type { LocalRunRecord } from '../infrastructure/adapters/LocalProfileStore';
import { MenuButton, MenuColumns, fieldLayout, inputLayout } from './MenuPanel';
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
    const { store, mapVariant } = session;
    const [nickname, setNickname] = useState(() => store.getNickname());
    return (
        <>
            <form
                className="grid gap-3 min-[600px]:grid-cols-[1fr_auto] min-[600px]:items-end"
                onSubmit={(event) => {
                    event.preventDefault();
                    session.claimPause();
                    store.setNickname(nickname);
                    setNickname(store.getNickname());
                    session.refresh('[data-control="nickname"]');
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
                <MenuButton type="submit" action="save-name">
                    Save name
                </MenuButton>
            </form>
            <MenuColumns>
                <RecordSection title="TOP SCORES" records={store.getTopRecords(mapVariant)} />
                <RecordSection
                    title="RECENT RUNS"
                    records={store.getRecentRecords(mapVariant)}
                    recent
                />
            </MenuColumns>
        </>
    );
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
                                    {record.levelsCleared}{' '}
                                    {record.levelsCleared === 1 ? 'level' : 'levels'} ·{' '}
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
