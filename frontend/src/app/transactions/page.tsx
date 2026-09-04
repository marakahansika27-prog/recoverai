"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, ArrowUpRight, CreditCard, ShieldCheck } from "lucide-react";
import { fetchTransactions } from "@/lib/api";
import { PaymentEvent } from "@/lib/types";

export default function TransactionsPage() {
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTransactions(typeFilter || undefined, statusFilter || undefined)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [typeFilter, statusFilter]);

  const filteredEvents = events.filter(
    (e) =>
      e.razorpay_event_id.toLowerCase().includes(search.toLowerCase()) ||
      e.customer_id.toLowerCase().includes(search.toLowerCase()) ||
      e.failure_reason.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sky-400" />
            Revenue-at-Risk Transactions Ledger
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Complete transaction event stream across failed payments, checkout abandonments, and subscription renewals.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Filter ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 w-48 font-mono"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded px-3 py-1.5 focus:outline-none cursor-pointer font-sans"
          >
            <option value="">All Event Types</option>
            <option value="PAYMENT_FAILED">Payment Failed</option>
            <option value="CHECKOUT_ABANDONED">Checkout Abandoned</option>
            <option value="SUBSCRIPTION_RENEWAL_FAILED">Subscription Failed</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded px-3 py-1.5 focus:outline-none cursor-pointer font-sans"
          >
            <option value="">All Statuses</option>
            <option value="DETECTED">Detected</option>
            <option value="IN_RECOVERY">In Recovery</option>
            <option value="RECOVERED">Recovered</option>
            <option value="BLOCKED">Blocked</option>
            <option value="HITL_ESCALATED">HITL Escalated</option>
          </select>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[10px] font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Razorpay Event ID</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Failure Reason</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Customer ID</th>
                <th className="px-4 py-3">PEP Status</th>
                <th className="px-4 py-3 text-right">Decision Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-mono">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-mono">
                    No transactions match filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/40 font-sans">
                    <td className="px-4 py-3 font-mono font-medium text-slate-200">{evt.razorpay_event_id}</td>
                    <td className="px-4 py-3 font-medium text-white">{evt.event_type.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]">
                        {evt.failure_reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">₹{evt.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{evt.customer_id}</td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/transactions/${evt.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] font-medium transition"
                      >
                        Inspect Loop <ArrowUpRight className="w-3 h-3" />
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
