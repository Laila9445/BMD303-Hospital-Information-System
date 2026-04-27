from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Annotated

from database import get_db
from models.staff import Staff, StaffRole
from core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_staff(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        staff_id: str = payload.get("sub")
        if staff_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    stmt = select(Staff).where(Staff.id == staff_id)
    result = await db.execute(stmt)
    staff = result.scalars().first()
    
    if staff is None:
        raise credentials_exception
        
    return staff

async def get_current_active_staff(
    current_staff: Annotated[Staff, Depends(get_current_staff)]
):
    if not current_staff.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_staff

# RBAC Dependency Factory
def require_roles(allowed_roles: list[StaffRole]):
    async def role_dependency(current_staff: Annotated[Staff, Depends(get_current_active_staff)]):
        if current_staff.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this endpoint"
            )
        return current_staff
    return role_dependency