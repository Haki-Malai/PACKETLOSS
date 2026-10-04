import type { LocalRunRecord } from './LocalProfileStore';
import type {
    GameRegion,
    JoinCredential,
    JoinCredentialRequest,
    MultiplayerApi,
    MultiplayerCapabilities,
    MultiplayerMatchResult,
    MultiplayerStatus,
    StartServerResponse,
} from './MultiplayerClient';

export const AVATAR_CHOICES = [
    'packet',
    'firewall',
    'virus',
    'ping',
    'spam',
    'lag',
    'quarantine',
    'trojan',
] as const;

export type AvatarChoice = (typeof AVATAR_CHOICES)[number];

export interface CloudProfile {
    /** Stable Cognito subject derived locally from the authenticated ID token, never profile JSON. */
    accountId?: string;
    nickname: string;
    avatar: AvatarChoice;
}

export interface SignupDetails extends CloudProfile {
    email: string;
    password: string;
}

interface AccessTokenResponse {
    accessToken: string;
    expiresIn: number;
}

interface RecordsResponse {
    records: LocalRunRecord[];
}

export interface AccountApi {
    readonly localDevelopment?: boolean;
    guest?(_nickname: string): Promise<void>;
    signup(_details: SignupDetails): Promise<void>;
    confirmSignup(_email: string, _code: string): Promise<void>;
    resendConfirmation(_email: string): Promise<void>;
    login(_email: string, _password: string): Promise<void>;
    refresh(): Promise<void>;
    logout(): Promise<void>;
    forgotPassword(_email: string): Promise<void>;
    resetPassword(_email: string, _code: string, _password: string): Promise<void>;
    getProfile(): Promise<CloudProfile>;
    updateProfile(_profile: CloudProfile): Promise<CloudProfile>;
    getRecords(): Promise<LocalRunRecord[]>;
    putRecords(_records: readonly LocalRunRecord[]): Promise<LocalRunRecord[]>;
    clearRecords(): Promise<void>;
}

export class AccountClientError extends Error {
    constructor(
        readonly code: string,
        message: string,
        readonly status: number,
        readonly retryAfterMs = 0
    ) {
        super(message);
        this.name = 'AccountClientError';
    }
}

/** Reads the authenticated subject used only to partition browser-owned session state. */
function tokenSubject(token: string | null): string {
    try {
        const encoded = token?.split('.')[1];
        if (!encoded) throw new Error('Missing token payload.');
        const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(
            globalThis.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
        ) as {
            sub?: unknown;
        };
        if (typeof payload.sub !== 'string' || payload.sub.length < 1 || payload.sub.length > 128) {
            throw new Error('Missing token subject.');
        }
        return payload.sub;
    } catch {
        throw new AccountClientError('SESSION_EXPIRED', 'Log in again to continue.', 401);
    }
}

/** Creates the account API only for builds configured with a backend origin. */
export function createAccountClient(): AccountApi | null {
    const origin = import.meta.env.VITE_API_URL?.trim();
    return origin ? new FetchAccountClient(origin) : null;
}

export class FetchAccountClient implements AccountApi, MultiplayerApi {
    readonly localDevelopment: boolean;
    private readonly origin: string;
    private accessToken: string | null = null;
    private sessionGeneration = 0;
    private pendingLogout: Promise<void> | null = null;

    constructor(origin: string) {
        const endpoint = new URL(origin);
        const localHosts = new Set(['127.0.0.1', 'localhost']);
        this.localDevelopment =
            import.meta.env.DEV &&
            import.meta.env.VITE_LOCAL_DEVELOPMENT === '1' &&
            endpoint.protocol === 'http:' &&
            localHosts.has(endpoint.hostname);
        // Keep local refresh cookies same-site when Vite is opened through either alias.
        if (
            this.localDevelopment &&
            globalThis.location?.protocol === 'http:' &&
            localHosts.has(globalThis.location.hostname)
        ) {
            endpoint.hostname = globalThis.location.hostname;
        }
        this.origin = (this.localDevelopment ? endpoint.toString() : origin).replace(/\/$/, '');
    }

    /** Starts email verification for a bounded new account. */
    async signup(details: SignupDetails): Promise<void> {
        await this.request('/v1/auth/signup', { method: 'POST', body: JSON.stringify(details) });
    }

    /** Confirms a signup with its emailed code. */
    async confirmSignup(email: string, code: string): Promise<void> {
        await this.request('/v1/auth/confirm', {
            method: 'POST',
            body: JSON.stringify({ email, code }),
        });
    }

