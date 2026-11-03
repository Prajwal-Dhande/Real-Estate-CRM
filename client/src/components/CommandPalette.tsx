"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  LayoutDashboard, 
  Kanban, 
  Building2, 
  Cpu, 
  Repeat, 
  Plus, 
  MessageSquare, 
  AlertTriangle, 
  MapPin, 
  BedDouble, 
  Phone, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Command,
  CornerDownLeft
} from "lucide-react";
import { Lead, Property, SearchResult } from "@/types";
import { searchGlobal } from "@/lib/api";
import { formatCurrencyLakhs } from "@/lib/utils";

type CategoryFilter = "all" | "actions" | "leads" | "properties" | "localities";

interface CommandItem {
  id: string;
  category: "actions" | "leads" | "properties" | "localities";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  extra?: string;
  onSelect: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult>({
    leads: [],
    properties: [],
    localities: []
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global Keyboard Listener for ⌘K / Ctrl+K and /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Quick slash '/' open when not in input
      if (
        e.key === "/" &&
        !isOpen &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Close on Escape
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
      setActiveFilter("all");
    }
  }, [isOpen]);

  // Debounced search when query changes
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setSearchResults({ leads: [], properties: [], localities: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchGlobal(query);
        setSearchResults(res);
      } catch (err) {
        console.error("Command palette search error:", err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Reset selected index when query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter]);

  // Built-in Static Navigation & Quick Actions
  const staticActions: CommandItem[] = useMemo(() => [
    {
      id: "act-dashboard",
      category: "actions",
      title: "Executive Overview / Telemetry",
      subtitle: "Nagpur Brokerage Analytics & XGBoost model stats",
      icon: <LayoutDashboard className="w-4 h-4 text-indigo-400" />,
      badge: "View",
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
      onSelect: () => {
        setIsOpen(false);
        router.push("/");
      }
    },
    {
      id: "act-leads",
      category: "actions",
      title: "Lead Pipeline (Kanban Board)",
      subtitle: "Autonomous AI conversion scoring & deal flow",
      icon: <Kanban className="w-4 h-4 text-blue-400" />,
      badge: "Pipeline",
      badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/20",
      onSelect: () => {
        setIsOpen(false);
        router.push("/leads");
      }
    },
    {
      id: "act-overdue",
      category: "actions",
      title: "Filter Overdue SLA Callbacks",
      subtitle: "Immediate callbacks with 40% conversion impact",
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      badge: "SLA Urgent",
      badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/20",
      onSelect: () => {
        setIsOpen(false);
        router.push("/leads?filter=overdue");
      }
    },
    {
      id: "act-new-lead",
      category: "actions",
      title: "Create New Buyer Lead",
      subtitle: "Log client requirement with automatic AI locality scoring",
      icon: <Plus className="w-4 h-4 text-emerald-400" />,
      badge: "Action",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      onSelect: () => {
        setIsOpen(false);
        router.push("/leads?action=new-lead");
      }
    },
    {
      id: "act-whatsapp",
      category: "actions",
      title: "Simulate WhatsApp Lead Ingestion",
      subtitle: "Test Meta Business Cloud API NLP parser and auto-reply",
      icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
      badge: "Webhook",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      onSelect: () => {
        setIsOpen(false);
        router.push("/leads?action=simulate-whatsapp");
      }
    },
    {
      id: "act-properties",
      category: "actions",
      title: "Property Inventory (Map & Blueprints)",
      subtitle: "MahaRERA verified assets, CAD floor plans & Leaflet GIS",
      icon: <Building2 className="w-4 h-4 text-amber-400" />,
      badge: "Inventory",
      badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      onSelect: () => {
        setIsOpen(false);
        router.push("/properties");
      }
    },
    {
      id: "act-new-property",
      category: "actions",
      title: "List New Property with MahaRERA & Blueprint",
      subtitle: "Upload blueprints, verify MahaRERA number, evaluate fair price",
      icon: <Building2 className="w-4 h-4 text-indigo-400" />,
      badge: "Action",
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
      onSelect: () => {
        setIsOpen(false);
        router.push("/properties?action=new-property");
      }
    },
    {
      id: "act-valuation",
      category: "actions",
      title: "AI Valuation Engine Sandbox",
      subtitle: "Run live XGBoost fair market pricing simulations",
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      badge: "ML Engine",
      badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
      onSelect: () => {
        setIsOpen(false);
        router.push("/valuation");
      }
    },
    {
      id: "act-switch-role",
      category: "actions",
      title: "Switch Session Context & Role",
      subtitle: "Toggle Admin (All Nagpur) vs Territory Agents (Rahul / Sneha)",
      icon: <Repeat className="w-4 h-4 text-purple-400" />,
      badge: "Auth",
      badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/20",
      onSelect: () => {
        setIsOpen(false);
        router.push("/login");
      }
    }
  ], [router]);

  // Filter actions matching query
  const filteredActions = useMemo(() => {
    if (!query.trim()) return staticActions;
    const q = query.toLowerCase();
    return staticActions.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.subtitle && a.subtitle.toLowerCase().includes(q))
    );
  }, [staticActions, query]);

  // Convert SearchResults (Leads, Properties, Localities) into CommandItems
  const leadItems: CommandItem[] = useMemo(() => {
    return searchResults.leads.map((lead: Lead) => {
      // Check if SLA overdue
      const isOverdue = lead.nextFollowUpAt && new Date(lead.nextFollowUpAt).getTime() < Date.now();
      return {
        id: `lead-${lead._id}`,
        category: "leads",
        title: lead.fullName,
        subtitle: `${lead.phone} • ${lead.desiredBhk} BHK in ${lead.preferredLocalities?.join(", ") || "Nagpur"}`,
        icon: <Phone className="w-4 h-4 text-blue-400" />,
        badge: isOverdue ? "⚠️ Overdue" : lead.pipelineStage,
        badgeColor: isOverdue 
          ? "bg-rose-500/20 text-rose-300 border-rose-500/30" 
          : "bg-blue-500/10 text-blue-300 border-blue-500/20",
        extra: `₹${lead.budgetMaxInLakhs}L • Score ${lead.aiScore}`,
        onSelect: () => {
          setIsOpen(false);
          router.push(`/leads?leadId=${lead._id}`);
        }
      };
    });
  }, [searchResults.leads, router]);

  const propertyItems: CommandItem[] = useMemo(() => {
    return searchResults.properties.map((prop: Property) => {
      return {
        id: `prop-${prop._id}`,
        category: "properties",
        title: prop.title,
        subtitle: `${prop.locality} • ${prop.builderName || "Nagpur Premier"} • ${prop.carpetAreaSqFt} sq.ft`,
        icon: <Building2 className="w-4 h-4 text-emerald-400" />,
        badge: prop.reraNumber ? `🛡️ ${prop.reraNumber}` : prop.status,
        badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        extra: `${formatCurrencyLakhs(prop.listedPriceInLakhs)} • ${prop.bhk} BHK`,
        onSelect: () => {
          setIsOpen(false);
          router.push(`/properties?propertyId=${prop._id}`);
        }
      };
    });
  }, [searchResults.properties, router]);

  const localityItems: CommandItem[] = useMemo(() => {
    return searchResults.localities.map((loc: string) => {
      return {
        id: `loc-${loc}`,
        category: "localities",
        title: `${loc}, Nagpur`,
        subtitle: "Filter properties and inventory in this micro-market",
        icon: <MapPin className="w-4 h-4 text-purple-400" />,
        badge: "Locality",
        badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/20",
        extra: "Filter Map",
        onSelect: () => {
          setIsOpen(false);
          router.push(`/properties?locality=${encodeURIComponent(loc)}`);
        }
      };
    });
  }, [searchResults.localities, router]);

  // Combine items according to active filter
  const allFlattenedItems: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [];
    if (activeFilter === "all" || activeFilter === "actions") {
      list.push(...filteredActions);
    }
    if (activeFilter === "all" || activeFilter === "leads") {
      list.push(...leadItems);
    }
    if (activeFilter === "all" || activeFilter === "properties") {
      list.push(...propertyItems);
    }
    if (activeFilter === "all" || activeFilter === "localities") {
      list.push(...localityItems);
    }
    return list;
  }, [activeFilter, filteredActions, leadItems, propertyItems, localityItems]);

  // Keyboard navigation within list
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allFlattenedItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allFlattenedItems.length) % (allFlattenedItems.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = allFlattenedItems[selectedIndex];
      if (current) {
        current.onSelect();
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const filters: CategoryFilter[] = ["all", "actions", "leads", "properties", "localities"];
      const nextIndex = (filters.indexOf(activeFilter) + 1) % filters.length;
      setActiveFilter(filters[nextIndex]);
    }
  };

  // Ensure active highlighted item is visible in scroll
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0B132B]/95 text-slate-100 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[78vh] backdrop-blur-xl animate-in zoom-in-95 duration-150"
      >
        {/* Top Search Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-[#0F172A]">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command, lead name, property, or locality..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-hidden font-sans"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Filter Pills Navigation */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider shrink-0">
            Filter:
          </span>
          {[
            { id: "all", label: "All" },
            { id: "actions", label: `Actions (${filteredActions.length})` },
            { id: "leads", label: `Leads (${leadItems.length})` },
            { id: "properties", label: `Properties (${propertyItems.length})` },
            { id: "localities", label: `Localities (${localityItems.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as CategoryFilter)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
                activeFilter === tab.id
                  ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Results List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 kanban-scroll"
        >
          {loading && (
            <div className="p-4 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-indigo-500 border-t-transparent" />
              <span>Searching Nagpur database...</span>
            </div>
          )}

          {!loading && allFlattenedItems.length === 0 && (
            <div className="py-12 px-4 text-center">
              <p className="text-xs font-mono text-slate-400">
                No matches found for &ldquo;<span className="text-white">{query}</span>&rdquo;
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Try searching for a client name (e.g. &ldquo;Rahul&rdquo;), locality (&ldquo;Dharampeth&rdquo;), or BHK.
              </p>
            </div>
          )}

          {!loading && allFlattenedItems.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={item.id}
                data-index={idx}
                onClick={item.onSelect}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`px-3 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-indigo-600/20 text-white border border-indigo-500/40 shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg shrink-0 ${isSelected ? "bg-indigo-500/20" : "bg-slate-800/60"}`}>
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold truncate text-slate-100">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                  {item.extra && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.extra}
                    </span>
                  )}
                  {isSelected && (
                    <div className="hidden sm:flex items-center gap-1 text-[10px] text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                      <span>Jump</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Command Footer */}
        <div className="px-4 py-2.5 bg-[#0F172A] border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">Tab</kbd>
              <span>Category</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <Command className="w-3 h-3 text-slate-400" />
            <span>EstateIQ Global Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}

