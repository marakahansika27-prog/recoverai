"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Activity
} from "lucide-react";
import { fetchTransactionDetail } from "@/lib/api";
import { PaymentEvent, AgentDecision, AuditLog } from "@/lib/types";

export default function TransactionDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [data, setData] = useState<{ event: PaymentEvent; decisions: AgentDecision[]; audit_timeline: AuditLog[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchTransactionDetail(eventId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [eventId]);

  if (loading || !data) {
    return <div className="p-12 text-center text-taupe-400 font-mono text-xs">Loading transaction decision timeline...</div>;
  }

  const { event, decisions } = data;
  const decision = decisions[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 gap-4">
        <div className="flex items-center gap-3">
          <Link href="/transactions" className="p-1.5 bg-charcoal-800 hover:bg-charcoal-750 text-taupe-300 rounded border border-taupe-700 transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-taupe-100 tracking-tight flex items-center gap-2">
              Transaction Decision Timeline: <span className="font-mono text-olive-400">{event.razorpay_event_id}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-taupe-400 mt-0.5">
              <span>Event: <strong className="text-taupe-100">{event.event_type}</strong></span>
              <span>•</span>
              <span>Amount: <strong className="text-taupe-100">₹{event.amount.toLocaleString()}</strong></span>
              <span>•</span>
              <span>Failure Code: <strong className="font-mono text-amberTaupe-400">{event.failure_reason}</strong></span>
            </div>
          </div>
        </div>

        <span className={`px-3 py-1 rounded text-xs font-mono font-semibold shrink-0 ${
          event.status === "RECOVERED" || event.status === "IN_RECOVERY"
            ? "bg-olive-950 text-olive-300 border border-olive-800/80"
            : event.status === "BLOCKED"
            ? "bg-rust-900/60 text-rust-400 border border-rust-800/80"
            : "bg-amberTaupe-900/60 text-amberTaupe-400 border border-amberTaupe-800/80"
        }`}>
          PEP Status: {event.status}
        </span>
      </div>

      {/* Main Grid: Decision Audit Timeline + Telemetry Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step-by-step Audit Timeline (2 cols) */}
        <div className="lg:col-span-2 bg-charcoal-850 p-6 rounded-lg border border-taupe-800/80 space-y-6">
          <h3 className="font-bold text-taupe-100 text-sm border-b border-taupe-800/80 pb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-olive-400" />
            Chronological Core Agent Loop Audit Trail
          </h3>

          <div className="space-y-6 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-taupe-800/80">
            {/* Step 1: Detect */}
            <div className="flex items-start gap-4 relative pl-8">
              <div className="w-6 h-6 rounded-full bg-charcoal-800 border border-taupe-700 flex items-center justify-center font-mono text-[10px] text-olive-400 font-bold absolute left-0 top-0">
                1
              </div>
              <div className="bg-charcoal-950 p-4 rounded border border-taupe-800/80 text-xs space-y-1 w-full">
                <div className="font-semibold text-taupe-100 flex justify-between">
                  <span>Revenue at Risk Detected</span>
                  <span className="text-taupe-500 font-mono">{new Date(event.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-taupe-400">
                  Received Razorpay payment failure event for amount <strong className="text-taupe-200">₹{event.amount.toLocaleString()}</strong>.
                </p>
              </div>
            </div>

            {/* Step 2: Diagnose */}
            <div className="flex items-start gap-4 relative pl-8">
              <div className="w-6 h-6 rounded-full bg-charcoal-800 border border-taupe-700 flex items-center justify-center font-mono text-[10px] text-olive-400 font-bold absolute left-0 top-0">
                2
              </div>
              <div className="bg-charcoal-950 p-4 rounded border border-taupe-800/80 text-xs space-y-1 w-full">
                <div className="font-semibold text-taupe-100 flex justify-between">
                  <span>Root Cause Diagnosed</span>
                  <span className="text-taupe-500 font-mono">Classifier Active</span>
                </div>
                <div className="text-taupe-300 font-mono bg-charcoal-900 p-2 rounded border border-taupe-800/80 mt-1">
                  Cause: {decision ? decision.diagnosed_cause : "SOFT_DECLINE"}
                </div>
                <p className="text-taupe-400 mt-1">
                  {decision ? decision.reasoning_summary : "Analyzing payment failure telemetry."}
                </p>
              </div>
            </div>

            {/* Step 3: ML ERV Optimization */}
            <div className="flex items-start gap-4 relative pl-8">
              <div className="w-6 h-6 rounded-full bg-charcoal-800 border border-taupe-700 flex items-center justify-center font-mono text-[10px] text-olive-400 font-bold absolute left-0 top-0">
                3
              </div>
              <div className="bg-charcoal-950 p-4 rounded border border-taupe-800/80 text-xs space-y-2 w-full">
                <div className="font-semibold text-taupe-100 flex justify-between">
                  <span>ML Action Recovery Probability & ERV Ranks</span>
                  <span className="text-olive-400 font-mono">Top Candidate Selected</span>
                </div>
                {decision && (
                  <div className="bg-charcoal-900 p-3 rounded border border-taupe-800/80 text-xs space-y-1">
                    <div className="flex justify-between font-mono">
                      <span className="text-taupe-400">Selected Intervention:</span>
                      <span className="text-taupe-100 font-bold">{decision.recommended_action}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-taupe-400">Predicted Probability P(Recovery):</span>
                      <span className="text-olive-400 font-bold">{(decision.predicted_probability * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-taupe-400">Expected Recovery Value (ERV):</span>
                      <span className="text-taupe-100 font-bold">₹{decision.expected_recovery_value.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Policy Engine Check */}
            <div className="flex items-start gap-4 relative pl-8">
              <div className="w-6 h-6 rounded-full bg-charcoal-800 border border-taupe-700 flex items-center justify-center font-mono text-[10px] text-olive-400 font-bold absolute left-0 top-0">
                4
              </div>
              <div className={`p-4 rounded border text-xs space-y-2 w-full ${
                decision?.policy_verdict === "ALLOWED"
                  ? "bg-olive-950/60 border-olive-800/80 text-olive-200"
                  : "bg-rust-950/60 border-rust-800/80 text-rust-300"
              }`}>
                <div className="font-bold flex justify-between">
                  <span className="flex items-center gap-1.5">
                    {decision?.policy_verdict === "ALLOWED" ? <ShieldCheck className="w-4 h-4 text-olive-400" /> : <ShieldAlert className="w-4 h-4 text-rust-400" />}
                    Deterministic Policy Gate Check: {decision ? decision.policy_verdict : "PASSED"}
                  </span>
                  <span className="font-mono text-[10px]">{decision?.policy_verdict === "ALLOWED" ? "200 ALLOWED" : "403 BLOCKED"}</span>
                </div>

                {decision?.violated_rules && decision.violated_rules !== "[]" && (
                  <div className="bg-charcoal-950 p-2 rounded border border-rust-800/80 text-xs font-mono space-y-1">
                    <span className="text-rust-400 font-semibold block">Violated Policy Rules:</span>
                    <p>{decision.violated_rules}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 5: Execution & Outcome */}
            <div className="flex items-start gap-4 relative pl-8">
              <div className="w-6 h-6 rounded-full bg-charcoal-800 border border-taupe-700 flex items-center justify-center font-mono text-[10px] text-olive-400 font-bold absolute left-0 top-0">
                5
              </div>
              <div className="bg-charcoal-950 p-4 rounded border border-taupe-800/80 text-xs space-y-1 w-full">
                <div className="font-semibold text-taupe-100 flex justify-between">
                  <span>Execution Outcome & Audit Logging</span>
                  <span className="font-mono text-taupe-400">{decision ? decision.execution_status : "EXECUTED"}</span>
                </div>
                <p className="text-taupe-400">
                  Action status recorded in immutable audit log ledger. Stopping rules evaluated.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Inspector Panel (1 col) */}
        <div className="bg-charcoal-850 p-6 rounded-lg border border-taupe-800/80 space-y-6">
          <h3 className="font-bold text-taupe-100 text-sm border-b border-taupe-800/80 pb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-olive-400" />
            Technical Event Telemetry
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="bg-charcoal-950 p-3 rounded border border-taupe-800/80 space-y-1">
              <span className="text-taupe-500 block text-[10px] uppercase">Razorpay Event ID</span>
              <span className="text-taupe-200 font-bold">{event.razorpay_event_id}</span>
            </div>

            <div className="bg-charcoal-950 p-3 rounded border border-taupe-800/80 space-y-1">
              <span className="text-taupe-500 block text-[10px] uppercase">Card Network</span>
              <span className="text-taupe-200 font-bold">{event.card_network}</span>
            </div>

            <div className="bg-charcoal-950 p-3 rounded border border-taupe-800/80 space-y-1">
              <span className="text-taupe-500 block text-[10px] uppercase">Customer Retry Counter</span>
              <span className="text-amberTaupe-400 font-bold">{event.retry_count} Attempts</span>
            </div>

            <div className="bg-charcoal-950 p-3 rounded border border-taupe-800/80 space-y-1">
              <span className="text-taupe-500 block text-[10px] uppercase">24h Contact Velocity</span>
              <span className="text-olive-400 font-bold">{event.customer_interventions_24h} Interventions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
