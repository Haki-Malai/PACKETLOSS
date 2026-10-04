"""Environment-backed API configuration."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    """Runtime settings supplied by the stage's Lambda environment."""

    stage: str
    table_name: str
    user_pool_id: str
    user_pool_client_id: str
    user_pool_client_secret: str
    site_origin: str
    refresh_cookie_name: str
    signup_daily_limit: int
    signup_account_limit: int
    max_payload_bytes: int = 16_384

    @classmethod
    def from_env(cls) -> "Settings":
        """Load required settings from environment variables."""
        return cls(
            stage=os.environ["STAGE"],
            table_name=os.environ["TABLE_NAME"],
            user_pool_id=os.environ["USER_POOL_ID"],
            user_pool_client_id=os.environ["USER_POOL_CLIENT_ID"],
            user_pool_client_secret=os.environ["USER_POOL_CLIENT_SECRET"],
            site_origin=os.environ["SITE_ORIGIN"],
            refresh_cookie_name=os.getenv("REFRESH_COOKIE_NAME", "packetloss_refresh"),
            signup_daily_limit=int(os.getenv("SIGNUP_DAILY_LIMIT", "30")),
            signup_account_limit=int(os.getenv("SIGNUP_ACCOUNT_LIMIT", "1000")),
            max_payload_bytes=int(os.getenv("MAX_PAYLOAD_BYTES", "16384")),
        )
