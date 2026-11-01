"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Building2, 
  BrainCircuit, 
  Sparkles,
  Layers,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Dashboard Analytics",
    href: "/",
    icon: LayoutDashboard,
    badge: "Live"
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
    badge: "Map + Grid"
  },
  {
    name: "AI Valuation Sandbox",
    href: "/valuation",
    icon: BrainCircuit,
    badge: "ML"
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">EstateIQ</span>
              <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30">AI CRM</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Nagpur Real Estate</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          CRM Workspaces
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200")} />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </div>
            </Link>
          );
        })}
      </div>

      {/* AI Features Callout Card */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-indigo-300">FastAPI ML Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          XGBoost valuation & 384-dim semantic matching running live on port 8001.
        </p>
      </div>

      {/* User / Agent Footer */}
      <div className="p-4 border-t border-slate-800/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-xs">
          PD
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate">Prajwal Dhande</p>
          <p className="text-[11px] text-slate-400 truncate">Senior Estate Agent</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="Online" />
      </div>
    </aside>
  );
}

