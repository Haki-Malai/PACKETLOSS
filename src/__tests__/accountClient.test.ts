// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    AccountClientError,
    FetchAccountClient,
} from '../game/infrastructure/adapters/AccountClient';

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.useRealTimers();
});

/** Creates a JSON fetch response with optional headers. */
function jsonResponse(body: unknown, status = 200, headers?: HeadersInit): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'content-type': 'application/json',
            ...Object.fromEntries(new Headers(headers)),
        },
    });
}

/** Builds a structurally valid test JWT; signature verification remains the server's responsibility. */
function token(subject: string): string {
    return `e30.${btoa(JSON.stringify({ sub: subject }))}.signature`;
}

describe('FetchAccountClient', () => {
    it.each(['127.0.0.1', 'localhost'])(
        'authenticates a guest and restores its cookie session through %s',
        async (hostname) => {
            vi.stubEnv('DEV', true);
            vi.stubEnv('VITE_LOCAL_DEVELOPMENT', '1');
            vi.stubGlobal('location', { protocol: 'http:', hostname });
            const request = vi
                .fn<typeof fetch>()
                .mockResolvedValueOnce(
                    jsonResponse({ accessToken: token('guest-1'), expiresIn: 3600 })
                )
                .mockResolvedValueOnce(jsonResponse({ nickname: 'Friend', avatar: 'packet' }))
                .mockResolvedValueOnce(
                    jsonResponse({ accessToken: token('guest-1'), expiresIn: 3600 })
                );
            vi.stubGlobal('fetch', request);
            const client = new FetchAccountClient('http://127.0.0.1:8787');
            await client.guest('Friend');
            expect(request.mock.calls[0][0]).toBe(`http://${hostname}:8787/v1/auth/guest`);
            const guestBody = request.mock.calls[0][1]?.body;
            if (typeof guestBody !== 'string') throw new Error('Missing guest request body.');
            expect(JSON.parse(guestBody)).toEqual({ nickname: 'Friend' });
            expect(await client.getProfile()).toMatchObject({
                accountId: 'guest-1',
                nickname: 'Friend',
            });
            await client.refresh();
            expect(request.mock.calls[2]).toEqual([
                `http://${hostname}:8787/v1/auth/refresh`,
                expect.objectContaining({ credentials: 'include' }),
            ]);
            await expect(
                new FetchAccountClient('https://api.example.com').guest('Friend')
            ).rejects.toThrow('unavailable');
            vi.stubEnv('DEV', false);
            await expect(
                new FetchAccountClient('http://127.0.0.1:8787').guest('Friend')
            ).rejects.toThrow('unavailable');
            expect(request).toHaveBeenCalledTimes(3);
        }
    );

    it.each(['headers', 'body'])(
        'times out a stalled response while waiting for %s',
        async (phase) => {
            vi.useFakeTimers();
            let signal: AbortSignal | null | undefined;
            vi.stubGlobal(
                'fetch',
                vi.fn<typeof fetch>().mockImplementation((_url, init) => {
                    signal = init?.signal;
                    if (phase === 'headers') {
                        return new Promise<Response>((_resolve, reject) => {
                            signal?.addEventListener(
                                'abort',
                                () => reject(new DOMException('Timed out', 'AbortError')),
                                { once: true }
                            );
                        });
                    }
                    const response = jsonResponse({});
                    vi.spyOn(response, 'json').mockImplementation(
                        () =>
                            new Promise((_resolve, reject) => {
                                signal?.addEventListener(
                                    'abort',
                                    () => reject(new DOMException('Timed out', 'AbortError')),
                                    { once: true }
                                );
                            })
                    );
                    return Promise.resolve(response);
                })
            );
            const client = new FetchAccountClient('https://api.packetloss.test');
            const result = client.refresh().catch((error: unknown) => error);
            await vi.advanceTimersByTimeAsync(15_000);
            expect(await result).toMatchObject({
                code: 'SERVICE_UNAVAILABLE',
                retryAfterMs: 30_000,
            });
            expect(signal?.aborted).toBe(true);
            expect(vi.getTimerCount()).toBe(0);
        }
    );

    it('sends a replacement-code request and clears the request timeout on success', async () => {
        vi.useFakeTimers();
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValue(new Response(null, { status: 204 }));
        vi.stubGlobal('fetch', fetchMock);
        const client = new FetchAccountClient('https://api.packetloss.test');
        await client.resendConfirmation('player@example.com');
        expect(fetchMock).toHaveBeenCalledWith(
            'https://api.packetloss.test/v1/auth/resend-confirmation',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ email: 'player@example.com' }),
            })
        );
        expect(vi.getTimerCount()).toBe(0);
    });

    it('keeps tokens in memory and sends credentialed authenticated requests', async () => {
        const idToken = token('player-subject');
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(jsonResponse({ accessToken: idToken, expiresIn: 3600 }))
            .mockResolvedValueOnce(jsonResponse({ nickname: 'PACKET', avatar: 'packet' }));
        vi.stubGlobal('fetch', fetchMock);
        const client = new FetchAccountClient('https://api.packetloss.test/');

        await client.login('player@example.com', 'password');
        await expect(client.getProfile()).resolves.toEqual({
            accountId: 'player-subject',
            nickname: 'PACKET',
            avatar: 'packet',
        });

        expect(fetchMock.mock.calls[1]?.[0]).toBe('https://api.packetloss.test/v1/me');
        const profileRequest = fetchMock.mock.calls[1]?.[1];
        expect(profileRequest?.credentials).toBe('include');
        expect(new Headers(profileRequest?.headers).get('authorization')).toBe(`Bearer ${idToken}`);
    });

    it('refreshes one failed authenticated request and honors stable rate-limit errors', async () => {
        const oldToken = token('player-subject');
        const newToken = token('player-subject');
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(jsonResponse({ accessToken: oldToken, expiresIn: 3600 }))
            .mockResolvedValueOnce(
                jsonResponse({ code: 'SESSION_EXPIRED', message: 'Expired.' }, 401)
            )
            .mockResolvedValueOnce(jsonResponse({ accessToken: newToken, expiresIn: 3600 }))
            .mockResolvedValueOnce(jsonResponse({ records: [] }))
            .mockResolvedValueOnce(
                jsonResponse({ code: 'RATE_LIMITED', message: 'Try later.' }, 429, {
                    'Retry-After': '12',
                })
            );
        vi.stubGlobal('fetch', fetchMock);
        const client = new FetchAccountClient('https://api.packetloss.test');

        await client.login('player@example.com', 'password');
        await expect(client.getRecords()).resolves.toEqual([]);
        const retriedRequest = fetchMock.mock.calls[3]?.[1];
        expect(new Headers(retriedRequest?.headers).get('authorization')).toBe(
            `Bearer ${newToken}`
        );
        await expect(client.forgotPassword('player@example.com')).rejects.toMatchObject({
            code: 'RATE_LIMITED',
            retryAfterMs: 12_000,
        } satisfies Partial<AccountClientError>);
    });

    it('rejects an automatic refresh that belongs to another account', async () => {
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(
                jsonResponse({ accessToken: token('first-subject'), expiresIn: 3600 })
            )
            .mockResolvedValueOnce(
                jsonResponse({ code: 'SESSION_EXPIRED', message: 'Expired.' }, 401)
            )
            .mockResolvedValueOnce(
                jsonResponse({ accessToken: token('second-subject'), expiresIn: 3600 })
            );
        vi.stubGlobal('fetch', fetchMock);
        const client = new FetchAccountClient('https://api.packetloss.test');

        await client.login('first@example.com', 'password');
        await expect(client.getRecords()).rejects.toMatchObject({
            code: 'SESSION_EXPIRED',
            status: 401,
        } satisfies Partial<AccountClientError>);
        await expect(client.getRecords()).rejects.toMatchObject({
            code: 'AUTH_REQUIRED',
            status: 401,
        } satisfies Partial<AccountClientError>);
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('does not restore a token when an in-flight refresh finishes after logout', async () => {
        let finishRefresh!: (_response: Response) => void;
        const refreshResponse = new Promise<Response>((resolve) => {
            finishRefresh = resolve;
        });
        const fetchMock = vi.fn<typeof fetch>().mockImplementation((input) => {
            const requestUrl =
                typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            const path = new URL(requestUrl).pathname;
            if (path === '/v1/auth/login') {
                return Promise.resolve(
                    jsonResponse({ accessToken: token('player-subject'), expiresIn: 3600 })
                );
            }
            if (path === '/v1/auth/refresh') return refreshResponse;
            if (path === '/v1/auth/logout')
                return Promise.resolve(new Response(null, { status: 204 }));
            return Promise.reject(new Error(`Unexpected request: ${path}`));
        });
        vi.stubGlobal('fetch', fetchMock);
        const client = new FetchAccountClient('https://api.packetloss.test');

        await client.login('player@example.com', 'password');
        const refreshing = client.refresh();
        await client.logout();
        finishRefresh(jsonResponse({ accessToken: token('player-subject'), expiresIn: 3600 }));

        await expect(refreshing).rejects.toMatchObject({
            code: 'SESSION_EXPIRED',
            status: 401,
        } satisfies Partial<AccountClientError>);
        await expect(client.getRecords()).rejects.toMatchObject({
            code: 'AUTH_REQUIRED',
            status: 401,
        } satisfies Partial<AccountClientError>);
    });

    it('waits for logout cookie clearing before sending a later login', async () => {
        let loginCount = 0;
        let finishLogout!: (_response: Response) => void;
        const logoutResponse = new Promise<Response>((resolve) => {
            finishLogout = resolve;
        });
        const fetchMock = vi.fn<typeof fetch>().mockImplementation((input) => {
            const requestUrl =
                typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            const path = new URL(requestUrl).pathname;
            if (path === '/v1/auth/login') {
                loginCount += 1;
                return Promise.resolve(
                    jsonResponse({
                        accessToken: token(loginCount === 1 ? 'first-subject' : 'second-subject'),
                        expiresIn: 3600,
                    })
                );
            }
            if (path === '/v1/auth/logout') return logoutResponse;
            return Promise.reject(new Error(`Unexpected request: ${path}`));
        });
        vi.stubGlobal('fetch', fetchMock);
        const client = new FetchAccountClient('https://api.packetloss.test');

        await client.login('first@example.com', 'password');
        const loggingOut = client.logout();
        const loggingIn = client.login('second@example.com', 'password');
        await Promise.resolve();
        expect(loginCount).toBe(1);

        finishLogout(new Response(null, { status: 204 }));
        await loggingOut;
        await loggingIn;
        expect(loginCount).toBe(2);
    });

    it('turns an upstream capacity failure into a bounded local-play message', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn<typeof fetch>().mockResolvedValue(new Response('busy', { status: 503 }))
        );
        const client = new FetchAccountClient('https://api.packetloss.test');

        await expect(
            client.signup({
                email: 'player@example.com',
                password: 'LongPassword1',
                nickname: 'PACKET',
                avatar: 'packet',
            })
        ).rejects.toMatchObject({
            code: 'SERVICE_UNAVAILABLE',
            message: 'Accounts are temporarily unavailable. Local play is still available.',
            retryAfterMs: 30_000,
        } satisfies Partial<AccountClientError>);
    });
});
