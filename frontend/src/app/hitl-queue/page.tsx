"use client";

import { useEffect, useState } from "react";
import { UserCheck, Check, X, ShieldAlert, AlertTriangle, DollarSign } from "lucide-react";
import { fetchHITLQueue, resolveHITLTask } from "@/lib/api";
import { HITLTask } from "@/lib/types";

export default function HITLQueuePage() {
  const [tasks, setTasks] = useState<HITLTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const loadQueue = () => {
    fetchHITLQueue()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleResolve = async (taskId: string, decision: string) => {
    setResolvingId(taskId);
    try {
      await resolveHITLTask(taskId, decision, "Approved via Human Compliance Portal");
      loadQueue();
    } catch (err) {
      console.error("Resolve error:", err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-sky-400" />
            Human-in-the-Loop (HITL) Governance Queue
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review and resolve high-value settlement requests and policy exception escalations.
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading HITL review queue...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center text-slate-500 space-y-3">
            <UserCheck className="w-12 h-12 text-slate-700 mx-auto" />
            <h4 className="text-base font-semibold text-slate-300">HITL Queue Empty</h4>
            <p className="text-sm max-w-md mx-auto">
              All agent proposals are currently within standard policy bounds. No pending human reviews required.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-lg">{task.customer_name || "Enterprise Account"}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    High Value / Policy Trigger
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span>Balance: <strong className="text-white">${task.outstanding_amount?.toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>Proposed Discount: <strong className="text-amber-400">{(task.proposed_discount_pct * 100).toFixed(0)}%</strong></span>
                  <span>•</span>
                  <span>Proposed Settlement: <strong className="text-emerald-400">${task.proposed_settlement_amount.toLocaleString()}</strong></span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-400 block">Trigger Reason:</span>
                    {task.trigger_reason}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleResolve(task.id, "REJECTED")}
                  disabled={resolvingId === task.id}
                  className="px-4 py-2 bg-slate-800 hover:bg-rose-950 text-rose-400 hover:text-rose-300 font-semibold text-sm rounded-lg border border-slate-700 transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject Offer
                </button>
                <button
                  onClick={() => handleResolve(task.id, "APPROVED")}
                  disabled={resolvingId === task.id}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-sky-600/25 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approve Exception
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
