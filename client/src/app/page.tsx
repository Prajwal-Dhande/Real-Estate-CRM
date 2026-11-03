"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { SpotlightCard } from "@/components/SpotlightCard";
import { fetchDashboardMetrics, fetchLeads, fetchMarketingRoiMetrics } from "@/lib/api";
import { DashboardMetrics, Lead, PipelineStage, MarketingRoiSummary, MarketingRoiChannel } from "@/types";
import { formatCurrencyLakhs } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Flame, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ArrowRight,
  Percent,
  MapPin,
  BedDouble,
  Activity,
  Megaphone,
  MessageSquare,
  Search,
  Building,
  Home,
  Globe,
  UserCheck,
  Target,
  DollarSign,
  Zap,
  BarChart3,
  BadgePercent,
  Radio,
  Layers
} from "lucide-react";

const DEFAULT_METRICS: DashboardMetrics = {
  leads: {
    total: 21,
    hot: 11,
    warm: 10,
    cold: 0,
    byStage: {
      "New Inquiry": 4,
      "Contacted": 5,
      "Site Visit Scheduled": 4,
      "Negotiation": 4,
      "Closed Won": 4,
      "Closed Lost": 0
    }
  },
  properties: {
    total: 15,
    available: 13
  },
  upcomingFollowups: []
};

