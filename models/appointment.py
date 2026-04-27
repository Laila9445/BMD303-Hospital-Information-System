import uuid
from datetime import datetime, date, time, timezone
from sqlalchemy import String, DateTime, Date, Time, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
import enum
from database import Base


class AppointmentStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no_show"


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patients.id"), nullable=False)
    referral_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("referrals.id"), nullable=False)
    service_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("services.id"), nullable=False)
    therapist_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    therapist_name: Mapped[str] = mapped_column(String(255), nullable=False)
    appointment_date: Mapped[date] = mapped_column(Date, nullable=False)
    appointment_time: Mapped[time] = mapped_column(Time, nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(
        SAEnum(AppointmentStatus), default=AppointmentStatus.scheduled, nullable=False
    )
    notes: Mapped[str] = mapped_column(String(2000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
