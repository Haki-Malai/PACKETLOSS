"""Initialize DynamoDB Local and import the former SQLite database once, read-only."""

import json
import shutil
import sqlite3
import time
from pathlib import Path
from tempfile import TemporaryDirectory

from packetloss_api.dev_app import DevelopmentSettings
from packetloss_api.local_auth import LocalAuth
from packetloss_api.local_repository import (
    LocalRepository,
    initialize_database,
    local_resource,
)
from packetloss_api.models import Profile, RunRecord


def migrate(repository: LocalRepository, path: Path) -> None:
    """Retain local identities, sessions, profiles, records, and matches from the old launcher."""
    marker = {"pk": "MIGRATION#sqlite-v1"}
    if not path.exists() or repository.auth.get_item(Key=marker).get("Item"):
        return
    # WAL-mode SQLite may need a writable shared-memory file even for read-only queries.
    # Copy the stopped legacy database and its WAL; never modify the user's original files.
    with TemporaryDirectory() as directory:
        copied = Path(directory) / path.name
        shutil.copyfile(path, copied)
        wal = Path(f"{path}-wal")
        if wal.exists():
            shutil.copyfile(wal, Path(f"{copied}-wal"))
        with sqlite3.connect(copied) as database:
            _import_rows(repository, database)
    repository.auth.put_item(Item=marker)
    print("Imported existing SQLite data into DynamoDB Local; original file retained.", flush=True)


def _import_rows(repository: LocalRepository, database: sqlite3.Connection) -> None:
    """Import one stopped SQLite snapshot through the actual DynamoDB adapters."""
    database.row_factory = sqlite3.Row
    for user in database.execute("SELECT * FROM users"):
        subject = user["subject"]
        if not repository.identity_for_subject(subject):
            repository.create_identity(
                subject, user["email"], user["password_salt"], user["password_hash"],
                None if user["confirmed"] else user["confirmation_code"],
            )
            if user["reset_code"]:
                repository.set_reset_code(user["email"], user["reset_code"])
    for profile in database.execute("SELECT * FROM profiles"):
        repository.put_profile(profile["subject"], Profile(
            nickname=profile["nickname"], avatar=profile["avatar"],
        ))
    for record in database.execute("SELECT * FROM records"):
        repository.save_records(
            record["subject"], [RunRecord.model_validate_json(record["payload"])]
        )
    for session in database.execute("SELECT * FROM refresh_sessions WHERE revoked = 0"):
        repository.put_refresh_session(
            session["token_hash"], session["subject"], session["expires_at"]
        )
    for match in database.execute("SELECT * FROM matches"):
        repository.results.put_item(Item={"pk": match["match_id"], **json.loads(match["payload"])})


def main() -> None:
    """Bootstrap once per launcher run, before either Lambda runtime starts."""
    settings = DevelopmentSettings.from_env()
    initialize_database(local_resource(settings.dynamodb_endpoint))
    repository = LocalRepository(settings.dynamodb_endpoint)
    migrate(repository, Path("/data/packetloss.sqlite"))
    LocalAuth(repository, settings.auth_key).seed_accounts()
    repository.reset_runtime(settings.run_id, settings.process_generation, int(time.time()))
    print("DynamoDB Local initialized; multiplayer starts automatically.", flush=True)


if __name__ == "__main__":
    main()
