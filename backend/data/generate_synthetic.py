import random
from sqlmodel import Session, select
from app.core.database import engine, init_db
from app.models.account import Account
from app.models.policy import Policy
from app.ml.predict import predict_account_scores

FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Riley", "Casey", "Avery", "Cameron", "Dakota", "Reese", "Quinn", "Skyler"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson"]
DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "enterprise.org", "acme-corp.com"]

def seed_database(count: int = 50):
    init_db()
    with Session(engine) as session:
        # Check if accounts already exist
        existing = session.exec(select(Account)).first()
        if existing:
            print("Database already contains seed data.")
            return

        # Ensure default active policy exists
        active_policy = session.exec(select(Policy).where(Policy.is_active == True)).first()
        if not active_policy:
            default_pol = Policy(
                name="Standard Compliance Policy",
                description="Default policy ceiling with 20% max discount and $5,000 HITL threshold",
                is_active=True,
                max_discount_pct=0.20,
                max_contact_attempts_per_week=3,
                auto_hitl_threshold_amount=5000.0,
                min_installment_amount=100.0
            )
            session.add(default_pol)
            session.commit()

        print(f"Generating {count} synthetic delinquent accounts...")
        for i in range(count):
            fname = random.choice(FIRST_NAMES)
            lname = random.choice(LAST_NAMES)
            name = f"{fname} {lname}"
            email = f"{fname.lower()}.{lname.lower()}{random.randint(10,99)}@{random.choice(DOMAINS)}"
            phone = f"+1 (555) {random.randint(100,999)}-{random.randint(1000,9999)}"
            
            # Skew balance amounts (some enterprise > $5,000, some standard < $3,000)
            if random.random() < 0.25:
                amount = round(random.uniform(5000.0, 25000.0), 2)
            else:
                amount = round(random.uniform(400.0, 4800.0), 2)
                
            dpd = random.randint(15, 120)
            status = random.choice(["NEW", "IN_RECOVERY", "NEW", "IN_RECOVERY", "SETTLED"])
            
            acc = Account(
                customer_name=name,
                email=email,
                phone=phone,
                outstanding_amount=amount,
                days_past_due=dpd,
                status=status,
                preferred_channel=random.choice(["EMAIL", "SMS", "WHATSAPP"])
            )
            
            # Predict ML propensity and risk scores
            scores = predict_account_scores(acc.dict())
            acc.risk_score = scores["risk_score"]
            acc.propensity_to_pay = scores["propensity_to_pay"]
            
            session.add(acc)

        session.commit()
        print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database(50)
