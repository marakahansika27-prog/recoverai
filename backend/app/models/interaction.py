import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class AgentInteractionBase(SQLModel):
    account_id: str = Field(foreign_key="accounts.id")
    channel: str = "EMAIL"
    proposed_action: str  # OFFER_DISCOUNT, OFFER_PAYMENT_PLAN, ESCALATE_HITL
    proposed_discount_pct: float = 0.0
    proposed_settlement_amount: Optional[float] = None
    policy_verdict: str  # PASSED, BLOCKED, HITL_REQUIRED
    violated_rules: str = "[]"  # JSON string array of rule codes
    message_content: str
    status: str = "SENT"  # SENT, RESPONDED, AWAITING_HUMAN, REJECTED

class AgentInteraction(AgentInteractionBase, table=True):
    __tablename__ = "agent_interactions"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AgentInteractionCreate(AgentInteractionBase):
    pass

class AgentInteractionRead(AgentInteractionBase):
    id: str
    created_at: datetime
