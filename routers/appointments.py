from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models import Appointment
from schemas import AppointmentCreate, AppointmentResponse, AppointmentListResult

router = APIRouter()


@router.post("/", response_model=AppointmentListResult)
def book_appointment(data: AppointmentCreate, db: Session = Depends(get_db)):
    try:
        appointment = Appointment(**data.model_dump())
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        return {"status": "success", "data": [appointment]}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=AppointmentListResult)
def get_appointments(
    patient_id: Optional[int] = None,
    date_filter: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    if date_filter:
        query = query.filter(Appointment.date == date_filter)
    return {"status": "success", "data": query.all()}


@router.get("/{appointment_id}", response_model=AppointmentListResult)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"status": "success", "data": [appointment]}


@router.patch("/{appointment_id}/status", response_model=AppointmentListResult)
def update_status(appointment_id: int, status: str, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appointment.status = status
    db.commit()
    db.refresh(appointment)
    return {"status": "success", "data": [appointment]}