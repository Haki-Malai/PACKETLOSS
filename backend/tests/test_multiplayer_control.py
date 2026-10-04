"""Control-plane behavior with independent in-memory AWS boundaries."""

import hashlib
from copy import deepcopy
from dataclasses import replace

import pytest
from fastapi.testclient import TestClient

from packetloss_api.errors import ApiError
from packetloss_api.models import Profile
from packetloss_api.multiplayer_app import create_multiplayer_app
from packetloss_api.multiplayer_control import MultiplayerControl
from packetloss_api.multiplayer_models import MultiplayerSettings, RegionSettings


class MemoryControlRepository:
    """Observe control operations without giving route tests access to production AWS."""

    def __init__(self):
        self.control = None
        self.tickets = {}
        self.matches = {}
        self.profile_reads = []
        self.limits = []
        self.reject_claim = False

    def get_control(self):
        return deepcopy(self.control)

    def replace_control(self, revision, state):
        if self.reject_claim or revision != (self.control or {}).get("revision", 0):
            return False
        self.control = {**deepcopy(state), "revision": revision + 1}
        return True

    def fail_start(self, run_id):
        assert self.control["instanceRunId"] == run_id
        self.control["lifecycle"] = "failed"

    def limit(self, key, limit, window, now):
        self.limits.append((key, limit, window, now))

    def get_profile(self, subject):
        self.profile_reads.append(subject)
        return Profile(nickname="Trusted player", avatar="virus")

    def put_ticket(self, token, item):
        self.tickets[hashlib.sha256(token.encode()).hexdigest()] = deepcopy(item)

    def get_match(self, match_id):
        return deepcopy(self.matches.get(match_id))


class FakeInstances:
    """Expose real-state observations separately from the lifecycle reservation."""

    def __init__(self):
        self.current = {"eu": "stopped", "na": "stopped"}
        self.started = []
        self.reads = 0
        self.fail = False
        self.race = False

    def states(self):
        self.reads += 1
        if self.race and self.reads == 2:
            self.current["na"] = "pending"
        return dict(self.current)

    def start(self, region):
        self.started.append(region)
        if self.fail:
            raise ApiError(503, "CONTROL_UNAVAILABLE", "An AWS start timed out.")
        self.current[region] = "pending"


def settings():
    """Use deterministic public configuration and an immutable owner identity."""
    return MultiplayerSettings(
        stage="test", control_table="control", tickets_table="tickets", results_table="results",
        profile_table="profiles", control_region="us-east-1", owner_sub="owner-subject",
        site_origin="https://packetloss.test",
        regions={
            "eu": RegionSettings("eu-central-1", "i-eu", "wss://eu.packetloss.test/ws"),
            "na": RegionSettings("us-east-1", "i-na", "wss://na.packetloss.test/ws"),
        },
    )


def setup():
    """Create a control API, fake dependencies, and a manually advanced clock."""
    repository = MemoryControlRepository()
    instances = FakeInstances()
    now = [1_800_000_000]
    service = MultiplayerControl(
        settings(), repository, instances, lambda: now[0], lambda: "run-1", lambda: "secret-ticket"
    )
    return TestClient(create_multiplayer_app(settings(), service)), repository, instances, now


def ready(repository, instances, now, phase="ready"):
    """Represent a server whose process has independently published a fresh heartbeat."""
    repository.control = {
        "revision": 5, "activeRegion": "eu", "lifecycle": phase,
        "instanceRunId": "run-existing", "processGeneration": "process-1",
        "startedAt": now[0] - 600, "heartbeatAt": now[0],
        "uptimeDeadline": now[0] + 3600, "protocolVersion": 1,
    }
    instances.current["eu"] = "running"


def test_status_is_public_read_only_and_never_starts_ec2():
    client, repository, instances, _now = setup()
    response = client.get("/v1/multiplayer/status")
    assert response.status_code == 200
    assert response.json()["phase"] == "stopped"
    assert response.json()["regions"]["eu"]["hostname"] == "eu.packetloss.test"
    assert response.headers["cache-control"] == "no-store"
    assert instances.started == []
    assert repository.control is None
    assert repository.limits == []


def test_only_verified_owner_can_start_and_capability_does_not_grant_it():
    client, repository, instances, _now = setup()
    for subject, status in ((None, 401), ("friend", 403)):
        headers = {"x-test-user": subject} if subject else {}
        assert client.post(
            "/v1/multiplayer/start", json={"region": "eu"}, headers=headers
        ).status_code == status
    assert client.get(
        "/v1/multiplayer/capabilities", headers={"x-test-user": "friend"}
    ).json() == {"canStart": False}
    assert instances.started == []
    assert repository.control is None
    owner = {"x-test-user": "owner-subject"}
    assert client.get("/v1/multiplayer/capabilities", headers=owner).json() == {"canStart": True}
    response = client.post("/v1/multiplayer/start", json={"region": "eu"}, headers=owner)
    assert response.status_code == 202
    assert response.json() == {"phase": "starting", "region": "eu", "operationId": "run-1"}
    assert instances.started == ["eu"]
    assert instances.reads == 2


