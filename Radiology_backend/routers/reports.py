from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from core.db import get_db
from core.security import get_current_user, require_role
from core.encryption import encryption_service
from core.audit import log_action
from models.report import Report
from models.study import Study
from models.user import User
from core.rate_limit import limiter
from schemas.report import ReportCreate, ReportUpdate

router = APIRouter()


def to_dict(model_obj):
    return {c.name: getattr(model_obj, c.name) for c in model_obj.__table__.columns}


def decrypt_report(report: Report) -> dict:
    """Decrypt report data for response."""
    return {
        "id": report.id,
        "study_id": report.study_id,
        "description": encryption_service.decrypt(report.encrypted_description),
        "result": encryption_service.decrypt(report.encrypted_result),
        "created_at": report.created_at,
        "updated_at": report.updated_at
    }


@router.post("/reports", response_model=dict)
@limiter.limit("30/minute")
def create_report(
    request: Request,
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("radiologist"))
):
    study = db.query(Study).filter(Study.id == report.study_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    # Encrypt sensitive data before storing
    encrypted_description = encryption_service.encrypt(report.description)
    encrypted_result = encryption_service.encrypt(report.result)
    
    db_report = Report(
        study_id=report.study_id,
        encrypted_description=encrypted_description,
        encrypted_result=encrypted_result,
        created_by=current_user.id
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    # Audit log
    log_action(
        db, action="create_report", user_id=current_user.id,
        username=current_user.username, resource_type="report",
        resource_id=db_report.id, ip_address=request.client.host
    )
    
    return {"status": "success", "data": decrypt_report(db_report)}


@router.get("/reports", response_model=dict)
def get_all_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reports = db.query(Report).all()
    return {"status": "success", "data": [decrypt_report(r) for r in reports]}


@router.get("/reports/{report_id}", response_model=dict)
def get_report_by_id(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"status": "success", "data": decrypt_report(report)}


@router.put("/reports/{report_id}", response_model=dict)
def update_report(
    report_id: int,
    report_update: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("radiologist"))
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Encrypt updated fields
    if report_update.description:
        report.encrypted_description = encryption_service.encrypt(report_update.description)
    if report_update.result:
        report.encrypted_result = encryption_service.encrypt(report_update.result)
    
    db.commit()
    db.refresh(report)
    
    return {"status": "success", "data": decrypt_report(report)}
