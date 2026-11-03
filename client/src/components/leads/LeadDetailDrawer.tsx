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
  Send,
  CheckCircle,
  BedDouble,
  MapPin,
  TrendingUp,
  Percent,
  Copy,
  Check,
  ExternalLink,
  Bot,
  Megaphone,
  Globe,
  UserCheck,
  Target
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
  const [activeTab, setActiveTab] = useState<"ai" | "properties" | "activities" | "whatsapp">("ai");
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);

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

  // Generate personalized WhatsApp Pitch
  const topProperty = lead.recommendedProperties?.[0]?.property;
  const whatsappPitch = `Namaste ${lead.fullName}, I am Rahul from EstateIQ Nagpur. Based on your requirement for a ${lead.desiredBhk} BHK property in ${lead.preferredLocalities?.join(", ") || "Nagpur"} within ₹${lead.budgetMaxInLakhs} Lakhs, our AI matcher identified an exclusive option for you:${topProperty ? `\n\n📍 ${topProperty.title} (${topProperty.locality})\n💰 Listed at: ₹${topProperty.listedPriceInLakhs}L (${topProperty.carpetAreaSqFt} sq.ft)` : ""}\n\nWould you like me to share the verified floor plan and schedule a site visit this week?`;

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(whatsappPitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white h-full shadow-xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 bg-[#0F172A] text-white shrink-0 flex items-start justify-between border-b border-slate-800">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-white truncate">{lead.fullName}</h2>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                lead.aiPriorityTag === "Hot"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : lead.aiPriorityTag === "Warm"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-slate-700 text-slate-300"
              }`}>
                {lead.aiPriorityTag} • {lead.aiScore} pts
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {lead.phone} {lead.email ? `• ${lead.email}` : ""} • {lead.source}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stage Selector Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/90 flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-slate-500">Pipeline Stage</span>
          <select
            value={lead.pipelineStage}
            onChange={(e) => handleStageChange(e.target.value as PipelineStage)}
            className="text-xs font-mono font-semibold text-slate-900 bg-white border border-slate-200 rounded-md px-2.5 py-1 focus:ring-1 focus:ring-slate-900 focus:outline-hidden cursor-pointer"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* SLA Status Bar (Priority 4) */}
        {lead.pipelineStage !== "Closed Won" && lead.pipelineStage !== "Closed Lost" && (
          <div className="px-5 py-2 bg-slate-100/60 border-b border-slate-200/80 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Follow-up SLA:</span>
              {lead.nextFollowUpAt ? (
                (() => {
                  const diff = new Date(lead.nextFollowUpAt).getTime() - Date.now();
                  const isOverdue = diff < 0;
                  const absDiff = Math.abs(diff);
                  const hrs = Math.floor(absDiff / 3600000);
                  const mins = Math.floor((absDiff % 3600000) / 60000);
                  const str = hrs >= 1 ? `${hrs}h ${mins}m` : `${mins}m`;
                  return (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      isOverdue 
                        ? "bg-rose-50 text-rose-700 border border-rose-200/90" 
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200/90"
                    }`}>
                      {isOverdue ? `⚠️ Overdue by ${str}` : `⏱️ Due in ${str}`}
                    </span>
                  );
                })()
              ) : (
                <span className="text-slate-400 text-[11px]">No follow-up scheduled</span>
              )}
            </div>

            {lead.nextFollowUpAt && new Date(lead.nextFollowUpAt).getTime() < Date.now() && (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Action Required (40% Conversion Impact)
              </span>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-5 text-xs font-mono">
          <button
            onClick={() => setActiveTab("ai")}
            className={`py-2.5 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "ai"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Score
          </button>
          <button
            onClick={() => setActiveTab("properties")}
            className={`py-2.5 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "properties"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Matches ({lead.recommendedProperties?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`py-2.5 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "activities"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Activity ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`py-2.5 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "whatsapp"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-emerald-600 hover:text-emerald-700"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Pitch
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: AI Score Breakdown */}
          {activeTab === "ai" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Score Metric Card */}
              <div className="p-4 rounded-lg bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 uppercase tracking-wider">Conversion Likelihood</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                    FastAPI Engine
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-white">{lead.aiScore}</span>
                  <span className="text-slate-400 text-xs font-mono">/ 100 points</span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      lead.aiScore >= 70 ? "bg-rose-500" : lead.aiScore >= 40 ? "bg-amber-400" : "bg-slate-400"
                    }`}
                    style={{ width: `${lead.aiScore}%` }}
                  />
                </div>
              </div>

              {/* Requirement Summary Box */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/90 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Buyer Requirement
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">"{lead.rawRequirementText}"</p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-slate-600 border-t border-slate-200/60">
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-900">
                    Budget: {formatCurrencyLakhs(lead.budgetMinInLakhs)} - {formatCurrencyLakhs(lead.budgetMaxInLakhs)}
                  </span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {lead.desiredBhk} BHK
                  </span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {lead.preferredLocalities.join(", ")}
                  </span>
                </div>
              </div>

              {/* AI Score Factors Breakdown */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-mono font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-700" />
                  Positive Conversion Factors
                </h4>

                <div className="space-y-1.5">
                  {lead.aiScoreFactors && lead.aiScoreFactors.length > 0 ? (
                    lead.aiScoreFactors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2.5 rounded-md bg-white border border-slate-200/90 text-xs text-slate-700"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{factor}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No score factors calculated yet.</p>
                  )}
                </div>
              </div>

              {/* Lead Source Attribution & Marketing ROI Telemetry (Priority 6) */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    Channel Attribution & Marketing ROI
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                    {lead.source}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Acquisition Cost (CPL)</span>
                    <span className="font-bold text-slate-900">
                      {lead.acquisitionCostInInr ? `₹${lead.acquisitionCostInInr}` : lead.source === 'Referral' ? '₹0 (Referral)' : '₹175 (Est)'}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Est. Brokerage (1.5%)</span>
                    <span className="font-bold text-emerald-600">
                      ₹{((lead.budgetMaxInLakhs * 100000 * 0.015) / 100000).toFixed(2)} Lakhs
                    </span>
                  </div>
                </div>

                {lead.campaignName && (
                  <div className="p-2 bg-white rounded border border-slate-200 text-xs">
                    <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Campaign Name</span>
                    <p className="font-medium text-slate-800 break-words">{lead.campaignName}</p>
                  </div>
                )}

                {(lead.utmSource || lead.utmMedium || lead.utmCampaign) && (
                  <div className="text-[10px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200 flex flex-wrap gap-2">
                    {lead.utmSource && <span>utm_source: <b className="text-slate-800">{lead.utmSource}</b></span>}
                    {lead.utmMedium && <span>utm_medium: <b className="text-slate-800">{lead.utmMedium}</b></span>}
                    {lead.utmCampaign && <span>utm_campaign: <b className="text-slate-800">{lead.utmCampaign}</b></span>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Matched Properties */}
          {activeTab === "properties" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 uppercase tracking-wider">Semantic Matching</span>
                <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded">all-MiniLM-L6-v2</span>
              </div>

              {lead.recommendedProperties && lead.recommendedProperties.length > 0 ? (
                lead.recommendedProperties.map((item, i) => {
                  const prop = item.property;
                  if (!prop) return null;

                  return (
                    <div
                      key={prop._id || i}
                      className="p-3.5 rounded-lg border border-slate-200/90 bg-white hover:border-slate-400 transition-colors space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{prop.title}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" /> {prop.locality}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                          {item.matchScore}% Match
                        </span>
                      </div>

                      {/* Match Score Bar */}
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${item.matchScore}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-600 font-mono">
                        <span className="font-bold text-slate-900">
                          {formatCurrencyLakhs(prop.listedPriceInLakhs)}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{prop.bhk} BHK</span>
                          <span>•</span>
                          <span>{prop.carpetAreaSqFt} sq.ft</span>
                          <span>•</span>
                          <span className="text-slate-700 font-medium">{prop.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center bg-slate-50 border border-dashed rounded-lg text-xs text-slate-400 font-mono">
                  No direct semantic recommendations generated yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Activity Timeline & Form */}
          {activeTab === "activities" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Form to Log New Activity */}
              <form onSubmit={handleActivitySubmit} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-mono font-bold text-slate-800 uppercase tracking-wider block">
                  Log Interaction
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Interaction Type</label>
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-md p-1.5 bg-white"
                    >
                      <option value="Call">Phone Call</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Site Visit">Site Visit</option>
                      <option value="Note">Internal Note</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Client Sentiment</label>
                    <select
                      value={clientSentiment}
                      onChange={(e) => setClientSentiment(e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-md p-1.5 bg-white"
                    >
                      <option value="Positive">Positive</option>
                      <option value="Neutral">Neutral</option>
                      <option value="Negative">Negative</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">Notes & Discussion</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Discussion notes, budget flexibility, visit preferences..."
                    rows={2}
                    className="w-full text-xs border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">
                    Schedule Follow-up (BullMQ Queue)
                  </label>
                  <input
                    type="datetime-local"
                    value={nextFollowUpAt}
                    onChange={(e) => setNextFollowUpAt(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-md p-1.5 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingActivity}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  {submittingActivity ? "Saving..." : "Log Activity"}
                </button>
              </form>

              {/* Activity Timeline List */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                  Timeline ({activities.length})
                </span>

                <div className="space-y-2">
                  {loadingActivities ? (
                    <div className="text-xs text-slate-400 text-center py-4 font-mono">Loading history...</div>
                  ) : activities.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-lg font-mono">
                      No interactions recorded yet.
                    </div>
                  ) : (
                    activities.map((act) => (
                      <div
                        key={act._id}
                        className="p-3 rounded-lg border border-slate-200/90 bg-white space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 font-mono">{act.activityType}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              act.clientSentiment === "Positive"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : act.clientSentiment === "Negative"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {act.clientSentiment}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {formatDate(act.createdAt)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">{act.notes}</p>

                        {act.nextFollowUpAt && (
                          <div className="pt-1 text-[10px] font-mono text-slate-500 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Follow-up: {formatDate(act.nextFollowUpAt)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WhatsApp Pitch Generator */}
          {activeTab === "whatsapp" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-mono font-bold">
                    <Bot className="w-4 h-4 text-emerald-600" />
                    <span>AI Copilot WhatsApp Pitch</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                    1-Click Ready
                  </span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Tailored message composed using buyer requirements and top semantic property match.
                </p>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={8}
                  value={whatsappPitch}
                  className="w-full text-xs font-mono text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-lg leading-relaxed focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPitch}
                  className="flex-1 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-md text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors text-slate-800"
                >
                  {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedPitch ? "Copied to Clipboard!" : "Copy Pitch"}</span>
                </button>

                <a
                  href={`https://wa.me/91${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappPitch)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
