"""Control-plane configuration and public multiplayer contracts."""

import json
import os
from dataclasses import dataclass
from typing import Literal
from urllib.parse import urlparse

from pydantic import Field, model_validator

from .models import ApiModel

Region = Literal["eu", "na"]
Phase = Literal["stopped", "starting", "ready", "draining", "stopping", "failed"]
Operation = Literal["create", "join", "reconnect"]


@dataclass(frozen=True)
class RegionSettings:
    """One provisioned, normally stopped regional instance."""

    aws_region: str
    instance_id: str
    websocket_url: str


@dataclass(frozen=True)
class MultiplayerSettings:
    """Independent control-Lambda settings, with no Cognito client secret."""

    stage: str
    control_table: str
    tickets_table: str
    results_table: str
    profile_table: str
    control_region: str
    owner_sub: str
    site_origin: str
    regions: dict[Region, RegionSettings]
    heartbeat_max_age: int = 30
    startup_timeout: int = 180
    maximum_uptime: int = 14_400

    @classmethod
    def from_env(cls) -> "MultiplayerSettings":
        """Require both regional targets and an immutable owner subject at startup."""
        raw = json.loads(os.environ["MULTIPLAYER_REGIONS_JSON"])
        if set(raw) != {"eu", "na"}:
            raise ValueError("MULTIPLAYER_REGIONS_JSON must configure eu and na")
        regions: dict[Region, RegionSettings] = {}
        for region in ("eu", "na"):
            value = raw[region]
            parsed = urlparse(value["websocketUrl"])
            if parsed.scheme != "wss" or not parsed.hostname or parsed.username or parsed.password:
                raise ValueError("Regional websocket URLs must use WSS without credentials")
            regions[region] = RegionSettings(
                value["awsRegion"], value["instanceId"], value["websocketUrl"]
            )
        owner = os.environ["MULTIPLAYER_OWNER_SUB"].strip()
        if not owner:
            raise ValueError("MULTIPLAYER_OWNER_SUB must identify one owner")
        return cls(
            stage=os.environ.get("STAGE", "prod"),
            control_table=os.environ["CONTROL_TABLE"],
            tickets_table=os.environ["TICKETS_TABLE"],
            results_table=os.environ["RESULTS_TABLE"],
            profile_table=os.environ["PROFILE_TABLE_NAME"],
            control_region=os.environ.get("MULTIPLAYER_CONTROL_REGION", "us-east-1"),
            owner_sub=owner,
            site_origin=os.environ["SITE_ORIGIN"],
            regions=regions,
        )


class StartRequest(ApiModel):
    """An owner may explicitly select one of the two provisioned regions."""

    region: Region


class JoinRequest(StartRequest):
    """Request a ticket for exactly one room operation."""

    operation: Operation
    room_code: str | None = Field(default=None, pattern=r"^[A-Z2-9]{6}$")

    @model_validator(mode="after")
    def validate_room(self) -> "JoinRequest":
        """Bind join/reconnect to an invite code and forbid a code for creation."""
        if (self.operation == "create") != (self.room_code is None):
            raise ValueError("Join and reconnect require a room code; create does not")
        return self


class RegionalStatus(ApiModel):
    """A state observation; updatedAt is when EC2 was inspected, not a boot time."""

    region: Region
    phase: Phase
    ready: bool
    hostname: str
    updated_at: str


class ServerStatus(ApiModel):
    """Public readiness with no owner identity or server credentials."""

    phase: Phase
    active_region: Region | None
    instance_run_id: str | None
    process_generation: str | None
    websocket_url: str | None
    protocol_version: int | None
    regions: dict[Region, RegionalStatus]


class StartResponse(ApiModel):
    """An asynchronous start acknowledgment keyed to its instance run."""

    phase: Phase
    region: Region
    operation_id: str


class JoinCredential(ApiModel):
    """A short-lived secret returned only to the authenticated caller."""

    ticket: str
    expires_at: str
    websocket_url: str
    process_generation: str


class Standing(ApiModel):
    """One authoritative participant standing, independent of solo records."""

    player_id: str = Field(min_length=1, max_length=128)
    nickname: str = Field(min_length=1, max_length=16)
    color: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")
    score: int = Field(ge=0, le=9_007_199_254_740_991)
    rank: int = Field(ge=1, le=4)
    connected: bool


class MatchResult(ApiModel):
    """The read-only completed or aborted match summary returned to participants."""

    match_id: str = Field(min_length=1, max_length=128)
    room_id: str = Field(min_length=1, max_length=128)
    region: Region
    started_at: str
    completed_at: str | None
    outcome: Literal["completed", "aborted"]
    reason: str | None
    standings: list[Standing] = Field(max_length=4)
