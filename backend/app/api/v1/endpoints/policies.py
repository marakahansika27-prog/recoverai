from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.policy import PolicyRule, PolicyRuleCreate, PolicyRuleRead, PolicyRuleUpdate

router = APIRouter()

@router.get("/", response_model=List[PolicyRuleRead])
def get_policies(session: Session = Depends(get_session)):
    return session.exec(select(PolicyRule)).all()

@router.get("/active", response_model=PolicyRuleRead)
def get_active_policy(session: Session = Depends(get_session)):
    pol = session.exec(select(PolicyRule).where(PolicyRule.is_active == True)).first()
    if not pol:
        pol = PolicyRule(
            name="Default Merchant Revenue Policy",
            description="Strict policy rules: Max 3 retries, ₹10,000 HITL threshold, max 2 customer contacts/24h",
            is_active=True,
            max_retry_attempts=3,
            retry_interval_minutes=60,
            high_value_hitl_threshold=10000.0,
            max_intervention_cost=50.0,
            velocity_cap_per_customer=2
        )
        session.add(pol)
        session.commit()
        session.refresh(pol)
    return pol

@router.patch("/{policy_id}", response_model=PolicyRuleRead)
def update_policy(policy_id: str, policy_in: PolicyRuleUpdate, session: Session = Depends(get_session)):
    pol = session.get(PolicyRule, policy_id)
    if not pol:
        raise HTTPException(status_code=404, detail="Policy Rule not found")
        
    data = policy_in.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(pol, k, v)
        
    session.add(pol)
    session.commit()
    session.refresh(pol)
    return pol
