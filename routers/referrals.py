from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.patient import Patient
from models.referral import Referral
from models.service import Service
from schemas.clinic import ReferralCreate, ReferralPatch, ReferralOut, ReferralCreateResponse
from routers.dependencies import get_current_active_staff

router = APIRouter(prefix="/referrals", tags=["Referrals"], dependencies=[Depends(get_current_active_staff)])

_VALID_STATUSES = {"pending", "scheduled", "completed", "cancelled"}


@router.post("", response_model=ReferralCreateResponse, status_code=201)
async def create_referral(body: ReferralCreate, db: AsyncSession = Depends(get_db)):
    # Validate service first — before any DB writes
    svc = await db.get(Service, body.service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")

    # Find or create patient by phone (deduplication)
    result = await db.execute(select(Patient).where(Patient.phone == body.patient_phone))
    patient = result.scalar_one_or_none()
    patient_existed = patient is not None
    if not patient:
        patient = Patient(
            name=body.patient_name,
            phone=body.patient_phone,
            email=body.patient_email,
        )
        db.add(patient)
        await db.flush()  # Assign patient.id before FK use

    referral = Referral(
        patient_id=patient.id,
        service_id=body.service_id,
        referring_doctor=body.referring_doctor,
        doctor_notes=body.doctor_notes,
    )
    db.add(referral)
    await db.commit()
    await db.refresh(referral)
    msg = "Referral created (patient already existed)" if patient_existed else "Referral created"
    return ReferralCreateResponse(referral=referral, patient_id=patient.id, message=msg)


@router.get("", response_model=List[ReferralOut])
async def list_referrals(patient_id: Optional[str] = Query(None), db: AsyncSession = Depends(get_db)):
    stmt = select(Referral)
    if patient_id:
        try:
            pid = UUID(patient_id)
        except ValueError:
            return []
        stmt = stmt.where(Referral.patient_id == pid)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{referral_id}", response_model=ReferralOut)
async def get_referral(referral_id: str, db: AsyncSession = Depends(get_db)):
    try:
        uid = UUID(referral_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Referral not found")
    referral = await db.get(Referral, uid)
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    return referral


@router.patch("/{referral_id}", response_model=ReferralOut)
async def update_referral(referral_id: str, body: ReferralPatch, db: AsyncSession = Depends(get_db)):
    try:
        uid = UUID(referral_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Referral not found")
    referral = await db.get(Referral, uid)
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    updates = body.model_dump(exclude_none=True)
    if "status" in updates and updates["status"] not in _VALID_STATUSES:
        raise HTTPException(status_code=422, detail=f"Invalid status. Must be one of: {_VALID_STATUSES}")
    for key, value in updates.items():
        setattr(referral, key, value)
    await db.commit()
    await db.refresh(referral)
    return referral
