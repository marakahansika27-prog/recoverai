from sqlmodel import Session, select
from app.core.database import engine, init_db
from app.models.event import PaymentEvent
from app.models.policy import PolicyRule
from app.agent.loop import run_agent_loop
from app.simulator.dataset_generator import generate_synthetic_event_dataset

def seed_database_events(count: int = 50):
    init_db()
    with Session(engine) as session:
        # Ensure default active policy exists
        active_policy = session.exec(select(PolicyRule).where(PolicyRule.is_active == True)).first()
        if not active_policy:
            default_pol = PolicyRule(
                name="Standard Merchant Revenue Protection Policy",
                description="Strict policy limits: Max 3 retries, ₹10,000 HITL threshold, max 2 contacts per customer/24h",
                is_active=True,
                max_retry_attempts=3,
                retry_interval_minutes=60,
                high_value_hitl_threshold=10000.0,
                max_intervention_cost=50.0,
                velocity_cap_per_customer=2
            )
            session.add(default_pol)
            session.commit()

        # Check if events exist
        existing = session.exec(select(PaymentEvent)).first()
        if existing:
            return

        print(f"Seeding {count} synthetic payment failure and checkout events...")
        synthetic_events = generate_synthetic_event_dataset(count)
        
        for e in synthetic_events:
            event = PaymentEvent(
                razorpay_event_id=e["razorpay_event_id"],
                event_type=e["event_type"],
                amount=e["amount"],
                currency=e["currency"],
                failure_reason=e["failure_reason"],
                customer_id=e["customer_id"],
                merchant_id=e["merchant_id"],
                card_network=e["card_network"],
                retry_count=e["retry_count"],
                customer_interventions_24h=e["customer_interventions_24h"],
                status="DETECTED"
            )
            session.add(event)
            session.commit()
            session.refresh(event)
            
            # Execute Agent Loop for initial seeding
            run_agent_loop(event, session)
            
        print("Database event seeding completed successfully.")

if __name__ == "__main__":
    seed_database_events(50)
