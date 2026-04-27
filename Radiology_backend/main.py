import uuid
import os
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from starlette.middleware.base import BaseHTTPMiddleware
from core.db import engine, Base
from core.config import settings
from core.logging import logger
from core.rate_limit import limiter
from routers import patients, studies, reports, auth, images

# Sentry for error monitoring (optional)
try:
    import sentry_sdk
    if hasattr(settings, 'SENTRY_DSN') and settings.SENTRY_DSN:
        sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=0.1)
except:
    pass

# Initialize FastAPI app
app = FastAPI(
    title="Radiology Center API",
    description="Production-grade backend system for managing radiology center operations with secure authentication and encrypted data",
    version="2.0.0"
)

# Set limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "error": {
                "type": "http_error",
                "message": exc.detail,
            },
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "error": {
                "type": "validation_error",
                "message": "Request validation failed",
                "details": exc.errors(),
            },
        },
    )


@app.exception_handler(OperationalError)
async def database_operational_error_handler(request: Request, exc: OperationalError):
    """PostgreSQL down, wrong host/port, or bad credentials — register/login always need DB."""
    logger.exception("database_operational_error", path=request.url.path)
    return JSONResponse(
        status_code=503,
        content={
            "status": "error",
            "error": {
                "type": "database_unavailable",
                "message": "Cannot connect to PostgreSQL. Start the database service and check DATABASE_URL in .env.",
            },
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("unhandled_exception", path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": {
                "type": "server_error",
                "message": "Unexpected server error",
            },
        },
    )

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request ID Middleware + Structured Logging
class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        logger.info(
            "request",
            method=request.method,
            path=request.url.path,
            request_id=request_id,
            status=response.status_code,
            client_ip=request.client.host if request.client else None
        )
        return response


app.add_middleware(RequestIDMiddleware)


@app.on_event("startup")
def initialize_database():
    if os.getenv("SKIP_DB_INIT", "").lower() in {"1", "true", "yes"}:
        return

    try:
        Base.metadata.create_all(bind=engine)
    except SQLAlchemyError:
        # Keep API process alive; health checks and requests will still surface DB issues.
        logger.exception("database_initialization_failed")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api", tags=["Patients"])
app.include_router(studies.router, prefix="/api", tags=["Studies"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(images.router, prefix="/api", tags=["Medical Images"])


@app.get("/")
def root():
    return {"status": "success", "data": "Welcome to Radiology Center API v2.0"}
