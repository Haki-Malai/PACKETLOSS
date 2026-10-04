"""Validated account and record request models."""

from datetime import datetime
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

MAX_SAFE_INTEGER = 9_007_199_254_740_991


def to_camel(value: str) -> str:
    """Convert a snake-case model field to the API's camel-case JSON spelling."""
    head, *tail = value.split("_")
    return head + "".join(part.capitalize() for part in tail)


class ApiModel(BaseModel):
    """Base model for strict camel-case JSON payloads."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="forbid")


class Avatar(StrEnum):
    """Selectable character portraits supported by the game."""

    PACKET = "packet"
    FIREWALL = "firewall"
    VIRUS = "virus"
    PING = "ping"
    SPAM = "spam"
    LAG = "lag"
    QUARANTINE = "quarantine"
    TROJAN = "trojan"


class Profile(ApiModel):
    """Persistent public player profile."""

    nickname: str = Field(min_length=1, max_length=16)
    avatar: Avatar = Avatar.PACKET

    @field_validator("nickname", mode="before")
    @classmethod
    def normalize_nickname(cls, value: object) -> str:
        """Trim names and preserve the game's default for blank input."""
        if not isinstance(value, str):
            return "PLAYER"
        return value.strip()[:16] or "PLAYER"


class SignupRequest(Profile):
    """Email/password signup request with the initial player profile."""

    email: str = Field(min_length=3, max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    password: str = Field(min_length=12, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        """Normalize email sign-in identifiers before sending them to Cognito."""
        return value.strip().lower() if isinstance(value, str) else value


class EmailRequest(ApiModel):
    """Request containing a normalized account email."""

    email: str = Field(min_length=3, max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        """Normalize email sign-in identifiers before sending them to Cognito."""
        return value.strip().lower() if isinstance(value, str) else value


class ConfirmSignupRequest(EmailRequest):
    """Email verification request."""

    code: str = Field(min_length=4, max_length=16)


class LoginRequest(EmailRequest):
    """Password login request."""

    password: str = Field(min_length=1, max_length=128)


class ResetPasswordRequest(ConfirmSignupRequest):
    """Password reset confirmation request."""

    password: str = Field(min_length=12, max_length=128)


class AccessTokenResponse(ApiModel):
    """Short-lived token kept only in browser memory."""

    access_token: str
    expires_in: int = Field(gt=0)


class RunRecord(ApiModel):
    """One completed PACKETLOSS run."""

    id: str = Field(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9._:-]+$")
    completed_at: datetime
    map: Literal["default", "demo"]
    nickname: str = Field(min_length=1, max_length=16)
    outcome: Literal["lost", "cleared"]
    score: int = Field(ge=0, le=MAX_SAFE_INTEGER)
    lives: int = Field(ge=0, le=MAX_SAFE_INTEGER)
    elapsed_ms: int = Field(ge=0, le=MAX_SAFE_INTEGER)
    points_collected: int = Field(ge=0, le=MAX_SAFE_INTEGER)
    total_points: int = Field(ge=0, le=MAX_SAFE_INTEGER)
    levels_cleared: int = Field(ge=0, le=MAX_SAFE_INTEGER)
    mode: Literal["classic", "endless"] = "classic"

    @model_validator(mode="after")
    def validate_points(self) -> "RunRecord":
        """Reject records whose collected count exceeds the run's total."""
        if self.points_collected > self.total_points:
            raise ValueError("pointsCollected cannot exceed totalPoints")
        if self.mode == "endless" and self.map != "default":
            raise ValueError("Endless records use the default map")
        return self


class RecordsRequest(ApiModel):
    """Bounded idempotent record upload."""

    records: list[RunRecord] = Field(min_length=1, max_length=10)


class RecordsResponse(ApiModel):
    """Canonical retained cloud records."""

    records: list[RunRecord]


class SignupResponse(ApiModel):
    """Signup acknowledgement that never exposes the Cognito subject."""

    confirmation_required: bool = True
