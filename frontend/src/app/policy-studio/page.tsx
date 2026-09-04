"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, Save, ShieldCheck, Lock, RefreshCw } from "lucide-react";
import { fetchActivePolicy, updatePolicy } from "@/lib/api";
import { Policy } from "@/lib/types";

export default function PolicyStudioPage() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Form states
  const [maxDiscount, setMaxDiscount] = useState(0.20);
  const [autoHitlAmount, setAutoHitlAmount] = useState(5000);
  const [minInstallment, setMinInstallment] = useState(100);
  const [quietStart, setQuietStart] = useState("21:00");
  const [quietEnd, setQuietEnd] = useState("08:00");

  useEffect(() => {
    fetchActivePolicy()
      .then((pol) => {
        setPolicy(pol);
        setMaxDiscount(pol.max_discount_pct);
        setAutoHitlAmount(pol.auto_hitl_threshold_amount);
        setMinInstallment(pol.min_installment_amount);
        setQuietStart(pol.quiet_hours_start);
        setQuietEnd(pol.quiet_hours_end);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!policy) return;
    setSaving(true);
    try {
      const updated = await updatePolicy(policy.id, {
        max_discount_pct: maxDiscount,
        auto_hitl_threshold_amount: autoHitlAmount,
        min_installment_amount: minInstallment,
        quiet_hours_start: quietStart,
        quiet_hours_end: quietEnd,
      });
      setPolicy(updated);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err) {
      console.error("Policy save error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading active policy guardrails...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <SlidersHorizontal className="w-8 h-8 text-sky-400" />
            Policy Guardrail Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure deterministic hard rules and human-in-the-loop escalation thresholds.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-lg shadow-sky-600/25 transition flex items-center gap-2"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Active Guardrails
        </button>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Active Policy Guardrails successfully updated in the database!
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-8">
          {/* Max Discount Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-400" />
                Maximum Settlement Discount Ceiling
              </label>
              <span className="font-mono text-lg font-bold text-sky-400">
                {(maxDiscount * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-slate-400">
              The Agent will strictly be forbidden from offering discounts higher than this threshold without HITL approval.
            </p>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>5% (Conservative)</span>
              <span>20% (Default)</span>
              <span>50% (Aggressive)</span>
            </div>
          </div>

          {/* Auto HITL Amount Slider */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                Auto Human-in-the-Loop (HITL) Balance Threshold
              </label>
              <span className="font-mono text-lg font-bold text-rose-400">
                ${autoHitlAmount.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Accounts with outstanding balances exceeding this amount will automatically require Human Officer approval for settlement discounts.
            </p>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={autoHitlAmount}
              onChange={(e) => setAutoHitlAmount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>$1,000</span>
              <span>$5,000 (Default)</span>
              <span>$20,000</span>
            </div>
          </div>

          {/* Min Installment Amount */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-white">
                Minimum Monthly Installment Payment Floor
              </label>
              <span className="font-mono text-lg font-bold text-emerald-400">
                ${minInstallment} / mo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Disallow monthly payment plan offers where monthly installment falls below this amount.
            </p>
            <input
              type="range"
              min="25"
              max="500"
              step="25"
              value={minInstallment}
              onChange={(e) => setMinInstallment(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Quiet Hours */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <label className="text-sm font-bold text-white block">
              Regulatory Contact Quiet Hours (Outreach Freeze)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Quiet Hours Start</label>
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white w-full"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Quiet Hours End</label>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live YAML / JSON Policy Definition Inspector */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
            Declarative Policy Definition
          </h3>
          <p className="text-xs text-slate-400">
            Serialized YAML/JSON policy payload enforced by the Policy Engine.
          </p>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs font-mono text-sky-300 leading-relaxed overflow-x-auto flex-1">
{`# RecoverAI Governance Policy Spec v1.0
version: "1.0"
policy_id: "${policy?.id || "default"}"
name: "Consumer Recovery Guardrails"

rules:
  max_discount_pct: ${(maxDiscount * 100).toFixed(1)}%
  auto_hitl_threshold: $${autoHitlAmount.toLocaleString()}
  min_installment: $${minInstallment}
  quiet_hours:
    start: "${quietStart}"
    end: "${quietEnd}"
  enforcement_mode: "STRICT_PEP"`}
          </pre>
        </div>
      </div>
    </div>
  );
}
