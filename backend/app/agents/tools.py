from typing import Dict, Any

def generate_payment_link(account_id: str, amount: float) -> str:
    """Generates a secure mock payment checkout link."""
    return f"https://pay.recoverai.com/checkout/{account_id}?amt={amount:.2f}"

def format_installment_plan(total_balance: float, months: int, discount_pct: float = 0.0) -> Dict[str, Any]:
    """Calculates monthly payment terms."""
    discounted_total = total_balance * (1.0 - discount_pct)
    monthly_payment = round(discounted_total / max(1, months), 2)
    return {
        "original_balance": total_balance,
        "discount_pct": discount_pct,
        "discounted_total": discounted_total,
        "months": months,
        "monthly_payment": monthly_payment
    }
