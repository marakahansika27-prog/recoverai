import random

def simulate_customer_decision(propensity_score: float, discount_pct: float, months: int) -> bool:
    """
    Simulates whether a synthetic customer accepts an offered settlement or payment plan.
    Acceptance probability increases with propensity score and discount percentage.
    """
    base_prob = propensity_score * 0.5
    discount_boost = discount_pct * 1.2
    plan_boost = min(0.2, months * 0.03)
    
    total_prob = min(0.95, max(0.05, base_prob + discount_boost + plan_boost))
    return random.random() < total_prob
