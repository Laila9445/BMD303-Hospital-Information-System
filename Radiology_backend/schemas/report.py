from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReportBase(BaseModel):
    study_id: int
    description: str
    result: str


class ReportCreate(ReportBase):
    pass


class ReportUpdate(BaseModel):
    description: Optional[str] = None
    result: Optional[str] = None


class ReportResponse(BaseModel):
    id: int
    study_id: int
    description: str  # Decrypted
    result: str  # Decrypted
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
