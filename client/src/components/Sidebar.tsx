"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Building2, 
  BrainCircuit, 
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Cpu,
  CircleDot,
  Repeat,
  LogOut,
  MapPin,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

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
  const { user, isAdmin, isAgent, switchDemo, logout } = useAuth();
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  // Compute initials
  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "PD";

  const assignedText = isAgent && user?.assignedLocalities?.length
    ? user.assignedLocalities.slice(0, 2).join(", ")
    : "Managing Broker";

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 select-none relative z-30">
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

      {/* Quick Agent Switcher Popup Menu */}
      {showSwitchMenu && (
        <div className="absolute bottom-16 left-3 right-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2.5 space-y-2 z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
            <span>Switch Agent Context</span>
            <span className="text-emerald-400">RBAC</span>
          </div>
          
          <div className="space-y-1">
            {/* Admin Switch */}
            <button
              onClick={() => { switchDemo("admin@estateiq.com"); setShowSwitchMenu(false); }}
              className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                user?.email === "admin@estateiq.com"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <div>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Prajwal Dhande
                </p>
                <p className="text-[10px] text-slate-400">Admin • All Nagpur</p>
              </div>
              {user?.email === "admin@estateiq.com" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Agent Rahul Sharma */}
            <button
              onClick={() => { switchDemo("rahul.sharma@estateiq.com"); setShowSwitchMenu(false); }}
              className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                user?.email === "rahul.sharma@estateiq.com"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <div>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3 text-blue-400" /> Rahul Sharma
                </p>
                <p className="text-[10px] text-blue-300/80 font-mono">Vasudev Nagar, Dharampeth</p>
              </div>
              {user?.email === "rahul.sharma@estateiq.com" && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>

            {/* Agent Sneha Deshmukh */}
            <button
              onClick={() => { switchDemo("sneha@estateiq.com"); setShowSwitchMenu(false); }}
              className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                user?.email === "sneha@estateiq.com"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <div>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3 text-purple-400" /> Sneha Deshmukh
                </p>
                <p className="text-[10px] text-purple-300/80 font-mono">MIHAN, Manish Nagar</p>
              </div>
              {user?.email === "sneha@estateiq.com" && <Check className="w-3.5 h-3.5 text-purple-400" />}
            </button>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex justify-between px-1">
            <Link
              href="/login"
              onClick={() => setShowSwitchMenu(false)}
              className="text-[10px] font-mono text-slate-400 hover:text-emerald-400"
            >
              Auth Screen →
            </Link>
            <button
              onClick={() => { logout(); setShowSwitchMenu(false); }}
              className="text-[10px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <LogOut className="w-2.5 h-2.5" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* User / Agent Footer */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between bg-slate-950/40 relative">
        <button
          onClick={() => setShowSwitchMenu(!showSwitchMenu)}
          className="flex items-center gap-2.5 min-w-0 flex-1 text-left hover:opacity-90 transition-opacity"
          title="Click to switch Agent / Admin role"
        >
          <div className={cn(
            "w-7 h-7 rounded-md border flex items-center justify-center font-mono font-bold text-xs shrink-0",
            isAdmin 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
          )}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1">
              {user?.name || "Prajwal Dhande"}
            </p>
            <p className="text-[10px] text-slate-400 truncate font-mono">
              {assignedText}
            </p>
          </div>
        </button>

        <button
          onClick={() => setShowSwitchMenu(!showSwitchMenu)}
          className={cn(
            "p-1.5 rounded-md border text-[10px] font-mono flex items-center gap-1 shrink-0 transition-colors",
            isAdmin
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
              : "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
          )}
          title="Switch User Role"
        >
          <Repeat className="w-3 h-3" />
          <span className="capitalize">{user?.role || "admin"}</span>
        </button>
      </div>
    </aside>
  );
}
