from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from routers import appointments, staff, billing

app = FastAPI(title="Radiology System")

# ─── Global Error Handlers ────────────────────────────
@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=409,
        content={"status": "error", "message": "Database conflict — duplicate or invalid reference"}
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Database error occurred"}
    )

@app.exception_handler(Exception)
async def general_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": str(exc)}
    )

# ─── Routers ──────────────────────────────────────────
app.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
app.include_router(staff.router, prefix="/staff", tags=["Staff"])
app.include_router(billing.router, prefix="/billing", tags=["Billing"])