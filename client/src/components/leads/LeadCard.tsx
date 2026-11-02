"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Lead } from "@/types";
import { formatCurrencyLakhs } from "@/lib/utils";
import { MapPin, BedDouble, GripVertical, Sparkles, MessageSquare, Phone } from "lucide-react";

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead._id,
    data: { lead }
  });

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-xl border border-slate-200/70 p-4 shadow-card hover:shadow-card-hover transition-all duration-200 select-none hover:-translate-y-0.5 ${
        isDragging ? "ring-2 ring-indigo-500 shadow-xl opacity-50 scale-[1.02]" : ""
      }`}
    >
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
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                {lead.fullName}
              </h4>
              {lead.source === "WhatsApp" && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-full shrink-0">
                  <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />
                  WA
                </span>
              )}
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

        {/* Bottom Footer: Budget & AI Match Score */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium tracking-wider">Budget</span>
            <span className="text-xs font-bold text-slate-900 tracking-tight">
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
    </div>
  );
}
