import uuid
from pydantic import BaseModel, EmailStr

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class StaffProfile(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    role: str
    is_active: bool

    model_config = {
        "from_attributes": True
    }