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
import { fetchLeads, updateLeadStage, updateLeadFollowup } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  SlidersHorizontal, 
  MapPin, 
  UserCheck, 
  ShieldCheck, 
  MessageSquare,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Monitor
} from "lucide-react";

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
  const [slaFilter, setSlaFilter] = useState<"All" | "Overdue" | "DueSoon">("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState<boolean>(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [territoryOnly, setTerritoryOnly] = useState<boolean>(true);
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

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

  // Deep-link integration from Global Command Palette (Priority 5)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const targetLeadId = params.get("leadId");
    const targetAction = params.get("action");
    const targetFilter = params.get("filter");

    if (targetLeadId && leads.length > 0) {
      const found = leads.find((l) => l._id === targetLeadId);
      if (found) setSelectedLead(found);
    }
    if (targetAction === "new-lead") {
      setIsNewLeadModalOpen(true);
    } else if (targetAction === "simulate-whatsapp") {
      setIsWhatsAppModalOpen(true);
    }
    if (targetFilter === "overdue") {
      setSlaFilter("Overdue");
    }
    const targetSource = params.get("source");
    if (targetSource) {
      setSourceFilter(targetSource);
    }
  }, [leads]);

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
              pipelineStage: payload.pipelineStage || l.pipelineStage,
              nextFollowUpAt: payload.nextFollowUpAt !== undefined ? payload.nextFollowUpAt : l.nextFollowUpAt,
              lastContactedAt: payload.lastContactedAt || l.lastContactedAt,
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
            pipelineStage: payload.pipelineStage || prev.pipelineStage,
            nextFollowUpAt: payload.nextFollowUpAt !== undefined ? payload.nextFollowUpAt : prev.nextFollowUpAt,
            lastContactedAt: payload.lastContactedAt || prev.lastContactedAt,
            aiScore: payload.aiScore !== undefined ? payload.aiScore : prev.aiScore,
            aiPriorityTag: payload.aiPriorityTag || prev.aiPriorityTag,
            aiScoreFactors: payload.aiScoreFactors || prev.aiScoreFactors
          };
        }
        return prev;
      });
    };

    const handleFollowupDue = (reminder: any) => {
      console.log("[Socket] Follow-up reminder received:", reminder);
      loadLeads();
    };

    s.on("lead:created", handleLeadCreated);
    s.on("lead:stage_updated", handleLeadStageUpdated);
    s.on("followup:due", handleFollowupDue);

    return () => {
      s.off("lead:created", handleLeadCreated);
      s.off("lead:stage_updated", handleLeadStageUpdated);
      s.off("followup:due", handleFollowupDue);
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

  // 1-Click Quick Action Handler for Follow-up SLA (Priority 4)
  const handleFollowupUpdate = async (
    leadId: string, 
    nextFollowUpAt?: string, 
    reason?: string, 
    markCompleted: boolean = false
  ) => {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => {
        if (l._id === leadId) {
          return {
            ...l,
            nextFollowUpAt: markCompleted ? undefined : nextFollowUpAt,
            lastContactedAt: markCompleted ? new Date().toISOString() : l.lastContactedAt
          };
        }
        return l;
      })
    );

    try {
      await updateLeadFollowup(leadId, nextFollowUpAt, reason, markCompleted);
    } catch (err) {
      console.error("Failed to update follow-up SLA:", err);
      loadLeads();
    }
  };

  const handleStageAdvance = async (leadId: string, nextStage: PipelineStage) => {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l._id === leadId ? { ...l, pipelineStage: nextStage } : l))
    );
    try {
      await updateLeadStage(leadId, nextStage, "Advanced via Mobile Touch 1-Tap Action");
    } catch (err: any) {
      console.error("Failed to advance stage:", err);
      loadLeads();
    }
  };

  // Calculate Overdue & Due Soon counts
  const now = Date.now();
  const totalOverdueCount = leads.filter((l) => {
    if (l.pipelineStage === "Closed Won" || l.pipelineStage === "Closed Lost") return false;
    if (l.nextFollowUpAt) return new Date(l.nextFollowUpAt).getTime() < now;
    if (l.pipelineStage === "New Inquiry" && l.createdAt) {
      return new Date(l.createdAt).getTime() + 15 * 60 * 1000 < now;
    }
    return false;
  }).length;

  // Filter leads by search, priority tag, SLA status & agent territory
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.preferredLocalities.some((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lead.rawRequirementText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "All" || lead.aiPriorityTag === priorityFilter;

    // Acquisition Source / Channel Filter (Priority 6)
    const matchesSource =
      sourceFilter === "All" ||
      (sourceFilter === "Portals"
        ? (lead.source === "99acres" || lead.source === "MagicBricks" || lead.source === "Housing.com" || lead.source === "PropertyPortal")
        : lead.source === sourceFilter);

    // SLA Overdue / Due Soon filter
    let matchesSla = true;
    if (slaFilter === "Overdue") {
      const isClosed = lead.pipelineStage === "Closed Won" || lead.pipelineStage === "Closed Lost";
      if (isClosed) {
        matchesSla = false;
      } else if (lead.nextFollowUpAt) {
        matchesSla = new Date(lead.nextFollowUpAt).getTime() < now;
      } else if (lead.pipelineStage === "New Inquiry" && lead.createdAt) {
        matchesSla = new Date(lead.createdAt).getTime() + 15 * 60 * 1000 < now;
      } else {
        matchesSla = false;
      }
    } else if (slaFilter === "DueSoon") {
      const isClosed = lead.pipelineStage === "Closed Won" || lead.pipelineStage === "Closed Lost";
      if (isClosed) {
        matchesSla = false;
      } else if (lead.nextFollowUpAt) {
        const diff = new Date(lead.nextFollowUpAt).getTime() - now;
        matchesSla = diff >= 0 && diff <= 2 * 3600000;
      } else {
        matchesSla = false;
      }
    }

    // Agent Territory Filter: When logged in as Agent in territory mode, only show leads matching assigned localities
    const matchesTerritory =
      !isAgent ||
      !territoryOnly ||
      assignedLocalities.length === 0 ||
      lead.preferredLocalities.some((loc) =>
        assignedLocalities.some((al) => al.toLowerCase() === loc.toLowerCase())
      );

    return matchesSearch && matchesPriority && matchesSla && matchesTerritory && matchesSource;
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
        subtitle="Live Deal Flow • SLA Follow-up Telemetry & Autonomous AI Scoring"
      />

      {/* Top Filter and Action Toolbar */}
      <div className="px-6 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Bar */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/90 border border-slate-200/80 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 text-slate-800 font-mono shadow-2xs"
            />
          </div>

          {/* Segmented Priority Filter Pills */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100/90 border border-slate-200/70 text-xs font-mono shadow-2xs">
            {["All", "Hot", "Warm", "Cold"].map((tier) => (
              <button
                key={tier}
                onClick={() => setPriorityFilter(tier)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  priorityFilter === tier
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tier === "All" ? "All Deals" : tier}
              </button>
            ))}
          </div>

          {/* SLA Overdue Quick-Filter (Priority 4) */}
          <button
            type="button"
            onClick={() => setSlaFilter(slaFilter === "Overdue" ? "All" : "Overdue")}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold font-mono flex items-center gap-1.5 transition-all shadow-2xs ${
              slaFilter === "Overdue"
                ? "bg-rose-600 text-white shadow-xs"
                : totalOverdueCount > 0
                ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
            }`}
            title="Filter to overdue callbacks"
          >
            {totalOverdueCount > 0 ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            ) : (
              <Clock className="w-3 h-3 text-slate-400" />
            )}
            <span>{totalOverdueCount} Overdue</span>
          </button>

          {/* Channel Dropdown / Filter Pill */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono">
            {[
              { id: "All", label: "All Sources" },
              { id: "WhatsApp", label: "WhatsApp" },
              { id: "Meta Ads", label: "Meta" },
              { id: "Google Ads", label: "Google" },
              { id: "Portals", label: "Portals" },
              { id: "Referral", label: "Referral" }
            ].map((ch) => {
              const count = leads.filter((l) => {
                if (ch.id === "All") return true;
                if (ch.id === "Portals") return ["99acres", "MagicBricks", "Housing.com", "PropertyPortal"].includes(l.source);
                return l.source === ch.id;
              }).length;

              if (ch.id !== "All" && count === 0) return null; // Don't clutter with zero-count channels

              return (
                <button
                  key={ch.id}
                  onClick={() => setSourceFilter(ch.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all shrink-0 flex items-center gap-1.5 shadow-2xs ${
                    sourceFilter === ch.id
                      ? "bg-indigo-600 text-white font-bold"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  <span>{ch.label}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    sourceFilter === ch.id ? "bg-indigo-700 text-indigo-100" : "bg-slate-100 text-slate-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Agent Territory Switcher */}
          {isAgent && assignedLocalities.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50/80 border border-blue-200 text-xs shrink-0 font-mono shadow-2xs">
              <MapPin className="w-3 h-3 text-blue-600" />
              <button
                type="button"
                onClick={() => setTerritoryOnly(!territoryOnly)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  territoryOnly
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                {territoryOnly ? `My Scope (${territoryLeadCount})` : "All Nagpur"}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadLeads}
            className="p-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs bg-white"
            title="Refresh Leads"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* WhatsApp Cloud API Ingestion Simulator */}
          <button
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95 font-mono"
            title="Simulate incoming WhatsApp message webhook"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
            <span>WhatsApp Ingestion</span>
          </button>

          <button
            onClick={() => setIsNewLeadModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95 font-mono"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Mobile Stage Selector Pill Tabs (Touch Scrollable) */}
      <div className="md:hidden px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto kanban-scroll shrink-0 font-mono text-xs">
        {STAGES.map(({ stage, color }, idx) => {
          const count = filteredLeads.filter((l) => l.pipelineStage === stage).length;
          const isSelected = selectedStageIdx === idx;

          return (
            <button
              key={stage}
              onClick={() => setSelectedStageIdx(idx)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                isSelected
                  ? "bg-slate-900 dark:bg-indigo-600 text-white font-bold shadow-xs scale-102"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="truncate">{stage}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Stage Stepper & Quick Navigator */}
      <div className="md:hidden px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300 shrink-0">
        <button
          onClick={() => setSelectedStageIdx((prev) => Math.max(0, prev - 1))}
          disabled={selectedStageIdx === 0}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-0.5 font-bold cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        <div className="text-center">
          <span className="font-bold text-slate-900 dark:text-white">{STAGES[selectedStageIdx].stage}</span>
          <span className="text-[10px] text-slate-400 block">
            Stage {selectedStageIdx + 1} of {STAGES.length} • {filteredLeads.filter((l) => l.pipelineStage === STAGES[selectedStageIdx].stage).length} Deals
          </span>
        </div>

        <button
          onClick={() => setSelectedStageIdx((prev) => Math.min(STAGES.length - 1, prev + 1))}
          disabled={selectedStageIdx === STAGES.length - 1}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-0.5 font-bold cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Single-Column Touch Focus View */}
      <div className="md:hidden flex-1 overflow-y-auto p-4 animate-fade-in-up">
        {(() => {
          const currentStage = STAGES[selectedStageIdx];
          const stageLeads = filteredLeads.filter((l) => l.pipelineStage === currentStage.stage);
          return (
            <KanbanColumn
              key={currentStage.stage}
              stage={currentStage.stage}
              leads={stageLeads}
              color={currentStage.color}
              onLeadClick={(lead) => setSelectedLead(lead)}
              onFollowupUpdate={handleFollowupUpdate}
              isFullWidth={true}
              onStageAdvance={handleStageAdvance}
            />
          );
        })()}
      </div>

      {/* Desktop Multi-Column Kanban Board Container */}
      <div className="hidden md:flex flex-1 overflow-x-auto p-5 kanban-scroll animate-fade-in-up">
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
                  onFollowupUpdate={handleFollowupUpdate}
                  onStageAdvance={handleStageAdvance}
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
