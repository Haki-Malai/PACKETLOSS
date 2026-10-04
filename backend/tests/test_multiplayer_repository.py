"""Exercise SDK serialization and conditional writes against an in-process DynamoDB emulator."""

import hashlib

import boto3
import pytest
from moto import mock_aws

from packetloss_api.errors import ApiError
from packetloss_api.multiplayer_models import MatchResult, MultiplayerSettings, RegionSettings
from packetloss_api.multiplayer_repository import DynamoMultiplayerRepository


@pytest.fixture
def repository():
    """Provision isolated emulated tables; no AWS calls or network listeners are used."""
    with mock_aws():
        resource = boto3.resource("dynamodb", region_name="us-east-1")
        for name in ("control", "tickets", "results", "profiles"):
            keys = [{"AttributeName": "pk", "KeyType": "HASH"}]
            attributes = [{"AttributeName": "pk", "AttributeType": "S"}]
            if name == "profiles":
                keys.append({"AttributeName": "sk", "KeyType": "RANGE"})
                attributes.append({"AttributeName": "sk", "AttributeType": "S"})
            resource.create_table(
                TableName=name, KeySchema=keys, AttributeDefinitions=attributes,
                BillingMode="PAY_PER_REQUEST",
            )
        settings = MultiplayerSettings(
            stage="test", control_table="control", tickets_table="tickets", results_table="results",
            profile_table="profiles", control_region="us-east-1", owner_sub="owner",
            site_origin="https://packetloss.test",
            regions={
                "eu": RegionSettings("eu-central-1", "i-eu", "wss://eu.packetloss.test/ws"),
                "na": RegionSettings("us-east-1", "i-na", "wss://na.packetloss.test/ws"),
            },
        )
        yield DynamoMultiplayerRepository(settings, resource)


def ticket(item_overrides=None):
    """Make a room-bound ticket with an independently known expiry boundary."""
    return {
        "subject": "player-a", "nickname": "ALICE", "avatar": "packet", "region": "eu",
        "instanceRunId": "run", "processGeneration": "generation", "operation": "join",
        "roomCode": "ABC234", "issuedAt": 990, "expiresAt": 1050, **(item_overrides or {}),
    }


def publish_ready(repository, **overrides):
    """Publish a current generation that has enough uptime budget to accept tickets."""
    repository.control.put_item(Item={
        "pk": "SERVER", "revision": 1, "lifecycle": "ready", "activeRegion": "eu",
        "instanceId": "i-eu", "instanceRunId": "run", "processGeneration": "generation",
        "heartbeatAt": 1000, "uptimeDeadline": 2000, **overrides,
    })


def test_ticket_secret_is_hashed_and_only_one_connection_can_consume_it(repository):
    publish_ready(repository)
    repository.put_ticket("raw-secret", ticket())
    digest = hashlib.sha256(b"raw-secret").hexdigest()
    stored = repository.tickets.scan()["Items"]
    assert len(stored) == 1
    assert stored[0]["pk"] == digest
    assert "raw-secret" not in repr(stored)
    accepted = repository.consume_ticket("raw-secret", "eu", "run", "generation", 1000)
    assert accepted["subject"] == "player-a"
    assert accepted["operation"] == "join"
    assert accepted["roomCode"] == "ABC234"
    assert repository.tickets.get_item(Key={"pk": digest})["Item"]["used"] is True
    with pytest.raises(ApiError) as failure:
        repository.consume_ticket("raw-secret", "eu", "run", "generation", 1001)
    assert failure.value.code == "INVALID_TICKET"


@pytest.mark.parametrize("overrides", [
    {"expiresAt": 1000}, {"region": "na"}, {"instanceRunId": "old-run"},
    {"processGeneration": "old-process"},
])
def test_expired_or_wrong_generation_ticket_is_not_consumed(repository, overrides):
    publish_ready(repository)
    repository.put_ticket("bad", ticket(overrides))
    with pytest.raises(ApiError) as failure:
        repository.consume_ticket("bad", "eu", "run", "generation", 1000)
    assert failure.value.status_code == 401
    assert repository.tickets.scan()["Items"][0]["used"] is False


@pytest.mark.parametrize("overrides", [
    {"processGeneration": "new-process"}, {"instanceRunId": "new-run"},
    {"activeRegion": "na"}, {"heartbeatAt": 970}, {"uptimeDeadline": 1000},
    {"lifecycle": "stopping"}, {"lifecycle": "draining"},
])
def test_control_transition_atomically_rejects_outstanding_admission(repository, overrides):
    publish_ready(repository, **overrides)
    repository.put_ticket("was-valid", ticket())
    with pytest.raises(ApiError):
        repository.consume_ticket("was-valid", "eu", "run", "generation", 1000)
    assert repository.tickets.scan()["Items"][0]["used"] is False


