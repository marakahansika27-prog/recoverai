import random
import uuid
from typing import List, Dict, Any

EVENT_TYPES = ["PAYMENT_FAILED", "CHECKOUT_ABANDONED", "SUBSCRIPTION_RENEWAL_FAILED"]
FAILURE_REASONS = ["INSUFFICIENT_FUNDS", "NETWORK_TIMEOUT", "CARD_EXPIRED", "AUTH_FAILED", "SOFT_DECLINE"]
CARD_NETWORKS = ["Visa", "Mastercard", "RuPay", "UPI", "Netbanking"]

def generate_synthetic_event_dataset(count: int = 10000) -> List[Dict[str, Any]]:
    """
    Generates a deterministic synthetic dataset of 10,000 payment events
    with realistic distribution of amounts, failure reasons, and customer history.
    """
    random.seed(42)  # Deterministic seed for repeatable demo simulation
    events = []
    
    for i in range(count):
        # Skew amounts: 70% standard (₹200 - ₹4,500), 25% mid (₹5,000 - ₹9,500), 5% high (₹10,000 - ₹45,000)
        rand_val = random.random()
        if rand_val < 0.70:
            amount = round(random.uniform(250.0, 4500.0), 2)
        elif rand_val < 0.95:
            amount = round(random.uniform(5000.0, 9500.0), 2)
        else:
            amount = round(random.uniform(10000.0, 45000.0), 2)
            
        failure = random.choice(FAILURE_REASONS)
        event_type = random.choice(EVENT_TYPES)
        customer_id = f"cust_{random.randint(1000, 9999)}"
        retry_count = random.choice([0, 0, 0, 1, 2, 3, 4])
        interventions_24h = random.choice([0, 0, 1, 2, 3])
        
        events.append({
            "id": str(uuid.uuid4()),
            "razorpay_event_id": f"pay_k{random.randint(1000000, 9999999)}",
            "event_type": event_type,
            "amount": amount,
            "currency": "INR",
            "failure_reason": failure,
            "customer_id": customer_id,
            "merchant_id": "merch_razorpay_default",
            "card_network": random.choice(CARD_NETWORKS),
            "retry_count": retry_count,
            "customer_interventions_24h": interventions_24h
        })
        
    return events
