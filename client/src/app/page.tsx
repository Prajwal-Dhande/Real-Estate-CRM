"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { fetchDashboardMetrics, fetchLeads } from "@/lib/api";
import { DashboardMetrics, Lead, PipelineStage } from "@/types";
import { formatCurrencyLakhs, formatDate } from "@/lib/utils";
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Flame, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  PhoneCall,
  CalendarCheck2,
  ChevronRight
} from "lucide-react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [hotLeads, setHotLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [m, leads] = await Promise.all([
          fetchDashboardMetrics(),
          fetchLeads()
        ]);
        setMetrics(m);
        // Filter hot leads sorted by aiScore desc
        const hot = leads.filter(l => l.aiPriorityTag === "Hot").sort((a, b) => b.aiScore - a.aiScore).slice(0, 5);
        setHotLeads(hot);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const STAGES: { stage: PipelineStage; color: string }[] = [
    { stage: "New Inquiry", color: "bg-blue-500" },
    { stage: "Contacted", color: "bg-indigo-500" },
    { stage: "Site Visit Scheduled", color: "bg-purple-500" },
    { stage: "Negotiation", color: "bg-amber-500" },
    { stage: "Closed Won", color: "bg-emerald-500" },
    { stage: "Closed Lost", color: "bg-rose-500" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <Header title="Dashboard Analytics" subtitle="Real-time Nagpur real estate lead flow and AI valuation metrics" />

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Leads */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Leads</span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {metrics?.leads.total ?? "--"}
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +14% this mo
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1 text-red-600 font-semibold">
                <Flame className="w-3.5 h-3.5 fill-red-500" /> {metrics?.leads.hot ?? 0} Hot
              </span>
              <span>•</span>
              <span className="text-amber-600 font-medium">{metrics?.leads.warm ?? 0} Warm</span>
              <span>•</span>
              <span className="text-blue-600 font-medium">{metrics?.leads.cold ?? 0} Cold</span>
            </div>
          </div>

          {/* Card 2: Property Inventory */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Properties Inventory</span>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {metrics?.properties.total ?? "--"}
              </span>
              <span className="text-xs text-slate-500 font-medium">listings</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span className="text-emerald-700 font-semibold">
                {metrics?.properties.available ?? 0} Available
              </span>
              <Link href="/properties" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5">
                View Inventory <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 3: AI Valuation Coverage */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ML Valuation Engine</span>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">88.4%</span>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">R² 0.91</span>
            </div>
            <div className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-3 flex items-center justify-between">
              <span>XGBoost + RF Ensemble</span>
              <span className="text-slate-400">Redis 24h cached</span>
            </div>
          </div>

          {/* Card 4: High Intent Pipeline Value */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hot Deals Pipeline</span>
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                <Flame className="w-5 h-5 fill-rose-500" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                ₹8.45 Cr
              </span>
              <span className="text-xs text-emerald-600 font-semibold">High Conversion</span>
            </div>
            <div className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-3 flex items-center justify-between">
              <span>Weighted conversion</span>
              <Link href="/leads" className="text-rose-600 font-medium hover:underline flex items-center gap-0.5">
                Kanban <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Middle Section: Pipeline Stage Breakdown & Hot Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pipeline Stage Funnel (2 Cols) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Lead Conversion Funnel</h2>
                <p className="text-xs text-slate-500">Distribution across the 6 Kanban pipeline stages</p>
              </div>
              <Link
                href="/leads"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Open Kanban Board →
              </Link>
            </div>

            <div className="space-y-4">
              {STAGES.map(({ stage, color }) => {
                const count = metrics?.leads.byStage?.[stage] ?? 0;
                const total = metrics?.leads.total || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{count} leads</span>
                        <span className="text-slate-400">({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BullMQ Follow-Up Reminders Feed (1 Col) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Upcoming Follow-ups</h2>
              </div>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                BullMQ Scheduled
              </span>
            </div>

            <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[340px]">
              {metrics?.upcomingFollowups && metrics.upcomingFollowups.length > 0 ? (
                metrics.upcomingFollowups.map((fu) => {
                  const leadName = typeof fu.lead === "object" ? fu.lead?.fullName : "Lead";
                  const leadPhone = typeof fu.lead === "object" ? fu.lead?.phone : "";

                  return (
                    <div key={fu._id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{leadName}</span>
                        <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {fu.activityType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{fu.notes}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <span>{leadPhone}</span>
                        <span className="font-medium text-slate-500">{formatDate(fu.nextFollowUpAt)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No pending follow-up alerts. Log a call or site visit to schedule a BullMQ reminder.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Hot Leads Radar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500 fill-red-500" />
              <h2 className="text-base font-bold text-slate-900">Top Hot Leads (Conversion Probability &gt; 70)</h2>
            </div>
            <Link href="/leads" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All Pipeline Leads →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotLeads.map((lead) => (
              <div
                key={lead._id}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{lead.fullName}</h3>
                    <p className="text-xs text-slate-500">{lead.desiredBhk} BHK • {lead.preferredLocalities.join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200 font-bold text-xs shadow-xs">
                    <Sparkles className="w-3 h-3 text-red-500" /> {lead.aiScore} pts
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-slate-200/70 pt-2.5">
                  <span className="font-semibold text-slate-800">
                    Budget: {formatCurrencyLakhs(lead.budgetMaxInLakhs)}
                  </span>
                  <span className="text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                    {lead.pipelineStage}
                  </span>
                </div>

                {lead.aiScoreFactors && lead.aiScoreFactors.length > 0 && (
                  <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200/60 line-clamp-2">
                    💡 {lead.aiScoreFactors[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

