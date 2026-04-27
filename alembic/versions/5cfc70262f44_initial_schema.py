"""initial schema

Revision ID: 5cfc70262f44
Revises: 
Create Date: 2026-03-12 00:46:52.760256

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '5cfc70262f44'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all 5 tables for the initial schema."""
    # --- services ---
    op.create_table(
        'services',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('tagline', sa.String(500), nullable=False),
        sa.Column('description', sa.String(2000), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', name='uq_services_name'),
    )

    # --- patients ---
    op.create_table(
        'patients',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(30), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('phone'),
    )

    # --- referrals ---
    op.create_table(
        'referrals',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('service_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('referring_doctor', sa.String(255), nullable=False),
        sa.Column('doctor_notes', sa.String(2000), nullable=True),
        sa.Column('status', sa.Enum('pending', 'scheduled', 'completed', 'cancelled',
                                    name='referralstatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id']),
        sa.ForeignKeyConstraint(['service_id'], ['services.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # --- appointments ---
    op.create_table(
        'appointments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('referral_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('service_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('therapist_name', sa.String(255), nullable=False),
        sa.Column('appointment_date', sa.Date(), nullable=False),
        sa.Column('appointment_time', sa.Time(), nullable=False),
        sa.Column('status', sa.Enum('scheduled', 'completed', 'cancelled', 'no_show',
                                    name='appointmentstatus'), nullable=False),
        sa.Column('notes', sa.String(2000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id']),
        sa.ForeignKeyConstraint(['referral_id'], ['referrals.id']),
        sa.ForeignKeyConstraint(['service_id'], ['services.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # --- session_notes ---
    op.create_table(
        'session_notes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('appointment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('therapist_name', sa.String(255), nullable=False),
        sa.Column('assessment', sa.String(3000), nullable=False),
        sa.Column('treatment', sa.String(3000), nullable=False),
        sa.Column('home_exercises', sa.String(3000), nullable=True),
        sa.Column('pain_score_before', sa.Integer(), nullable=False),
        sa.Column('pain_score_after', sa.Integer(), nullable=False),
        sa.Column('next_appointment_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id']),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('appointment_id', name='uq_session_note_appointment'),
    )


def downgrade() -> None:
    """Drop all 5 tables."""
    op.drop_table('session_notes')
    op.drop_table('appointments')
    op.drop_table('referrals')
    op.drop_table('patients')
    op.drop_table('services')
    op.execute('DROP TYPE IF EXISTS referralstatus')
    op.execute('DROP TYPE IF EXISTS appointmentstatus')
