"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CreditCard } from "lucide-react";
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
          <h1 className="text-xl font-bold text-taupe-100 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-olive-400" />
            Revenue-at-Risk Transactions Ledger
          </h1>
          <p className="text-taupe-400 text-xs mt-0.5">
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
            className="bg-charcoal-950 border border-taupe-800 rounded px-3 py-1.5 text-xs text-taupe-100 focus:outline-none focus:border-olive-500 w-48 font-mono placeholder:text-taupe-500"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-charcoal-950 border border-taupe-800 text-taupe-300 text-xs rounded px-3 py-1.5 focus:outline-none cursor-pointer font-sans"
          >
            <option value="">All Event Types</option>
            <option value="PAYMENT_FAILED">Payment Failed</option>
            <option value="CHECKOUT_ABANDONED">Checkout Abandoned</option>
            <option value="SUBSCRIPTION_RENEWAL_FAILED">Subscription Failed</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-charcoal-950 border border-taupe-800 text-taupe-300 text-xs rounded px-3 py-1.5 focus:outline-none cursor-pointer font-sans"
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
      <div className="bg-charcoal-850 rounded-lg border border-taupe-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-taupe-300">
            <thead className="bg-charcoal-950 text-[10px] font-semibold uppercase text-taupe-400 border-b border-taupe-800/80">
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
            <tbody className="divide-y divide-taupe-800/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-taupe-500 font-mono">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-taupe-500 font-mono">
                    No transactions match filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-charcoal-800/50 font-sans transition">
                    <td className="px-4 py-3 font-mono font-medium text-taupe-200">{evt.razorpay_event_id}</td>
                    <td className="px-4 py-3 font-medium text-taupe-100">{evt.event_type.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 font-mono text-taupe-300">
                      <span className="px-2 py-0.5 rounded bg-charcoal-950 text-taupe-300 border border-taupe-800/60 text-[10px]">
                        {evt.failure_reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-taupe-100">₹{evt.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-taupe-400 text-[11px]">{evt.customer_id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                        evt.status === "RECOVERED" || evt.status === "IN_RECOVERY"
                          ? "bg-olive-950 text-olive-300 border border-olive-800/80"
                          : evt.status === "BLOCKED"
                          ? "bg-rust-900/60 text-rust-400 border border-rust-800/80"
                          : evt.status === "HITL_ESCALATED"
                          ? "bg-amberTaupe-900/60 text-amberTaupe-400 border border-amberTaupe-800/80"
                          : "bg-charcoal-800 text-taupe-400 border border-taupe-800"
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/transactions/${evt.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-charcoal-800 hover:bg-charcoal-750 text-taupe-200 rounded border border-taupe-700/80 text-[11px] font-medium transition"
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
