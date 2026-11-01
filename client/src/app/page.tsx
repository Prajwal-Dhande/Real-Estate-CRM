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
  ChevronRight,
  ArrowRight,
  Layers,
  Percent,
  SlidersHorizontal,
  Compass
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
    { stage: "New Inquiry", color: "bg-slate-400" },
    { stage: "Contacted", color: "bg-blue-500" },
    { stage: "Site Visit Scheduled", color: "bg-indigo-500" },
    { stage: "Negotiation", color: "bg-amber-500" },
    { stage: "Closed Won", color: "bg-emerald-500" },
    { stage: "Closed Lost", color: "bg-rose-400" },
  ];

  const LOCALITY_DATA = [
    { name: "Dharampeth", benchmark: "₹7,800/sq.ft", trend: "+8.2%", grade: "Premium Urban" },
    { name: "Vasudev Nagar", benchmark: "₹5,200/sq.ft", trend: "+5.4%", grade: "Metro Corridor" },
    { name: "MIHAN", benchmark: "₹4,500/sq.ft", trend: "+12.1%", grade: "SEZ Growth Hub" },
    { name: "Manish Nagar", benchmark: "₹5,800/sq.ft", trend: "+6.8%", grade: "Residential Core" },
    { name: "Trimurti Nagar", benchmark: "₹5,500/sq.ft", trend: "+4.9%", grade: "Established West" }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
      <Header title="Executive Overview" subtitle="Nagpur Brokerage Telemetry & AI Valuation Analytics" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Leads */}
          <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Active Buyers</span>
              <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {metrics?.leads.total ?? "--"}
              </span>
              <span className="text-[11px] font-mono text-emerald-600 font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +14.2% MoM
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 font-mono">
              <span className="text-rose-600 font-semibold">{metrics?.leads.hot ?? 0} Hot</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-600">{metrics?.leads.warm ?? 0} Warm</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{metrics?.leads.cold ?? 0} Cold</span>
            </div>
          </div>

          {/* Card 2: Property Inventory */}
          <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Live Inventory</span>
              <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {metrics?.properties.total ?? "--"}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Units listed
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 font-mono">
              <span className="text-emerald-600 font-semibold">{metrics?.properties.available ?? 0} Available</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">{Math.max(0, (metrics?.properties.total ?? 0) - (metrics?.properties.available ?? 0))} In Contract</span>
            </div>
          </div>

          {/* Card 3: Pipeline Stages */}
          <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Deal Conversion</span>
              <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {metrics?.leads.byStage?.["Closed Won"] ?? 0}
              </span>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold">Closed Won Deals</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 font-mono">
              <span className="text-indigo-600 font-semibold">{metrics?.leads.byStage?.["Site Visit Scheduled"] ?? 0} Visits</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-600">{metrics?.leads.byStage?.["Negotiation"] ?? 0} In Negotiation</span>
            </div>
          </div>

          {/* Card 4: AI Engine SLA */}
          <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">AI Telemetry</span>
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                99.8%
              </span>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                SLA Uptime
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 font-mono">
              <span>Port 8001</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700 font-medium">384-dim MiniLM-L6</span>
            </div>
          </div>
        </div>

        {/* Pipeline Stage Distribution Bar */}
        <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">
                Pipeline Deal Distribution
              </h2>
              <p className="text-xs text-slate-500">Live breakdown across all 6 CRM pipeline milestones</p>
            </div>
            <Link
              href="/leads"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 font-mono"
            >
              Open Kanban <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Progress Segment Bar */}
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {STAGES.map((s) => {
              const count = metrics?.leads.byStage?.[s.stage] ?? 0;
              const total = metrics?.leads.total || 1;
              const pct = (count / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={s.stage}
                  style={{ width: `${pct}%` }}
                  className={`${s.color} transition-all duration-300`}
                  title={`${s.stage}: ${count} deals (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {STAGES.map((s) => {
              const count = metrics?.leads.byStage?.[s.stage] ?? 0;
              return (
                <div key={s.stage} className="flex items-center gap-2 text-xs">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500 truncate">{s.stage}</p>
                    <p className="font-mono font-semibold text-slate-800">{count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual Section: Top AI Conversion Leads & Nagpur Sub-market Benchmarks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Priority AI Leads (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" /> High-Probability Conversion Radar
                </h3>
                <p className="text-xs text-slate-500">Top buyer leads scored by ML conversion propensity</p>
              </div>
              <Link href="/leads" className="text-xs font-mono text-slate-600 hover:text-slate-900 flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 flex-1">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400 font-mono">Loading telemetry...</div>
              ) : hotLeads.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-mono">No hot conversion leads in current pipeline.</div>
              ) : (
                hotLeads.map((lead) => (
                  <div key={lead._id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 truncate">{lead.fullName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold">
                          HOT • {lead.aiScore} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {lead.desiredBhk} BHK • {lead.preferredLocalities?.join(", ") || "Nagpur"} • Budget {formatCurrencyLakhs(lead.budgetMaxInLakhs)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {lead.pipelineStage}
                      </span>
                      <Link
                        href="/leads"
                        className="text-xs font-mono text-slate-700 hover:text-slate-900 font-medium px-2 py-1 rounded border border-slate-200 hover:bg-slate-100"
                      >
                        Engage
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sub-market Benchmark Rates (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-500" /> Sub-Market Benchmarks
                </h3>
                <p className="text-xs text-slate-500">Nagpur real estate price per sq.ft valuations</p>
              </div>
              <Link href="/valuation" className="text-xs font-mono text-slate-600 hover:text-slate-900 flex items-center gap-1">
                Sandbox <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-3 divide-y divide-slate-100">
              {LOCALITY_DATA.map((loc) => (
                <div key={loc.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{loc.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{loc.grade}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-slate-900">{loc.benchmark}</p>
                    <p className="text-[10px] font-mono text-emerald-600 font-medium">{loc.trend} YoY</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
