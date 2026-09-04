"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Clock, 
  AlertTriangle, 
  Activity,
  DollarSign,
  FileCode
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
    return <div className="p-12 text-center text-slate-400 font-mono text-xs">Loading transaction decision timeline...</div>;
  }

  const { event, decisions, audit_timeline } = data;
  const decision = decisions[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/transactions" className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Transaction Decision Timeline: <span className="font-mono text-sky-400">{event.razorpay_event_id}</span>
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>Event: <strong className="text-white">{event.event_type}</strong></span>
              <span>•</span>
              <span>Amount: <strong className="text-white">₹{event.amount.toLocaleString()}</strong></span>
              <span>•</span>
              <span>Failure Code: <strong className="font-mono text-amber-400">{event.failure_reason}</strong></span>
            </div>
          </div>
        </div>

        <span className={`px-3 py-1 rounded text-xs font-mono font-semibold ${
          event.status === "RECOVERED" || event.status === "IN_RECOVERY"
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : event.status === "BLOCKED"
            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
        }`}>
          PEP Status: {event.status}
        </span>
      </div>

      {/* Main Grid: Decision Audit Timeline + Telemetry Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step-by-step Audit Timeline (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-lg border border-slate-800 space-y-6">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            Chronological Core Agent Loop Audit Trail
          </h3>

          <div className="space-y-6 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {/* Step 1: Detect */}
            <div className="flex items-start gap-4 relative pl-8">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-sky-400 font-bold absolute left-0 top-0">
                1
              </div>
              <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs space-y-1 w-full">
                <div className="font-semibold text-white flex justify-between">
                  <span>Revenue at Risk Detected</span>
                  <span className="text-slate-500 font-mono">{new Date(event.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-400">
                  Received Razorpay payment failure event for amount <strong className="text-slate-200">₹{event.amount.toLocaleString()}</strong>.
                </p>
              </div>
            </div>

            {/* Step 2: Diagnose */}
            <div className="flex items-start gap-4 relative pl-8">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-sky-400 font-bold absolute left-0 top-0">
                2
              </div>
              <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs space-y-1 w-full">
                <div className="font-semibold text-white flex justify-between">
                  <span>Root Cause Diagnosed</span>
                  <span className="text-slate-500 font-mono">Classifier Active</span>
                </div>
                <div className="text-slate-300 font-mono bg-slate-900 p-2 rounded border border-slate-800 mt-1">
                  Cause: {decision ? decision.diagnosed_cause : "SOFT_DECLINE"}
                </div>
                <p className="text-slate-400 mt-1">
                  {decision ? decision.reasoning_summary : "Analyzing payment failure telemetry."}
                </p>
              </div>
            </div>

            {/* Step 3: ML ERV Optimization */}
            <div className="flex items-start gap-4 relative pl-8">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-sky-400 font-bold absolute left-0 top-0">
                3
              </div>
              <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs space-y-2 w-full">
                <div className="font-semibold text-white flex justify-between">
                  <span>ML Action Recovery Probability & ERV Ranks</span>
                  <span className="text-emerald-400 font-mono">Top Candidate Selected</span>
                </div>
                {decision && (
                  <div className="bg-slate-900 p-3 rounded border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Selected Intervention:</span>
                      <span className="text-white font-bold">{decision.recommended_action}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Predicted Probability P(Recovery):</span>
                      <span className="text-emerald-400 font-bold">{(decision.predicted_probability * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Expected Recovery Value (ERV):</span>
                      <span className="text-sky-400 font-bold">₹{decision.expected_recovery_value.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Policy Engine Check */}
            <div className="flex items-start gap-4 relative pl-8">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-sky-400 font-bold absolute left-0 top-0">
                4
              </div>
              <div className={`p-4 rounded border text-xs space-y-2 w-full ${
                decision?.policy_verdict === "ALLOWED"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}>
                <div className="font-bold flex justify-between">
                  <span className="flex items-center gap-1.5">
                    {decision?.policy_verdict === "ALLOWED" ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-400" />}
                    Deterministic Policy Gate Check: {decision ? decision.policy_verdict : "PASSED"}
                  </span>
                  <span className="font-mono text-[10px]">{decision?.policy_verdict === "ALLOWED" ? "200 ALLOWED" : "403 BLOCKED"}</span>
                </div>

                {decision?.violated_rules && decision.violated_rules !== "[]" && (
                  <div className="bg-slate-950 p-2 rounded border border-rose-500/20 text-xs font-mono space-y-1">
                    <span className="text-rose-400 font-semibold block">Violated Policy Rules:</span>
                    <p>{decision.violated_rules}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 5: Execution & Outcome */}
            <div className="flex items-start gap-4 relative pl-8">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-sky-400 font-bold absolute left-0 top-0">
                5
              </div>
              <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs space-y-1 w-full">
                <div className="font-semibold text-white flex justify-between">
                  <span>Execution Outcome & Audit Logging</span>
                  <span className="font-mono text-slate-400">{decision ? decision.execution_status : "EXECUTED"}</span>
                </div>
                <p className="text-slate-400">
                  Action status recorded in immutable audit log ledger. Stopping rules evaluated.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Inspector Panel (1 col) */}
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 space-y-6">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            Technical Event Telemetry
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase">Razorpay Event ID</span>
              <span className="text-slate-200 font-bold">{event.razorpay_event_id}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase">Card Network</span>
              <span className="text-slate-200 font-bold">{event.card_network}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase">Customer Retry Counter</span>
              <span className="text-amber-400 font-bold">{event.retry_count} Attempts</span>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase">24h Contact Velocity</span>
              <span className="text-sky-400 font-bold">{event.customer_interventions_24h} Interventions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
