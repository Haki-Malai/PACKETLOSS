import type { RunResult } from '../../app/contracts';
import type { RunMode } from '../../app/contracts';
import type { MapVariant } from '../../app/mapRuntimeConfig';

export type MenuMotion = 'system' | 'reduced' | 'full';

export interface LocalRunRecord extends RunResult {
    id: string;
    completedAt: string;
    map: MapVariant;
    nickname: string;
}

interface LocalProfile {
    version: 2;
    nickname: string;
    motion: MenuMotion;
    records: LocalRunRecord[];
}

type ProfileStorage = Pick<Storage, 'getItem' | 'setItem'>;
type LegacyRunRecord = Omit<LocalRunRecord, 'levelsCleared'>;

const STORAGE_KEY = 'packetloss.profile.v2';
const LEGACY_STORAGE_KEY = 'packetloss.profile.v1';
const STORAGE_UNAVAILABLE = 'Local saving is unavailable. Changes last for this visit only.';

function normalizeNickname(value: string): string {
    return value.trim().slice(0, 16) || 'PLAYER';
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMotion(value: unknown): value is MenuMotion {
    return value === 'system' || value === 'reduced' || value === 'full';
}

function isNonnegativeNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isRunRecordBase(value: unknown): value is LegacyRunRecord & Record<string, unknown> {
    if (!isObject(value)) return false;
    return (
        typeof value.id === 'string' &&
        value.id.length > 0 &&
        typeof value.completedAt === 'string' &&
        Number.isFinite(Date.parse(value.completedAt)) &&
        (value.map === 'default' || value.map === 'demo') &&
        (value.mode === undefined || value.mode === 'classic' || value.mode === 'endless') &&
        typeof value.nickname === 'string' &&
        (value.outcome === 'lost' || value.outcome === 'cleared') &&
        isNonnegativeNumber(value.score) &&
        isNonnegativeNumber(value.lives) &&
        isNonnegativeNumber(value.elapsedMs) &&
        isNonnegativeNumber(value.pointsCollected) &&
        isNonnegativeNumber(value.totalPoints) &&
        value.pointsCollected <= value.totalPoints
    );
}

function isRunRecord(value: unknown): value is LocalRunRecord {
    return (
        isRunRecordBase(value) &&
        Number.isInteger(value.levelsCleared) &&
        isNonnegativeNumber(value.levelsCleared)
    );
}

function isLegacyRunRecord(value: unknown): value is LegacyRunRecord {
    return isRunRecordBase(value) && value.levelsCleared === undefined;
}

/** Converts a validated current or legacy record into the current stored shape. */
function normalizeRecord(record: LocalRunRecord | LegacyRunRecord): LocalRunRecord {
    return {
        ...record,
        mode: record.mode ?? 'classic',
        nickname: normalizeNickname(record.nickname),
        levelsCleared:
            'levelsCleared' in record ? record.levelsCleared : record.outcome === 'cleared' ? 1 : 0,
    };
}

function recentFirst(a: LocalRunRecord, b: LocalRunRecord): number {
    return Date.parse(b.completedAt) - Date.parse(a.completedAt);
}

function bestFirst(a: LocalRunRecord, b: LocalRunRecord): number {
    return b.score - a.score || recentFirst(a, b);
}

function retainedRecords(records: LocalRunRecord[]): LocalRunRecord[] {
    const retained = new Map<string, LocalRunRecord>();
    for (const [map, mode] of [['default', 'classic'], ['demo', 'classic'], ['default', 'endless']] as const) {
        const forMap = records.filter((record) => record.map === map && (record.mode ?? 'classic') === mode);
        for (const record of [
            ...[...forMap].sort(bestFirst).slice(0, 10),
            ...[...forMap].sort(recentFirst).slice(0, 10),
        ]) {
            if (!retained.has(record.id)) retained.set(record.id, record);
        }
    }
    return [...retained.values()];
}

export class LocalProfileStore {
    private profile: LocalProfile = {
        version: 2,
        nickname: 'PLAYER',
        motion: 'system',
        records: [],
    };
    private storage?: ProfileStorage;
    private statusMessage = '';
    private readonly savedIds = new Set<string>();

    constructor(storage?: ProfileStorage) {
        try {
            this.storage = storage ?? window.localStorage;
            const currentRaw = this.storage.getItem(STORAGE_KEY);
            const legacy = currentRaw === null;
            const raw = currentRaw ?? this.storage.getItem(LEGACY_STORAGE_KEY);
            if (raw === null) return;

            const value: unknown = JSON.parse(raw);
            if (
                !isObject(value) ||
                (legacy ? value.version !== 1 : value.version !== 2) ||
                typeof value.nickname !== 'string' ||
                !isMotion(value.motion) ||
                !Array.isArray(value.records) ||
                !value.records.every(legacy ? isLegacyRunRecord : isRunRecord)
            ) {
                this.statusMessage = 'Saved local data could not be read. Using a fresh profile.';
                return;
            }
            this.profile = {
                version: 2,
                nickname: normalizeNickname(value.nickname),
                motion: value.motion,
                records: retainedRecords(value.records.map(normalizeRecord)),
            };
            for (const record of this.profile.records) this.savedIds.add(record.id);
            if (legacy) this.persist();
        } catch (error) {
            this.statusMessage =
                error instanceof SyntaxError
                    ? 'Saved local data could not be read. Using a fresh profile.'
                    : STORAGE_UNAVAILABLE;
        }
    }

    getNickname(): string {
        return this.profile.nickname;
    }

    setNickname(value: string): void {
        this.profile.nickname = normalizeNickname(value);
        this.persist();
    }

    getMotion(): MenuMotion {
        return this.profile.motion;
    }

    setMotion(value: MenuMotion): void {
        this.profile.motion = value;
        this.persist();
    }

    getTopRecords(map: MapVariant, mode: RunMode = 'classic'): readonly LocalRunRecord[] {
        return this.recordsForMap(map, mode, bestFirst);
    }

    getRecentRecords(map: MapVariant, mode: RunMode = 'classic'): readonly LocalRunRecord[] {
        return this.recordsForMap(map, mode, recentFirst);
    }

    saveRun(record: LocalRunRecord): void {
        if (!isRunRecord(record) || this.savedIds.has(record.id)) return;
        this.savedIds.add(record.id);
        this.profile.records = retainedRecords([
            ...this.profile.records,
            normalizeRecord(record),
        ]);
        this.persist();
    }

    clearRecords(): void {
        this.profile.records = [];
        this.persist();
    }

    getStatusMessage(): string {
        return this.statusMessage;
    }

    private recordsForMap(
        map: MapVariant,
        mode: RunMode,
        compare: (a: LocalRunRecord, b: LocalRunRecord) => number
    ): LocalRunRecord[] {
        return this.profile.records
            .filter((record) => record.map === map && (record.mode ?? 'classic') === mode)
            .sort(compare)
            .slice(0, 10)
            .map((record) => ({ ...record }));
    }

    private persist(): void {
        try {
            if (!this.storage) {
                this.statusMessage = STORAGE_UNAVAILABLE;
                return;
            }
            this.storage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
            this.statusMessage = '';
        } catch {
            this.statusMessage = STORAGE_UNAVAILABLE;
        }
    }
}
