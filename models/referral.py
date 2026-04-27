import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
import enum
from database import Base


class ReferralStatus(str, enum.Enum):
    pending = "pending"
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"


class Referral(Base):
    __tablename__ = "referrals"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patients.id"), nullable=False)
    service_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("services.id"), nullable=False)
    referring_doctor: Mapped[str] = mapped_column(String(255), nullable=False)
    doctor_notes: Mapped[str] = mapped_column(String(2000), nullable=True)
    status: Mapped[ReferralStatus] = mapped_column(
        SAEnum(ReferralStatus), default=ReferralStatus.pending, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
