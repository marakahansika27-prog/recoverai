"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, MessageSquare, ArrowUpDown, AlertCircle } from "lucide-react";
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Accounts Explorer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Delinquent customer accounts with ML propensity scoring and negotiation triggers.
          </p>
        </div>
        
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500 w-64"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">All Statuses</option>
              <option value="NEW" className="bg-slate-900">New</option>
              <option value="IN_RECOVERY" className="bg-slate-900">In Recovery</option>
              <option value="SETTLED" className="bg-slate-900">Settled</option>
              <option value="HITL_ESCALATED" className="bg-slate-900">HITL Escalated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accounts Data Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Outstanding Balance</th>
                <th className="px-6 py-4">Days Overdue</th>
                <th className="px-6 py-4">ML Propensity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading account records...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No accounts found matching filter.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-medium text-white">
                      <div>{acc.customer_name}</div>
                      <div className="text-xs text-slate-400">{acc.email}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      ${acc.outstanding_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        acc.days_past_due > 90 
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                          : acc.days_past_due > 45 
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                          : "bg-slate-800 text-slate-300"
                      }`}>
                        {acc.days_past_due} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Score</span>
                          <span className="font-semibold text-emerald-400">
                            {(acc.propensity_to_pay * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${acc.propensity_to_pay * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        acc.status === "SETTLED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : acc.status === "HITL_ESCALATED"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : acc.status === "IN_RECOVERY"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "bg-slate-800 text-slate-300"
                      }`}>
                        {acc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/accounts/${acc.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600/90 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition shadow-md shadow-sky-600/20"
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
