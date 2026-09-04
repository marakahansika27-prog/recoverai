import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class AccountBase(SQLModel):
    customer_name: str
    email: str
    phone: str
    outstanding_amount: float
    days_past_due: int
    risk_score: float = 0.0
    propensity_to_pay: float = 0.0
    status: str = "NEW"  # NEW, IN_RECOVERY, SETTLED, HITL_ESCALATED, WRITE_OFF
    preferred_channel: str = "EMAIL"  # EMAIL, SMS, WHATSAPP

class Account(AccountBase, table=True):
    __tablename__ = "accounts"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AccountCreate(AccountBase):
    pass

class AccountRead(AccountBase):
    id: str
    created_at: datetime
    updated_at: datetime

class AccountUpdate(SQLModel):
    customer_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    outstanding_amount: Optional[float] = None
    days_past_due: Optional[int] = None
    risk_score: Optional[float] = None
    propensity_to_pay: Optional[float] = None
    status: Optional[str] = None
    preferred_channel: Optional[str] = None
