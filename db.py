from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# PostgreSQL connection URL.
# Replace username, password, host, port, and database name with your own values.
DATABASE_URL = "postgresql+psycopg2://postgres:1234@localhost:5432/radiology_db"

# SQLAlchemy engine handles the DB connection pool.
engine = create_engine(DATABASE_URL)

# SessionLocal creates a new database session for each request.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class used by all ORM models.
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a DB session and closes it after request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
Base.metadata.create_all(bind=engine)