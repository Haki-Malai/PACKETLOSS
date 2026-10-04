import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const queues = new Map();
const accounts = process.env.ACCOUNT_LAMBDA_URL;
const multiplayer = process.env.MULTIPLAYER_LAMBDA_URL;

/** Serializes invocations per emulator, like one Lambda execution environment. */
async function invoke(endpoint, event) {
    const previous = queues.get(endpoint) ?? Promise.resolve();
    const next = previous
        .catch(() => undefined)
        .then(async () => {
            const response = await fetch(`${endpoint}/2015-03-31/functions/function/invocations`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(event),
                signal: AbortSignal.timeout(15000),
            });
            const result = await response.json();
            if (!response.ok || !Number.isInteger(result.statusCode)) {
                console.error(
                    'Local Lambda invocation failed:',
                    result.errorMessage ?? response.status
                );
                throw new Error('Lambda invocation failed');
            }
            return result;
        });
    queues.set(endpoint, next);
    return next;
}

/** Translates HTTP into API Gateway v2 events, including cookies and encoded bodies. */
const server = createServer(async (request, response) => {
    try {
        const chunks = [];
        let size = 0;
        for await (const chunk of request) {
            size += chunk.length;
            if (size > 65536) {
                response.writeHead(413).end();
                return;
            }
            chunks.push(chunk);
        }
        const url = new URL(request.url, 'http://127.0.0.1');
        const headers = Object.fromEntries(
            Object.entries(request.headers).map(([key, value]) => [
                key,
                Array.isArray(value) ? value.join(',') : (value ?? ''),
            ])
        );
        // This gateway is published on loopback only. External authorizer claims are never copied.
        const event = {
            version: '2.0',
            routeKey: '$default',
            rawPath: url.pathname,
            rawQueryString: url.search.slice(1),
            headers,
            cookies: headers.cookie ? headers.cookie.split(';').map((cookie) => cookie.trim()) : [],
            requestContext: {
                stage: '$default',
                requestId: randomUUID(),
                http: {
                    method: request.method,
                    path: url.pathname,
                    protocol: 'HTTP/1.1',
                    sourceIp: '127.0.0.1',
                },
            },
            body: Buffer.concat(chunks).toString('base64'),
            isBase64Encoded: true,
        };
        const endpoint =
            url.pathname.startsWith('/v1/multiplayer/') || url.pathname.startsWith('/internal/dev/')
                ? multiplayer
                : accounts;
        const result = await invoke(endpoint, event);
        response.writeHead(result.statusCode, {
            ...result.headers,
            ...(result.cookies?.length ? { 'set-cookie': result.cookies } : {}),
        });
        response.end(Buffer.from(result.body ?? '', result.isBase64Encoded ? 'base64' : 'utf8'));
    } catch (error) {
        console.error(error instanceof Error ? error.message : 'Local gateway failed');
        if (!response.headersSent) response.writeHead(502, { 'content-type': 'application/json' });
        response.end(
            JSON.stringify({
                code: 'LOCAL_LAMBDA_UNAVAILABLE',
                message: 'The local Lambda is unavailable. Check Docker logs.',
            })
        );
    }
});
server.listen(8787, '0.0.0.0');
