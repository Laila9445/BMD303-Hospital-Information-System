from enum import Enum
from pydantic import BaseModel


class StudyStatus(str, Enum):
    pending = "pending"
    completed = "completed"


class StudyBase(BaseModel):
    patient_id: int
    study_type: str
    status: StudyStatus = StudyStatus.pending


class StudyCreate(StudyBase):
    pass


class StudyResponse(StudyBase):
    id: int

    class Config:
        from_attributes = True


class StudyStatusUpdate(BaseModel):
    status: StudyStatus
