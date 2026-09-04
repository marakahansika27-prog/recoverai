from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.decision import AgentDecision, AgentDecisionRead

router = APIRouter()

@router.get("/", response_model=List[AgentDecisionRead])
def get_agent_decisions(
    policy_verdict: Optional[str] = None,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    query = select(AgentDecision)
    if policy_verdict:
        query = query.where(AgentDecision.policy_verdict == policy_verdict)
    return session.exec(query.order_by(AgentDecision.created_at.desc()).limit(limit)).all()
