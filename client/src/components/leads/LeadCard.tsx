"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Lead } from "@/types";
import { formatCurrencyLakhs } from "@/lib/utils";
import { MapPin, BedDouble, GripVertical, Sparkles, MessageSquare } from "lucide-react";

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
    opacity: isDragging ? 0.35 : 1,
    cursor: "grab"
  };

  const priorityConfig: Record<string, { dot: string; text: string; bg: string; border: string }> = {
    Hot: {
      dot: "bg-rose-500",
      text: "text-rose-700",
      bg: "bg-rose-50/70",
      border: "border-rose-200/70"
    },
    Warm: {
      dot: "bg-amber-500",
      text: "text-amber-700",
      bg: "bg-amber-50/70",
      border: "border-amber-200/70"
    },
    Cold: {
      dot: "bg-slate-400",
      text: "text-slate-600",
      bg: "bg-slate-50",
      border: "border-slate-200"
    }
  };

  const priority = priorityConfig[lead.aiPriorityTag] || priorityConfig.Warm;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-2xs hover:border-slate-400/80 transition-all select-none ${
        isDragging ? "ring-2 ring-slate-900 shadow-lg" : ""
      }`}
    >
      {/* Top Header: Name + Drag Handle */}
      <div className="flex items-start justify-between gap-2">
        <div 
          onClick={() => onClick(lead)}
          className="flex-1 cursor-pointer min-w-0"
        >
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot} shrink-0`} />
            <h4 className="text-xs font-semibold text-slate-900 group-hover:text-slate-700 transition-colors truncate">
              {lead.fullName}
            </h4>
            {lead.source === "WhatsApp" && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 px-1 py-0.2 rounded shrink-0">
                <MessageSquare className="w-2.5 h-2.5 text-emerald-600" /> WA
              </span>
            )}
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">{lead.phone}</p>
        </div>

        <div
          {...listeners}
          {...attributes}
          className="p-1 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing rounded hover:bg-slate-100"
          title="Drag to update stage"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main Details Clickable */}
      <div onClick={() => onClick(lead)} className="mt-2.5 space-y-2 cursor-pointer">
        {/* Requirement snippet */}
        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2 rounded border border-slate-100">
          "{lead.rawRequirementText}"
        </p>

        {/* Specs: BHK + Localities */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
            <BedDouble className="w-3 h-3 text-slate-500" /> {lead.desiredBhk} BHK
          </span>
          {lead.preferredLocalities && lead.preferredLocalities.length > 0 && (
            <span className="inline-flex items-center gap-1 truncate text-slate-500 max-w-[130px]">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{lead.preferredLocalities.join(", ")}</span>
            </span>
          )}
        </div>

        {/* Bottom Metadata: Budget + AI Score + Priority */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="font-mono font-bold text-slate-900">
            {formatCurrencyLakhs(lead.budgetMaxInLakhs)}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Color-coded Priority Tag */}
            <span
              className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border ${priority.bg} ${priority.text} ${priority.border}`}
            >
              {lead.aiPriorityTag}
            </span>

            {/* AI Score Badge */}
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-slate-900 text-white px-1.5 py-0.2 rounded">
              <span>{lead.aiScore}</span>
              <span className="text-[8px] text-slate-400 font-normal">pts</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
