import { describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';
import {
    CognitoIdentityProviderClient,
    ResendConfirmationCodeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoAuth } from '../auth';
import { LocalAuth } from '../local-auth';
import type { Identity, IdentityRepository } from '../local-repository';
import type { Profile } from '../models';
import { ApiError } from '../models';
import { settings } from './fixtures';

/** Keep test identity state in memory; cryptography and public auth behavior remain real. */
class Identities implements IdentityRepository {
    users = new Map<string, Identity>();
    profiles = new Map<string, Profile>();
    sessions = new Map<string, { subject: string; version: number; expiry: number }>();
    /** Look up a stored identity. */
    identityForSubject(subject: string) {
        return Promise.resolve(this.users.get(subject));
    }
    /** Resolve normalized email ownership. */
    identityForEmail(email: string) {
        return Promise.resolve([...this.users.values()].find((user) => user.email === email));
    }
    /** Enforce unique subjects and emails in the test persistence boundary. */
    async createIdentity(
        subject: string,
        email: string,
        salt: Uint8Array,
        hash: Uint8Array,
        code: string | null
    ) {
        if (this.users.has(subject) || (await this.identityForEmail(email)))
            throw new ApiError(409, 'ACCOUNT_EXISTS', 'Exists');
        this.users.set(subject, {
            subject,
            email,
            password_salt: salt,
            password_hash: hash,
            confirmed: code === null,
            confirmation_code: code,
            reset_code: null,
            session_version: 0,
        });
    }
    /** Preserve existing seeded accounts. */
    async seedIdentity(
        subject: string,
        email: string,
        salt: Uint8Array,
        hash: Uint8Array,
        profile: Profile
    ) {
        if (this.users.has(subject)) return;
        await this.createIdentity(subject, email, salt, hash, null);
        this.profiles.set(subject, profile);
    }
    /** Consume only matching confirmation codes. */
    async confirmIdentity(email: string, code: string) {
        const user = await this.required(email);
        if (user.confirmation_code !== code) throw new ApiError(400, 'INVALID_CODE', 'Invalid');
        user.confirmed = true;
        user.confirmation_code = null;
    }
    /** Reissue a pending verification code. */
    async setConfirmationCode(email: string, code: string) {
        const user = await this.required(email);
        if (user.confirmed) throw new ApiError(400, 'INVALID_CODE', 'Invalid');
        user.confirmation_code = code;
    }
    /** Assign recovery state. */
    async setResetCode(email: string, code: string) {
        (await this.required(email)).reset_code = code;
    }
    /** Replace password material and revoke older sessions. */
    async replacePassword(email: string, code: string, salt: Uint8Array, hash: Uint8Array) {
        const user = await this.required(email);
        if (user.reset_code !== code) throw new ApiError(400, 'INVALID_CODE', 'Invalid');
        Object.assign(user, {
            password_salt: salt,
            password_hash: hash,
            reset_code: null,
            session_version: user.session_version + 1,
        });
    }
    /** Bind a refresh session to the current password version. */
    putRefreshSession(hash: string, subject: string, expiresAt: number) {
        this.sessions.set(hash, {
            subject,
            version: this.users.get(subject)!.session_version,
            expiry: expiresAt,
        });
        return Promise.resolve();
    }
    /** Expire and revoke sessions using observable identity state. */
    refreshSubject(hash: string, now: number) {
        const session = this.sessions.get(hash);
        return Promise.resolve(
            session &&
                session.expiry > now &&
                this.users.get(session.subject)?.session_version === session.version
                ? session.subject
                : undefined
        );
    }
    /** Remove only the supplied session. */
    revokeRefreshSession(hash: string) {
        this.sessions.delete(hash);
        return Promise.resolve();
    }
    /** Fail missing-email operations using the public credential code. */
    private async required(email: string) {
        const user = await this.identityForEmail(email);
        if (!user) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Missing');
        return user;
    }
}

describe('local persistent authentication', () => {
    it('confirms, logs in, refreshes across recreation, and revokes old sessions on password reset', async () => {
        const repository = new Identities(),
            auth = new LocalAuth(repository, 's'.repeat(32), () => 1000);
        const subject = await auth.signup('a@example.com', 'a');
        await expect(auth.login('a@example.com', 'a')).rejects.toMatchObject({
            code: 'ACCOUNT_UNCONFIRMED',
        });
        await expect(auth.confirmSignup('a@example.com', 'wrong')).rejects.toMatchObject({
            code: 'INVALID_CODE',
        });
        await auth.confirmSignup('a@example.com', '000000');
        const tokens = await auth.login('a@example.com', 'a');
        expect(await auth.verifyAccessToken(tokens.idToken)).toBe(subject);
        const recreated = new LocalAuth(repository, 's'.repeat(32), () => 1010);
        expect(await recreated.refresh(tokens.refreshToken!)).toHaveProperty('expiresIn', 3600);
        expect([...repository.sessions.keys()]).not.toContain(tokens.refreshToken);
        await recreated.forgotPassword('a@example.com');
        await recreated.resetPassword('a@example.com', '000000', 'b');
        await expect(recreated.refresh(tokens.refreshToken!)).rejects.toMatchObject({
            code: 'SESSION_EXPIRED',
        });
        await expect(recreated.login('a@example.com', 'a')).rejects.toMatchObject({
            code: 'INVALID_CREDENTIALS',
        });
        const replacement = await recreated.login('a@example.com', 'b');
        await recreated.logout(replacement.refreshToken!);
        await expect(recreated.refresh(replacement.refreshToken!)).rejects.toMatchObject({
            code: 'SESSION_EXPIRED',
        });
    });
    it('retains existing token formats and rejects altered, expired, wrong-issuer, and missing-user tokens', async () => {
        const repository = new Identities(),
            key = 's'.repeat(32),
            auth = new LocalAuth(repository, key, () => 1000);
        await auth.signup('a@example.com', 'a');
        await auth.confirmSignup('a@example.com', '000000');
        const tokens = await auth.login('a@example.com', 'a');
        const header = Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url');
        // Legacy tokens sort JSON keys; verification must accept their existing serialized bytes.
        const payload = Buffer.from(
            JSON.stringify({ exp: 4600, iat: 1000, iss: 'packetloss-local', sub: tokens.subject })
        ).toString('base64url');
        const legacy = `${header}.${payload}.${createHmac('sha256', key).update(`${header}.${payload}`).digest('base64url')}`;
        expect(await auth.verifyAccessToken(legacy)).toBe(tokens.subject);
        await expect(auth.verifyAccessToken(`${legacy.slice(0, -3)}xxx`)).rejects.toMatchObject({
            code: 'AUTH_REQUIRED',
        });
        await expect(
            new LocalAuth(repository, key, () => 4600).verifyAccessToken(legacy)
        ).rejects.toMatchObject({ code: 'AUTH_REQUIRED' });
        const bad = Buffer.from(
            JSON.stringify({ exp: 4600, iss: 'other', sub: tokens.subject })
        ).toString('base64url');
        await expect(
            auth.verifyAccessToken(
                `${header}.${bad}.${createHmac('sha256', key).update(`${header}.${bad}`).digest('base64url')}`
            )
        ).rejects.toMatchObject({ code: 'AUTH_REQUIRED' });
        repository.users.clear();
        await expect(auth.verifyAccessToken(legacy)).rejects.toMatchObject({
            code: 'AUTH_REQUIRED',
        });
    });
    it('creates independent guest identities even when display names match', async () => {
        const repository = new Identities(),
            auth = new LocalAuth(repository, 's'.repeat(32), () => 1000);
        const first = await auth.guest({ nickname: 'SAME', avatar: 'packet' }),
            second = await auth.guest({ nickname: 'SAME', avatar: 'packet' });
        expect(first.subject).not.toBe(second.subject);
        expect(await auth.verifyAccessToken(first.idToken)).toBe(first.subject);
        await auth.logout(first.refreshToken!);
        await expect(auth.refresh(second.refreshToken!)).resolves.toHaveProperty('expiresIn', 3600);
    });
    it('seeds accounts without resetting changed passwords or profiles', async () => {
        const repository = new Identities(),
            auth = new LocalAuth(repository, 's'.repeat(32), () => 1000);
        await auth.seedAccounts();
        await auth.forgotPassword('owner@packetloss.local');
        await auth.resetPassword('owner@packetloss.local', '000000', 'changed');
        repository.profiles.set('dev-owner', { nickname: 'CHANGED', avatar: 'virus' });
        await auth.seedAccounts();
        expect(repository.profiles.get('dev-owner')?.nickname).toBe('CHANGED');
        await expect(auth.login('owner@packetloss.local', 'changed')).resolves.toHaveProperty(
            'subject',
            'dev-owner'
        );
    });
});

describe('Cognito authentication compatibility', () => {
    it('uses the confidential client and translates throttling', async () => {
        const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });
        const send = vi
            .spyOn(client as unknown as { send(command: unknown): Promise<unknown> }, 'send')
            .mockResolvedValue({});
        const auth = new CognitoAuth(settings, client);
        await auth.resendConfirmation('a@example.com');
        expect(send.mock.calls[0][0]).toBeInstanceOf(ResendConfirmationCodeCommand);
        const command = send.mock.calls[0][0] as ResendConfirmationCodeCommand;
        expect(command.input).toEqual({
            ClientId: 'client',
            Username: 'a@example.com',
            SecretHash: createHmac('sha256', settings.userPoolClientSecret)
                .update('a@example.comclient')
                .digest('base64'),
        });
        send.mockRejectedValueOnce(
            Object.assign(new Error('throttled'), { name: 'TooManyRequestsException' })
        );
        await expect(auth.resendConfirmation('a@example.com')).rejects.toMatchObject({
            code: 'RATE_LIMITED',
            retryAfter: 60,
        });
    });
    it('keeps signed cookie payloads compatible and prevents tampered cookies from reaching Cognito', async () => {
        const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });
        const send = vi
            .spyOn(client as unknown as { send(command: unknown): Promise<unknown> }, 'send')
            .mockResolvedValue({ AuthenticationResult: { IdToken: 'fresh', ExpiresIn: 3600 } });
        const auth = new CognitoAuth(settings, client),
            encoded = Buffer.from('{"refreshToken":"token","subject":"subject"}').toString(
                'base64url'
            );
        const legacy = `${encoded}.${createHmac('sha256', settings.userPoolClientSecret).update(encoded).digest('base64url')}`;
        expect(
            auth.packRefreshCookie({
                idToken: 'id',
                expiresIn: 3600,
                refreshToken: 'token',
                subject: 'subject',
            })
        ).toBe(legacy);
        expect(await auth.refresh(legacy)).toMatchObject({ idToken: 'fresh', expiresIn: 3600 });
        send.mockClear();
        await expect(auth.refresh(`${legacy}x`)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });
        expect(send).not.toHaveBeenCalled();
    });
});
