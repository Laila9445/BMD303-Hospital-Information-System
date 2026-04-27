from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ImageBase(BaseModel):
    study_id: int
    file_type: Optional[str] = None


class ImageResponse(ImageBase):
    id: int
    original_filename: str
    encrypted_file_path: str
    file_size: Optional[int] = None
    uploaded_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
