import { randomBytes, randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { DevelopmentAdapters } from './DevelopmentAdapters';
import { DevelopmentPlayers } from './DevelopmentPlayers';
import { createGameServer } from './httpServer';
import { RoomService } from './RoomService';

const LOOPBACK = '127.0.0.1';

/** Starts the AWS-free authoritative server used only by the local development launcher. */
export async function main(): Promise<void> {
    requireDevelopmentMode();
    const instanceRunId = required('PACKETLOSS_DEV_RUN_ID');
    const processGeneration = randomUUID();
    const internalToken = required('PACKETLOSS_DEV_INTERNAL_TOKEN');
    const siteOrigin = required('PACKETLOSS_DEV_SITE_ORIGIN');
    const apiOrigin = required('PACKETLOSS_DEV_API_URL');
    const soloDevelopment = booleanSetting('PACKETLOSS_DEV_SOLO', false);
    const botCount = soloDevelopment ? 0 : numberSetting('PACKETLOSS_DEV_BOTS', 2, 0, 3);
    const gamePort = numberSetting('PACKETLOSS_DEV_GAME_PORT', 8080, 1, 65535);
    const adapters = new DevelopmentAdapters({
        apiOrigin,
        internalToken,
        instanceRunId,
        processGeneration,
        outboxDirectory: process.env.PACKETLOSS_DEV_OUTBOX ?? '.packetloss-dev/data/outbox',
    });
    await adapters.register();
    await adapters.recover();
    const rooms = new RoomService({
        results: adapters,
        now: () => performance.now(),
        epochNow: () => Date.now(),
        snapshotHz: numberSetting('PACKETLOSS_DEV_SNAPSHOT_HZ', 20, 1, 30),
        instanceRunId,
        processGeneration,
        soloDevelopment,
        randomId: randomUUID,
        randomSeed: () => randomBytes(4).readUInt32LE(),
        randomCode: () => {
            const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            return [...randomBytes(6)].map((value) => alphabet[value % alphabet.length]).join('');
        },
    });
    rooms.setControlHealthy(false);
    const game = createGameServer({
        rooms,
        tickets: adapters,
        allowedOrigins: localBrowserOrigins(siteOrigin),
        adminToken: internalToken,
        instanceRunId,
        processGeneration,
        onResume: async () => {
            if (!(await adapters.heartbeat(rooms.status())))
                throw new Error('Local control has no active run.');
        },
        maximumUptimeMs: numberSetting(
            'PACKETLOSS_DEV_MAXIMUM_UPTIME_MS',
            4 * 60 * 60 * 1000,
            3 * 60 * 1000,
            7 * 24 * 60 * 60 * 1000
        ),
    });
    try {
        await Promise.all([
            listen(game.server, gamePort),
            listen(game.adminServer, numberSetting('PACKETLOSS_DEV_ADMIN_PORT', 8081, 1, 65535)),
        ]);
    } catch (error) {
        game.dispose();
        throw error;
    }

    let heartbeatPending = false;
    /** Refreshes the local generation fence without letting overlapping requests accumulate. */
    const heartbeat = async (): Promise<void> => {
        if (heartbeatPending) return;
        heartbeatPending = true;
        try {
            rooms.setControlHealthy(await adapters.heartbeat(rooms.status()));
        } catch {
            rooms.setControlHealthy(false);
        } finally {
            heartbeatPending = false;
        }
    };
    await heartbeat();
    const bots = new DevelopmentPlayers({
        count: botCount, apiOrigin, siteOrigin,
        websocketUrl: `ws://${LOOPBACK}:${gamePort}/ws`,
        rooms: () => rooms.roomStates(),
    });
    const heartbeatTimer = setInterval(() => {
        void heartbeat();
    }, 1000);
    let stopping = false;
    /** Releases listeners and timers exactly once when the supervisor stops this child. */
    const stop = (): void => {
        if (stopping) return;
        stopping = true;
        clearInterval(heartbeatTimer);
        bots.dispose();
        game.dispose();
    };
    process.once('SIGTERM', stop);
    process.once('SIGINT', stop);
}

/** Accepts the configured local frontend port through either browser loopback alias. */
export function localBrowserOrigins(siteOrigin: string): string[] {
    const origin = new URL(siteOrigin);
    if (origin.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(origin.hostname)) {
        throw new Error('The development frontend must use a loopback HTTP origin.');
    }
    return ['127.0.0.1', 'localhost'].map((hostname) => {
        origin.hostname = hostname;
        return origin.origin;
    });
}

/** Rejects accidental direct use outside the explicit development launcher. */
function requireDevelopmentMode(): void {
    if (process.env.PACKETLOSS_LOCAL_DEVELOPMENT !== '1') {
        throw new Error('PACKETLOSS_LOCAL_DEVELOPMENT=1 is required.');
    }
}

/** Reads one required non-empty environment setting. */
function required(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`${name} is required.`);
    return value;
}

/** Reads and bounds an integer environment setting. */
function numberSetting(name: string, fallback: number, minimum: number, maximum: number): number {
    const value = process.env[name] === undefined ? fallback : Number(process.env[name]);
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
        throw new Error(`${name} must be an integer from ${minimum} through ${maximum}.`);
    }
    return value;
}

/** Reads a strict zero-or-one development flag without accepting ambiguous values. */
function booleanSetting(name: string, fallback: boolean): boolean {
    const value = process.env[name];
    if (value === undefined) return fallback;
    if (value === '0') return false;
    if (value === '1') return true;
    throw new Error(`${name} must be 0 or 1.`);
}

/** Resolves only after a loopback listener is bound. */
function listen(server: Server, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const failed = (error: Error): void => {
            reject(error);
        };
        server.once('error', failed);
        server.listen(
            port,
            process.env.PACKETLOSS_DEV_CONTAINER === '1' ? '0.0.0.0' : LOOPBACK,
            () => {
                server.off('error', failed);
                resolve();
            }
        );
    });
}

if (import.meta.main) {
    void main().catch((error: unknown) => {
        console.error(
            error instanceof Error ? error.message : 'Development game server startup failed.'
        );
        process.exitCode = 1;
    });
}
