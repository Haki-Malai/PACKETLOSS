import { z } from 'zod';
import type { Settings } from './config';
import type { AuthGateway, AuthTokens } from './auth';
import type { ProfileRepository } from './profile-repository';
import {
    ApiError,
    confirmationSchema,
    emailSchema,
    loginSchema,
    profileSchema,
    recordsSchema,
    resetSchema,
    signupSchema,
} from './models';
import type { Profile } from './models';
import { createHttpHandler, response } from './http';
import type { GatewayEvent } from './http';

interface AccountOptions {
    origins?: string[];
    authenticate?: (
        event: GatewayEvent,
        headers: Record<string, string | undefined>
    ) => Promise<string | undefined>;
    guest?: (profile: Profile) => Promise<AuthTokens>;
}
/** Compose deployed and local accounts from the same public routes and validation rules. */
export function createAccountApp(
    settings: Settings,
    auth: AuthGateway,
    repository: ProfileRepository,
    options: AccountOptions = {}
) {
    const local = settings.stage === 'development';
    const cookie = (value: string, clear = false) =>
        `${settings.refreshCookieName}=${value}; Path=/v1/auth; Max-Age=${clear ? 0 : 30 * 86400}; HttpOnly; SameSite=Strict${!['test', 'development'].includes(settings.stage) ? '; Secure' : ''}`;
    const tokenResponse = (tokens: AuthTokens, setCookie: boolean) =>
        response(
            { accessToken: tokens.idToken, expiresIn: tokens.expiresIn },
            200,
            setCookie ? [cookie(auth.packRefreshCookie(tokens))] : undefined
        );
    return createHttpHandler(
        {
            stage: settings.stage,
            origins: options.origins ?? [settings.siteOrigin],
            maxBytes: settings.maxPayloadBytes,
            authenticate: options.authenticate,
        },
        async (request) => {
            const { path, method, body } = request;
            if (path === '/health' && method === 'GET')
                return response({ status: 'ok', stage: settings.stage });
            if (path === '/v1/auth/signup' && method === 'POST') {
                const payload = signupSchema(local).parse(body),
                    reservation = await repository.reserveSignup(
                        payload.email,
                        settings.signupDailyLimit,
                        settings.signupAccountLimit
                    );
                let identityCreated = false;
                try {
                    const subject = await auth.signup(payload.email, payload.password);
                    identityCreated = true;
                    await repository.putProfile(subject, {
                        nickname: payload.nickname,
                        avatar: payload.avatar,
                    });
                } catch (error) {
                    if (!identityCreated) await repository.releaseSignup(reservation);
                    throw error;
                }
                return response({ confirmationRequired: true }, 202);
            }
            if (path === '/v1/auth/confirm' && method === 'POST') {
                const payload = confirmationSchema.parse(body);
                await auth.confirmSignup(payload.email, payload.code);
                return response(null, 204);
            }
            if (path === '/v1/auth/resend-confirmation' && method === 'POST') {
                const payload = emailSchema.parse(body);
                await auth.resendConfirmation(payload.email);
                return response(null, 204);
            }
            if (path === '/v1/auth/login' && method === 'POST') {
                const payload = loginSchema.parse(body);
                return tokenResponse(await auth.login(payload.email, payload.password), true);
            }
            if (path === '/v1/auth/refresh' && method === 'POST') {
                const token = request.cookies[settings.refreshCookieName];
                if (!token) throw new ApiError(401, 'SESSION_EXPIRED', 'Your session has expired.');
                return tokenResponse(await auth.refresh(token), false);
            }
            if (path === '/v1/auth/logout' && method === 'POST') {
                const token = request.cookies[settings.refreshCookieName];
                if (token) {
                    try {
                        await auth.logout(token);
                    } catch (error) {
                        if (!(error instanceof ApiError)) throw error;
                    }
                }
                return response(null, 204, [cookie('', true)]);
            }
            if (path === '/v1/auth/forgot-password' && method === 'POST') {
                const payload = emailSchema.parse(body);
                try {
                    await auth.forgotPassword(payload.email);
                } catch (error) {
                    if (!(error instanceof ApiError) || error.code !== 'INVALID_CREDENTIALS')
                        throw error;
                }
                return response(null, 204);
            }
            if (path === '/v1/auth/reset-password' && method === 'POST') {
                const payload = resetSchema(local).parse(body);
                await auth.resetPassword(payload.email, payload.code, payload.password);
                return response(null, 204);
            }
            if (path === '/v1/auth/guest' && method === 'POST' && local && options.guest) {
                const payload = z
                    .strictObject({ nickname: z.string().min(1).max(16).regex(/\S/) })
                    .parse(body);
                return tokenResponse(await options.guest(profileSchema.parse(payload)), true);
            }
            if (path === '/v1/me' && method === 'GET')
                return response(await repository.getProfile(await request.subject()));
            if (path === '/v1/me' && method === 'PATCH') {
                const profile = profileSchema.parse(body);
                await repository.putProfile(await request.subject(), profile);
                return response(profile);
            }
            if (path === '/v1/me/records' && method === 'GET')
                return response({ records: await repository.getRecords(await request.subject()) });
            if (path === '/v1/me/records' && method === 'PUT') {
                const payload = recordsSchema.parse(body);
                return response({
                    records: await repository.saveRecords(await request.subject(), payload.records),
                });
            }
            if (path === '/v1/me/records' && method === 'DELETE') {
                await repository.clearRecords(await request.subject());
                return response(null, 204);
            }
            return response({ detail: 'Not Found' }, 404);
        }
    );
}
