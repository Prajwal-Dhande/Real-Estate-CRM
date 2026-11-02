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
import { WhatsAppSimulatorModal } from "@/components/leads/WhatsAppSimulatorModal";
import { Lead, PipelineStage } from "@/types";
import { fetchLeads, updateLeadStage } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { Plus, Search, Filter, RefreshCw, SlidersHorizontal, MapPin, UserCheck, ShieldCheck, MessageSquare } from "lucide-react";

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
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
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
      const seen = new Set<string>();
      const uniqueLeads = data.filter((l: Lead) => {
        if (!l._id || seen.has(l._id)) return false;
        seen.add(l._id);
        return true;
      });
      setLeads(uniqueLeads);
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
      <div className="px-6 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads, phone, locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>

          {/* Segmented Priority Filter Pills */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/60 text-xs font-medium">
            {["All", "Hot", "Warm", "Cold"].map((tier) => (
              <button
                key={tier}
                onClick={() => setPriorityFilter(tier)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  priorityFilter === tier
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tier === "All" ? "All Deals" : tier}
              </button>
            ))}
          </div>

          {/* Agent Territory Switcher Pill */}
          {isAgent && assignedLocalities.length > 0 && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-50/80 border border-indigo-200/70 text-xs shrink-0">
              <span className="text-indigo-900 font-semibold flex items-center gap-1 text-[11px]">
                <MapPin className="w-3 h-3 text-indigo-600" />
                {assignedLocalities.slice(0, 2).join(", ")}
              </span>
              <button
                type="button"
                onClick={() => setTerritoryOnly(!territoryOnly)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  territoryOnly
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }`}
              >
                {territoryOnly ? `My Localities (${territoryLeadCount})` : "All"}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadLeads}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
            title="Refresh Leads"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* WhatsApp Cloud API Ingestion Simulator Button */}
          <button
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all active:scale-95"
            title="Simulate incoming WhatsApp message webhook"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
            <span>WhatsApp Ingestion</span>
          </button>

          <button
            onClick={() => setIsNewLeadModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Lead</span>
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
          setLeads((prev) => {
            if (prev.some((l) => l._id === newLead._id)) return prev;
            return [newLead, ...prev];
          });
        }}
      />

      {/* WhatsApp Cloud API Ingestion Simulator Modal */}
      <WhatsAppSimulatorModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onLeadIngested={(newLead) => {
          setLeads((prev) => {
            if (prev.some((l) => l._id === newLead._id)) return prev;
            return [newLead, ...prev];
          });
        }}
      />
    </div>
  );
}
