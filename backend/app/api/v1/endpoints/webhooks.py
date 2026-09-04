import uuid
from typing import Dict, Any
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.event import PaymentEvent
from app.agent.loop import run_agent_loop

router = APIRouter()

@router.post("/razorpay")
async def razorpay_webhook_listener(
    request: Request,
    x_razorpay_signature: str = Header(None),
    session: Session = Depends(get_session)
):
    """
    Public Razorpay Webhook Receiver Endpoint.
    Receives live or synthetic Razorpay webhook events (payment.failed, subscription.halted, checkout.abandoned).
    Triggers the Core RecoverAI Agent Loop.
    """
    payload = await request.json()
    event_type_raw = payload.get("event", "payment.failed")
    
    # Map Razorpay event type
    if "payment" in event_type_raw:
        event_type = "PAYMENT_FAILED"
    elif "subscription" in event_type_raw:
        event_type = "SUBSCRIPTION_RENEWAL_FAILED"
    else:
        event_type = "CHECKOUT_ABANDONED"
        
    payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    amount = float(payment_entity.get("amount", 250000)) / 100.0 if payment_entity.get("amount") else 2500.0
    rzp_id = payment_entity.get("id", f"pay_wh_{str(uuid.uuid4())[:8]}")
    reason_code = payment_entity.get("error_reason", "insufficient_funds").upper()
    
    # Create Payment Event
    event = PaymentEvent(
        razorpay_event_id=rzp_id,
        event_type=event_type,
        amount=amount,
        currency=payment_entity.get("currency", "INR"),
        failure_reason=reason_code,
        customer_id=payment_entity.get("email", f"cust_wh_{str(uuid.uuid4())[:6]}"),
        merchant_id=payment_entity.get("merchant_id", "merch_razorpay_live"),
        card_network=payment_entity.get("method", "UPI").upper(),
        status="DETECTED"
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    
    # Run Autonomous Agent Recovery Loop immediately
    agent_output = run_agent_loop(event, session)
    
    return {
        "status": "RECEIVED",
        "razorpay_event_id": rzp_id,
        "revenue_at_risk": amount,
        "agent_loop_output": agent_output
    }
