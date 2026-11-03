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
  Check,
  Sparkles
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
    badge: "ML Engine"
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, isAgent, switchDemo, logout } = useAuth();
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  // Compute user initials
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PD";

  const cleanName = user?.name ? user.name.replace(/\s*\([^)]*\)/, "") : "Prajwal Dhande";

  const assignedText =
    isAgent && user?.assignedLocalities?.length
      ? user.assignedLocalities.slice(0, 2).join(", ")
      : "Managing Broker";

  return (
    <aside className="w-64 bg-[#0A0F1D] text-slate-300 flex flex-col shrink-0 border-r border-slate-800/60 select-none relative z-30">
      {/* Brand & Workspace Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/60">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0A0F1D] rounded-[10px] flex items-center justify-center">
              <span className="text-white font-black text-xs tracking-tighter">EQ</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                EstateIQ
              </span>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 tracking-wide uppercase font-semibold">
              Nagpur Real Estate
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
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
                "group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-slate-800/90 text-white shadow-sm font-semibold border border-slate-700/60"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-indigo-500 to-emerald-400 rounded-r-full shadow-glow-primary" />
              )}
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      isActive
                        ? "bg-slate-700 text-slate-200 border border-slate-600/70"
                        : "text-slate-500 group-hover:text-slate-400"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={cn(
                    "w-3 h-3 text-slate-600 transition-transform",
                    isActive ? "opacity-100 text-slate-400" : "opacity-0 group-hover:opacity-100"
                  )}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* AI Telemetry & Engine Health Card */}
      <div className="p-3.5 mx-3.5 mb-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Copilot Engine</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CircleDot className="w-2 h-2 animate-pulse text-emerald-400" /> 8001 Live
          </span>
        </div>
        <div className="text-[10px] text-slate-400 space-y-1 border-t border-slate-800/80 pt-2">
          <div className="flex justify-between items-center">
            <span>Valuation:</span>
            <span className="text-slate-300 font-medium">XGBoost Ensemble</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Semantic:</span>
            <span className="text-slate-300 font-medium">MiniLM-L6 (384d)</span>
          </div>
        </div>
      </div>

      {/* Quick Agent Switcher Popup Menu */}
      {showSwitchMenu && (
        <div className="absolute bottom-20 left-3.5 right-3.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-elevated p-3 space-y-2 z-50 animate-scale-in">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
            <span>Switch Agent Context</span>
            <span className="text-emerald-400 font-mono">RBAC</span>
          </div>

          <div className="space-y-1">
            {/* Admin Switch */}
            <button
              onClick={() => {
                switchDemo("admin@estateiq.com");
                setShowSwitchMenu(false);
              }}
              className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                user?.email === "admin@estateiq.com"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <div>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Prajwal Dhande
                </p>
                <p className="text-[10px] text-slate-400">Admin • All Nagpur</p>
              </div>
              {user?.email === "admin@estateiq.com" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Agent Rahul Sharma */}
            <button
              onClick={() => {
                switchDemo("rahul.sharma@estateiq.com");
                setShowSwitchMenu(false);
              }}
              className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                user?.email === "rahul.sharma@estateiq.com"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <div>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Rahul Sharma
                </p>
                <p className="text-[10px] text-blue-300/80">Vasudev Nagar, Dharampeth</p>
              </div>
              {user?.email === "rahul.sharma@estateiq.com" && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>

            {/* Agent Sneha Deshmukh */}
            <button
              onClick={() => {
                switchDemo("sneha@estateiq.com");
                setShowSwitchMenu(false);
              }}
              className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                user?.email === "sneha@estateiq.com"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <div>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" /> Sneha Deshmukh
                </p>
                <p className="text-[10px] text-purple-300/80">MIHAN, Manish Nagar</p>
              </div>
              {user?.email === "sneha@estateiq.com" && <Check className="w-3.5 h-3.5 text-purple-400" />}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between px-1">
            <Link
              href="/login"
              onClick={() => setShowSwitchMenu(false)}
              className="text-[10px] text-slate-400 hover:text-emerald-400 font-medium"
            >
              Auth Screen →
            </Link>
            <button
              onClick={() => {
                logout();
                setShowSwitchMenu(false);
              }}
              className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
            >
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* User / Agent Footer */}
      <div className="p-3.5 border-t border-slate-800/60 flex items-center justify-between bg-slate-950/60 relative">
        <button
          onClick={() => setShowSwitchMenu(!showSwitchMenu)}
          className="flex items-center gap-3 min-w-0 flex-1 text-left hover:opacity-90 transition-opacity"
          title="Click to switch Agent / Admin role"
        >
          <div
            className={cn(
              "w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 shadow-xs",
              isAdmin
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 ring-2 ring-emerald-500/20"
                : "bg-blue-500/15 text-blue-400 border-blue-500/30 ring-2 ring-blue-500/20"
            )}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-100 truncate">
              {cleanName}
            </p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {assignedText}
            </p>
          </div>
        </button>

        <button
          onClick={() => setShowSwitchMenu(!showSwitchMenu)}
          className={cn(
            "px-2 py-1 rounded-full border text-[10px] font-semibold flex items-center gap-1 shrink-0 transition-colors",
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
