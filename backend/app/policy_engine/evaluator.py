from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class PolicyVerdict(BaseModel):
    verdict: str  # ALLOWED, BLOCKED, HITL_ESCALATED
    passed: bool
    hitl_required: bool
    violations: List[str]
    checked_rules: List[str]

class DeterministicPolicyEngine:
    @staticmethod
    def evaluate(
        event_amount: float,
        retry_count: int,
        customer_interventions_24h: int,
        proposed_action: str,
        max_retry_attempts: int = 3,
        high_value_hitl_threshold: float = 10000.0,
        velocity_cap_per_customer: int = 2
    ) -> PolicyVerdict:
        violations = []
        checked_rules = ["MAX_RETRY_STOPPING_RULE", "HIGH_VALUE_HITL_THRESHOLD", "VELOCITY_CAP_PER_CUSTOMER"]
        hitl_required = False
        
        # Rule 1: Stopping Rule — Max Retry Limit Exceeded
        if proposed_action == "SMART_RETRY" and retry_count >= max_retry_attempts:
            violations.append(
                f"MAX_RETRIES_EXCEEDED: Retry attempt ({retry_count}) reached policy stopping rule limit ({max_retry_attempts})"
            )
            
        # Rule 2: High Value Transaction HITL Threshold
        if event_amount >= high_value_hitl_threshold:
            hitl_required = True
            violations.append(
                f"HIGH_VALUE_HITL_REQUIRED: Transaction amount (₹{event_amount:,.2f}) >= threshold (₹{high_value_hitl_threshold:,.2f}) requires human authorization"
            )
            
        # Rule 3: Velocity Cap Per Customer (Prevent spamming customer)
        if customer_interventions_24h >= velocity_cap_per_customer:
            violations.append(
                f"VELOCITY_CAP_EXCEEDED: Customer reached max 24h interventions limit ({velocity_cap_per_customer})"
            )

        if violations:
            verdict = "HITL_ESCALATED" if hitl_required else "BLOCKED"
            return PolicyVerdict(
                verdict=verdict,
                passed=False,
                hitl_required=hitl_required or verdict == "HITL_ESCALATED",
                violations=violations,
                checked_rules=checked_rules
            )

        return PolicyVerdict(
            verdict="ALLOWED",
            passed=True,
            hitl_required=False,
            violations=[],
            checked_rules=checked_rules
        )
