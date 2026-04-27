"""
Standalone script to seed the 10 clinic services into PostgreSQL.
Uses INSERT ... ON CONFLICT DO NOTHING so running it twice is safe.

Run with:
    python data/seed_db.py
"""
import asyncio
import sys
import os

# Allow running from either the repo root or the data/ directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from database import AsyncSessionLocal
from models.service import Service

_SERVICES = [
    {
        "name": "Physical Therapy",
        "tagline": "Relieve pain. Restore motion.",
        "description": "Comprehensive physical therapy to relieve pain and restore full range of motion.",
        "duration_minutes": 45,
    },
    {
        "name": "Rehabilitation After Surgery",
        "tagline": "Recover right. Heal strong.",
        "description": "Structured post-surgical rehabilitation programme to ensure safe and complete recovery.",
        "duration_minutes": 60,
    },
    {
        "name": "Performance Training",
        "tagline": "Train smarter. Perform stronger.",
        "description": "Evidence-based training protocols designed to elevate athletic and functional performance.",
        "duration_minutes": 60,
    },
    {
        "name": "Functional Movement Screening (FMS)",
        "tagline": "Know how you move. Fix what limits you.",
        "description": "Systematic movement screen to identify dysfunctional patterns and target interventions.",
        "duration_minutes": 30,
    },
    {
        "name": "Dry Needling",
        "tagline": "Target the pain. Trigger relief.",
        "description": "Precise dry needling technique to deactivate myofascial trigger points and reduce pain.",
        "duration_minutes": 30,
    },
    {
        "name": "Wet & Dry Cupping",
        "tagline": "Detox. Decompress. Heal.",
        "description": "Traditional and modern cupping therapy to decompress soft tissue and promote circulation.",
        "duration_minutes": 45,
    },
    {
        "name": "Elderly Care Programs",
        "tagline": "Movement that respects age.",
        "description": "Tailored physiotherapy programmes for elderly patients focusing on mobility and safety.",
        "duration_minutes": 45,
    },
    {
        "name": "Home Visits",
        "tagline": "Care that comes to you.",
        "description": "Professional physiotherapy delivered in the comfort of the patient's own home.",
        "duration_minutes": 60,
    },
    {
        "name": "Post Cosmetic Surgery Physiotherapy",
        "tagline": "Because Healing Doesn't End in the OR.",
        "description": "Specialised physiotherapy to support recovery and optimise results after cosmetic procedures.",
        "duration_minutes": 60,
    },
    {
        "name": "Lymphatic Drainage Therapy",
        "tagline": "Detox. De-puff. Deeply Heal.",
        "description": "Manual lymphatic drainage to reduce swelling, support detoxification, and accelerate healing.",
        "duration_minutes": 45,
    },
]


async def seed_services() -> None:
    """Insert all 10 services. Skips any whose name already exists (idempotent)."""
    from sqlalchemy import select
    async with AsyncSessionLocal() as db:
        existing_result = await db.execute(select(Service.name))
        existing_names = {row[0] for row in existing_result.all()}

        for data in _SERVICES:
            if data["name"] in existing_names:
                print(f"  [=] {data['name']} (already exists — skipped)")
                continue
            db.add(Service(**data))
            print(f"  [+] {data['name']}")
        await db.commit()
    print("SUCCESS: Services seeded")

from models.staff import Staff, StaffRole
from core.security import hash_password
_STAFF = [
    {
        "full_name": "Admin User",
        "email": "admin@clinic.com",
        "hashed_password": hash_password("admin123"),
        "role": StaffRole.admin,
        "is_active": True
    },
    {
        "full_name": "Dr. Ahmed Hassan",
        "email": "ahmed.hassan@clinic.com",
        "hashed_password": hash_password("therapist123"),
        "role": StaffRole.therapist,
        "is_active": True
    },
    {
        "full_name": "Nurse Mona Ibrahim",
        "email": "mona.ibrahim@clinic.com",
        "hashed_password": hash_password("nurse123"),
        "role": StaffRole.nurse,
        "is_active": True
    }
]

async def seed_staff() -> None:
    from sqlalchemy import select
    from database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        existing_result = await db.execute(select(Staff.email))
        existing_emails = {row[0] for row in existing_result.all()}

        for data in _STAFF:
            if data["email"] in existing_emails:
                print(f"  [=] {data['full_name']} (already exists — skipped)")     
                continue
            db.add(Staff(**data))
            print(f"  [+] {data['full_name']}")
        await db.commit()
    print("SUCCESS: Staff seeded")

async def main():
    await seed_services()
    await seed_staff()

if __name__ == "__main__":
    asyncio.run(main())
