"""DynamoDB Local composition using the production profile and multiplayer repositories."""

from __future__ import annotations

import hashlib
import time
from collections.abc import Callable
from typing import Any
from urllib.parse import urlparse

import boto3
from botocore.exceptions import ClientError

from .errors import ApiError
from .models import Profile
from .multiplayer_models import MatchResult, MultiplayerSettings, Region, RegionSettings
from .multiplayer_repository import DynamoMultiplayerRepository
from .repository import DynamoProfileRepository

PROFILE_TABLE = "packetloss-local-profiles"
AUTH_TABLE = "packetloss-local-auth"
CONTROL_TABLE = "packetloss-local-control"
TICKETS_TABLE = "packetloss-local-tickets"
RESULTS_TABLE = "packetloss-local-results"


def local_resource(endpoint: str) -> Any:
    """Never use ambient AWS credentials or a production endpoint in development."""
    parsed = urlparse(endpoint)
    if (
        parsed.scheme != "http"
        or parsed.hostname not in {"dynamodb", "localhost", "127.0.0.1"}
        or parsed.username or parsed.password or parsed.path not in {"", "/"}
    ):
        raise ValueError("DynamoDB development endpoint must be local")
    return boto3.resource(
        "dynamodb", endpoint_url=endpoint, region_name="us-east-1",
        aws_access_key_id="local", aws_secret_access_key="local",
    )


def multiplayer_settings(origin: str, websocket_url: str) -> MultiplayerSettings:
    """Use isolated local tables and logical regions with no EC2 credentials."""
    return MultiplayerSettings(
        stage="development", control_table=CONTROL_TABLE, tickets_table=TICKETS_TABLE,
        results_table=RESULTS_TABLE, profile_table=PROFILE_TABLE, control_region="us-east-1",
        owner_sub="dev-owner", site_origin=origin,
        regions={
            "eu": RegionSettings("local", "local-eu", websocket_url),
            "na": RegionSettings("local", "local-na", websocket_url),
        },
    )


def initialize_database(resource: Any) -> None:
    """Create production-shaped tables once, retaining all existing local data."""
    existing = set(resource.meta.client.list_tables()["TableNames"])
    for name in (PROFILE_TABLE, AUTH_TABLE, CONTROL_TABLE, TICKETS_TABLE, RESULTS_TABLE):
        if name in existing:
            continue
        keys = [{"AttributeName": "pk", "KeyType": "HASH"}]
        if name == PROFILE_TABLE:
            keys.append({"AttributeName": "sk", "KeyType": "RANGE"})
        resource.create_table(
            TableName=name, KeySchema=keys, BillingMode="PAY_PER_REQUEST",
            AttributeDefinitions=[
                {"AttributeName": key["AttributeName"], "AttributeType": "S"} for key in keys
            ],
        ).wait_until_exists()


