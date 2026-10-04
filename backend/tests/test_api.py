"""Observable API behavior without AWS network calls."""

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from packetloss_api.app import create_app
from packetloss_api.auth import AuthTokens
from packetloss_api.config import Settings
from packetloss_api.errors import ApiError
from packetloss_api.models import Profile, RunRecord
from packetloss_api.repository import retain_records


class FakeAuth:
    """Deterministic Cognito substitute for route tests."""

    def __init__(self) -> None:
        self.fail_signup: ApiError | None = None
        self.fail_logout: ApiError | None = None
        self.signed_up: list[str] = []
        self.logged_out: list[str] = []
        self.resent: list[str] = []
        self.fail_resend: ApiError | None = None

    def signup(self, _email: str, _password: str) -> str:
        if self.fail_signup:
            raise self.fail_signup
        self.signed_up.append(_email)
        return "new-user"

    def confirm_signup(self, _email: str, _code: str) -> None:
        return None

    def resend_confirmation(self, email: str) -> None:
        if self.fail_resend:
            raise self.fail_resend
        self.resent.append(email)

    def login(self, _email: str, _password: str) -> AuthTokens:
        return AuthTokens("id-token", 3600, "refresh-token", "new-user")

    def refresh(self, _cookie: str) -> AuthTokens:
        return AuthTokens("new-id-token", 3600)

    def logout(self, cookie: str) -> None:
        if self.fail_logout:
            raise self.fail_logout
        self.logged_out.append(cookie)

    def forgot_password(self, _email: str) -> None:
        return None

    def reset_password(self, _email: str, _code: str, _password: str) -> None:
        return None

    def pack_refresh_cookie(self, _tokens: AuthTokens) -> str:
        return "signed-refresh"


class MemoryRepository:
    """In-memory persistence substitute that applies production retention rules."""

    def __init__(self) -> None:
        self.profiles: dict[str, Profile] = {}
        self.records: dict[str, list[RunRecord]] = {}
        self.registration_full = False
        self.released: list[str] = []

    def reserve_signup(self, email: str, _daily_limit: int, _account_limit: int) -> str:
        if self.registration_full:
            raise ApiError(429, "REGISTRATION_FULL", "Registration is full for now.", 3600)
        return email

    def release_signup(self, reservation: str) -> None:
        self.released.append(reservation)

    def put_profile(self, subject: str, profile: Profile) -> None:
        self.profiles[subject] = profile

    def get_profile(self, subject: str) -> Profile:
        return self.profiles.setdefault(subject, Profile(nickname="PLAYER"))

    def update_profile(self, subject: str, profile: Profile) -> Profile:
        self.profiles[subject] = profile
        return profile

    def get_records(self, subject: str) -> list[RunRecord]:
        return list(self.records.get(subject, []))

    def save_records(self, subject: str, records: list[RunRecord]) -> list[RunRecord]:
        existing = self.records.get(subject, [])
        existing_ids = {record.id for record in existing}
        additions = [record for record in records if record.id not in existing_ids]
        self.records[subject] = retain_records([*existing, *additions])
        return list(self.records[subject])

    def clear_records(self, subject: str) -> None:
        self.records[subject] = []


def record(index: int, score: int | None = None) -> dict[str, object]:
    """Build a valid JSON run with a deterministic completion time."""
    return {
        "id": f"run-{index}",
        "completedAt": (datetime(2026, 1, 1, tzinfo=UTC) + timedelta(days=index)).isoformat(),
        "map": "default",
        "nickname": "PLAYER",
        "outcome": "lost",
        "score": score if score is not None else index,
        "lives": 0,
        "elapsedMs": 1000,
        "pointsCollected": 1,
        "totalPoints": 10,
        "levelsCleared": 0,
        "mode": "classic",
    }


def setup() -> tuple[TestClient, FakeAuth, MemoryRepository]:
    """Create a test API and its inspectable adapters."""
    settings = Settings(
        stage="test",
        table_name="test",
        user_pool_id="pool",
        user_pool_client_id="client",
        user_pool_client_secret="secret",
        site_origin="https://packetloss.test",
        refresh_cookie_name="test_refresh",
        signup_daily_limit=5,
        signup_account_limit=100,
    )
    auth = FakeAuth()
    repository = MemoryRepository()
    return TestClient(create_app(settings, auth, repository)), auth, repository


def test_signup_persists_profile_and_releases_failed_reservation() -> None:
    client, auth, repository = setup()
    payload = {
        "email": " Player@Example.com ",
        "password": "a-long-password",
        "nickname": "  PACKET  ",
        "avatar": "virus",
    }
    response = client.post("/v1/auth/signup", json=payload)
    assert response.status_code == 202
    assert auth.signed_up == ["player@example.com"]
    assert repository.profiles["new-user"] == Profile(nickname="PACKET", avatar="virus")

    auth.fail_signup = ApiError(503, "AUTH_UNAVAILABLE", "Accounts are unavailable.", 30)
    response = client.post("/v1/auth/signup", json={**payload, "email": "next@example.com"})
    assert response.status_code == 503
    assert response.json()["code"] == "AUTH_UNAVAILABLE"
    assert repository.released == ["next@example.com"]


