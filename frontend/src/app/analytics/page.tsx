"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, DollarSign, ShieldAlert, Cpu, CheckCircle2 } from "lucide-react";
import { fetchAnalyticsSummary } from "@/lib/api";
import { AnalyticsSummary } from "@/lib/types";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    fetchAnalyticsSummary().then(setSummary).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sky-400" />
          Revenue Leakage & Recovery Analytics
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Detailed breakdown of payment failure root causes, ERV action optimization performance, and policy guardrail intercepts.
        </p>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Revenue Processed</div>
          <div className="text-2xl font-bold text-white mt-1">
            ₹{summary ? summary.total_revenue_at_risk.toLocaleString() : "..."}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase">Recovered Value</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            ₹{summary ? summary.recovered_revenue.toLocaleString() : "..."}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase">Overall Recovery Rate</div>
          <div className="text-2xl font-bold text-sky-400 mt-1">
            {summary ? summary.recovery_rate_pct : 0}%
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase">Policy Intercept Rate</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {summary && summary.total_events > 0 
              ? ((summary.blocked_actions + summary.hitl_escalations) / summary.total_events * 100).toFixed(1)
              : 0}%
          </div>
        </div>
      </div>

      {/* Root Cause Failure Breakdown Table */}
      <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm">Failure Telemetry & Recovery Breakdown</h3>
        
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-mono">INSUFFICIENT_FUNDS (Soft Decline)</span>
              <span className="font-bold text-emerald-400">82% Smart Retry ERV Rate</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
              <div className="bg-emerald-500 h-full w-[82%]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-mono">NETWORK_TIMEOUT (Issuer Bank Timeout)</span>
              <span className="font-bold text-emerald-400">91% Instant Retry ERV Rate</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
              <div className="bg-emerald-500 h-full w-[91%]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-mono">CARD_EXPIRED (Hard Decline)</span>
              <span className="font-bold text-sky-400">88% Alternate Payment Method Switch Rate</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
              <div className="bg-sky-500 h-full w-[88%]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-mono">AUTH_FAILED (3DS Authentication Drop)</span>
              <span className="font-bold text-amber-400">76% SMS Payment Link Conversion</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
              <div className="bg-amber-500 h-full w-[76%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
