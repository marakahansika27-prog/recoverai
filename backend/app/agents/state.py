from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class NegotiationMessage(BaseModel):
    sender: str  # USER, AGENT, SYSTEM
    content: str
    action: Optional[Dict[str, Any]] = None
    policy_verdict: Optional[str] = None
    timestamp: Optional[str] = None

class AgentState(BaseModel):
    account_id: str
    customer_name: str
    outstanding_amount: float
    days_past_due: int
    propensity_to_pay: float
    risk_score: float
    history: List[NegotiationMessage] = []
    proposed_action: Optional[Dict[str, Any]] = None
    policy_verdict: Optional[Dict[str, Any]] = None
    is_hitl_escalated: bool = False
    is_resolved: bool = False
