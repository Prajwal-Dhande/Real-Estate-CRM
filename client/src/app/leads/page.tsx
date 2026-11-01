"use client";

import React, { useState, useEffect } from "react";
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from "@dnd-kit/core";
import { Header } from "@/components/Header";
import { KanbanColumn } from "@/components/leads/KanbanColumn";
import { LeadDetailDrawer } from "@/components/leads/LeadDetailDrawer";
import { NewLeadModal } from "@/components/leads/NewLeadModal";
import { Lead, PipelineStage } from "@/types";
import { fetchLeads, updateLeadStage } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { Plus, Search, Filter, RefreshCw, Layers } from "lucide-react";

const STAGES: { stage: PipelineStage; color: string }[] = [
  { stage: "New Inquiry", color: "bg-blue-500" },
  { stage: "Contacted", color: "bg-indigo-500" },
  { stage: "Site Visit Scheduled", color: "bg-purple-500" },
  { stage: "Negotiation", color: "bg-amber-500" },
  { stage: "Closed Won", color: "bg-emerald-500" },
  { stage: "Closed Lost", color: "bg-rose-500" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState<boolean>(false);

  // Configure pointer sensor for smooth dragging with a small distance threshold
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  );

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Real-time Socket.io events
  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const handleLeadCreated = (newLead: Lead) => {
      console.log("[Socket] Received new lead:", newLead);
      setLeads((prev) => {
        // Prevent duplicate insertion
        if (prev.some((l) => l._id === newLead._id)) return prev;
        return [newLead, ...prev];
      });
    };

    const handleLeadStageUpdated = (payload: any) => {
      console.log("[Socket] Received lead stage update:", payload);
      setLeads((prev) =>
        prev.map((l) => {
          if (l._id === payload._id || l._id === payload.leadId) {
            return {
              ...l,
              pipelineStage: payload.pipelineStage,
              aiScore: payload.aiScore !== undefined ? payload.aiScore : l.aiScore,
              aiPriorityTag: payload.aiPriorityTag || l.aiPriorityTag,
              aiScoreFactors: payload.aiScoreFactors || l.aiScoreFactors
            };
          }
          return l;
        })
      );

      // If drawer is open on this lead, update it
      setSelectedLead((prev) => {
        if (prev && (prev._id === payload._id || prev._id === payload.leadId)) {
          return {
            ...prev,
            pipelineStage: payload.pipelineStage,
            aiScore: payload.aiScore !== undefined ? payload.aiScore : prev.aiScore,
            aiPriorityTag: payload.aiPriorityTag || prev.aiPriorityTag,
            aiScoreFactors: payload.aiScoreFactors || prev.aiScoreFactors
          };
        }
        return prev;
      });
    };

    s.on("lead:created", handleLeadCreated);
    s.on("lead:stage_updated", handleLeadStageUpdated);

    return () => {
      s.off("lead:created", handleLeadCreated);
      s.off("lead:stage_updated", handleLeadStageUpdated);
    };
  }, []);

  // Handle Drag & Drop between stages
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStage = over.id as PipelineStage;

    const currentLead = leads.find((l) => l._id === leadId);
    if (!currentLead || currentLead.pipelineStage === newStage) return;

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l._id === leadId ? { ...l, pipelineStage: newStage } : l))
    );

    try {
      await updateLeadStage(leadId, newStage, `Moved to ${newStage} via drag-and-drop`);
    } catch (err) {
      console.error("Error updating stage:", err);
      // Revert if API fails
      setLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, pipelineStage: currentLead.pipelineStage } : l))
      );
    }
  };

  // Filter leads by search & priority tag
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.preferredLocalities.some((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lead.rawRequirementText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "All" || lead.aiPriorityTag === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <Header
        title="Lead Pipeline"
        subtitle="Drag-and-drop Kanban with AI conversion scoring and real-time Socket.io sync"
      />

      {/* Top Filter and Action Toolbar */}
      <div className="px-6 py-3.5 bg-white border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by name, phone, locality, or requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="All">All Priority</option>
              <option value="Hot">🔥 Hot (&gt;70)</option>
              <option value="Warm">⚡ Warm (40-69)</option>
              <option value="Cold">❄️ Cold (&lt;40)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadLeads}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Leads"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsNewLeadModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            Add New Lead
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto p-6 kanban-scroll">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-5 h-full items-start min-w-max pb-4">
            {STAGES.map(({ stage, color }) => {
              const stageLeads = filteredLeads.filter((l) => l.pipelineStage === stage);
              return (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  leads={stageLeads}
                  color={color}
                  onLeadClick={(lead) => setSelectedLead(lead)}
                />
              );
            })}
          </div>
        </DndContext>
      </div>

      {/* Slide-over Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onLeadUpdated={(updated) => {
          setLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
          setSelectedLead(updated);
        }}
      />

      {/* New Lead Creation Modal */}
      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onLeadCreated={(newLead) => {
          setLeads((prev) => [newLead, ...prev]);
        }}
      />
    </div>
  );
}

