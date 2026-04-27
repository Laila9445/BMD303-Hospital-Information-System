from datetime import date as _date
from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.patient import Patient
from models.referral import Referral, ReferralStatus
from models.service import Service
from models.appointment import Appointment
from models.staff import Staff, StaffRole
from schemas.clinic import AppointmentCreate, AppointmentPatch, AppointmentOut
from routers.dependencies import get_current_active_staff

router = APIRouter(prefix="/appointments", tags=["Appointments"], dependencies=[Depends(get_current_active_staff)])

_VALID_STATUSES = {"scheduled", "completed", "cancelled", "no_show"}


@router.post("", response_model=AppointmentOut, status_code=201)
async def create_appointment(body: AppointmentCreate, db: AsyncSession = Depends(get_db)):
    patient = await db.get(Patient, body.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    referral = await db.get(Referral, body.referral_id)
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    svc = await db.get(Service, body.service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")

    if body.appointment_date < _date.today():
        raise HTTPException(status_code=422, detail="Appointment date cannot be in the past")

    therapist_id = body.therapist_id
    therapist_name = body.therapist_name

    if therapist_id:
        staff = await db.get(Staff, therapist_id)
        if not staff:
            raise HTTPException(status_code=404, detail="Staff member not found")
        if not staff.is_active:
            raise HTTPException(status_code=422, detail="Staff member is inactive")
        therapist_name = staff.full_name
    elif not therapist_name:
        raise HTTPException(status_code=422, detail="Either therapist_id or therapist_name must be provided")

    appointment = Appointment(
        patient_id=body.patient_id,
        referral_id=body.referral_id,
        service_id=body.service_id,
        therapist_id=therapist_id,
        therapist_name=therapist_name,
        appointment_date=body.appointment_date,
        appointment_time=body.appointment_time,
        notes=body.notes,
    )
    db.add(appointment)

    # Creating an appointment moves the referral to "scheduled"
    referral.status = ReferralStatus.scheduled

    await db.commit()
    await db.refresh(appointment)
    return appointment


@router.get("/today", response_model=List[AppointmentOut])
async def list_todays_appointments(db: AsyncSession = Depends(get_db)):
    today = _date.today()
    result = await db.execute(
        select(Appointment).where(Appointment.appointment_date == today)
    )
    return result.scalars().all()


@router.get("", response_model=List[AppointmentOut])
async def list_appointments(patient_id: Optional[str] = Query(None), db: AsyncSession = Depends(get_db)):
    stmt = select(Appointment)
    if patient_id:
        try:
            pid = UUID(patient_id)
        except ValueError:
            return []
        stmt = stmt.where(Appointment.patient_id == pid)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{appointment_id}", response_model=AppointmentOut)
async def get_appointment(appointment_id: str, db: AsyncSession = Depends(get_db)):
    try:
        uid = UUID(appointment_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt = await db.get(Appointment, uid)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt


@router.patch("/{appointment_id}", response_model=AppointmentOut)
async def update_appointment(appointment_id: str, body: AppointmentPatch, db: AsyncSession = Depends(get_db)):
    try:
        uid = UUID(appointment_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt = await db.get(Appointment, uid)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    updates = body.model_dump(exclude_none=True)
    if "status" in updates and updates["status"] not in _VALID_STATUSES:
        raise HTTPException(status_code=422, detail=f"Invalid status. Must be one of: {_VALID_STATUSES}")
    if "appointment_date" in updates and updates["appointment_date"] < _date.today():
        raise HTTPException(status_code=422, detail="Appointment date cannot be in the past")
    
    if "therapist_id" in updates and updates["therapist_id"]:
        staff = await db.get(Staff, updates["therapist_id"])
        if not staff:
            raise HTTPException(status_code=404, detail="Staff member not found")
        if not staff.is_active:
            raise HTTPException(status_code=422, detail="Staff member is inactive")
        updates["therapist_name"] = staff.full_name

    for key, value in updates.items():
        setattr(appt, key, value)
    await db.commit()
    await db.refresh(appt)
    return appt
