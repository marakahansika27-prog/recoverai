import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class HITLTaskBase(SQLModel):
    account_id: str = Field(foreign_key="accounts.id")
    interaction_id: Optional[str] = Field(default=None, foreign_key="agent_interactions.id")
    trigger_reason: str
    proposed_settlement_amount: float
    proposed_discount_pct: float = 0.0
    status: str = "PENDING"  # PENDING, APPROVED, MODIFIED, REJECTED
    reviewer_notes: Optional[str] = None

class HITLTask(HITLTaskBase, table=True):
    __tablename__ = "hitl_tasks"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

class HITLTaskCreate(HITLTaskBase):
    pass

class HITLTaskRead(HITLTaskBase):
    id: str
    created_at: datetime
    resolved_at: Optional[datetime]

class HITLResolveRequest(SQLModel):
    decision: str  # APPROVED, MODIFIED, REJECTED
    reviewer_notes: Optional[str] = None
    override_discount_pct: Optional[float] = None
