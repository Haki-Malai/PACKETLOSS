"""Separate HTTP control application; gameplay and accounts retain their own services."""

from collections.abc import Awaitable, Callable

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import Depends, FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .errors import ApiError
from .multiplayer_control import Ec2Instances, MultiplayerControl
from .multiplayer_models import (
    JoinCredential,
    JoinRequest,
    MatchResult,
    MultiplayerSettings,
    ServerStatus,
    StartRequest,
    StartResponse,
)
from .multiplayer_repository import DynamoMultiplayerRepository


def create_multiplayer_app(
    settings: MultiplayerSettings, service: MultiplayerControl | None = None,
    *, cors_origins: list[str] | None = None,
) -> FastAPI:
    """Create independently deployable routes with injectable AWS boundaries."""
    service = service or MultiplayerControl(
        settings, DynamoMultiplayerRepository(settings), Ec2Instances(settings)
    )
    app = FastAPI(title="PACKETLOSS Multiplayer Control", docs_url=None, redoc_url=None)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins if cors_origins is not None else [settings.site_origin],
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"], allow_headers=["Authorization", "Content-Type"],
        expose_headers=["Retry-After"],
    )

    @app.middleware("http")
    async def bound_requests(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Bound actual bodies, including chunked requests, and forbid caching credentials."""
        # API Gateway already bounds and buffers Lambda request payloads. Checking the
        # cached body also handles absent/incorrect Content-Length without private APIs.
        if len(await request.body()) > 4096:
            return JSONResponse(
                status_code=413, headers={"Cache-Control": "no-store"},
                content={"code": "PAYLOAD_TOO_LARGE", "message": "The request is too large."},
            )
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.exception_handler(ApiError)
    async def expected_error(_request: Request, error: ApiError) -> JSONResponse:
        """Expose stable failures without leaking AWS resource or identity information."""
        headers = {"Retry-After": str(error.retry_after)} if error.retry_after else None
        return JSONResponse(
            status_code=error.status_code, headers=headers,
            content={"code": error.code, "message": error.message},
        )

    @app.exception_handler(RequestValidationError)
    async def invalid_request(_request: Request, _error: RequestValidationError) -> JSONResponse:
        """Reject malformed or forged fields with a stable response."""
        return JSONResponse(status_code=422, content={
            "code": "INVALID_REQUEST", "message": "Check the submitted details.",
        })

    @app.exception_handler(BotoCoreError)
    @app.exception_handler(ClientError)
    async def aws_failure(_request: Request, _error: Exception) -> JSONResponse:
        """Fail closed on unavailable AWS dependencies without retrying stateful starts."""
        return JSONResponse(status_code=503, headers={"Retry-After": "15"}, content={
            "code": "CONTROL_UNAVAILABLE", "message": "Multiplayer is temporarily unavailable.",
        })

    def current_subject(request: Request) -> str:
        """Accept only the production API Gateway JWT authorizer's verified subject."""
        claims = request.scope.get("aws.event", {}).get("requestContext", {}).get(
            "authorizer", {}
        ).get("jwt", {}).get("claims", {})
        subject = claims.get("sub")
        if settings.stage == "test" and not subject:
            subject = request.headers.get("x-test-user")
        if not isinstance(subject, str) or not subject:
            raise ApiError(401, "AUTH_REQUIRED", "Log in to continue.")
        return subject

    @app.get("/v1/multiplayer/status", response_model=ServerStatus)
    def status() -> ServerStatus:
        """Return a read-only observation; polling can never wake a stopped instance."""
        return service.status()

    @app.get("/v1/multiplayer/capabilities")
    def capabilities(subject: str = Depends(current_subject)) -> dict[str, bool]:
        """Expose the caller's server-start capability."""
        return service.capabilities(subject)

    @app.post("/v1/multiplayer/start", response_model=StartResponse, status_code=202)
    def start(payload: StartRequest, subject: str = Depends(current_subject)) -> StartResponse:
        """Begin owner-authorized startup and return its instance-run operation ID."""
        return service.start(subject, payload.region)

    @app.post("/v1/multiplayer/join-credentials", response_model=JoinCredential)
    def credential(
        payload: JoinRequest, subject: str = Depends(current_subject)
    ) -> JoinCredential:
        """Mint a short-lived, room-bound ticket using the trusted account profile."""
        return service.join_credential(subject, payload)

    @app.get("/v1/multiplayer/matches/{match_id}", response_model=MatchResult)
    def match(match_id: str, subject: str = Depends(current_subject)) -> MatchResult:
        """Read a durable final summary as one of its original participants."""
        if not 1 <= len(match_id) <= 128:
            raise ApiError(404, "MATCH_NOT_FOUND", "This match is unavailable.")
        return service.match(subject, match_id)

    return app
