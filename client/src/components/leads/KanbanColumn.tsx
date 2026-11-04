"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Lead, PipelineStage } from "@/types";
import { LeadCard } from "./LeadCard";
import { Inbox, AlertTriangle } from "lucide-react";

interface KanbanColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  color: string;
  onLeadClick: (lead: Lead) => void;
  onFollowupUpdate?: (leadId: string, nextFollowUpAt?: string, reason?: string, markCompleted?: boolean) => void;
  isFullWidth?: boolean;
  onStageAdvance?: (leadId: string, nextStage: PipelineStage) => void;
}

const STAGE_THEMES: Record<PipelineStage, { topGradient: string; dotGlow: string; bgTint: string }> = {
  "New Inquiry": {
    topGradient: "from-slate-400 via-slate-500 to-slate-400",
    dotGlow: "bg-slate-400 ring-slate-300",
    bgTint: "group-hover:border-slate-300"
  },
  "Contacted": {
    topGradient: "from-blue-500 via-cyan-400 to-blue-500",
    dotGlow: "bg-blue-500 ring-blue-300",
    bgTint: "group-hover:border-blue-300"
  },
  "Site Visit Scheduled": {
    topGradient: "from-indigo-500 via-violet-400 to-indigo-600",
    dotGlow: "bg-indigo-500 ring-indigo-300",
    bgTint: "group-hover:border-indigo-300"
  },
  "Negotiation": {
    topGradient: "from-amber-400 via-amber-500 to-orange-400",
    dotGlow: "bg-amber-500 ring-amber-300",
    bgTint: "group-hover:border-amber-300"
  },
  "Closed Won": {
    topGradient: "from-emerald-400 via-teal-400 to-emerald-500",
    dotGlow: "bg-emerald-500 ring-emerald-300",
    bgTint: "group-hover:border-emerald-300"
  },
  "Closed Lost": {
    topGradient: "from-rose-400 via-rose-500 to-red-500",
    dotGlow: "bg-rose-400 ring-rose-300",
    bgTint: "group-hover:border-rose-300"
  }
};

export function KanbanColumn({ 
  stage, 
  leads, 
  color, 
  onLeadClick,
  onFollowupUpdate,
  isFullWidth = false,
  onStageAdvance
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage
  });

  const theme = STAGE_THEMES[stage] || STAGE_THEMES["New Inquiry"];

  const totalVolumeInLakhs = leads.reduce((sum, l) => sum + (l.budgetMaxInLakhs || 0), 0);
  const formattedVolume =
    totalVolumeInLakhs >= 100
      ? `₹${(totalVolumeInLakhs / 100).toFixed(1)} Cr`
      : `₹${totalVolumeInLakhs} L`;

  // Count overdue leads in this column
  const now = Date.now();
  const overdueCount = leads.filter((l) => {
    if (l.pipelineStage === "Closed Won" || l.pipelineStage === "Closed Lost") return false;
    if (l.nextFollowUpAt) return new Date(l.nextFollowUpAt).getTime() < now;
    if (l.pipelineStage === "New Inquiry" && l.createdAt) {
      return new Date(l.createdAt).getTime() + 15 * 60 * 1000 < now;
    }
    return false;
  }).length;

  return (
    <div
      ref={setNodeRef}
      className={`${isFullWidth ? "w-full" : "w-[330px] shrink-0"} flex flex-col bg-white/70 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] transition-all duration-200 overflow-hidden ${
        isOver 
          ? "bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-400 ring-2 ring-indigo-400/30 scale-[1.01] shadow-lg" 
          : "hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      {/* 3D Top Luminous Accent Stripe */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${theme.topGradient}`} />

      {/* Column Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full ${color} shrink-0 ring-2 ${theme.dotGlow}`} />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {stage}
          </h3>
          {overdueCount > 0 && (
            <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/60 px-1.5 py-0.2 rounded-full flex items-center gap-1 shadow-2xs shrink-0">
              <AlertTriangle className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
              {overdueCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 font-mono shrink-0">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 px-2 py-0.5 rounded-lg">
            {formattedVolume}
          </span>
          <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-lg border border-indigo-100/80 dark:border-indigo-800/60 shadow-2xs">
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards Scroll Container */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto kanban-scroll max-h-[calc(100vh-230px)] min-h-[220px]">
        {leads.length === 0 ? (
          <div className="h-40 border-2 border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2 p-4 text-center font-mono bg-slate-50/40 dark:bg-slate-900/40">
            <Inbox className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            <span className="text-xs font-semibold text-slate-500">No deals in this stage</span>
            <span className="text-[10px] text-slate-400">Drag deals here to advance pipeline</span>
          </div>
        ) : (
          // Deduplicate leads to guarantee key uniqueness
          Array.from(new Map(leads.map((l) => [l._id, l])).values()).map((lead) => (
            <LeadCard 
              key={lead._id} 
              lead={lead} 
              onClick={onLeadClick} 
              onFollowupUpdate={onFollowupUpdate}
              onStageAdvance={onStageAdvance}
            />
          ))
        )}
      </div>
    </div>
  );
}
