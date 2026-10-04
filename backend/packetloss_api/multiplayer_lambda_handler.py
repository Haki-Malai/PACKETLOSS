"""Independent AWS Lambda entry point for multiplayer lifecycle and tickets."""

from botocore.exceptions import BotoCoreError, ClientError
from mangum import Mangum
from pydantic import ValidationError

from .errors import ApiError
from .multiplayer_app import create_multiplayer_app
from .multiplayer_models import MultiplayerSettings
from .multiplayer_operator import Ec2StopGateway, MultiplayerOperator, OperatorRequest
from .multiplayer_repository import DynamoMultiplayerRepository

settings = MultiplayerSettings.from_env()
app = create_multiplayer_app(settings)
http_handler = Mangum(app, lifespan="off")


def handler(event, context):
    """Route IAM operator invocations separately from API Gateway's fixed HTTP envelope."""
    if event.get("source") != "packetloss-operator" or "requestContext" in event:
        return http_handler(event, context)
    try:
        request = OperatorRequest.model_validate(event)
        operator = MultiplayerOperator(
            settings, DynamoMultiplayerRepository(settings), Ec2StopGateway(settings)
        )
        return operator.stop(request)
    except ValidationError:
        return {"statusCode": 422, "code": "INVALID_REQUEST", "message": "Invalid operator event."}
    except ApiError as error:
        return {"statusCode": error.status_code, "code": error.code, "message": error.message}
    except (ClientError, BotoCoreError):
        return {
            "statusCode": 503, "code": "CONTROL_UNAVAILABLE",
            "message": "Stop status is uncertain; inspect before retrying.",
        }
