import json
from datetime import datetime
from typing import Dict, Any
from sqlmodel import Session, select

from app.models.event import PaymentEvent
from app.models.policy import PolicyRule
from app.models.decision import AgentDecision
from app.models.audit import AuditLog
from app.agent.diagnosis import diagnose_root_cause
from app.ml.predict import predict_recovery_probabilities
from app.policy_engine.evaluator import DeterministicPolicyEngine
from app.executor.actions import execute_recovery_action

def run_agent_loop(event: PaymentEvent, session: Session) -> Dict[str, Any]:
    """
    Executes the Core Agent Recovery Loop:
    EVENT -> DETECT REVENUE AT RISK -> DIAGNOSE -> PREDICT RECOVERY BY ACTION -> CALCULATE ERV -> SELECT ACTION -> POLICY GATE -> EXECUTE/BLOCK/ESCALATE -> AUDIT
    """
    event_dict = event.dict()
    
    # 1. Detect Revenue at Risk
    revenue_at_risk = event.amount
    
    # 2. Diagnose Root Cause
    diagnosis = diagnose_root_cause(event_dict)
    
    # 3. Predict Action-Specific Recovery Probabilities & Calculate ERV for all candidate actions
    predictions = predict_recovery_probabilities(event_dict)
    
    # 4. Fetch Active Policy Rules
    active_policy = session.exec(select(PolicyRule).where(PolicyRule.is_active == True)).first()
    max_retries = active_policy.max_retry_attempts if active_policy else 3
    hitl_threshold = active_policy.high_value_hitl_threshold if active_policy else 10000.0
    velocity_cap = active_policy.velocity_cap_per_customer if active_policy else 2

    # 5. Evaluate candidate actions in descending ERV rank order through Policy Engine (PEP Gatekeeper)
    selected_prediction = None
    selected_policy_verdict = None

    for pred in predictions:
        verdict = DeterministicPolicyEngine.evaluate(
            event_amount=event.amount,
            retry_count=event.retry_count,
            customer_interventions_24h=event.customer_interventions_24h,
            proposed_action=pred["action"],
            max_retry_attempts=max_retries,
            high_value_hitl_threshold=hitl_threshold,
            velocity_cap_per_customer=velocity_cap
        )
        if verdict.passed:
            selected_prediction = pred
            selected_policy_verdict = verdict
            break

    # If no candidate action passed (e.g. HITL required or velocity cap reached or retry limit exceeded on all), select top ERV candidate with its PEP verdict
    if not selected_prediction:
        selected_prediction = predictions[0]
        selected_policy_verdict = DeterministicPolicyEngine.evaluate(
            event_amount=event.amount,
            retry_count=event.retry_count,
            customer_interventions_24h=event.customer_interventions_24h,
            proposed_action=selected_prediction["action"],
            max_retry_attempts=max_retries,
            high_value_hitl_threshold=hitl_threshold,
            velocity_cap_per_customer=velocity_cap
        )

    recommended_action = selected_prediction["action"]
    predicted_prob = selected_prediction["probability"]
    erv = selected_prediction["expected_recovery_value"]

    # 6. Execute / Block / Escalate & Outcome Verification
    execution_result = "PENDING"
    if selected_policy_verdict.verdict == "ALLOWED":
        execution_status = execute_recovery_action(event.id, recommended_action, event.amount)
        execution_result = execution_status["status"]
        if recommended_action == "SMART_RETRY":
            event.retry_count += 1
        event.customer_interventions_24h += 1
        event.status = "IN_RECOVERY"
    elif selected_policy_verdict.verdict == "HITL_ESCALATED":
        execution_result = "AWAITING_HUMAN"
        event.status = "HITL_ESCALATED"
    else: # BLOCKED
        execution_result = "BLOCKED"
        event.status = "BLOCKED"

    session.add(event)

    # 7. Record Agent Decision Log
    decision = AgentDecision(
        event_id=event.id,
        diagnosed_cause=diagnosis["cause"],
        recommended_action=recommended_action,
        predicted_probability=predicted_prob,
        expected_recovery_value=erv,
        policy_verdict=selected_policy_verdict.verdict,
        violated_rules=json.dumps(selected_policy_verdict.violations),
        reasoning_summary=diagnosis["reasoning"],
        execution_status=execution_result
    )
    session.add(decision)

    # 8. Record Immutable Audit Log
    audit = AuditLog(
        event_id=event.id,
        actor="AGENT_PEP_LOOP",
        action_taken=f"{selected_policy_verdict.verdict}:{recommended_action}",
        details_json=json.dumps({
            "diagnosis": diagnosis,
            "selected_action": recommended_action,
            "erv": erv,
            "policy_verdict": selected_policy_verdict.dict(),
            "execution": execution_result
        })
    )
    session.add(audit)
    session.commit()
    session.refresh(decision)

    return {
        "event_id": event.id,
        "revenue_at_risk": revenue_at_risk,
        "diagnosis": diagnosis,
        "predictions": predictions,
        "selected_action": recommended_action,
        "policy_verdict": selected_policy_verdict.dict(),
        "execution_status": execution_result
    }
