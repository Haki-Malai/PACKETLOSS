"""Normal and forced operator stops remain scoped to the fenced owned instance."""

from copy import deepcopy

import pytest
from test_multiplayer_control import settings

from packetloss_api.errors import ApiError
from packetloss_api.multiplayer_operator import MultiplayerOperator, OperatorRequest


class OperatorRepository:
    """Track meaningful lifecycle transitions independently of SDK implementation."""

    def __init__(self):
        self.control = {
            "activeRegion": "eu", "instanceId": "i-eu", "instanceRunId": "run",
            "processGeneration": "process", "lifecycle": "ready", "revision": 1,
        }
        self.transitions = []
        self.lose_ownership = False

    def get_control(self):
        return deepcopy(self.control)

    def operator_phase(self, expected, phase, _now, force):
        if self.lose_ownership or self.control["instanceRunId"] != expected["instanceRunId"]:
            raise ApiError(409, "LIFECYCLE_CHANGED", "Ownership changed.")
        self.control.update(lifecycle=phase, stopForced=force)
        self.transitions.append(phase)
        return deepcopy(self.control)


class OperatorInstances:
    """Observe stop requests separately from the result of the local drain/work check."""

    def __init__(self):
        self.current = {"eu": "running", "na": "stopped"}
        self.checked = []
        self.stopped = []
        self.active = 0
        self.pending = 0
        self.unreachable = False
        self.after_check = lambda: None

    def states(self):
        return dict(self.current)

    def prepare_stop(self, region, force):
        self.checked.append((region, force))
        if self.unreachable:
            raise ApiError(503, "STOP_UNVERIFIED", "The admin service is unavailable.")
        self.after_check()
        return {
            "safeToStop": self.active == 0 and self.pending == 0,
            "activeMatches": self.active, "pendingResults": self.pending,
        }

    def stop(self, region):
        self.stopped.append(region)


def request(force=False, region=None):
    """Build a validated direct-invocation event rather than a browser HTTP payload."""
    return OperatorRequest(
        source="packetloss-operator", operation="stop", force=force, region=region
    )


def test_normal_stop_closes_admission_then_stops_only_the_owned_instance():
    repository, instances = OperatorRepository(), OperatorInstances()
    operator = MultiplayerOperator(settings(), repository, instances, lambda: 1000)
    result = operator.stop(request())
    assert instances.checked == [("eu", False)]
    assert repository.transitions == ["draining", "stopping"]
    assert instances.stopped == ["eu"]
    assert result["statusCode"] == 202
    assert result["operationId"] == "run"


@pytest.mark.parametrize("active,pending", [(1, 0), (0, 1)])
def test_normal_stop_refuses_active_matches_or_unflushed_results(active, pending):
    repository, instances = OperatorRepository(), OperatorInstances()
    instances.active, instances.pending = active, pending
    operator = MultiplayerOperator(settings(), repository, instances)
    with pytest.raises(ApiError) as failure:
        operator.stop(request())
    assert failure.value.code == "MATCHES_ACTIVE"
    assert repository.transitions == ["draining"]
    assert instances.stopped == []


def test_force_attempts_abort_but_can_stop_when_local_service_is_unreachable():
    repository, instances = OperatorRepository(), OperatorInstances()
    instances.unreachable = True
    operator = MultiplayerOperator(settings(), repository, instances)
    with pytest.raises(ApiError):
        operator.stop(request())
    assert instances.stopped == []
    result = operator.stop(request(force=True))
    assert instances.checked[-1] == ("eu", True)
    assert instances.stopped == ["eu"]
    assert repository.control["stopForced"] is True
    assert result["interruptionConfirmed"] is False


def test_losing_ownership_after_the_work_check_prevents_stop():
    repository, instances = OperatorRepository(), OperatorInstances()
    instances.after_check = lambda: setattr(repository, "lose_ownership", True)
    operator = MultiplayerOperator(settings(), repository, instances)
    with pytest.raises(ApiError) as failure:
        operator.stop(request())
    assert failure.value.code == "LIFECYCLE_CHANGED"
    assert instances.stopped == []


def test_region_or_instance_mismatch_never_sends_ssm_or_stop():
    repository, instances = OperatorRepository(), OperatorInstances()
    operator = MultiplayerOperator(settings(), repository, instances)
    with pytest.raises(ApiError):
        operator.stop(request(region="na"))
    repository.control["instanceId"] = "unowned-instance"
    with pytest.raises(ApiError):
        operator.stop(request(force=True))
    assert instances.checked == []
    assert instances.stopped == []


def test_actual_stopped_instance_is_reconciled_without_starting_or_issuing_stop():
    repository, instances = OperatorRepository(), OperatorInstances()
    repository.control["lifecycle"] = "stopping"
    instances.current["eu"] = "stopped"
    operator = MultiplayerOperator(settings(), repository, instances)
    assert operator.stop(request())["phase"] == "stopped"
    assert repository.transitions == ["stopped"]
    assert instances.stopped == []
