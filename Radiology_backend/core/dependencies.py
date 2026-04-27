from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from core.db import get_db


def get_database(db: Session = Depends(get_db)):
    return db
