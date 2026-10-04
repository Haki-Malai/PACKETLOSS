import { useState, type FormEvent } from 'react';
import { AVATAR_CHOICES, type AvatarChoice } from '../infrastructure/adapters/AccountClient';
import { CustomSelect, MenuButton, fieldLayout, inputLayout } from './MenuPanel';
import type { GameSession } from './useGameSession';

const avatarOptions = AVATAR_CHOICES.map((avatar) => ({
    value: avatar,
    label: avatar === 'packet' ? 'The Packet' : avatar[0].toUpperCase() + avatar.slice(1),
}));

export function GuestForm({ session }: { session: GameSession }) {
    const [nickname, setNickname] = useState(() => session.store.getNickname());
    const { busy, checking } = session.account.state;

    /** Starts an independent local identity using only the chosen display name. */
    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        if (nickname.trim()) void session.playAsGuest(nickname);
    }

    return (
        <form className="grid gap-4" onSubmit={submit}>
            <label className={fieldLayout}>
                Player name
                <input
                    className={inputLayout}
                    autoComplete="nickname"
                    maxLength={16}
                    required
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                />
            </label>
            <AccountMessage session={session} />
            <MenuButton
                action="play-as-guest"
                type="submit"
                variant="primary"
                disabled={busy || checking || !nickname.trim()}
            >
                {busy ? 'Joining…' : 'Play as guest'}
            </MenuButton>
        </form>
    );
}

export function SignupForm({ session }: { session: GameSession }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState(() => session.store.getNickname());
    const [avatar, setAvatar] = useState<AvatarChoice>('packet');
    const { busy } = session.account.state;

    /** Submits validated account fields through the session-owned account client. */
    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        void session.signup({ email, password, nickname, avatar });
    }

    return (
        <form className="grid gap-4" onSubmit={submit}>
            <label className={fieldLayout}>
                Email
                <input
                    className={inputLayout}
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </label>
            <label className={fieldLayout}>
                Password
                <input
                    className={inputLayout}
                    type="password"
                    autoComplete="new-password"
                    minLength={session.account.localDevelopment ? 1 : 12}
                    maxLength={128}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <small>
                    {session.account.localDevelopment
                        ? 'Any non-empty password works in local development.'
                        : 'Use at least 12 characters with uppercase, lowercase, and a number.'}
                </small>
            </label>
            <label className={fieldLayout}>
                Player name
                <input
                    className={inputLayout}
                    type="text"
                    autoComplete="nickname"
                    maxLength={16}
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                />
            </label>
            <div className={fieldLayout}>
                <span>Avatar</span>
                <CustomSelect
                    ariaLabel="Avatar"
                    value={avatar}
                    options={avatarOptions}
                    onChange={setAvatar}
                    control="avatar"
                />
            </div>
            <AccountMessage session={session} />
            <MenuButton action="submit-signup" variant="primary" type="submit" disabled={busy}>
                {busy ? 'Creating account…' : 'Create account'}
            </MenuButton>
        </form>
    );
}

export function ConfirmAccountForm({ session }: { session: GameSession }) {
    const [email, setEmail] = useState(session.account.state.pendingEmail);
    const [code, setCode] = useState('');
    const { busy } = session.account.state;

    /** Submits the emailed signup code. */
    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        void session.confirmAccount(email, code);
    }

    return (
        <form className="grid gap-4" onSubmit={submit}>
            <p className="packet-copy">Enter the verification code sent to your email.</p>
            <label className={fieldLayout}>
                Email
                <input
                    className={inputLayout}
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </label>
            <label className={fieldLayout}>
                Verification code
                <input
                    className={inputLayout}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    minLength={4}
                    maxLength={16}
                    required
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                />
            </label>
            <AccountMessage session={session} />
            <MenuButton action="confirm-account" variant="primary" type="submit" disabled={busy}>
                {busy ? 'Confirming…' : 'Confirm email'}
            </MenuButton>
            <MenuButton
                action="resend-confirmation"
                disabled={busy || !email.trim()}
                onClick={() => void session.account.resendConfirmation(email)}
            >
                Resend code
            </MenuButton>
        </form>
    );
}

export function LoginForm({ session }: { session: GameSession }) {
    const [email, setEmail] = useState(session.account.state.pendingEmail);
    const [password, setPassword] = useState('');
    const { busy } = session.account.state;

    /** Submits account credentials without persisting them in the browser. */
    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        void session.login(email, password);
    }

    return (
        <>
            {session.account.localDevelopment && <GuestForm session={session} />}
            <form className="grid gap-4" onSubmit={submit}>
                <label className={fieldLayout}>
                    Email
                    <input
                        className={inputLayout}
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </label>
                <label className={fieldLayout}>
                    Password
                    <input
                        className={inputLayout}
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </label>
                <AccountMessage session={session} />
                <MenuButton action="submit-login" variant="primary" type="submit" disabled={busy}>
                    {busy ? 'Logging in…' : 'Login'}
                </MenuButton>
                <MenuButton
                    action="enter-signup-code"
                    disabled={busy}
                    onClick={() =>
                        session.openAccount('confirm-account', session.state.accountReturnScreen)
                    }
                >
                    Enter signup code
                </MenuButton>
                <MenuButton
                    action="forgot-password"
                    disabled={busy}
                    onClick={() =>
                        session.openAccount('recover', session.state.accountReturnScreen)
                    }
                >
                    Forgot password
                </MenuButton>
            </form>
        </>
    );
}

export function RecoveryForm({ session }: { session: GameSession }) {
    const [email, setEmail] = useState(session.account.state.pendingEmail);
    const [codeSent, setCodeSent] = useState(false);
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const { busy } = session.account.state;

    /** Sends a recovery code, then submits that code with the replacement password. */
    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        if (!codeSent) {
            void session.account.forgotPassword(email).then((sent) => {
                if (sent) setCodeSent(true);
            });
            return;
        }
        void session.resetPassword(email, code, password);
    }

    return (
        <form className="grid gap-4" onSubmit={submit}>
            <label className={fieldLayout}>
                Email
                <input
                    className={inputLayout}
                    type="email"
                    autoComplete="email"
                    required
                    disabled={codeSent}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </label>
            {codeSent && (
                <>
                    <label className={fieldLayout}>
                        Recovery code
                        <input
                            className={inputLayout}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            minLength={4}
                            maxLength={16}
                            required
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                        />
                    </label>
                    <label className={fieldLayout}>
                        New password
                        <input
                            className={inputLayout}
                            type="password"
                            autoComplete="new-password"
                            minLength={session.account.localDevelopment ? 1 : 12}
                            maxLength={128}
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </label>
                </>
            )}
            <AccountMessage session={session} />
            <MenuButton action="submit-recovery" variant="primary" type="submit" disabled={busy}>
                {busy ? 'Please wait…' : codeSent ? 'Set new password' : 'Send recovery code'}
            </MenuButton>
        </form>
    );
}

function AccountMessage({ session }: { session: GameSession }) {
    const { message, errorCode } = session.account.state;
    if (!message) return null;
    return (
        <p className="packet-note" role={errorCode ? 'alert' : 'status'}>
            {message}
        </p>
    );
}
