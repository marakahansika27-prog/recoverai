from typing import Dict, Any

DIAGNOSIS_CATALOG = {
    "INSUFFICIENT_FUNDS": {
        "cause": "INSUFFICIENT_FUNDS_SOFT_DECLINE",
        "confidence": 0.92,
        "reasoning": "Customer bank account has temporary insufficient liquidity. Soft decline typical near month-end; high probability of recovery via scheduled smart retry or salary date alignment."
    },
    "NETWORK_TIMEOUT": {
        "cause": "GATEWAY_NETWORK_TIMEOUT",
        "confidence": 0.96,
        "reasoning": "Transient network failure between issuer bank and payment gateway. Very high recovery probability via immediate or short-delay smart retry."
    },
    "CARD_EXPIRED": {
        "cause": "CARD_EXPIRATION_HARD_DECLINE",
        "confidence": 0.98,
        "reasoning": "Customer payment card has passed expiration date. Retries will fail 100%; requires alternate payment method prompt (UPI / Netbanking / New Card)."
    },
    "AUTH_FAILED": {
        "cause": "3DS_AUTHENTICATION_FAILURE",
        "confidence": 0.89,
        "reasoning": "Customer failed or abandoned 3D-Secure OTP verification step. Recommended intervention is instant SMS payment link or direct payment switch prompt."
    },
    "SOFT_DECLINE": {
        "cause": "BANK_RISK_SOFT_DECLINE",
        "confidence": 0.85,
        "reasoning": "Issuer bank flagged unusual velocity or transaction pattern. Solvable via scheduled retry or SMS checkout link."
    }
}

def diagnose_root_cause(event_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Diagnoses root cause of payment failure / checkout abandonment based on failure telemetry.
    """
    failure_reason = str(event_dict.get("failure_reason", "SOFT_DECLINE")).upper()
    diag = DIAGNOSIS_CATALOG.get(failure_reason, {
        "cause": f"{failure_reason}_UNKNOWN_REASON",
        "confidence": 0.80,
        "reasoning": f"Generic payment failure detected ({failure_reason}). Standard multi-channel recovery flow recommended."
    })
    return diag
