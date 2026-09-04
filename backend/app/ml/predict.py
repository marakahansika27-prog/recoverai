from typing import List, Dict, Any

ACTION_COSTS = {
    "SMART_RETRY": 0.0,
    "EMAIL_PAYMENT_LINK": 2.0,
    "SMS_PAYMENT_LINK": 5.0,
    "ALT_PAYMENT_PROMPT": 10.0,
    "GRACE_EXTENSION": 0.0
}

def predict_recovery_probabilities(event_dict: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Predicts action-specific recovery probabilities P(Recovery | Action) and calculates Expected Recovery Value (ERV)
    Formula: ERV = Amount * P(Recovery | Action) - ActionCost
    """
    amount = float(event_dict.get("amount", 1000.0))
    failure_reason = str(event_dict.get("failure_reason", "SOFT_DECLINE")).upper()
    retry_count = int(event_dict.get("retry_count", 0))
    
    # Base probability heuristics calibrated from payment gateway dataset telemetry
    results = []
    actions = ["SMART_RETRY", "EMAIL_PAYMENT_LINK", "SMS_PAYMENT_LINK", "ALT_PAYMENT_PROMPT", "GRACE_EXTENSION"]
    
    for action in actions:
        if failure_reason == "INSUFFICIENT_FUNDS":
            # Smart retries near payday or payment links work best
            if action == "SMART_RETRY":
                prob = max(0.15, 0.82 - (retry_count * 0.22))
            elif action in ["EMAIL_PAYMENT_LINK", "SMS_PAYMENT_LINK"]:
                prob = 0.65
            elif action == "ALT_PAYMENT_PROMPT":
                prob = 0.74
            else:
                prob = 0.50
        elif failure_reason == "NETWORK_TIMEOUT":
            # Immediate or smart retries have near 90%+ success
            if action == "SMART_RETRY":
                prob = max(0.20, 0.91 - (retry_count * 0.15))
            else:
                prob = 0.60
        elif failure_reason == "CARD_EXPIRED":
            # Retries fail 100%, alternate payment prompt or link works best
            if action == "SMART_RETRY":
                prob = 0.05
            elif action == "ALT_PAYMENT_PROMPT":
                prob = 0.88
            elif action in ["EMAIL_PAYMENT_LINK", "SMS_PAYMENT_LINK"]:
                prob = 0.78
            else:
                prob = 0.30
        elif failure_reason == "AUTH_FAILED":
            # 3DS authentication failure -> alternate payment prompt or instant SMS link
            if action == "ALT_PAYMENT_PROMPT":
                prob = 0.84
            elif action == "SMS_PAYMENT_LINK":
                prob = 0.76
            elif action == "SMART_RETRY":
                prob = 0.40
            else:
                prob = 0.60
        else: # SOFT_DECLINE
            if action == "SMART_RETRY":
                prob = max(0.10, 0.85 - (retry_count * 0.20))
            elif action == "ALT_PAYMENT_PROMPT":
                prob = 0.78
            else:
                prob = 0.68
                
        prob = round(min(0.98, max(0.02, prob)), 4)
        cost = ACTION_COSTS.get(action, 0.0)
        erv = round(max(0.0, (amount * prob) - cost), 2)
        
        results.append({
            "action": action,
            "probability": prob,
            "cost": cost,
            "expected_recovery_value": erv
        })
        
    # Sort descending by ERV
    results.sort(key=lambda x: x["expected_recovery_value"], reverse=True)
    return results
