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

type CategoryFilter = "all" | "navigation" | "actions" | "leads" | "properties" | "localities";

interface CommandItem {
  id: string;
  category: "navigation" | "actions" | "leads" | "properties" | "localities";
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

      // Quick slash '/' open when not focused on an input
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

  // Built-in Static Navigation Pages
  const navigationActions: CommandItem[] = useMemo(() => [
    {
      id: "nav-dashboard",
      category: "navigation",
      title: "Executive Overview & Telemetry",
      subtitle: "Nagpur Brokerage Analytics, CPL & ML Model Health",
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: "Overview",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
      onSelect: () => {
        setIsOpen(false);
        router.push("/");
      }
    },
    {
      id: "nav-leads",
      category: "navigation",
      title: "Lead Pipeline (Kanban Board)",
      subtitle: "Autonomous AI conversion scoring, SLA timers & deal flow",
      icon: <Kanban className="w-4 h-4" />,
      badge: "Pipeline",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200/80",
      onSelect: () => {
        setIsOpen(false);
        router.push("/leads");
      }
    },
    {
      id: "nav-properties",
      category: "navigation",
      title: "Property Inventory (Map & Blueprints)",
      subtitle: "MahaRERA verified assets, CAD floor plans & Leaflet GIS",
      icon: <Building2 className="w-4 h-4" />,
      badge: "Inventory",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200/80",
      onSelect: () => {
        setIsOpen(false);
        router.push("/properties");
      }
    },
    {
      id: "nav-valuation",
      category: "navigation",
      title: "AI Valuation Engine Sandbox",
      subtitle: "Run live XGBoost fair market pricing simulations",
      icon: <Cpu className="w-4 h-4" />,
      badge: "ML Engine",
      badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200/80",
      onSelect: () => {
        setIsOpen(false);
        router.push("/valuation");
      }
    }
  ], [router]);

  // Built-in Quick Action Commands
  const quickActions: CommandItem[] = useMemo(() => [
    {
      id: "act-new-lead",
      category: "actions",
      title: "Create New Buyer Lead",
      subtitle: "Log client requirement with automatic AI locality scoring",
      icon: <Plus className="w-4 h-4" />,
      badge: "Action",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
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
      icon: <MessageSquare className="w-4 h-4" />,
      badge: "Webhook",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      onSelect: () => {
        setIsOpen(false);
        router.push("/leads?action=simulate-whatsapp");
      }
    },
    {
      id: "act-new-property",
      category: "actions",
      title: "List New Property with MahaRERA & Blueprint",
      subtitle: "Upload blueprints, verify MahaRERA number, evaluate fair price",
      icon: <Building2 className="w-4 h-4" />,
      badge: "Action",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
      onSelect: () => {
        setIsOpen(false);
        router.push("/properties?action=new-property");
      }
    },
    {
      id: "act-overdue",
      category: "actions",
      title: "Filter Overdue SLA Callbacks",
      subtitle: "Immediate callbacks with 40% conversion impact",
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: "SLA Urgent",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200/80",
      onSelect: () => {
        setIsOpen(false);
        router.push("/leads?filter=overdue");
      }
    },
    {
      id: "act-switch-role",
      category: "actions",
      title: "Switch Session Context & Role",
      subtitle: "Toggle Admin (All Nagpur) vs Territory Agents (Rahul / Sneha)",
      icon: <Repeat className="w-4 h-4" />,
      badge: "Auth",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200/80",
      onSelect: () => {
        setIsOpen(false);
        router.push("/login");
      }
    }
  ], [router]);

