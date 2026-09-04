from typing import Dict, Any

def execute_recovery_action(event_id: str, action: str, amount: float) -> Dict[str, Any]:
    """
    Executes an authorized recovery intervention.
    In production, integrates with Razorpay Smart Retry API, SMS/Email gateway, or Webhook dispatcher.
    """
    if action == "SMART_RETRY":
        return {
            "status": "EXECUTED",
            "action": action,
            "message": f"Smart Retry payload dispatched for transaction event {event_id}."
        }
    elif action in ["EMAIL_PAYMENT_LINK", "SMS_PAYMENT_LINK"]:
        payment_link = f"https://pay.razorpay.com/rec/{event_id}?amt={amount:.2f}"
        return {
            "status": "EXECUTED",
            "action": action,
            "payment_link": payment_link,
            "message": f"Payment recovery link generated and sent via {action}."
        }
    elif action == "ALT_PAYMENT_PROMPT":
        return {
            "status": "EXECUTED",
            "action": action,
            "message": "Prompted customer in checkout session to switch payment method to UPI / Netbanking."
        }
    elif action == "GRACE_EXTENSION":
        return {
            "status": "EXECUTED",
            "action": action,
            "message": "Subscription grace period extended by 3 calendar days."
        }
    return {
        "status": "FAILED",
        "action": action,
        "message": "Unknown action type."
    }
