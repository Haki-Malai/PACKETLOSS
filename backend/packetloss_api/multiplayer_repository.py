"""DynamoDB contracts shared by the control Lambda and game-server AWS adapter.

All three multiplayer tables have one string partition key named ``pk``.
Control uses ``SERVER``, tickets use SHA-256 hex digests, and results use match IDs.
Stored timestamps are epoch seconds except ISO timestamps inside result summaries.
"""

import hashlib
from typing import Any, Protocol

import boto3
from botocore.exceptions import ClientError

from .errors import ApiError
from .models import Profile
from .multiplayer_models import MatchResult, MultiplayerSettings, Phase, Region


class MultiplayerRepository(Protocol):
    """Storage operations required by public control requests."""

    def get_control(self) -> dict[str, Any] | None: ...

    def replace_control(self, revision: int, state: dict[str, Any]) -> bool: ...

    def fail_start(self, run_id: str) -> None: ...

    def limit(self, key: str, limit: int, window: int, now: int) -> None: ...

    def get_profile(self, subject: str) -> Profile: ...

    def put_ticket(self, token: str, item: dict[str, Any]) -> None: ...

    def get_match(self, match_id: str) -> dict[str, Any] | None: ...

    def operator_phase(
        self, expected: dict[str, Any], phase: Phase, now: int, force: bool
    ) -> dict[str, Any]: ...


