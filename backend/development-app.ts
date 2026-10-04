import { z } from 'zod';
import { equalSecret } from './auth';
import { browserOrigins, isLoopback, validateDevelopment } from './config';
import type { DevelopmentSettings, Settings } from './config';
import { createAccountApp } from './account-app';
import { createMultiplayerApp } from './multiplayer-app';
import { createHttpHandler, response } from './http';
import type { GatewayEvent } from './http';
import { LocalAuth } from './local-auth';
import { LocalRepository, localMultiplayerSettings } from './local-repository';
import { MultiplayerControl } from './multiplayer-control';
import {
    ApiError,
    generationSchema,
    matchStartSchema,
    nowSeconds,
    resultSchema,
    roomStatusSchema,
} from './models';

/** Compose local adapters behind exactly the production account and public control routes. */
export function createDevelopmentApp(
    settings: DevelopmentSettings,
    repository = new LocalRepository(settings.dynamodbEndpoint),
    clock = nowSeconds
) {
    validateDevelopment(settings);
    const auth = new LocalAuth(repository, settings.authKey, clock),
        origins = browserOrigins(settings);
    const accountSettings: Settings = {
        stage: 'development',
        tableName: 'local',
        userPoolId: 'local',
        userPoolClientId: 'local',
        userPoolClientSecret: settings.authKey,
        siteOrigin: settings.siteOrigin,
        refreshCookieName: 'packetloss_dev_refresh',
        signupDailyLimit: 1000,
        signupAccountLimit: 10000,
        maxPayloadBytes: 16384,
    };
    /** Ignore caller-supplied authorizer claims; inject only an independently verified local token. */
    const authenticate = async (
        _event: GatewayEvent,
        headers: Record<string, string | undefined>
    ): Promise<string | undefined> => {
        const token = headers.authorization;
        if (!token?.startsWith('Bearer ')) return undefined;
        try {
            return await auth.verifyAccessToken(token.slice(7));
        } catch (error) {
            if (error instanceof ApiError) return undefined;
            throw error;
        }
    };
    const accounts = createAccountApp(accountSettings, auth, repository, {
        origins,
        authenticate,
        guest: (profile) => auth.guest(profile),
    });
    const multiplayerSettings = localMultiplayerSettings(
        settings.siteOrigin,
        settings.websocketUrl
    );
    const control = new MultiplayerControl(
        multiplayerSettings,
        repository,
        {
            /** The Compose game process starts automatically; logical regions never contact EC2. */
            states: () => Promise.resolve({ eu: 'running', na: 'stopped' }),
            /** Local lifecycle startup requires no cloud operation. */
            start: () => Promise.resolve(),
        },
        clock,
        () => settings.runId
    );
    const multiplayer = createMultiplayerApp(multiplayerSettings, control, {
        origins,
        authenticate,
    });
    const internal = createHttpHandler(
        { stage: 'development', origins: [], maxBytes: 65536, noStore: true },
        async (request) => {
            if (
                !isLoopback(request.event.requestContext?.http?.sourceIp ?? '') ||
                !equalSecret(
                    request.headers.authorization ?? '',
                    `Bearer ${settings.internalToken}`
                )
            )
                throw new ApiError(
                    401,
                    'AUTH_REQUIRED',
                    'Local server authentication is required.'
                );
            if (request.method !== 'POST') return response({ detail: 'Not Found' }, 404);
            const { path, body } = request;
            if (path === '/internal/dev/process/register') {
                const payload = generationSchema.parse(body);
                if (
                    payload.instanceRunId !== settings.runId ||
                    !(await repository.registerProcess(
                        payload.instanceRunId,
                        payload.processGeneration
                    ))
                )
                    throw new ApiError(
                        409,
                        'PROCESS_CONFLICT',
                        'The local server run has changed.'
                    );
                return response(null, 204);
            }
            if (path === '/internal/dev/heartbeat') {
                const payload = generationSchema.extend({ status: roomStatusSchema }).parse(body);
                return response({
                    active: await repository.heartbeat(
                        payload.instanceRunId,
                        payload.processGeneration,
                        payload.status,
                        clock()
                    ),
                });
            }
            if (path === '/internal/dev/tickets/consume') {
                const payload = generationSchema
                    .extend({ ticket: z.string().min(16).max(512) })
                    .parse(body);
                const ticket = await repository.consumeTicket(
                    payload.ticket,
                    'eu',
                    payload.instanceRunId,
                    payload.processGeneration,
                    clock()
                );
                return response({
                    playerId: ticket.subject,
                    name: ticket.nickname,
                    operation: ticket.operation,
                    ...(ticket.roomCode ? { roomCode: ticket.roomCode } : {}),
                });
            }
            if (path === '/internal/dev/matches/start') {
                await repository.localMatchStart(matchStartSchema.parse(body));
                return response(null, 204);
            }
            if (path === '/internal/dev/matches/finish') {
                const payload = generationSchema
                    .extend({
                        result: resultSchema.omit({ region: true }).extend({
                            matchId: z
                                .string()
                                .min(1)
                                .max(128)
                                .regex(/^[A-Za-z0-9_-]+$/),
                            startedAt: z.string().min(1).max(64),
                        }),
                    })
                    .parse(body);
                await repository.localMatchFinish(
                    payload.instanceRunId,
                    payload.processGeneration,
                    payload.result
                );
                return response(null, 204);
            }
            return response({ detail: 'Not Found' }, 404);
        }
    );
    /** Route local requests without altering the persistent runtime during a cold start. */
    const handler = (event: GatewayEvent) => {
        const path = event.rawPath ?? '';
        return (
            path.startsWith('/internal/dev/')
                ? internal
                : path.startsWith('/v1/multiplayer/')
                  ? multiplayer
                  : accounts
        )(event);
    };
    return { handler, auth, repository };
}
