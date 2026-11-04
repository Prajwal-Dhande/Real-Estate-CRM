"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { NewPropertyModal } from "@/components/properties/NewPropertyModal";
import { BlueprintViewerModal } from "@/components/properties/BlueprintViewerModal";
import { FinancialCalculatorModal } from "@/components/properties/FinancialCalculatorModal";
import { PropertyBrochureModal } from "@/components/properties/PropertyBrochureModal";
import { AiMarketingCopyModal } from "@/components/properties/AiMarketingCopyModal";
import { Property } from "@/types";
import { fetchProperties } from "@/lib/api";
import { formatCurrencyLakhs } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  BedDouble, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2,
  Filter,
  Layers,
  Map as MapIcon,
  Grid3X3,
  Columns,
  Compass,
  Download,
  Calendar,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Calculator,
  Printer,
  Share2
} from "lucide-react";

// Dynamically import PropertyMap with SSR disabled to prevent Leaflet window errors
const PropertyMap = dynamic(() => import("@/components/properties/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 text-xs font-mono gap-2">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      <span>Loading geospatial GIS satellite layers...</span>
    </div>
  )
});

export default function PropertiesPage() {
  const { user, isAgent, isAdmin, assignedLocalities } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewingBlueprintProperty, setViewingBlueprintProperty] = useState<Property | null>(null);
  const [calculatingProperty, setCalculatingProperty] = useState<Property | null>(null);
  const [brochureProperty, setBrochureProperty] = useState<Property | null>(null);
  const [aiCopyProperty, setAiCopyProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [localityFilter, setLocalityFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"split" | "map" | "grid">("split");
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [territoryOnly, setTerritoryOnly] = useState<boolean>(true);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const data = await fetchProperties();
      setProperties(data);
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [user]);

  // Listen for global custom events to open modals directly from Sidebar / Command Palette
  useEffect(() => {
    const handleOpenNewProperty = () => setIsNewModalOpen(true);
    window.addEventListener("open-new-property-modal", handleOpenNewProperty);
    return () => window.removeEventListener("open-new-property-modal", handleOpenNewProperty);
  }, []);

  // Deep-link integration from Global Command Palette & Sidebar (Priority 5)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const targetPropertyId = params.get("propertyId");
    const targetLocality = params.get("locality");
    const targetAction = params.get("action");

    if (targetPropertyId && properties.length > 0) {
      const found = properties.find((p) => p._id === targetPropertyId);
      if (found) {
        setSelectedProperty(found);
      }
    }
    if (targetLocality) {
      setLocalityFilter(targetLocality);
    }
    if (targetAction === "new-property") {
      setIsNewModalOpen(true);
    }
  }, [properties]);

  // Filter properties by search, locality and agent territory
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prop.builderName && prop.builderName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (prop.reraNumber && prop.reraNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      prop.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocality =
      localityFilter === "All" || prop.locality.toLowerCase() === localityFilter.toLowerCase();

    const matchesTerritory =
      !isAgent ||
      !territoryOnly ||
      assignedLocalities.length === 0 ||
      assignedLocalities.some((al) => al.toLowerCase() === prop.locality.toLowerCase());

    return matchesSearch && matchesLocality && matchesTerritory;
  });

  const handleSharePropertyWhatsApp = (prop: Property) => {
    const text = `*ESTATEIQ PROPERTY ENQUIRY*\n📍 *${prop.title}*\n🏙️ Locality: ${prop.locality}, Nagpur\n📐 ${prop.bhk} BHK • ${prop.carpetAreaSqFt} sq.ft\n💰 Listed Price: ₹${prop.listedPriceInLakhs} Lakhs\n📜 MahaRERA: ${prop.reraNumber || 'Verified'}\n\nWould you like full floor plans, videos and on-road cost sheets?\nShared via EstateIQ Nagpur Platform`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const territoryPropCount = properties.filter((prop) =>
    assignedLocalities.some((al) => al.toLowerCase() === prop.locality.toLowerCase())
  ).length;

  const getRatioBadge = (listed: number, estimated?: number) => {
    const aiEst = estimated || listed;
    const ratio = listed / aiEst;

    if (ratio < 0.95) {
      const diff = Math.round((1 - ratio) * 100);
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 px-2 py-0.5 rounded-lg shadow-2xs">
          <TrendingDown className="w-3 h-3 text-emerald-600" />
          {diff}% Undervalued
        </span>
      );
    } else if (ratio > 1.05) {
      const diff = Math.round((ratio - 1) * 100);
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/90 px-2 py-0.5 rounded-lg shadow-2xs">
          <TrendingUp className="w-3 h-3 text-rose-600" />
          {diff}% Overpriced
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs">
        <CheckCircle2 className="w-3 h-3 text-slate-500" />
        Fair Market
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
      <Header
        title="Property Inventory"
        subtitle="Nagpur Asset Portfolio • MahaRERA Certified Documents & CAD Blueprints"
      />

      {/* Top Toolbar */}
      <div className="px-6 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, builder, MahaRERA, locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/90 border border-slate-200/80 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white font-mono placeholder:text-slate-400 transition-all shadow-2xs text-slate-800"
            />
          </div>

          {/* Locality Filter Pill */}
          <div className="relative shrink-0">
            <select
              value={localityFilter}
              onChange={(e) => setLocalityFilter(e.target.value)}
              className="text-xs font-mono font-bold bg-slate-50/90 border border-slate-200/80 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shadow-2xs cursor-pointer appearance-none pr-7"
            >
              <option value="All">All Localities ({properties.length})</option>
              <option value="Vasudev Nagar">Vasudev Nagar</option>
              <option value="Dharampeth">Dharampeth</option>
              <option value="MIHAN">MIHAN</option>
              <option value="Manish Nagar">Manish Nagar</option>
              <option value="Civil Lines">Civil Lines</option>
              <option value="Trimurti Nagar">Trimurti Nagar</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Agent Territory Switcher */}
          {isAgent && assignedLocalities.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50/80 border border-blue-200 text-xs font-mono shrink-0 shadow-2xs">
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
                {territoryOnly ? `My Scope (${territoryPropCount})` : "All Units"}
              </button>
            </div>
          )}
        </div>

        {/* View Switcher & Add Property Button */}
        <div className="flex items-center gap-2.5">
          {/* Segmented View Toggles */}
          <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/70 text-xs font-mono shadow-2xs">
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "split" 
                  ? "bg-white text-slate-900 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "map" 
                  ? "bg-white text-slate-900 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "grid" 
                  ? "bg-white text-slate-900 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Grid3X3 className="w-3 h-3" />
              <span>Grid</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-5 md:p-6 animate-fade-in-up">
        <div className="h-full flex gap-5">
          {/* GIS MAP CONTAINER */}
          {(viewMode === "split" || viewMode === "map") && (
            <div className={`h-full ${viewMode === "split" ? "w-1/2" : "w-full"} shrink-0 flex flex-col`}>
              <PropertyMap
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                onSelectProperty={(prop) => setSelectedProperty(prop)}
              />
            </div>
          )}

          {/* PROPERTY CARDS SCROLLER */}
          {(viewMode === "split" || viewMode === "grid") && (
            <div
              className={`h-full ${
                viewMode === "split" ? "w-1/2" : "w-full"
              } overflow-y-auto space-y-4 kanban-scroll pr-1`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1 font-mono">
                <span className="font-bold text-slate-800">
                  {filteredProperties.length} Properties in Nagpur
                </span>
                <span className="text-slate-400">Click any card to focus coordinate pin</span>
              </div>

              <div
                className={`grid gap-4 ${
                  viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                }`}
              >
                {filteredProperties.map((prop) => {
                  const isSelected = selectedProperty?._id === prop._id;
                  const hasImage = prop.images && prop.images.length > 0;

                  return (
                    <div
                      key={prop._id}
                      onClick={() => setSelectedProperty(prop)}
                      className={`group relative rounded-2xl bg-white/95 backdrop-blur-sm border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-500/40 shadow-xl scale-[1.008]"
                          : "border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] hover:border-indigo-300 hover:shadow-card-hover hover:-translate-y-1"
                      }`}
                    >
                      {/* Top Specular Shine Line on Hover */}
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                      {/* Optional Top Thumbnail / Image Preview */}
                      {hasImage && viewMode === "grid" && (
                        <div className="relative h-40 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                          <img
                            src={prop.images![0]}
                            alt={prop.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-white rounded-md shadow-2xs">
                              {prop.status}
                            </span>
                          </div>
                          <div className="absolute top-2.5 right-2.5">
                            {getRatioBadge(prop.listedPriceInLakhs, prop.aiEstimatedPriceInLakhs)}
                          </div>
                        </div>
                      )}

                      <div className="p-4 space-y-3">
                        {/* Top Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                {prop.title}
                              </h3>
                              {(!hasImage || viewMode !== "grid") && (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200/70">
                                  {prop.status}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{prop.address || prop.locality}</span>
                            </p>
                          </div>

                          {(!hasImage || viewMode !== "grid") &&
                            getRatioBadge(prop.listedPriceInLakhs, prop.aiEstimatedPriceInLakhs)}
                        </div>

                        {/* Builder & MahaRERA Registration (Priority 3) */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1.5 truncate font-bold text-slate-800">
                            <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">{prop.builderName || "Nagpur Premier Estates"}</span>
                          </div>

                          {prop.reraNumber && (
                            <a
                              href="https://maharera.mahaonline.gov.in"
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shrink-0 shadow-2xs"
                              title="Verify on Maharashtra RERA Official Portal"
                            >
                              <ShieldCheck className="w-3 h-3 text-blue-600" />
                              <span>{prop.reraNumber}</span>
                            </a>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {prop.description}
                        </p>

                        {/* Specs Capsules */}
                        <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 font-mono">
                          <span className="flex items-center gap-1 text-slate-900 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
                            <BedDouble className="w-3 h-3 text-indigo-600" /> {prop.bhk} BHK
                          </span>
                          <span>•</span>
                          <span className="font-semibold">{prop.carpetAreaSqFt} sq.ft</span>
                          <span>•</span>
                          <span>Floor {prop.floorNumber}/{prop.totalFloors}</span>
                          <span>•</span>
                          <span className="text-slate-500 truncate">{prop.furnishing}</span>
                        </div>

                        {/* Possession Timeline & Interactive Document Actions (Priority 3) */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 font-mono">
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{prop.possessionDate || "Ready to Move"}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                            {/* Feature 1: Interactive EMI & Cost Sheet */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCalculatingProperty(prop);
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 transition-all shadow-2xs"
                              title="Calculate Home Loan EMI & Maharashtra Stamp Duty"
                            >
                              <Calculator className="w-3 h-3 text-emerald-600" />
                              <span>₹ Costs / EMI</span>
                            </button>

                            {/* Feature 2: 1-Click Branded PDF Brochure */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBrochureProperty(prop);
                              }}
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-bold flex items-center gap-1 transition-all shadow-2xs"
                              title="View & Download Client PDF Brochure"
                            >
                              <Printer className="w-3 h-3 text-indigo-600" />
                              <span>Brochure</span>
                            </button>

                            {/* CAD Floor Plan Modal */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingBlueprintProperty(prop);
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px] font-bold flex items-center gap-1 transition-all shadow-2xs"
                              title="View Architectural CAD Floor Plan"
                            >
                              <Compass className="w-3 h-3 text-slate-600" />
                              <span>Floor Plan</span>
                            </button>

                            {/* GenAI Marketing Copywriter Modal */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAiCopyProperty(prop);
                              }}
                              className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold flex items-center gap-1 transition-all shadow-2xs"
                              title="Generate AI Marketing Pitch (WhatsApp / 99acres / IG)"
                            >
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span>AI Pitch</span>
                            </button>

                            {/* Public Shareable Client View Link */}
                            <a
                              href={`/p/${prop._id}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold flex items-center gap-1 transition-all shadow-2xs"
                              title="Open Public Shareable Client View (/p/:id)"
                            >
                              <ExternalLink className="w-3 h-3 text-blue-600" />
                              <span>Client Link</span>
                            </a>

                            {/* Feature 3: WhatsApp Share Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSharePropertyWhatsApp(prop);
                              }}
                              className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center justify-center transition-all shadow-2xs"
                              title="Share Property Details on WhatsApp"
                            >
                              <Share2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Price vs AI Valuation Comparison */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-end justify-between font-mono">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Listed Price</span>
                            <span className="text-sm font-black text-slate-900">
                              {formatCurrencyLakhs(prop.listedPriceInLakhs)}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                              AI Fair Value
                            </span>
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                              {formatCurrencyLakhs(prop.aiEstimatedPriceInLakhs || prop.listedPriceInLakhs)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Property Creation Modal with live AI price estimation & Document Upload */}
      <NewPropertyModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onPropertyCreated={(newProp) => {
          setProperties((prev) => [newProp, ...prev]);
        }}
      />

      {/* Interactive Architectural Blueprint & CAD Layout Modal (Priority 3) */}
      <BlueprintViewerModal
        isOpen={Boolean(viewingBlueprintProperty)}
        property={viewingBlueprintProperty}
        onClose={() => setViewingBlueprintProperty(null)}
      />

      {/* Feature 1: Financial Suite & Cost Sheet Modal */}
      {calculatingProperty && (
        <FinancialCalculatorModal
          property={calculatingProperty}
          isOpen={Boolean(calculatingProperty)}
          onClose={() => setCalculatingProperty(null)}
          onOpenBrochure={() => {
            setBrochureProperty(calculatingProperty);
            setCalculatingProperty(null);
          }}
        />
      )}

      {/* Feature 2: 1-Click Branded PDF Brochure Modal */}
      {brochureProperty && (
        <PropertyBrochureModal
          property={brochureProperty}
          isOpen={Boolean(brochureProperty)}
          onClose={() => setBrochureProperty(null)}
        />
      )}

      {/* GenAI Marketing Pitch Modal */}
      {aiCopyProperty && (
        <AiMarketingCopyModal
          isOpen={Boolean(aiCopyProperty)}
          onClose={() => setAiCopyProperty(null)}
          params={{
            title: aiCopyProperty.title,
            locality: aiCopyProperty.locality,
            bhk: aiCopyProperty.bhk,
            carpetAreaSqFt: aiCopyProperty.carpetAreaSqFt,
            furnishing: aiCopyProperty.furnishing,
            amenities: aiCopyProperty.amenities,
            listedPriceInLakhs: aiCopyProperty.listedPriceInLakhs,
            builderName: aiCopyProperty.builderName,
            reraNumber: aiCopyProperty.reraNumber,
            possessionDate: aiCopyProperty.possessionDate
          }}
        />
      )}
    </div>
  );
}