class DynamoMultiplayerRepository:
    """Central strongly consistent state with conditional lifecycle and ticket writes."""

    def __init__(self, settings: MultiplayerSettings, resource: Any | None = None) -> None:
        resource = resource or boto3.resource("dynamodb", region_name=settings.control_region)
        self.client = resource.meta.client
        self.control = resource.Table(settings.control_table)
        self.tickets = resource.Table(settings.tickets_table)
        self.results = resource.Table(settings.results_table)
        self.profiles = resource.Table(settings.profile_table)

    def get_control(self) -> dict[str, Any] | None:
        """Read the latest central ownership record, never a cached regional copy."""
        return self.control.get_item(Key={"pk": "SERVER"}, ConsistentRead=True).get("Item")

    def replace_control(self, revision: int, state: dict[str, Any]) -> bool:
        """Claim one lifecycle revision; concurrent start attempts cannot both succeed."""
        arguments: dict[str, Any] = {
            "Item": {**state, "pk": "SERVER", "revision": revision + 1},
            "ConditionExpression": (
                "attribute_not_exists(pk)" if revision == 0 else "revision = :old"
            ),
        }
        if revision:
            arguments["ExpressionAttributeValues"] = {":old": revision}
        try:
            self.control.put_item(**arguments)
            return True
        except ClientError as error:
            if error.response["Error"]["Code"] != "ConditionalCheckFailedException":
                raise
            return False

    def fail_start(self, run_id: str) -> None:
        """Retain the region reservation after an ambiguous or failed EC2 start."""
        try:
            self.control.update_item(
                Key={"pk": "SERVER"},
                UpdateExpression="SET #phase = :failed ADD revision :one",
                ConditionExpression="instanceRunId = :run AND #phase = :starting",
                ExpressionAttributeNames={"#phase": "lifecycle"},
                ExpressionAttributeValues={
                    ":failed": "failed", ":starting": "starting", ":run": run_id, ":one": 1,
                },
            )
        except ClientError as error:
            if error.response["Error"]["Code"] != "ConditionalCheckFailedException":
                raise

    def operator_phase(
        self, expected: dict[str, Any], phase: Phase, now: int, force: bool
    ) -> dict[str, Any]:
        """Fence an operator transition to the same instance, run, process, and phase."""
        try:
            response = self.control.update_item(
                Key={"pk": "SERVER"},
                UpdateExpression=(
                    "SET #phase = :phase, stopRequestedAt = :now, stopForced = :force "
                    "ADD revision :one"
                ),
                ConditionExpression=(
                    "instanceId = :instance AND instanceRunId = :run "
                    "AND processGeneration = :generation AND activeRegion = :region "
                    "AND #phase = :previous"
                ),
                ExpressionAttributeNames={"#phase": "lifecycle"},
                ExpressionAttributeValues={
                    ":phase": phase, ":now": now, ":force": force, ":one": 1,
                    ":instance": expected["instanceId"], ":run": expected["instanceRunId"],
                    ":generation": expected.get("processGeneration"),
                    ":region": expected["activeRegion"], ":previous": expected["lifecycle"],
                },
                ReturnValues="ALL_NEW",
            )
        except ClientError as error:
            if error.response["Error"]["Code"] != "ConditionalCheckFailedException":
                raise
            raise ApiError(
                409, "LIFECYCLE_CHANGED", "Server ownership changed; inspect again."
            ) from error
        return response["Attributes"]

    def limit(self, key: str, limit: int, window: int, now: int) -> None:
        """Increment one bounded fixed-window counter without exposing subjects in keys."""
        digest = hashlib.sha256(key.encode()).hexdigest()
        try:
            self.control.update_item(
                Key={"pk": f"RATE#{digest}#{now // window}"},
                UpdateExpression="SET expiresAt = :expiry ADD #count :one",
                ConditionExpression="attribute_not_exists(#count) OR #count < :limit",
                ExpressionAttributeNames={"#count": "count"},
                ExpressionAttributeValues={
                    ":expiry": now + 2 * window, ":one": 1, ":limit": limit,
                },
            )
        except ClientError as error:
            if error.response["Error"]["Code"] != "ConditionalCheckFailedException":
                raise
            raise ApiError(429, "RATE_LIMITED", "Try again shortly.", window) from error

    def get_profile(self, subject: str) -> Profile:
        """Read the trusted production account profile without granting write access."""
        item = self.profiles.get_item(
            Key={"pk": f"USER#{subject}", "sk": "PROFILE"}, ConsistentRead=True
        ).get("Item", {})
        return Profile(nickname=item.get("nickname", "PLAYER"), avatar=item.get("avatar", "packet"))

    def put_ticket(self, token: str, item: dict[str, Any]) -> None:
        """Store only the secret's SHA-256 digest, never its plaintext."""
        self.tickets.put_item(
            Item={**item, "pk": hashlib.sha256(token.encode()).hexdigest(), "used": False},
            ConditionExpression="attribute_not_exists(pk)",
        )

    def consume_ticket(
        self, token: str, region: Region, run_id: str, generation: str, now: int
    ) -> dict[str, Any]:
        """Atomically consume a live ticket while its authoritative generation is current.

        Node implements this same transaction before binding its socket identity. It must
        additionally enforce the returned operation and roomCode on subsequent messages.
        A draining server may consume only reconnect tickets for an existing reservation.
        """
        key = {"pk": hashlib.sha256(token.encode()).hexdigest()}
        item = self.tickets.get_item(Key=key, ConsistentRead=True).get("Item")
        if not item:
            raise ApiError(401, "INVALID_TICKET", "The join credential is invalid or expired.")
        allowed = "draining" if item.get("operation") == "reconnect" else "ready"
        try:
            self.client.transact_write_items(TransactItems=[
                {"ConditionCheck": {
                    "TableName": self.control.name,
                    "Key": {"pk": "SERVER"},
                    "ConditionExpression": (
                        "instanceRunId = :run AND processGeneration = :generation "
                        "AND activeRegion = :region AND #phase IN (:ready, :allowed) "
                        "AND heartbeatAt > :fresh AND uptimeDeadline > :now"
                    ),
                    "ExpressionAttributeNames": {"#phase": "lifecycle"},
                    "ExpressionAttributeValues": {
                        ":run": run_id, ":generation": generation, ":region": region,
                        ":ready": "ready", ":allowed": allowed, ":fresh": now - 30, ":now": now,
                    },
                }},
                {"Update": {
                    "TableName": self.tickets.name,
                    "Key": key,
                    "UpdateExpression": "SET #used = :true, consumedAt = :now",
                    "ConditionExpression": (
                        "#used = :false AND expiresAt > :now AND #region = :region "
                        "AND instanceRunId = :run AND processGeneration = :generation"
                    ),
                    "ExpressionAttributeNames": {"#used": "used", "#region": "region"},
                    "ExpressionAttributeValues": {
                        ":true": True, ":false": False, ":now": now, ":region": region,
                        ":run": run_id, ":generation": generation,
                    },
                }},
            ])
        except ClientError as error:
            if error.response["Error"]["Code"] != "TransactionCanceledException":
                raise
            raise ApiError(
                401, "INVALID_TICKET", "The join credential is invalid or expired."
            ) from error
        return item

    def get_match(self, match_id: str) -> dict[str, Any] | None:
        """Load one authoritative result record with its private participant list."""
        return self.results.get_item(Key={"pk": match_id}, ConsistentRead=True).get("Item")

    def put_match_start(self, item: dict[str, Any]) -> None:
        """Idempotently register the immutable roster before a countdown is announced."""
        identity = ("matchId", "roomId", "region", "instanceRunId", "processGeneration",
                    "participants", "startedAt")
        record = {key: item[key] for key in identity}
        participants = record["participants"]
        if not isinstance(participants, list) or not (
            2 <= len(set(participants)) == len(participants) <= 4
        ):
            raise ValueError("A match must have two to four unique authenticated participants")
        try:
            self.results.put_item(
                Item={**record, "pk": record["matchId"], "lifecycle": "started"},
                ConditionExpression="attribute_not_exists(pk)",
            )
        except ClientError as error:
            if error.response["Error"]["Code"] != "ConditionalCheckFailedException":
                raise
            existing = self.get_match(record["matchId"])
            if not existing or any(existing.get(key) != record[key] for key in identity):
                raise ApiError(
                    409, "MATCH_CONFLICT", "The match identity already exists."
                ) from error

    def finish_match(self, result: MatchResult, run_id: str, generation: str) -> None:
        """Persist one immutable outcome; durable-outbox replays may repeat the same result."""
        existing = self.get_match(result.match_id)
        summary = result.model_dump(mode="json", by_alias=True)
        if not existing or (
            existing.get("instanceRunId") != run_id
            or existing.get("processGeneration") != generation
            or existing.get("roomId") != result.room_id
            or existing.get("region") != result.region
            or existing.get("startedAt") != result.started_at
        ):
            raise ApiError(409, "MATCH_CONFLICT", "The match identity does not match.")
        players = [entry.player_id for entry in result.standings]
        if result.outcome == "completed" and (
            set(players) != set(existing["participants"]) or len(players) != len(set(players))
        ):
            raise ValueError("Completed standings must contain the immutable participant roster")
        if result.outcome == "aborted" and result.standings:
            raise ValueError("Aborted matches cannot declare winners")
        try:
            self.results.update_item(
                Key={"pk": result.match_id},
                UpdateExpression="SET #phase = :outcome, #result = :result",
                ConditionExpression=(
                    "#phase = :started AND instanceRunId = :run AND processGeneration = :generation"
                ),
                ExpressionAttributeNames={"#phase": "lifecycle", "#result": "result"},
                ExpressionAttributeValues={
                    ":outcome": result.outcome, ":result": summary, ":started": "started",
                    ":run": run_id, ":generation": generation,
                },
            )
        except ClientError as error:
            if error.response["Error"]["Code"] != "ConditionalCheckFailedException":
                raise
            current = self.get_match(result.match_id)
            if not current or current.get("result") != summary:
                raise ApiError(
                    409, "MATCH_CONFLICT", "The match already has a final outcome."
                ) from error
