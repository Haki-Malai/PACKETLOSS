"""Development-only authentication with no Cognito or network dependency."""

from __future__ import annotations

import hashlib
import hmac
import json
import secrets
import time
from base64 import urlsafe_b64decode, urlsafe_b64encode
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from .auth import AuthTokens
from .errors import ApiError
from .local_repository import LocalRepository
from .models import Profile

DEVELOPMENT_CODE = "000000"
DEVELOPMENT_PASSWORD = "packetloss-dev"


@dataclass(frozen=True)
class SeededAccount:
    """One documented identity created in a fresh development database."""

    subject: str
    email: str
    nickname: str
    avatar: str


SEEDED_ACCOUNTS = (
    SeededAccount("dev-owner", "owner@packetloss.local", "OWNER", "packet"),
    SeededAccount("dev-friend-1", "friend1@packetloss.local", "FRIEND1", "firewall"),
    SeededAccount("dev-friend-2", "friend2@packetloss.local", "FRIEND2", "virus"),
    SeededAccount("dev-friend-3", "friend3@packetloss.local", "FRIEND3", "ping"),
)


def _encode(value: bytes) -> str:
    """Encode one JWT segment without padding."""
    return urlsafe_b64encode(value).rstrip(b"=").decode()


def _decode(value: str) -> bytes:
    """Decode one unpadded JWT segment."""
    return urlsafe_b64decode(value + "=" * (-len(value) % 4))


