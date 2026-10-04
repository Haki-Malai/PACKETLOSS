"""Single-active-region startup and authenticated join-credential service."""

import secrets
import time
import uuid
from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any, Protocol
from urllib.parse import urlparse

import boto3
from botocore.config import Config

from .errors import ApiError
from .multiplayer_models import (
    JoinCredential,
    JoinRequest,
    MatchResult,
    MultiplayerSettings,
    Phase,
    Region,
    RegionalStatus,
    ServerStatus,
    StartResponse,
)
from .multiplayer_repository import MultiplayerRepository


def iso_time(timestamp: int) -> str:
    """Render epoch seconds as the public API's UTC timestamp."""
    return datetime.fromtimestamp(timestamp, UTC).isoformat().replace("+00:00", "Z")


class InstanceGateway(Protocol):
    """EC2 operations permitted to the startup service; no stop or terminate operation."""

    def states(self) -> dict[Region, str]: ...

    def start(self, region: Region) -> None: ...


class Ec2Instances:
    """Inspect both real regional instances before starting either one."""

    def __init__(self, settings: MultiplayerSettings, clients: dict[Region, Any] | None = None):
        self.settings = settings
        self.clients = clients or {
            region: boto3.client(
                "ec2", region_name=target.aws_region,
                config=Config(connect_timeout=2, read_timeout=3, retries={"max_attempts": 1}),
            )
            for region, target in settings.regions.items()
        }

    def states(self) -> dict[Region, str]:
        """Fail closed when a configured instance cannot be authoritatively inspected."""
        states: dict[Region, str] = {}
        for region, target in self.settings.regions.items():
            response = self.clients[region].describe_instances(InstanceIds=[target.instance_id])
            instances = [
                instance for reservation in response.get("Reservations", [])
                for instance in reservation.get("Instances", [])
                if instance.get("InstanceId") == target.instance_id
            ]
            if len(instances) != 1:
                raise ApiError(503, "CONTROL_UNAVAILABLE", "Server status is unavailable.", 15)
            states[region] = instances[0]["State"]["Name"]
        return states

    def start(self, region: Region) -> None:
        """Start exactly the configured instance; credentials cannot select arbitrary IDs."""
        self.clients[region].start_instances(
            InstanceIds=[self.settings.regions[region].instance_id]
        )


