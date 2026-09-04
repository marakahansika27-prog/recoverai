import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class AgentDecisionBase(SQLModel):
    event_id: str = Field(foreign_key="payment_events.id")
    diagnosed_cause: str
    recommended_action: str  # SMART_RETRY, EMAIL_PAYMENT_LINK, SMS_PAYMENT_LINK, ALT_PAYMENT_PROMPT, GRACE_EXTENSION
    predicted_probability: float  # P(Recovery | Action)
    expected_recovery_value: float  # ERV = Amount * P - Cost
    policy_verdict: str  # ALLOWED, BLOCKED, HITL_ESCALATED
    violated_rules: str = "[]"  # JSON list of violated rule codes
    reasoning_summary: str
    execution_status: str = "EXECUTED"  # EXECUTED, BLOCKED, AWAITING_HUMAN, FAILED

class AgentDecision(AgentDecisionBase, table=True):
    __tablename__ = "agent_decisions"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AgentDecisionCreate(AgentDecisionBase):
    pass

class AgentDecisionRead(AgentDecisionBase):
    id: str
    created_at: datetime
