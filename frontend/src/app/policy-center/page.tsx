"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Save, Lock, RefreshCw, AlertOctagon } from "lucide-react";
import { fetchActivePolicy, updatePolicy } from "@/lib/api";
import { PolicyRule } from "@/lib/types";

export default function PolicyCenterPage() {
  const [policy, setPolicy] = useState<PolicyRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Policy Form Controls
  const [maxRetries, setMaxRetries] = useState(3);
  const [hitlThreshold, setHitlThreshold] = useState(10000);
  const [velocityCap, setVelocityCap] = useState(2);
  const [retryInterval, setRetryInterval] = useState(60);

  useEffect(() => {
    fetchActivePolicy()
      .then((pol) => {
        setPolicy(pol);
        setMaxRetries(pol.max_retry_attempts);
        setHitlThreshold(pol.high_value_hitl_threshold);
        setVelocityCap(pol.velocity_cap_per_customer);
        setRetryInterval(pol.retry_interval_minutes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!policy) return;
    setSaving(true);
    try {
      const updated = await updatePolicy(policy.id, {
        max_retry_attempts: maxRetries,
        high_value_hitl_threshold: hitlThreshold,
        velocity_cap_per_customer: velocityCap,
        retry_interval_minutes: retryInterval,
      });
      setPolicy(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Policy update error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 font-mono text-xs">Loading Policy Center...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 p-4 rounded-lg border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            Deterministic Policy Center (PEP Rules)
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Configure stopping rules, retry ceilings, high-value human authorization thresholds, and customer velocity limits.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Active Policy Rules
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-xs font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Active Policy Rules updated successfully in database!
        </div>
      )}

      {/* Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-lg border border-slate-800 space-y-6">
          {/* Max Retries Stopping Rule */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-white flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                Max Retry Attempts Stopping Rule
              </label>
              <span className="font-mono font-bold text-rose-400 text-sm">{maxRetries} Retries</span>
            </div>
            <p className="text-slate-400 text-xs">
              If an event reaches this retry limit, the Policy Engine strictly BLOCKS any further retry attempts to prevent gateway penalization and customer fatigue.
            </p>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={maxRetries}
              onChange={(e) => setMaxRetries(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* High Value HITL Threshold */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-sky-400" />
                Auto HITL High-Value Transaction Threshold
              </label>
              <span className="font-mono font-bold text-sky-400 text-sm">₹{hitlThreshold.toLocaleString()}</span>
            </div>
            <p className="text-slate-400 text-xs">
              Transactions exceeding this amount will automatically trigger HITL Escalation requiring human officer approval.
            </p>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={hitlThreshold}
              onChange={(e) => setHitlThreshold(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Velocity Cap */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-white">
                Customer 24-Hour Velocity Cap
              </label>
              <span className="font-mono font-bold text-emerald-400 text-sm">{velocityCap} Interventions / 24h</span>
            </div>
            <p className="text-slate-400 text-xs">
              Disallow more than this number of recovery attempts or messages to the same customer within a rolling 24-hour window.
            </p>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={velocityCap}
              onChange={(e) => setVelocityCap(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Live YAML Policy Definition Viewer */}
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">
            Enforced Policy Specification
          </h3>

          <pre className="bg-slate-950 p-4 rounded border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto leading-relaxed">
{`# Razorpay RecoverAI Policy Engine Config
version: "1.0"
policy_name: "${policy?.name || "Standard Policy"}"

rules:
  max_retry_stopping_rule: ${maxRetries}
  auto_hitl_threshold: ₹${hitlThreshold.toLocaleString()}
  velocity_cap_24h: ${velocityCap}
  min_retry_interval_min: ${retryInterval}
  enforcement_point: "STRICT_PEP_GATE"`}
          </pre>
        </div>
      </div>
    </div>
  );
}
