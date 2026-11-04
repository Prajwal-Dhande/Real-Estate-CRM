"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { Bell, ShieldCheck, UserCheck, Repeat, Activity, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { user, isAdmin, isAgent, assignedLocalities } = useAuth();
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    if (s.connected) {
      setSocketConnected(true);
    }

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    const handleFollowupDue = (reminder: any) => {
      const msg = `Follow-up Due: ${reminder.leadName} (${reminder.notes || "Follow-up required"})`;
      setNotifications((prev) => [msg, ...prev.slice(0, 4)]);
    };

    const handleLeadCreated = (lead: any) => {
      const isWA = lead.source === "WhatsApp";
      const icon = isWA ? "💬 WhatsApp Lead: " : "New Inbound: ";
      const msg = `${icon}${lead.fullName} (${lead.aiPriorityTag} • ${lead.aiScore} pts)`;
      setNotifications((prev) => [msg, ...prev.slice(0, 4)]);
    };

    const handleWhatsAppLead = (payload: any) => {
      const lead = payload.lead || {};
      const msg = `💬 WhatsApp Lead: ${lead.fullName || "Inbound"} ("${payload.message || ""}")`;
      setNotifications((prev) => [msg, ...prev.slice(0, 4)]);
    };

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.on("followup:due", handleFollowupDue);
    s.on("lead:created", handleLeadCreated);
    s.on("whatsapp:new_lead", handleWhatsAppLead);

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("followup:due", handleFollowupDue);
      s.off("lead:created", handleLeadCreated);
      s.off("whatsapp:new_lead", handleWhatsAppLead);
    };
  }, []);

  return (
    <header className="h-16 px-6 md:px-8 bg-white/80 dark:bg-[#0E1528]/95 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between shrink-0 sticky top-0 z-20 transition-colors duration-200">
      {/* Title & Subtitle */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white tracking-tight">
          {title || "Dashboard"}
        </h1>
        {subtitle && (
          <>
            <span className="text-slate-300 dark:text-slate-600 font-light">/</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">
              {subtitle}
            </span>
          </>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Raycast / Linear Style Command Palette Trigger (Priority 5) */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all shadow-2xs group"
          title="Open Command Palette (⌘K or Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 font-normal text-xs">Search leads, properties...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Active Role Capsule */}
        {isAdmin ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/70 text-xs text-emerald-800 dark:text-emerald-300 shadow-2xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Admin</span>
            <span className="text-emerald-400">•</span>
            <span className="text-emerald-700 dark:text-emerald-300">All Nagpur</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/70 text-xs text-blue-800 dark:text-blue-300 shadow-2xs font-medium">
            <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{user?.name.replace(/\s*\([^)]*\)/, "")}:</span>
            <span className="truncate max-w-[160px] text-blue-700 dark:text-blue-300">{assignedLocalities.slice(0, 2).join(", ")}</span>
          </div>
        )}

        {/* Quick Auth Switch Link */}
        <Link
          href="/login"
          className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all shadow-2xs font-medium"
          title="Switch User Context"
        >
          <Repeat className="w-3 h-3 text-slate-400 dark:text-slate-400" />
          <span className="hidden lg:inline">Switch Role</span>
        </Link>

        {/* Live Sync Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs text-slate-600 dark:text-slate-300">
          <span className="relative flex h-2 w-2">
            {socketConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            )}
          </span>
          <span className="font-medium text-[11px]">
            {socketConnected ? "Live Sync" : "Syncing..."}
          </span>
        </div>

        {/* Luxury Dark/Light Mode Switcher */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 relative transition-all shadow-2xs"
            title="Real-time Alerts"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-elevated dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] border border-slate-200/80 dark:border-slate-800 py-2 z-50 animate-scale-in text-xs">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  Live Notifications
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  Real-time
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-5 text-center text-slate-400 dark:text-slate-500">
                    No active notifications. New WhatsApp leads and SLA follow-ups will appear here.
                  </div>
                ) : (
                  notifications.map((msg, idx) => (
                    <div key={idx} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <p className="text-slate-700 dark:text-slate-300 text-xs leading-snug">{msg}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">Just now</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
