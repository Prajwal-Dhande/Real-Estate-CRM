"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Building2, 
  BrainCircuit, 
  ChevronRight,
  ShieldCheck,
  Cpu,
  Activity,
  ArrowUpRight,
  CircleDot
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: "Metrics"
  },
  {
    name: "Lead Pipeline",
    href: "/leads",
    icon: KanbanSquare,
    badge: "Kanban"
  },
  {
    name: "Property Inventory",
    href: "/properties",
    icon: Building2,
    badge: "Map & Grid"
  },
  {
    name: "AI Valuation",
    href: "/valuation",
    icon: BrainCircuit,
    badge: "ML"
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 select-none">
      {/* Brand & Workspace Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs tracking-wider group-hover:border-slate-500 transition-colors">
            <span className="text-emerald-400 font-mono">E</span>IQ
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-white">EstateIQ</span>
              <span className="text-[10px] font-medium font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700/60">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 tracking-tight">Nagpur Brokerage</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
          Workspaces
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors",
                isActive
                  ? "bg-slate-800/90 text-white shadow-xs font-semibold"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r-full" />
              )}
              <div className="flex items-center gap-2.5">
                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-300")} />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded",
                      isActive
                        ? "bg-slate-700 text-slate-200 border border-slate-600"
                        : "text-slate-400 group-hover:text-slate-400"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={cn("w-3 h-3 text-slate-600 transition-transform", isActive ? "opacity-100 text-slate-400" : "opacity-0 group-hover:opacity-100")} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* AI Telemetry & Engine Health Card */}
      <div className="p-3 mx-3 mb-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI ML Service</span>
          </div>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            <CircleDot className="w-2 h-2 animate-pulse" /> 8001 Live
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono space-y-0.5 border-t border-slate-800 pt-1.5">
          <div className="flex justify-between">
            <span>Valuation:</span>
            <span className="text-slate-300">XGBoost Ensemble</span>
          </div>
          <div className="flex justify-between">
            <span>Semantic:</span>
            <span className="text-slate-300">MiniLM-L6 (384d)</span>
          </div>
        </div>
      </div>

      {/* User / Agent Footer */}
      <div className="p-3.5 border-t border-slate-800/80 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-mono font-bold text-xs shrink-0">
            PD
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">Prajwal Dhande</p>
            <p className="text-[10px] text-slate-400 truncate">Managing Broker</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3" />
          <span>Admin</span>
        </div>
      </div>
    </aside>
  );
}
