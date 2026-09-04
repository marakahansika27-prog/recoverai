import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.account import Account
from app.models.policy import Policy
from app.models.interaction import AgentInteraction
from app.models.hitl import HITLTask
from app.agents.state import AgentState
from app.agents.nodes import process_negotiation_turn
from app.policy_engine.evaluator import PolicyRules

router = APIRouter()

class ChatRequest(BaseModel):
    account_id: str
    user_message: str

@router.post("/chat")
def chat_with_agent(req: ChatRequest, session: Session = Depends(get_session)):
    acc = session.get(Account, req.account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
        
    # Get active policy or default policy rules
    active_policy = session.exec(select(Policy).where(Policy.is_active == True)).first()
    policy_rules = PolicyRules()
    if active_policy:
        policy_rules = PolicyRules(
            max_discount_pct=active_policy.max_discount_pct,
            max_contact_attempts_per_week=active_policy.max_contact_attempts_per_week,
            quiet_hours_start=active_policy.quiet_hours_start,
            quiet_hours_end=active_policy.quiet_hours_end,
            auto_hitl_threshold_amount=active_policy.auto_hitl_threshold_amount,
            min_installment_amount=active_policy.min_installment_amount
        )
        
    state = AgentState(
        account_id=acc.id,
        customer_name=acc.customer_name,
        outstanding_amount=acc.outstanding_amount,
        days_past_due=acc.days_past_due,
        propensity_to_pay=acc.propensity_to_pay,
        risk_score=acc.risk_score
    )
    
    updated_state = process_negotiation_turn(state, req.user_message, policy_rules)
    last_msg = updated_state.history[-1]
    
    # Save interaction log
    interaction = AgentInteraction(
        account_id=acc.id,
        proposed_action=updated_state.proposed_action.get("action_type", "OFFER_PAYMENT_PLAN") if updated_state.proposed_action else "OFFER_PAYMENT_PLAN",
        proposed_discount_pct=updated_state.proposed_action.get("discount_pct", 0.0) if updated_state.proposed_action else 0.0,
        proposed_settlement_amount=updated_state.proposed_action.get("settlement_amount") if updated_state.proposed_action else None,
        policy_verdict=updated_state.policy_verdict.get("verdict", "PASSED") if updated_state.policy_verdict else "PASSED",
        violated_rules=json.dumps(updated_state.policy_verdict.get("violations", [])) if updated_state.policy_verdict else "[]",
        message_content=last_msg.content,
        status="AWAITING_HUMAN" if updated_state.is_hitl_escalated else "SENT"
    )
    session.add(interaction)
    session.commit()
    session.refresh(interaction)
    
    # If HITL escalated, create HITL task entry
    if updated_state.is_hitl_escalated:
        acc.status = "HITL_ESCALATED"
        session.add(acc)
        
        hitl = HITLTask(
            account_id=acc.id,
            interaction_id=interaction.id,
            trigger_reason=" ".join(updated_state.policy_verdict.get("violations", ["HIGH_VALUE_THRESHOLD"])),
            proposed_settlement_amount=updated_state.proposed_action.get("settlement_amount", acc.outstanding_amount) if updated_state.proposed_action else acc.outstanding_amount,
            proposed_discount_pct=updated_state.proposed_action.get("discount_pct", 0.0) if updated_state.proposed_action else 0.0,
            status="PENDING"
        )
        session.add(hitl)
        session.commit()
        
    return {
        "agent_message": last_msg.content,
        "policy_verdict": updated_state.policy_verdict,
        "is_hitl_escalated": updated_state.is_hitl_escalated,
        "history": [msg.dict() for msg in updated_state.history]
    }
