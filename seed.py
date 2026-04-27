from datetime import datetime

from db import SessionLocal
from models import Appointment, Invoice, Patient, Staff


def seed():
    db = SessionLocal()
    try:
        # ─── Patients ─────────────────────────────────
        patients = [
            Patient(name="Ahmed Mohamed", age=30, phone="01000000001"),
            Patient(name="Sara Ali", age=25, phone="01000000002"),
            Patient(name="Mohamed Hassan", age=45, phone="01000000003"),
        ]
        db.add_all(patients)
        db.commit()

        # ─── Staff ────────────────────────────────────
        staff = [
            Staff(name="Dr. Ahmed Radwan", role="radiologist", workload=0),
            Staff(name="Dr. Sara Khaled", role="radiologist", workload=0),
        ]
        db.add_all(staff)
        db.commit()

        # ─── Appointments ─────────────────────────────
        appointments = [
            Appointment(patient_id=1, date=datetime(2026, 4, 25, 10, 0), notes="MRI Follow-up", status="scheduled"),
            Appointment(patient_id=2, date=datetime(2026, 4, 26, 11, 0), notes="X-Ray", status="scheduled"),
            Appointment(patient_id=3, date=datetime(2026, 4, 27, 9, 0), notes="CT Scan", status="pending"),
        ]
        db.add_all(appointments)
        db.commit()

        # ─── Invoices ─────────────────────────────────
        invoices = [
            Invoice(patient_id=1, amount=500.0, status="unpaid", description="MRI Scan"),
            Invoice(patient_id=2, amount=300.0, status="paid", description="X-Ray"),
            Invoice(patient_id=3, amount=750.0, status="unpaid", description="CT Scan"),
        ]
        db.add_all(invoices)
        db.commit()

        print("✅ Seed data inserted successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
