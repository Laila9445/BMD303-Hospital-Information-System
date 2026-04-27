from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from core.db import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)       
    username = Column(String, nullable=True)
    action = Column(String, nullable=False)        
    resource_type = Column(String, nullable=True)  
    resource_id = Column(Integer, nullable=True)   
    ip_address = Column(String, nullable=True)
    details = Column(Text, nullable=True)          
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
