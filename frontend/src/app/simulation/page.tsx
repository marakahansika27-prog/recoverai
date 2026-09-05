"use client";

import { useState } from "react";
import { PlaySquare, Play, RefreshCw } from "lucide-react";
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-charcoal-850 p-4 rounded-lg border border-taupe-800/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-taupe-100 tracking-tight flex items-center gap-2">
            <PlaySquare className="w-5 h-5 text-olive-400" />
            10,000-Event Benchmark Recovery Simulation
          </h1>
          <p className="text-taupe-400 text-xs mt-0.5">
            Evaluates measured incremental money recovered by RecoverAI (Smart ERV + Policy PEP) vs Baseline (Naive 3x Retries).
          </p>
        </div>

        <button
          onClick={handleRunBenchmark}
          disabled={running}
          className="px-5 py-2.5 bg-olive-800 hover:bg-olive-700 disabled:opacity-50 text-olive-100 font-bold text-xs rounded shadow transition flex items-center gap-2 border border-olive-600/60 shrink-0"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          Run 10,000 Event Benchmark
        </button>
      </div>

      {result ? (
        <div className="space-y-6">
          {/* Top Lift Callout */}
          <div className="bg-olive-950/80 border border-olive-800/80 p-4 rounded-lg flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs text-olive-400 font-semibold uppercase tracking-wider">Measured Incremental Lift</div>
              <div className="text-2xl font-bold text-olive-300 mt-0.5">
                +₹{result.recoverai.incremental_lift_amount.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-taupe-400 font-mono">RecoverAI Rate vs Baseline</div>
              <div className="text-lg font-bold text-taupe-100 font-mono">
                {result.recoverai.recovery_rate_pct}% vs {result.baseline.recovery_rate_pct}%
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Baseline Strategy */}
            <div className="bg-charcoal-850 p-5 rounded-lg border border-taupe-800/80 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-taupe-800/80 pb-3">
                <h3 className="font-bold text-taupe-300 text-sm">BASELINE Strategy</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-charcoal-950 text-taupe-400 border border-taupe-800/80">
                  Naive 3x Retries
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between p-2.5 bg-charcoal-950 rounded border border-taupe-800/60">
                  <span className="text-taupe-400">Total Revenue at Risk:</span>
                  <span className="text-taupe-100">₹{result.total_revenue_at_risk.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-charcoal-950 rounded border border-taupe-800/60">
                  <span className="text-taupe-400">Attempted Value:</span>
                  <span className="text-taupe-100">₹{result.baseline.attempted_value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-charcoal-950 rounded border border-taupe-800/60">
                  <span className="text-taupe-400">Recovered Revenue:</span>
                  <span className="text-taupe-200 font-bold">₹{result.baseline.recovered_revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-charcoal-950 rounded border border-taupe-800/60">
                  <span className="text-taupe-400">Recovery Rate:</span>
                  <span className="text-taupe-200 font-bold">{result.baseline.recovery_rate_pct}%</span>
                </div>
              </div>
            </div>

            {/* RecoverAI Strategy */}
            <div className="bg-charcoal-850 p-5 rounded-lg border border-olive-800/80 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-taupe-800/80 pb-3">
                <h3 className="font-bold text-olive-400 text-sm">RECOVERAI Strategy</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-olive-950 text-olive-300 border border-olive-800/80">
                  Smart ERV + Policy PEP
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between p-2.5 bg-charcoal-950 rounded border border-taupe-800/60">
                  <span className="text-taupe-400">Total Revenue at Risk:</span>
                  <span className="text-taupe-100">₹{result.total_revenue_at_risk.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-charcoal-950 rounded border border-taupe-800/60">
                  <span className="text-taupe-400">Recovered Revenue:</span>
                  <span className="text-olive-400 font-bold">₹{result.recoverai.recovered_revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-charcoal-950 rounded border border-taupe-800/60">
                  <span className="text-taupe-400">Recovery Rate:</span>
                  <span className="text-olive-400 font-bold">{result.recoverai.recovery_rate_pct}%</span>
                </div>
                <div className="flex justify-between p-2.5 bg-charcoal-950 rounded border border-taupe-800/60">
                  <span className="text-taupe-400">Policy Blocked Actions:</span>
                  <span className="text-rust-400 font-bold">{result.recoverai.blocked_actions}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-charcoal-950 rounded border border-taupe-800/60">
                  <span className="text-taupe-400">Stopping Rule Activations:</span>
                  <span className="text-amberTaupe-400 font-bold">{result.recoverai.stopping_rule_activations}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-charcoal-850 p-12 rounded-lg border border-taupe-800/80 text-center text-taupe-500 space-y-2 shadow-sm">
          <PlaySquare className="w-10 h-10 text-taupe-600 mx-auto" />
          <p className="text-xs">
            Click "Run 10,000 Event Benchmark" to execute the live recovery simulation.
          </p>
        </div>
      )}
    </div>
  );
}
