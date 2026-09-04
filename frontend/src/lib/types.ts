export interface PaymentEvent {
  id: string;
  razorpay_event_id: string;
  event_type: 'PAYMENT_FAILED' | 'CHECKOUT_ABANDONED' | 'SUBSCRIPTION_RENEWAL_FAILED';
  amount: number;
  currency: string;
  failure_reason: string;
  customer_id: string;
  merchant_id: string;
  card_network?: string;
  status: 'DETECTED' | 'IN_RECOVERY' | 'RECOVERED' | 'RECOVERY_FAILED' | 'STOPPED' | 'BLOCKED' | 'HITL_ESCALATED';
  retry_count: number;
  customer_interventions_24h: number;
  created_at: string;
  updated_at: string;
}

export interface AgentDecision {
  id: string;
  event_id: string;
  diagnosed_cause: string;
  recommended_action: 'SMART_RETRY' | 'EMAIL_PAYMENT_LINK' | 'SMS_PAYMENT_LINK' | 'ALT_PAYMENT_PROMPT' | 'GRACE_EXTENSION';
  predicted_probability: number;
  expected_recovery_value: number;
  policy_verdict: 'ALLOWED' | 'BLOCKED' | 'HITL_ESCALATED';
  violated_rules: string;
  reasoning_summary: string;
  execution_status: string;
  created_at: string;
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  max_retry_attempts: number;
  retry_interval_minutes: number;
  high_value_hitl_threshold: number;
  max_intervention_cost: number;
  velocity_cap_per_customer: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  event_id: string;
  actor: string;
  action_taken: string;
  details_json: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  total_events: number;
  total_revenue_at_risk: number;
  recovered_revenue: number;
  recovery_rate_pct: number;
  blocked_actions: number;
  hitl_escalations: number;
  allowed_actions: number;
  active_policy: {
    max_retries: number;
    hitl_threshold: number;
    velocity_cap: number;
  };
}

export interface BenchmarkResult {
  total_events: number;
  total_revenue_at_risk: number;
  baseline: {
    attempted_value: number;
    recovered_revenue: number;
    recovery_rate_pct: number;
  };
  recoverai: {
    attempted_value: number;
    recovered_revenue: number;
    recovery_rate_pct: number;
    incremental_lift_amount: number;
    blocked_actions: number;
    hitl_escalations: number;
    stopping_rule_activations: number;
  };
}