def test_only_reconnect_ticket_can_be_consumed_while_draining(repository):
    publish_ready(repository, lifecycle="draining")
    repository.put_ticket("reconnect", ticket({"operation": "reconnect"}))
    accepted = repository.consume_ticket("reconnect", "eu", "run", "generation", 1000)
    assert accepted["operation"] == "reconnect"


def test_lifecycle_claim_and_rate_limit_are_conditional_and_never_ttl_the_server(repository):
    assert repository.replace_control(0, {"instanceRunId": "first", "lifecycle": "starting"})
    assert not repository.replace_control(0, {"instanceRunId": "second"})
    assert repository.replace_control(1, {"instanceRunId": "first", "lifecycle": "ready"})
    assert not repository.replace_control(1, {"instanceRunId": "third"})
    repository.limit("ticket:player-a", 2, 60, 1000)
    repository.limit("ticket:player-a", 2, 60, 1000)
    with pytest.raises(ApiError) as failure:
        repository.limit("ticket:player-a", 2, 60, 1000)
    assert failure.value.status_code == 429
    repository.limit("ticket:player-a", 2, 60, 1060)
    assert "expiresAt" not in repository.get_control()


def test_operator_phase_fences_instance_and_process_while_allowing_heartbeat_revisions(repository):
    publish_ready(repository)
    before = repository.get_control()
    repository.control.update_item(
        Key={"pk": "SERVER"}, UpdateExpression="ADD revision :one",
        ExpressionAttributeValues={":one": 1},
    )
    draining = repository.operator_phase(before, "draining", 1000, False)
    assert draining["lifecycle"] == "draining"
    assert draining["revision"] == 3
    repository.control.update_item(
        Key={"pk": "SERVER"}, UpdateExpression="SET processGeneration = :other",
        ExpressionAttributeValues={":other": "replacement"},
    )
    with pytest.raises(ApiError) as failure:
        repository.operator_phase(draining, "stopping", 1001, True)
    assert failure.value.code == "LIFECYCLE_CHANGED"
    assert repository.get_control()["lifecycle"] == "draining"


def match_start():
    """Create an immutable participant roster and generation identity."""
    return {
        "matchId": "match-1", "roomId": "room-1", "region": "eu",
        "instanceRunId": "run", "processGeneration": "generation",
        "participants": ["player-a", "player-b"], "startedAt": "2027-01-15T08:00:00Z",
    }


def completed_result():
    """Two tied scores give both original participants rank one."""
    return MatchResult.model_validate({
        "matchId": "match-1", "roomId": "room-1", "region": "eu",
        "startedAt": "2027-01-15T08:00:00Z", "completedAt": "2027-01-15T08:03:00Z",
        "outcome": "completed", "reason": None,
        "standings": [
            {"playerId": "player-a", "nickname": "ALICE", "color": "#00ffff",
             "score": 500, "rank": 1, "connected": True},
            {"playerId": "player-b", "nickname": "BOB", "color": "#ff00ff",
             "score": 500, "rank": 1, "connected": False},
        ],
    })


def test_match_start_and_result_replay_are_idempotent_but_cannot_replace_winners(repository):
    start = match_start()
    result = completed_result()
    repository.put_match_start(start)
    repository.put_match_start(start)
    repository.finish_match(result, "run", "generation")
    repository.finish_match(result, "run", "generation")
    repository.put_match_start(start)
    stored = repository.get_match("match-1")
    assert stored["lifecycle"] == "completed"
    assert stored["result"] == result.model_dump(mode="json", by_alias=True)
    with pytest.raises(ApiError):
        repository.put_match_start({**start, "participants": ["player-a", "imposter"]})
    aborted = result.model_copy(update={"outcome": "aborted", "reason": "crash", "standings": []})
    with pytest.raises(ApiError):
        repository.finish_match(aborted, "run", "generation")
    assert repository.get_match("match-1")["lifecycle"] == "completed"


def test_result_rejects_wrong_generation_missing_roster_or_winners_on_abort(repository):
    repository.put_match_start(match_start())
    result = completed_result()
    with pytest.raises(ApiError):
        repository.finish_match(result, "run", "old-generation")
    with pytest.raises(ValueError):
        repository.finish_match(
            result.model_copy(update={"standings": result.standings[:1]}), "run", "generation"
        )
    with pytest.raises(ValueError):
        repository.finish_match(
            result.model_copy(update={"outcome": "aborted"}), "run", "generation"
        )
    assert repository.get_match("match-1")["lifecycle"] == "started"
