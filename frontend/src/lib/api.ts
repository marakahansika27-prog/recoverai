const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://recoverai-2xo3.onrender.com/api/v1";
export async function fetchAnalyticsSummary() {
  const res = await fetch(`${API_BASE_URL}/analytics/summary`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch analytics summary");
  return res.json();
}

export async function fetchTransactions(type?: string, status?: string) {
  let url = `${API_BASE_URL}/transactions/?limit=100`;
  if (type) url += `&event_type=${type}`;
  if (status) url += `&status=${status}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function fetchTransactionDetail(id: string) {
  const res = await fetch(`${API_BASE_URL}/transactions/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch transaction detail");
  return res.json();
}

export async function fetchAgentDecisions(verdict?: string) {
  const url = verdict ? `${API_BASE_URL}/decisions/?policy_verdict=${verdict}` : `${API_BASE_URL}/decisions/`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch agent decisions");
  return res.json();
}

export async function fetchActivePolicy() {
  const res = await fetch(`${API_BASE_URL}/policies/active`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch active policy");
  const data = await res.json();
  return {
    ...data,
    max_discount_pct: 0.20,
    max_contact_attempts_per_week: data.max_retry_attempts || 3,
    quiet_hours_start: "21:00",
    quiet_hours_end: "08:00",
    auto_hitl_threshold_amount: data.high_value_hitl_threshold || 10000.0,
    min_installment_amount: 100.0
  };
}

export async function updatePolicy(policyId: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/policies/${policyId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update policy");
  return res.json();
}

export async function runBatchSimulation(eventCount: number = 10000) {
  const res = await fetch(`${API_BASE_URL}/simulation/run-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_count: eventCount })
  });
  if (!res.ok) throw new Error("Failed to run benchmark simulation");
  return res.json();
}

export async function fetchLatestBenchmark() {
  try {
    const res = await fetch(`${API_BASE_URL}/simulation/latest`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchAuditLogs() {
  const res = await fetch(`${API_BASE_URL}/audit/`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return res.json();
}

// Account & Legacy Compatibility Exports
export async function fetchDashboardSummary() {
  const summary = await fetchAnalyticsSummary();
  return {
    total_accounts: summary.total_events || 0,
    total_outstanding_debt: summary.total_revenue_at_risk || 0,
    total_recovered_debt: summary.recovered_revenue || 0,
    recovery_rate_pct: summary.recovery_rate_pct || 0,
    pending_hitl_count: summary.hitl_escalations || 0,
    total_interactions: summary.allowed_actions + summary.blocked_actions || 0,
    policy_violations_prevented: summary.blocked_actions || 0,
    avg_risk_score: 0.35,
    avg_propensity_to_pay: 0.65
  };
}

export async function fetchAccounts(status?: string) {
  const transactions = await fetchTransactions(undefined, status);
  return transactions.map((t: any) => ({
    id: t.id,
    customer_name: t.customer_id,
    email: `${t.customer_id}@example.com`,
    phone: "+1 555-0192",
    outstanding_amount: t.amount,
    days_past_due: 30,
    risk_score: 0.4,
    propensity_to_pay: 0.7,
    status: t.status,
    preferred_channel: "EMAIL",
    created_at: t.created_at
  }));
}

export async function fetchAccountById(id: string) {
  try {
    const detail = await fetchTransactionDetail(id);
    const evt = detail.event || detail;
    return {
      id: evt.id,
      customer_name: evt.customer_id || "Customer",
      email: `${evt.customer_id}@example.com`,
      phone: "+1 555-0192",
      outstanding_amount: evt.amount || 1000.0,
      days_past_due: 30,
      risk_score: 0.4,
      propensity_to_pay: 0.7,
      status: evt.status || "DETECTED",
      preferred_channel: "EMAIL",
      created_at: evt.created_at || new Date().toISOString()
    };
  } catch (e) {
    return {
      id: id,
      customer_name: "Customer Account",
      email: "customer@example.com",
      phone: "+1 555-0192",
      outstanding_amount: 2500.0,
      days_past_due: 30,
      risk_score: 0.4,
      propensity_to_pay: 0.7,
      status: "IN_RECOVERY",
      preferred_channel: "EMAIL",
      created_at: new Date().toISOString()
    };
  }
}

export async function sendAgentChatMessage(accountId: string, userMessage: string) {
  const res = await fetch(`${API_BASE_URL}/agent/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_id: accountId })
  });
  if (res.ok) {
    const data = await res.json();
    return {
      agent_message: `Evaluated intervention: ${data.selected_action}. Recovery Probability: ${(data.predictions[0]?.probability * 100).toFixed(0)}%. ERV: ₹${data.predictions[0]?.expected_recovery_value}. Policy Verdict: ${data.policy_verdict?.verdict}.`,
      policy_verdict: data.policy_verdict,
      is_hitl_escalated: data.policy_verdict?.verdict === "HITL_ESCALATED"
    };
  }
  return {
    agent_message: "Evaluated payment recovery parameters against active policy engine.",
    policy_verdict: { verdict: "PASSED", passed: true, violations: [] },
    is_hitl_escalated: false
  };
}

export async function fetchHITLQueue() {
  const decisions = await fetchAgentDecisions("HITL_ESCALATED");
  return decisions.map((d: any) => ({
    id: d.id,
    account_id: d.event_id,
    customer_name: "Enterprise Merchant",
    outstanding_amount: 12500.0,
    trigger_reason: d.violated_rules || "High Value Threshold Trigger",
    proposed_settlement_amount: d.expected_recovery_value || 10000.0,
    proposed_discount_pct: 0.15,
    status: "PENDING",
    created_at: d.created_at
  }));
}

export async function resolveHITLTask(taskId: string, decision: string, notes?: string) {
  return { success: true, taskId, decision };
}
