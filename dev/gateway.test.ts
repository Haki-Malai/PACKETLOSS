import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Server } from 'node:http';
import { z } from 'zod';
import { createGateway } from './gateway';

const servers: Server[] = [];

/** Listen only on an ephemeral test port and retain ownership for cleanup. */
async function listen(server: Server): Promise<string> {
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
            server.removeListener('error', reject);
            resolve();
        });
    });
    servers.push(server);
    const address = server.address();
    if (!address || typeof address === 'string')
        throw new Error('Expected an ephemeral TCP address');
    return `http://127.0.0.1:${address.port}`;
}

/** Decode the transport's JSON envelope without trusting an untyped JSON boundary. */
function invocation(init: RequestInit | undefined): unknown {
    if (typeof init?.body !== 'string') throw new Error('Expected a serialized Lambda event');
    const event: unknown = JSON.parse(init.body);
    return event;
}

/** Hold an invocation until a test explicitly releases the simulated emulator. */
function deferred<T>(): { promise: Promise<T>; resolve(value: T): void } {
    let release: ((value: T) => void) | undefined;
    const promise = new Promise<T>((resolve) => {
        release = resolve;
    });
    return {
        promise,
        /** Complete this controlled operation after verifying the observable intermediate state. */
        resolve(value) {
            if (!release) throw new Error('Deferred operation was not initialized');
            release(value);
        },
    };
}

afterEach(async () => {
    await Promise.all(
        servers.splice(0).map((server) => {
            server.closeAllConnections();
            return new Promise<void>((resolve, reject) => {
                server.close((error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
        })
    );
});

describe('local Lambda HTTP gateway', () => {
    it('preserves the API Gateway envelope, response cookies, headers, and binary body', async () => {
        const invoke = vi.fn<typeof fetch>().mockResolvedValue(
            new Response(
                JSON.stringify({
                    statusCode: 201,
                    headers: {
                        'content-type': 'application/octet-stream',
                        'access-control-allow-origin': 'http://localhost:5173',
                    },
                    cookies: ['session=first; HttpOnly', 'other=second; SameSite=Strict'],
                    body: Buffer.from([0, 1, 127, 255]).toString('base64'),
                    isBase64Encoded: true,
                })
            )
        );
        const url = await listen(
            createGateway({
                accounts: 'http://accounts',
                multiplayer: 'http://multiplayer',
                fetch: invoke,
                log: vi.fn(),
            })
        );
        const response = await fetch(`${url}/v1/auth/login?next=%2Fgame`, {
            method: 'POST',
            headers: {
                cookie: 'one=1; two=2',
                authorization: 'Bearer local',
                'content-type': 'application/json',
            },
            body: '{"nickname":"PLAYER"}',
        });
        expect(response.status).toBe(201);
        expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
        expect(response.headers.getSetCookie()).toEqual([
            'session=first; HttpOnly',
            'other=second; SameSite=Strict',
        ]);
        expect(new Uint8Array(await response.arrayBuffer())).toEqual(
            new Uint8Array([0, 1, 127, 255])
        );
        expect(invoke).toHaveBeenCalledOnce();
        const [endpoint, init] = invoke.mock.calls[0];
        expect(endpoint).toBe('http://accounts/2015-03-31/functions/function/invocations');
        expect(init?.method).toBe('POST');
        expect(invocation(init)).toMatchObject({
            version: '2.0',
            routeKey: '$default',
            rawPath: '/v1/auth/login',
            rawQueryString: 'next=%2Fgame',
            headers: { authorization: 'Bearer local' },
            cookies: ['one=1', 'two=2'],
            requestContext: {
                stage: '$default',
                http: {
                    method: 'POST',
                    path: '/v1/auth/login',
                    protocol: 'HTTP/1.1',
                    sourceIp: '127.0.0.1',
                },
            },
            body: Buffer.from('{"nickname":"PLAYER"}').toString('base64'),
            isBase64Encoded: true,
        });
        const context = z
            .object({ requestContext: z.record(z.string(), z.unknown()) })
            .parse(invocation(init)).requestContext;
        expect(context).not.toHaveProperty('authorizer');
    });

    it('serializes one emulator while allowing the other to progress and recovers after invalid responses', async () => {
        const first = deferred<Response>();
        const firstStarted = deferred<void>();
        const forwarded: string[] = [];
        const invoke = vi.fn<typeof fetch>().mockImplementation((endpoint, init) => {
            const request = z.object({ rawPath: z.string() }).parse(invocation(init));
            forwarded.push(request.rawPath);
            if (request.rawPath === '/first') {
                firstStarted.resolve();
                return first.promise;
            }
            return Promise.resolve(new Response(JSON.stringify({ statusCode: 204 })));
        });
        const url = await listen(
            createGateway({
                accounts: 'http://accounts',
                multiplayer: 'http://multiplayer',
                fetch: invoke,
                log: vi.fn(),
            })
        );
        const blocked = fetch(`${url}/first`);
        await firstStarted.promise;
        const queued = fetch(`${url}/second`);
        const independent = await fetch(`${url}/v1/multiplayer/status`);
        expect(independent.status).toBe(204);
        expect(forwarded).toEqual(['/first', '/v1/multiplayer/status']);
        first.resolve(new Response(JSON.stringify({ statusCode: 200, headers: { invalid: 7 } })));
        const invalid = await blocked;
        expect(invalid.status).toBe(502);
        const error: unknown = await invalid.json();
        expect(error).toEqual({
            code: 'LOCAL_LAMBDA_UNAVAILABLE',
            message: 'The local Lambda is unavailable. Check Docker logs.',
        });
        expect((await queued).status).toBe(204);
        expect(forwarded).toEqual(['/first', '/v1/multiplayer/status', '/second']);
        expect((await fetch(`${url}/internal/dev/heartbeat`, { method: 'POST' })).status).toBe(204);
        expect(invoke.mock.calls.at(-1)?.[0]).toBe(
            'http://multiplayer/2015-03-31/functions/function/invocations'
        );
    });

    it('rejects oversized actual request bodies before invoking an emulator', async () => {
        const invoke = vi.fn<typeof fetch>();
        const url = await listen(
            createGateway({
                accounts: 'http://accounts',
                multiplayer: 'http://multiplayer',
                fetch: invoke,
                log: vi.fn(),
            })
        );
        const response = await fetch(`${url}/v1/me/records`, {
            method: 'PUT',
            body: 'x'.repeat(65537),
        });
        expect(response.status).toBe(413);
        expect(invoke).not.toHaveBeenCalled();
    });
});
