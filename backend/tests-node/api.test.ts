import { describe, expect, it, vi } from 'vitest';
import { createAccountApp } from '../account-app';
import { createMultiplayerApp } from '../multiplayer-app';
import { MultiplayerControl } from '../multiplayer-control';
import { ApiError } from '../models';
import {
    accountDependencies,
    controlDependencies,
    event,
    json,
    multiplayerSettings,
    runRecord,
    settings,
} from './fixtures';

describe('account HTTP contract', () => {
    it('normalizes signup input and preserves reservation rollback only before identity creation', async () => {
        const { auth, repository } = accountDependencies(),
            app = createAccountApp(settings, auth, repository);
        const request = event('/v1/auth/signup', 'POST', {
            email: ' TEST@Example.com ',
            password: 'password-long',
            nickname: '   A   ',
        });
        expect((await app(request)).statusCode).toBe(202);
        expect(auth.signup).toHaveBeenCalledWith('test@example.com', 'password-long');
        expect(repository.putProfile).toHaveBeenCalledWith('subject', {
            nickname: 'A',
            avatar: 'packet',
        });
        auth.signup.mockRejectedValueOnce(new ApiError(409, 'ACCOUNT_EXISTS', 'Already exists'));
        expect((await app(request)).statusCode).toBe(409);
        expect(repository.releaseSignup).toHaveBeenCalledWith('reservation');
        repository.releaseSignup.mockClear();
        repository.putProfile.mockRejectedValueOnce(new Error('storage failed'));
        expect((await app(request)).statusCode).toBe(503);
        expect(repository.releaseSignup).not.toHaveBeenCalled();
    });
    it('retains production password validation and excludes guest login', async () => {
        const { auth, repository } = accountDependencies(),
            app = createAccountApp({ ...settings, stage: 'prod' }, auth, repository);
        for (const path of ['/v1/auth/signup', '/v1/auth/reset-password']) {
            const result = await app(
                event(path, 'POST', {
                    email: 'a@b.com',
                    password: 'a',
                    ...(path.endsWith('signup') ? { nickname: 'A' } : { code: '000000' }),
                })
            );
            expect(result.statusCode).toBe(422);
        }
        expect((await app(event('/v1/auth/guest', 'POST', { nickname: 'A' }))).statusCode).toBe(
            404
        );
        expect(auth.signup).not.toHaveBeenCalled();
    });
    it('requires a nickname field while retaining the established blank-name fallback', async () => {
        const { auth, repository } = accountDependencies();
        const app = createAccountApp(settings, auth, repository);
        expect((await app(event('/v1/me', 'PATCH', {}, 'alice'))).statusCode).toBe(422);
        expect(json(await app(event('/v1/me', 'PATCH', { nickname: '   ' }, 'alice')))).toEqual({
            nickname: 'PLAYER',
            avatar: 'packet',
        });
    });
    it('uses verified authorizer subjects and never trusts production identity headers', async () => {
        const { auth, repository } = accountDependencies(),
            app = createAccountApp({ ...settings, stage: 'prod' }, auth, repository);
        const request = event('/v1/me', 'GET', undefined, 'forged');
        expect((await app(request)).statusCode).toBe(401);
        request.requestContext!.authorizer = { jwt: { claims: { sub: 'verified' } } };
        expect((await app(request)).statusCode).toBe(200);
        expect(repository.getProfile).toHaveBeenCalledWith('verified');
    });
    it('sets secure HTTP-only refresh cookies and clears them even if revocation fails', async () => {
        const { auth, repository } = accountDependencies(),
            app = createAccountApp({ ...settings, stage: 'prod' }, auth, repository);
        const login = await app(
            event('/v1/auth/login', 'POST', { email: 'a@b.com', password: 'a' })
        );
        expect(json(login)).toEqual({ accessToken: 'id', expiresIn: 3600 });
        expect(login.cookies?.[0]).toContain(
            'Path=/v1/auth; Max-Age=2592000; HttpOnly; SameSite=Strict; Secure'
        );
        const request = event('/v1/auth/refresh', 'POST');
        request.cookies = ['packetloss_refresh=signed-cookie'];
        expect(json(await app(request))).toEqual({ accessToken: 'new-id', expiresIn: 3600 });
        expect(auth.refresh).toHaveBeenCalledWith('signed-cookie');
        request.rawPath = '/v1/auth/logout';
        auth.logout.mockRejectedValueOnce(new ApiError(503, 'AUTH_UNAVAILABLE', 'offline'));
        const logout = await app(request);
        expect(logout.statusCode).toBe(204);
        expect(logout.body).toBe('');
        expect(logout.cookies?.[0]).toContain('Max-Age=0');
    });
    it('keeps record ownership bound to the verified caller and rejects malformed or forged records', async () => {
        const { auth, repository } = accountDependencies(),
            app = createAccountApp(settings, auth, repository);
        expect(
            (await app(event('/v1/me/records', 'PUT', { records: [runRecord] }, 'alice')))
                .statusCode
        ).toBe(200);
        expect(repository.saveRecords).toHaveBeenCalledWith('alice', [runRecord]);
        for (const record of [
            { ...runRecord, pointsCollected: 11 },
            { ...runRecord, map: 'demo', mode: 'endless' },
            { ...runRecord, score: 1.2 },
            { ...runRecord, subject: 'bob' },
        ]) {
            expect(
                (await app(event('/v1/me/records', 'PUT', { records: [record] }, 'alice')))
                    .statusCode
            ).toBe(422);
        }
        expect((await app(event('/v1/me/records', 'DELETE', undefined, 'alice'))).statusCode).toBe(
            204
        );
        expect(repository.clearRecords).toHaveBeenCalledWith('alice');
    });
    it('validates actual encoded payload size, JSON, CORS, and stable retry responses', async () => {
        const { auth, repository } = accountDependencies(),
            app = createAccountApp(settings, auth, repository);
        const request = event('/v1/auth/login', 'POST');
        request.body = Buffer.from('x'.repeat(16385)).toString('base64');
        request.isBase64Encoded = true;
        expect((await app(request)).statusCode).toBe(413);
        request.body = '{broken';
        request.isBase64Encoded = false;
        expect((await app(request)).statusCode).toBe(422);
        const preflight = event('/v1/auth/login', 'OPTIONS');
        preflight.headers!['access-control-request-method'] = 'POST';
        preflight.headers!['access-control-request-headers'] = 'Authorization, Content-Type';
        const allowed = await app(preflight);
        expect(allowed.statusCode).toBe(200);
        expect(allowed.headers['access-control-allow-origin']).toBe(settings.siteOrigin);
        preflight.headers!.origin = 'https://untrusted.example';
        expect((await app(preflight)).statusCode).toBe(400);
        auth.resendConfirmation.mockRejectedValueOnce(
            new ApiError(429, 'RATE_LIMITED', 'Try again', 60)
        );
        const retry = await app(
            event('/v1/auth/resend-confirmation', 'POST', { email: ' A@B.com ' })
        );
        expect(retry.statusCode).toBe(429);
        expect(retry.headers['retry-after']).toBe('60');
        expect(auth.resendConfirmation).toHaveBeenCalledWith('a@b.com');
    });
    it('does not expose whether a recovery email exists', async () => {
        const { auth, repository } = accountDependencies();
        auth.forgotPassword.mockRejectedValue(new ApiError(401, 'INVALID_CREDENTIALS', 'missing'));
        expect(
            (
                await createAccountApp(
                    settings,
                    auth,
                    repository
                )(event('/v1/auth/forgot-password', 'POST', { email: 'missing@example.com' }))
            ).statusCode
        ).toBe(204);
    });
});

