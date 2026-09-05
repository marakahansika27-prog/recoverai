"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  AlertOctagon, 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight, 
  Lock, 
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Layers
} from "lucide-react";
import { fetchAnalyticsSummary, fetchTransactions } from "@/lib/api";
import { AnalyticsSummary, PaymentEvent } from "@/lib/types";

export default function OverviewPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentEvents, setRecentEvents] = useState<PaymentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([fetchAnalyticsSummary(), fetchTransactions(undefined, undefined)])
      .then(([sumData, txData]) => {
        setSummary(sumData);
        setRecentEvents(txData.slice(0, 8));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Operational Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-bold text-taupe-100 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-olive-400" />
            Autonomous Revenue Recovery Operations Control
          </h1>
          <p className="text-taupe-400 text-xs mt-0.5">
            Real-time detection, ML Expected Recovery Value (ERV) optimization, and Policy Enforcement Point (PEP) telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/simulation"
            className="px-3 py-1.5 bg-olive-800 hover:bg-olive-700 text-olive-100 text-xs font-semibold rounded border border-olive-600/60 transition shadow-sm"
          >
            Run 10,000 Event Benchmark
          </Link>
          <button
            onClick={loadData}
            className="p-1.5 bg-charcoal-800 hover:bg-charcoal-750 text-taupe-300 rounded border border-taupe-800 transition"
            title="Refresh Data"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Tiles (Live Calculated Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-taupe-400 uppercase tracking-wider">Revenue at Risk</div>
          <div className="text-xl font-bold text-taupe-100 mt-1">
            ₹{summary ? summary.total_revenue_at_risk.toLocaleString() : "..."}
          </div>
          <div className="text-[11px] text-taupe-500">
            Across {summary ? summary.total_events : 0} payment events
          </div>
        </div>

        <div className="bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-taupe-400 uppercase tracking-wider">Recovered Value</div>
          <div className="text-xl font-bold text-olive-400 mt-1">
            ₹{summary ? summary.recovered_revenue.toLocaleString() : "..."}
          </div>
          <div className="text-[11px] text-olive-300 font-medium">
            {summary ? summary.recovery_rate_pct : 0}% recovery rate
          </div>
        </div>

        <div className="bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-taupe-400 uppercase tracking-wider">Policy Blocked Actions</div>
          <div className="text-xl font-bold text-rust-400 mt-1">
            {summary ? summary.blocked_actions : 0}
          </div>
          <div className="text-[11px] text-taupe-500">
            Prevented by Policy PEP
          </div>
        </div>

        <div className="bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-taupe-400 uppercase tracking-wider">HITL Escalations</div>
          <div className="text-xl font-bold text-amberTaupe-400 mt-1">
            {summary ? summary.hitl_escalations : 0}
          </div>
          <div className="text-[11px] text-taupe-500">
            High-value balance reviews
          </div>
        </div>

        <div className="bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-taupe-400 uppercase tracking-wider">Authorized Executions</div>
          <div className="text-xl font-bold text-taupe-200 mt-1">
            {summary ? summary.allowed_actions : 0}
          </div>
          <div className="text-[11px] text-taupe-500">
            Smart Retry & Payment Links
          </div>
        </div>
      </div>

      {/* Main Grid: Policy Status + Recent Live Events Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Policy Status */}
        <div className="bg-charcoal-850 p-5 rounded-lg border border-taupe-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-taupe-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-olive-400" />
              <h3 className="font-bold text-taupe-100 text-sm">Deterministic Policy Status</h3>
            </div>
            <span className="px-2 py-0.5 bg-olive-950 text-olive-300 border border-olive-800 rounded font-mono text-[10px] font-semibold">
              PEP Active
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between p-2.5 bg-charcoal-950 rounded border border-taupe-800/60">
              <span className="text-taupe-400">Max Retry Stopping Rule</span>
              <span className="font-mono font-bold text-taupe-100">{summary?.active_policy.max_retries || 3} Attempts</span>
            </div>
            <div className="flex justify-between p-2.5 bg-charcoal-950 rounded border border-taupe-800/60">
              <span className="text-taupe-400">Auto HITL Threshold</span>
              <span className="font-mono font-bold text-amberTaupe-400">₹{summary?.active_policy.hitl_threshold.toLocaleString() || "10,000"}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-charcoal-950 rounded border border-taupe-800/60">
              <span className="text-taupe-400">Customer 24h Velocity Cap</span>
              <span className="font-mono font-bold text-olive-400">{summary?.active_policy.velocity_cap || 2} Actions</span>
            </div>
          </div>

          <div className="pt-2 text-right">
            <Link href="/policy-center" className="text-xs font-semibold text-olive-400 hover:text-olive-300 transition">
              Configure Policy Rules →
            </Link>
          </div>
        </div>

        {/* Recent Revenue-at-Risk Events Feed Table */}
        <div className="lg:col-span-2 bg-charcoal-850 rounded-lg border border-taupe-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-taupe-800/80 pb-3">
            <h3 className="font-bold text-taupe-100 text-sm">Live Revenue-at-Risk Event Stream</h3>
            <Link href="/transactions" className="text-xs font-semibold text-olive-400 hover:text-olive-300 transition">
              View All Transactions →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-taupe-300">
              <thead className="bg-charcoal-950 text-[10px] font-semibold uppercase text-taupe-400 border-b border-taupe-800/80">
                <tr>
                  <th className="px-3 py-2.5">Razorpay Event ID</th>
                  <th className="px-3 py-2.5">Type</th>
                  <th className="px-3 py-2.5">Failure Reason</th>
                  <th className="px-3 py-2.5">Amount</th>
                  <th className="px-3 py-2.5">PEP Status</th>
                  <th className="px-3 py-2.5 text-right">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-taupe-800/40">
                {recentEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-charcoal-800/50 transition">
                    <td className="px-3 py-2.5 font-mono text-taupe-200">{evt.razorpay_event_id}</td>
                    <td className="px-3 py-2.5 font-semibold text-taupe-100">{evt.event_type.replace('_', ' ')}</td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded bg-charcoal-950 text-taupe-300 font-mono text-[10px] border border-taupe-800/60">
                        {evt.failure_reason}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-bold text-taupe-100">₹{evt.amount.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                        evt.status === "RECOVERED" || evt.status === "IN_RECOVERY"
                          ? "bg-olive-950 text-olive-300 border border-olive-800/80"
                          : evt.status === "BLOCKED"
                          ? "bg-rust-900/60 text-rust-400 border border-rust-800/80"
                          : evt.status === "HITL_ESCALATED"
                          ? "bg-amberTaupe-900/60 text-amberTaupe-400 border border-amberTaupe-800/80"
                          : "bg-charcoal-800 text-taupe-400 border border-taupe-800"
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        href={`/transactions/${evt.id}`}
                        className="text-olive-400 hover:text-olive-300 font-medium inline-flex items-center gap-1 transition"
                      >
                        Inspect <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
