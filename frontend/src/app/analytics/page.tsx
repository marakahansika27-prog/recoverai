"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { fetchAnalyticsSummary } from "@/lib/api";
import { AnalyticsSummary } from "@/lib/types";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    fetchAnalyticsSummary().then(setSummary).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 shadow-sm">
        <h1 className="text-xl font-bold text-taupe-100 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-olive-400" />
          Revenue Leakage & Recovery Analytics
        </h1>
        <p className="text-taupe-400 text-xs mt-0.5">
          Detailed breakdown of payment failure root causes, ERV action optimization performance, and policy guardrail intercepts.
        </p>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 shadow-sm">
          <div className="text-xs text-taupe-400 font-semibold uppercase tracking-wider">Total Revenue Processed</div>
          <div className="text-2xl font-bold text-taupe-100 mt-1">
            ₹{summary ? summary.total_revenue_at_risk.toLocaleString() : "..."}
          </div>
        </div>

        <div className="bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 shadow-sm">
          <div className="text-xs text-taupe-400 font-semibold uppercase tracking-wider">Recovered Value</div>
          <div className="text-2xl font-bold text-olive-400 mt-1">
            ₹{summary ? summary.recovered_revenue.toLocaleString() : "..."}
          </div>
        </div>

        <div className="bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 shadow-sm">
          <div className="text-xs text-taupe-400 font-semibold uppercase tracking-wider">Overall Recovery Rate</div>
          <div className="text-2xl font-bold text-olive-300 mt-1">
            {summary ? summary.recovery_rate_pct : 0}%
          </div>
        </div>

        <div className="bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 shadow-sm">
          <div className="text-xs text-taupe-400 font-semibold uppercase tracking-wider">Policy Intercept Rate</div>
          <div className="text-2xl font-bold text-rust-400 mt-1">
            {summary && summary.total_events > 0 
              ? ((summary.blocked_actions + summary.hitl_escalations) / summary.total_events * 100).toFixed(1)
              : 0}%
          </div>
        </div>
      </div>

      {/* Root Cause Failure Breakdown Table */}
      <div className="bg-charcoal-850 p-6 rounded-lg border border-taupe-800/80 space-y-5 shadow-sm">
        <h3 className="font-bold text-taupe-100 text-sm border-b border-taupe-800/80 pb-3">Failure Telemetry & Recovery Breakdown</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-taupe-200">
              <span className="font-mono text-taupe-300">INSUFFICIENT_FUNDS (Soft Decline)</span>
              <span className="font-bold text-olive-400">82% Smart Retry ERV Rate</span>
            </div>
            <div className="w-full bg-charcoal-950 h-2.5 rounded overflow-hidden border border-taupe-800/60">
              <div className="bg-olive-600 h-full w-[82%]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-taupe-200">
              <span className="font-mono text-taupe-300">NETWORK_TIMEOUT (Issuer Bank Timeout)</span>
              <span className="font-bold text-olive-400">91% Instant Retry ERV Rate</span>
            </div>
            <div className="w-full bg-charcoal-950 h-2.5 rounded overflow-hidden border border-taupe-800/60">
              <div className="bg-olive-500 h-full w-[91%]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-taupe-200">
              <span className="font-mono text-taupe-300">CARD_EXPIRED (Hard Decline)</span>
              <span className="font-bold text-taupe-100">88% Alternate Payment Method Switch Rate</span>
            </div>
            <div className="w-full bg-charcoal-950 h-2.5 rounded overflow-hidden border border-taupe-800/60">
              <div className="bg-taupe-400 h-full w-[88%]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-taupe-200">
              <span className="font-mono text-taupe-300">AUTH_FAILED (3DS Authentication Drop)</span>
              <span className="font-bold text-amberTaupe-400">76% SMS Payment Link Conversion</span>
            </div>
            <div className="w-full bg-charcoal-950 h-2.5 rounded overflow-hidden border border-taupe-800/60">
              <div className="bg-amberTaupe-500 h-full w-[76%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
