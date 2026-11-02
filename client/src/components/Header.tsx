"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { Bell, Radio, Search, CheckCircle2, AlertCircle, ShieldCheck, UserCheck, Repeat } from "lucide-react";

export function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { user, isAdmin, isAgent, assignedLocalities, switchDemo } = useAuth();
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
      const msg = `New Lead: ${lead.fullName} (${lead.aiPriorityTag} • ${lead.aiScore} pts)`;
      setNotifications((prev) => [msg, ...prev.slice(0, 4)]);
    };

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.on("followup:due", handleFollowupDue);
    s.on("lead:created", handleLeadCreated);

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("followup:due", handleFollowupDue);
      s.off("lead:created", handleLeadCreated);
    };
  }, []);

  return (
    <header className="h-14 px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">{title || "Dashboard"}</h1>
        {subtitle && (
          <>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-normal">{subtitle}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Active Role & Territory Context Badge */}
        {isAdmin ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-[11px] font-mono text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">Admin View:</span>
            <span>All Nagpur</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200/80 text-[11px] font-mono text-blue-800">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold">{user?.name}:</span>
            <span className="truncate max-w-[200px]">📍 {assignedLocalities.join(", ")}</span>
          </div>
        )}

        {/* Quick Auth Switch Link */}
        <Link
          href="/login"
          className="text-[11px] font-mono text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center gap-1 transition-colors"
          title="Switch User Context"
        >
          <Repeat className="w-3 h-3 text-slate-500" />
          <span className="hidden md:inline">Switch Role</span>
        </Link>

        {/* WebSocket Real-time Status */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-mono">
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
          <span className={socketConnected ? "text-slate-700 font-medium" : "text-amber-700"}>
            {socketConnected ? "Sync: Connected" : "Connecting..."}
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 relative transition-colors"
            title="Real-time Alerts"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-900 font-mono text-[11px] uppercase tracking-wider">
                  Live Stream
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Socket.io</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    No active alerts. Real-time events will appear here.
                  </div>
                ) : (
                  notifications.map((msg, idx) => (
                    <div key={idx} className="p-3 hover:bg-slate-50 transition-colors">
                      <p className="text-slate-700 text-xs">{msg}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">Just now</span>
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
