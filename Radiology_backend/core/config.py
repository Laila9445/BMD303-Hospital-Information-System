from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # Database configuration - MUST be set in .env
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://radiology_user:strongpassword@localhost:5432/radiology_db"
    )
    
    APP_NAME: str = "Radiology Center API"
    APP_VERSION: str = "1.0.0"
    
    # Security keys - MUST be set in .env (don't regenerate on every startup)
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "dev-secret-key-change-in-production-DO-NOT-USE-IN-PROD"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Encryption key - MUST be set in .env (required for encrypted_images)
    ENCRYPTION_KEY: str = os.getenv(
        "ENCRYPTION_KEY",
        "dev-encryption-key-change-in-production-DO-NOT-USE-IN-PROD"
    )
    
    ALLOWED_ORIGINS: list = (
        os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")
    )
    
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_REGISTER: str = "3/minute"
    RATE_LIMIT_API: str = "100/minute"

    class Config:
        env_file = ".env"


settings = Settings()



