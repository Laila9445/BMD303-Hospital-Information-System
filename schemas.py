from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# ─── Staff ────────────────────────────────────────────
class StaffBase(BaseModel):
    name: str
    role: str

class StaffCreate(StaffBase):
    pass

class StaffResponse(StaffBase):
    id: int
    workload: int
    model_config = ConfigDict(from_attributes=True)

class StaffSingleResult(BaseModel):
    status: str
    data: StaffResponse

class StaffListResult(BaseModel):
    status: str
    data: list[StaffResponse]


# ─── Appointment ──────────────────────────────────────
class AppointmentCreate(BaseModel):
    patient_id: int
    date: datetime
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    date: datetime
    notes: Optional[str]
    status: str
    model_config = ConfigDict(from_attributes=True)

class AppointmentListResult(BaseModel):
    status: str
    data: list[AppointmentResponse]


# ─── Invoice ──────────────────────────────────────────
class InvoiceCreate(BaseModel):
    patient_id: int
    amount: float
    description: Optional[str] = None

class InvoiceResponse(BaseModel):
    id: int
    patient_id: int
    amount: float
    status: str
    description: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class InvoiceListResult(BaseModel):
    status: str
    data: list[InvoiceResponse]