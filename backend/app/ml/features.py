import numpy as np
import pandas as pd

FAILURE_MAP = {
    "INSUFFICIENT_FUNDS": 1,
    "NETWORK_TIMEOUT": 2,
    "CARD_EXPIRED": 3,
    "AUTH_FAILED": 4,
    "SOFT_DECLINE": 5
}

def extract_event_features(event_dict: dict, action: str) -> pd.DataFrame:
    """
    Transforms raw payment event telemetry into numeric feature vector for probability estimation.
    """
    df = pd.DataFrame([event_dict] if isinstance(event_dict, dict) else event_dict)
    
    amount = float(df.get("amount", [1000.0])[0])
    dpd = float(df.get("retry_count", [0])[0])
    failure = str(df.get("failure_reason", ["SOFT_DECLINE"])[0]).upper()
    
    failure_code = FAILURE_MAP.get(failure, 0)
    log_amount = np.log1p(amount)
    is_high_value = 1 if amount >= 10000.0 else 0
    
    # Action encoding
    action_map = {
        "SMART_RETRY": 1,
        "EMAIL_PAYMENT_LINK": 2,
        "SMS_PAYMENT_LINK": 3,
        "ALT_PAYMENT_PROMPT": 4,
        "GRACE_EXTENSION": 5
    }
    action_code = action_map.get(action, 1)
    
    feature_df = pd.DataFrame([{
        "failure_code": failure_code,
        "amount": amount,
        "log_amount": log_amount,
        "is_high_value": is_high_value,
        "retry_count": dpd,
        "action_code": action_code
    }])
    
    return feature_df
