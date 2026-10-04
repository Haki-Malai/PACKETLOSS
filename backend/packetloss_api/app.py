"""FastAPI application factory for PACKETLOSS accounts and records."""

from collections.abc import Awaitable, Callable

from fastapi import Depends, FastAPI, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .auth import AuthGateway, CognitoAuth
from .config import Settings
from .errors import ApiError
from .models import (
    AccessTokenResponse,
    ConfirmSignupRequest,
    EmailRequest,
    LoginRequest,
    Profile,
    RecordsRequest,
    RecordsResponse,
    ResetPasswordRequest,
    SignupRequest,
    SignupResponse,
)
from .repository import DynamoProfileRepository, ProfileRepository


def create_app(
    settings: Settings,
    auth: AuthGateway | None = None,
    repository: ProfileRepository | None = None,
    *,
    signup_model: type[SignupRequest] = SignupRequest,
    reset_model: type[ResetPasswordRequest] = ResetPasswordRequest,
    cors_origins: list[str] | None = None,
) -> FastAPI:
    """Create an API with injectable AWS adapters for deterministic tests."""
    auth = auth or CognitoAuth(settings)
    repository = repository or DynamoProfileRepository(settings.table_name)
    app = FastAPI(title="PACKETLOSS API", version="1.0.0", docs_url=None, redoc_url=None)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins if cors_origins is not None else [settings.site_origin],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
        expose_headers=["Retry-After"],
    )

    @app.exception_handler(ApiError)
    async def api_error_handler(_request: Request, error: ApiError) -> JSONResponse:
        """Serialize expected failures with a stable machine-readable code."""
        headers = {"Retry-After": str(error.retry_after)} if error.retry_after else None
        return JSONResponse(
            status_code=error.status_code,
            content={"code": error.code, "message": error.message},
            headers=headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        _request: Request, _error: RequestValidationError
    ) -> JSONResponse:
        """Keep malformed input errors stable without exposing validation internals."""
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"code": "INVALID_REQUEST", "message": "Check the submitted details."},
        )

    @app.middleware("http")
    async def enforce_payload_limit(
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        """Reject declared request bodies larger than the bounded API contract."""
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                too_large = int(content_length) > settings.max_payload_bytes
            except ValueError:
                return JSONResponse(
                    status_code=400,
                    content={"code": "INVALID_REQUEST", "message": "The request size is invalid."},
                )
            if too_large:
                return JSONResponse(
                    status_code=413,
                    content={"code": "PAYLOAD_TOO_LARGE", "message": "The request is too large."},
                )
        return await call_next(request)

    def current_subject(request: Request) -> str:
        """Read the subject injected by API Gateway's verified Cognito JWT authorizer."""
        event = request.scope.get("aws.event", {})
        claims = (
            event.get("requestContext", {})
            .get("authorizer", {})
            .get("jwt", {})
            .get("claims", {})
        )
        subject = claims.get("sub")
        if settings.stage == "test" and not subject:
            subject = request.headers.get("x-test-user")
        if not isinstance(subject, str) or not subject:
            raise ApiError(401, "AUTH_REQUIRED", "Log in to continue.")
        return subject

    def set_refresh_cookie(response: Response, value: str) -> None:
        """Set the host-only refresh cookie used only by auth endpoints."""
        response.set_cookie(
            settings.refresh_cookie_name,
            value,
            max_age=30 * 24 * 60 * 60,
            path="/v1/auth",
            secure=settings.stage not in {"test", "development"},
            httponly=True,
            samesite="strict",
        )

    @app.get("/health")
    async def health() -> dict[str, str]:
        """Report that the Lambda application initialized successfully."""
        return {"status": "ok", "stage": settings.stage}

    @app.post(
        "/v1/auth/signup",
        response_model=SignupResponse,
        status_code=status.HTTP_202_ACCEPTED,
    )
    async def signup(payload: signup_model) -> SignupResponse:
        """Reserve bounded signup capacity, create Cognito identity, and persist profile."""
        reservation = repository.reserve_signup(
            payload.email,
            settings.signup_daily_limit,
            settings.signup_account_limit,
        )
        identity_created = False
        try:
            subject = auth.signup(payload.email, payload.password)
            identity_created = True
            repository.put_profile(
                subject,
                Profile(nickname=payload.nickname, avatar=payload.avatar),
            )
        except Exception:
            if not identity_created:
                repository.release_signup(reservation)
            raise
        return SignupResponse()

    @app.post("/v1/auth/confirm", status_code=status.HTTP_204_NO_CONTENT)
    async def confirm_signup(payload: ConfirmSignupRequest) -> Response:
        """Confirm an emailed Cognito signup code."""
        auth.confirm_signup(payload.email, payload.code)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @app.post("/v1/auth/resend-confirmation", status_code=status.HTTP_204_NO_CONTENT)
    async def resend_confirmation(payload: EmailRequest) -> Response:
        """Resend a verification code through the throttled public auth route."""
        auth.resend_confirmation(payload.email)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @app.post("/v1/auth/login", response_model=AccessTokenResponse)
    async def login(payload: LoginRequest, response: Response) -> AccessTokenResponse:
        """Authenticate and set the signed refresh cookie."""
        tokens = auth.login(payload.email, payload.password)
        set_refresh_cookie(response, auth.pack_refresh_cookie(tokens))
        return AccessTokenResponse(access_token=tokens.id_token, expires_in=tokens.expires_in)

    @app.post("/v1/auth/refresh", response_model=AccessTokenResponse)
    async def refresh(request: Request) -> AccessTokenResponse:
        """Refresh the browser's in-memory ID token from its HTTP-only cookie."""
        cookie = request.cookies.get(settings.refresh_cookie_name)
        if not cookie:
            raise ApiError(401, "SESSION_EXPIRED", "Your session has expired.")
        tokens = auth.refresh(cookie)
        return AccessTokenResponse(access_token=tokens.id_token, expires_in=tokens.expires_in)

    @app.post("/v1/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
    async def logout(request: Request, response: Response) -> Response:
        """Revoke the current refresh token and clear its cookie."""
        cookie = request.cookies.get(settings.refresh_cookie_name)
        if cookie:
            try:
                auth.logout(cookie)
            except ApiError:
                # Local logout must still succeed if Cognito cannot revoke the token.
                pass
        response.delete_cookie(settings.refresh_cookie_name, path="/v1/auth")
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    @app.post("/v1/auth/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
    async def forgot_password(payload: EmailRequest) -> Response:
        """Send a password recovery code when the account exists."""
        try:
            auth.forgot_password(payload.email)
        except ApiError as error:
            if error.code != "INVALID_CREDENTIALS":
                raise
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @app.post("/v1/auth/reset-password", status_code=status.HTTP_204_NO_CONTENT)
    async def reset_password(payload: reset_model) -> Response:
        """Apply a new password using the emailed recovery code."""
        auth.reset_password(payload.email, payload.code, payload.password)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @app.get("/v1/me", response_model=Profile)
    async def get_me(subject: str = Depends(current_subject)) -> Profile:
        """Return the authenticated player's profile."""
        return repository.get_profile(subject)

    @app.patch("/v1/me", response_model=Profile)
    async def update_me(
        payload: Profile,
        subject: str = Depends(current_subject),
    ) -> Profile:
        """Replace the authenticated player's nickname and avatar."""
        return repository.update_profile(subject, payload)

    @app.get("/v1/me/records", response_model=RecordsResponse)
    async def get_records(subject: str = Depends(current_subject)) -> RecordsResponse:
        """Return the authenticated player's retained run records."""
        return RecordsResponse(records=repository.get_records(subject))

    @app.put("/v1/me/records", response_model=RecordsResponse)
    async def put_records(
        payload: RecordsRequest,
        subject: str = Depends(current_subject),
    ) -> RecordsResponse:
        """Idempotently add completed runs and return the canonical retained set."""
        return RecordsResponse(records=repository.save_records(subject, payload.records))

    @app.delete("/v1/me/records", status_code=status.HTTP_204_NO_CONTENT)
    async def clear_records(subject: str = Depends(current_subject)) -> Response:
        """Clear cloud records without deleting profile or account."""
        repository.clear_records(subject)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return app
