"""End-to-end local development API behavior without AWS services."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from datetime import UTC, datetime
from pathlib import Path

import boto3
import pytest
from fastapi.testclient import TestClient
from moto import mock_aws

import packetloss_api.local_repository as local_repository
from packetloss_api.dev_app import DevelopmentSettings
from packetloss_api.dev_app import create_development_app as compose_app
from packetloss_api.local_auth import DEVELOPMENT_CODE, DEVELOPMENT_PASSWORD, LocalAuth
from packetloss_api.local_repository import LocalRepository, initialize_database
from packetloss_api.local_repository import local_resource as validate_resource


@pytest.fixture(autouse=True)
def dynamodb(monkeypatch):
    """Run local composition tests with real SDK calls against Moto's DynamoDB service."""
    with mock_aws():
        resource = boto3.resource("dynamodb", region_name="us-east-1")
        initialize_database(resource)
        monkeypatch.setattr(local_repository, "local_resource", lambda endpoint: resource)
        yield resource


def create_development_app(config, clock=None):
    """Simulate launcher bootstrap separately from Lambda construction."""
    import time
    clock = clock or time.time
    repository = LocalRepository(config.dynamodb_endpoint, clock)
    LocalAuth(repository, config.auth_key, clock).seed_accounts()
    repository.reset_runtime(config.run_id, config.process_generation, int(clock()))
    return compose_app(config, clock)


class Clock:
    """Manually controlled epoch clock shared by local auth and control services."""

    def __init__(self, value: int = 1_800_000_000) -> None:
        self.value = value

    def __call__(self) -> float:
        return float(self.value)


def settings() -> DevelopmentSettings:
    """Build one loopback-only development configuration."""
    return DevelopmentSettings(
        dynamodb_endpoint="http://127.0.0.1:8000",
        auth_key="a" * 32,
        internal_token="i" * 32,
        run_id="local-run-1",
        process_generation="local-process-1",
        site_origin="http://127.0.0.1:5173",
        websocket_url="ws://127.0.0.1:8080/ws",
    )


def client_for(application) -> TestClient:
    """Create a TestClient whose ASGI peer address passes the loopback boundary."""
    return TestClient(
        application,
        base_url="http://127.0.0.1:8787",
        client=("127.0.0.1", 50000),
    )


