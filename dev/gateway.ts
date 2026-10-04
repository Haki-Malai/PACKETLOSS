import { createServer } from 'node:http';
import type { IncomingMessage, Server, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';
import type { GatewayEvent, GatewayResponse } from '../backend/http';

interface LocalGatewayEvent extends GatewayEvent {
    routeKey: string;
    rawQueryString: string;
    requestContext: {
        stage: string;
        requestId: string;
        http: { method: string; path: string; protocol: string; sourceIp: string };
    };
}
interface LambdaResponse extends GatewayResponse {
    isBase64Encoded?: boolean;
}
interface GatewayOptions {
    accounts: string;
    multiplayer: string;
    fetch?: typeof fetch;
    log?: (message: string, detail?: unknown) => void;
}
const lambdaResponseSchema: z.ZodType<LambdaResponse> = z.object({
    statusCode: z.number().int().min(100).max(599),
    headers: z.record(z.string(), z.string()).default({}),
    body: z.string().default(''),
    cookies: z.array(z.string()).optional(),
    isBase64Encoded: z.boolean().optional(),
});
const lambdaFailureSchema = z.object({ errorMessage: z.string() });

/** Create the local HTTP gateway; callers own listening and closing the returned server. */
export function createGateway(options: GatewayOptions): Server {
    const queues = new Map<string, Promise<LambdaResponse>>();
    const requestLambda = options.fetch ?? fetch;
    const log = options.log ?? console.error;

    /** Serialize invocations per emulator, recovering the queue after a failed invocation. */
    function invoke(endpoint: string, event: LocalGatewayEvent): Promise<LambdaResponse> {
        const previous = queues.get(endpoint) ?? Promise.resolve();
        const next = previous
            .catch(() => undefined)
            .then(async () => {
                const response = await requestLambda(
                    `${endpoint}/2015-03-31/functions/function/invocations`,
                    {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify(event),
                        signal: AbortSignal.timeout(15000),
                    }
                );
                const payload: unknown = await response.json();
                const result = lambdaResponseSchema.safeParse(payload);
                if (!response.ok || !result.success) {
                    const failure = lambdaFailureSchema.safeParse(payload);
                    log(
                        'Local Lambda invocation failed:',
                        failure.success ? failure.data.errorMessage : response.status
                    );
                    throw new Error('Lambda invocation failed');
                }
                return result.data;
            });
        queues.set(endpoint, next);
        return next;
    }

    /** Translate HTTP requests and Lambda responses, including cookies and binary bodies. */
    async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
        try {
            const chunks: Buffer[] = [];
            let size = 0;
            for await (const value of request) {
                const chunk: unknown = value;
                if (!Buffer.isBuffer(chunk)) throw new Error('Invalid local HTTP request chunk');
                size += chunk.length;
                if (size > 65536) {
                    response.writeHead(413).end();
                    return;
                }
                chunks.push(chunk);
            }
            const url = new URL(request.url ?? '/', 'http://127.0.0.1');
            const headers = Object.fromEntries(
                Object.entries(request.headers).map(([key, value]) => [
                    key,
                    Array.isArray(value) ? value.join(',') : (value ?? ''),
                ])
            );
            // This gateway is published on loopback only. External authorizer claims are never copied.
            const event: LocalGatewayEvent = {
                version: '2.0',
                routeKey: '$default',
                rawPath: url.pathname,
                rawQueryString: url.search.slice(1),
                headers,
                cookies: headers.cookie
                    ? headers.cookie.split(';').map((cookie) => cookie.trim())
                    : [],
                requestContext: {
                    stage: '$default',
                    requestId: randomUUID(),
                    http: {
                        method: request.method ?? 'GET',
                        path: url.pathname,
                        protocol: 'HTTP/1.1',
                        sourceIp: '127.0.0.1',
                    },
                },
                body: Buffer.concat(chunks).toString('base64'),
                isBase64Encoded: true,
            };
            const endpoint =
                url.pathname.startsWith('/v1/multiplayer/') ||
                url.pathname.startsWith('/internal/dev/')
                    ? options.multiplayer
                    : options.accounts;
            const result = await invoke(endpoint, event);
            response.writeHead(result.statusCode, {
                ...result.headers,
                ...(result.cookies?.length ? { 'set-cookie': result.cookies } : {}),
            });
            response.end(Buffer.from(result.body, result.isBase64Encoded ? 'base64' : 'utf8'));
        } catch (error) {
            log(error instanceof Error ? error.message : 'Local gateway failed');
            if (!response.headersSent)
                response.writeHead(502, { 'content-type': 'application/json' });
            response.end(
                JSON.stringify({
                    code: 'LOCAL_LAMBDA_UNAVAILABLE',
                    message: 'The local Lambda is unavailable. Check Docker logs.',
                })
            );
        }
    }

    return createServer((request, response) => {
        void handle(request, response);
    });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const accounts = process.env.ACCOUNT_LAMBDA_URL;
    const multiplayer = process.env.MULTIPLAYER_LAMBDA_URL;
    if (!accounts || !multiplayer) throw new Error('Both local Lambda emulator URLs are required.');
    createGateway({ accounts, multiplayer }).listen(8787, '0.0.0.0');
}
