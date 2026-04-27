import json
from sqlalchemy.orm import Session
from models.audit_log import AuditLog


def log_action(
    db: Session,
    action: str,
    user_id: int = None,
    username: str = None,
    resource_type: str = None,
    resource_id: int = None,
    ip_address: str = None,
    details: dict = None
):
    """Log an action for audit trail (HIPAA compliance)."""
    entry = AuditLog(
        user_id=user_id,
        username=username,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        details=json.dumps(details) if details else None
    )
    db.add(entry)
    db.commit()
