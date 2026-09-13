import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    LocalProfileStore,
    type LocalRunRecord,
} from '../game/infrastructure/adapters/LocalProfileStore';

const KEY = 'packetloss.profile.v1';

function memoryStorage(initial?: string): Pick<Storage, 'getItem' | 'setItem'> {
    const values = new Map<string, string>(initial === undefined ? [] : [[KEY, initial]]);
    return {
        getItem: vi.fn((key: string) => values.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
            values.set(key, value);
        }),
    };
}

function run(overrides: Partial<LocalRunRecord> = {}): LocalRunRecord {
    return {
        id: 'run-1',
        completedAt: '2026-09-13T12:00:00.000Z',
        map: 'default',
        nickname: 'PLAYER',
        outcome: 'lost',
        score: 120,
        lives: 0,
        elapsedMs: 4_500,
        pointsCollected: 12,
        totalPoints: 40,
        ...overrides,
    };
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('LocalProfileStore', () => {
    it('persists a normalized nickname, motion, and completed run across reloads', () => {
        const storage = memoryStorage();
        const store = new LocalProfileStore(storage);
        expect(store.getNickname()).toBe('PLAYER');
        expect(store.getMotion()).toBe('system');

        store.setNickname('  <b>PACKET</b>  ');
        store.setMotion('reduced');
        const record = run({ nickname: store.getNickname() });
        store.saveRun(record);

        const reloaded = new LocalProfileStore(storage);
        expect(reloaded.getNickname()).toBe('<b>PACKET</b>');
        expect(reloaded.getMotion()).toBe('reduced');
        expect(reloaded.getTopRecords('default')).toEqual([record]);
        expect(reloaded.getStatusMessage()).toBe('');
        expect(storage.setItem).toHaveBeenCalledWith(KEY, expect.any(String));

        reloaded.setNickname(' abcdefghijklmnopq ');
        expect(reloaded.getNickname()).toBe('abcdefghijklmnop');
        reloaded.setNickname(' \t ');
        expect(new LocalProfileStore(storage).getNickname()).toBe('PLAYER');
    });

    it('keeps top and recent runs independently, separates maps, and deduplicates IDs', () => {
        const storage = memoryStorage();
        const store = new LocalProfileStore(storage);
        for (let day = 1; day <= 22; day += 1) {
            store.saveRun(
                run({
                    id: `default-${day}`,
                    score: 1000 - day,
                    completedAt: `2026-08-${String(day).padStart(2, '0')}T12:00:00Z`,
                })
            );
        }
        store.saveRun(run({ id: 'demo-1', map: 'demo', score: 50_000 }));
        store.saveRun(run({ id: 'default-1', score: 99_999 }));

        const reloaded = new LocalProfileStore(storage);
        expect(reloaded.getTopRecords('default').map((record) => record.id)).toEqual([
            'default-1',
            'default-2',
            'default-3',
            'default-4',
            'default-5',
            'default-6',
            'default-7',
            'default-8',
            'default-9',
            'default-10',
        ]);
        expect(reloaded.getRecentRecords('default').map((record) => record.id)).toEqual([
            'default-22',
            'default-21',
            'default-20',
            'default-19',
            'default-18',
            'default-17',
            'default-16',
            'default-15',
            'default-14',
            'default-13',
        ]);
        expect(reloaded.getTopRecords('default')[0].score).toBe(999);
        expect(reloaded.getTopRecords('demo').map((record) => record.id)).toEqual(['demo-1']);

        const writesBeforeDuplicate = vi.mocked(storage.setItem).mock.calls.length;
        reloaded.saveRun(run({ id: 'default-1', score: 99_999 }));
        expect(storage.setItem).toHaveBeenCalledTimes(writesBeforeDuplicate);
    });

    it('breaks tied scores by actual completion time, including time zone offsets', () => {
        const store = new LocalProfileStore(memoryStorage());
        store.saveRun(run({ id: 'earlier', completedAt: '2026-09-13T14:00:00+03:00' }));
        store.saveRun(run({ id: 'later', completedAt: '2026-09-13T12:00:00Z' }));
        expect(store.getTopRecords('default').map((record) => record.id)).toEqual([
            'later',
            'earlier',
        ]);
    });

    it('clears records for both maps while preserving preferences and ignoring late duplicates', () => {
        const storage = memoryStorage();
        const store = new LocalProfileStore(storage);
        store.setNickname('ENEMY');
        store.setMotion('full');
        store.saveRun(run());
        store.saveRun(run({ id: 'demo-1', map: 'demo' }));
        store.clearRecords();
        store.saveRun(run());

        const reloaded = new LocalProfileStore(storage);
        expect(reloaded.getTopRecords('default')).toEqual([]);
        expect(reloaded.getRecentRecords('demo')).toEqual([]);
        expect(reloaded.getNickname()).toBe('ENEMY');
        expect(reloaded.getMotion()).toBe('full');
    });

    it.each([
        'invalid json',
        JSON.stringify({ version: 2, nickname: 'OLD', motion: 'system', records: [] }),
        JSON.stringify({ version: 1, nickname: 'OLD', motion: 'unknown', records: [] }),
        JSON.stringify({
            version: 1,
            nickname: 'OLD',
            motion: 'system',
            records: [run({ score: -1 })],
        }),
        JSON.stringify({
            version: 1,
            nickname: 'OLD',
            motion: 'system',
            records: [run({ elapsedMs: Infinity })],
        }),
        JSON.stringify({
            version: 1,
            nickname: 'OLD',
            motion: 'system',
            records: [run({ completedAt: 'yesterday' })],
        }),
        JSON.stringify({
            version: 1,
            nickname: 'OLD',
            motion: 'system',
            records: [{ ...run(), map: 'unknown' }],
        }),
        JSON.stringify({
            version: 1,
            nickname: 'OLD',
            motion: 'system',
            records: [{ ...run(), outcome: 'unknown' }],
        }),
    ])('recovers from malformed or unsupported data: %s', (saved) => {
        const storage = memoryStorage(saved);
        const store = new LocalProfileStore(storage);
        expect(store.getNickname()).toBe('PLAYER');
        expect(store.getMotion()).toBe('system');
        expect(store.getRecentRecords('default')).toEqual([]);
        expect(store.getStatusMessage()).toContain('fresh profile');

        store.saveRun(run());
        expect(new LocalProfileStore(storage).getRecentRecords('default')).toHaveLength(1);
        expect(store.getStatusMessage()).toBe('');
    });

    it('keeps settings and records usable when storage reads or writes fail', () => {
        const store = new LocalProfileStore({
            getItem: () => {
                throw new Error('Blocked');
            },
            setItem: () => {
                throw new Error('Quota exceeded');
            },
        });
        expect(store.getStatusMessage()).toContain('this visit only');
        store.setNickname('LOCAL');
        store.setMotion('reduced');
        store.saveRun(run());
        expect(store.getNickname()).toBe('LOCAL');
        expect(store.getMotion()).toBe('reduced');
        expect(store.getRecentRecords('default')).toEqual([run()]);
        expect(store.getStatusMessage()).toContain('this visit only');
    });

    it('handles browser denial when accessing the localStorage property', () => {
        vi.stubGlobal('window', {
            get localStorage(): Storage {
                throw new Error('Access denied');
            },
        });
        const store = new LocalProfileStore();
        store.saveRun(run());
        expect(store.getRecentRecords('default')).toEqual([run()]);
        expect(store.getStatusMessage()).toContain('this visit only');
    });
});
