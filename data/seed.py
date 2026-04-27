from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models.service import Service
from models.staff import Staff, StaffRole
from core.security import hash_password

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

async def seed_services(db: AsyncSession) -> int:
    """Insert the 10 clinic services into PostgreSQL.

    Idempotent: no-op if any service row already exists.
    Returns the number of rows inserted.
    """
    existing = (await db.execute(select(func.count()).select_from(Service))).scalar_one()
    if existing > 0:
        return 0
    for data in _SERVICES:
        db.add(Service(**data))
    await db.commit()
    return len(_SERVICES)

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

async def seed_staff(db: AsyncSession) -> int:
    """Insert 2 initial staff members if not present. Idempotent."""
    existing = (await db.execute(select(func.count()).select_from(Staff))).scalar_one()
    if existing > 0:
        return 0
    for data in _STAFF:
        db.add(Staff(**data))
    await db.commit()
    return len(_STAFF)

