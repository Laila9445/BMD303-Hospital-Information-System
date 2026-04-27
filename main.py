from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.exceptions import HTTPException as StarletteHTTPException

from database import get_db
from routers import services, referrals, patients, appointments, sessions, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="PhysioTherapy Clinic",
    description="Backend API for a physiotherapy clinic management system.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(services.router,     prefix="/api")
app.include_router(referrals.router,    prefix="/api")
app.include_router(patients.router,     prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(sessions.router,     prefix="/api")
app.include_router(auth.router,         prefix="/api")
# ---------------------------------------------------------------------------
# Global exception handlers
# ---------------------------------------------------------------------------
_HTTP_ERROR_CODES = {
    404: "not_found",
    409: "conflict",
    422: "validation_error",
}


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    error = _HTTP_ERROR_CODES.get(exc.status_code, "error")
    if exc.status_code == 422:
        detail = exc.detail if isinstance(exc.detail, list) else [{"msg": exc.detail}]
    else:
        detail = exc.detail
    return JSONResponse(status_code=exc.status_code, content={"error": error, "detail": detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"error": "validation_error", "detail": jsonable_encoder(exc.errors())},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"error": "server_error", "detail": "An unexpected error occurred"},
    )


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Admin – seed
# ---------------------------------------------------------------------------
from routers.dependencies import require_roles
from models.staff import StaffRole

@app.post("/admin/seed", tags=["Admin"], dependencies=[Depends(require_roles([StaffRole.admin]))])
async def run_seed(db: AsyncSession = Depends(get_db)):
    """Idempotent: inserts the clinic services and staff if the table is empty."""
    from data.seed import seed_services, seed_staff
    added_services = await seed_services(db)
    added_staff = await seed_staff(db)
    return {
        "seeded_services": added_services,
        "seeded_staff": added_staff,
        "message": f"{added_services} services and {added_staff} staff added." if (added_services or added_staff) else "Already seeded — nothing changed.",
    }

@app.get("/admin/staff", tags=["Admin"], dependencies=[Depends(require_roles([StaffRole.admin]))])
async def list_staff(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from models.staff import Staff
    from schemas.clinic import StaffOut
    result = await db.execute(select(Staff))
    staff_members = result.scalars().all()
    # Serialize manually or rely on fastapi response_model.
    # Since we didn't add response_model, let's just return list of dicts or pydantic objects.
    return [StaffOut.model_validate(s) for s in staff_members]
