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
import { useAuth } from "@/context/AuthContext";
import { Plus, Search, Filter, RefreshCw, SlidersHorizontal, MapPin, UserCheck, ShieldCheck } from "lucide-react";

const STAGES: { stage: PipelineStage; color: string }[] = [
  { stage: "New Inquiry", color: "bg-slate-400" },
  { stage: "Contacted", color: "bg-blue-500" },
  { stage: "Site Visit Scheduled", color: "bg-indigo-500" },
  { stage: "Negotiation", color: "bg-amber-500" },
  { stage: "Closed Won", color: "bg-emerald-500" },
  { stage: "Closed Lost", color: "bg-rose-400" },
];

export default function LeadsPage() {
  const { user, isAgent, isAdmin, assignedLocalities } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState<boolean>(false);
  const [territoryOnly, setTerritoryOnly] = useState<boolean>(true);

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
  }, [user]);

  // Real-time Socket.io events
  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const handleLeadCreated = (newLead: Lead) => {
      setLeads((prev) => {
        if (prev.some((l) => l._id === newLead._id)) return prev;
        return [newLead, ...prev];
      });
    };

    const handleLeadStageUpdated = (payload: any) => {
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

  // Filter leads by search, priority tag & agent territory
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.preferredLocalities.some((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lead.rawRequirementText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "All" || lead.aiPriorityTag === priorityFilter;

    // Agent Territory Filter: When logged in as Agent in territory mode, only show leads matching assigned localities
    const matchesTerritory =
      !isAgent ||
      !territoryOnly ||
      assignedLocalities.length === 0 ||
      lead.preferredLocalities.some((loc) =>
        assignedLocalities.some((al) => al.toLowerCase() === loc.toLowerCase())
      );

    return matchesSearch && matchesPriority && matchesTerritory;
  });

  const territoryLeadCount = leads.filter((lead) =>
    lead.preferredLocalities.some((loc) =>
      assignedLocalities.some((al) => al.toLowerCase() === loc.toLowerCase())
    )
  ).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
      <Header
        title="Lead Pipeline"
        subtitle="Live Deal Flow with Autonomous AI Conversion Scoring"
      />

      {/* Top Filter and Action Toolbar */}
      <div className="px-6 py-2.5 bg-white border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter leads by name, phone, locality, or requirement keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all font-mono placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="All">All Tiers</option>
              <option value="Hot">Hot (&gt;70 pts)</option>
              <option value="Warm">Warm (40-69 pts)</option>
              <option value="Cold">Cold (&lt;40 pts)</option>
            </select>
          </div>

          {/* Agent Territory Switcher Pill */}
          {isAgent && assignedLocalities.length > 0 && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50/80 border border-blue-200 text-xs font-mono shrink-0">
              <span className="text-blue-900 font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-600" />
                Territory: {assignedLocalities.join(", ")}
              </span>
              <button
                type="button"
                onClick={() => setTerritoryOnly(!territoryOnly)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  territoryOnly
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                {territoryOnly ? `My Scope (${territoryLeadCount})` : "All Leads"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLeads}
            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Leads"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsNewLeadModalOpen(true)}
            className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors font-mono"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto p-5 kanban-scroll">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full items-start min-w-max pb-4">
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
