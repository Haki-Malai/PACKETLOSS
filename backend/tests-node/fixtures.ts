import { PROTOCOL_VERSION } from '../../src/game/protocol/version';
import { vi } from 'vitest';
import type { Settings } from '../config';
import { localMultiplayerSettings } from '../local-repository';
import type { AuthGateway } from '../auth';
import type { ProfileRepository } from '../profile-repository';
import type { MultiplayerRepository } from '../multiplayer-repository';
import type { ControlRecord, MatchRecord, Profile, RunRecord } from '../models';
import type { GatewayEvent, GatewayResponse } from '../http';

export const settings: Settings = {
    stage: 'test',
    tableName: 'profiles',
    userPoolId: 'pool',
    userPoolClientId: 'client',
    userPoolClientSecret: 's'.repeat(32),
    siteOrigin: 'https://packetloss.example',
    refreshCookieName: 'packetloss_refresh',
    signupDailyLimit: 30,
    signupAccountLimit: 1000,
    maxPayloadBytes: 16384,
};
export const multiplayerSettings = {
    ...localMultiplayerSettings(settings.siteOrigin, 'wss://game.example/ws'),
    stage: 'test',
    ownerSub: 'owner',
};
export const ready: ControlRecord = {
    revision: 1,
    lifecycle: 'ready',
    activeRegion: 'eu',
    instanceId: 'local-eu',
    instanceRunId: 'run',
    processGeneration: 'generation',
    startedAt: 900,
    heartbeatAt: 1000,
    uptimeDeadline: 15000,
    protocolVersion: PROTOCOL_VERSION,
};
export const runRecord: RunRecord = {
    id: 'run-1',
    completedAt: '2026-10-04T12:00:00Z',
    map: 'default',
    mode: 'classic',
    nickname: 'PLAYER',
    outcome: 'lost',
    score: 123,
    lives: 0,
    elapsedMs: 1000,
    pointsCollected: 1,
    totalPoints: 10,
    levelsCleared: 0,
};
/** Provide explicit injectable account behavior while retaining call evidence. */
export function accountDependencies() {
    const auth = {
        signup: vi.fn<AuthGateway['signup']>().mockResolvedValue('subject'),
        confirmSignup: vi.fn<AuthGateway['confirmSignup']>().mockResolvedValue(),
        resendConfirmation: vi.fn<AuthGateway['resendConfirmation']>().mockResolvedValue(),
        login: vi
            .fn<AuthGateway['login']>()
            .mockResolvedValue({
                idToken: 'id',
                expiresIn: 3600,
                refreshToken: 'refresh',
                subject: 'subject',
            }),
        refresh: vi
            .fn<AuthGateway['refresh']>()
            .mockResolvedValue({ idToken: 'new-id', expiresIn: 3600 }),
        logout: vi.fn<AuthGateway['logout']>().mockResolvedValue(),
        forgotPassword: vi.fn<AuthGateway['forgotPassword']>().mockResolvedValue(),
        resetPassword: vi.fn<AuthGateway['resetPassword']>().mockResolvedValue(),
        packRefreshCookie: vi
            .fn<AuthGateway['packRefreshCookie']>()
            .mockReturnValue('signed-cookie'),
    };
    const repository = {
        reserveSignup: vi.fn<ProfileRepository['reserveSignup']>().mockResolvedValue('reservation'),
        releaseSignup: vi.fn<ProfileRepository['releaseSignup']>().mockResolvedValue(),
        putProfile: vi.fn<ProfileRepository['putProfile']>().mockResolvedValue(),
        getProfile: vi
            .fn<ProfileRepository['getProfile']>()
            .mockResolvedValue({ nickname: 'PLAYER', avatar: 'packet' }),
        getRecords: vi.fn<ProfileRepository['getRecords']>().mockResolvedValue([]),
        saveRecords: vi.fn<ProfileRepository['saveRecords']>().mockResolvedValue([runRecord]),
        clearRecords: vi.fn<ProfileRepository['clearRecords']>().mockResolvedValue(),
    };
    return { auth, repository };
}
/** Provide lifecycle adapters whose mutations can be checked independently of AWS. */
export function controlDependencies() {
    const repository = {
        getControl: vi.fn<MultiplayerRepository['getControl']>().mockResolvedValue({ ...ready }),
        replaceControl: vi.fn<MultiplayerRepository['replaceControl']>().mockResolvedValue(true),
        failStart: vi.fn<MultiplayerRepository['failStart']>().mockResolvedValue(),
        limit: vi.fn<MultiplayerRepository['limit']>().mockResolvedValue(),
        getProfile: vi
            .fn<MultiplayerRepository['getProfile']>()
            .mockResolvedValue({ nickname: 'TRUSTED', avatar: 'virus' } as Profile),
        putTicket: vi.fn<MultiplayerRepository['putTicket']>().mockResolvedValue(),
        getMatch: vi
            .fn<MultiplayerRepository['getMatch']>()
            .mockResolvedValue(undefined as MatchRecord | undefined),
        operatorPhase: vi
            .fn<MultiplayerRepository['operatorPhase']>()
            .mockImplementation((expected, phase) =>
                Promise.resolve({ ...expected, lifecycle: phase, revision: expected.revision + 1 })
            ),
    };
    const instances = {
        states: vi
            .fn<() => Promise<{ eu: string; na: string }>>()
            .mockResolvedValue({ eu: 'running', na: 'stopped' }),
        start: vi.fn<(region: 'eu' | 'na') => Promise<void>>().mockResolvedValue(),
        stop: vi.fn<(region: 'eu' | 'na') => Promise<void>>().mockResolvedValue(),
        prepareStop: vi
            .fn()
            .mockResolvedValue({ safeToStop: true, activeMatches: 0, pendingResults: 0 }),
    };
    return { repository, instances };
}
/** Build the actual Lambda envelope used by API Gateway and the local emulator gateway. */
export function event(
    path: string,
    method = 'GET',
    body?: unknown,
    subject?: string
): GatewayEvent {
    return {
        version: '2.0',
        rawPath: path,
        headers: { origin: settings.siteOrigin, ...(subject ? { 'x-test-user': subject } : {}) },
        requestContext: { http: { method, path, sourceIp: '127.0.0.1' } },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    };
}
/** Parse response JSON as unknown until a test explicitly narrows its shape. */
export function json(response: GatewayResponse): unknown {
    return JSON.parse(response.body) as unknown;
}