def test_login_sets_http_only_refresh_cookie_and_logout_always_clears_it() -> None:
    client, auth, _repository = setup()
    response = client.post(
        "/v1/auth/login",
        json={"email": "player@example.com", "password": "correct horse battery"},
    )
    assert response.json() == {"accessToken": "id-token", "expiresIn": 3600}
    assert "HttpOnly" in response.headers["set-cookie"]
    assert "test_refresh=signed-refresh" in response.headers["set-cookie"]
    assert client.post("/v1/auth/refresh").json()["accessToken"] == "new-id-token"

    auth.fail_logout = ApiError(503, "AUTH_UNAVAILABLE", "Accounts are unavailable.", 30)
    logout = client.post("/v1/auth/logout")
    assert logout.status_code == 204
    assert client.cookies.get("test_refresh") is None


def test_resend_confirmation_normalizes_email_and_exposes_retry_to_the_site() -> None:
    client, auth, repository = setup()
    response = client.post(
        "/v1/auth/resend-confirmation",
        json={"email": " Player@Example.com "},
    )
    assert response.status_code == 204
    assert auth.resent == ["player@example.com"]
    assert repository.profiles == {}

    auth.fail_resend = ApiError(429, "RATE_LIMITED", "Too many attempts.", 60)
    response = client.post(
        "/v1/auth/resend-confirmation",
        json={"email": "player@example.com"},
        headers={"Origin": "https://packetloss.test"},
    )
    assert response.status_code == 429
    assert response.json()["code"] == "RATE_LIMITED"
    assert response.headers["retry-after"] == "60"
    assert response.headers["access-control-allow-origin"] == "https://packetloss.test"
    assert response.headers["access-control-expose-headers"] == "Retry-After"


def test_records_are_owned_by_verified_subject_idempotent_and_bounded() -> None:
    client, _auth, repository = setup()
    headers = {"x-test-user": "owner-a"}
    for index in range(1, 23):
        response = client.put(
            "/v1/me/records",
            json={"records": [record(index, 1000 - index)]},
            headers=headers,
        )
        assert response.status_code == 200
    client.put("/v1/me/records", json={"records": [record(1, 99_999)]}, headers=headers)

    retained = repository.records["owner-a"]
    assert len(retained) == 20
    assert len({item.id for item in retained}) == 20
    assert next(item.score for item in retained if item.id == "run-1") == 999
    assert repository.records.get("owner-b") is None
    assert client.get("/v1/me/records", headers={"x-test-user": "owner-b"}).json() == {
        "records": []
    }


def test_capacity_payload_and_auth_failures_have_stable_codes() -> None:
    client, _auth, repository = setup()
    repository.registration_full = True
    signup = client.post(
        "/v1/auth/signup",
        json={
            "email": "player@example.com",
            "password": "a-long-password",
            "nickname": "PLAYER",
            "avatar": "packet",
        },
    )
    assert signup.status_code == 429
    assert signup.json()["code"] == "REGISTRATION_FULL"
    assert signup.headers["retry-after"] == "3600"
    assert client.get("/v1/me").json()["code"] == "AUTH_REQUIRED"
    oversized = client.post(
        "/v1/auth/login",
        content=b"{}",
        headers={"content-length": "20000", "content-type": "application/json"},
    )
    assert oversized.status_code == 413
    assert oversized.json()["code"] == "PAYLOAD_TOO_LARGE"
    invalid = client.post(
        "/v1/auth/login",
        json={"email": "not-an-email", "password": "password"},
    )
    assert invalid.status_code == 422
    assert invalid.json() == {
        "code": "INVALID_REQUEST",
        "message": "Check the submitted details.",
    }


def test_profile_update_and_record_clear_preserve_account() -> None:
    client, _auth, repository = setup()
    headers = {"x-test-user": "owner"}
    client.put("/v1/me/records", json={"records": [record(1)]}, headers=headers)
    updated = client.patch(
        "/v1/me",
        json={"nickname": "FIREWALL", "avatar": "firewall"},
        headers=headers,
    )
    assert updated.json() == {"nickname": "FIREWALL", "avatar": "firewall"}
    assert client.delete("/v1/me/records", headers=headers).status_code == 204
    assert repository.records["owner"] == []
    assert repository.profiles["owner"].nickname == "FIREWALL"


def test_default_account_routes_keep_password_policy_and_exclude_guest_login() -> None:
    client, _auth, _repository = setup()
    assert client.post("/v1/auth/guest", json={"nickname": "Guest"}).status_code == 404
    assert (
        client.post(
            "/v1/auth/signup",
            json={
                "email": "short@example.com",
                "password": "a",
                "nickname": "SHORT",
            },
        ).status_code
        == 422
    )
    assert (
        client.post(
            "/v1/auth/reset-password",
            json={
                "email": "short@example.com",
                "password": "a",
                "code": "000000",
            },
        ).status_code
        == 422
    )
