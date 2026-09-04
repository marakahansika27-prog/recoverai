import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class PolicyRuleBase(SQLModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True
    max_retry_attempts: int = 3
    retry_interval_minutes: int = 60
    high_value_hitl_threshold: float = 10000.0  # Amounts >= ₹10,000 force human review
    max_intervention_cost: float = 50.0
    velocity_cap_per_customer: int = 2  # Max 2 interventions per customer in 24 hours

class PolicyRule(PolicyRuleBase, table=True):
    __tablename__ = "policy_rules"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PolicyRuleCreate(PolicyRuleBase):
    pass

class PolicyRuleRead(PolicyRuleBase):
    id: str
    created_at: datetime

class PolicyRuleUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    max_retry_attempts: Optional[int] = None
    retry_interval_minutes: Optional[int] = None
    high_value_hitl_threshold: Optional[float] = None
    max_intervention_cost: Optional[float] = None
    velocity_cap_per_customer: Optional[int] = None
