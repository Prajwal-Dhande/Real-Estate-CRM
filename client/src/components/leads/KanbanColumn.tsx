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
}

export function KanbanColumn({ 
  stage, 
  leads, 
  color, 
  onLeadClick,
  onFollowupUpdate 
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage
  });

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
      className={`w-80 shrink-0 flex flex-col bg-slate-100/70 rounded-2xl border border-slate-200/80 transition-all duration-200 ${
        isOver ? "bg-indigo-50/40 border-indigo-300 ring-2 ring-indigo-400/30 scale-[1.01]" : ""
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-xs rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${color} shadow-xs`} />
          <h3 className="text-xs font-semibold text-slate-800 tracking-tight">{stage}</h3>
          {overdueCount > 0 && (
            <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200/90 px-1.5 py-0.2 rounded-full flex items-center gap-1 shadow-2xs">
              <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
              {overdueCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {formattedVolume}
          </span>
          <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards Scroll Container */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto kanban-scroll max-h-[calc(100vh-210px)] min-h-[180px]">
        {leads.length === 0 ? (
          <div className="h-32 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center font-mono">
            <Inbox className="w-5 h-5 text-slate-300" />
            <span className="text-xs font-medium text-slate-400">No leads in this stage</span>
          </div>
        ) : (
          // Deduplicate leads to guarantee key uniqueness
          Array.from(new Map(leads.map((l) => [l._id, l])).values()).map((lead) => (
            <LeadCard 
              key={lead._id} 
              lead={lead} 
              onClick={onLeadClick} 
              onFollowupUpdate={onFollowupUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}
