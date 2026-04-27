"""
Utility script to create all database tables directly (without Alembic).
Run with:  python create_tables.py
"""
import asyncio
from database import engine, Base

# Import all models so their metadata is registered on Base
from models.service import Service  # noqa: F401
from models.patient import Patient  # noqa: F401
from models.referral import Referral  # noqa: F401
from models.appointment import Appointment  # noqa: F401
from models.session_note import SessionNote  # noqa: F401


async def create_all():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("All tables created successfully.")

    from data.seed_db import seed_services
    await seed_services()


if __name__ == "__main__":
    asyncio.run(create_all())
