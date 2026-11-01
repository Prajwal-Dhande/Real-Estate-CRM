"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Lead, PipelineStage } from "@/types";
import { LeadCard } from "./LeadCard";

interface KanbanColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  color: string;
  onLeadClick: (lead: Lead) => void;
}

export function KanbanColumn({ stage, leads, color, onLeadClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage
  });

  const totalVolumeInLakhs = leads.reduce((sum, l) => sum + (l.budgetMaxInLakhs || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`w-76 shrink-0 flex flex-col bg-[#F1F5F9]/70 rounded-lg border border-slate-200/90 transition-all ${
        isOver ? "bg-slate-200/60 border-slate-400 ring-2 ring-slate-900/10" : ""
      }`}
    >
      {/* Column Header */}
      <div className="p-3 flex items-center justify-between border-b border-slate-200/80 bg-white/60 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="text-xs font-semibold text-slate-800 font-mono tracking-tight">{stage}</h3>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-slate-400 font-normal">
            ₹{(totalVolumeInLakhs / 100).toFixed(1)}Cr
          </span>
          <span className="text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-200 font-bold">
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards Scroll Container */}
      <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto kanban-scroll max-h-[calc(100vh-190px)] min-h-[160px]">
        {leads.length === 0 ? (
          <div className="h-28 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400 font-mono">
            Empty Stage
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} onClick={onLeadClick} />
          ))
        )}
      </div>
    </div>
  );
}
