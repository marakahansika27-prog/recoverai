"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cpu, ShieldCheck, ShieldAlert, ArrowUpRight } from "lucide-react";
import { fetchAgentDecisions } from "@/lib/api";
import { AgentDecision } from "@/lib/types";

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [verdictFilter, setVerdictFilter] = useState("");

  useEffect(() => {
    fetchAgentDecisions(verdictFilter || undefined)
      .then(setDecisions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [verdictFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            Agent Decision & Policy Verdict Log
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Log of all agent ERV calculations, candidate action rankings, and Policy Enforcement Point (PEP) authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="">All Policy Verdicts</option>
            <option value="ALLOWED">Allowed (200 OK)</option>
            <option value="BLOCKED">Blocked (403 Violation)</option>
            <option value="HITL_ESCALATED">HITL Escalated</option>
          </select>
        </div>
      </div>

      {/* Decisions Data Table */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[10px] font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Diagnosed Cause</th>
                <th className="px-4 py-3">Selected Action</th>
                <th className="px-4 py-3">P(Recovery)</th>
                <th className="px-4 py-3">Calculated ERV</th>
                <th className="px-4 py-3">Policy Verdict</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-mono">
                    Loading agent decisions...
                  </td>
                </tr>
              ) : decisions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-mono">
                    No decisions found matching filter.
                  </td>
                </tr>
              ) : (
                decisions.map((dec) => (
                  <tr key={dec.id} className="hover:bg-slate-800/40 font-sans">
                    <td className="px-4 py-3 font-mono font-medium text-sky-400">
                      <Link href={`/transactions/${dec.event_id}`} className="hover:underline">
                        {dec.event_id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">{dec.diagnosed_cause}</td>
                    <td className="px-4 py-3 font-semibold text-white">{dec.recommended_action}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      {(dec.predicted_probability * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      ₹{dec.expected_recovery_value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                        dec.policy_verdict === "ALLOWED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : dec.policy_verdict === "BLOCKED"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                      }`}>
                        {dec.policy_verdict}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/transactions/${dec.event_id}`}
                        className="text-slate-400 hover:text-white inline-flex items-center gap-1 font-mono text-[11px]"
                      >
                        Inspect <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
