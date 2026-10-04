import { z } from 'zod';
import type { MultiplayerSettings } from './config';
import type { MultiplayerControl } from './multiplayer-control';
import { ApiError, joinSchema, regionSchema } from './models';
import { createHttpHandler, response } from './http';
import type { GatewayEvent } from './http';

/** Expose public control routes separately from accounts, gameplay, and IAM operator events. */
export function createMultiplayerApp(
    settings: MultiplayerSettings,
    control: MultiplayerControl,
    options: {
        origins?: string[];
        authenticate?: (
            event: GatewayEvent,
            headers: Record<string, string | undefined>
        ) => Promise<string | undefined>;
    } = {}
) {
    return createHttpHandler(
        {
            stage: settings.stage,
            origins: options.origins ?? [settings.siteOrigin],
            maxBytes: 4096,
            methods: 'GET, POST, OPTIONS',
            noStore: true,
            authenticate: options.authenticate,
            failure: () =>
                new ApiError(
                    503,
                    'CONTROL_UNAVAILABLE',
                    'Multiplayer is temporarily unavailable.',
                    15
                ),
        },
        async (request) => {
            const { path, method, body } = request;
            if (path === '/v1/multiplayer/status' && method === 'GET')
                return response(await control.status());
            if (path === '/v1/multiplayer/capabilities' && method === 'GET')
                return response(control.capabilities(await request.subject()));
            if (path === '/v1/multiplayer/start' && method === 'POST') {
                const payload = z.strictObject({ region: regionSchema }).parse(body);
                return response(await control.start(await request.subject(), payload.region), 202);
            }
            if (path === '/v1/multiplayer/join-credentials' && method === 'POST')
                return response(
                    await control.joinCredential(await request.subject(), joinSchema.parse(body))
                );
            if (path.startsWith('/v1/multiplayer/matches/') && method === 'GET') {
                const matchId = path.slice('/v1/multiplayer/matches/'.length);
                if (!matchId || matchId.length > 128 || matchId.includes('/'))
                    throw new ApiError(404, 'MATCH_NOT_FOUND', 'This match is unavailable.');
                return response(await control.match(await request.subject(), matchId));
            }
            return response({ detail: 'Not Found' }, 404);
        }
    );
}
