from __future__ import annotations
import re
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime, date, time

_PHONE_RE = re.compile(r'^\+\d+$')


def _validate_phone(v: Optional[str]) -> Optional[str]:
    if v is not None and not _PHONE_RE.match(v):
        raise ValueError("must start with '+' followed by digits only (e.g. +14155552671)")
    return v


class HealthCheck(BaseModel):
    status: str


# ---------------------------------------------------------------------------
# Services
# ---------------------------------------------------------------------------
class ServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    tagline: str
    description: Optional[str]
    duration_minutes: int
    is_active: bool
    created_at: datetime


# ---------------------------------------------------------------------------
# Patients
# ---------------------------------------------------------------------------
class PatientCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        _validate_phone(v)
        return v


class PatientPatch(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        return _validate_phone(v)


class PatientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    phone: str
    email: Optional[str]
    created_at: datetime
    updated_at: datetime


class PainScoreTrendItem(BaseModel):
    date: datetime
    before: int
    after: int


class PatientSummaryOut(BaseModel):
    id: UUID
    name: str
    phone: str
    total_referrals: int
    total_appointments: int
    total_sessions: int
    pain_score_trend: list[PainScoreTrendItem]


# ---------------------------------------------------------------------------
# Referrals
# ---------------------------------------------------------------------------
class ReferralCreate(BaseModel):
    patient_name: str
    patient_phone: str
    patient_email: Optional[str] = None
    service_id: UUID
    referring_doctor: str
    doctor_notes: Optional[str] = None

    @field_validator("patient_phone")
    @classmethod
    def validate_patient_phone(cls, v: str) -> str:
        _validate_phone(v)
        return v


class ReferralPatch(BaseModel):
    status: Optional[str] = None
    doctor_notes: Optional[str] = None


class ReferralOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    service_id: UUID
    referring_doctor: str
    doctor_notes: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime


class ReferralCreateResponse(BaseModel):
    referral: ReferralOut
    patient_id: UUID
    message: str


class StaffOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

# ---------------------------------------------------------------------------   
# Appointments
# ---------------------------------------------------------------------------   
class AppointmentCreate(BaseModel):
    patient_id: UUID
    referral_id: UUID
    service_id: UUID
    therapist_id: Optional[UUID] = None
    therapist_name: Optional[str] = None
    appointment_date: date   # YYYY-MM-DD
    appointment_time: time   # HH:MM:SS
    notes: Optional[str] = None


class AppointmentPatch(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    therapist_id: Optional[UUID] = None
    therapist_name: Optional[str] = None
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None


class AppointmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    referral_id: UUID
    service_id: UUID
    therapist_id: Optional[UUID] = None
    therapist_name: str
    appointment_date: date
    appointment_time: time
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------   
# Session Notes
# ---------------------------------------------------------------------------   
class SessionNoteCreate(BaseModel):
    appointment_id: UUID
    patient_id: UUID
    therapist_id: Optional[UUID] = None
    therapist_name: Optional[str] = None
    assessment: str
    treatment: str
    home_exercises: Optional[str] = None
    pain_score_before: int = Field(..., ge=0, le=10)
    pain_score_after: int = Field(..., ge=0, le=10)
    next_appointment_date: Optional[date] = None  # YYYY-MM-DD


class SessionNoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    appointment_id: UUID
    patient_id: UUID
    therapist_id: Optional[UUID] = None
    therapist_name: str
    assessment: str
    treatment: str
    home_exercises: Optional[str]
    pain_score_before: int
    pain_score_after: int
    next_appointment_date: Optional[date]
    created_at: datetime