def login(client: TestClient, email: str, password: str = DEVELOPMENT_PASSWORD) -> str:
    """Log in one seeded account and return its local signed access token."""
    response = client.post("/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["accessToken"]


def bearer(token: str) -> dict[str, str]:
    """Build a public bearer header."""
    return {"Authorization": f"Bearer {token}"}


def internal(settings_value: DevelopmentSettings) -> dict[str, str]:
    """Build the private loopback process header."""
    return {"Authorization": f"Bearer {settings_value.internal_token}"}


def heartbeat_body(settings_value: DevelopmentSettings, **status) -> dict[str, object]:
    """Build a complete authoritative local RoomStatus heartbeat."""
    return {
        "instanceRunId": settings_value.run_id,
        "processGeneration": settings_value.process_generation,
        "status": {
            "ready": True,
            "draining": False,
            "activeMatches": 0,
            "connectedPlayers": 0,
            "rooms": 0,
            "idleMs": 0,
            "pendingResults": 0,
            "currentTickDebtMs": 0,
            "maximumTickDebtMs": 0,
            **status,
        },
    }


def ready_server(client: TestClient, settings_value: DevelopmentSettings, owner_token: str) -> None:
    """Publish game readiness; development requires no owner startup."""
    response = client.post(
        "/internal/dev/heartbeat",
        json=heartbeat_body(settings_value),
        headers=internal(settings_value),
    )
    assert response.json() == {"active": True}


def record(identifier: str, score: int) -> dict[str, object]:
    """Build one valid solo record payload."""
    return {
        "id": identifier,
        "completedAt": datetime(2026, 1, 1, tzinfo=UTC).isoformat(),
        "map": "default",
        "nickname": "OWNER",
        "outcome": "lost",
        "score": score,
        "lives": 0,
        "elapsedMs": 1000,
        "pointsCollected": 1,
        "totalPoints": 10,
        "levelsCleared": 0,
        "mode": "classic",
    }


def test_local_accounts_codes_tokens_and_solo_records_survive_restart() -> None:
    clock = Clock()
    config = settings()
    first_app = create_development_app(config, clock)
    with client_for(first_app) as first:
        owner_token = login(first, "owner@packetloss.local")
        login_response = first.post(
            "/v1/auth/login",
            json={"email": "friend1@packetloss.local", "password": DEVELOPMENT_PASSWORD},
        )
        assert "HttpOnly" in login_response.headers["set-cookie"]
        assert "Secure" not in login_response.headers["set-cookie"]

        profile = first.patch(
            "/v1/me",
            json={"nickname": "LOCAL OWNER", "avatar": "trojan"},
            headers=bearer(owner_token),
        )
        assert profile.json() == {"nickname": "LOCAL OWNER", "avatar": "trojan"}
        saved = first.put(
            "/v1/me/records",
            json={"records": [record("local-run", 1234)]},
            headers=bearer(owner_token),
        )
        assert saved.status_code == 200
        friend_token = login(first, "friend2@packetloss.local")
        assert first.get("/v1/me/records", headers=bearer(friend_token)).json() == {"records": []}
        forged = f"{owner_token[:-1]}{'a' if owner_token[-1] != 'a' else 'b'}"
        assert first.get("/v1/me", headers=bearer(forged)).status_code == 401

        signup = first.post(
            "/v1/auth/signup",
            json={
                "email": "new@packetloss.local",
                "password": "a-local-password",
                "nickname": "NEW",
                "avatar": "lag",
            },
        )
        assert signup.status_code == 202
        assert (
            first.post(
                "/v1/auth/login",
                json={"email": "new@packetloss.local", "password": "a-local-password"},
            ).status_code
            == 409
        )
        assert (
            first.post(
                "/v1/auth/confirm",
                json={"email": "new@packetloss.local", "code": DEVELOPMENT_CODE},
            ).status_code
            == 204
        )
        assert login(first, "new@packetloss.local", "a-local-password")

        clock.value += 3601
        assert first.get("/v1/me", headers=bearer(owner_token)).status_code == 401

    second_app = create_development_app(config, clock)
    with client_for(second_app) as second:
        owner_token = login(second, "owner@packetloss.local")
        assert second.get("/v1/me", headers=bearer(owner_token)).json() == {
            "nickname": "LOCAL OWNER",
            "avatar": "trojan",
        }
        assert (
            second.get("/v1/me/records", headers=bearer(owner_token)).json()["records"][0]["score"]
            == 1234
        )


def test_local_password_reset_revokes_existing_refresh_session() -> None:
    config = settings()
    application = create_development_app(config)
    with client_for(application) as client:
        assert login(client, "friend1@packetloss.local")
        assert (
            client.post(
                "/v1/auth/forgot-password", json={"email": "friend1@packetloss.local"}
            ).status_code
            == 204
        )
        assert (
            client.post(
                "/v1/auth/reset-password",
                json={
                    "email": "friend1@packetloss.local",
                    "code": DEVELOPMENT_CODE,
                    "password": "new-local-password",
                },
            ).status_code
            == 204
        )
        assert client.post("/v1/auth/refresh").status_code == 401
        assert login(client, "friend1@packetloss.local", "new-local-password")


def test_auto_start_heartbeat_and_ticket_consumption_are_fenced() -> None:
    clock = Clock()
    config = settings()
    application = create_development_app(config, clock)
    with client_for(application) as client:
        owner_token = login(client, "owner@packetloss.local")
        friend_token = login(client, "friend1@packetloss.local")
        assert client.get("/v1/multiplayer/status").json()["phase"] == "starting"
        assert client.get("/v1/multiplayer/capabilities", headers=bearer(friend_token)).json() == {
            "canStart": False
        }
        assert client.get("/v1/multiplayer/capabilities", headers=bearer(owner_token)).json() == {
            "canStart": True
        }

        wrong = heartbeat_body(config)
        wrong["processGeneration"] = "stale-process"
        assert client.post(
            "/internal/dev/heartbeat", json=wrong, headers=internal(config)
        ).json() == {"active": False}
        assert (
            client.post("/internal/dev/heartbeat", json=heartbeat_body(config)).status_code == 401
        )
        assert client.post(
            "/internal/dev/heartbeat",
            json=heartbeat_body(config),
            headers=internal(config),
        ).json() == {"active": True}
        status = client.get("/v1/multiplayer/status").json()
        assert status["phase"] == "ready"
        assert status["activeRegion"] == "eu"
        assert status["processGeneration"] == config.process_generation
        assert status["websocketUrl"] == config.websocket_url

        credential = client.post(
            "/v1/multiplayer/join-credentials",
            json={"region": "eu", "operation": "create"},
            headers=bearer(friend_token),
        ).json()
        consume = {
            "ticket": credential["ticket"],
            "instanceRunId": config.run_id,
            "processGeneration": config.process_generation,
        }
        identity = client.post(
            "/internal/dev/tickets/consume", json=consume, headers=internal(config)
        )
        assert identity.json() == {
            "playerId": "dev-friend-1",
            "name": "FRIEND1",
            "operation": "create",
        }
        assert (
            client.post(
                "/internal/dev/tickets/consume", json=consume, headers=internal(config)
            ).status_code
            == 401
        )


def test_game_reload_fences_old_tickets_and_retains_run_and_accounts() -> None:
    """Node reload changes only its generation; a Lambda cold start preserves that registration."""
    clock = Clock()
    config = settings()
    application = create_development_app(config, clock)
    replacement = replace(config, process_generation="reloaded-process")
    registration = {
        "instanceRunId": config.run_id,
        "processGeneration": replacement.process_generation,
    }
    with client_for(application) as client:
        token = login(client, "friend1@packetloss.local")
        ready_server(client, config, token)
        assert client.patch(
            "/v1/me", json={"nickname": "RELOADING", "avatar": "virus"},
            headers=bearer(token),
        ).status_code == 200
        assert client.put(
            "/v1/me/records", json={"records": [record("before-reload", 1234)]},
            headers=bearer(token),
        ).status_code == 200
        credential = client.post(
            "/v1/multiplayer/join-credentials",
            json={"region": "eu", "operation": "create"}, headers=bearer(token),
        ).json()
        before = application.repository.get_control()
        clock.value += 10
        assert client.post(
            "/internal/dev/process/register", json=registration,
        ).status_code == 401
        assert client.post(
            "/internal/dev/process/register",
            json={**registration, "instanceRunId": "old-run"}, headers=internal(config),
        ).status_code == 409
        assert application.repository.get_control() == before
        assert client.post(
            "/internal/dev/process/register", json=registration, headers=internal(config),
        ).status_code == 204
        assert client.get("/v1/multiplayer/status").json()["phase"] == "starting"
        after = application.repository.get_control()
        for key in ("instanceRunId", "startedAt", "uptimeDeadline", "activeRegion"):
            assert after[key] == before[key]
        assert after["processGeneration"] == replacement.process_generation
        assert client.post(
            "/internal/dev/heartbeat", json=heartbeat_body(config), headers=internal(config),
        ).json() == {"active": False}
        ready_server(client, replacement, token)
        for generation in (config.process_generation, replacement.process_generation):
            assert client.post(
                "/internal/dev/tickets/consume",
                json={
                    "ticket": credential["ticket"], "instanceRunId": config.run_id,
                    "processGeneration": generation,
                }, headers=internal(config),
            ).status_code == 401
        fresh = client.post(
            "/v1/multiplayer/join-credentials",
            json={"region": "eu", "operation": "create"}, headers=bearer(token),
        ).json()
        assert fresh["processGeneration"] == replacement.process_generation
        assert client.post(
            "/internal/dev/tickets/consume",
            json={"ticket": fresh["ticket"], **registration}, headers=internal(config),
        ).json()["playerId"] == "dev-friend-1"
        registered = application.repository.get_control()
        # A duplicate registration acknowledgement must not erase current readiness.
        assert client.post(
            "/internal/dev/process/register", json=registration, headers=internal(config),
        ).status_code == 204
        assert application.repository.get_control() == registered
        cookies = client.cookies

    # Recreate the Lambda application with its original environment, without bootstrap.
    with client_for(compose_app(config, clock)) as cold:
        cold.cookies.update(cookies)
        assert cold.get("/v1/multiplayer/status").json()["processGeneration"] == (
            replacement.process_generation
        )
        assert cold.post("/v1/auth/refresh").status_code == 200
        assert cold.get("/v1/me", headers=bearer(token)).json()["nickname"] == "RELOADING"
        records = cold.get("/v1/me/records", headers=bearer(token)).json()["records"]
        assert records[0]["score"] == 1234
        ready_server(cold, replacement, token)


def test_process_registration_does_not_overwrite_a_concurrent_runtime_change(monkeypatch) -> None:
    """A stale read must lose the conditional write instead of restoring old run ownership."""
    config = settings()
    application = create_development_app(config)
    repository = application.repository
    get_control = repository.get_control

    def replace_run_after_read():
        """Interleave a newer launcher write between registration's read and conditional write."""
        current = get_control()
        assert repository.replace_control(
            int(current["revision"]), {**current, "instanceRunId": "next-run"},
        )
        return current

    monkeypatch.setattr(repository, "get_control", replace_run_after_read)
    with client_for(application) as client:
        assert client.post(
            "/internal/dev/process/register",
            json={"instanceRunId": config.run_id, "processGeneration": "replacement"},
            headers=internal(config),
        ).status_code == 409
    assert get_control()["instanceRunId"] == "next-run"
    assert get_control()["processGeneration"] == config.process_generation


def test_ticket_consumption_is_atomic_across_dynamodb_requests() -> None:
    clock = Clock()
    config = settings()
    application = create_development_app(config, clock)
    with client_for(application) as client:
        owner_token = login(client, "owner@packetloss.local")
        friend_token = login(client, "friend2@packetloss.local")
        ready_server(client, config, owner_token)
        ticket = client.post(
            "/v1/multiplayer/join-credentials",
            json={"region": "eu", "operation": "create"},
            headers=bearer(friend_token),
        ).json()["ticket"]

    def consume() -> bool:
        return (
            application.repository.consume_ticket(
                ticket, config.run_id, config.process_generation, clock.value
            )
            is not None
        )

    with ThreadPoolExecutor(max_workers=2) as executor:
        assert sorted(executor.map(lambda _index: consume(), range(2))) == [False, True]


def test_match_results_bind_region_authorize_participants_and_survive_restart(
) -> None:
    clock = Clock()
    config = settings()
    application = create_development_app(config, clock)
    started_at = "2027-01-15T08:00:00Z"
    with client_for(application) as client:
        owner_token = login(client, "owner@packetloss.local")
        participant_token = login(client, "friend1@packetloss.local")
        stranger_token = login(client, "friend3@packetloss.local")
        ready_server(client, config, owner_token)
        start_payload = {
            "matchId": "match-local-1",
            "roomId": "ROOM23",
            "instanceRunId": config.run_id,
            "processGeneration": config.process_generation,
            "participants": ["dev-owner", "dev-friend-1"],
            "startedAt": started_at,
        }
        assert (
            client.post(
                "/internal/dev/matches/start", json=start_payload, headers=internal(config)
            ).status_code
            == 204
        )
        conflicting_start = client.post(
            "/internal/dev/matches/start",
            json={**start_payload, "roomId": "OTHER1"},
            headers=internal(config),
        )
        assert conflicting_start.status_code == 409
        assert conflicting_start.json()["code"] == "MATCH_CONFLICT"
        assert (
            client.get(
                "/v1/multiplayer/matches/match-local-1", headers=bearer(participant_token)
            ).status_code
            == 409
        )
        finish_payload = {
            "instanceRunId": config.run_id,
            "processGeneration": config.process_generation,
            "result": {
                "matchId": "match-local-1",
                "roomId": "ROOM23",
                "startedAt": started_at,
                "completedAt": "2027-01-15T08:03:00Z",
                "outcome": "completed",
                "reason": None,
                "standings": [
                    {
                        "playerId": "dev-owner",
                        "nickname": "OWNER",
                        "color": "#38bdf8",
                        "score": 100,
                        "rank": 1,
                        "connected": True,
                    },
                    {
                        "playerId": "dev-friend-1",
                        "nickname": "FRIEND1",
                        "color": "#fb7185",
                        "score": 50,
                        "rank": 2,
                        "connected": True,
                    },
                ],
            },
        }
        finish = client.post(
            "/internal/dev/matches/finish", json=finish_payload, headers=internal(config)
        )
        assert finish.status_code == 204, finish.text
        assert (
            client.post(
                "/internal/dev/matches/finish", json=finish_payload, headers=internal(config)
            ).status_code
            == 204
        )
        result = client.get(
            "/v1/multiplayer/matches/match-local-1", headers=bearer(participant_token)
        )
        assert result.json()["region"] == "eu"
        assert result.json()["standings"][0]["score"] == 100
        assert (
            client.get(
                "/v1/multiplayer/matches/match-local-1", headers=bearer(stranger_token)
            ).status_code
            == 404
        )

        pending = {**start_payload, "matchId": "match-interrupted", "roomId": "ROOM24"}
        assert (
            client.post(
                "/internal/dev/matches/start", json=pending, headers=internal(config)
            ).status_code
            == 204
        )
        terminal_replay = {
            **start_payload,
            "matchId": "match-terminal-replay",
            "roomId": "ROOM25",
        }
        assert (
            client.post(
                "/internal/dev/matches/start",
                json=terminal_replay,
                headers=internal(config),
            ).status_code
            == 204
        )
        old_ticket = client.post(
            "/v1/multiplayer/join-credentials",
            json={"region": "eu", "operation": "create"},
            headers=bearer(participant_token),
        ).json()["ticket"]

    clock.value += 1
    restarted_config = replace(config, run_id="local-run-2", process_generation="local-process-2")
    restarted = create_development_app(restarted_config, clock)
    with client_for(restarted) as client:
        participant_token = login(client, "friend1@packetloss.local")
        assert client.get("/v1/multiplayer/status").json()["phase"] == "starting"
        assert (
            client.post(
                "/internal/dev/tickets/consume",
                json={
                    "ticket": old_ticket,
                    "instanceRunId": config.run_id,
                    "processGeneration": config.process_generation,
                },
                headers=internal(restarted_config),
            ).status_code
            == 401
        )
        missing_start = client.post(
            "/internal/dev/matches/start",
            json={
                **start_payload,
                "matchId": "match-never-registered",
                "roomId": "ROOM26",
            },
            headers=internal(restarted_config),
        )
        assert missing_start.status_code == 404
        assert missing_start.json()["code"] == "MATCH_START_NOT_FOUND"
        assert (
            client.get(
                "/v1/multiplayer/matches/match-local-1", headers=bearer(participant_token)
            ).json()["outcome"]
            == "completed"
        )
        assert (
            client.post(
                "/internal/dev/matches/start",
                json=terminal_replay,
                headers=internal(restarted_config),
            ).status_code
            == 204
        )
        completed_replay = {
            "instanceRunId": config.run_id,
            "processGeneration": config.process_generation,
            "result": {
                **finish_payload["result"],
                "matchId": "match-terminal-replay",
                "roomId": "ROOM25",
                "completedAt": "2027-01-15T08:03:01Z",
            },
        }
        assert (
            client.post(
                "/internal/dev/matches/finish",
                json=completed_replay,
                headers=internal(restarted_config),
            ).status_code
            == 204
        )
        assert (
            client.post(
                "/internal/dev/matches/finish",
                json=completed_replay,
                headers=internal(restarted_config),
            ).status_code
            == 204
        )
        assert (
            client.get(
                "/v1/multiplayer/matches/match-terminal-replay",
                headers=bearer(participant_token),
            ).json()["outcome"]
            == "completed"
        )
        assert (
            client.get(
                "/v1/multiplayer/matches/match-interrupted", headers=bearer(participant_token)
            ).status_code
            == 409
        )
        assert (
            client.post(
                "/internal/dev/matches/start",
                json=pending,
                headers=internal(restarted_config),
            ).status_code
            == 204
        )
        recovered_finish = {
            "instanceRunId": config.run_id,
            "processGeneration": config.process_generation,
            "result": {
                "matchId": "match-interrupted",
                "roomId": "ROOM24",
                "startedAt": started_at,
                "completedAt": "2027-01-15T08:03:01Z",
                "outcome": "aborted",
                "reason": "process_restart",
                "standings": [],
            },
        }
        assert (
            client.post(
                "/internal/dev/matches/finish",
                json=recovered_finish,
                headers=internal(restarted_config),
            ).status_code
            == 204
        )
        interrupted = client.get(
            "/v1/multiplayer/matches/match-interrupted", headers=bearer(participant_token)
        )
        assert interrupted.json()["outcome"] == "aborted"
        assert interrupted.json()["reason"] == "process_restart"


def test_development_configuration_rejects_non_loopback_urls() -> None:
    config = settings()
    for changed in (
        DevelopmentSettings(**{**config.__dict__, "site_origin": "https://example.com"}),
        DevelopmentSettings(**{**config.__dict__, "websocket_url": "wss://example.com/ws"}),
    ):
        try:
            changed.validate()
        except ValueError:
            pass
        else:
            raise AssertionError("remote development endpoint was accepted")


def test_internal_routes_reject_non_loopback_clients() -> None:
    config = settings()
    application = create_development_app(config)
    with TestClient(
        application,
        base_url="http://127.0.0.1:8787",
        client=("192.0.2.10", 50000),
    ) as client:
        response = client.post(
            "/internal/dev/heartbeat",
            json=heartbeat_body(config),
            headers=internal(config),
        )
        assert response.status_code == 401


def test_local_short_password_signup_and_reset_leave_production_models_strict(
) -> None:
    import pytest
    from pydantic import ValidationError

    from packetloss_api.models import ResetPasswordRequest, SignupRequest

    config = settings()
    signup = {"email": "simple@example.com", "password": "a", "nickname": "SIMPLE"}
    reset = {"email": signup["email"], "password": "b", "code": DEVELOPMENT_CODE}
    with pytest.raises(ValidationError):
        SignupRequest.model_validate(signup)
    with pytest.raises(ValidationError):
        ResetPasswordRequest.model_validate(reset)
    with client_for(create_development_app(config)) as client:
        assert client.post("/v1/auth/signup", json={**signup, "password": ""}).status_code == 422
        assert client.post("/v1/auth/signup", json=signup).status_code == 202
        assert (
            client.post(
                "/v1/auth/confirm", json={"email": signup["email"], "code": DEVELOPMENT_CODE}
            ).status_code
            == 204
        )
        assert login(client, signup["email"], "a")
        assert (
            client.post("/v1/auth/forgot-password", json={"email": signup["email"]}).status_code
            == 204
        )
        assert client.post("/v1/auth/reset-password", json=reset).status_code == 204
        assert login(client, signup["email"], "b")


def test_guests_keep_independent_persistent_sessions_and_can_join_multiplayer(
) -> None:
    config = settings()
    app = create_development_app(config)
    with client_for(app) as first, client_for(app) as second:
        owner = login(first, "owner@packetloss.local")
        ready_server(first, config, owner)
        assert first.post("/v1/auth/guest", json={"nickname": "   "}).status_code == 422
        guest = first.post("/v1/auth/guest", json={"nickname": "OWNER"})
        assert guest.status_code == 200
        token = guest.json()["accessToken"]
        assert first.get("/v1/multiplayer/capabilities", headers=bearer(token)).json() == {
            "canStart": False
        }
        assert (
            first.put(
                "/v1/me/records",
                json={"records": [record("guest-score", 123)]},
                headers=bearer(token),
            ).status_code
            == 200
        )
        other = second.post("/v1/auth/guest", json={"nickname": "OWNER"}).json()["accessToken"]
        assert app.auth.verify_access_token(token) != app.auth.verify_access_token(other)
        assert second.get("/v1/me/records", headers=bearer(other)).json() == {"records": []}
        assert (
            first.post(
                "/v1/multiplayer/join-credentials",
                json={"region": "eu", "operation": "create"},
                headers=bearer(token),
            ).status_code
            == 200
        )
        cookies = dict(first.cookies)
    with client_for(create_development_app(config)) as restarted:
        restarted.cookies.update(cookies)
        restored = restarted.post("/v1/auth/refresh").json()["accessToken"]
        assert (
            restarted.get("/v1/me/records", headers=bearer(restored)).json()["records"][0]["score"]
            == 123
        )
        assert restarted.post("/v1/auth/logout").status_code == 204
        assert restarted.post("/v1/auth/refresh").status_code == 401


def test_lambda_cold_start_preserves_ready_state_and_does_not_throttle_guests():
    config = settings()
    clock = Clock()
    app = create_development_app(config, clock)
    with client_for(app) as client:
        ready_server(client, config, "unused")
    with client_for(compose_app(config, clock)) as restarted_lambda:
        assert restarted_lambda.get("/v1/multiplayer/status").json()["phase"] == "ready"
        guest = restarted_lambda.post("/v1/auth/guest", json={"nickname": "LOCAL"})
        headers = bearer(guest.json()["accessToken"])
        for _ in range(35):
            issued = restarted_lambda.post(
                "/v1/multiplayer/join-credentials",
                json={"region": "eu", "operation": "create"}, headers=headers,
            )
            assert issued.status_code == 200
            assert "retry-after" not in issued.headers


def test_local_dynamodb_endpoint_rejects_aws_hosts():
    with pytest.raises(ValueError, match="must be local"):
        validate_resource("https://dynamodb.us-east-1.amazonaws.com")


def test_legacy_sqlite_import_preserves_data_and_does_not_repeat(tmp_path: Path):
    """A WAL snapshot imports without modifying the original or overwriting later edits."""
    import json
    import sqlite3

    from packetloss_api.dev_bootstrap import migrate
    from packetloss_api.models import Profile

    source = tmp_path / "legacy.sqlite"
    repository = LocalRepository("http://127.0.0.1:8000")
    with sqlite3.connect(source) as database:
        database.execute("PRAGMA journal_mode = WAL")
        database.executescript("""
            CREATE TABLE users(subject, email, password_salt, password_hash, confirmed,
                               confirmation_code, reset_code);
            CREATE TABLE profiles(subject, nickname, avatar);
            CREATE TABLE records(subject, payload);
            CREATE TABLE refresh_sessions(token_hash, subject, expires_at, revoked);
            CREATE TABLE matches(match_id, payload);
        """)
        database.execute("INSERT INTO users VALUES (?, ?, ?, ?, 1, NULL, NULL)",
                         ("legacy", "old@local.test", b"salt", b"hash"))
        database.execute("INSERT INTO profiles VALUES ('legacy', 'OLD', 'virus')")
        database.execute("INSERT INTO records VALUES (?, ?)",
                         ("legacy", json.dumps(record("legacy-score", 9876))))
        database.execute("INSERT INTO refresh_sessions VALUES ('digest', 'legacy', 9999999999, 0)")
        database.commit()
        before = source.read_bytes()
        migrate(repository, source)
        assert source.read_bytes() == before
        assert repository.identity_for_subject("legacy")["password_hash"] == b"hash"
        assert repository.get_records("legacy")[0].score == 9876
        assert repository.refresh_subject("digest", 1_800_000_000) == "legacy"
        repository.update_profile("legacy", Profile(nickname="EDITED"))
        migrate(repository, source)
        assert repository.get_profile("legacy").nickname == "EDITED"


@pytest.mark.parametrize("host", ["127.0.0.1", "localhost"])
def test_browser_preflight_guest_cookie_and_multiplayer_from_both_local_aliases(host):
    """Exercise browser CORS before guest POST and credentialed cookie restoration."""
    origin = f"http://{host}:5173"
    app = create_development_app(settings())
    with TestClient(app, base_url=f"http://{host}:8787", client=("127.0.0.1", 50000)) as client:
        for route in ("/v1/auth/guest", "/v1/multiplayer/join-credentials"):
            preflight = client.options(route, headers={
                "Origin": origin, "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type,authorization",
            })
            assert preflight.status_code == 200
            assert preflight.headers["access-control-allow-origin"] == origin
            assert preflight.headers["access-control-allow-credentials"] == "true"
        guest = client.post(
            "/v1/auth/guest", json={"nickname": "LOCAL"}, headers={"Origin": origin}
        )
        assert guest.status_code == 200
        assert guest.headers["access-control-allow-origin"] == origin
        assert "SameSite=strict" in guest.headers["set-cookie"]
        refreshed = client.post("/v1/auth/refresh", headers={"Origin": origin})
        assert refreshed.status_code == 200
        assert app.auth.verify_access_token(refreshed.json()["accessToken"]) == (
            app.auth.verify_access_token(guest.json()["accessToken"])
        )
        for disallowed in ("http://localhost:5174", "https://example.com"):
            rejected = client.options("/v1/auth/guest", headers={
                "Origin": disallowed, "Access-Control-Request-Method": "POST",
            })
            assert rejected.status_code == 400
            assert "access-control-allow-origin" not in rejected.headers
