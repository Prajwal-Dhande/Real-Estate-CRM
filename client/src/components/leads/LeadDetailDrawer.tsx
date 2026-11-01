"use client";

import React, { useState, useEffect } from "react";
import { Lead, Activity, PipelineStage } from "@/types";
import { formatCurrencyLakhs, formatDate } from "@/lib/utils";
import { fetchActivitiesByLead, createActivity, updateLeadStage } from "@/lib/api";
import { 
  X, 
  Sparkles, 
  Building2, 
  Clock, 
  PhoneCall, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Send,
  Flame,
  CheckCircle,
  AlertCircle,
  BedDouble,
  MapPin,
  TrendingUp,
  Percent
} from "lucide-react";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: (updatedLead: Lead) => void;
}

export function LeadDetailDrawer({ lead, onClose, onLeadUpdated }: LeadDetailDrawerProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  
  // New Activity form state
  const [activityType, setActivityType] = useState<string>("Call");
  const [notes, setNotes] = useState<string>("");
  const [clientSentiment, setClientSentiment] = useState<string>("Positive");
  const [callDuration, setCallDuration] = useState<number>(120);
  const [nextFollowUpAt, setNextFollowUpAt] = useState<string>("");
  const [submittingActivity, setSubmittingActivity] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"ai" | "properties" | "activities">("ai");

  const STAGES: PipelineStage[] = [
    "New Inquiry",
    "Contacted",
    "Site Visit Scheduled",
    "Negotiation",
    "Closed Won",
    "Closed Lost"
  ];

  useEffect(() => {
    if (!lead) return;
    async function loadActivities() {
      setLoadingActivities(true);
      try {
        const data = await fetchActivitiesByLead(lead!._id);
        setActivities(data);
      } catch (err) {
        console.error("Error loading activities:", err);
      } finally {
        setLoadingActivities(false);
      }
    }
    loadActivities();
  }, [lead]);

  if (!lead) return null;

  const handleStageChange = async (newStage: PipelineStage) => {
    try {
      const updated = await updateLeadStage(lead._id, newStage, `Stage updated via Lead Detail drawer`);
      onLeadUpdated(updated);
    } catch (err) {
      console.error("Failed to update stage:", err);
    }
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setSubmittingActivity(true);
    try {
      const newAct = await createActivity({
        leadId: lead._id,
        activityType,
        notes,
        callDurationSeconds: activityType === "Call" ? callDuration : 0,
        clientSentiment,
        nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt).toISOString() : undefined
      });

      setActivities((prev) => [newAct, ...prev]);
      setNotes("");
      setNextFollowUpAt("");

      // Update lead with bumped score/recency if returned
      onLeadUpdated({
        ...lead,
        lastContactedAt: new Date().toISOString(),
        aiScore: Math.min(100, lead.aiScore + 2)
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    } finally {
      setSubmittingActivity(false);
    }
  };

  const priorityColors = {
    Hot: "bg-red-500 text-white",
    Warm: "bg-amber-500 text-white",
    Cold: "bg-blue-500 text-white"
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-6 bg-slate-900 text-white shrink-0 flex items-start justify-between border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">{lead.fullName}</h2>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${priorityColors[lead.aiPriorityTag]}`}>
                {lead.aiPriorityTag} Priority
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {lead.phone} {lead.email ? `• ${lead.email}` : ""} • Source: {lead.source}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Selector Bar */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Pipeline Stage:</span>
          <select
            value={lead.pipelineStage}
            onChange={(e) => handleStageChange(e.target.value as PipelineStage)}
            className="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab("ai")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "ai"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Lead Score ({lead.aiScore} pts)
          </button>
          <button
            onClick={() => setActiveTab("properties")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "properties"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Matched Properties ({lead.recommendedProperties?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "activities"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Activity & Reminders
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: AI Score Breakdown */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Score Card Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Conversion Likelihood</span>
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-xs font-bold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" /> Scored by FastAPI
                  </div>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold tracking-tight text-white">{lead.aiScore}</span>
                  <span className="text-slate-400 text-sm">/ 100 points</span>
                  <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${priorityColors[lead.aiPriorityTag]}`}>
                    {lead.aiPriorityTag} Lead
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      lead.aiScore >= 70 ? "bg-red-500" : lead.aiScore >= 40 ? "bg-amber-400" : "bg-blue-400"
                    }`}
                    style={{ width: `${lead.aiScore}%` }}
                  />
                </div>
              </div>

              {/* Requirement Text */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Raw Requirement</span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">{lead.rawRequirementText}</p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="bg-white border px-2 py-0.5 rounded font-semibold">
                    Budget: {formatCurrencyLakhs(lead.budgetMinInLakhs)} - {formatCurrencyLakhs(lead.budgetMaxInLakhs)}
                  </span>
                  <span className="bg-white border px-2 py-0.5 rounded font-semibold">
                    {lead.desiredBhk} BHK
                  </span>
                  <span className="bg-white border px-2 py-0.5 rounded font-semibold">
                    {lead.preferredLocalities.join(", ")}
                  </span>
                </div>
              </div>

              {/* AI Score Factors Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Score Factors & Weights
                </h4>

                <div className="space-y-2">
                  {lead.aiScoreFactors && lead.aiScoreFactors.length > 0 ? (
                    lead.aiScoreFactors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs text-slate-700"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="font-medium">{factor}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No score factors available yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Matched Properties */}
          {activeTab === "properties" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Semantic + Budget Proximity Matches
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                  MiniLM 384-dim
                </span>
              </div>

              {lead.recommendedProperties && lead.recommendedProperties.length > 0 ? (
                lead.recommendedProperties.map((item, i) => {
                  const prop = item.property;
                  if (!prop) return null;

                  return (
                    <div
                      key={prop._id || i}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{prop.title}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {prop.locality}
                          </p>
                        </div>

                        {/* Match Percentage Pill */}
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <Percent className="w-3 h-3" />
                            {item.matchScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* Match Score Bar */}
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${item.matchScore}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-600 font-medium">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatCurrencyLakhs(prop.listedPriceInLakhs)}
                        </span>
                        <div className="flex items-center gap-3 text-slate-500">
                          <span>{prop.bhk} BHK</span>
                          <span>•</span>
                          <span>{prop.carpetAreaSqFt} sq ft</span>
                          <span>•</span>
                          <span className="text-indigo-600 font-semibold">{prop.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-dashed rounded-xl text-xs text-slate-400">
                  No properties matched yet. Add inventory in {lead.preferredLocalities.join(", ") || "Nagpur"} to generate semantic recommendations.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Activity Timeline & Form */}
          {activeTab === "activities" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Form to Log New Activity */}
              <form onSubmit={handleActivitySubmit} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Log New Interaction
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Type</label>
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white"
                    >
                      <option value="Call">Phone Call</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Site Visit">Site Visit</option>
                      <option value="Note">Internal Note</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sentiment</label>
                    <select
                      value={clientSentiment}
                      onChange={(e) => setClientSentiment(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white"
                    >
                      <option value="Positive">Positive 😊</option>
                      <option value="Neutral">Neutral 😐</option>
                      <option value="Negative">Negative 😟</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Notes & Discussion</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Discussed 3BHK pricing, client requested floor plan and site visit..."
                    rows={2}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>

                {/* Follow-up reminder */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center justify-between">
                    <span>Schedule Follow-up (BullMQ Delayed Job)</span>
                    <span className="text-indigo-600 text-[10px] font-normal">Triggers socket alert</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={nextFollowUpAt}
                    onChange={(e) => setNextFollowUpAt(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingActivity}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingActivity ? "Logging..." : "Log Activity & Recalculate AI Score"}
                </button>
              </form>

              {/* Activity Timeline List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Interaction History ({activities.length})
                </span>

                <div className="space-y-2.5">
                  {loadingActivities ? (
                    <div className="text-xs text-slate-400 text-center py-4">Loading activity timeline...</div>
                  ) : activities.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl">
                      No interactions recorded yet. Log the first call or visit above.
                    </div>
                  ) : (
                    activities.map((act) => (
                      <div
                        key={act._id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{act.activityType}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                              act.clientSentiment === "Positive"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : act.clientSentiment === "Negative"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {act.clientSentiment}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {formatDate(act.createdAt)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-normal">{act.notes}</p>

                        {act.nextFollowUpAt && (
                          <div className="pt-1 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Next Follow-up: {formatDate(act.nextFollowUpAt)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