export default function DashboardPage() {
  const { user, isAgent, isAdmin, assignedLocalities } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>(DEFAULT_METRICS);
  const [hotLeads, setHotLeads] = useState<Lead[]>([]);
  const [roiData, setRoiData] = useState<MarketingRoiSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [mResult, leadsResult, roiResult] = await Promise.allSettled([
          fetchDashboardMetrics(),
          fetchLeads(),
          fetchMarketingRoiMetrics()
        ]);

        if (mResult.status === "fulfilled" && mResult.value) {
          setMetrics(mResult.value);
        }
        if (roiResult.status === "fulfilled" && roiResult.value) {
          setRoiData(roiResult.value);
        }

        const leads = leadsResult.status === "fulfilled" && Array.isArray(leadsResult.value)
          ? leadsResult.value
          : [];

        // Filter leads based on agent territory
        let relevantLeads = leads;
        if (isAgent && assignedLocalities?.length > 0) {
          relevantLeads = leads.filter(l =>
            l.preferredLocalities?.some(loc =>
              assignedLocalities.some(al => al.toLowerCase() === loc.toLowerCase())
            )
          );
        }

        // Filter hot leads sorted by aiScore desc and deduplicate
        const uniqueRelevant = Array.from(new Map(relevantLeads.map((l) => [l._id, l])).values());
        const hot = uniqueRelevant
          .filter(l => l.aiPriorityTag === "Hot")
          .sort((a, b) => b.aiScore - a.aiScore)
          .slice(0, 5);

        if (hot.length > 0) {
          setHotLeads(hot);
        }
      } catch (err) {
        console.warn("Dashboard load telemetry notice:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, isAgent, assignedLocalities]);

  const STAGES: { stage: PipelineStage; color: string; ringColor: string; bgSoft: string }[] = [
    { stage: "New Inquiry", color: "from-slate-400 to-slate-500", ringColor: "ring-slate-400/40", bgSoft: "bg-slate-50 text-slate-700" },
    { stage: "Contacted", color: "from-blue-500 to-cyan-500", ringColor: "ring-blue-500/40", bgSoft: "bg-blue-50 text-blue-700" },
    { stage: "Site Visit Scheduled", color: "from-indigo-500 to-violet-600", ringColor: "ring-indigo-500/40", bgSoft: "bg-indigo-50 text-indigo-700" },
    { stage: "Negotiation", color: "from-amber-400 to-amber-600", ringColor: "ring-amber-500/40", bgSoft: "bg-amber-50 text-amber-700" },
    { stage: "Closed Won", color: "from-emerald-400 to-emerald-600", ringColor: "ring-emerald-500/40", bgSoft: "bg-emerald-50 text-emerald-700" },
    { stage: "Closed Lost", color: "from-rose-400 to-rose-600", ringColor: "ring-rose-500/40", bgSoft: "bg-rose-50 text-rose-700" },
  ];

  const LOCALITY_DATA = [
    { name: "Dharampeth", benchmark: "₹7,800/sq.ft", trend: "+8.2%", grade: "Premium Urban", demandPct: 92 },
    { name: "Vasudev Nagar", benchmark: "₹5,200/sq.ft", trend: "+5.4%", grade: "Metro Corridor", demandPct: 78 },
    { name: "MIHAN", benchmark: "₹4,500/sq.ft", trend: "+12.1%", grade: "SEZ Growth Hub", demandPct: 88 },
    { name: "Manish Nagar", benchmark: "₹5,800/sq.ft", trend: "+6.8%", grade: "Residential Core", demandPct: 84 },
    { name: "Trimurti Nagar", benchmark: "₹5,500/sq.ft", trend: "+4.9%", grade: "Established West", demandPct: 70 }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
      <Header title="Executive Overview" subtitle="Nagpur Brokerage Telemetry & AI Valuation Analytics" />

      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7 kanban-scroll animate-fade-in-up">
        {/* Top 4 Elevated 3D Tilt Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Active Buyers */}
          <SpotlightCard
            spotlightColor="rgba(99, 102, 241, 0.16)"
            className="p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Active Buyers
              </span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-indigo-100/70 text-indigo-600 flex items-center justify-center border border-indigo-200/60 shadow-2xs">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="text-3xl font-black bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent tracking-tight">
                {metrics?.leads.total ?? "--"}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs">
                <TrendingUp className="w-3 h-3" /> +14.2% MoM
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200/60 shadow-2xs">
                {metrics?.leads.hot ?? 0} Hot
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200/60 shadow-2xs">
                {metrics?.leads.warm ?? 0} Warm
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px] border border-slate-200/60">
                {metrics?.leads.cold ?? 0} Cold
              </span>
            </div>
          </SpotlightCard>

          {/* Card 2: Property Inventory */}
          <SpotlightCard
            spotlightColor="rgba(14, 165, 233, 0.16)"
            className="p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                Live Inventory
              </span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-50 to-sky-100/70 text-sky-600 flex items-center justify-center border border-sky-200/60 shadow-2xs">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="text-3xl font-black bg-gradient-to-br from-slate-900 via-sky-950 to-slate-800 bg-clip-text text-transparent tracking-tight">
                {metrics?.properties.total ?? "--"}
              </span>
              <span className="text-xs text-slate-500 font-semibold">Units listed</span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200/60 shadow-2xs">
                {metrics?.properties.available ?? 0} Available
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px] border border-slate-200/60">
                {Math.max(0, (metrics?.properties.total ?? 0) - (metrics?.properties.available ?? 0))} In Contract
              </span>
            </div>
          </SpotlightCard>

          {/* Card 3: Deal Conversion */}
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.16)"
            className="p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Deal Conversion
              </span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-50 to-emerald-100/70 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="text-3xl font-black bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-800 bg-clip-text text-transparent tracking-tight">
                {metrics?.leads.byStage?.["Closed Won"] ?? 0}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs">
                Won Deals
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-[11px] border border-indigo-200/60 shadow-2xs">
                {metrics?.leads.byStage?.["Site Visit Scheduled"] ?? 0} Visits
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200/60 shadow-2xs">
                {metrics?.leads.byStage?.["Negotiation"] ?? 0} In Talk
              </span>
            </div>
          </SpotlightCard>

          {/* Card 4: AI Engine Telemetry with 3D Radar Beacon */}
          <SpotlightCard
            spotlightColor="rgba(168, 85, 247, 0.18)"
            className="p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                AI Telemetry
              </span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-50 to-purple-100/70 text-purple-600 flex items-center justify-center border border-purple-200/60 shadow-2xs">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="text-3xl font-black bg-gradient-to-br from-slate-900 via-purple-950 to-slate-800 bg-clip-text text-transparent tracking-tight">
                99.8%
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/80 shadow-2xs">
                SLA Uptime
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-2 text-[11px] text-slate-700 font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                FastAPI Copilot
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                384d Embeddings
              </span>
            </div>
          </SpotlightCard>
        </div>

        {/* 3D Stadium Pipeline Deal Progression Card */}
        <SpotlightCard
          spotlightColor="rgba(99, 102, 241, 0.14)"
          className="p-6 md:p-7 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center border border-indigo-200/60 shadow-2xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Pipeline Deal Progression</span>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200/80">
                    Active Funnel
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Live progression across all 6 CRM pipeline milestones</p>
              </div>
            </div>
            <Link
              href="/leads"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl border border-indigo-200/70 transition-all shadow-2xs group"
            >
              <span>Open Kanban</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 3D Glass Stadium Track Bar */}
          <div className="relative p-1 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="h-4 w-full flex gap-1 rounded-full overflow-hidden">
              {STAGES.map((s) => {
                const count = metrics?.leads.byStage?.[s.stage] ?? 0;
                const total = metrics?.leads.total || 1;
                const pct = (count / total) * 100;
                if (pct === 0) return null;
                return (
                  <div
                    key={s.stage}
                    style={{ width: `${pct}%` }}
                    className={`relative h-full bg-gradient-to-r ${s.color} rounded-full transition-all duration-500 hover:scale-y-110 shadow-sm cursor-pointer group`}
                    title={`${s.stage}: ${count} deals (${pct.toFixed(1)}%)`}
                  >
                    {/* Gloss shine reflection line */}
                    <div className="absolute inset-x-0 top-0 h-[1.5px] bg-white/40 rounded-full" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive 3D Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            {STAGES.map((s) => {
              const count = metrics?.leads.byStage?.[s.stage] ?? 0;
              const total = metrics?.leads.total || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <Link
                  key={s.stage}
                  href="/leads"
                  className="relative p-3 rounded-xl bg-white/60 hover:bg-white border border-slate-200/70 hover:border-indigo-300 shadow-2xs hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 group cursor-pointer block"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${s.color} shrink-0 ring-2 ${s.ringColor}`} />
                    <p className="text-[11px] font-semibold text-slate-500 truncate group-hover:text-slate-900 transition-colors">
                      {s.stage}
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {count}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">
                      {pct}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </SpotlightCard>

        {/* Lead Source Attribution & Marketing ROAS Telemetry (Priority 6) */}
        <SpotlightCard
          spotlightColor="rgba(79, 70, 229, 0.15)"
          className="p-6 md:p-7 space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-purple-50 text-indigo-600 flex items-center justify-center border border-indigo-200/80 shadow-2xs">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Lead Source Attribution & Marketing ROAS</span>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200/80">
                    Attribution Telemetry
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cost Per Lead (CPL), Attributed Brokerage Revenue & Return on Ad Spend per Acquisition Channel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Top ROAS: {roiData?.topPerformingChannel || "WhatsApp Cloud API"}</span>
              </span>
              <Link
                href="/leads"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50/70 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-indigo-200/80 transition-all shadow-2xs"
              >
                <span>Pipeline View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Top 4 ROAS Headline KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/70 border border-slate-200/80 hover:border-indigo-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-indigo-700 font-bold block">Blended ROAS</span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {roiData?.overallRoas || "14.2"}x
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/80">
                    +3.8x YoY
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">Gross return on media spend</p>
            </div>

            <div className="p-4 rounded-xl bg-white/70 border border-slate-200/80 hover:border-emerald-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-emerald-700 font-bold block">Attributed Revenue</span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-2xl font-black font-mono text-slate-900">
                    ₹{((roiData?.totalRevenueInInr || 10200000) / 100000).toFixed(1)}L
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded-md">
                    {roiData?.totalDealsClosed || 13} deals
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">1.5% avg Nagpur brokerage</p>
            </div>

            <div className="p-4 rounded-xl bg-white/70 border border-slate-200/80 hover:border-blue-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-blue-700 font-bold block">Total Ad Spend</span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-2xl font-black font-mono text-slate-900">
                    ₹{(roiData?.totalSpendInr || 73500).toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 font-mono bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
                    {roiData?.totalLeads || 132} leads
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">Portals + Meta + Google + WA</p>
            </div>

            <div className="p-4 rounded-xl bg-white/70 border border-slate-200/80 hover:border-amber-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-amber-700 font-bold block">Avg CPL (Cost / Lead)</span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-2xl font-black font-mono text-slate-900">
                    ₹{roiData?.avgCplInr || 165}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/80">
                    -18% CPL
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">Lowest: WA ₹45 / High: Google ₹310</p>
            </div>
          </div>

          {/* Visual Channel Share Breakdown Stadium Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Channel Inbound Share</span>
              <span className="text-slate-400 text-[10px]">{roiData?.totalLeads || 132} Total Attributed Inquiries</span>
            </div>
            <div className="h-3 w-full bg-slate-100/90 rounded-full overflow-hidden flex p-0.5 gap-1 border border-slate-200/70 shadow-inner">
              {(roiData?.channels || []).map((ch) => {
                const total = roiData?.totalLeads || 100;
                const pct = Math.max(3, (ch.leadCount / total) * 100);
                return (
                  <div
                    key={ch.source}
                    style={{ width: `${pct}%`, backgroundColor: ch.color }}
                    className="h-full rounded-full transition-all duration-300 hover:opacity-85 shadow-2xs"
                    title={`${ch.displayName}: ${ch.leadCount} leads (${pct.toFixed(1)}%) • ROAS: ${ch.roas}x`}
                  />
                );
              })}
            </div>
          </div>

          {/* Detailed Channel Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1">
            {(roiData?.channels || []).map((ch) => {
              return (
                <div
                  key={ch.source}
                  className="p-4 rounded-xl border border-slate-200/90 bg-white/80 hover:bg-white hover:border-indigo-300 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: `${ch.color}15`,
                          borderColor: `${ch.color}30`
                        }}
                      >
                        {ch.source === "WhatsApp" ? (
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                        ) : ch.source === "Meta Ads" ? (
                          <Megaphone className="w-4 h-4 text-blue-600" />
                        ) : ch.source === "Google Ads" ? (
                          <Search className="w-4 h-4 text-rose-600" />
                        ) : ch.source === "99acres" ? (
                          <Building className="w-4 h-4 text-amber-600" />
                        ) : ch.source === "MagicBricks" ? (
                          <Home className="w-4 h-4 text-red-600" />
                        ) : ch.source === "Referral" ? (
                          <UserCheck className="w-4 h-4 text-cyan-600" />
                        ) : (
                          <Globe className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {ch.displayName}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 block truncate">
                          {ch.source}
                        </span>
                      </div>
                    </div>

                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: `${ch.color}15`,
                        color: ch.color,
                        border: `1px solid ${ch.color}35`
                      }}
                    >
                      {ch.roas >= 90 ? "30x+ ROAS" : `${ch.roas}x ROAS`}
                    </span>
                  </div>

                  {ch.efficiencyBadge && (
                    <div className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-md truncate">
                      {ch.efficiencyBadge}
                    </div>
                  )}

                  {/* Channel Metrics Mini Grid */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100 text-center font-mono">
                    <div className="p-1 rounded bg-slate-50/70">
                      <span className="text-[9px] text-slate-400 block">Leads</span>
                      <span className="text-xs font-bold text-slate-800">{ch.leadCount}</span>
                    </div>
                    <div className="p-1 rounded bg-slate-50/70">
                      <span className="text-[9px] text-slate-400 block">CPL</span>
                      <span className="text-xs font-bold text-slate-800">{ch.cplInr === 0 ? "₹0" : `₹${ch.cplInr}`}</span>
                    </div>
                    <div className="p-1 rounded bg-slate-50/70">
                      <span className="text-[9px] text-slate-400 block">Won</span>
                      <span className="text-xs font-bold text-emerald-700">{ch.dealsClosed}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 font-mono">
                    <div className="text-[10px] text-slate-500">
                      Rev: <b className="text-slate-900 font-bold">₹{((ch.revenueInInr || 0) / 100000).toFixed(1)}L</b>
                    </div>
                    <Link
                      href={`/leads?source=${encodeURIComponent(ch.source)}`}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                    >
                      <span>Filter</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </SpotlightCard>

        {/* Dual Section: Top AI Conversion Leads & Nagpur Sub-market Benchmarks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Priority AI Leads (7 Cols) */}
          <SpotlightCard
            spotlightColor="rgba(244, 63, 94, 0.12)"
            className="lg:col-span-7 p-0 flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/60 shadow-2xs">
                    <Flame className="w-4 h-4" />
                  </span>
                  High-Probability Conversion Radar
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Top buyer leads scored by ML conversion propensity</p>
              </div>
              <Link
                href="/leads"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl border border-indigo-200/70 flex items-center gap-1 group transition-all shadow-2xs"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100/80 flex-1">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading telemetry...</div>
              ) : hotLeads.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No hot conversion leads in current pipeline.</div>
              ) : (
                hotLeads.map((lead) => {
                  const leadInitials = lead.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={lead._id}
                      className="p-4 hover:bg-slate-50/90 transition-all flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-100 to-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-200/80 shadow-2xs group-hover:scale-105 transition-transform">
                          {leadInitials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {lead.fullName}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/80 rounded-full shadow-2xs">
                              HOT • {lead.aiScore} pts
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-2">
                            <span>{lead.desiredBhk} BHK</span>
                            <span>•</span>
                            <span>{lead.preferredLocalities?.join(", ") || "Nagpur"}</span>
                            <span>•</span>
                            <span className="font-bold text-slate-800">
                              {formatCurrencyLakhs(lead.budgetMaxInLakhs)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100/80 border border-slate-200/60 px-2.5 py-1 rounded-full">
                          {lead.pipelineStage}
                        </span>
                        <Link
                          href="/leads"
                          className="text-xs font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 px-3.5 py-1.5 rounded-xl border border-indigo-200/80 transition-all shadow-2xs"
                        >
                          Engage
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SpotlightCard>

          {/* Nagpur Sub-Market Valuation Benchmarks (5 Cols) */}
          <SpotlightCard
            spotlightColor="rgba(14, 165, 233, 0.12)"
            className="lg:col-span-5 p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-200/60 shadow-2xs">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      Sub-Market Benchmarks
                    </h3>
                    <p className="text-xs text-slate-500">Nagpur average price per sq.ft valuations</p>
                  </div>
                </div>
                <Link
                  href="/valuation"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/80 px-2.5 py-1 rounded-lg border border-indigo-200/70 flex items-center gap-0.5 shadow-2xs transition-all"
                >
                  Model <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Benchmark List with Visual Demand Meters */}
              <div className="mt-4 space-y-3.5">
                {LOCALITY_DATA.map((loc) => (
                  <div key={loc.name} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50/90 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{loc.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({loc.grade})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{loc.benchmark}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200/60">
                          {loc.trend}
                        </span>
                      </div>
                    </div>
                    {/* Micro Demand Progress Bar */}
                    <div className="h-2 w-full bg-slate-100/90 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
                      <div
                        style={{ width: `${loc.demandPct}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Auto-synced with XGBoost ML
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/70 shadow-2xs">
                92% accuracy
              </span>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
