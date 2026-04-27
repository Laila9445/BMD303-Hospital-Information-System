from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.db import Base


class MedicalImage(Base):
    __tablename__ = "medical_images"

    id = Column(Integer, primary_key=True, index=True)
    study_id = Column(Integer, ForeignKey("studies.id"), nullable=False)
    original_filename = Column(String, nullable=False)
    encrypted_file_path = Column(String, nullable=False)  
    file_type = Column(String)  # DICOM, PNG, JPEG, etc.
    file_size = Column(Integer)  # Size in bytes
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    study = relationship("Study")
    uploader = relationship("User")
