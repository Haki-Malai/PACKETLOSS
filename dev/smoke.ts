import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { WebSocket } from 'ws';
import { z } from 'zod';
import { profileSchema, recordSchema, resultSchema } from '../backend/models.ts';
import {
    parseServerMessage,
    type ClientMessage,
    type RoomState,
    type ServerMessage,
    type WireRaceSnapshot,
} from '../src/game/protocol/messages.ts';
import { PROTOCOL_VERSION } from '../src/game/protocol/version.ts';
import { CLOCKWISE_DIRECTIONS } from '../src/game/domain/valueObjects/Direction.ts';

const portSchema = z.coerce.number().int().min(1).max(65535);
const settings = z
    .object({
        PACKETLOSS_DEV_API_PORT: portSchema,
        PACKETLOSS_DEV_WEB_PORT: portSchema,
    })
    .parse(
        Object.fromEntries(
            (await readFile('.packetloss-dev/compose.env', 'utf8'))
                .trim()
                .split('\n')
                .map((line) => line.split('=', 2))
        )
    );
const host = process.argv.includes('--localhost') ? 'localhost' : '127.0.0.1';
const api = `http://${host}:${settings.PACKETLOSS_DEV_API_PORT}`;
const origin = `http://${host}:${settings.PACKETLOSS_DEV_WEB_PORT}`;
const evidencePath = '.packetloss-dev/smoke-session.json';
const tokenSchema = z.object({
    accessToken: z.string().min(1),
    expiresIn: z.number().int().positive(),
});
const statusSchema = z.object({
    phase: z.enum(['stopped', 'starting', 'ready', 'failed', 'draining', 'stopping']),
});
const savedRecordsSchema = z.object({ records: z.array(recordSchema) });
const credentialSchema = z.object({
    ticket: z.string().min(1),
    expiresAt: z.iso.datetime(),
    websocketUrl: z.url({ protocol: /^wss?$/ }),
    processGeneration: z.string().min(1),
});
const evidenceSchema = z.object({
    cookie: z.string().min(1),
    recordId: recordSchema.shape.id,
    matchId: resultSchema.shape.matchId,
    standings: resultSchema.shape.standings,
});

interface RequestOptions {
    token?: string;
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT';
    body?: unknown;
    cookie?: string;
    status?: number;
}

interface SmokeClient {
    socket: WebSocket;
    room: RoomState | null;
    snapshot: WireRaceSnapshot | null;
    identity: string | null;
    error: Error | Extract<ServerMessage, { type: 'error' }> | null;
    sequence: number;
}

