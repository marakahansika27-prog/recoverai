"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  CreditCard, 
  Cpu, 
  ShieldCheck, 
  PlaySquare, 
  FileText, 
  Activity,
  Layers
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/", icon: Layers },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Transactions", href: "/transactions", icon: CreditCard },
    { name: "Agent Decisions", href: "/decisions", icon: Cpu },
    { name: "Policy Center", href: "/policy-center", icon: ShieldCheck },
    { name: "Benchmark Simulation", href: "/simulation", icon: PlaySquare },
    { name: "Audit Log", href: "/audit", icon: FileText },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Product Tag */}
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded bg-sky-500 flex items-center justify-center font-bold text-white text-sm tracking-tighter">
              R
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-base text-white tracking-tight">
                Recover<span className="text-sky-400">AI</span>
              </span>
              <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Razorpay Track 3
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-white font-semibold border border-slate-700"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
