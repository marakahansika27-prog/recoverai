from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.audit import AuditLog, AuditLogRead

router = APIRouter()

@router.get("/", response_model=List[AuditLogRead])
def get_audit_logs(limit: int = 100, session: Session = Depends(get_session)):
    return session.exec(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)).all()
