"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  User, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
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
      <div className="p-12 text-center text-slate-400">Loading customer account workspace...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4">
          <Link
            href="/accounts"
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-3">
              {account.customer_name}
              <span className="px-2.5 py-0.5 text-xs bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono">
                ID: {account.id.substring(0, 8)}
              </span>
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-0.5">
              <span>Balance: <strong className="text-white">${account.outstanding_amount.toLocaleString()}</strong></span>
              <span>•</span>
              <span>Overdue: <strong className="text-amber-400">{account.days_past_due} days</strong></span>
              <span>•</span>
              <span>ML Propensity: <strong className="text-emerald-400">{(account.propensity_to_pay * 100).toFixed(0)}%</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Agent PEP Live Simulator
          </span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Negotiation Chat UI */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-[640px]">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Bot className="w-4 h-4 text-sky-400" />
              Autonomous Negotiation Agent Session
            </div>
            <span className="text-xs text-slate-400">Target Channel: {account.preferred_channel}</span>
          </div>

          {/* Chat Transcript Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                <Bot className="w-12 h-12 text-slate-700" />
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
                        ? "bg-sky-600 text-white rounded-br-none"
                        : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700"
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
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : msg.policy_verdict === "HITL_REQUIRED"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
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
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 font-semibold whitespace-nowrap">Test Scenarios:</span>
            <button
              onClick={() => handleSend("Can I get a 15% discount if I settle today?")}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 whitespace-nowrap transition"
            >
              15% Settlement (Valid)
            </button>
            <button
              onClick={() => handleSend("I want a 30% discount on my balance!")}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 whitespace-nowrap transition"
            >
              30% Discount (Policy Block)
            </button>
            <button
              onClick={() => handleSend("Can I split this into a 6-month payment plan?")}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 whitespace-nowrap transition"
            >
              6-Month Installment Plan
            </button>
          </div>

          {/* Input Form */}
          <div className="p-4 border-t border-slate-800 bg-slate-900 rounded-b-xl flex gap-2">
            <input
              type="text"
              placeholder="Type customer negotiation response..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>

        {/* Right 1 Col: Real-Time Policy Guardrail Inspection Panel */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Lock className="w-6 h-6 text-sky-400" />
            <div>
              <h3 className="font-bold text-white text-base">Policy Enforcement Point (PEP)</h3>
              <p className="text-xs text-slate-400">Real-time deterministic rule inspector</p>
            </div>
          </div>

          {/* Status Display */}
          {lastVerdict ? (
            <div className={`p-4 rounded-xl border space-y-3 ${
              lastVerdict.passed
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}>
              <div className="flex items-center justify-between font-bold text-sm">
                <span className="flex items-center gap-2">
                  {lastVerdict.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                  )}
                  Verdict: {lastVerdict.verdict}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950">
                  {lastVerdict.passed ? "200 OK" : "403 BLOCKED"}
                </span>
              </div>

              {lastVerdict.violations && lastVerdict.violations.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-rose-500/20 text-xs">
                  <span className="font-semibold text-rose-400 block">Rule Breaches Triggered:</span>
                  {lastVerdict.violations.map((v: string, i: number) => (
                    <div key={i} className="flex items-start gap-1.5 bg-slate-950/60 p-2 rounded border border-rose-500/20">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {lastVerdict.suggested_counter_offer && (
                <div className="pt-2 border-t border-emerald-500/20 text-xs space-y-1">
                  <span className="font-semibold text-emerald-400 block">Compliant Counter-Offer Limits:</span>
                  <div className="bg-slate-950 p-2 rounded font-mono text-slate-300">
                    Max Discount: {(lastVerdict.suggested_counter_offer.max_allowed_discount_pct * 100).toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-500 text-center py-8">
              Awaiting agent action. Send a chat message to view real-time rule evaluation telemetry.
            </div>
          )}

          {/* Active Policy Rules Checklist */}
          <div className="space-y-3 flex-1">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enforced Active Policy Rules
            </h4>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <span>Max Settlement Discount</span>
                <span className="font-mono font-bold text-sky-400">20.0%</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <span>Auto HITL Threshold</span>
                <span className="font-mono font-bold text-sky-400">$5,000.00</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <span>Minimum Monthly Installment</span>
                <span className="font-mono font-bold text-sky-400">$100.00</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <span>Contact Quiet Hours</span>
                <span className="font-mono font-bold text-sky-400">21:00 - 08:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
