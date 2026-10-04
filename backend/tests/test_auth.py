"""Cognito adapter contracts without contacting AWS."""

import boto3
import pytest
from botocore.stub import Stubber

from packetloss_api.auth import CognitoAuth
from packetloss_api.config import Settings
from packetloss_api.errors import ApiError


def test_resend_uses_the_confidential_client_and_translates_cognito_throttling():
    client = boto3.client(
        "cognito-idp",
        region_name="us-east-1",
        aws_access_key_id="test",
        aws_secret_access_key="test",
    )
    settings = Settings(
        stage="test",
        table_name="test",
        user_pool_id="pool",
        user_pool_client_id="client",
        user_pool_client_secret="secret",
        site_origin="https://packetloss.test",
        refresh_cookie_name="refresh",
        signup_daily_limit=5,
        signup_account_limit=100,
    )
    auth = CognitoAuth(settings, client=client)
    expected = {
        "ClientId": "client",
        "Username": "player@example.com",
        "SecretHash": "qxFZODIlzYzX3ZY0Qv/HHj/91x73icLXvM24jKlUX9k=",
    }
    with Stubber(client) as stub:
        stub.add_response("resend_confirmation_code", {}, expected)
        stub.add_client_error(
            "resend_confirmation_code",
            "TooManyRequestsException",
            expected_params=expected,
        )
        auth.resend_confirmation("player@example.com")
        with pytest.raises(ApiError) as caught:
            auth.resend_confirmation("player@example.com")
        assert caught.value.status_code == 429
        assert caught.value.code == "RATE_LIMITED"
        assert caught.value.retry_after == 60
        stub.assert_no_pending_responses()
