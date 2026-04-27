import enum
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Enum, func
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class StaffRole(str, enum.Enum):
    therapist = "therapist"
    nurse = "nurse"
    admin = "admin"

class Staff(Base):
    __tablename__ = "staff"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(StaffRole), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