    /** Requests a replacement confirmation code for a pending signup. */
    async resendConfirmation(email: string): Promise<void> {
        await this.request('/v1/auth/resend-confirmation', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    /** Authenticates and keeps the returned ID token in memory. */
    async login(email: string, password: string): Promise<void> {
        const pendingLogout = this.pendingLogout;
        if (pendingLogout) await pendingLogout;
        const generation = ++this.sessionGeneration;
        this.accessToken = null;
        const tokens = await this.request<AccessTokenResponse>('/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.requireGeneration(generation);
        this.accessToken = tokens.accessToken;
    }

    /** Starts a fresh name-only local session without reusing another player's identity. */
    async guest(nickname: string): Promise<void> {
        if (!this.localDevelopment)
            throw new AccountClientError('UNAVAILABLE', 'Guest play is unavailable.', 404);
        if (this.pendingLogout) await this.pendingLogout;
        const generation = ++this.sessionGeneration;
        this.accessToken = null;
        const tokens = await this.request<AccessTokenResponse>('/v1/auth/guest', {
            method: 'POST',
            body: JSON.stringify({ nickname }),
        });
        this.requireGeneration(generation);
        this.accessToken = tokens.accessToken;
    }

    /** Restores an in-memory ID token and optionally preserves the active account identity. */
    async refresh(expectedSubject?: string): Promise<void> {
        const generation = this.sessionGeneration;
        const pendingLogout = this.pendingLogout;
        if (pendingLogout) await pendingLogout;
        this.requireGeneration(generation);
        const tokens = await this.request<AccessTokenResponse>('/v1/auth/refresh', {
            method: 'POST',
        });
        this.requireGeneration(generation);
        if (expectedSubject && tokenSubject(tokens.accessToken) !== expectedSubject) {
            this.sessionGeneration += 1;
            this.accessToken = null;
            throw new AccountClientError('SESSION_EXPIRED', 'Log in again to continue.', 401);
        }
        this.accessToken = tokens.accessToken;
    }

    /** Revokes the refresh cookie and clears the in-memory token. */
    async logout(): Promise<void> {
        if (this.pendingLogout) return this.pendingLogout;
        this.sessionGeneration += 1;
        this.accessToken = null;
        const request = this.request('/v1/auth/logout', { method: 'POST' });
        this.pendingLogout = request;
        try {
            await request;
        } finally {
            if (this.pendingLogout === request) this.pendingLogout = null;
        }
    }

    /** Requests an emailed password recovery code. */
    async forgotPassword(email: string): Promise<void> {
        await this.request('/v1/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    /** Confirms a password recovery code and new password. */
    async resetPassword(email: string, code: string, password: string): Promise<void> {
        await this.request('/v1/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, code, password }),
        });
    }

    /** Loads the authenticated player profile. */
    async getProfile(): Promise<CloudProfile> {
        const profile = await this.authenticatedRequest<Omit<CloudProfile, 'accountId'>>('/v1/me');
        return { ...profile, accountId: tokenSubject(this.accessToken) };
    }

    /** Replaces the authenticated player profile. */
    async updateProfile(profile: CloudProfile): Promise<CloudProfile> {
        const saved = await this.authenticatedRequest<Omit<CloudProfile, 'accountId'>>('/v1/me', {
            method: 'PATCH',
            body: JSON.stringify({ nickname: profile.nickname, avatar: profile.avatar }),
        });
        return { ...saved, accountId: tokenSubject(this.accessToken) };
    }

    /** Loads the authenticated player's canonical retained records. */
    async getRecords(): Promise<LocalRunRecord[]> {
        return (await this.authenticatedRequest<RecordsResponse>('/v1/me/records')).records;
    }

    /** Idempotently uploads completed runs and returns canonical retention. */
    async putRecords(records: readonly LocalRunRecord[]): Promise<LocalRunRecord[]> {
        return (
            await this.authenticatedRequest<RecordsResponse>('/v1/me/records', {
                method: 'PUT',
                body: JSON.stringify({ records }),
            })
        ).records;
    }

    /** Clears cloud records while preserving the account profile. */
    async clearRecords(): Promise<void> {
        await this.authenticatedRequest('/v1/me/records', { method: 'DELETE' });
    }

    /** Reads availability without waking either regional game server. */
    async getMultiplayerStatus(signal?: AbortSignal): Promise<MultiplayerStatus> {
        return this.request('/v1/multiplayer/status', { signal });
    }

    /** Reads server-start authority for the authenticated production identity. */
    async getMultiplayerCapabilities(signal?: AbortSignal): Promise<MultiplayerCapabilities> {
        return this.authenticatedRequest('/v1/multiplayer/capabilities', { signal });
    }

    /** Requests an asynchronous, owner-authorized start in one region. */
    async startMultiplayerServer(region: GameRegion): Promise<StartServerResponse> {
        return this.authenticatedRequest('/v1/multiplayer/start', {
            method: 'POST',
            body: JSON.stringify({ region }),
        });
    }

    /** Issues one short-lived credential for the selected room operation. */
    async createJoinCredential(request: JoinCredentialRequest): Promise<JoinCredential> {
        return this.authenticatedRequest('/v1/multiplayer/join-credentials', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    /** Reads one authoritative multiplayer result visible to its participant. */
    async getMultiplayerMatch(matchId: string): Promise<MultiplayerMatchResult> {
        return this.authenticatedRequest(`/v1/multiplayer/matches/${encodeURIComponent(matchId)}`);
    }

    /** Makes an authenticated request and refreshes an expired token once. */
    private async authenticatedRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
        const generation = this.sessionGeneration;
        try {
            const result = await this.request<T>(path, this.withAuthorization(init));
            this.requireGeneration(generation);
            return result;
        } catch (error) {
            this.requireGeneration(generation);
            if (!(error instanceof AccountClientError) || error.status !== 401) throw error;
            if (!this.accessToken) throw error;
            const expectedSubject = tokenSubject(this.accessToken);
            await this.refresh(expectedSubject);
            this.requireGeneration(generation);
            const result = await this.request<T>(path, this.withAuthorization(init));
            this.requireGeneration(generation);
            return result;
        }
    }

    /** Rejects a completion from an authentication operation superseded by login or logout. */
    private requireGeneration(expected: number): void {
        if (this.sessionGeneration !== expected) {
            throw new AccountClientError('SESSION_EXPIRED', 'Log in again to continue.', 401);
        }
    }

    /** Adds the current in-memory bearer token to a request. */
    private withAuthorization(init: RequestInit): RequestInit {
        if (!this.accessToken)
            throw new AccountClientError('AUTH_REQUIRED', 'Log in to continue.', 401);
        return {
            ...init,
            headers: { ...this.headers(init), Authorization: `Bearer ${this.accessToken}` },
        };
    }

    /** Bounds a credentialed request, including body reads, to fifteen seconds. */
    private async request<T = void>(path: string, init: RequestInit = {}): Promise<T> {
        const controller = new AbortController();
        const abortFromCaller = () => controller.abort();
        if (init.signal?.aborted) controller.abort();
        else init.signal?.addEventListener('abort', abortFromCaller, { once: true });
        const timeout = globalThis.setTimeout(() => controller.abort(), 15_000);
        try {
            const response = await fetch(`${this.origin}${path}`, {
                ...init,
                signal: controller.signal,
                credentials: 'include',
                headers: this.headers(init),
            });
            if (!response.ok) {
                const body = await this.errorBody(response);
                const retrySeconds = Number(response.headers.get('Retry-After') ?? 0);
                const defaultRetryMs =
                    response.status === 429 || response.status >= 500 ? 30_000 : 0;
                throw new AccountClientError(
                    body.code,
                    body.message,
                    response.status,
                    Number.isFinite(retrySeconds) && retrySeconds > 0
                        ? retrySeconds * 1000
                        : defaultRetryMs
                );
            }
            if (response.status === 204) return undefined as T;
            return (await response.json()) as T;
        } catch (error) {
            if (error instanceof AccountClientError) throw error;
            throw new AccountClientError(
                'SERVICE_UNAVAILABLE',
                'Accounts are temporarily unavailable.',
                503,
                30_000
            );
        } finally {
            globalThis.clearTimeout(timeout);
            init.signal?.removeEventListener('abort', abortFromCaller);
        }
    }

    /** Normalizes request headers and adds JSON content type only when a body exists. */
    private headers(init: RequestInit): Record<string, string> {
        const headers = Object.fromEntries(new Headers(init.headers).entries());
        if (init.body) headers['content-type'] = 'application/json';
        return headers;
    }

    /** Reads a safe error shape even when an upstream response is malformed. */
    private async errorBody(response: Response): Promise<{ code: string; message: string }> {
        try {
            const body = (await response.json()) as { code?: unknown; message?: unknown };
            if (typeof body.code === 'string' && typeof body.message === 'string')
                return body as {
                    code: string;
                    message: string;
                };
        } catch {
            // Fall through to the stable generic error.
        }
        return {
            code: response.status === 429 ? 'RATE_LIMITED' : 'SERVICE_UNAVAILABLE',
            message:
                response.status === 429
                    ? 'The server is busy. Try again shortly.'
                    : 'Accounts are temporarily unavailable. Local play is still available.',
        };
    }
}
