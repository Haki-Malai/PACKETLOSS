"""Stable public API errors."""

from dataclasses import dataclass


@dataclass
class ApiError(Exception):
    """An expected failure safe to return to the game client."""

    status_code: int
    code: str
    message: str
    retry_after: int | None = None

