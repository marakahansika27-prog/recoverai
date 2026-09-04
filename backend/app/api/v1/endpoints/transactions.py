from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.event import PaymentEvent, PaymentEventRead
from app.models.decision import AgentDecision
from app.models.audit import AuditLog

router = APIRouter()

@router.get("/", response_model=List[PaymentEventRead])
def get_transactions(
    event_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    query = select(PaymentEvent)
    if event_type:
        query = query.where(PaymentEvent.event_type == event_type)
    if status:
        query = query.where(PaymentEvent.status == status)
    return session.exec(query.order_by(PaymentEvent.created_at.desc()).limit(limit)).all()

@router.get("/{event_id}")
def get_transaction_detail_timeline(event_id: str, session: Session = Depends(get_session)):
    event = session.get(PaymentEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Transaction Event not found")
        
    decisions = session.exec(select(AgentDecision).where(AgentDecision.event_id == event_id)).all()
    audit_logs = session.exec(select(AuditLog).where(AuditLog.event_id == event_id).order_by(AuditLog.timestamp.asc())).all()
    
    return {
        "event": event,
        "decisions": decisions,
        "audit_timeline": audit_logs
    }
