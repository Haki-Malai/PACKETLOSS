"""Loopback-only development composition for accounts and multiplayer control."""

from __future__ import annotations

import hmac
import ipaddress
import os
import time
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Any, Literal
from urllib.parse import urlparse

from fastapi import Depends, FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import Field

from .app import create_app
from .config import Settings
from .errors import ApiError
from .local_auth import LocalAuth
from .local_repository import LocalRepository, multiplayer_settings
from .models import AccessTokenResponse, ApiModel, Profile, ResetPasswordRequest, SignupRequest
from .multiplayer_app import create_multiplayer_app
from .multiplayer_control import MultiplayerControl
from .multiplayer_models import MultiplayerSettings, Region, Standing


@dataclass(frozen=True)
class DevelopmentSettings:
    """Explicit local process configuration shared with the development launcher."""

    dynamodb_endpoint: str
    auth_key: str
    internal_token: str
    run_id: str
    process_generation: str
    site_origin: str
    websocket_url: str

    def browser_origins(self) -> list[str]:
        """Accept only the configured frontend port through the two local browser aliases."""
        port = urlparse(self.site_origin).port
        suffix = f":{port}" if port else ""
        return list(dict.fromkeys([
            self.site_origin, f"http://127.0.0.1{suffix}", f"http://localhost{suffix}",
        ]))

    @classmethod
    def from_env(cls) -> DevelopmentSettings:
        """Load and validate the launcher's loopback-only environment contract."""
        settings = cls(
            dynamodb_endpoint=os.environ["PACKETLOSS_DEV_DYNAMODB_ENDPOINT"],
            auth_key=os.environ["PACKETLOSS_DEV_AUTH_KEY"],
            internal_token=os.environ["PACKETLOSS_DEV_INTERNAL_TOKEN"],
            run_id=os.environ["PACKETLOSS_DEV_RUN_ID"],
            process_generation=os.environ["PACKETLOSS_DEV_PROCESS_GENERATION"],
            site_origin=os.environ["PACKETLOSS_DEV_SITE_ORIGIN"],
            websocket_url=os.environ["PACKETLOSS_DEV_WEBSOCKET_URL"],
        )
        settings.validate()
        return settings

    def validate(self) -> None:
        """Reject remote listeners, weak secrets, and malformed generation identifiers."""
        if len(self.auth_key.encode()) < 32:
            raise ValueError("PACKETLOSS_DEV_AUTH_KEY must contain at least 32 bytes")
        if len(self.internal_token.encode()) < 32:
            raise ValueError("PACKETLOSS_DEV_INTERNAL_TOKEN must contain at least 32 bytes")
        if not 1 <= len(self.run_id) <= 128 or not 1 <= len(self.process_generation) <= 128:
            raise ValueError("Development run and process identifiers must be 1-128 characters")
        _require_loopback_url(self.site_origin, "http")
        _require_loopback_url(self.websocket_url, "ws")


def _require_loopback_url(value: str, scheme: str) -> None:
    """Require an uncredentialed loopback URL with the expected cleartext dev scheme."""
    parsed = urlparse(value)
    if (
        parsed.scheme != scheme
        or not parsed.hostname
        or parsed.username
        or parsed.password
        or not _is_loopback(parsed.hostname)
    ):
        raise ValueError(f"Development {scheme.upper()} URL must use a loopback host")


def _is_loopback(host: str) -> bool:
    """Recognize localhost and literal IPv4/IPv6 loopback addresses."""
    if host == "localhost":
        return True
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False


class DevelopmentSignupRequest(SignupRequest):
    """Allow simple non-empty passwords only in the local composition."""

    password: str = Field(min_length=1, max_length=128)


class DevelopmentResetRequest(ResetPasswordRequest):
    """Apply the same local password policy during recovery."""

    password: str = Field(min_length=1, max_length=128)


class GuestRequest(ApiModel):
    """A display name creates a new identity; it never selects an existing account."""

    nickname: str = Field(min_length=1, max_length=16, pattern=r"\S")


class LogicalInstances:
    """Expose local instance state to the production control service."""

    def __init__(self, repository: LocalRepository) -> None:
        self.repository = repository

    def states(self) -> dict[Region, str]:
        """Return both development regions without contacting EC2."""
        return self.repository.instance_states()

    def start(self, region: Region) -> None:
        """Mark the selected region pending until the Node process heartbeats."""
        self.repository.start_instance(region)


class InternalRoomStatus(ApiModel):
    """Validated authoritative diagnostics sent by the local Node process."""

    ready: bool
    draining: bool
    active_matches: int = Field(ge=0)
    connected_players: int = Field(ge=0)
    rooms: int = Field(ge=0)
    idle_ms: float = Field(ge=0)
    pending_results: int = Field(ge=0)
    current_tick_debt_ms: float = Field(ge=0)
    maximum_tick_debt_ms: float = Field(ge=0)


