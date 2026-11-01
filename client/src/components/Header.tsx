"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Bell, Radio, Search, CheckCircle2, AlertCircle } from "lucide-react";

export function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
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
                  notifications.map((n, i) => (
                    <div key={i} className="p-2.5 text-slate-700 hover:bg-slate-50 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="leading-snug">{n}</span>
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
