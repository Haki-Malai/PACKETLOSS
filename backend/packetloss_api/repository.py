"""DynamoDB persistence for profiles, records, and signup admission."""

import hashlib
from collections.abc import Iterable
from datetime import UTC, datetime, timedelta
from typing import Any, Protocol

import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

from .errors import ApiError
from .models import Profile, RunRecord


def retain_records(records: Iterable[RunRecord]) -> list[RunRecord]:
    """Keep the union of top ten and recent ten records for every map and mode."""
    by_id = {record.id: record for record in records}
    retained: dict[str, RunRecord] = {}
    for map_name, mode in (("default", "classic"), ("demo", "classic"), ("default", "endless")):
        group = [
            record for record in by_id.values() if record.map == map_name and record.mode == mode
        ]
        best = sorted(
            group,
            key=lambda record: (-record.score, -record.completed_at.timestamp()),
        )[:10]
        recent = sorted(group, key=lambda record: record.completed_at, reverse=True)[:10]
        for record in [*best, *recent]:
            retained.setdefault(record.id, record)
    return sorted(retained.values(), key=lambda record: record.completed_at, reverse=True)


class ProfileRepository(Protocol):
    """Persistence operations consumed by the HTTP layer."""

    def reserve_signup(self, email: str, daily_limit: int, account_limit: int) -> str: ...

    def release_signup(self, reservation: str) -> None: ...

    def put_profile(self, subject: str, profile: Profile) -> None: ...

    def get_profile(self, subject: str) -> Profile: ...

    def update_profile(self, subject: str, profile: Profile) -> Profile: ...

    def get_records(self, subject: str) -> list[RunRecord]: ...

    def save_records(self, subject: str, records: list[RunRecord]) -> list[RunRecord]: ...

    def clear_records(self, subject: str) -> None: ...


