#!/bin/sh
set -e

echo "Running database migrations..."
uv run alembic upgrade head

echo "Seeding default environments..."
PYTHONPATH=src uv run python -m statussphere.db.seed

echo "Starting StatusSphere..."
exec uv run uvicorn statussphere.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --app-dir src