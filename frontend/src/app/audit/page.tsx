"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ArrowUpRight } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-taupe-100 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-olive-400" />
            Immutable Audit Trail Ledger
          </h1>
          <p className="text-taupe-400 text-xs mt-0.5">
            Immutable log of all agent diagnosis calls, ERV predictions, Policy PEP gate authorizations, and action execution payloads.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-charcoal-850 rounded-lg border border-taupe-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-taupe-300">
            <thead className="bg-charcoal-950 text-[10px] font-semibold uppercase text-taupe-400 border-b border-taupe-800/80">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action Taken</th>
                <th className="px-4 py-3">Payload Summary</th>
                <th className="px-4 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-taupe-800/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-taupe-500 font-mono">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-taupe-500 font-mono">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-charcoal-800/50 font-mono text-[11px] transition">
                    <td className="px-4 py-3 text-taupe-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-olive-400">
                      <Link href={`/transactions/${log.event_id}`} className="hover:underline">
                        {log.event_id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold text-taupe-200">{log.actor}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        log.action_taken.startsWith("ALLOWED")
                          ? "bg-olive-950 text-olive-300 border border-olive-800/80"
                          : log.action_taken.startsWith("BLOCKED")
                          ? "bg-rust-900/60 text-rust-400 border border-rust-800/80"
                          : "bg-amberTaupe-900/60 text-amberTaupe-400 border border-amberTaupe-800/80"
                      }`}>
                        {log.action_taken}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-taupe-400 truncate max-w-xs font-mono text-[10px]">
                      {log.details_json}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <Link
                        href={`/transactions/${log.event_id}`}
                        className="text-taupe-400 hover:text-taupe-100 inline-flex items-center gap-1 text-[11px] transition"
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
