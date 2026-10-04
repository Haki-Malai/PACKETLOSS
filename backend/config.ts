import { z } from 'zod';
import type { Region } from './models';

export interface Settings {
    stage: string;
    tableName: string;
    userPoolId: string;
    userPoolClientId: string;
    userPoolClientSecret: string;
    siteOrigin: string;
    refreshCookieName: string;
    signupDailyLimit: number;
    signupAccountLimit: number;
    maxPayloadBytes: number;
}
export interface RegionSettings {
    awsRegion: string;
    instanceId: string;
    websocketUrl: string;
}
export interface MultiplayerSettings {
    stage: string;
    controlTable: string;
    ticketsTable: string;
    resultsTable: string;
    profileTable: string;
    controlRegion: string;
    ownerSub: string;
    siteOrigin: string;
    regions: Record<Region, RegionSettings>;
    heartbeatMaxAge: number;
    startupTimeout: number;
    maximumUptime: number;
}
export interface DevelopmentSettings {
    dynamodbEndpoint: string;
    authKey: string;
    internalToken: string;
    runId: string;
    processGeneration: string;
    siteOrigin: string;
    websocketUrl: string;
}
/** Require configured values at cold start rather than guessing infrastructure identities. */
function required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing ${name}`);
    return value;
}
/** Load the account Lambda's confidential environment contract. */
export function accountSettings(): Settings {
    return {
        stage: required('STAGE'),
        tableName: required('TABLE_NAME'),
        userPoolId: required('USER_POOL_ID'),
        userPoolClientId: required('USER_POOL_CLIENT_ID'),
        userPoolClientSecret: required('USER_POOL_CLIENT_SECRET'),
        siteOrigin: required('SITE_ORIGIN'),
        refreshCookieName: process.env.REFRESH_COOKIE_NAME ?? 'packetloss_refresh',
        signupDailyLimit: Number(process.env.SIGNUP_DAILY_LIMIT ?? 30),
        signupAccountLimit: Number(process.env.SIGNUP_ACCOUNT_LIMIT ?? 1000),
        maxPayloadBytes: Number(process.env.MAX_PAYLOAD_BYTES ?? 16384),
    };
}
/** Load the control Lambda without accepting account secrets or arbitrary regional targets. */
export function multiplayerSettings(): MultiplayerSettings {
    const target = z.strictObject({
        awsRegion: z.string().min(1),
        instanceId: z.string().min(1),
        websocketUrl: z.string().refine((value) => {
            const url = new URL(value);
            return url.protocol === 'wss:' && !!url.hostname && !url.username && !url.password;
        }),
    });
    const regions = z
        .strictObject({ eu: target, na: target })
        .parse(JSON.parse(required('MULTIPLAYER_REGIONS_JSON')) as unknown);
    const ownerSub = required('MULTIPLAYER_OWNER_SUB').trim();
    if (!ownerSub) throw new Error('MULTIPLAYER_OWNER_SUB must identify one owner');
    return {
        stage: process.env.STAGE ?? 'prod',
        controlTable: required('CONTROL_TABLE'),
        ticketsTable: required('TICKETS_TABLE'),
        resultsTable: required('RESULTS_TABLE'),
        profileTable: required('PROFILE_TABLE_NAME'),
        controlRegion: process.env.MULTIPLAYER_CONTROL_REGION ?? 'us-east-1',
        ownerSub,
        siteOrigin: required('SITE_ORIGIN'),
        regions,
        heartbeatMaxAge: 30,
        startupTimeout: 180,
        maximumUptime: 14400,
    };
}
/** Recognize loopback literals and localhost without DNS or remote address resolution. */
export function isLoopback(host: string): boolean {
    return (
        host === 'localhost' ||
        host === '::1' ||
        host === '[::1]' ||
        (/^127(?:\.(?:\d{1,3})){3}$/.test(host) &&
            host.split('.').every((part) => Number(part) <= 255))
    );
}
/** Reject development configuration that would expose local credentials remotely. */
export function validateDevelopment(settings: DevelopmentSettings): void {
    if (Buffer.byteLength(settings.authKey) < 32 || Buffer.byteLength(settings.internalToken) < 32)
        throw new Error('Development secrets must contain at least 32 bytes');
    if (
        ![settings.runId, settings.processGeneration].every(
            (value) => value.length >= 1 && value.length <= 128
        )
    )
        throw new Error('Development run and process identifiers must be 1-128 characters');
    for (const [value, scheme] of [
        [settings.siteOrigin, 'http:'],
        [settings.websocketUrl, 'ws:'],
    ]) {
        const url = new URL(value);
        if (url.protocol !== scheme || url.username || url.password || !isLoopback(url.hostname))
            throw new Error('Development URL must use a loopback host');
    }
}
/** Load only the launcher's explicit local settings. */
export function developmentSettings(): DevelopmentSettings {
    const settings = {
        dynamodbEndpoint: required('PACKETLOSS_DEV_DYNAMODB_ENDPOINT'),
        authKey: required('PACKETLOSS_DEV_AUTH_KEY'),
        internalToken: required('PACKETLOSS_DEV_INTERNAL_TOKEN'),
        runId: required('PACKETLOSS_DEV_RUN_ID'),
        processGeneration: required('PACKETLOSS_DEV_PROCESS_GENERATION'),
        siteOrigin: required('PACKETLOSS_DEV_SITE_ORIGIN'),
        websocketUrl: required('PACKETLOSS_DEV_WEBSOCKET_URL'),
    };
    validateDevelopment(settings);
    return settings;
}
/** Allow the two documented browser aliases at the configured frontend port. */
export function browserOrigins(settings: DevelopmentSettings): string[] {
    const port = new URL(settings.siteOrigin).port;
    return [
        ...new Set([
            settings.siteOrigin,
            ...['127.0.0.1', 'localhost'].map((host) => `http://${host}${port ? `:${port}` : ''}`),
        ]),
    ];
}
