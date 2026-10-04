import { createHmac, timingSafeEqual } from 'node:crypto';
import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    ConfirmSignUpCommand,
    ResendConfirmationCodeCommand,
    InitiateAuthCommand,
    RevokeTokenCommand,
    ForgotPasswordCommand,
    ConfirmForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import type { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';
import type { Settings } from './config';
import { ApiError } from './models';

export interface AuthTokens {
    idToken: string;
    expiresIn: number;
    refreshToken?: string;
    subject?: string;
}
export interface AuthGateway {
    signup(email: string, password: string): Promise<string>;
    confirmSignup(email: string, code: string): Promise<void>;
    resendConfirmation(email: string): Promise<void>;
    login(email: string, password: string): Promise<AuthTokens>;
    refresh(cookie: string): Promise<AuthTokens>;
    logout(cookie: string): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(email: string, code: string, password: string): Promise<void>;
    packRefreshCookie(tokens: AuthTokens): string;
}
/** Compare secrets without disclosing matching prefixes. */
export function equalSecret(left: Uint8Array | string, right: Uint8Array | string): boolean {
    const a = Buffer.from(left),
        b = Buffer.from(right);
    return a.length === b.length && timingSafeEqual(a, b);
}
/** Convert provider failures to stable public codes without logging credential material. */
export async function cognitoCall<T>(operation: () => Promise<T>): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        const mapping: Record<string, [number, string, string]> = {
            UsernameExistsException: [409, 'ACCOUNT_EXISTS', 'An account already exists.'],
            CodeMismatchException: [400, 'INVALID_CODE', 'The confirmation code is invalid.'],
            ExpiredCodeException: [400, 'INVALID_CODE', 'The confirmation code has expired.'],
            NotAuthorizedException: [401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.'],
            UserNotFoundException: [401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.'],
            UserNotConfirmedException: [409, 'ACCOUNT_UNCONFIRMED', 'Confirm your email first.'],
            InvalidPasswordException: [
                400,
                'INVALID_PASSWORD',
                'The password does not meet the requirements.',
            ],
            LimitExceededException: [429, 'RATE_LIMITED', 'Too many attempts. Try again later.'],
            TooManyRequestsException: [429, 'RATE_LIMITED', 'Too many attempts. Try again later.'],
        };
        const [status, code, message] = mapping[error instanceof Error ? error.name : ''] ?? [
            503,
            'AUTH_UNAVAILABLE',
            'Accounts are temporarily unavailable.',
        ];
        throw new ApiError(status, code, message, status === 429 ? 60 : 30);
    }
}
/** Adapt confidential Cognito authentication while keeping existing signed cookies valid. */
export class CognitoAuth implements AuthGateway {
    /** Accept an SDK client for deterministic contract tests. */
    constructor(
        readonly settings: Settings,
        readonly client = new CognitoIdentityProviderClient({})
    ) {}
    /** Calculate Cognito's confidential app-client HMAC. */
    private secretHash(username: string): string {
        return createHmac('sha256', this.settings.userPoolClientSecret)
            .update(`${username}${this.settings.userPoolClientId}`)
            .digest('base64');
    }
    /** Create an unconfirmed user and return its stable subject. */
    async signup(email: string, password: string): Promise<string> {
        const result = await cognitoCall(() =>
            this.client.send(
                new SignUpCommand({
                    ClientId: this.settings.userPoolClientId,
                    SecretHash: this.secretHash(email),
                    Username: email,
                    Password: password,
                    UserAttributes: [{ Name: 'email', Value: email }],
                })
            )
        );
        if (!result.UserSub)
            throw new ApiError(
                503,
                'AUTH_UNAVAILABLE',
                'Accounts are temporarily unavailable.',
                30
            );
        return result.UserSub;
    }
    /** Confirm an account using its emailed code. */
    async confirmSignup(email: string, code: string): Promise<void> {
        await cognitoCall(() =>
            this.client.send(
                new ConfirmSignUpCommand({
                    ClientId: this.settings.userPoolClientId,
                    SecretHash: this.secretHash(email),
                    Username: email,
                    ConfirmationCode: code,
                })
            )
        );
    }
    /** Resend account verification through the confidential client. */
    async resendConfirmation(email: string): Promise<void> {
        await cognitoCall(() =>
            this.client.send(
                new ResendConfirmationCodeCommand({
                    ClientId: this.settings.userPoolClientId,
                    SecretHash: this.secretHash(email),
                    Username: email,
                })
            )
        );
    }
    /** Authenticate a password without exposing the client secret to the browser. */
    async login(email: string, password: string): Promise<AuthTokens> {
        const result = await cognitoCall(() =>
            this.client.send(
                new InitiateAuthCommand({
                    ClientId: this.settings.userPoolClientId,
                    AuthFlow: 'USER_PASSWORD_AUTH',
                    AuthParameters: {
                        USERNAME: email,
                        PASSWORD: password,
                        SECRET_HASH: this.secretHash(email),
                    },
                })
            )
        );
        return this.tokens(result.AuthenticationResult, true);
    }
    /** Exchange a signed refresh cookie for an in-memory ID token. */
    async refresh(cookie: string): Promise<AuthTokens> {
        const payload = this.unpackCookie(cookie);
        const result = await cognitoCall(() =>
            this.client.send(
                new InitiateAuthCommand({
                    ClientId: this.settings.userPoolClientId,
                    AuthFlow: 'REFRESH_TOKEN_AUTH',
                    AuthParameters: {
                        REFRESH_TOKEN: payload.refreshToken,
                        SECRET_HASH: this.secretHash(payload.subject),
                    },
                })
            )
        );
        return this.tokens(result.AuthenticationResult, false);
    }
    /** Revoke exactly the refresh token held by this browser. */
    async logout(cookie: string): Promise<void> {
        const payload = this.unpackCookie(cookie);
        await cognitoCall(() =>
            this.client.send(
                new RevokeTokenCommand({
                    ClientId: this.settings.userPoolClientId,
                    ClientSecret: this.settings.userPoolClientSecret,
                    Token: payload.refreshToken,
                })
            )
        );
    }
    /** Request a password recovery code. */
    async forgotPassword(email: string): Promise<void> {
        await cognitoCall(() =>
            this.client.send(
                new ForgotPasswordCommand({
                    ClientId: this.settings.userPoolClientId,
                    SecretHash: this.secretHash(email),
                    Username: email,
                })
            )
        );
    }
    /** Apply a password after Cognito verifies its recovery code. */
    async resetPassword(email: string, code: string, password: string): Promise<void> {
        await cognitoCall(() =>
            this.client.send(
                new ConfirmForgotPasswordCommand({
                    ClientId: this.settings.userPoolClientId,
                    SecretHash: this.secretHash(email),
                    Username: email,
                    ConfirmationCode: code,
                    Password: password,
                })
            )
        );
    }
    /** Encode the established refresh-token/subject payload and HMAC format. */
    packRefreshCookie(tokens: AuthTokens): string {
        if (!tokens.refreshToken || !tokens.subject)
            throw new ApiError(
                503,
                'AUTH_UNAVAILABLE',
                'Accounts are temporarily unavailable.',
                30
            );
        const encoded = Buffer.from(
            JSON.stringify({ refreshToken: tokens.refreshToken, subject: tokens.subject })
        ).toString('base64url');
        return `${encoded}.${createHmac('sha256', this.settings.userPoolClientSecret).update(encoded).digest('base64url')}`;
    }
    /** Reject altered or malformed cookies before calling Cognito. */
    private unpackCookie(cookie: string): { refreshToken: string; subject: string } {
        try {
            const parts = cookie.split('.');
            if (parts.length !== 2) throw new Error('Invalid cookie');
            const [encoded, signature] = parts;
            if (
                !equalSecret(
                    createHmac('sha256', this.settings.userPoolClientSecret)
                        .update(encoded)
                        .digest(),
                    Buffer.from(signature, 'base64url')
                )
            )
                throw new Error('Invalid signature');
            const value = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as Record<
                string,
                unknown
            >;
            if (typeof value.refreshToken !== 'string' || typeof value.subject !== 'string')
                throw new Error('Invalid payload');
            return { refreshToken: value.refreshToken, subject: value.subject };
        } catch {
            throw new ApiError(401, 'SESSION_EXPIRED', 'Your session has expired.');
        }
    }
    /** Validate provider output and bind only Cognito-issued login tokens to refresh cookies. */
    private tokens(
        result: AuthenticationResultType | undefined,
        requireRefresh: boolean
    ): AuthTokens {
        if (
            !result?.IdToken ||
            !Number.isInteger(result.ExpiresIn) ||
            (result.ExpiresIn ?? 0) <= 0 ||
            (requireRefresh && !result.RefreshToken)
        )
            throw new ApiError(
                503,
                'AUTH_UNAVAILABLE',
                'Accounts are temporarily unavailable.',
                30
            );
        let subject: string | undefined;
        if (requireRefresh) {
            try {
                const payload = JSON.parse(
                    Buffer.from(result.IdToken.split('.')[1], 'base64url').toString()
                ) as Record<string, unknown>;
                if (typeof payload.sub !== 'string' || !payload.sub)
                    throw new Error('Missing subject');
                subject = payload.sub;
            } catch {
                throw new ApiError(
                    503,
                    'AUTH_UNAVAILABLE',
                    'Accounts are temporarily unavailable.',
                    30
                );
            }
        }
        return {
            idToken: result.IdToken,
            expiresIn: result.ExpiresIn!,
            refreshToken: result.RefreshToken,
            subject,
        };
    }
}
