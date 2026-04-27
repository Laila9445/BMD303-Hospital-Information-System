from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models import Staff
from schemas import StaffCreate, StaffSingleResult, StaffListResult

router = APIRouter()


@router.post("/", response_model=StaffSingleResult)
def add_staff(data: StaffCreate, db: Session = Depends(get_db)):
    try:
        staff = Staff(**data.model_dump())
        db.add(staff)
        db.commit()
        db.refresh(staff)
        return {"status": "success", "data": staff}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=StaffListResult)
def get_staff(db: Session = Depends(get_db)):
    return {"status": "success", "data": db.query(Staff).all()}


@router.patch("/{staff_id}/assign", response_model=StaffSingleResult)
def assign_workload(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    staff.workload += 1
    db.commit()
    db.refresh(staff)
    return {"status": "success", "data": staff}