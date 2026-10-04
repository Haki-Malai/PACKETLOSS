"""AWS Lambda entry point."""

from mangum import Mangum

from .app import create_app
from .config import Settings

app = create_app(Settings.from_env())
handler = Mangum(app, lifespan="off")

