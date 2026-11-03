"use client";

import React, { useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Lead } from "@/types";
import { formatCurrencyLakhs } from "@/lib/utils";
import { 
  MapPin, 
  BedDouble, 
  GripVertical, 
  Sparkles, 
  MessageSquare, 
  Phone, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  ChevronDown,
  RotateCcw,
  Megaphone,
  Search,
  Building,
  Home,
  Globe,
  UserCheck
} from "lucide-react";

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  onFollowupUpdate?: (leadId: string, nextFollowUpAt?: string, reason?: string, markCompleted?: boolean) => void;
}

function renderSourceBadge(source: string, campaignName?: string) {
  let badgeClasses = "bg-slate-50 text-slate-700 border-slate-200";
  let label = source;
  let Icon = Globe;

  switch (source) {
    case "WhatsApp":
      badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
      label = "WA";
      Icon = MessageSquare;
      break;
    case "Meta Ads":
      badgeClasses = "bg-blue-50 text-blue-700 border-blue-200";
      label = "Meta";
      Icon = Megaphone;
      break;
    case "Google Ads":
      badgeClasses = "bg-rose-50 text-rose-700 border-rose-200";
      label = "Google";
      Icon = Search;
      break;
    case "99acres":
    case "PropertyPortal":
      badgeClasses = "bg-amber-50 text-amber-700 border-amber-200";
      label = "99acres";
      Icon = Building;
      break;
    case "MagicBricks":
      badgeClasses = "bg-red-50 text-red-700 border-red-200";
      label = "MagicBricks";
      Icon = Home;
      break;
    case "Housing.com":
      badgeClasses = "bg-violet-50 text-violet-700 border-violet-200";
      label = "Housing";
      Icon = Building;
      break;
    case "Referral":
      badgeClasses = "bg-cyan-50 text-cyan-700 border-cyan-200";
      label = "Referral";
      Icon = UserCheck;
      break;
    case "Website":
      badgeClasses = "bg-indigo-50 text-indigo-700 border-indigo-200";
      label = "Web";
      Icon = Globe;
      break;
    default:
      badgeClasses = "bg-slate-50 text-slate-600 border-slate-200";
      label = source;
      Icon = Globe;
  }

  return (
    <span 
      className={`inline-flex items-center gap-0.5 text-[9px] font-semibold border px-1.5 py-0.2 rounded-full shrink-0 ${badgeClasses}`}
      title={campaignName ? `Channel: ${source} • Campaign: ${campaignName}` : `Channel: ${source}`}
    >
      <Icon className="w-2.5 h-2.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
}

export function LeadCard({ lead, onClick, onFollowupUpdate }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead._id,
    data: { lead }
  });

  const [now, setNow] = useState<number>(Date.now());
  const [showQuickMenu, setShowQuickMenu] = useState<boolean>(false);

  // Ticking timer for real-time countdown every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.4 : 1,
  };

  // Initials for avatar
  const initials = lead.fullName
    ? lead.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "L";

  // Tier color styling
  const tierConfig: Record<string, { pillBg: string; pillText: string; ringColor: string; avatarBg: string }> = {
    Hot: {
      pillBg: "bg-rose-50 text-rose-700 border-rose-200/80",
      pillText: "text-rose-700",
      ringColor: "ring-rose-500/30",
      avatarBg: "bg-rose-100/70 text-rose-800",
    },
    Warm: {
      pillBg: "bg-amber-50 text-amber-700 border-amber-200/80",
      pillText: "text-amber-700",
      ringColor: "ring-amber-500/30",
      avatarBg: "bg-amber-100/70 text-amber-800",
    },
    Cold: {
      pillBg: "bg-slate-50 text-slate-600 border-slate-200/80",
      pillText: "text-slate-600",
      ringColor: "ring-slate-300",
      avatarBg: "bg-slate-100 text-slate-600",
    },
  };

  const tier = tierConfig[lead.aiPriorityTag] || tierConfig.Warm;

  // Compute SLA Countdown & Overdue Telemetry (Priority 4)
  const isClosed = lead.pipelineStage === "Closed Won" || lead.pipelineStage === "Closed Lost";
  
  // Follow-up target timestamp: explicit follow-up OR 15-min SLA for New Inquiry
  let targetTime: number | null = null;
  if (lead.nextFollowUpAt) {
    targetTime = new Date(lead.nextFollowUpAt).getTime();
  } else if (lead.pipelineStage === "New Inquiry" && lead.createdAt) {
    targetTime = new Date(lead.createdAt).getTime() + 15 * 60 * 1000;
  }

  const diffMs = targetTime ? targetTime - now : null;
  const isOverdue = !isClosed && diffMs !== null && diffMs < 0;
  const isDueSoon = !isClosed && diffMs !== null && diffMs >= 0 && diffMs <= 2 * 3600000; // < 2 hours

  // Format SLA label
  let slaText = "";
  if (isClosed) {
    slaText = "Deal Completed";
  } else if (targetTime && diffMs !== null) {
    const absDiff = Math.abs(diffMs);
    const hrs = Math.floor(absDiff / 3600000);
    const mins = Math.floor((absDiff % 3600000) / 60000);

    const timeStr = hrs >= 1 ? `${hrs}h ${mins > 0 ? `${mins}m` : ""}`.trim() : `${mins}m`;

    if (isOverdue) {
      slaText = `⚠️ Overdue by ${hrs >= 1 ? `${hrs} hr${hrs > 1 ? "s" : ""}` : `${mins}m`}`;
    } else if (isDueSoon) {
      slaText = `⏱️ Due in ${timeStr}`;
    } else {
      const d = new Date(targetTime);
      const isToday = d.toDateString() === new Date(now).toDateString();
      const timePart = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      slaText = isToday ? `Today, ${timePart}` : `📅 ${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${timePart}`;
    }
  }

  // Quick Action Handler
  const handleQuickAction = (action: "plus1h" | "plus4h" | "tomorrow" | "completed", e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuickMenu(false);
    if (!onFollowupUpdate) return;

    if (action === "completed") {
      onFollowupUpdate(lead._id, undefined, "Marked callback completed", true);
    } else {
      let nextDate = new Date();
      let reasonText = "";
      if (action === "plus1h") {
        nextDate = new Date(Date.now() + 3600000);
        reasonText = "Snoozed by 1 hour";
      } else if (action === "plus4h") {
        nextDate = new Date(Date.now() + 4 * 3600000);
        reasonText = "Snoozed by 4 hours";
      } else if (action === "tomorrow") {
        nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(10, 0, 0, 0);
        reasonText = "Scheduled for tomorrow 10:00 AM";
      }
      onFollowupUpdate(lead._id, nextDate.toISOString(), reasonText, false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white/95 backdrop-blur-sm rounded-2xl border transition-all duration-200 select-none p-4 overflow-hidden ${
        isOverdue
          ? "border-rose-300/90 border-l-4 border-l-rose-500 shadow-xs ring-1 ring-rose-200/50 bg-gradient-to-br from-white to-rose-50/20 hover:shadow-card-hover hover:-translate-y-1"
          : isDueSoon
          ? "border-amber-300/90 border-l-4 border-l-amber-500 shadow-2xs bg-gradient-to-br from-white to-amber-50/20 hover:shadow-card-hover hover:-translate-y-1"
          : "border-slate-200/80 shadow-2xs hover:border-indigo-300/80 hover:shadow-card-hover hover:-translate-y-1"
      } ${isDragging ? "ring-2 ring-indigo-500 shadow-xl opacity-50 scale-[1.02]" : ""}`}
    >
      {/* 3D Top Specular Shine Line on Hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {/* Top Card Row: Avatar, Name & Drag Handle */}
      <div className="flex items-start justify-between gap-3">
        <div
          onClick={() => onClick(lead)}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
        >
          {/* Avatar with Initials */}
          <div
            className={`w-8 h-8 rounded-full ${tier.avatarBg} font-semibold text-[11px] flex items-center justify-center shrink-0 ring-2 ${tier.ringColor} transition-transform group-hover:scale-105`}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                {lead.fullName}
              </h4>
              {renderSourceBadge(lead.source, lead.campaignName)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1 font-mono">
              <Phone className="w-2.5 h-2.5 text-slate-300" />
              {lead.phone}
            </p>
          </div>
        </div>

        {/* Subtle Grip Drag Handle */}
        <div
          {...listeners}
          {...attributes}
          className="p-1 -mr-1 -mt-1 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing rounded-md hover:bg-slate-100 transition-colors"
          title="Drag to update deal stage"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Requirement Snippet (Elegant Truncated Note) */}
      <div onClick={() => onClick(lead)} className="mt-3 cursor-pointer">
        <p className="text-[11px] text-slate-600 italic line-clamp-2 leading-relaxed pl-2 border-l-2 border-indigo-200">
          &ldquo;{lead.rawRequirementText}&rdquo;
        </p>

        {/* Feature Pills: BHK & Localities */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100/80 text-slate-700 font-medium">
            <BedDouble className="w-3 h-3 text-slate-400" />
            {lead.desiredBhk} BHK
          </span>
          {lead.preferredLocalities && lead.preferredLocalities.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200/60 truncate max-w-[140px]">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{lead.preferredLocalities.join(", ")}</span>
            </span>
          )}
        </div>
      </div>

      {/* SLA FOLLOW-UP COUNTDOWN BADGE & QUICK ACTION BAR (Priority 4) */}
      {!isClosed && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5 relative">
          {targetTime ? (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                isOverdue
                  ? "bg-rose-50 text-rose-700 border border-rose-200/90 font-bold shadow-2xs"
                  : isDueSoon
                  ? "bg-amber-50 text-amber-700 border border-amber-200/90 font-semibold"
                  : "bg-slate-50 text-slate-600 border border-slate-200/80 font-medium"
              }`}
            >
              {isOverdue ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              ) : isDueSoon ? (
                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
              ) : (
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              )}
              <span className="truncate">{slaText}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickMenu(!showQuickMenu);
              }}
              className="text-[10px] font-mono text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <Clock className="w-3 h-3 text-slate-300" />
              <span>+ Set Follow-up SLA</span>
            </button>
          )}

          {/* Quick SLA Snooze / Complete Button */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickMenu(!showQuickMenu);
              }}
              className={`px-1.5 py-1 rounded-md text-[10px] font-mono font-medium flex items-center gap-0.5 transition-colors ${
                isOverdue
                  ? "bg-rose-100/70 hover:bg-rose-200 text-rose-800"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
              title="Quick follow-up snooze or complete"
            >
              <span>Snooze</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Quick Action Dropdown Menu */}
            {showQuickMenu && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-30 font-mono text-xs animate-in fade-in slide-in-from-bottom-2 duration-150"
              >
                <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                  Follow-up Action
                </div>
                <button
                  type="button"
                  onClick={(e) => handleQuickAction("completed", e)}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-50 text-emerald-700 flex items-center gap-1.5 text-[11px] font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark Callback Done</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleQuickAction("plus1h", e)}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-[11px]"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Snooze +1 Hour</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleQuickAction("plus4h", e)}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-[11px]"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Snooze +4 Hours</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleQuickAction("tomorrow", e)}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-[11px]"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tomorrow 10:00 AM</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Footer: Budget & AI Match Score */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-medium tracking-wider font-mono">Budget</span>
          <span className="text-xs font-bold text-slate-900 tracking-tight font-mono">
            {formatCurrencyLakhs(lead.budgetMaxInLakhs)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tier.pillBg}`}
          >
            {lead.aiPriorityTag}
          </span>

          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            <span>{lead.aiScore}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
