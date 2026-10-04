"""Cognito authentication adapter and refresh-cookie codec."""

import hashlib
import hmac
import json
from base64 import b64encode, urlsafe_b64decode, urlsafe_b64encode
from dataclasses import dataclass
from typing import Any, Protocol

import boto3
from botocore.exceptions import ClientError

from .config import Settings
from .errors import ApiError


@dataclass(frozen=True)
class AuthTokens:
    """Tokens returned from a successful Cognito authentication operation."""

    id_token: str
    expires_in: int
    refresh_token: str | None = None
    subject: str | None = None


class AuthGateway(Protocol):
    """Authentication operations consumed by the HTTP layer."""

    def signup(self, email: str, password: str) -> str: ...

    def confirm_signup(self, email: str, code: str) -> None: ...

    def resend_confirmation(self, email: str) -> None: ...

    def login(self, email: str, password: str) -> AuthTokens: ...

    def refresh(self, cookie: str) -> AuthTokens: ...

    def logout(self, cookie: str) -> None: ...

    def forgot_password(self, email: str) -> None: ...

    def reset_password(self, email: str, code: str, password: str) -> None: ...

    def pack_refresh_cookie(self, tokens: AuthTokens) -> str: ...


class CognitoAuth:
    """Thin server-side adapter around a confidential Cognito app client."""

    def __init__(self, settings: Settings, client: Any | None = None) -> None:
        self.settings = settings
        self.client = client or boto3.client("cognito-idp")
        self.signing_key = settings.user_pool_client_secret.encode()

    def signup(self, email: str, password: str) -> str:
        """Create an unconfirmed Cognito user and return its stable subject."""
        response = self._call(
            self.client.sign_up,
            ClientId=self.settings.user_pool_client_id,
            SecretHash=self._secret_hash(email),
            Username=email,
            Password=password,
            UserAttributes=[{"Name": "email", "Value": email}],
        )
        subject = response.get("UserSub")
        if not isinstance(subject, str):
            raise ApiError(503, "AUTH_UNAVAILABLE", "Accounts are temporarily unavailable.", 30)
        return subject

    def confirm_signup(self, email: str, code: str) -> None:
        """Confirm a pending account with its emailed code."""
        self._call(
            self.client.confirm_sign_up,
            ClientId=self.settings.user_pool_client_id,
            SecretHash=self._secret_hash(email),
            Username=email,
            ConfirmationCode=code,
        )

    def resend_confirmation(self, email: str) -> None:
        """Send a fresh verification code for a pending account."""
        self._call(
            self.client.resend_confirmation_code,
            ClientId=self.settings.user_pool_client_id,
            SecretHash=self._secret_hash(email),
            Username=email,
        )

    def login(self, email: str, password: str) -> AuthTokens:
        """Authenticate with email and password."""
        response = self._call(
            self.client.initiate_auth,
            ClientId=self.settings.user_pool_client_id,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": email,
                "PASSWORD": password,
                "SECRET_HASH": self._secret_hash(email),
            },
        )
        result = response.get("AuthenticationResult", {})
        return self._tokens(result, require_refresh=True)

    def refresh(self, cookie: str) -> AuthTokens:
        """Exchange the signed HTTP-only refresh cookie for a new ID token."""
        payload = self._unpack_refresh_cookie(cookie)
        response = self._call(
            self.client.initiate_auth,
            ClientId=self.settings.user_pool_client_id,
            AuthFlow="REFRESH_TOKEN_AUTH",
            AuthParameters={
                "REFRESH_TOKEN": payload["refreshToken"],
                "SECRET_HASH": self._secret_hash(payload["subject"]),
            },
        )
        return self._tokens(response.get("AuthenticationResult", {}), require_refresh=False)

    def logout(self, cookie: str) -> None:
        """Revoke the refresh token represented by the signed cookie."""
        payload = self._unpack_refresh_cookie(cookie)
        self._call(
            self.client.revoke_token,
            ClientId=self.settings.user_pool_client_id,
            ClientSecret=self.settings.user_pool_client_secret,
            Token=payload["refreshToken"],
        )

    def forgot_password(self, email: str) -> None:
        """Ask Cognito to send a password recovery code."""
        self._call(
            self.client.forgot_password,
            ClientId=self.settings.user_pool_client_id,
            SecretHash=self._secret_hash(email),
            Username=email,
        )

    def reset_password(self, email: str, code: str, password: str) -> None:
        """Confirm a password reset using the emailed recovery code."""
        self._call(
            self.client.confirm_forgot_password,
            ClientId=self.settings.user_pool_client_id,
            SecretHash=self._secret_hash(email),
            Username=email,
            ConfirmationCode=code,
            Password=password,
        )

    def pack_refresh_cookie(self, tokens: AuthTokens) -> str:
        """Sign the refresh token and subject before placing them in an HTTP-only cookie."""
        if not tokens.refresh_token or not tokens.subject:
            raise ApiError(503, "AUTH_UNAVAILABLE", "Accounts are temporarily unavailable.", 30)
        payload = json.dumps(
            {"refreshToken": tokens.refresh_token, "subject": tokens.subject},
            separators=(",", ":"),
        ).encode()
        encoded = urlsafe_b64encode(payload).rstrip(b"=")
        signature = hmac.new(self.signing_key, encoded, hashlib.sha256).digest()
        return f"{encoded.decode()}.{urlsafe_b64encode(signature).rstrip(b'=').decode()}"

    def _unpack_refresh_cookie(self, cookie: str) -> dict[str, str]:
        """Verify and decode a refresh cookie."""
        try:
            encoded, supplied = cookie.split(".", 1)
            expected = hmac.new(self.signing_key, encoded.encode(), hashlib.sha256).digest()
            signature = urlsafe_b64decode(supplied + "=" * (-len(supplied) % 4))
            if not hmac.compare_digest(expected, signature):
                raise ValueError("invalid signature")
            raw = urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4))
            payload = json.loads(raw)
            if not isinstance(payload.get("refreshToken"), str) or not isinstance(
                payload.get("subject"), str
            ):
                raise ValueError("invalid payload")
            return payload
        except (ValueError, TypeError, json.JSONDecodeError) as error:
            raise ApiError(401, "SESSION_EXPIRED", "Your session has expired.") from error

    def _secret_hash(self, username: str) -> str:
        """Calculate Cognito's app-client secret hash for a username."""
        digest = hmac.new(
            self.signing_key,
            f"{username}{self.settings.user_pool_client_id}".encode(),
            hashlib.sha256,
        ).digest()
        return b64encode(digest).decode()

    def _tokens(self, result: dict[str, Any], require_refresh: bool) -> AuthTokens:
        """Validate Cognito's authentication result and extract its subject."""
        id_token = result.get("IdToken")
        refresh_token = result.get("RefreshToken")
        expires_in = result.get("ExpiresIn")
        if (
            not isinstance(id_token, str)
            or not isinstance(expires_in, int)
            or (require_refresh and not isinstance(refresh_token, str))
        ):
            raise ApiError(503, "AUTH_UNAVAILABLE", "Accounts are temporarily unavailable.", 30)
        subject = self._token_subject(id_token) if require_refresh else None
        return AuthTokens(id_token, expires_in, refresh_token, subject)

    @staticmethod
    def _token_subject(token: str) -> str:
        """Read the subject from a Cognito-issued ID token used only to bind its refresh cookie."""
        try:
            encoded = token.split(".")[1]
            payload = json.loads(urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4)))
            subject = payload.get("sub")
            if not isinstance(subject, str):
                raise ValueError("missing subject")
            return subject
        except (IndexError, ValueError, TypeError, json.JSONDecodeError) as error:
            raise ApiError(
                503, "AUTH_UNAVAILABLE", "Accounts are temporarily unavailable.", 30
            ) from error

    @staticmethod
    def _call(operation: Any, **kwargs: Any) -> dict[str, Any]:
        """Call Cognito and translate service failures into stable public errors."""
        try:
            return operation(**kwargs)
        except ClientError as error:
            code = error.response.get("Error", {}).get("Code")
            mapping = {
                "UsernameExistsException": (409, "ACCOUNT_EXISTS", "An account already exists."),
                "CodeMismatchException": (400, "INVALID_CODE", "The confirmation code is invalid."),
                "ExpiredCodeException": (400, "INVALID_CODE", "The confirmation code has expired."),
                "NotAuthorizedException": (
                    401,
                    "INVALID_CREDENTIALS",
                    "Email or password is incorrect.",
                ),
                "UserNotFoundException": (
                    401,
                    "INVALID_CREDENTIALS",
                    "Email or password is incorrect.",
                ),
                "UserNotConfirmedException": (
                    409,
                    "ACCOUNT_UNCONFIRMED",
                    "Confirm your email first.",
                ),
                "InvalidPasswordException": (
                    400,
                    "INVALID_PASSWORD",
                    "The password does not meet the requirements.",
                ),
                "LimitExceededException": (
                    429,
                    "RATE_LIMITED",
                    "Too many attempts. Try again later.",
                ),
                "TooManyRequestsException": (
                    429,
                    "RATE_LIMITED",
                    "Too many attempts. Try again later.",
                ),
            }
            status, public_code, message = mapping.get(
                code,
                (503, "AUTH_UNAVAILABLE", "Accounts are temporarily unavailable."),
            )
            raise ApiError(status, public_code, message, 60 if status == 429 else 30) from error
