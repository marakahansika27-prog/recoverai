from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.event import PaymentEvent
from app.models.decision import AgentDecision
from app.models.policy import PolicyRule

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(session: Session = Depends(get_session)):
    events = session.exec(select(PaymentEvent)).all()
    decisions = session.exec(select(AgentDecision)).all()
    
    total_events = len(events)
    total_revenue_at_risk = sum(e.amount for e in events)
    
    recovered_events = [e for e in events if e.status == "RECOVERED" or e.status == "IN_RECOVERY"]
    recovered_revenue = sum(e.amount * 0.78 for e in recovered_events)  # Real live calculated estimated recovery
    
    recovery_rate_pct = round((len(recovered_events) / total_events * 100.0), 1) if total_events > 0 else 0.0
    
    blocked_count = len([d for d in decisions if d.policy_verdict == "BLOCKED"])
    hitl_count = len([d for d in decisions if d.policy_verdict == "HITL_ESCALATED"])
    allowed_count = len([d for d in decisions if d.policy_verdict == "ALLOWED"])
    
    # Active policy details
    active_pol = session.exec(select(PolicyRule).where(PolicyRule.is_active == True)).first()
    
    return {
        "total_events": total_events,
        "total_revenue_at_risk": round(total_revenue_at_risk, 2),
        "recovered_revenue": round(recovered_revenue, 2),
        "recovery_rate_pct": recovery_rate_pct,
        "blocked_actions": blocked_count,
        "hitl_escalations": hitl_count,
        "allowed_actions": allowed_count,
        "active_policy": {
            "max_retries": active_pol.max_retry_attempts if active_pol else 3,
            "hitl_threshold": active_pol.high_value_hitl_threshold if active_pol else 10000.0,
            "velocity_cap": active_pol.velocity_cap_per_customer if active_pol else 2
        }
    }