class MultiplayerControl:
    """Coordinate public requests through one central, conditionally updated record."""

    def __init__(
        self,
        settings: MultiplayerSettings,
        repository: MultiplayerRepository,
        instances: InstanceGateway,
        clock: Callable[[], float] = time.time,
        new_run_id: Callable[[], str] = lambda: str(uuid.uuid4()),
        new_ticket: Callable[[], str] = lambda: secrets.token_urlsafe(32),
    ):
        self.settings = settings
        self.repository = repository
        self.instances = instances
        self.clock = clock
        self.new_run_id = new_run_id
        self.new_ticket = new_ticket

    def capabilities(self, subject: str) -> dict[str, bool]:
        """Reveal an owner capability without exposing the configured owner's identity."""
        return {"canStart": subject == self.settings.owner_sub}

    def status(self) -> ServerStatus:
        """Inspect readiness only; this path never writes state or starts an instance."""
        return self._status(
            self.instances.states(), self.repository.get_control(), int(self.clock())
        )

    def _status(
        self, states: dict[Region, str], control: dict[str, Any] | None, now: int
    ) -> ServerStatus:
        """Combine real EC2 state with generation-bound service readiness."""
        record = control or {}
        phases: dict[Region, Phase] = {}
        active = [region for region, state in states.items() if state != "stopped"]
        for region, state in states.items():
            phase: Phase = {
                "stopped": "stopped", "pending": "starting", "running": "starting",
                "stopping": "stopping",
            }.get(state, "failed")
            if record.get("activeRegion") == region:
                lifecycle = record.get("lifecycle")
                fresh = (
                    bool(record.get("processGeneration"))
                    and record.get("heartbeatAt", 0) > now - self.settings.heartbeat_max_age
                    and record.get("uptimeDeadline", 0) > now
                    and record.get("protocolVersion") == 1
                )
                if state == "running":
                    if lifecycle == "draining":
                        phase = "draining" if fresh else "failed"
                    elif lifecycle == "stopping":
                        phase = "stopping"
                    elif lifecycle == "ready" and fresh:
                        phase = "ready"
                    elif lifecycle == "failed" or (
                        now - record.get("startedAt", 0) >= self.settings.startup_timeout
                    ):
                        phase = "failed"
                elif state == "stopped" and lifecycle in {"starting", "failed"}:
                    phase = "starting" if (
                        lifecycle == "starting"
                        and now - record.get("startedAt", 0) < self.settings.startup_timeout
                    ) else "failed"
            elif state == "running":
                phase = "failed"
            phases[region] = phase
        region: Region | None = active[0] if len(active) == 1 else None
        if not active and record.get("lifecycle") in {"starting", "failed"}:
            region = record.get("activeRegion")
        phase = phases[region] if region else "stopped"
        if len(active) > 1:
            phase = "failed"
            phases = {key: "failed" if key in active else value for key, value in phases.items()}
        belongs = region is not None and record.get("activeRegion") == region
        return ServerStatus(
            phase=phase,
            active_region=region,
            instance_run_id=record.get("instanceRunId") if belongs else None,
            process_generation=record.get("processGeneration") if belongs else None,
            websocket_url=self.settings.regions[region].websocket_url if region else None,
            protocol_version=record.get("protocolVersion") if belongs else None,
            regions={
                key: RegionalStatus(
                    region=key, phase=value, ready=value == "ready",
                    hostname=urlparse(self.settings.regions[key].websocket_url).hostname or "",
                    updated_at=iso_time(now),
                ) for key, value in phases.items()
            },
        )

    def start(self, subject: str, region: Region) -> StartResponse:
        """Fence regional startup until both previous real instances are confirmed stopped.

        An ambiguous initial start stays pinned to its region. A stale timeout does not
        release that reservation: a delayed AWS request may still have been accepted.
        Operations may explicitly reconcile it through their reviewed stop workflow.
        """
        if subject != self.settings.owner_sub:
            raise ApiError(403, "OWNER_REQUIRED", "Only the server owner can start multiplayer.")
        now = int(self.clock())
        states = self.instances.states()
        previous = self.repository.get_control()
        status = self._status(states, previous, now)
        other = "na" if region == "eu" else "eu"
        if states[other] != "stopped":
            raise ApiError(409, "REGION_ACTIVE", "Wait for the other region to stop.")
        if states[region] in {"pending", "running"}:
            if not previous or previous.get("activeRegion") != region:
                raise ApiError(
                    409, "RECONCILIATION_REQUIRED", "The running server needs inspection."
                )
            return StartResponse(
                phase=status.phase, region=region, operation_id=previous["instanceRunId"]
            )
        if states[region] != "stopped":
            raise ApiError(409, "SERVER_STOPPING", "Wait for the server to finish stopping.")
        if previous and previous.get("lifecycle") in {"starting", "failed"}:
            if previous.get("activeRegion") != region and not previous.get("processGeneration"):
                raise ApiError(
                    409, "RECONCILIATION_REQUIRED", "The previous start needs inspection."
                )
            if previous.get("lifecycle") == "starting" and (
                now - previous.get("startedAt", 0) < self.settings.startup_timeout
            ):
                raise ApiError(409, "START_PENDING", "A server start is already pending.", 15)
        self.repository.limit(f"start:{subject}", 1, 60, now)
        run_id = self.new_run_id()
        state = {
            "lifecycle": "starting", "activeRegion": region, "instanceRunId": run_id,
            "instanceId": self.settings.regions[region].instance_id,
            "processGeneration": None, "startedAt": now,
            "uptimeDeadline": now + self.settings.maximum_uptime,
            "heartbeatAt": 0, "protocolVersion": 1,
        }
        revision = int(previous.get("revision", 0)) if previous else 0
        if not self.repository.replace_control(revision, state):
            raise ApiError(409, "START_PENDING", "Another lifecycle operation is in progress.", 15)
        try:
            # Recheck actual state after winning the central claim, including manual operations.
            confirmed = self.instances.states()
            if any(value != "stopped" for value in confirmed.values()):
                raise ApiError(
                    409, "RECONCILIATION_REQUIRED", "Instance state changed during start."
                )
            self.instances.start(region)
        except Exception:
            self.repository.fail_start(run_id)
            raise
        return StartResponse(phase="starting", region=region, operation_id=run_id)

    def join_credential(self, subject: str, request: JoinRequest) -> JoinCredential:
        """Issue one 60-second capability bound to verified identity and current process."""
        now = int(self.clock())
        self.repository.limit(f"ticket:{subject}", 30, 60, now)
        status = self.status()
        available = status.phase == "ready" or (
            status.phase == "draining" and request.operation == "reconnect"
        )
        if not available or status.active_region != request.region:
            raise ApiError(409, "SERVER_NOT_READY", "The selected game server is not ready.", 15)
        if not status.instance_run_id or not status.process_generation or not status.websocket_url:
            raise ApiError(503, "CONTROL_UNAVAILABLE", "Server status is unavailable.", 15)
        profile = self.repository.get_profile(subject)
        token = self.new_ticket()
        self.repository.put_ticket(token, {
            "subject": subject, "nickname": profile.nickname, "avatar": profile.avatar.value,
            "region": request.region, "instanceRunId": status.instance_run_id,
            "processGeneration": status.process_generation, "operation": request.operation,
            "roomCode": request.room_code, "issuedAt": now, "expiresAt": now + 60,
        })
        return JoinCredential(
            ticket=token, expires_at=iso_time(now + 60), websocket_url=status.websocket_url,
            process_generation=status.process_generation,
        )

    def match(self, subject: str, match_id: str) -> MatchResult:
        """Return final results only to the registered immutable participant roster."""
        item = self.repository.get_match(match_id)
        if not item or subject not in item.get("participants", []):
            raise ApiError(404, "MATCH_NOT_FOUND", "This match is unavailable.")
        if item.get("lifecycle") == "started" or not item.get("result"):
            raise ApiError(409, "MATCH_PENDING", "The final result is not available yet.", 5)
        return MatchResult.model_validate(item["result"])