class ProcessRegistrationRequest(ApiModel):
    """A fresh Node process generation within the existing local stack run."""

    instance_run_id: str = Field(min_length=1, max_length=128)
    process_generation: str = Field(min_length=1, max_length=128)


class HeartbeatRequest(ApiModel):
    """Generation-fenced local readiness update."""

    instance_run_id: str = Field(min_length=1, max_length=128)
    process_generation: str = Field(min_length=1, max_length=128)
    status: InternalRoomStatus


class ConsumeTicketRequest(ApiModel):
    """One opaque ticket consumption attempt from the local Node process."""

    ticket: str = Field(min_length=16, max_length=512)
    instance_run_id: str = Field(min_length=1, max_length=128)
    process_generation: str = Field(min_length=1, max_length=128)


class MatchStartRequest(ApiModel):
    """Immutable authenticated roster persisted before countdown."""

    match_id: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_-]+$")
    room_id: str = Field(min_length=1, max_length=128)
    instance_run_id: str = Field(min_length=1, max_length=128)
    process_generation: str = Field(min_length=1, max_length=128)
    participants: list[str] = Field(min_length=2, max_length=4)
    started_at: str = Field(min_length=1, max_length=64)


class InternalMatchResult(ApiModel):
    """Terminal result whose region is bound from its immutable local start record."""

    match_id: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_-]+$")
    room_id: str = Field(min_length=1, max_length=128)
    started_at: str = Field(min_length=1, max_length=64)
    completed_at: str | None
    outcome: Literal["completed", "aborted"]
    reason: str | None
    standings: list[Standing] = Field(max_length=4)


class MatchFinishRequest(ApiModel):
    """Generation-fenced terminal match write from the local Node process."""

    instance_run_id: str = Field(min_length=1, max_length=128)
    process_generation: str = Field(min_length=1, max_length=128)
    result: InternalMatchResult


class DevelopmentApplication:
    """Dispatch existing public apps while injecting only verified local identities."""

    def __init__(
        self,
        account_app: FastAPI,
        multiplayer_app: FastAPI,
        internal_app: FastAPI,
        auth: LocalAuth,
        repository: LocalRepository,
    ) -> None:
        self.account_app = account_app
        self.multiplayer_app = multiplayer_app
        self.internal_app = internal_app
        self.auth = auth
        self.repository = repository

    async def __call__(
        self,
        scope: dict[str, Any],
        receive: Callable[[], Awaitable[dict[str, Any]]],
        send: Callable[[dict[str, Any]], Awaitable[None]],
    ) -> None:
        """Route by stable prefix and emulate API Gateway claims after token verification."""
        if scope["type"] == "lifespan":
            await self.account_app(scope, receive, send)
            return
        routed_scope = dict(scope)
        authorization = _header(scope, b"authorization")
        if authorization.startswith("Bearer "):
            try:
                subject = self.auth.verify_access_token(authorization.removeprefix("Bearer "))
                routed_scope["aws.event"] = {
                    "requestContext": {"authorizer": {"jwt": {"claims": {"sub": subject}}}}
                }
            except ApiError:
                pass
        path = str(scope.get("path", ""))
        target = (
            self.internal_app
            if path.startswith("/internal/dev/")
            else self.multiplayer_app
            if path.startswith("/v1/multiplayer/")
            else self.account_app
        )
        await target(routed_scope, receive, send)


def _header(scope: dict[str, Any], name: bytes) -> str:
    """Read one ASCII request header from an ASGI scope."""
    for key, value in scope.get("headers", []):
        if key.lower() == name:
            return value.decode("latin-1")
    return ""


def create_development_app(
    settings: DevelopmentSettings,
    clock: Callable[[], float] = time.time,
) -> DevelopmentApplication:
    """Compose persistent local replacements behind unchanged browser HTTP contracts."""
    settings.validate()
    repository = LocalRepository(settings.dynamodb_endpoint, clock)
    auth = LocalAuth(repository, settings.auth_key, clock)
    account_settings = Settings(
        stage="development",
        table_name="local",
        user_pool_id="local",
        user_pool_client_id="local",
        user_pool_client_secret=settings.auth_key,
        site_origin=settings.site_origin,
        refresh_cookie_name="packetloss_dev_refresh",
        signup_daily_limit=1000,
        signup_account_limit=10_000,
    )
    account_app = create_app(
        account_settings,
        auth,
        repository,
        signup_model=DevelopmentSignupRequest,
        reset_model=DevelopmentResetRequest,
        cors_origins=settings.browser_origins(),
    )

    @account_app.post("/v1/auth/guest", response_model=AccessTokenResponse)
    def guest(payload: GuestRequest, response: Response) -> AccessTokenResponse:
        """Create a fresh local guest and retain its session using the normal auth cookie."""
        tokens = auth.guest(Profile(nickname=payload.nickname))
        response.set_cookie(
            account_settings.refresh_cookie_name,
            auth.pack_refresh_cookie(tokens),
            max_age=30 * 24 * 60 * 60,
            path="/v1/auth",
            secure=False,
            httponly=True,
            samesite="strict",
        )
        return AccessTokenResponse(access_token=tokens.id_token, expires_in=tokens.expires_in)

    control_settings = multiplayer_settings(settings.site_origin, settings.websocket_url)
    control = MultiplayerControl(
        control_settings,
        repository,
        LogicalInstances(repository),
        clock,
        lambda: settings.run_id,
    )
    multiplayer_app = create_multiplayer_app(
        control_settings, control, cors_origins=settings.browser_origins(),
    )
    internal_app = _create_internal_app(settings, repository, control_settings, clock)
    return DevelopmentApplication(account_app, multiplayer_app, internal_app, auth, repository)