@pytest.mark.parametrize("other_state", ["pending", "running", "stopping", "shutting-down"])
def test_regional_switch_requires_previous_real_instance_stopped(other_state):
    client, repository, instances, now = setup()
    ready(repository, instances, now)
    repository.control["lifecycle"] = "stopped"  # A stale lifecycle claim is not sufficient.
    instances.current["eu"] = other_state
    response = client.post(
        "/v1/multiplayer/start", json={"region": "na"}, headers={"x-test-user": "owner-subject"}
    )
    assert response.status_code == 409
    assert instances.started == []
    instances.current["eu"] = "stopped"
    assert client.post(
        "/v1/multiplayer/start", json={"region": "na"}, headers={"x-test-user": "owner-subject"}
    ).status_code == 202
    assert instances.started == ["na"]


def test_conflicting_claim_and_state_change_after_claim_do_not_start():
    client, repository, instances, _now = setup()
    repository.reject_claim = True
    owner = {"x-test-user": "owner-subject"}
    assert client.post(
        "/v1/multiplayer/start", json={"region": "eu"}, headers=owner
    ).status_code == 409
    assert instances.started == []
    repository.reject_claim = False
    instances.reads = 0
    instances.race = True
    assert client.post(
        "/v1/multiplayer/start", json={"region": "eu"}, headers=owner
    ).status_code == 409
    assert instances.started == []
    assert repository.control["lifecycle"] == "failed"


def test_failed_start_keeps_region_fenced_after_timeout():
    client, repository, instances, now = setup()
    instances.fail = True
    owner = {"x-test-user": "owner-subject"}
    assert client.post(
        "/v1/multiplayer/start", json={"region": "eu"}, headers=owner
    ).status_code == 503
    now[0] += 900
    assert client.post(
        "/v1/multiplayer/start", json={"region": "na"}, headers=owner
    ).json()["code"] == "RECONCILIATION_REQUIRED"
    assert instances.started == ["eu"]
    assert repository.control["activeRegion"] == "eu"


def test_fresh_generation_is_required_for_readiness_and_ticket_admission():
    client, repository, instances, now = setup()
    ready(repository, instances, now)
    assert client.get("/v1/multiplayer/status").json()["phase"] == "ready"
    now[0] += 31
    assert client.get("/v1/multiplayer/status").json()["phase"] == "failed"
    response = client.post(
        "/v1/multiplayer/join-credentials", json={"region": "eu", "operation": "create"},
        headers={"x-test-user": "friend"},
    )
    assert response.status_code == 409
    assert repository.tickets == {}


def test_tickets_bind_trusted_profile_identity_generation_region_and_operation():
    client, repository, instances, now = setup()
    ready(repository, instances, now)
    body = {"region": "eu", "operation": "join", "roomCode": "ABCD23"}
    response = client.post(
        "/v1/multiplayer/join-credentials", json=body, headers={"x-test-user": "friend"}
    )
    assert response.status_code == 200
    assert response.json() == {
        "ticket": "secret-ticket", "expiresAt": "2027-01-15T08:01:00Z",
        "websocketUrl": "wss://eu.packetloss.test/ws", "processGeneration": "process-1",
    }
    assert list(repository.tickets.values()) == [{
        "subject": "friend", "nickname": "Trusted player", "avatar": "virus",
        "region": "eu", "instanceRunId": "run-existing", "processGeneration": "process-1",
        "operation": "join", "roomCode": "ABCD23", "issuedAt": now[0], "expiresAt": now[0] + 60,
    }]
    assert repository.profile_reads == ["friend"]
    forged = client.post(
        "/v1/multiplayer/join-credentials", json={**body, "subject": "owner-subject"},
        headers={"x-test-user": "friend"},
    )
    assert forged.status_code == 422


def test_draining_permits_only_reserved_reconnect_credentials():
    client, repository, instances, now = setup()
    ready(repository, instances, now, "draining")
    for operation, status in (("join", 409), ("reconnect", 200)):
        assert client.post(
            "/v1/multiplayer/join-credentials",
            json={"region": "eu", "operation": operation, "roomCode": "ABCD23"},
            headers={"x-test-user": "friend"},
        ).status_code == status


def test_results_are_member_only_and_pending_results_do_not_invent_winners():
    client, repository, _instances, _now = setup()
    repository.matches["match-1"] = {"participants": ["a", "b"], "lifecycle": "started"}
    assert client.get(
        "/v1/multiplayer/matches/match-1", headers={"x-test-user": "stranger"}
    ).status_code == 404
    assert client.get(
        "/v1/multiplayer/matches/match-1", headers={"x-test-user": "a"}
    ).status_code == 409
    result = {
        "matchId": "match-1", "roomId": "room", "region": "eu",
        "startedAt": "2027-01-15T08:00:00Z", "completedAt": "2027-01-15T08:00:30Z",
        "outcome": "aborted", "reason": "server-restart", "standings": [],
    }
    repository.matches["match-1"].update(lifecycle="aborted", result=result)
    response = client.get(
        "/v1/multiplayer/matches/match-1", headers={"x-test-user": "a"}
    )
    assert response.json() == result
    assert "participants" not in response.json()


def test_test_identity_header_is_rejected_in_production():
    config = replace(settings(), stage="prod")
    service = MultiplayerControl(config, MemoryControlRepository(), FakeInstances())
    client = TestClient(create_multiplayer_app(config, service))
    assert client.get(
        "/v1/multiplayer/capabilities", headers={"x-test-user": "owner-subject"}
    ).status_code == 401


def test_oversized_actual_body_is_rejected_without_trusting_content_length():
    client, _repository, instances, _now = setup()
    response = client.post(
        "/v1/multiplayer/start", content=b" " * 4097,
        headers={"x-test-user": "owner-subject", "content-type": "application/json"},
    )
    assert response.status_code == 413
    assert instances.started == []
