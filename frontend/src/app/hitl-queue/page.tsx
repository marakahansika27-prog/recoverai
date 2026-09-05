"use client";

import { useEffect, useState } from "react";
import { UserCheck, Check, X, AlertTriangle } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-charcoal-850 p-6 rounded-2xl border border-taupe-800/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-taupe-100 tracking-tight flex items-center gap-3">
            <UserCheck className="w-7 h-7 text-olive-400" />
            Human-in-the-Loop (HITL) Governance Queue
          </h1>
          <p className="text-taupe-400 text-xs mt-1">
            Review and resolve high-value settlement requests and policy exception escalations.
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-taupe-400 font-mono text-xs">Loading HITL review queue...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-charcoal-850 p-12 rounded-xl border border-taupe-800/80 text-center text-taupe-500 space-y-3 shadow-sm">
            <UserCheck className="w-12 h-12 text-taupe-600 mx-auto" />
            <h4 className="text-base font-semibold text-taupe-300">HITL Queue Empty</h4>
            <p className="text-xs max-w-md mx-auto">
              All agent proposals are currently within standard policy bounds. No pending human reviews required.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-charcoal-850 p-6 rounded-xl border border-taupe-800/80 hover:border-taupe-700 transition flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-taupe-100 text-base">{task.customer_name || "Enterprise Account"}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amberTaupe-950 text-amberTaupe-400 border border-amberTaupe-800/80">
                    High Value / Policy Trigger
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-taupe-400">
                  <span>Balance: <strong className="text-taupe-100">${task.outstanding_amount?.toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>Proposed Discount: <strong className="text-amberTaupe-400">{(task.proposed_discount_pct * 100).toFixed(0)}%</strong></span>
                  <span>•</span>
                  <span>Proposed Settlement: <strong className="text-olive-400">${task.proposed_settlement_amount.toLocaleString()}</strong></span>
                </div>

                <div className="bg-charcoal-950 p-3 rounded-lg border border-taupe-800/80 text-xs text-taupe-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amberTaupe-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amberTaupe-400 block">Trigger Reason:</span>
                    {task.trigger_reason}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleResolve(task.id, "REJECTED")}
                  disabled={resolvingId === task.id}
                  className="px-4 py-2 bg-charcoal-800 hover:bg-rust-950 text-rust-400 hover:text-rust-300 font-semibold text-xs rounded-lg border border-taupe-700 transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject Offer
                </button>
                <button
                  onClick={() => handleResolve(task.id, "APPROVED")}
                  disabled={resolvingId === task.id}
                  className="px-4 py-2 bg-olive-800 hover:bg-olive-700 text-olive-100 font-semibold text-xs rounded-lg shadow transition flex items-center gap-2 border border-olive-600/60"
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