class LocalAuth:
    """Implement AuthGateway with signed local tokens and DynamoDB refresh sessions."""

    def __init__(
        self,
        repository: LocalRepository,
        signing_key: str | bytes,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self.repository = repository
        self.signing_key = (
            signing_key.encode() if isinstance(signing_key, str) else bytes(signing_key)
        )
        if len(self.signing_key) < 32:
            raise ValueError("PACKETLOSS_DEV_AUTH_KEY must contain at least 32 bytes")
        self.clock = clock

    def seed_accounts(self) -> None:
        """Create the four confirmed development identities without resetting their data."""
        for account in SEEDED_ACCOUNTS:
            salt = hashlib.sha256(f"packetloss:{account.subject}".encode()).digest()[:16]
            self.repository.seed_identity(
                account.subject,
                account.email,
                salt,
                self._password_hash(DEVELOPMENT_PASSWORD, salt),
                Profile(nickname=account.nickname, avatar=account.avatar),
            )

    def signup(self, email: str, password: str) -> str:
        """Create an unconfirmed deterministic identity for a normalized email."""
        subject = f"dev-user-{hashlib.sha256(email.encode()).hexdigest()[:24]}"
        salt = secrets.token_bytes(16)
        self.repository.create_identity(
            subject,
            email,
            salt,
            self._password_hash(password, salt),
            DEVELOPMENT_CODE,
        )
        return subject

    def confirm_signup(self, email: str, code: str) -> None:
        """Confirm a local signup with the documented development code."""
        self.repository.confirm_identity(email, code)

    def resend_confirmation(self, email: str) -> None:
        """Reset an unconfirmed identity to the documented development code."""
        self.repository.set_confirmation_code(email, DEVELOPMENT_CODE)

    def login(self, email: str, password: str) -> AuthTokens:
        """Authenticate a confirmed identity and issue access and refresh credentials."""
        identity = self.repository.identity_for_email(email)
        if not identity or not hmac.compare_digest(
            identity["password_hash"],
            self._password_hash(password, identity["password_salt"]),
        ):
            raise ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.")
        if not identity["confirmed"]:
            raise ApiError(409, "ACCOUNT_UNCONFIRMED", "Confirm your email first.")
        subject = str(identity["subject"])
        refresh = secrets.token_urlsafe(32)
        self.repository.put_refresh_session(
            self._token_hash(refresh), subject, int(self.clock()) + 30 * 24 * 60 * 60
        )
        return AuthTokens(self._access_token(subject), 3600, refresh, subject)

    def guest(self, profile: Profile) -> AuthTokens:
        """Create a unique confirmed guest with an unguessable internal login credential."""
        subject = f"dev-guest-{secrets.token_hex(16)}"
        email = f"{subject}@packetloss.local"
        password = secrets.token_urlsafe(32)
        salt = secrets.token_bytes(16)
        self.repository.seed_identity(
            subject, email, salt, self._password_hash(password, salt), profile
        )
        return self.login(email, password)

    def refresh(self, cookie: str) -> AuthTokens:
        """Exchange an unrevoked opaque local refresh token for a new access token."""
        subject = self.repository.refresh_subject(self._token_hash(cookie), int(self.clock()))
        if not subject or not self.repository.identity_for_subject(subject):
            raise ApiError(401, "SESSION_EXPIRED", "Your session has expired.")
        return AuthTokens(self._access_token(subject), 3600)

    def logout(self, cookie: str) -> None:
        """Revoke one local refresh session."""
        self.repository.revoke_refresh_session(self._token_hash(cookie))

    def forgot_password(self, email: str) -> None:
        """Assign the documented reset code when the local account exists."""
        self.repository.set_reset_code(email, DEVELOPMENT_CODE)

    def reset_password(self, email: str, code: str, password: str) -> None:
        """Replace a local password and revoke existing refresh sessions."""
        salt = secrets.token_bytes(16)
        self.repository.replace_password(
            email, code, salt, self._password_hash(password, salt)
        )

    def pack_refresh_cookie(self, tokens: AuthTokens) -> str:
        """Return the opaque local refresh token stored only as a digest in DynamoDB."""
        if not tokens.refresh_token:
            raise ApiError(503, "AUTH_UNAVAILABLE", "Accounts are temporarily unavailable.")
        return tokens.refresh_token

    def verify_access_token(self, token: str) -> str:
        """Verify signature, issuer, expiry, and subject of a local access token."""
        try:
            header, payload, supplied = token.split(".")
            expected = hmac.new(
                self.signing_key, f"{header}.{payload}".encode(), hashlib.sha256
            ).digest()
            if not hmac.compare_digest(expected, _decode(supplied)):
                raise ValueError("invalid signature")
            header_data = json.loads(_decode(header))
            claims: dict[str, Any] = json.loads(_decode(payload))
            subject = claims.get("sub")
            if (
                header_data != {"alg": "HS256", "typ": "JWT"}
                or claims.get("iss") != "packetloss-local"
                or not isinstance(claims.get("exp"), int)
                or claims["exp"] <= int(self.clock())
                or not isinstance(subject, str)
                or not subject
                or not self.repository.identity_for_subject(subject)
            ):
                raise ValueError("invalid claims")
            return subject
        except (ValueError, TypeError, KeyError, json.JSONDecodeError) as error:
            raise ApiError(401, "AUTH_REQUIRED", "Log in to continue.") from error

    def _access_token(self, subject: str) -> str:
        """Issue a one-hour HMAC token whose payload is compatible with Cognito clients."""
        now = int(self.clock())
        header = _encode(_json_bytes({"alg": "HS256", "typ": "JWT"}))
        payload = _encode(
            _json_bytes(
                {"sub": subject, "iat": now, "exp": now + 3600, "iss": "packetloss-local"}
            )
        )
        signature = hmac.new(
            self.signing_key, f"{header}.{payload}".encode(), hashlib.sha256
        ).digest()
        return f"{header}.{payload}.{_encode(signature)}"

    @staticmethod
    def _password_hash(password: str, salt: bytes) -> bytes:
        """Derive a bounded local password hash without storing plaintext credentials."""
        return hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1, dklen=32)

    @staticmethod
    def _token_hash(token: str) -> str:
        """Hash an opaque refresh token before lookup or storage."""
        return hashlib.sha256(token.encode()).hexdigest()


def _json_bytes(value: dict[str, object]) -> bytes:
    """Serialize one token segment with a stable compact spelling."""
    return json.dumps(value, separators=(",", ":"), sort_keys=True).encode()
