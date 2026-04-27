import uuid
from datetime import datetime, date, timezone
from sqlalchemy import String, DateTime, Date, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class SessionNote(Base):
    __tablename__ = "session_notes"
    __table_args__ = (UniqueConstraint("appointment_id", name="uq_session_note_appointment"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    appointment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("appointments.id"), unique=True, nullable=False
    )
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patients.id"), nullable=False)
    therapist_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    therapist_name: Mapped[str] = mapped_column(String(255), nullable=False)
    assessment: Mapped[str] = mapped_column(String(3000), nullable=False)
    treatment: Mapped[str] = mapped_column(String(3000), nullable=False)
    home_exercises: Mapped[str] = mapped_column(String(3000), nullable=True)
    pain_score_before: Mapped[int] = mapped_column(Integer, nullable=False)
    pain_score_after: Mapped[int] = mapped_column(Integer, nullable=False)
    next_appointment_date: Mapped[date] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
