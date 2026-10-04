"""Exercise the real DynamoDB adapter and SDK serialization without network access."""

import json
from copy import deepcopy
from datetime import UTC, datetime, timedelta

import boto3
from boto3.dynamodb.types import TypeSerializer
from botocore.awsrequest import AWSResponse

from packetloss_api.models import RunRecord
from packetloss_api.repository import DynamoProfileRepository


def dynamodb():
    """Create a real SDK resource with inert credentials for intercepted requests."""
    return boto3.resource(
        "dynamodb",
        region_name="us-east-1",
        aws_access_key_id="test",
        aws_secret_access_key="test",
    )


def test_signup_transactions_serialize_keys_and_counters_once():
    resource = dynamodb()
    transactions = []

    def respond(model, params, **_kwargs):
        """Capture serialized requests and return a reservation for cleanup."""
        body = json.loads(params["body"])
        result = {}
        if model.name == "TransactWriteItems":
            transactions.append(body["TransactItems"])
        elif model.name == "GetItem":
            result = {"Item": {"day": {"S": "2026-09-23"}}}
        else:
            raise AssertionError(model.name)
        return AWSResponse(None, 200, {}, None), result

    resource.meta.client.meta.events.register("before-call.dynamodb.*", respond)
    repository = DynamoProfileRepository("test", resource=resource)
    reservation = repository.reserve_signup("player@example.com", 5, 100)
    repository.release_signup(reservation)

    created, released = transactions
    assert created[0]["Put"]["Item"]["pk"] == {"S": f"SIGNUP#{reservation}"}
    assert created[0]["Put"]["Item"]["sk"] == {"S": "RESERVATION"}
    assert created[1]["Update"]["Key"]["pk"] == {"S": "SYSTEM"}
    assert created[1]["Update"]["ExpressionAttributeValues"][":limit"] == {"N": "5"}
    assert created[2]["Update"]["ExpressionAttributeValues"][":limit"] == {"N": "100"}
    assert released[0]["Delete"]["Key"]["pk"] == {"S": f"SIGNUP#{reservation}"}
    assert released[1]["Update"]["ExpressionAttributeValues"][":minus"] == {"N": "-1"}


def test_pruning_does_not_delete_a_run_added_after_the_retention_read():
    resource = dynamodb()
    serializer = TypeSerializer()
    records = [
        RunRecord(
            id=f"run-{index}",
            completed_at=datetime(2026, 1, 1, tzinfo=UTC) + timedelta(days=index),
            map="default",
            nickname="PLAYER",
            outcome="lost",
            score=1000 - index,
            lives=0,
            elapsed_ms=1000,
            points_collected=1,
            total_points=10,
            levels_cleared=0,
        )
        for index in range(22)
    ]
    items = [
        {
            key: serializer.serialize(value)
            for key, value in {
                "pk": "USER#player",
                "sk": f"RECORD#{record.id}",
                "record": record.model_dump(mode="json", by_alias=True),
            }.items()
        }
        for record in records
    ]
    deleted = []
    queries = 0

    def respond(model, params, **_kwargs):
        """Insert run-21 after the first read, as another uploader could."""
        nonlocal queries
        body = json.loads(params["body"])
        result = {}
        if model.name == "Query":
            queries += 1
            result = {"Items": deepcopy(items[:21] if queries == 1 else items)}
        elif model.name == "BatchWriteItem":
            deleted.extend(
                request["DeleteRequest"]["Key"]["sk"]["S"]
                for request in body["RequestItems"]["test"]
            )
            result = {"UnprocessedItems": {}}
        elif model.name != "PutItem":
            raise AssertionError(model.name)
        return AWSResponse(None, 200, {}, None), result

    resource.meta.client.meta.events.register("before-call.dynamodb.*", respond)
    repository = DynamoProfileRepository("test", resource=resource)
    retained = repository.save_records("player", [records[20]])

    assert len(retained) == 20
    assert deleted == ["RECORD#run-10"]
    assert "run-20" in {record.id for record in retained}