def _create_internal_app(
    settings: DevelopmentSettings,
    repository: LocalRepository,
    multiplayer_settings: MultiplayerSettings,
    clock: Callable[[], float],
) -> FastAPI:
    """Create loopback and secret-protected Node-to-Python persistence routes."""
    app = FastAPI(title="PACKETLOSS Local Game Boundary", docs_url=None, redoc_url=None)

    @app.middleware("http")
    async def bound_internal_body(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Bound local cross-process payloads and forbid credential/result caching."""
        if len(await request.body()) > 64 * 1024:
            return JSONResponse(
                status_code=413,
                headers={"Cache-Control": "no-store"},
                content={"code": "PAYLOAD_TOO_LARGE", "message": "The request is too large."},
            )
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.exception_handler(ApiError)
    async def expected_error(_request: Request, error: ApiError) -> JSONResponse:
        """Serialize local boundary failures with the public stable error shape."""
        return JSONResponse(
            status_code=error.status_code,
            content={"code": error.code, "message": error.message},
        )

    @app.exception_handler(RequestValidationError)
    async def invalid_request(_request: Request, _error: RequestValidationError) -> JSONResponse:
        """Reject malformed internal payloads without validation internals."""
        return JSONResponse(
            status_code=422,
            content={"code": "INVALID_REQUEST", "message": "Check the submitted details."},
        )

    def authorize(request: Request) -> None:
        """Require both a loopback peer and the launcher's non-browser bearer secret."""
        host = request.client.host if request.client else ""
        supplied = request.headers.get("authorization", "")
        expected = f"Bearer {settings.internal_token}"
        if not _is_loopback(host) or not hmac.compare_digest(supplied, expected):
            raise ApiError(401, "AUTH_REQUIRED", "Local server authentication is required.")

    @app.post("/internal/dev/process/register", status_code=204)
    def register_process(
        payload: ProcessRegistrationRequest, _authorized: None = Depends(authorize)
    ) -> Response:
        """Fence the stopped predecessor without resetting the stack's data or uptime."""
        if payload.instance_run_id != settings.run_id or not repository.register_process(
            payload.instance_run_id, payload.process_generation,
        ):
            raise ApiError(409, "PROCESS_CONFLICT", "The local server run has changed.")
        return Response(status_code=204)

    @app.post("/internal/dev/heartbeat")
    def heartbeat(
        payload: HeartbeatRequest, _authorized: None = Depends(authorize)
    ) -> dict[str, bool]:
        """Promote a fenced local process to ready and retain its diagnostics."""
        active = repository.heartbeat(
            payload.instance_run_id,
            payload.process_generation,
            payload.status.model_dump(mode="json", by_alias=True),
            int(clock()),
        )
        return {"active": active}

    @app.post("/internal/dev/tickets/consume")
    def consume_ticket(
        payload: ConsumeTicketRequest, _authorized: None = Depends(authorize)
    ) -> dict[str, Any]:
        """Consume one ticket and return only its server-trusted player identity."""
        ticket = repository.consume_ticket(
            payload.ticket,
            payload.instance_run_id,
            payload.process_generation,
            int(clock()),
            multiplayer_settings.heartbeat_max_age,
        )
        if not ticket:
            raise ApiError(401, "INVALID_TICKET", "The join credential is invalid or expired.")
        return {
            "playerId": ticket["subject"],
            "name": ticket["nickname"],
            "operation": ticket["operation"],
            **({"roomCode": ticket["roomCode"]} if ticket.get("roomCode") else {}),
        }

    @app.post("/internal/dev/matches/start", status_code=204)
    def start_match(payload: MatchStartRequest, _authorized: None = Depends(authorize)) -> Response:
        """Persist an immutable local match roster before countdown."""
        repository.put_match_start(
            payload.match_id,
            payload.room_id,
            payload.instance_run_id,
            payload.process_generation,
            payload.participants,
            payload.started_at,
        )
        return Response(status_code=204)

    @app.post("/internal/dev/matches/finish", status_code=204)
    def finish_match(
        payload: MatchFinishRequest, _authorized: None = Depends(authorize)
    ) -> Response:
        """Persist one terminal result using the start record's selected region."""
        repository.finish_match(
            payload.instance_run_id,
            payload.process_generation,
            payload.result.model_dump(mode="json", by_alias=True),
        )
        return Response(status_code=204)

    return app