  // Filter actions matching query
  const filteredNavigation = useMemo(() => {
    if (!query.trim()) return navigationActions;
    const q = query.toLowerCase();
    return navigationActions.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.subtitle && a.subtitle.toLowerCase().includes(q))
    );
  }, [navigationActions, query]);

  const filteredQuickActions = useMemo(() => {
    if (!query.trim()) return quickActions;
    const q = query.toLowerCase();
    return quickActions.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.subtitle && a.subtitle.toLowerCase().includes(q))
    );
  }, [quickActions, query]);

  // Convert SearchResults (Leads, Properties, Localities) into CommandItems
  const leadItems: CommandItem[] = useMemo(() => {
    return searchResults.leads.map((lead: Lead) => {
      const isOverdue = lead.nextFollowUpAt && new Date(lead.nextFollowUpAt).getTime() < Date.now();
      return {
        id: `lead-${lead._id}`,
        category: "leads",
        title: lead.fullName,
        subtitle: `${lead.phone} • ${lead.desiredBhk} BHK in ${lead.preferredLocalities?.join(", ") || "Nagpur"} • ${lead.source}`,
        icon: <Phone className="w-4 h-4" />,
        badge: isOverdue ? "⚠️ Overdue" : `${lead.aiPriorityTag} • ${lead.aiScore} pts`,
        badgeColor: isOverdue 
          ? "bg-rose-50 text-rose-700 border-rose-200" 
          : lead.aiPriorityTag === "Hot"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-amber-50 text-amber-700 border-amber-200",
        extra: `Max ₹${lead.budgetMaxInLakhs}L`,
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
        icon: <Building2 className="w-4 h-4" />,
        badge: prop.reraNumber ? `🛡️ ${prop.reraNumber}` : prop.status,
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
        icon: <MapPin className="w-4 h-4" />,
        badge: "Micro-Market",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        extra: "View Inventory",
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
    
    // When no search query is typed, organize by navigation + actions
    if (!query.trim()) {
      if (activeFilter === "all" || activeFilter === "navigation") {
        list.push(...filteredNavigation);
      }
      if (activeFilter === "all" || activeFilter === "actions") {
        list.push(...filteredQuickActions);
      }
      return list;
    }

    // When search query is active
    if (activeFilter === "all" || activeFilter === "leads") {
      list.push(...leadItems);
    }
    if (activeFilter === "all" || activeFilter === "properties") {
      list.push(...propertyItems);
    }
    if (activeFilter === "all" || activeFilter === "localities") {
      list.push(...localityItems);
    }
    if (activeFilter === "all" || activeFilter === "actions") {
      list.push(...filteredNavigation);
      list.push(...filteredQuickActions);
    }
    return list;
  }, [query, activeFilter, filteredNavigation, filteredQuickActions, leadItems, propertyItems, localityItems]);

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
      const availableTabs: CategoryFilter[] = query.trim()
        ? ["all", "leads", "properties", "localities", "actions"]
        : ["all", "navigation", "actions"];
      const nextIndex = (availableTabs.indexOf(activeFilter) + 1) % availableTabs.length;
      setActiveFilter(availableTabs[nextIndex]);
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

  // Compute category counts for tabs
  const isSearching = Boolean(query.trim());

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] md:pt-[12vh] px-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[76vh] animate-in zoom-in-95 duration-150 ring-1 ring-black/5"
      >
        {/* Top Search Input Bar */}
        <div className="h-14 px-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command, lead name, property, or locality..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden font-normal"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200/80 dark:border-slate-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Category Filter Pills (Clean, no empty (0) placeholders) */}
        <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-mono shrink-0">
          {!isSearching ? (
            // Default View Tabs
            <>
              {[
                { id: "all", label: "All Items" },
                { id: "navigation", label: "Navigation" },
                { id: "actions", label: "Quick Actions" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as CategoryFilter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
                    activeFilter === tab.id
                      ? "bg-slate-900 dark:bg-indigo-600 text-white font-semibold shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </>
          ) : (
            // Search Active Tabs (Only showing categories with matches)
            <>
              {[
                { id: "all", label: `All (${allFlattenedItems.length})` },
                ...(leadItems.length > 0 ? [{ id: "leads", label: `Leads (${leadItems.length})` }] : []),
                ...(propertyItems.length > 0 ? [{ id: "properties", label: `Properties (${propertyItems.length})` }] : []),
                ...(localityItems.length > 0 ? [{ id: "localities", label: `Localities (${localityItems.length})` }] : []),
                ...(filteredNavigation.length + filteredQuickActions.length > 0
                  ? [{ id: "actions", label: `Commands (${filteredNavigation.length + filteredQuickActions.length})` }]
                  : [])
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as CategoryFilter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
                    activeFilter === tab.id
                      ? "bg-slate-900 dark:bg-indigo-600 text-white font-semibold shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Scrollable Results List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 kanban-scroll"
        >
          {loading && (
            <div className="py-10 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-indigo-600 border-t-transparent" />
              <span>Searching Nagpur database...</span>
            </div>
          )}

          {!loading && allFlattenedItems.length === 0 && (
            <div className="py-12 px-4 text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-white">
                No matches found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
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
                    ? "bg-indigo-50/80 dark:bg-indigo-950/60 text-slate-900 dark:text-white ring-1 ring-indigo-200/80 dark:ring-indigo-800 shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold truncate text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${item.badgeColor || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                  {item.extra && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                      {item.extra}
                    </span>
                  )}
                  {isSelected && (
                    <div className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                      <span>Jump</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimalist Command Footer */}
        <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs">Tab</kbd>
              <span>Filter</span>
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