describe('multiplayer HTTP contract', () => {
    it('keeps status public/read-only and limits actual request bytes', async () => {
        const { repository, instances } = controlDependencies();
        const app = createMultiplayerApp(
            multiplayerSettings,
            new MultiplayerControl(multiplayerSettings, repository, instances, () => 1000)
        );
        const status = await app(event('/v1/multiplayer/status'));
        expect(status.statusCode).toBe(200);
        expect(status.headers['cache-control']).toBe('no-store');
        expect(repository.replaceControl).not.toHaveBeenCalled();
        expect(instances.start).not.toHaveBeenCalled();
        const oversized = event('/v1/multiplayer/start', 'POST');
        oversized.body = 'x'.repeat(4097);
        expect((await app(oversized)).statusCode).toBe(413);
    });
    it('validates operation/room bindings and rejects caller-supplied identity fields', async () => {
        const { repository, instances } = controlDependencies();
        const app = createMultiplayerApp(
            multiplayerSettings,
            new MultiplayerControl(multiplayerSettings, repository, instances, () => 1000)
        );
        for (const body of [
            { region: 'eu', operation: 'join' },
            { region: 'eu', operation: 'create', roomCode: 'ABCDEF' },
            { region: 'eu', operation: 'create', subject: 'owner' },
        ])
            expect(
                (await app(event('/v1/multiplayer/join-credentials', 'POST', body, 'alice')))
                    .statusCode
            ).toBe(422);
        expect(repository.putTicket).not.toHaveBeenCalled();
        const response = await app(
            event(
                '/v1/multiplayer/join-credentials',
                'POST',
                { region: 'eu', operation: 'create' },
                'alice'
            )
        );
        expect(response.statusCode).toBe(200);
    });
    it('fails closed on unavailable AWS without leaking resource diagnostics', async () => {
        const { repository, instances } = controlDependencies();
        instances.states = vi.fn().mockRejectedValue(new Error('secret instance id'));
        const result = await createMultiplayerApp(
            multiplayerSettings,
            new MultiplayerControl(multiplayerSettings, repository, instances)
        )(event('/v1/multiplayer/status'));
        expect(result.statusCode).toBe(503);
        expect(json(result)).toEqual({
            code: 'CONTROL_UNAVAILABLE',
            message: 'Multiplayer is temporarily unavailable.',
        });
    });
});
