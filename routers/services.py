from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.service import Service
from schemas.clinic import ServiceOut
from routers.dependencies import get_current_active_staff

router = APIRouter(prefix="/services", tags=["Services"], dependencies=[Depends(get_current_active_staff)])


@router.get("", response_model=List[ServiceOut])
async def list_services(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service))
    return result.scalars().all()


@router.get("/{service_id}", response_model=ServiceOut)
async def get_service(service_id: str, db: AsyncSession = Depends(get_db)):
    try:
        uid = UUID(service_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Service not found")
    svc = await db.get(Service, uid)
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    return svc
