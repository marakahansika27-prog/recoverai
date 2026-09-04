"use client";

import { useState } from "react";
import { PlaySquare, Play, TrendingUp, ShieldAlert, Lock, AlertOctagon, RefreshCw } from "lucide-react";
import { runBatchSimulation } from "@/lib/api";
import { BenchmarkResult } from "@/lib/types";

export default function SimulationPage() {
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleRunBenchmark = async () => {
    setRunning(true);
    try {
      const res = await runBatchSimulation(10000);
      setResult(res);
    } catch (err) {
      console.error("Benchmark run error:", err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 p-4 rounded-lg border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <PlaySquare className="w-5 h-5 text-sky-400" />
            10,000-Event Benchmark Recovery Simulation
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Evaluates measured incremental money recovered by RecoverAI (Smart ERV + Policy PEP) vs Baseline (Naive 3x Retries).
          </p>
        </div>

        <button
          onClick={handleRunBenchmark}
          disabled={running}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded shadow transition flex items-center gap-2"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          Run 10,000 Event Benchmark
        </button>
      </div>

      {result ? (
        <div className="space-y-6">
          {/* Top Lift Callout */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-400 font-semibold uppercase">Measured Incremental Lift</div>
              <div className="text-2xl font-bold text-emerald-400 mt-0.5">
                +₹{result.recoverai.incremental_lift_amount.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-mono">RecoverAI Rate vs Baseline</div>
              <div className="text-lg font-bold text-white font-mono">
                {result.recoverai.recovery_rate_pct}% vs {result.baseline.recovery_rate_pct}%
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Baseline Strategy */}
            <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-300 text-sm">BASELINE Strategy</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  Naive 3x Retries
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between p-2.5 bg-slate-950 rounded">
                  <span className="text-slate-400">Total Revenue at Risk:</span>
                  <span className="text-white">₹{result.total_revenue_at_risk.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded">
                  <span className="text-slate-400">Attempted Value:</span>
                  <span className="text-white">₹{result.baseline.attempted_value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded">
                  <span className="text-slate-400">Recovered Revenue:</span>
                  <span className="text-slate-300 font-bold">₹{result.baseline.recovered_revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded">
                  <span className="text-slate-400">Recovery Rate:</span>
                  <span className="text-slate-300 font-bold">{result.baseline.recovery_rate_pct}%</span>
                </div>
              </div>
            </div>

            {/* RecoverAI Strategy */}
            <div className="bg-slate-900 p-5 rounded-lg border border-sky-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sky-400 text-sm">RECOVERAI Strategy</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Smart ERV + Policy PEP
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between p-2.5 bg-slate-950 rounded">
                  <span className="text-slate-400">Total Revenue at Risk:</span>
                  <span className="text-white">₹{result.total_revenue_at_risk.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded">
                  <span className="text-slate-400">Recovered Revenue:</span>
                  <span className="text-emerald-400 font-bold">₹{result.recoverai.recovered_revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded">
                  <span className="text-slate-400">Recovery Rate:</span>
                  <span className="text-emerald-400 font-bold">{result.recoverai.recovery_rate_pct}%</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded">
                  <span className="text-slate-400">Policy Blocked Actions:</span>
                  <span className="text-rose-400 font-bold">{result.recoverai.blocked_actions}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded">
                  <span className="text-slate-400">Stopping Rule Activations:</span>
                  <span className="text-amber-400 font-bold">{result.recoverai.stopping_rule_activations}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 p-12 rounded-lg border border-slate-800 text-center text-slate-500 space-y-2">
          <PlaySquare className="w-10 h-10 text-slate-700 mx-auto" />
          <p className="text-xs">
            Click "Run 10,000 Event Benchmark" to execute the live recovery simulation.
          </p>
        </div>
      )}
    </div>
  );
}