class DynamoProfileRepository:
    """Single-table DynamoDB implementation with bounded per-account history."""

    def __init__(
        self,
        table_name: str,
        resource: Any | None = None,
        client: Any | None = None,
    ) -> None:
        resource = resource or boto3.resource("dynamodb")
        self.table = resource.Table(table_name)
        self.client = client or resource.meta.client
        self.table_name = table_name

    def reserve_signup(self, email: str, daily_limit: int, account_limit: int) -> str:
        """Atomically reserve one daily and lifetime signup slot for an email."""
        reservation = hashlib.sha256(email.strip().lower().encode()).hexdigest()
        today = datetime.now(UTC).date().isoformat()
        expiry = int((datetime.now(UTC) + timedelta(days=3)).timestamp())
        try:
            self.client.transact_write_items(
                TransactItems=[
                    {
                        "Put": {
                            "TableName": self.table_name,
                            "Item": {
                                "pk": f"SIGNUP#{reservation}",
                                "sk": "RESERVATION",
                                "day": today,
                            },
                            "ConditionExpression": "attribute_not_exists(pk)",
                        }
                    },
                    self._counter_update(f"SIGNUPS#{today}", daily_limit, expiry),
                    self._counter_update("SIGNUPS#TOTAL", account_limit),
                ]
            )
        except ClientError as error:
            code = error.response.get("Error", {}).get("Code")
            if code in {"TransactionCanceledException", "ConditionalCheckFailedException"}:
                raise ApiError(
                    429,
                    "REGISTRATION_FULL",
                    "Registration is full for now. Try again later.",
                    3600,
                ) from error
            self._raise_storage_error(error)
        return reservation

    def release_signup(self, reservation: str) -> None:
        """Release counters when Cognito rejects a reserved signup."""
        try:
            response = self.table.get_item(
                Key={"pk": f"SIGNUP#{reservation}", "sk": "RESERVATION"},
                ConsistentRead=True,
            )
            day = response.get("Item", {}).get("day")
            if not isinstance(day, str):
                return
            self.client.transact_write_items(
                TransactItems=[
                    {
                        "Delete": {
                            "TableName": self.table_name,
                            "Key": {
                                "pk": f"SIGNUP#{reservation}",
                                "sk": "RESERVATION",
                            },
                            "ConditionExpression": "attribute_exists(pk)",
                        }
                    },
                    self._counter_decrement(f"SIGNUPS#{day}"),
                    self._counter_decrement("SIGNUPS#TOTAL"),
                ]
            )
        except ClientError:
            # A failed cleanup must not hide the original Cognito error.
            return

    def put_profile(self, subject: str, profile: Profile) -> None:
        """Create or replace a player's profile."""
        self._put(
            {
                "pk": self._user_key(subject),
                "sk": "PROFILE",
                **profile.model_dump(mode="json", by_alias=True),
            }
        )

    def get_profile(self, subject: str) -> Profile:
        """Load a profile, creating the default if the user predates profile storage."""
        try:
            item = self.table.get_item(
                Key={"pk": self._user_key(subject), "sk": "PROFILE"},
                ConsistentRead=True,
            ).get("Item")
        except ClientError as error:
            self._raise_storage_error(error)
        if item:
            return Profile.model_validate(
                {"nickname": item.get("nickname"), "avatar": item.get("avatar")}
            )
        profile = Profile(nickname="PLAYER")
        self.put_profile(subject, profile)
        return profile

    def update_profile(self, subject: str, profile: Profile) -> Profile:
        """Persist a complete validated profile replacement."""
        self.put_profile(subject, profile)
        return profile

    def get_records(self, subject: str) -> list[RunRecord]:
        """Load the bounded retained record set for one account."""
        return retain_records(self._load_records(subject))

    def _load_records(self, subject: str) -> list[RunRecord]:
        """Read records once so retention and pruning use the same observed items."""
        try:
            response = self.table.query(
                KeyConditionExpression=Key("pk").eq(self._user_key(subject)),
                ConsistentRead=True,
            )
        except ClientError as error:
            self._raise_storage_error(error)
        return [
            RunRecord.model_validate(item["record"])
            for item in response.get("Items", [])
            if str(item.get("sk", "")).startswith("RECORD#")
        ]

    def save_records(self, subject: str, records: list[RunRecord]) -> list[RunRecord]:
        """Idempotently store records and prune anything outside the retention policy."""
        user_key = self._user_key(subject)
        for record in records:
            try:
                self.table.put_item(
                    Item={
                        "pk": user_key,
                        "sk": f"RECORD#{record.id}",
                        "record": record.model_dump(mode="json", by_alias=True),
                    },
                    ConditionExpression="attribute_not_exists(sk)",
                )
            except ClientError as error:
                if error.response.get("Error", {}).get("Code") != "ConditionalCheckFailedException":
                    self._raise_storage_error(error)
        snapshot = self._load_records(subject)
        retained = retain_records(snapshot)
        keep = {record.id for record in retained}
        try:
            # Records are immutable by ID. Concurrent additions cannot improve the rank of
            # an obsolete record; never delete an item absent from this retention snapshot.
            obsolete = [record for record in snapshot if record.id not in keep]
            if obsolete:
                with self.table.batch_writer() as batch:
                    for record in obsolete:
                        batch.delete_item(Key={"pk": user_key, "sk": f"RECORD#{record.id}"})
        except ClientError as error:
            self._raise_storage_error(error)
        return retained

    def clear_records(self, subject: str) -> None:
        """Delete every retained record while preserving the player's profile."""
        user_key = self._user_key(subject)
        try:
            response = self.table.query(
                KeyConditionExpression=Key("pk").eq(user_key),
                ProjectionExpression="pk, sk",
                ConsistentRead=True,
            )
            with self.table.batch_writer() as batch:
                for item in response.get("Items", []):
                    if str(item.get("sk", "")).startswith("RECORD#"):
                        batch.delete_item(Key={"pk": item["pk"], "sk": item["sk"]})
        except ClientError as error:
            self._raise_storage_error(error)

    def _put(self, item: dict[str, Any]) -> None:
        """Write one item and translate capacity failures."""
        try:
            self.table.put_item(Item=item)
        except ClientError as error:
            self._raise_storage_error(error)

    @staticmethod
    def _user_key(subject: str) -> str:
        """Build the isolated DynamoDB partition key for an account."""
        return f"USER#{subject}"

    def _counter_update(self, key: str, limit: int, expiry: int | None = None) -> dict[str, Any]:
        """Build one bounded transactional counter update."""
        expression = "SET #count = if_not_exists(#count, :zero) + :one"
        values = {":zero": 0, ":one": 1, ":limit": limit}
        names = {"#count": "count"}
        if expiry is not None:
            expression += ", #expires = :expires"
            values[":expires"] = expiry
            names["#expires"] = "expires_at"
        return {
            "Update": {
                "TableName": self.table_name,
                "Key": {"pk": "SYSTEM", "sk": key},
                "UpdateExpression": expression,
                "ConditionExpression": "attribute_not_exists(#count) OR #count < :limit",
                "ExpressionAttributeNames": names,
                "ExpressionAttributeValues": values,
            }
        }

    def _counter_decrement(self, key: str) -> dict[str, Any]:
        """Build a guarded transactional counter decrement."""
        return {
            "Update": {
                "TableName": self.table_name,
                "Key": {"pk": "SYSTEM", "sk": key},
                "UpdateExpression": "ADD #count :minus",
                "ConditionExpression": "#count > :zero",
                "ExpressionAttributeNames": {"#count": "count"},
                "ExpressionAttributeValues": {":minus": -1, ":zero": 0},
            }
        }

    @staticmethod
    def _raise_storage_error(error: ClientError) -> None:
        """Translate DynamoDB failures into a stable retryable response."""
        code = error.response.get("Error", {}).get("Code")
        if code in {
            "ProvisionedThroughputExceededException",
            "RequestLimitExceeded",
            "ThrottlingException",
        }:
            raise ApiError(
                503, "SAVE_UNAVAILABLE", "Cloud saving is busy. Try again.", 10
            ) from error
        raise ApiError(
            503,
            "SAVE_UNAVAILABLE",
            "Cloud saving is temporarily unavailable.",
            30,
        ) from error
