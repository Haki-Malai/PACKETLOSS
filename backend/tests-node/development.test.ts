import { afterEach, describe, expect, it, vi } from 'vitest';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DatabaseSync } from 'node:sqlite';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createDevelopmentApp } from '../development-app';
import { validateDevelopment } from '../config';
import { DynamoStore, LOCAL_TABLES } from '../dynamo';
import { LocalRepository } from '../local-repository';
import { migrate } from '../bootstrap';
import { DynamoProfileRepository } from '../profile-repository';
import { event, json, ready, runRecord } from './fixtures';

const settings = {
    dynamodbEndpoint: 'http://localhost:8000',
    authKey: 'k'.repeat(32),
    internalToken: 'i'.repeat(32),
    runId: 'run',
    processGeneration: 'generation',
    siteOrigin: 'http://127.0.0.1:5173',
    websocketUrl: 'ws://127.0.0.1:8080/ws',
};
/** Compose the real local API with an inert store and explicit boundary spies. */
function fixture() {
    const client = new DynamoDBClient({
        region: 'us-east-1',
        credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
    });
    const store = new DynamoStore(client),
        repository = new LocalRepository(settings.dynamodbEndpoint, store);
    return { store, ...createDevelopmentApp(settings, repository, () => 1000) };
}
const directories: string[] = [];
afterEach(async () => {
    await Promise.all(
        directories.splice(0).map((path) => rm(path, { recursive: true, force: true }))
    );
});

describe('local API boundaries', () => {
    it.each(['https://localhost:5173', 'http://example.com:5173', 'http://user@localhost:5173'])(
        'rejects non-loopback or credentialed development URLs: %s',
        (siteOrigin) => {
            expect(() => validateDevelopment({ ...settings, siteOrigin })).toThrow('loopback');
        }
    );
    it('cold starts retain current readiness and never reset runtime data', async () => {
        const { repository, handler } = fixture();
        const reset = vi.spyOn(repository, 'resetRuntime');
        vi.spyOn(repository, 'getControl').mockResolvedValue(ready);
        const status = await handler(event('/v1/multiplayer/status'));
        expect(json(status)).toMatchObject({
            phase: 'ready',
            instanceRunId: 'run',
            processGeneration: 'generation',
        });
        expect(reset).not.toHaveBeenCalled();
    });
    it('discards forged authorizer claims unless a valid local token is independently verified', async () => {
        const { handler, auth, repository } = fixture();
        const getProfile = vi
            .spyOn(repository, 'getProfile')
            .mockResolvedValue({ nickname: 'LOCAL', avatar: 'packet' });
        const request = event('/v1/me', 'GET', undefined, 'forged');
        request.requestContext!.authorizer = { jwt: { claims: { sub: 'forged' } } };
        expect((await handler(request)).statusCode).toBe(401);
        request.headers!.authorization = 'Bearer real-local';
        vi.spyOn(auth, 'verifyAccessToken').mockResolvedValue('verified-local');
        expect((await handler(request)).statusCode).toBe(200);
        expect(getProfile).toHaveBeenCalledWith('verified-local');
    });
    it.each(['localhost', '127.0.0.1'])(
        'supports CORS and nonsecure HttpOnly guest cookies from %s',
        async (host) => {
            const { handler, auth } = fixture();
            const guestCall = vi
                .spyOn(auth, 'guest')
                .mockResolvedValue({
                    idToken: 'access',
                    expiresIn: 3600,
                    refreshToken: 'refresh',
                    subject: 'guest',
                });
            const preflight = event('/v1/auth/guest', 'OPTIONS');
            preflight.headers = {
                origin: `http://${host}:5173`,
                'access-control-request-method': 'POST',
                'access-control-request-headers': 'Content-Type',
            };
            const response = await handler(preflight);
            expect(response.statusCode).toBe(200);
            expect(response.headers['access-control-allow-origin']).toBe(`http://${host}:5173`);
            const request = event('/v1/auth/guest', 'POST', { nickname: 'GUEST' });
            request.headers!.origin = `http://${host}:5173`;
            const guest = await handler(request);
            expect(guest.cookies?.[0]).toBe(
                'packetloss_dev_refresh=refresh; Path=/v1/auth; Max-Age=2592000; HttpOnly; SameSite=Strict'
            );
            expect(guestCall).toHaveBeenCalledWith({ nickname: 'GUEST', avatar: 'packet' });
        }
    );
    it('requires both a loopback source and internal secret, then fences process registration', async () => {
        const { handler, repository } = fixture();
        const register = vi.spyOn(repository, 'registerProcess').mockResolvedValue(true);
        const request = event('/internal/dev/process/register', 'POST', {
            instanceRunId: 'run',
            processGeneration: 'new',
        });
        expect((await handler(request)).statusCode).toBe(401);
        request.headers!.authorization = `Bearer ${settings.internalToken}`;
        request.requestContext!.http!.sourceIp = '203.0.113.1';
        expect((await handler(request)).statusCode).toBe(401);
        expect(register).not.toHaveBeenCalled();
        request.requestContext!.http!.sourceIp = '127.0.0.1';
        expect((await handler(request)).statusCode).toBe(204);
        expect(register).toHaveBeenCalledWith('run', 'new');
        register.mockResolvedValue(false);
        expect((await handler(request)).statusCode).toBe(409);
    });
    it('returns only trusted player identity from the shared single-use ticket contract', async () => {
        const { handler, repository } = fixture();
        const consume = vi
            .spyOn(repository, 'consumeTicket')
            .mockResolvedValue({
                subject: 'alice',
                nickname: 'ALICE',
                avatar: 'packet',
                region: 'eu',
                instanceRunId: 'run',
                processGeneration: 'generation',
                operation: 'join',
                roomCode: 'ABCDEF',
                issuedAt: 1000,
                expiresAt: 1060,
            });
        const request = event('/internal/dev/tickets/consume', 'POST', {
            ticket: 'opaque-ticket-long',
            instanceRunId: 'run',
            processGeneration: 'generation',
        });
        request.headers!.authorization = `Bearer ${settings.internalToken}`;
        const result = await handler(request);
        expect(json(result)).toEqual({
            playerId: 'alice',
            name: 'ALICE',
            operation: 'join',
            roomCode: 'ABCDEF',
        });
        expect(result.headers['cache-control']).toBe('no-store');
        expect(consume).toHaveBeenCalledWith('opaque-ticket-long', 'eu', 'run', 'generation', 1000);
    });
    it('clears malformed legacy records without requiring their payloads to parse', async () => {
        const { store } = fixture();
        vi.spyOn(store, 'query').mockResolvedValue([
            { sk: 'PROFILE', nickname: 'A' },
            { sk: 'RECORD#broken', record: { invalid: true } },
        ]);
        const remove = vi.spyOn(store, 'delete').mockResolvedValue();
        await new DynamoProfileRepository(store, 'profiles').clearRecords('alice');
        expect(remove).toHaveBeenCalledExactlyOnceWith('profiles', {
            pk: 'USER#alice',
            sk: 'RECORD#broken',
        });
    });
});

