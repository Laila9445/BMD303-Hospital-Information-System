from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta, datetime, timezone

from database import get_db
from models.staff import Staff
from models.refresh_token import RefreshToken
from schemas.auth import TokenResponse, LoginRequest, RefreshRequest, StaffProfile
from core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_token,
)
from core.config import settings
from .dependencies import get_current_staff

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Find active user
    stmt = select(Staff).where(Staff.email == request.email, Staff.is_active == True)
    result = await db.execute(stmt)
    staff = result.scalars().first()

    if not staff or not verify_password(request.password, staff.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

   
    access_token = create_access_token(
        data={"sub": str(staff.id)}
    )

    refresh_token = create_refresh_token({"sub": str(staff.id)})
    refresh_token_hash = hash_token(refresh_token)

    
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    db_token = RefreshToken(
        staff_id=staff.id,
        token_hash=refresh_token_hash,
        expires_at=expires_at
    )
    db.add(db_token)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    token_hash = hash_token(request.refresh_token)
    
    # Verify token
    stmt = select(RefreshToken).where(
        RefreshToken.token_hash == token_hash,
        RefreshToken.is_revoked == False
    )
    result = await db.execute(stmt)
    db_token = result.scalars().first()

    if not db_token or db_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    # active
    staff_stmt = select(Staff).where(Staff.id == db_token.staff_id)
    staff_res = await db.execute(staff_stmt)
    staff = staff_res.scalars().first()

    if not staff or not staff.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")

    # Gen new access
    access_token = create_access_token(
        data={"sub": str(staff.id)}
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=request.refresh_token # Return same refresh token
    )

@router.post("/logout")
async def logout(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    token_hash = hash_token(request.refresh_token)
    stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash) 
    result = await db.execute(stmt)
    db_token = result.scalars().first()

    if db_token:
        db_token.is_revoked = True
        await db.commit()

    return {"detail": "Successfully logged out"}

@router.get("/me", response_model=StaffProfile)
async def read_users_me(current_user: Staff = Depends(get_current_staff)):
    return current_user