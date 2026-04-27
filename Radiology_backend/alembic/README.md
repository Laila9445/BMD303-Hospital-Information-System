# Alembic Migration Instructions

## Overview

This directory contains database migration scripts using Alembic, which tracks and manages changes to the database schema.

## Setting Up Migrations

If you haven't already, create an initial migration:

```bash
# Generate initial migration from current models
alembic revision --autogenerate -m "Initial schema"

# Apply migration to database
alembic upgrade head
```

## Creating New Migrations

When you modify a model in `models/`, create a new migration:

```bash
# Auto-generate migration based on model changes
alembic revision --autogenerate -m "Description of changes"

# Manually create an empty migration (for complex changes)
alembic revision -m "Description of changes"
```

## Applying Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Apply specific migration
alembic upgrade <revision_id>

# Rollback last migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision_id>

# Check current database version
alembic current

# View migration history
alembic history
```

## Workflow

1. **Create/modify models** in `models/` directory
2. **Generate migration**: `alembic revision --autogenerate -m "message"`
3. **Review migration** in `versions/` directory
4. **Test locally**: `alembic upgrade head`
5. **Deploy**: Run migrations on production database
6. **Start app**: FastAPI will verify migrations ran successfully

## Important Notes

- Always review auto-generated migrations before running them
- Manual migrations are needed for data transformations
- Migrations are one-way; downgrade is not always guaranteed
- Test migrations on a copy of production data first
- Never modify migration files after they've been run on production
