import asyncio
import os
from logging.config import fileConfig

from dotenv import load_dotenv
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

# ---------------------------------------------------------------------------
# Load .env so DATABASE_URL is available
# ---------------------------------------------------------------------------
load_dotenv()

# ---------------------------------------------------------------------------
# Alembic Config object
# ---------------------------------------------------------------------------
config = context.config

from core.config import settings

# Override sqlalchemy.url from the environment at runtime so we never
# hard-code credentials in alembic.ini.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Set up Python logging from the ini file.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ---------------------------------------------------------------------------
# Import Base and register all models so autogenerate can see every table
# ---------------------------------------------------------------------------
from database import Base  # noqa: E402
from models.service import Service          # noqa: F401, E402
from models.patient import Patient          # noqa: F401, E402
from models.referral import Referral        # noqa: F401, E402
from models.appointment import Appointment  # noqa: F401, E402
from models.session_note import SessionNote # noqa: F401, E402

target_metadata = Base.metadata


# ---------------------------------------------------------------------------
# Offline mode — emit SQL to stdout without a live DB connection
# ---------------------------------------------------------------------------
def run_migrations_offline() -> None:
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------------------------
# Online mode — async engine driven by asyncpg
# ---------------------------------------------------------------------------
def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = settings.DATABASE_URL
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


# ---------------------------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
