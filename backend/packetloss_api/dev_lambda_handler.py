"""Local Lambda entrypoint; production handlers never import this module."""

from mangum import Mangum

from .dev_app import DevelopmentSettings, create_development_app

handler = Mangum(create_development_app(DevelopmentSettings.from_env()), lifespan="off")
