import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class PaymentEventBase(SQLModel):
    razorpay_event_id: str = Field(index=True)
    event_type: str  # PAYMENT_FAILED, CHECKOUT_ABANDONED, SUBSCRIPTION_RENEWAL_FAILED
    amount: float
    currency: str = "INR"
    failure_reason: str  # INSUFFICIENT_FUNDS, NETWORK_TIMEOUT, CARD_EXPIRED, AUTH_FAILED, SOFT_DECLINE
    customer_id: str
    merchant_id: str = "merch_razorpay_default"
    card_network: Optional[str] = "UPI"  # Visa, Mastercard, RuPay, UPI, Netbanking
    status: str = "DETECTED"  # DETECTED, IN_RECOVERY, RECOVERED, RECOVERY_FAILED, STOPPED, BLOCKED, HITL_ESCALATED
    retry_count: int = 0
    customer_interventions_24h: int = 0

class PaymentEvent(PaymentEventBase, table=True):
    __tablename__ = "payment_events"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentEventCreate(PaymentEventBase):
    pass

class PaymentEventRead(PaymentEventBase):
    id: str
    created_at: datetime
    updated_at: datetime
