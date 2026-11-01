"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Bell, Radio, Search } from "lucide-react";

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
      const msg = `New Lead: ${lead.fullName} (${lead.aiPriorityTag} - ${lead.aiScore} pts)`;
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
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title || "Dashboard Analytics"}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Socket.io Live Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium">
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
          <span className={socketConnected ? "text-emerald-700 font-semibold" : "text-amber-700"}>
            {socketConnected ? "Socket Live" : "Connecting..."}
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            title="Real-time Alerts"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Alerts</span>
                <span className="text-[10px] text-indigo-600 font-medium">Socket.io feed</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No recent alerts. Real-time events will pop up here!
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="p-3 text-xs text-slate-700 hover:bg-slate-50">
                      {n}
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