/** Calls a local public API without logging authentication material. */
async function request<T>(
    path: string,
    schema: z.ZodType<T>,
    { token, method = 'GET', body, cookie, status = 200 }: RequestOptions = {}
): Promise<{ data: T; cookie: string | undefined }> {
    if (body || token) {
        const preflight = await fetch(`${api}${path}`, {
            method: 'OPTIONS',
            headers: {
                origin,
                'access-control-request-method': method,
                'access-control-request-headers': [body && 'content-type', token && 'authorization']
                    .filter(Boolean)
                    .join(','),
            },
            signal: AbortSignal.timeout(10000),
        });
        assert.equal(preflight.status, 200, `Browser preflight failed for ${origin} ${path}`);
        assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
        assert.equal(preflight.headers.get('access-control-allow-credentials'), 'true');
    }
    const response = await fetch(`${api}${path}`, {
        method,
        headers: {
            origin,
            ...(token ? { authorization: `Bearer ${token}` } : {}),
            ...(cookie ? { cookie } : {}),
            ...(body ? { 'content-type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(10000),
    });
    assert.equal(response.status, status, `${method} ${path}: ${await response.clone().text()}`);
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
    assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
    const data: unknown = status === 204 ? null : await response.json();
    return {
        data: schema.parse(data),
        cookie: response.headers.get('set-cookie')?.split(';')[0],
    };
}

/** Polls observable protocol state within a bounded integration-test deadline. */
async function until(predicate: () => boolean, milliseconds = 10000): Promise<void> {
    const deadline = Date.now() + milliseconds;
    while (Date.now() < deadline) {
        if (predicate()) return;
        await new Promise((resolve) => setTimeout(resolve, 30));
    }
    throw new Error('Timed out waiting for local integration state');
}

/** Restricts every smoke-client command to the same protocol as the browser. */
function send(socket: WebSocket, message: ClientMessage): void {
    socket.send(JSON.stringify(message));
}

/** Runs the integration scenario and returns control to the shared runner for bundle cleanup. */
async function runSmoke(): Promise<void> {
    if (process.argv.includes('--after-restart')) {
        const evidence = evidenceSchema.parse(
            JSON.parse(await readFile(evidencePath, 'utf8')) as unknown
        );
        const restored = await request('/v1/auth/refresh', tokenSchema, {
            method: 'POST',
            cookie: evidence.cookie,
        });
        const token = restored.data.accessToken;
        const records = await request('/v1/me/records', savedRecordsSchema, { token });
        assert(
            records.data.records.some(
                (record) => record.id === evidence.recordId && record.score === 1234
            )
        );
        const result = await request(`/v1/multiplayer/matches/${evidence.matchId}`, resultSchema, {
            token,
        });
        assert.deepEqual(result.data.standings, evidence.standings);
        assert.equal((await request('/v1/multiplayer/status', statusSchema)).data.phase, 'ready');
        console.log(
            'PASS: guest refresh, score, and completed multiplayer result survived container/database restart.'
        );
        return;
    }

    assert.equal((await request('/v1/multiplayer/status', statusSchema)).data.phase, 'ready');
    const suffix = Date.now().toString(36);
    const email = `smoke-${suffix}@packetloss.local`;
    await request('/v1/auth/signup', z.object({ confirmationRequired: z.literal(true) }), {
        method: 'POST',
        status: 202,
        body: { email, password: 'a', nickname: 'SMOKE' },
    });
    await request('/v1/auth/signup', z.object({ code: z.string(), message: z.string() }), {
        method: 'POST',
        status: 409,
        body: { email, password: 'a', nickname: 'SMOKE' },
    });
    await request('/v1/auth/confirm', z.null(), {
        method: 'POST',
        status: 204,
        body: { email, code: '000000' },
    });
    await request('/v1/auth/login', tokenSchema, {
        method: 'POST',
        body: { email, password: 'a' },
    });
    await request('/v1/auth/forgot-password', z.null(), {
        method: 'POST',
        status: 204,
        body: { email },
    });
    await request('/v1/auth/reset-password', z.null(), {
        method: 'POST',
        status: 204,
        body: { email, code: '000000', password: 'b' },
    });
    await request('/v1/auth/login', tokenSchema, {
        method: 'POST',
        body: { email, password: 'b' },
    });
    console.log(
        'PASS: real Lambda signup, duplicate-account conflict, confirmation, short passwords, login, recovery.'
    );

    const guests = await Promise.all(
        Array.from({ length: 4 }, (_, index) =>
            request('/v1/auth/guest', tokenSchema, {
                method: 'POST',
                body: { nickname: `SMOKE${index + 1}` },
            })
        )
    );
    const [hostGuest, otherGuest] = guests;
    assert(hostGuest && otherGuest, 'Guest accounts were not created');
    const token = hostGuest.data.accessToken;
    const recordId = `docker-${suffix}`;
    await request('/v1/me', profileSchema, {
        token,
        method: 'PATCH',
        body: { nickname: 'DOCKER', avatar: 'virus' },
    });
    await request('/v1/me/records', savedRecordsSchema, {
        token,
        method: 'PUT',
        body: {
            records: [
                {
                    id: recordId,
                    completedAt: new Date().toISOString(),
                    map: 'default',
                    mode: 'classic',
                    nickname: 'DOCKER',
                    outcome: 'lost',
                    score: 1234,
                    lives: 0,
                    elapsedMs: 1000,
                    pointsCollected: 1,
                    totalPoints: 10,
                    levelsCleared: 0,
                },
            ],
        },
    });
    assert.equal(
        (
            await request('/v1/me/records', savedRecordsSchema, {
                token: otherGuest.data.accessToken,
            })
        ).data.records.length,
        0
    );
    console.log(
        'PASS: four independent guests, profile update, DynamoDB score storage and account isolation.'
    );

    const clients: SmokeClient[] = [];
    let inputs: ReturnType<typeof setInterval> | undefined;
    try {
        for (let index = 0; index < 4; index++) {
            const operation = index === 0 ? 'create' : 'join';
            const roomCode = clients[0]?.room?.code;
            const guest = guests[index];
            assert(guest, 'Guest account is missing');
            if (operation === 'join') assert(roomCode, 'The host has not created a room');
            const credential = await request('/v1/multiplayer/join-credentials', credentialSchema, {
                token: guest.data.accessToken,
                method: 'POST',
                body: { region: 'eu', operation, ...(roomCode ? { roomCode } : {}) },
            });
            const client: SmokeClient = {
                socket: new WebSocket(credential.data.websocketUrl, { origin }),
                room: null,
                snapshot: null,
                identity: null,
                error: null,
                sequence: 0,
            };
            clients.push(client);
            client.socket.on('error', (error) => {
                client.error = error;
            });
            client.socket.on('message', (raw) => {
                const bytes = Buffer.isBuffer(raw)
                    ? raw
                    : Array.isArray(raw)
                      ? Buffer.concat(raw)
                      : Buffer.from(raw);
                const message = parseServerMessage(bytes.toString('utf8'));
                if (!message) {
                    client.error = new Error('Server sent a malformed protocol message');
                    return;
                }
                if (message.type === 'authenticated') client.identity = message.playerId;
                if (message.type === 'room') client.room = message.room;
                if (message.type === 'snapshot') client.snapshot = message.snapshot;
                if (message.type === 'error') client.error = message;
            });
            await until(() => client.socket.readyState === WebSocket.OPEN || client.error !== null);
            assert.equal(client.error, null);
            send(client.socket, {
                type: 'authenticate',
                version: PROTOCOL_VERSION,
                ticket: credential.data.ticket,
            });
            await until(() => client.identity !== null || client.error !== null);
            assert.equal(client.error, null);
            if (operation === 'create') send(client.socket, { type: 'create' });
            else {
                assert(roomCode, 'The host has not created a room');
                send(client.socket, { type: 'join', code: roomCode });
            }
            await until(() => client.room !== null || client.error !== null);
            assert.equal(client.error, null);
        }
        const owner = clients[0];
        assert(owner, 'The host client is missing');
        clients.forEach(({ socket }) => send(socket, { type: 'ready', ready: true }));
        await until(() => owner.room?.canStart === true);
        send(owner.socket, { type: 'start' });
        await until(() => clients.every((client) => client.snapshot?.phase === 'playing'));
        console.log(
            'PASS: four guests joined, readied, and started a synchronized match. Waiting for the full 180-second game.'
        );
        inputs = setInterval(() => {
            clients.forEach((client, index) => {
                // Stop before the deadline so an in-flight test input cannot arrive after completion.
                if (!client.snapshot?.movementEnabled || client.snapshot.playTicks >= 179 * 60)
                    return;
                const sequence = ++client.sequence;
                const direction =
                    CLOCKWISE_DIRECTIONS[
                        (Math.floor(sequence / 12) + index) % CLOCKWISE_DIRECTIONS.length
                    ];
                assert(direction, 'Input direction is missing');
                send(client.socket, {
                    type: 'input',
                    matchId: client.snapshot.matchId,
                    sequence,
                    targetTick: client.snapshot.tick + 3,
                    direction,
                });
            });
        }, 250);
        await until(() => clients.every((client) => client.room?.phase === 'results'), 200000);
        clearInterval(inputs);
        const finalSnapshot = owner.snapshot;
        assert(finalSnapshot, 'The host did not receive a final snapshot');
        const matchId = finalSnapshot.matchId;
        clients.forEach((client) => {
            assert.equal(client.error, null);
            const snapshot = client.snapshot;
            assert(snapshot, 'A client did not receive a final snapshot');
            assert.equal(snapshot.phase, 'finished', snapshot.abortReason ?? 'Match aborted');
            assert.deepEqual(snapshot.rankings, finalSnapshot.rankings);
        });
        const result = await request(`/v1/multiplayer/matches/${matchId}`, resultSchema, { token });
        assert.equal(result.data.outcome, 'completed');
        assert.equal(result.data.standings.length, 4);
        assert(result.data.standings.some((standing) => standing.score > 0));
        const evidence = evidenceSchema.parse({
            cookie: hostGuest.cookie,
            recordId,
            matchId,
            standings: result.data.standings,
        });
        await writeFile(evidencePath, JSON.stringify(evidence), { mode: 0o600 });
        send(owner.socket, { type: 'rematch' });
        await until(() => clients.every((client) => client.room?.phase === 'lobby'));
        assert(owner.room, 'The host did not receive the rematch lobby');
        assert(owner.room.players.every((player) => !player.ready));
        clients.forEach(({ socket }) => send(socket, { type: 'leave' }));
        console.log(
            'PASS: completed match, consistent rankings, persisted results, and fresh rematch lobby.'
        );
    } finally {
        clearInterval(inputs);
        clients.forEach(({ socket }) => socket.terminate());
    }
}

await runSmoke();
