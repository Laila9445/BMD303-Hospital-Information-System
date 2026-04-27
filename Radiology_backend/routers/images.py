from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from typing import List
import os
import uuid
from core.db import get_db
from core.security import get_current_user, require_role
from core.encryption import encryption_service
from core.rate_limit import limiter
from models.image import MedicalImage
from models.user import User

router = APIRouter()

ENCRYPTED_IMAGES_DIR = "encrypted_images"
os.makedirs(ENCRYPTED_IMAGES_DIR, exist_ok=True)


def to_dict(model_obj):
    return {c.name: getattr(model_obj, c.name) for c in model_obj.__table__.columns}


@router.post("/images/upload", response_model=dict, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def upload_image(
    request: Request,
    study_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("radiologist"))
):
    """Upload and encrypt a medical image."""
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "application/dicom"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file.content_type} not allowed. Allowed: {allowed_types}"
            )
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "bin"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        original_path = os.path.join(ENCRYPTED_IMAGES_DIR, f"temp_{unique_filename}")
        encrypted_path = os.path.join(ENCRYPTED_IMAGES_DIR, f"enc_{unique_filename}")
        
        # Save uploaded file temporarily
        with open(original_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Encrypt the file
        encryption_service.encrypt_file(original_path, encrypted_path)
        
        # Get file size
        file_size = os.path.getsize(encrypted_path)
        
        # Create database record
        db_image = MedicalImage(
            study_id=study_id,
            original_filename=file.filename,
            encrypted_file_path=encrypted_path,
            file_type=file.content_type,
            file_size=file_size,
            uploaded_by=current_user.id
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        
        # Remove temporary unencrypted file
        os.remove(original_path)
        
        return {
            "status": "success",
            "data": {
                "id": db_image.id,
                "original_filename": db_image.original_filename,
                "file_type": db_image.file_type,
                "file_size": db_image.file_size,
                "message": "Image uploaded and encrypted successfully"
            }
        }
    
    except Exception as e:
        # Clean up files on error
        if os.path.exists(original_path):
            os.remove(original_path)
        if os.path.exists(encrypted_path):
            os.remove(encrypted_path)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/images/{image_id}", response_model=dict)
def get_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get image metadata (not the file itself)."""
    image = db.query(MedicalImage).filter(MedicalImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return {"status": "success", "data": to_dict(image)}


@router.get("/images/study/{study_id}", response_model=dict)
def get_study_images(
    study_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all images for a study."""
    images = db.query(MedicalImage).filter(MedicalImage.study_id == study_id).all()
    return {"status": "success", "data": [to_dict(img) for img in images]}


@router.get("/images/{image_id}/download")
def download_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("radiologist"))
):
    """Download and decrypt a medical image."""
    from fastapi.responses import FileResponse
    
    image = db.query(MedicalImage).filter(MedicalImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    if not os.path.exists(image.encrypted_file_path):
        raise HTTPException(status_code=404, detail="Image file not found on server")
    
    # Decrypt file to temporary location
    decrypted_path = image.encrypted_file_path.replace("enc_", "dec_", 1)
    
    try:
        encryption_service.decrypt_file(image.encrypted_file_path, decrypted_path)
        
        # Return file and clean up after
        return FileResponse(
            decrypted_path,
            media_type=image.file_type,
            filename=image.original_filename,
            background=None  # You could add cleanup task here
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")
