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
  Clock
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
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-lg border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Autonomous Revenue Recovery Operations Control
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Real-time detection, ML Expected Recovery Value (ERV) optimization, and Policy Enforcement Point (PEP) telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/simulation"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded border border-slate-700 transition"
          >
            Run 10,000 Event Benchmark
          </Link>
          <button
            onClick={loadData}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Tiles (Live Calculated Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Revenue at Risk</div>
          <div className="text-xl font-bold text-white mt-1">
            ₹{summary ? summary.total_revenue_at_risk.toLocaleString() : "..."}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {summary ? summary.total_events : 0} payment events
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recovered Value</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            ₹{summary ? summary.recovered_revenue.toLocaleString() : "..."}
          </div>
          <div className="text-[11px] text-emerald-500 mt-1 font-medium">
            {summary ? summary.recovery_rate_pct : 0}% recovery rate
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Policy Blocked Actions</div>
          <div className="text-xl font-bold text-rose-400 mt-1">
            {summary ? summary.blocked_actions : 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Prevented by Policy PEP
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">HITL Escalations</div>
          <div className="text-xl font-bold text-sky-400 mt-1">
            {summary ? summary.hitl_escalations : 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            High-value balance reviews
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Authorized Executions</div>
          <div className="text-xl font-bold text-slate-200 mt-1">
            {summary ? summary.allowed_actions : 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Smart Retry & Payment Links
          </div>
        </div>
      </div>

      {/* Main Grid: Policy Status + Recent Live Events Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Policy Status */}
        <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Deterministic Policy Status</h3>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[10px] font-semibold">
              PEP Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800/80">
              <span className="text-slate-400">Max Retry Stopping Rule</span>
              <span className="font-mono font-bold text-white">{summary?.active_policy.max_retries || 3} Attempts</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800/80">
              <span className="text-slate-400">Auto HITL Threshold</span>
              <span className="font-mono font-bold text-rose-400">₹{summary?.active_policy.hitl_threshold.toLocaleString() || "10,000"}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800/80">
              <span className="text-slate-400">Customer 24h Velocity Cap</span>
              <span className="font-mono font-bold text-sky-400">{summary?.active_policy.velocity_cap || 2} Actions</span>
            </div>
          </div>

          <div className="pt-2 text-right">
            <Link href="/policy-center" className="text-xs font-medium text-sky-400 hover:underline">
              Configure Policy Rules →
            </Link>
          </div>
        </div>

        {/* Recent Revenue-at-Risk Events Feed Table */}
        <div className="lg:col-span-2 bg-slate-900 rounded-lg border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">Live Revenue-at-Risk Event Stream</h3>
            <Link href="/transactions" className="text-xs font-medium text-sky-400 hover:underline">
              View All Transactions →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2">Razorpay Event ID</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Failure Reason</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">PEP Status</th>
                  <th className="px-3 py-2 text-right">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/40">
                    <td className="px-3 py-2.5 font-mono text-slate-200">{evt.razorpay_event_id}</td>
                    <td className="px-3 py-2.5 font-semibold text-white">{evt.event_type.replace('_', ' ')}</td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {evt.failure_reason}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-bold text-white">₹{evt.amount.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                        evt.status === "RECOVERED" || evt.status === "IN_RECOVERY"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : evt.status === "BLOCKED"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : evt.status === "HITL_ESCALATED"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        href={`/transactions/${evt.id}`}
                        className="text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1"
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
