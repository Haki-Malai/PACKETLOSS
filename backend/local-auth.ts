import { createHash, createHmac, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { equalSecret } from './auth';
import type { AuthGateway, AuthTokens } from './auth';
import type { IdentityRepository } from './local-repository';
import { tokenHash } from './multiplayer-repository';
import { ApiError, nowSeconds } from './models';
import type { Profile } from './models';

export const DEVELOPMENT_CODE = '000000';
export const DEVELOPMENT_PASSWORD = 'packetloss-dev';
const derive = promisify(scrypt);
const seededAccounts = [
    ['dev-owner', 'owner@packetloss.local', 'OWNER', 'packet'],
    ['dev-friend-1', 'friend1@packetloss.local', 'FRIEND1', 'firewall'],
    ['dev-friend-2', 'friend2@packetloss.local', 'FRIEND2', 'virus'],
    ['dev-friend-3', 'friend3@packetloss.local', 'FRIEND3', 'ping'],
] as const;
/** Keep the established scrypt parameters and binary format of persisted local passwords. */
export async function passwordHash(password: string, salt: Uint8Array): Promise<Buffer> {
    return (await derive(password, salt, 32)) as Buffer;
}
/** Provide signed local sessions without loading Cognito credentials or using network auth. */
export class LocalAuth implements AuthGateway {
    /** Reject weak keys before issuing any development credential. */
    constructor(
        readonly repository: IdentityRepository,
        readonly signingKey: string,
        readonly clock = nowSeconds
    ) {
        if (Buffer.byteLength(signingKey) < 32)
            throw new Error('PACKETLOSS_DEV_AUTH_KEY must contain at least 32 bytes');
    }
    /** Seed confirmed test identities without resetting existing passwords or profiles. */
    async seedAccounts(): Promise<void> {
        for (const [subject, email, nickname, avatar] of seededAccounts) {
            const salt = createHash('sha256')
                .update(`packetloss:${subject}`)
                .digest()
                .subarray(0, 16);
            await this.repository.seedIdentity(
                subject,
                email,
                salt,
                await passwordHash(DEVELOPMENT_PASSWORD, salt),
                { nickname, avatar }
            );
        }
    }
    /** Create a deterministic identity for one normalized email. */
    async signup(email: string, password: string): Promise<string> {
        const subject = `dev-user-${tokenHash(email).slice(0, 24)}`,
            salt = randomBytes(16);
        await this.repository.createIdentity(
            subject,
            email,
            salt,
            await passwordHash(password, salt),
            DEVELOPMENT_CODE
        );
        return subject;
    }
    /** Confirm a pending local account. */
    confirmSignup(email: string, code: string): Promise<void> {
        return this.repository.confirmIdentity(email, code);
    }
    /** Reissue the documented local verification code. */
    resendConfirmation(email: string): Promise<void> {
        return this.repository.setConfirmationCode(email, DEVELOPMENT_CODE);
    }
    /** Authenticate a confirmed identity and store only its refresh-token digest. */
    async login(email: string, password: string): Promise<AuthTokens> {
        const identity = await this.repository.identityForEmail(email);
        if (
            !identity ||
            !equalSecret(
                identity.password_hash,
                await passwordHash(password, identity.password_salt)
            )
        )
            throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
        if (!identity.confirmed)
            throw new ApiError(409, 'ACCOUNT_UNCONFIRMED', 'Confirm your email first.');
        const refreshToken = randomBytes(32).toString('base64url');
        await this.repository.putRefreshSession(
            tokenHash(refreshToken),
            identity.subject,
            this.clock() + 30 * 86400
        );
        return {
            idToken: this.accessToken(identity.subject),
            expiresIn: 3600,
            refreshToken,
            subject: identity.subject,
        };
    }
    /** A guest nickname creates a unique identity and never selects an existing account. */
    async guest(profile: Profile): Promise<AuthTokens> {
        const subject = `dev-guest-${randomBytes(16).toString('hex')}`,
            email = `${subject}@packetloss.local`,
            password = randomBytes(32).toString('base64url'),
            salt = randomBytes(16);
        await this.repository.seedIdentity(
            subject,
            email,
            salt,
            await passwordHash(password, salt),
            profile
        );
        return this.login(email, password);
    }
    /** Refresh only an unrevoked session belonging to an existing identity. */
    async refresh(cookie: string): Promise<AuthTokens> {
        const subject = await this.repository.refreshSubject(tokenHash(cookie), this.clock());
        if (!subject || !(await this.repository.identityForSubject(subject)))
            throw new ApiError(401, 'SESSION_EXPIRED', 'Your session has expired.');
        return { idToken: this.accessToken(subject), expiresIn: 3600 };
    }
    /** Revoke one browser refresh session. */
    logout(cookie: string): Promise<void> {
        return this.repository.revokeRefreshSession(tokenHash(cookie));
    }
    /** Assign the documented local recovery code to an existing account. */
    forgotPassword(email: string): Promise<void> {
        return this.repository.setResetCode(email, DEVELOPMENT_CODE);
    }
    /** Replace the password and atomically revoke prior refresh sessions. */
    async resetPassword(email: string, code: string, password: string): Promise<void> {
        const salt = randomBytes(16);
        await this.repository.replacePassword(
            email,
            code,
            salt,
            await passwordHash(password, salt)
        );
    }
    /** Return the opaque refresh token for an HttpOnly cookie. */
    packRefreshCookie(tokens: AuthTokens): string {
        if (!tokens.refreshToken)
            throw new ApiError(503, 'AUTH_UNAVAILABLE', 'Accounts are temporarily unavailable.');
        return tokens.refreshToken;
    }
    /** Verify signature, issuer, expiry, header, and persistent identity before injecting claims. */
    async verifyAccessToken(token: string): Promise<string> {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) throw new Error('Invalid token');
            const [header, payload, signature] = parts;
            if (
                !equalSecret(
                    createHmac('sha256', this.signingKey).update(`${header}.${payload}`).digest(),
                    Buffer.from(signature, 'base64url')
                )
            )
                throw new Error('Invalid signature');
            const head = JSON.parse(Buffer.from(header, 'base64url').toString()) as Record<
                string,
                unknown
            >;
            const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Record<
                string,
                unknown
            >;
            if (
                head.alg !== 'HS256' ||
                head.typ !== 'JWT' ||
                Object.keys(head).length !== 2 ||
                claims.iss !== 'packetloss-local' ||
                typeof claims.exp !== 'number' ||
                !Number.isInteger(claims.exp) ||
                claims.exp <= this.clock() ||
                typeof claims.sub !== 'string' ||
                !claims.sub ||
                !(await this.repository.identityForSubject(claims.sub))
            )
                throw new Error('Invalid claims');
            return claims.sub;
        } catch {
            throw new ApiError(401, 'AUTH_REQUIRED', 'Log in to continue.');
        }
    }
    /** Issue one-hour access tokens using the persisted launcher's signing key. */
    private accessToken(subject: string): string {
        const now = this.clock(),
            header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
                'base64url'
            );
        const payload = Buffer.from(
            JSON.stringify({ sub: subject, iat: now, exp: now + 3600, iss: 'packetloss-local' })
        ).toString('base64url');
        return `${header}.${payload}.${createHmac('sha256', this.signingKey).update(`${header}.${payload}`).digest('base64url')}`;
    }
}
