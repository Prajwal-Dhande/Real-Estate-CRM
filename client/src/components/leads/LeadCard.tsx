"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Lead } from "@/types";
import { formatCurrencyLakhs } from "@/lib/utils";
import { Sparkles, MapPin, BedDouble, GripVertical } from "lucide-react";

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
    cursor: "grab"
  };

  // Color-coded aiPriorityTag: Hot = Red, Warm = Amber, Cold = Blue
  const priorityStyles: Record<string, { bg: string; text: string; border: string }> = {
    Hot: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200"
    },
    Warm: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200"
    },
    Cold: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200"
    }
  };

  const priority = priorityStyles[lead.aiPriorityTag] || priorityStyles.Warm;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all select-none ${
        isDragging ? "ring-2 ring-indigo-500 shadow-xl" : ""
      }`}
    >
      {/* Top Header: Name + Drag Handle */}
      <div className="flex items-start justify-between gap-2">
        <div 
          onClick={() => onClick(lead)}
          className="flex-1 cursor-pointer"
        >
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {lead.fullName}
          </h4>
          <p className="text-xs text-slate-500 font-medium">{lead.phone}</p>
        </div>

        <div
          {...listeners}
          {...attributes}
          className="p-1 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing rounded"
          title="Drag to update stage"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      {/* Main details clickable */}
      <div onClick={() => onClick(lead)} className="mt-3 space-y-2.5 cursor-pointer">
        {/* Requirement snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
          {lead.rawRequirementText}
        </p>

        {/* Specs: BHK + Localities */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            <BedDouble className="w-3.5 h-3.5 text-indigo-500" /> {lead.desiredBhk} BHK
          </span>
          {lead.preferredLocalities && lead.preferredLocalities.length > 0 && (
            <span className="inline-flex items-center gap-1 truncate text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{lead.preferredLocalities.join(", ")}</span>
            </span>
          )}
        </div>

        {/* Bottom Badges: Budget + AI Score + Priority */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-800">
            {formatCurrencyLakhs(lead.budgetMaxInLakhs)}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Color-coded Priority Tag */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priority.bg} ${priority.text} ${priority.border}`}
            >
              {lead.aiPriorityTag}
            </span>

            {/* AI Score Badge */}
            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded-full shadow-xs">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              {lead.aiScore}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

