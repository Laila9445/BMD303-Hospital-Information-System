from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from core.db import get_db
from core.security import get_current_user, require_role
from core.rate_limit import limiter
from models.patient import Patient
from models.study import Study
from models.user import User
from schemas.study import StudyCreate, StudyStatus, StudyStatusUpdate

router = APIRouter()


def to_dict(model_obj):
    return {c.name: getattr(model_obj, c.name) for c in model_obj.__table__.columns}


@router.post("/studies", response_model=dict, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def create_study(
    request: Request,
    study: StudyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new study for a patient."""
    try:
        patient = db.query(Patient).filter(Patient.id == study.patient_id).first()
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        db_study = Study(**study.model_dump())
        db.add(db_study)
        db.commit()
        db.refresh(db_study)
        return {"status": "success", "data": to_dict(db_study)}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Study creation failed - duplicate data"
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating study: {str(e)}"
        )


@router.get("/studies", response_model=dict)
@limiter.limit("30/minute")
def get_all_studies(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all studies."""
    try:
        studies = db.query(Study).all()
        return {"status": "success", "data": [to_dict(s) for s in studies]}
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )

@router.put("/studies/{study_id}", response_model=dict)
@limiter.limit("20/minute")
def update_study_status(
    request: Request,
    study_id: int,
    payload: StudyStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("radiologist"))
):
    """Update study status (radiologist only)."""
    try:
        study = db.query(Study).filter(Study.id == study_id).first()
        if not study:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found")
        if study.status == StudyStatus.completed.value:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Study is already completed")

        if study.status != StudyStatus.pending.value or payload.status != StudyStatus.completed:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only pending studies can transition to completed",
            )
        
        study.status = payload.status
        db.commit()
        db.refresh(study)
        return {"status": "success", "data": to_dict(study)}
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating study: {str(e)}"
        )

    study.status = payload.status.value
    db.commit()
    db.refresh(study)
    return {"status": "success", "data": to_dict(study)}
