"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ShieldCheck, ArrowUpRight } from "lucide-react";
import { fetchAuditLogs } from "@/lib/api";
import { AuditLog } from "@/lib/types";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 p-4 rounded-lg border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            Immutable Audit Trail Ledger
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Immutable log of all agent diagnosis calls, ERV predictions, Policy PEP gate authorizations, and action execution payloads.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[10px] font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action Taken</th>
                <th className="px-4 py-3">Payload Summary</th>
                <th className="px-4 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-mono">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-mono">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 font-mono text-[11px]">
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sky-400">
                      <Link href={`/transactions/${log.event_id}`} className="hover:underline">
                        {log.event_id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{log.actor}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        log.action_taken.startsWith("ALLOWED")
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : log.action_taken.startsWith("BLOCKED")
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                      }`}>
                        {log.action_taken}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-xs font-mono text-[10px]">
                      {log.details_json}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <Link
                        href={`/transactions/${log.event_id}`}
                        className="text-slate-400 hover:text-white inline-flex items-center gap-1 text-[11px]"
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
