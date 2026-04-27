from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models.patient import Patient
from models.appointment import Appointment, AppointmentStatus
from models.referral import Referral, ReferralStatus
from models.session_note import SessionNote
from models.staff import Staff, StaffRole
from schemas.clinic import SessionNoteCreate, SessionNoteOut
from routers.dependencies import require_roles

router = APIRouter(prefix="/sessions", tags=["Session Notes"], dependencies=[Depends(require_roles([StaffRole.therapist]))])


@router.post("", response_model=SessionNoteOut, status_code=201)
async def create_session_note(body: SessionNoteCreate, db: AsyncSession = Depends(get_db)):
    patient = await db.get(Patient, body.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    appt = await db.get(Appointment, body.appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Enforce one session note per appointment
    existing = (await db.execute(
        select(SessionNote).where(SessionNote.appointment_id == body.appointment_id)
    )).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Session notes already recorded for this appointment")

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

    note = SessionNote(
        appointment_id=body.appointment_id,
        patient_id=body.patient_id,
        therapist_id=therapist_id,
        therapist_name=therapist_name,
        assessment=body.assessment,
        treatment=body.treatment,
        home_exercises=body.home_exercises,
        pain_score_before=body.pain_score_before,
        pain_score_after=body.pain_score_after,
        next_appointment_date=body.next_appointment_date,
    )
    db.add(note)

    # Mark the appointment as completed
    appt.status = AppointmentStatus.completed

    # If every other appointment on this referral is also completed, complete the referral
    referral = await db.get(Referral, appt.referral_id)
    if referral:
        remaining = (await db.execute(
            select(func.count()).select_from(Appointment).where(
                Appointment.referral_id == referral.id,
                Appointment.status != AppointmentStatus.completed,
                Appointment.id != appt.id,  # Exclude current (not yet flushed)
            )
        )).scalar_one()
        if remaining == 0:
            referral.status = ReferralStatus.completed

    await db.commit()
    await db.refresh(note)
    return note


@router.get("/patient/{patient_id}", response_model=List[SessionNoteOut])
async def list_patient_sessions(patient_id: str, db: AsyncSession = Depends(get_db)):
    try:
        uid = UUID(patient_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient = await db.get(Patient, uid)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    result = await db.execute(
        select(SessionNote)
        .where(SessionNote.patient_id == uid)
        .order_by(SessionNote.created_at)
    )
    return result.scalars().all()


@router.get("", response_model=List[SessionNoteOut])
async def list_session_notes(patient_id: Optional[str] = Query(None), db: AsyncSession = Depends(get_db)):
    stmt = select(SessionNote)
    if patient_id:
        try:
            pid = UUID(patient_id)
        except ValueError:
            return []
        stmt = stmt.where(SessionNote.patient_id == pid)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{session_id}", response_model=SessionNoteOut)
async def get_session_note(session_id: str, db: AsyncSession = Depends(get_db)):
    try:
        uid = UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Session note not found")
    note = await db.get(SessionNote, uid)
    if not note:
        raise HTTPException(status_code=404, detail="Session note not found")
    return note
