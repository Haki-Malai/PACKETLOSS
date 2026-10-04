import { z } from 'zod';
import { ApiError } from './models';

export interface GatewayEvent {
    version?: string;
    rawPath?: string;
    body?: string | null;
    isBase64Encoded?: boolean;
    headers?: Record<string, string | undefined>;
    cookies?: string[];
    requestContext?: {
        http?: { method?: string; path?: string; sourceIp?: string };
        authorizer?: { jwt?: { claims?: Record<string, unknown> } };
    };
}
export interface GatewayResponse {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
    cookies?: string[];
}
export interface RequestContext {
    event: GatewayEvent;
    method: string;
    path: string;
    headers: Record<string, string | undefined>;
    body: unknown;
    cookies: Record<string, string>;
    subject(): Promise<string>;
}
interface HttpOptions {
    stage: string;
    origins: string[];
    maxBytes: number;
    methods?: string;
    noStore?: boolean;
    authenticate?: (
        event: GatewayEvent,
        headers: Record<string, string | undefined>
    ) => Promise<string | undefined>;
    failure?: () => ApiError;
}
/** Format an API Gateway v2 response, preserving empty 204 bodies and multiple cookies. */
export function response(
    body: unknown = null,
    statusCode = 200,
    cookies?: string[]
): GatewayResponse {
    return {
        statusCode,
        headers: statusCode === 204 ? {} : { 'content-type': 'application/json' },
        body: statusCode === 204 ? '' : JSON.stringify(body),
        ...(cookies ? { cookies } : {}),
    };
}
/** Serialize stable API failures without internal provider or validation details. */
export function errorResponse(error: ApiError): GatewayResponse {
    const result = response({ code: error.code, message: error.message }, error.statusCode);
    if (error.retryAfter) result.headers['retry-after'] = String(error.retryAfter);
    return result;
}
/** Share body limits, JSON validation, cookies, CORS, and trusted identity handling. */
export function createHttpHandler(
    options: HttpOptions,
    route: (request: RequestContext) => Promise<GatewayResponse>
) {
    /** Handle exactly one buffered API Gateway request without opening an HTTP listener. */
    return async (event: GatewayEvent): Promise<GatewayResponse> => {
        const headers = Object.fromEntries(
            Object.entries(event.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value])
        );
        const method = event.requestContext?.http?.method ?? 'GET',
            path = event.rawPath ?? event.requestContext?.http?.path ?? '/';
        let result: GatewayResponse;
        try {
            const declared = headers['content-length'];
            if (declared && !/^\d+$/.test(declared))
                throw new ApiError(400, 'INVALID_REQUEST', 'The request size is invalid.');
            const raw = Buffer.from(event.body ?? '', event.isBase64Encoded ? 'base64' : 'utf8');
            if (raw.byteLength > options.maxBytes || Number(declared ?? 0) > options.maxBytes)
                throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'The request is too large.');
            if (method === 'OPTIONS') {
                const requestedMethod = headers['access-control-request-method'] ?? '';
                const requestedHeaders = (headers['access-control-request-headers'] ?? '')
                    .toLowerCase()
                    .split(',')
                    .map((value) => value.trim())
                    .filter(Boolean);
                if (
                    !options.origins.includes(headers.origin ?? '') ||
                    !(options.methods ?? 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
                        .split(', ')
                        .includes(requestedMethod) ||
                    requestedHeaders.some(
                        (name) => !['authorization', 'content-type'].includes(name)
                    )
                )
                    throw new ApiError(400, 'INVALID_REQUEST', 'Disallowed CORS request.');
                result = response(null);
                result.headers['access-control-allow-methods'] =
                    options.methods ?? 'GET, POST, PATCH, PUT, DELETE, OPTIONS';
                result.headers['access-control-allow-headers'] = 'Authorization, Content-Type';
                result.headers['access-control-max-age'] = '600';
            } else {
                let body: unknown = null;
                if (raw.byteLength) {
                    try {
                        body = JSON.parse(raw.toString('utf8')) as unknown;
                    } catch {
                        throw new ApiError(422, 'INVALID_REQUEST', 'Check the submitted details.');
                    }
                }
                const cookies: Record<string, string> = {};
                for (const cookie of event.cookies ?? (headers.cookie ?? '').split(';')) {
                    const index = cookie.indexOf('=');
                    if (index >= 0)
                        cookies[cookie.slice(0, index).trim()] = cookie.slice(index + 1).trim();
                }
                const subject = async (): Promise<string> => {
                    const value = options.authenticate
                        ? await options.authenticate(event, headers)
                        : (event.requestContext?.authorizer?.jwt?.claims?.sub ??
                          (options.stage === 'test' ? headers['x-test-user'] : undefined));
                    if (typeof value !== 'string' || !value)
                        throw new ApiError(401, 'AUTH_REQUIRED', 'Log in to continue.');
                    return value;
                };
                result = await route({ event, method, path, headers, body, cookies, subject });
            }
        } catch (error) {
            result = errorResponse(
                error instanceof ApiError
                    ? error
                    : error instanceof z.ZodError
                      ? new ApiError(422, 'INVALID_REQUEST', 'Check the submitted details.')
                      : (options.failure?.() ??
                        new ApiError(
                            503,
                            'API_UNAVAILABLE',
                            'The service is temporarily unavailable.',
                            30
                        ))
            );
        }
        if (options.noStore) result.headers['cache-control'] = 'no-store';
        if (headers.origin && options.origins.includes(headers.origin)) {
            result.headers['access-control-allow-origin'] = headers.origin;
            result.headers['access-control-allow-credentials'] = 'true';
            result.headers['access-control-expose-headers'] = 'Retry-After';
            result.headers.vary = 'Origin';
        }
        return result;
    };
}
