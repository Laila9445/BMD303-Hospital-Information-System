from pydantic import BaseModel
from typing import Optional


class PatientBase(BaseModel):
    name: str
    age: int
    gender: str


class PatientCreate(PatientBase):
    pass


class PatientResponse(PatientBase):
    id: int

    class Config:
        from_attributes = True