describe('legacy SQLite migration', () => {
    it('imports existing binary passwords, sessions, profiles, records, and matches exactly once without changing the source', async () => {
        const directory = await mkdtemp(join(tmpdir(), 'packetloss-test-'));
        directories.push(directory);
        const path = join(directory, 'legacy.sqlite');
        const database = new DatabaseSync(path);
        database.exec(`CREATE TABLE users (subject TEXT, email TEXT, password_salt BLOB, password_hash BLOB, confirmed INTEGER, confirmation_code TEXT, reset_code TEXT);
            CREATE TABLE profiles (subject TEXT, nickname TEXT, avatar TEXT);
            CREATE TABLE records (subject TEXT, payload TEXT);
            CREATE TABLE refresh_sessions (token_hash TEXT, subject TEXT, expires_at INTEGER, revoked INTEGER);
            CREATE TABLE matches (match_id TEXT, payload TEXT);`);
        const salt = Buffer.from('0123456789abcdef'),
            hash = Buffer.alloc(32, 7);
        database
            .prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)')
            .run('alice', 'a@example.com', salt, hash, 1, null, '000000');
        database.prepare('INSERT INTO profiles VALUES (?, ?, ?)').run('alice', 'LEGACY', 'virus');
        database
            .prepare('INSERT INTO records VALUES (?, ?)')
            .run('alice', JSON.stringify(runRecord));
        database
            .prepare('INSERT INTO refresh_sessions VALUES (?, ?, ?, ?)')
            .run('hashed-token', 'alice', 999999, 0);
        database
            .prepare('INSERT INTO matches VALUES (?, ?)')
            .run(
                'old-match',
                JSON.stringify({ participants: ['alice', 'bob'], lifecycle: 'aborted' })
            );
        database.close();
        const before = createHash('sha256')
                .update(await readFile(path))
                .digest('hex'),
            { repository, store } = fixture();
        let imported = false;
        vi.spyOn(store, 'get').mockImplementation(() =>
            Promise.resolve(imported ? { pk: 'MIGRATION#sqlite-v1' } : undefined)
        );
        const put = vi.spyOn(store, 'put').mockImplementation((_table, item) => {
            if (item.pk === 'MIGRATION#sqlite-v1') imported = true;
            return Promise.resolve();
        });
        vi.spyOn(repository, 'identityForSubject').mockResolvedValue(undefined);
        const create = vi.spyOn(repository, 'createIdentity').mockResolvedValue(),
            reset = vi.spyOn(repository, 'setResetCode').mockResolvedValue();
        const profile = vi.spyOn(repository, 'putProfile').mockResolvedValue(),
            records = vi.spyOn(repository, 'saveRecords').mockResolvedValue([runRecord]),
            session = vi.spyOn(repository, 'putRefreshSession').mockResolvedValue();
        await migrate(repository, path);
        await migrate(repository, path);
        expect(create).toHaveBeenCalledExactlyOnceWith(
            'alice',
            'a@example.com',
            new Uint8Array(salt),
            new Uint8Array(hash),
            null
        );
        expect(reset).toHaveBeenCalledWith('a@example.com', '000000');
        expect(profile).toHaveBeenCalledWith('alice', { nickname: 'LEGACY', avatar: 'virus' });
        expect(records).toHaveBeenCalledWith('alice', [runRecord]);
        expect(session).toHaveBeenCalledWith('hashed-token', 'alice', 999999);
        expect(put).toHaveBeenCalledWith(LOCAL_TABLES.results, {
            pk: 'old-match',
            participants: ['alice', 'bob'],
            lifecycle: 'aborted',
        });
        expect(
            createHash('sha256')
                .update(await readFile(path))
                .digest('hex')
        ).toBe(before);
    });
});
