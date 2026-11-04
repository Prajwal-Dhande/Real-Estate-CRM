"use client";

import React, { useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Lead } from "@/types";
import { formatCurrencyLakhs } from "@/lib/utils";
import { diagnoseStalledDeal } from "@/lib/genAiCopilot";
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
  Megaphone,
  Search,
  Building,
  Home,
  Globe,
  UserCheck,
  ArrowRight
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
      badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      label = "WA";
      Icon = MessageSquare;
      break;
    case "Meta Ads":
      badgeClasses = "bg-blue-50 text-blue-700 border-blue-200/80";
      label = "Meta";
      Icon = Megaphone;
      break;
    case "Google Ads":
      badgeClasses = "bg-rose-50 text-rose-700 border-rose-200/80";
      label = "Google";
      Icon = Search;
      break;
    case "99acres":
    case "PropertyPortal":
      badgeClasses = "bg-amber-50 text-amber-700 border-amber-200/80";
      label = "99acres";
      Icon = Building;
      break;
    case "MagicBricks":
      badgeClasses = "bg-red-50 text-red-700 border-red-200/80";
      label = "MagicBricks";
      Icon = Home;
      break;
    case "Housing.com":
      badgeClasses = "bg-violet-50 text-violet-700 border-violet-200/80";
      label = "Housing";
      Icon = Building;
      break;
    case "Referral":
      badgeClasses = "bg-cyan-50 text-cyan-700 border-cyan-200/80";
      label = "Referral";
      Icon = UserCheck;
      break;
    case "Website":
      badgeClasses = "bg-indigo-50 text-indigo-700 border-indigo-200/80";
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
      className={`inline-flex items-center gap-1 text-[9px] font-bold border px-1.5 py-0.5 rounded-md shrink-0 shadow-2xs ${badgeClasses}`}
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
    opacity: isDragging ? 0.35 : 1,
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
  const tierConfig: Record<string, { pillBg: string; pillText: string; ringColor: string; avatarBg: string; iconColor: string }> = {
    Hot: {
      pillBg: "bg-rose-50 text-rose-700 border-rose-200/90",
      pillText: "text-rose-700",
      ringColor: "ring-rose-400/30",
      avatarBg: "bg-gradient-to-tr from-rose-100 to-rose-50 text-rose-800 border-rose-200",
      iconColor: "text-rose-500"
    },
    Warm: {
      pillBg: "bg-amber-50 text-amber-700 border-amber-200/90",
      pillText: "text-amber-700",
      ringColor: "ring-amber-400/30",
      avatarBg: "bg-gradient-to-tr from-amber-100 to-amber-50 text-amber-800 border-amber-200",
      iconColor: "text-amber-500"
    },
    Cold: {
      pillBg: "bg-slate-50 text-slate-600 border-slate-200/90",
      pillText: "text-slate-600",
      ringColor: "ring-slate-300/40",
      avatarBg: "bg-gradient-to-tr from-slate-100 to-slate-50 text-slate-700 border-slate-200",
      iconColor: "text-slate-400"
    },
  };

  const tier = tierConfig[lead.aiPriorityTag] || tierConfig.Warm;

  // Compute SLA Countdown & Overdue Telemetry (Priority 4)
  const isClosed = lead.pipelineStage === "Closed Won" || lead.pipelineStage === "Closed Lost";
  
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
    slaText = "Closed";
  } else if (targetTime && diffMs !== null) {
    const absDiff = Math.abs(diffMs);
    const hrs = Math.floor(absDiff / 3600000);
    const mins = Math.floor((absDiff % 3600000) / 60000);

    const timeStr = hrs >= 1 ? `${hrs}h ${mins > 0 ? `${mins}m` : ""}`.trim() : `${mins}m`;

    if (isOverdue) {
      slaText = `Overdue by ${hrs >= 1 ? `${hrs}h` : `${mins}m`}`;
    } else if (isDueSoon) {
      slaText = `Due in ${timeStr}`;
    } else {
      const d = new Date(targetTime);
      const isToday = d.toDateString() === new Date(now).toDateString();
      const timePart = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      slaText = isToday ? `Today, ${timePart}` : `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${timePart}`;
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

  // Direct 1-Click WhatsApp Chat Deep Link
  const handleDirectWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    let cleanDigits = lead.phone.replace(/[^\d]/g, "");
    if (cleanDigits.length === 10) cleanDigits = `91${cleanDigits}`;
    if (!cleanDigits.startsWith("91") && cleanDigits.length === 12) cleanDigits = cleanDigits;

    const localities = lead.preferredLocalities && lead.preferredLocalities.length > 0 
      ? lead.preferredLocalities.join(", ") 
      : "Nagpur prime localities";
      
    const message = 
`Hi ${lead.fullName}, this is Prajwal from EstateIQ Nagpur Real Estate.
I have curated top verified properties matching your ${lead.desiredBhk} BHK requirement in ${localities} within your ₹${lead.budgetMaxInLakhs}L budget.
Would you like me to share their MahaRERA registered CAD floor plans and video walkthroughs?`;

    window.open(`https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // Feature 2: AI Stalled Deal Prediction & Proactive Re-engagement Nudge
  const stalledDiagnosis = diagnoseStalledDeal({
    leadId: lead._id,
    fullName: lead.fullName,
    phone: lead.phone,
    pipelineStage: lead.pipelineStage,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    lastContactedAt: lead.lastContactedAt,
    desiredBhk: lead.desiredBhk,
    budgetMaxInLakhs: lead.budgetMaxInLakhs,
    preferredLocalities: lead.preferredLocalities,
    rawRequirementText: lead.rawRequirementText,
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 select-none p-4 overflow-hidden ${
        isOverdue
          ? "border-rose-300/90 border-l-4 border-l-rose-500 shadow-[0_4px_16px_-4px_rgba(244,63,94,0.12)] hover:shadow-card-hover hover:-translate-y-1"
          : isDueSoon
          ? "border-amber-300/90 border-l-4 border-l-amber-500 shadow-[0_4px_16px_-4px_rgba(245,158,11,0.12)] hover:shadow-card-hover hover:-translate-y-1"
          : "border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] hover:border-indigo-300/80 hover:shadow-card-hover hover:-translate-y-1"
      } ${isDragging ? "ring-2 ring-indigo-500 shadow-2xl opacity-60 scale-[1.02] cursor-grabbing" : ""}`}
    >
      {/* 3D Top Specular Shine Line on Hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Top Row: Avatar, Name & Drag Handle */}
      <div className="flex items-start justify-between gap-2.5">
        <div
          onClick={() => onClick(lead)}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
        >
          {/* Avatar with Initials */}
          <div
            className={`w-8 h-8 rounded-full ${tier.avatarBg} font-black text-[11px] flex items-center justify-center shrink-0 ring-2 ${tier.ringColor} shadow-2xs transition-transform group-hover:scale-105`}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 justify-between">
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                {lead.fullName}
              </h4>
              {renderSourceBadge(lead.source, lead.campaignName)}
            </div>
            <div className="flex items-center justify-between gap-1 mt-0.5">
              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 font-mono">
                <Phone className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                <span>{lead.phone}</span>
              </p>
              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-[9px] font-mono font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 shrink-0"
                title={`Launch 1-click WhatsApp chat with ${lead.fullName}`}
              >
                <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />
                <span>WA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Grip Drag Handle */}
        <div
          {...listeners}
          {...attributes}
          className="p-1 -mr-1 -mt-1 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing rounded-md hover:bg-slate-100 transition-colors shrink-0"
          title="Drag to advance pipeline milestone"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Requirement Snippet Capsule */}
      <div onClick={() => onClick(lead)} className="mt-2.5 cursor-pointer">
        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2 rounded-xl border border-slate-100/90 font-sans">
          {lead.rawRequirementText}
        </p>

        {/* Feature Pills: BHK & Localities */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-100/70 text-[10px]">
            <BedDouble className="w-3 h-3 text-indigo-500" />
            {lead.desiredBhk} BHK
          </span>
          {lead.preferredLocalities && lead.preferredLocalities.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200/60 truncate max-w-[150px]">
              <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              <span className="truncate">{lead.preferredLocalities.join(", ")}</span>
            </span>
          )}
        </div>
      </div>

      {/* SLA FOLLOW-UP STATUS & QUICK ACTION BAR (Priority 4) */}
      {!isClosed && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 relative">
          {targetTime ? (
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono transition-all ${
                isOverdue
                  ? "bg-rose-50 text-rose-700 border border-rose-200 font-bold shadow-2xs"
                  : isDueSoon
                  ? "bg-amber-50 text-amber-700 border border-amber-200 font-semibold"
                  : "bg-slate-50 text-slate-600 border border-slate-200/70 font-medium"
              }`}
            >
              {isOverdue ? (
                <span className="relative flex h-2 w-2 shrink-0">
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
              <span>+ Set SLA</span>
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
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-0.5 transition-colors ${
                isOverdue
                  ? "bg-rose-100 hover:bg-rose-200 text-rose-800"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
              title="Quick follow-up action"
            >
              <span>Action</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {/* Quick Action Dropdown Menu */}
            {showQuickMenu && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-1.5 w-44 bg-white rounded-xl shadow-elevated border border-slate-200/90 py-1.5 z-30 font-mono text-xs animate-in fade-in slide-in-from-bottom-2 duration-150"
              >
                <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                  Follow-up Action
                </div>
                <button
                  type="button"
                  onClick={(e) => handleQuickAction("completed", e)}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-50 text-emerald-700 flex items-center gap-1.5 text-[11px] font-bold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark Done</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleQuickAction("plus1h", e)}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-[11px]"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>+1 Hour</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleQuickAction("plus4h", e)}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-[11px]"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>+4 Hours</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleQuickAction("tomorrow", e)}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-[11px]"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tomorrow 10 AM</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Stalled Deal Nudge Capsule */}
      {!isClosed && stalledDiagnosis.isStalled && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            let clean = lead.phone.replace(/[^\d]/g, "");
            if (clean.length === 10) clean = `91${clean}`;
            window.open(`https://wa.me/${clean}?text=${encodeURIComponent(stalledDiagnosis.suggestedReengagementPitch)}`, "_blank");
          }}
          className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 border border-amber-200/90 flex items-center justify-between text-[10px] font-mono transition-all cursor-pointer shadow-2xs group/stalled"
          title={stalledDiagnosis.reason}
        >
          <span className="flex items-center gap-1.5 font-bold truncate">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="text-amber-800">⚠️ Stalled ({stalledDiagnosis.daysInactive}d):</span>
            <span className="text-amber-700 truncate font-normal">Re-engage lead</span>
          </span>
          <span className="text-[9px] font-bold text-amber-900 bg-amber-200/80 group-hover/stalled:bg-amber-300 px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-0.5 transition-colors">
            <span>Nudge</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      )}

      {/* Bottom Footer: Clean Baseline with Budget & AI Match Score */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[12px] font-black text-slate-900 tracking-tight font-mono">
            {formatCurrencyLakhs(lead.budgetMaxInLakhs)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${tier.pillBg}`}
          >
            {lead.aiPriorityTag}
          </span>

          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded-md shadow-2xs">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            <span>{lead.aiScore}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
