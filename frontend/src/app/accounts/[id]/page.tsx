"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { fetchAccountById, sendAgentChatMessage } from "@/lib/api";
import { Account, NegotiationMessage } from "@/lib/types";

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = params.id as string;

  const [account, setAccount] = useState<Account | null>(null);
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastVerdict, setLastVerdict] = useState<any>(null);

  useEffect(() => {
    if (accountId) {
      fetchAccountById(accountId).then(setAccount).catch(console.error);
    }
  }, [accountId]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading || !account) return;

    const userMsg: NegotiationMessage = {
      sender: "USER",
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await sendAgentChatMessage(account.id, text);
      const agentMsg: NegotiationMessage = {
        sender: "AGENT",
        content: res.agent_message,
        policy_verdict: res.policy_verdict?.verdict,
        action: res.policy_verdict,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, agentMsg]);
      setLastVerdict(res.policy_verdict);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="p-12 text-center text-taupe-400 font-mono text-xs">Loading customer account workspace...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-charcoal-850 p-4 rounded-xl border border-taupe-800/80 gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/accounts"
            className="p-2 text-taupe-400 hover:text-taupe-100 bg-charcoal-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-taupe-100 flex items-center gap-3">
              {account.customer_name}
              <span className="px-2.5 py-0.5 text-xs bg-charcoal-950 text-taupe-300 rounded border border-taupe-800/80 font-mono">
                ID: {account.id.substring(0, 8)}
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-taupe-400 mt-0.5">
              <span>Balance: <strong className="text-taupe-100">${account.outstanding_amount.toLocaleString()}</strong></span>
              <span>•</span>
              <span>Overdue: <strong className="text-amberTaupe-400">{account.days_past_due} days</strong></span>
              <span>•</span>
              <span>ML Propensity: <strong className="text-olive-400">{(account.propensity_to_pay * 100).toFixed(0)}%</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 bg-olive-950 text-olive-300 border border-olive-800/80 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse text-olive-400" />
            Agent PEP Live Simulator
          </span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Negotiation Chat UI */}
        <div className="lg:col-span-2 bg-charcoal-850 rounded-xl border border-taupe-800/80 flex flex-col h-[640px] shadow-sm">
          <div className="p-4 border-b border-taupe-800/80 bg-charcoal-950/60 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-taupe-100">
              <Bot className="w-4 h-4 text-olive-400" />
              Autonomous Negotiation Agent Session
            </div>
            <span className="text-xs text-taupe-400">Target Channel: {account.preferred_channel}</span>
          </div>

          {/* Chat Transcript Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-taupe-500 space-y-3">
                <Bot className="w-12 h-12 text-taupe-600" />
                <p className="text-sm max-w-sm">
                  Start the conversation by selecting a test prompt below or typing a custom message to test the agent & policy engine guardrails.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-lg rounded-2xl p-4 text-sm leading-relaxed space-y-2 ${
                      msg.sender === "USER"
                        ? "bg-olive-800 text-olive-50 rounded-br-none shadow-sm"
                        : "bg-charcoal-800 text-taupe-100 rounded-bl-none border border-taupe-700/80 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs opacity-75 pb-1 border-b border-white/10">
                      <span className="font-semibold">{msg.sender === "USER" ? "Customer (Test)" : "RecoverAI Agent"}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p>{msg.content}</p>

                    {/* Policy Guardrail Badge on Agent message */}
                    {msg.sender === "AGENT" && msg.policy_verdict && (
                      <div className="pt-2 flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded font-mono font-semibold flex items-center gap-1 ${
                          msg.policy_verdict === "PASSED"
                            ? "bg-olive-950 text-olive-300 border border-olive-800/80"
                            : msg.policy_verdict === "HITL_REQUIRED"
                            ? "bg-amberTaupe-950 text-amberTaupe-400 border border-amberTaupe-800/80"
                            : "bg-rust-950 text-rust-400 border border-rust-800/80"
                        }`}>
                          {msg.policy_verdict === "PASSED" ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          )}
                          PEP Verdict: {msg.policy_verdict}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 bg-charcoal-950/80 border-t border-taupe-800/80 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-taupe-400 font-semibold whitespace-nowrap">Test Scenarios:</span>
            <button
              onClick={() => handleSend("Can I get a 15% discount if I settle today?")}
              className="px-2.5 py-1 bg-charcoal-800 hover:bg-charcoal-750 text-taupe-300 rounded-lg border border-taupe-700/80 whitespace-nowrap transition"
            >
              15% Settlement (Valid)
            </button>
            <button
              onClick={() => handleSend("I want a 30% discount on my balance!")}
              className="px-2.5 py-1 bg-charcoal-800 hover:bg-charcoal-750 text-taupe-300 rounded-lg border border-taupe-700/80 whitespace-nowrap transition"
            >
              30% Discount (Policy Block)
            </button>
            <button
              onClick={() => handleSend("Can I split this into a 6-month payment plan?")}
              className="px-2.5 py-1 bg-charcoal-800 hover:bg-charcoal-750 text-taupe-300 rounded-lg border border-taupe-700/80 whitespace-nowrap transition"
            >
              6-Month Installment Plan
            </button>
          </div>

          {/* Input Form */}
          <div className="p-4 border-t border-taupe-800/80 bg-charcoal-850 rounded-b-xl flex gap-2">
            <input
              type="text"
              placeholder="Type customer negotiation response..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-charcoal-950 border border-taupe-800 rounded-lg px-4 py-2.5 text-sm text-taupe-100 focus:outline-none focus:border-olive-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="px-4 py-2.5 bg-olive-800 hover:bg-olive-700 disabled:opacity-50 text-olive-100 rounded-lg font-medium transition flex items-center gap-2 border border-olive-600/60"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>

        {/* Right 1 Col: Real-Time Policy Guardrail Inspection Panel */}
        <div className="bg-charcoal-850 rounded-xl border border-taupe-800/80 p-6 flex flex-col space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-taupe-800/80 pb-4">
            <Lock className="w-6 h-6 text-olive-400" />
            <div>
              <h3 className="font-bold text-taupe-100 text-base">Policy Enforcement Point (PEP)</h3>
              <p className="text-xs text-taupe-400">Real-time deterministic rule inspector</p>
            </div>
          </div>

          {/* Status Display */}
          {lastVerdict ? (
            <div className={`p-4 rounded-xl border space-y-3 ${
              lastVerdict.passed
                ? "bg-olive-950/80 border-olive-800/80 text-olive-300"
                : "bg-rust-950/80 border-rust-800/80 text-rust-300"
            }`}>
              <div className="flex items-center justify-between font-bold text-sm">
                <span className="flex items-center gap-2">
                  {lastVerdict.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-olive-400" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rust-400" />
                  )}
                  Verdict: {lastVerdict.verdict}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-charcoal-950">
                  {lastVerdict.passed ? "200 OK" : "403 BLOCKED"}
                </span>
              </div>

              {lastVerdict.violations && lastVerdict.violations.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-rust-800/60 text-xs">
                  <span className="font-semibold text-rust-400 block">Rule Breaches Triggered:</span>
                  {lastVerdict.violations.map((v: string, i: number) => (
                    <div key={i} className="flex items-start gap-1.5 bg-charcoal-950/60 p-2 rounded border border-rust-800/60">
                      <AlertTriangle className="w-3.5 h-3.5 text-rust-400 shrink-0 mt-0.5" />
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {lastVerdict.suggested_counter_offer && (
                <div className="pt-2 border-t border-olive-800/60 text-xs space-y-1">
                  <span className="font-semibold text-olive-400 block">Compliant Counter-Offer Limits:</span>
                  <div className="bg-charcoal-950 p-2 rounded font-mono text-taupe-300">
                    Max Discount: {(lastVerdict.suggested_counter_offer.max_allowed_discount_pct * 100).toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-charcoal-950/60 p-4 rounded-xl border border-taupe-800/80 text-xs text-taupe-500 text-center py-8">
              Awaiting agent action. Send a chat message to view real-time rule evaluation telemetry.
            </div>
          )}

          {/* Active Policy Rules Checklist */}
          <div className="space-y-3 flex-1">
            <h4 className="text-xs font-semibold text-taupe-400 uppercase tracking-wider">
              Enforced Active Policy Rules
            </h4>
            <div className="space-y-2 text-xs">
              <div className="bg-charcoal-950 p-3 rounded-lg border border-taupe-800/80 flex justify-between items-center">
                <span>Max Settlement Discount</span>
                <span className="font-mono font-bold text-olive-400">20.0%</span>
              </div>
              <div className="bg-charcoal-950 p-3 rounded-lg border border-taupe-800/80 flex justify-between items-center">
                <span>Auto HITL Threshold</span>
                <span className="font-mono font-bold text-amberTaupe-400">$5,000.00</span>
              </div>
              <div className="bg-charcoal-950 p-3 rounded-lg border border-taupe-800/80 flex justify-between items-center">
                <span>Minimum Monthly Installment</span>
                <span className="font-mono font-bold text-olive-400">$100.00</span>
              </div>
              <div className="bg-charcoal-950 p-3 rounded-lg border border-taupe-800/80 flex justify-between items-center">
                <span>Contact Quiet Hours</span>
                <span className="font-mono font-bold text-taupe-300">21:00 - 08:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
