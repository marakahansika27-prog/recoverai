import datetime
from app.agents.state import AgentState, NegotiationMessage
from app.policy_engine.evaluator import PolicyEvaluator, ProposedAction, PolicyRules
from app.agents.tools import generate_payment_link, format_installment_plan

def process_negotiation_turn(state: AgentState, user_input: str, policy: PolicyRules) -> AgentState:
    """
    Processes a single turn in the negotiation conversation.
    Applies the LLM reasoning simulation + Deterministic Policy Engine PEP.
    """
    now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    
    # Add user message to history
    state.history.append(NegotiationMessage(sender="USER", content=user_input, timestamp=now_str))
    
    input_lower = user_input.lower()
    balance = state.outstanding_amount
    
    # Determine LLM proposed action based on user intent
    proposed_discount = 0.0
    action_type = "OFFER_PAYMENT_PLAN"
    months = 3
    
    if "discount" in input_lower or "reduction" in input_lower or "cheaper" in input_lower or "settle" in input_lower:
        if "30%" in input_lower or "heavy" in input_lower or "half" in input_lower or "50%" in input_lower:
            proposed_discount = 0.30
        elif "25%" in input_lower:
            proposed_discount = 0.25
        else:
            proposed_discount = 0.15
        action_type = "OFFER_DISCOUNT"
    elif "month" in input_lower or "plan" in input_lower or "installment" in input_lower or "split" in input_lower:
        action_type = "OFFER_PAYMENT_PLAN"
        months = 6 if "6" in input_lower else 3
        proposed_discount = 0.05
    else:
        # Default friendly reminder / initial payment plan
        action_type = "OFFER_PAYMENT_PLAN"
        proposed_discount = 0.10
        months = 3

    monthly_pay = round((balance * (1.0 - proposed_discount)) / months, 2)
    
    action_obj = ProposedAction(
        action_type=action_type,
        discount_pct=proposed_discount,
        settlement_amount=round(balance * (1.0 - proposed_discount), 2),
        monthly_installment=monthly_pay,
        installment_months=months
    )
    
    # Deterministic Policy Engine Gatekeeper Evaluation
    verdict = PolicyEvaluator.evaluate(account_balance=balance, action=action_obj, policy=policy)
    
    state.policy_verdict = verdict.dict()
    state.proposed_action = action_obj.dict()
    
    if verdict.passed:
        payment_link = generate_payment_link(state.account_id, action_obj.settlement_amount)
        if action_type == "OFFER_DISCOUNT":
            agent_msg = (
                f"We can offer you a {proposed_discount*100:.0f}% settlement discount, reducing your total "
                f"from ${balance:,.2f} to ${action_obj.settlement_amount:,.2f}. "
                f"You can settle this today using your secure payment link: {payment_link}"
            )
        else:
            plan = format_installment_plan(balance, months, proposed_discount)
            agent_msg = (
                f"I can set up a {months}-month payment plan for you at ${plan['monthly_payment']:,.2f}/month "
                f"(including a {proposed_discount*100:.0f}% early commitment discount). "
                f"Click here to confirm: {payment_link}"
            )
        
        state.history.append(NegotiationMessage(
            sender="AGENT",
            content=agent_msg,
            action=action_obj.dict(),
            policy_verdict="PASSED",
            timestamp=now_str
        ))
    else:
        # Policy Violated or HITL Escalation Triggered!
        if verdict.hitl_required:
            state.is_hitl_escalated = True
            agent_msg = (
                f"Thank you for your request. Because your account balance of ${balance:,.2f} qualifies for custom enterprise terms, "
                f"I have routed this proposal to a Compliance Officer for human approval. We will update you shortly."
            )
        else:
            counter = verdict.suggested_counter_offer
            max_disc = counter["max_allowed_discount_pct"] * 100 if counter else 20.0
            allowed_amt = balance * (1.0 - (max_disc / 100.0))
            agent_msg = (
                f"I requested a {proposed_discount*100:.0f}% discount, but our compliance policy limits standard discounts "
                f"to {max_disc:.0f}%. However, I can immediately grant you a {max_disc:.0f}% discount, bringing your balance to ${allowed_amt:,.2f}."
            )
            
        state.history.append(NegotiationMessage(
            sender="AGENT",
            content=agent_msg,
            action=action_obj.dict(),
            policy_verdict=verdict.verdict,
            timestamp=now_str
        ))
        
    return state
