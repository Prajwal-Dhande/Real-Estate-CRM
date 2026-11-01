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

  return (
    <div
      ref={setNodeRef}
      className={`w-80 shrink-0 flex flex-col bg-slate-100/70 rounded-2xl border border-slate-200/90 transition-colors ${
        isOver ? "bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-400/20" : ""
      }`}
    >
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{stage}</h3>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
          {leads.length}
        </span>
      </div>

      {/* Cards Scroll Container */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto kanban-scroll max-h-[calc(100vh-210px)] min-h-[150px]">
        {leads.length === 0 ? (
          <div className="h-28 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
            Drop leads here
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

