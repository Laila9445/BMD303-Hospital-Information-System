# Upgrade Summary (Docker Removed)

## What remains in the project

- PostgreSQL as the primary database (`core/config.py`, `core/db.py`)
- Alembic migration support (`alembic/env.py`)
- Auth, rate limiting, audit logging, structured logging, tests
- Local-first runtime using Python virtual environment + local PostgreSQL

## What was removed

- `Dockerfile`
- `docker-compose.yml`
- Docker-based run/deploy commands in project docs

## Current run model

1. Start local PostgreSQL service
2. Configure `.env` (especially `DATABASE_URL`)
3. Install dependencies
4. Run migrations (`alembic upgrade head`)
5. Start API (`uvicorn main:app --reload`)

## Key commands

```bash
# Install
python -m pip install -r requirements.txt

# Migrate
alembic upgrade head

# Run API
python -m uvicorn main:app --reload

# Run tests
python -m pytest -v
