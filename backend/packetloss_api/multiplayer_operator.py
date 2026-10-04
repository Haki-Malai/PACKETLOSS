"""IAM-invoked management operations; intentionally absent from the browser HTTP API."""

import json
import time
from collections.abc import Callable
from typing import Any, Literal, Protocol

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from pydantic import Field

from .errors import ApiError
from .models import ApiModel
from .multiplayer_control import Ec2Instances
from .multiplayer_models import MultiplayerSettings, Region
from .multiplayer_repository import MultiplayerRepository


class OperatorRequest(ApiModel):
    """A direct Lambda event that only IAM-authorized operators can invoke."""

    source: Literal["packetloss-operator"]
    operation: Literal["stop"]
    force: bool = Field(strict=True)
    region: Region | None = None


class StopGateway(Protocol):
    """Inspect and stop one fenced instance after checking its local admission gate."""

    def states(self) -> dict[Region, str]: ...

    def prepare_stop(self, region: Region, force: bool) -> dict[str, Any]: ...

    def stop(self, region: Region) -> None: ...


class Ec2StopGateway(Ec2Instances):
    """Run a fixed installed admin helper through SSM, then stop the owned EC2 instance."""

    def __init__(
        self, settings: MultiplayerSettings, clients: dict[Region, Any] | None = None,
        ssm_clients: dict[Region, Any] | None = None,
        clock: Callable[[], float] = time.monotonic,
        sleep: Callable[[float], None] = time.sleep,
    ):
        super().__init__(settings, clients)
        self.ssm = ssm_clients or {
            region: boto3.client(
                "ssm", region_name=target.aws_region,
                config=Config(connect_timeout=2, read_timeout=3, retries={"max_attempts": 1}),
            ) for region, target in settings.regions.items()
        }
        self.clock = clock
        self.sleep = sleep

    def prepare_stop(self, region: Region, force: bool) -> dict[str, Any]:
        """Drain local admission before checking work; never place admin secrets in SSM."""
        client = self.ssm[region]
        instance_id = self.settings.regions[region].instance_id
        sent = client.send_command(
            InstanceIds=[instance_id], DocumentName="AWS-RunShellScript",
            Parameters={"commands": [
                "/usr/local/bin/packetloss-control-stop" + (" --force" if force else "")
            ]}, TimeoutSeconds=30,
        )
        deadline = self.clock() + 20
        while self.clock() < deadline:
            try:
                response = client.get_command_invocation(
                    CommandId=sent["Command"]["CommandId"], InstanceId=instance_id
                )
            except ClientError as error:
                if error.response["Error"]["Code"] != "InvocationDoesNotExist":
                    raise
                self.sleep(1)
                continue
            state = response["Status"]
            if state == "Success":
                try:
                    status = json.loads(response.get("StandardOutputContent", ""))
                except (TypeError, ValueError) as error:
                    raise ApiError(
                        503, "STOP_UNVERIFIED", "The stop check was unreadable."
                    ) from error
                if isinstance(status, dict) and isinstance(status.get("safeToStop"), bool):
                    return status
                raise ApiError(503, "STOP_UNVERIFIED", "The stop check was unreadable.")
            if state not in {"Pending", "InProgress", "Delayed"}:
                raise ApiError(503, "STOP_UNVERIFIED", "The server could not confirm a safe stop.")
            self.sleep(1)
        raise ApiError(503, "STOP_UNVERIFIED", "The server stop check timed out.", 15)

    def stop(self, region: Region) -> None:
        """Stop the configured instance while preserving its persistent disk."""
        self.clients[region].stop_instances(
            InstanceIds=[self.settings.regions[region].instance_id]
        )


class MultiplayerOperator:
    """Fence normal/forced stop around the same central ownership used for startup."""

    def __init__(
        self, settings: MultiplayerSettings, repository: MultiplayerRepository,
        instances: StopGateway, clock: Callable[[], float] = time.time,
    ):
        self.settings = settings
        self.repository = repository
        self.instances = instances
        self.clock = clock

    def stop(self, request: OperatorRequest) -> dict[str, Any]:
        """Drain and refuse busy normal stops; explicit force attempts an abort before stopping."""
        expected = self.repository.get_control()
        states = self.instances.states()
        region = request.region or (expected or {}).get("activeRegion")
        if region not in self.settings.regions:
            if all(state == "stopped" for state in states.values()):
                return {"statusCode": 200, "phase": "stopped", "region": None, "operationId": None}
            raise ApiError(409, "RECONCILIATION_REQUIRED", "No owned server was found.")
        if not expected or (
            expected.get("activeRegion") != region
            or expected.get("instanceId") != self.settings.regions[region].instance_id
        ):
            raise ApiError(409, "RECONCILIATION_REQUIRED", "The selected instance is not owned.")
        now = int(self.clock())
        if states[region] == "stopped":
            self.repository.operator_phase(expected, "stopped", now, request.force)
            return {
                "statusCode": 200, "phase": "stopped", "region": region,
                "operationId": expected["instanceRunId"],
            }
        if states[region] == "stopping":
            return {
                "statusCode": 202, "phase": "stopping", "region": region,
                "operationId": expected["instanceRunId"],
            }
        if states[region] not in {"running", "pending"}:
            raise ApiError(409, "RECONCILIATION_REQUIRED", "The instance cannot be safely stopped.")
        fenced = self.repository.operator_phase(expected, "draining", now, request.force)
        interruption_confirmed = False
        try:
            checked = self.instances.prepare_stop(region, request.force)
            active = checked.get("activeMatches")
            pending = checked.get("pendingResults")
            interruption_confirmed = request.force and active == 0
            safe = (
                checked.get("safeToStop") is True
                and isinstance(active, int) and active == 0
                and isinstance(pending, int) and pending == 0
            )
            if not request.force and not safe:
                raise ApiError(
                    409, "MATCHES_ACTIVE",
                    "The server is draining; retry when matches are saved.", 15,
                )
        except (ApiError, ClientError, BotoCoreError):
            if not request.force:
                raise
        # The local admission gate remains closed between the work check and this stop.
        self.repository.operator_phase(fenced, "stopping", int(self.clock()), request.force)
        self.instances.stop(region)
        return {
            "statusCode": 202, "phase": "stopping", "region": region,
            "operationId": expected["instanceRunId"],
            "interruptionConfirmed": interruption_confirmed,
        }
