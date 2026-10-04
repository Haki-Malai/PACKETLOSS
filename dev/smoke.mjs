import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { WebSocket } from 'ws';
import { PROTOCOL_VERSION } from '../src/game/protocol/version.ts';

const settings = Object.fromEntries(
    (await readFile('.packetloss-dev/compose.env', 'utf8'))
        .trim()
        .split('\n')
        .map((line) => line.split('=', 2))
);
const host = process.argv.includes('--localhost') ? 'localhost' : '127.0.0.1';
const api = `http://${host}:${settings.PACKETLOSS_DEV_API_PORT}`;
const origin = `http://${host}:${settings.PACKETLOSS_DEV_WEB_PORT}`;
const evidencePath = '.packetloss-dev/smoke-session.json';

/** Calls a local public API without logging authentication material. */
async function request(path, { token, method = 'GET', body, cookie, status = 200 } = {}) {
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
    return {
        data: status === 204 ? null : await response.json(),
        cookie: response.headers.get('set-cookie')?.split(';')[0],
    };
}

/** Polls observable protocol state within a bounded integration-test deadline. */
async function until(predicate, milliseconds = 10000) {
    const deadline = Date.now() + milliseconds;
    while (Date.now() < deadline) {
        if (predicate()) return;
        await new Promise((resolve) => setTimeout(resolve, 30));
    }
    throw new Error('Timed out waiting for local integration state');
}

if (process.argv.includes('--after-restart')) {
    const evidence = JSON.parse(await readFile(evidencePath, 'utf8'));
    const restored = await request('/v1/auth/refresh', { method: 'POST', cookie: evidence.cookie });
    const token = restored.data.accessToken;
    const records = await request('/v1/me/records', { token });
    assert(
        records.data.records.some(
            (record) => record.id === evidence.recordId && record.score === 1234
        )
    );
    const result = await request(`/v1/multiplayer/matches/${evidence.matchId}`, { token });
    assert.deepEqual(result.data.standings, evidence.standings);
    assert.equal((await request('/v1/multiplayer/status')).data.phase, 'ready');
    console.log(
        'PASS: guest refresh, score, and completed multiplayer result survived container/database restart.'
    );
    process.exit(0);
}

assert.equal((await request('/v1/multiplayer/status')).data.phase, 'ready');
const suffix = Date.now().toString(36);
const email = `smoke-${suffix}@packetloss.local`;
await request('/v1/auth/signup', {
    method: 'POST',
    status: 202,
    body: { email, password: 'a', nickname: 'SMOKE' },
});
await request('/v1/auth/signup', {
    method: 'POST',
    status: 409,
    body: { email, password: 'a', nickname: 'SMOKE' },
});
await request('/v1/auth/confirm', { method: 'POST', status: 204, body: { email, code: '000000' } });
await request('/v1/auth/login', { method: 'POST', body: { email, password: 'a' } });
await request('/v1/auth/forgot-password', { method: 'POST', status: 204, body: { email } });
await request('/v1/auth/reset-password', {
    method: 'POST',
    status: 204,
    body: { email, code: '000000', password: 'b' },
});
await request('/v1/auth/login', { method: 'POST', body: { email, password: 'b' } });
console.log(
    'PASS: real Lambda signup, duplicate-account conflict, confirmation, short passwords, login, recovery.'
);

const guests = await Promise.all(
    Array.from({ length: 4 }, (_, index) =>
        request('/v1/auth/guest', { method: 'POST', body: { nickname: `SMOKE${index + 1}` } })
    )
);
const token = guests[0].data.accessToken;
const recordId = `docker-${suffix}`;
await request('/v1/me', { token, method: 'PATCH', body: { nickname: 'DOCKER', avatar: 'virus' } });
await request('/v1/me/records', {
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
    (await request('/v1/me/records', { token: guests[1].data.accessToken })).data.records.length,
    0
);
console.log(
    'PASS: four independent guests, profile update, DynamoDB score storage and account isolation.'
);

const clients = [];
let inputs;
try {
    for (let index = 0; index < 4; index++) {
        const operation = index === 0 ? 'create' : 'join';
        const roomCode = clients[0]?.room?.code;
        const credential = await request('/v1/multiplayer/join-credentials', {
            token: guests[index].data.accessToken,
            method: 'POST',
            body: { region: 'eu', operation, ...(roomCode ? { roomCode } : {}) },
        });
        const client = {
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
            const message = JSON.parse(raw.toString());
            if (message.type === 'authenticated') client.identity = message.playerId;
            if (message.type === 'room') client.room = message.room;
            if (message.type === 'snapshot') client.snapshot = message.snapshot;
            if (message.type === 'error') client.error = message;
        });
        await until(() => client.socket.readyState === WebSocket.OPEN || client.error);
        client.socket.send(
            JSON.stringify({ type: 'authenticate', version: PROTOCOL_VERSION, ticket: credential.data.ticket })
        );
        await until(() => client.identity || client.error);
        assert.equal(client.error, null);
        client.socket.send(
            JSON.stringify(
                operation === 'create' ? { type: 'create' } : { type: 'join', code: roomCode }
            )
        );
        await until(() => client.room || client.error);
        assert.equal(client.error, null);
    }
    clients.forEach(({ socket }) => socket.send(JSON.stringify({ type: 'ready', ready: true })));
    await until(() => clients[0].room.canStart);
    clients[0].socket.send(JSON.stringify({ type: 'start' }));
    await until(() => clients.every((client) => client.snapshot?.phase === 'playing'));
    console.log(
        'PASS: four guests joined, readied, and started a synchronized match. Waiting for the full 180-second game.'
    );
    inputs = setInterval(() => {
        clients.forEach((client, index) => {
            // Stop before the deadline so an in-flight test input cannot arrive after completion.
            if (client.snapshot?.phase !== 'playing' || client.snapshot.playTicks >= 179 * 60)
                return;
            client.socket.send(
                JSON.stringify({
                    type: 'input',
                    matchId: client.snapshot.matchId,
                    sequence: ++client.sequence,
                    direction: ['up', 'right', 'down', 'left'][
                        (Math.floor(client.sequence / 12) + index) % 4
                    ],
                })
            );
        });
    }, 250);
    await until(() => clients.every((client) => client.room?.phase === 'results'), 200000);
    clearInterval(inputs);
    const matchId = clients[0].snapshot.matchId;
    clients.forEach((client) => {
        assert.equal(client.error, null);
        assert.equal(
            client.snapshot.phase,
            'finished',
            client.snapshot.abortReason ?? 'Match aborted'
        );
        assert.deepEqual(client.snapshot.rankings, clients[0].snapshot.rankings);
    });
    const result = await request(`/v1/multiplayer/matches/${matchId}`, { token });
    assert.equal(result.data.outcome, 'completed');
    assert.equal(result.data.standings.length, 4);
    assert(result.data.standings.some((standing) => standing.score > 0));
    await writeFile(
        evidencePath,
        JSON.stringify({
            cookie: guests[0].cookie,
            recordId,
            matchId,
            standings: result.data.standings,
        }),
        { mode: 0o600 }
    );
    clients[0].socket.send(JSON.stringify({ type: 'rematch' }));
    await until(() => clients.every((client) => client.room?.phase === 'lobby'));
    assert(clients[0].room.players.every((player) => !player.ready));
    clients.forEach(({ socket }) => socket.send(JSON.stringify({ type: 'leave' })));
    console.log(
        'PASS: completed match, consistent rankings, persisted results, and fresh rematch lobby.'
    );
} finally {
    clearInterval(inputs);
    clients.forEach(({ socket }) => socket.terminate());
}