class LocalRepository(DynamoProfileRepository, DynamoMultiplayerRepository):
    """Reuse real DynamoDB transactions; add only local identities and runtime control."""

    def __init__(self, endpoint: str, clock: Callable[[], float] = time.time) -> None:
        resource = local_resource(endpoint)
        DynamoProfileRepository.__init__(self, PROFILE_TABLE, resource)
        DynamoMultiplayerRepository.__init__(
            self, multiplayer_settings("http://127.0.0.1:5173", "ws://127.0.0.1:8080/ws"),
            resource,
        )
        self.auth = resource.Table(AUTH_TABLE)
        self.clock = clock

    def seed_identity(self, subject: str, email: str, salt: bytes,
                      password_hash: bytes, profile: Profile) -> None:
        """Seed a confirmed identity without resetting existing passwords or profiles."""
        if self.identity_for_subject(subject):
            return
        try:
            self.create_identity(subject, email, salt, password_hash, None)
        except ApiError as error:
            if error.code != "ACCOUNT_EXISTS":
                raise
            return
        self.put_profile(subject, profile)

    def create_identity(self, subject: str, email: str, salt: bytes,
                        password_hash: bytes, confirmation_code: str | None) -> None:
        """Atomically reserve the email and insert the local identity."""
        item = {
            "pk": f"USER#{subject}", "subject": subject, "email": email,
            "password_salt": salt, "password_hash": password_hash,
            "confirmed": confirmation_code is None, "confirmation_code": confirmation_code,
            "reset_code": None, "session_version": 0,
        }
        try:
            self.client.transact_write_items(TransactItems=[
                {"Put": {"TableName": self.auth.name, "Item": item,
                         "ConditionExpression": "attribute_not_exists(pk)"}},
                {"Put": {"TableName": self.auth.name,
                         "Item": {"pk": f"EMAIL#{email}", "subject": subject},
                         "ConditionExpression": "attribute_not_exists(pk)"}},
            ])
        except ClientError as error:
            if error.response["Error"]["Code"] != "TransactionCanceledException":
                raise
            raise ApiError(409, "ACCOUNT_EXISTS", "An account already exists.") from error

    def identity_for_email(self, email: str) -> dict[str, Any] | None:
        """Resolve an email through its unique local identity mapping."""
        item = self.auth.get_item(Key={"pk": f"EMAIL#{email}"}, ConsistentRead=True).get("Item")
        return self.identity_for_subject(item["subject"]) if item else None

    def identity_for_subject(self, subject: str) -> dict[str, Any] | None:
        """Read local identity material, converting DynamoDB binary wrappers to bytes."""
        item = self.auth.get_item(Key={"pk": f"USER#{subject}"}, ConsistentRead=True).get("Item")
        if item:
            for field in ("password_salt", "password_hash"):
                item[field] = bytes(item[field])
        return item

    def _change_identity(self, email: str, expression: str, values: dict[str, Any],
                         condition: str = "attribute_exists(pk)") -> None:
        """Apply one conditional identity change without creating missing users."""
        identity = self.identity_for_email(email)
        if not identity:
            raise ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.")
        try:
            self.auth.update_item(
                Key={"pk": f"USER#{identity['subject']}"}, UpdateExpression=expression,
                ConditionExpression=condition, ExpressionAttributeValues=values,
            )
        except ClientError as error:
            if error.response["Error"]["Code"] != "ConditionalCheckFailedException":
                raise
            raise ApiError(400, "INVALID_CODE", "The confirmation code is invalid.") from error

    def confirm_identity(self, email: str, code: str) -> None:
        """Consume the confirmation code exactly once."""
        self._change_identity(
            email, "SET confirmed = :yes REMOVE confirmation_code", {":yes": True, ":code": code},
            "confirmation_code = :code",
        )

    def set_confirmation_code(self, email: str, code: str) -> None:
        """Replace the fixed code only for an unconfirmed account."""
        self._change_identity(email, "SET confirmation_code = :code",
                              {":code": code, ":no": False}, "confirmed = :no")

    def set_reset_code(self, email: str, code: str) -> None:
        """Set the development recovery code for an existing account."""
        self._change_identity(email, "SET reset_code = :code", {":code": code})

    def replace_password(self, email: str, code: str, salt: bytes, password_hash: bytes) -> None:
        """Consume the reset code and invalidate all earlier refresh sessions atomically."""
        self._change_identity(
            email,
            "SET password_salt = :salt, password_hash = :hash "
            "REMOVE reset_code ADD session_version :one",
            {":salt": salt, ":hash": password_hash, ":one": 1, ":code": code},
            "reset_code = :code",
        )

    def put_refresh_session(self, token_hash: str, subject: str, expires_at: int) -> None:
        """Store an opaque token's digest bound to the account's current session version."""
        identity = self.identity_for_subject(subject)
        self.auth.put_item(Item={
            "pk": f"REFRESH#{token_hash}", "subject": subject, "expiresAt": expires_at,
            "session_version": identity["session_version"],
        })

    def refresh_subject(self, token_hash: str, now: int) -> str | None:
        """Resolve only live sessions that predate no password reset."""
        item = self.auth.get_item(
            Key={"pk": f"REFRESH#{token_hash}"}, ConsistentRead=True,
        ).get("Item")
        if not item or item["expiresAt"] <= now:
            return None
        identity = self.identity_for_subject(item["subject"])
        if not identity or identity["session_version"] != item["session_version"]:
            return None
        return item["subject"]

    def revoke_refresh_session(self, token_hash: str) -> None:
        """Revoke one browser session."""
        self.auth.delete_item(Key={"pk": f"REFRESH#{token_hash}"})

    def reserve_signup(self, email: str, daily_limit: int, account_limit: int) -> str:
        """Local signups have no quota; duplicate emails still return a real conflict."""
        if self.identity_for_email(email):
            raise ApiError(409, "ACCOUNT_EXISTS", "An account already exists.")
        return hashlib.sha256(email.encode()).hexdigest()

    def release_signup(self, reservation: str) -> None:
        """Local signup does not reserve paid-service capacity."""

    def limit(self, key: str, limit: int, window: int, now: int) -> None:
        """Disable HTTP control cooldowns locally; WebSocket input limits remain enforced."""

    def reset_runtime(self, run_id: str, generation: str, now: int) -> None:
        """Called by bootstrap once per stack launch, never by a Lambda cold start."""
        old = self.get_control() or {}
        self.replace_control(int(old.get("revision", 0)), {
            "activeRegion": "eu", "instanceId": "local-eu", "instanceRunId": run_id,
            "processGeneration": generation, "lifecycle": "starting", "startedAt": now,
            "heartbeatAt": 0, "uptimeDeadline": now + 7 * 24 * 3600, "protocolVersion": 1,
        })

    def instance_states(self) -> dict[Region, str]:
        """The local game process starts with Compose; no owner wake-up is needed."""
        return {"eu": "running", "na": "stopped"}

    def start_instance(self, region: Region) -> None:
        """There are no EC2 instances in local development."""

    def register_process(self, run_id: str, generation: str) -> bool:
        """CAS-register a replacement after its predecessor exits, retaining the run deadline."""
        current = self.get_control() or {}
        if current.get("instanceRunId") != run_id:
            return False
        if current.get("processGeneration") == generation:
            return True
        current.update(
            processGeneration=generation, lifecycle="starting", heartbeatAt=0,
            activeMatches=0, connectedPlayers=0, pendingResults=0, rooms=0,
        )
        return self.replace_control(int(current["revision"]), current)

    def heartbeat(self, run_id: str, generation: str,
                  status: dict[str, Any], now: int) -> bool:
        """Publish generation-fenced readiness without changing match state."""
        current = self.get_control() or {}
        if (current.get("instanceRunId") != run_id
                or current.get("processGeneration") != generation):
            return False
        current.update(
            lifecycle="draining" if status["draining"] else "ready", heartbeatAt=now,
            activeMatches=status["activeMatches"], connectedPlayers=status["connectedPlayers"],
            pendingResults=status["pendingResults"], rooms=status["rooms"],
        )
        return self.replace_control(int(current["revision"]), current)

    def consume_ticket(self, token: str, run_id: str, generation: str, now: int,
                       heartbeat_max_age: int = 30) -> dict[str, Any] | None:
        """Use the production atomic generation check and single-use ticket transaction."""
        try:
            return DynamoMultiplayerRepository.consume_ticket(
                self, token, "eu", run_id, generation, now,
            )
        except ApiError as error:
            if error.code != "INVALID_TICKET":
                raise
            return None

    def put_match_start(self, match_id: str, room_id: str, run_id: str, generation: str,
                        participants: list[str], started_at: str) -> None:
        """Replay registered starts; reject an orphan from an older process generation."""
        existing = self.get_match(match_id)
        control = self.get_control() or {}
        if not existing and (
            control.get("instanceRunId") != run_id
            or control.get("processGeneration") != generation
            or control.get("lifecycle") not in {"ready", "draining"}
        ):
            raise ApiError(404, "MATCH_START_NOT_FOUND", "The old match was not registered.")
        try:
            DynamoMultiplayerRepository.put_match_start(self, {
                "matchId": match_id, "roomId": room_id, "instanceRunId": run_id,
                "processGeneration": generation, "participants": participants,
                "startedAt": started_at, "region": existing["region"] if existing else "eu",
            })
        except ValueError as error:
            raise ApiError(422, "INVALID_REQUEST", str(error)) from error

    def finish_match(self, run_id: str, generation: str,
                     result_without_region: dict[str, Any]) -> MatchResult:
        """Persist the production immutable terminal summary in its own results table."""
        existing = self.get_match(result_without_region["matchId"])
        if not existing:
            raise ApiError(409, "MATCH_CONFLICT", "The match identity does not match.")
        result = MatchResult.model_validate({**result_without_region, "region": existing["region"]})
        try:
            DynamoMultiplayerRepository.finish_match(self, result, run_id, generation)
        except ValueError as error:
            raise ApiError(422, "INVALID_REQUEST", str(error)) from error
        return result
