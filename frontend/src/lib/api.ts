const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
  return res.json();
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

export async function fetchAuditLogs() {
  const res = await fetch(`${API_BASE_URL}/audit/`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return res.json();
}
