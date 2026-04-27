from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models.patient import Patient
from models.referral import Referral
from models.appointment import Appointment
from models.session_note import SessionNote
from schemas.clinic import PatientCreate, PatientPatch, PatientOut, PatientSummaryOut, ReferralOut, PainScoreTrendItem
from routers.dependencies import get_current_active_staff

router = APIRouter(prefix="/patients", tags=["Patients"], dependencies=[Depends(get_current_active_staff)])


@router.post("", response_model=PatientOut, status_code=201)
async def create_patient(body: PatientCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).where(Patient.phone == body.phone))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Phone number already registered")
    patient = Patient(name=body.name, phone=body.phone, email=body.email)
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient


@router.get("", response_model=List[PatientOut])
async def list_patients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient))
    return result.scalars().all()


@router.get("/{patient_id}/summary", response_model=PatientSummaryOut)
async def get_patient_summary(patient_id: str, db: AsyncSession = Depends(get_db)):
    try:
        uid = UUID(patient_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient = await db.get(Patient, uid)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    total_referrals = (await db.execute(
        select(func.count()).select_from(Referral).where(Referral.patient_id == uid)
    )).scalar_one()
    total_appointments = (await db.execute(
        select(func.count()).select_from(Appointment).where(Appointment.patient_id == uid)
    )).scalar_one()
    total_sessions = (await db.execute(
        select(func.count()).select_from(SessionNote).where(SessionNote.patient_id == uid)
    )).scalar_one()

    notes_result = await db.execute(
        select(SessionNote)
        .where(SessionNote.patient_id == uid)
        .order_by(SessionNote.created_at)
    )
    pain_score_trend = [
        PainScoreTrendItem(date=n.created_at, before=n.pain_score_before, after=n.pain_score_after)
        for n in notes_result.scalars().all()
    ]

    return PatientSummaryOut(
        id=patient.id,
        name=patient.name,
        phone=patient.phone,
        total_referrals=total_referrals,
        total_appointments=total_appointments,
        total_sessions=total_sessions,
        pain_score_trend=pain_score_trend,
    )


@router.get("/{patient_id}/referrals", response_model=List[ReferralOut])
async def list_patient_referrals(patient_id: str, db: AsyncSession = Depends(get_db)):
    try:
        uid = UUID(patient_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient = await db.get(Patient, uid)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    result = await db.execute(select(Referral).where(Referral.patient_id == uid))
    return result.scalars().all()


@router.get("/{patient_id}", response_model=PatientOut)
async def get_patient(patient_id: str, db: AsyncSession = Depends(get_db)):
    try:
        uid = UUID(patient_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient = await db.get(Patient, uid)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.patch("/{patient_id}", response_model=PatientOut)
async def update_patient(patient_id: str, body: PatientPatch, db: AsyncSession = Depends(get_db)):
    try:
        uid = UUID(patient_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient = await db.get(Patient, uid)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    updates = body.model_dump(exclude_none=True)
    if "phone" in updates and updates["phone"] != patient.phone:
        result = await db.execute(select(Patient).where(Patient.phone == updates["phone"]))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Phone number already registered")
    for key, value in updates.items():
        setattr(patient, key, value)
    await db.commit()
    await db.refresh(patient)
    return patient
