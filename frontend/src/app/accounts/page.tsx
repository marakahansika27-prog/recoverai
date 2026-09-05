"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, MessageSquare } from "lucide-react";
import { fetchAccounts } from "@/lib/api";
import { Account } from "@/lib/types";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchAccounts(statusFilter || undefined)
      .then(setAccounts)
      .catch((err) => console.error("Accounts fetch error:", err))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filteredAccounts = accounts.filter(
    (a) =>
      a.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-taupe-100 tracking-tight">
            Accounts Explorer
          </h1>
          <p className="text-taupe-400 text-xs mt-1">
            Delinquent customer accounts with ML propensity scoring and negotiation triggers.
          </p>
        </div>
        
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-taupe-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-charcoal-950 border border-taupe-800 rounded-lg pl-9 pr-4 py-2 text-xs text-taupe-100 focus:outline-none focus:border-olive-500 w-64 placeholder:text-taupe-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-charcoal-950 border border-taupe-800 rounded-lg px-3 py-2 text-xs">
            <Filter className="w-4 h-4 text-taupe-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-taupe-300 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-charcoal-950">All Statuses</option>
              <option value="NEW" className="bg-charcoal-950">New</option>
              <option value="IN_RECOVERY" className="bg-charcoal-950">In Recovery</option>
              <option value="SETTLED" className="bg-charcoal-950">Settled</option>
              <option value="HITL_ESCALATED" className="bg-charcoal-950">HITL Escalated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accounts Data Table */}
      <div className="bg-charcoal-850 rounded-xl border border-taupe-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-taupe-300">
            <thead className="bg-charcoal-950 text-[10px] font-semibold uppercase text-taupe-400 border-b border-taupe-800/80">
              <tr>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Outstanding Balance</th>
                <th className="px-6 py-3.5">Days Overdue</th>
                <th className="px-6 py-3.5">ML Propensity</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-taupe-800/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-taupe-500 font-mono">
                    Loading account records...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-taupe-500 font-mono">
                    No accounts found matching filter.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-charcoal-800/50 transition">
                    <td className="px-6 py-4 font-medium text-taupe-100">
                      <div>{acc.customer_name}</div>
                      <div className="text-xs text-taupe-400">{acc.email}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-taupe-100">
                      ${acc.outstanding_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        acc.days_past_due > 90 
                          ? "bg-rust-950 text-rust-400 border border-rust-800/80" 
                          : acc.days_past_due > 45 
                          ? "bg-amberTaupe-950 text-amberTaupe-400 border border-amberTaupe-800/80" 
                          : "bg-charcoal-800 text-taupe-300"
                      }`}>
                        {acc.days_past_due} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-taupe-400">Score</span>
                          <span className="font-semibold text-olive-400">
                            {(acc.propensity_to_pay * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-charcoal-950 h-1.5 rounded-full overflow-hidden border border-taupe-800/60">
                          <div 
                            className="bg-olive-500 h-full rounded-full"
                            style={{ width: `${acc.propensity_to_pay * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        acc.status === "SETTLED"
                          ? "bg-olive-950 text-olive-300 border border-olive-800/80"
                          : acc.status === "HITL_ESCALATED"
                          ? "bg-amberTaupe-950 text-amberTaupe-400 border border-amberTaupe-800/80"
                          : acc.status === "IN_RECOVERY"
                          ? "bg-charcoal-800 text-taupe-200 border border-taupe-700"
                          : "bg-charcoal-800 text-taupe-400"
                      }`}>
                        {acc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/accounts/${acc.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-olive-800 hover:bg-olive-700 text-olive-100 rounded-lg text-xs font-medium transition shadow-sm border border-olive-600/60"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Simulate Agent Chat
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
