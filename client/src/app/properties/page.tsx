"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { NewPropertyModal } from "@/components/properties/NewPropertyModal";
import { Property } from "@/types";
import { fetchProperties } from "@/lib/api";
import { formatCurrencyLakhs } from "@/lib/utils";
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
  Map,
  Grid3X3
} from "lucide-react";

// Dynamically import PropertyMap with SSR disabled to prevent Leaflet window errors
const PropertyMap = dynamic(() => import("@/components/properties/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-mono">
      Initializing Leaflet Nagpur geospatial layer...
    </div>
  )
});

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [localityFilter, setLocalityFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"split" | "map" | "grid">("split");
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);

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
  }, []);

  // Filter properties
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocality =
      localityFilter === "All" || prop.locality.toLowerCase() === localityFilter.toLowerCase();

    return matchesSearch && matchesLocality;
  });

  const getRatioBadge = (listed: number, estimated?: number) => {
    const aiEst = estimated || listed;
    const ratio = listed / aiEst;

    if (ratio < 0.95) {
      const diff = Math.round((1 - ratio) * 100);
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
          <TrendingDown className="w-3 h-3 text-emerald-600" />
          {diff}% Undervalued
        </span>
      );
    } else if (ratio > 1.05) {
      const diff = Math.round((ratio - 1) * 100);
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">
          <TrendingUp className="w-3 h-3 text-rose-600" />
          {diff}% Overpriced
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
        <CheckCircle2 className="w-3 h-3 text-slate-600" />
        Fair Market
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
      <Header
        title="Property Inventory"
        subtitle="Nagpur Asset Portfolio & Geospatial Valuation Ratio Heatmap"
      />

      {/* Toolbar */}
      <div className="px-6 py-2.5 bg-white border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties by title, locality, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white font-mono placeholder:text-slate-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={localityFilter}
              onChange={(e) => setLocalityFilter(e.target.value)}
              className="text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="All">All Localities</option>
              <option value="Vasudev Nagar">Vasudev Nagar</option>
              <option value="Dharampeth">Dharampeth</option>
              <option value="MIHAN">MIHAN</option>
              <option value="Manish Nagar">Manish Nagar</option>
              <option value="Trimurti Nagar">Trimurti Nagar</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggles */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-mono">
            <button
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "split" ? "bg-white text-slate-900 font-semibold shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "map" ? "bg-white text-slate-900 font-semibold shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "grid" ? "bg-white text-slate-900 font-semibold shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Grid
            </button>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-5">
        <div className="h-full flex gap-5">
          {/* MAP CONTAINER */}
          {(viewMode === "split" || viewMode === "map") && (
            <div className={`h-full ${viewMode === "split" ? "w-1/2" : "w-full"} shrink-0 flex flex-col`}>
              <PropertyMap
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                onSelectProperty={(prop) => setSelectedProperty(prop)}
              />
            </div>
          )}

          {/* PROPERTY CARDS GRID / LIST */}
          {(viewMode === "split" || viewMode === "grid") && (
            <div
              className={`h-full ${
                viewMode === "split" ? "w-1/2" : "w-full"
              } overflow-y-auto space-y-3 kanban-scroll pr-1`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1 font-mono">
                <span className="font-semibold text-slate-700">
                  {filteredProperties.length} Properties in Nagpur
                </span>
                <span className="text-slate-400">Click to focus coordinate pin</span>
              </div>

              <div
                className={`grid gap-3 ${
                  viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                }`}
              >
                {filteredProperties.map((prop) => {
                  const isSelected = selectedProperty?._id === prop._id;

                  return (
                    <div
                      key={prop._id}
                      onClick={() => setSelectedProperty(prop)}
                      className={`p-4 rounded-lg bg-white border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? "border-slate-900 ring-1 ring-slate-900 shadow-xs"
                          : "border-slate-200/90 shadow-2xs hover:border-slate-400"
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900 truncate">{prop.title}</h3>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                              {prop.status}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {prop.address || prop.locality}
                          </p>
                        </div>

                        {getRatioBadge(prop.listedPriceInLakhs, prop.aiEstimatedPriceInLakhs)}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {prop.description}
                      </p>

                      {/* Specs */}
                      <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                        <span className="flex items-center gap-1 text-slate-800 font-semibold">
                          <BedDouble className="w-3 h-3 text-slate-500" /> {prop.bhk} BHK
                        </span>
                        <span>•</span>
                        <span>{prop.carpetAreaSqFt} sq.ft</span>
                        <span>•</span>
                        <span>Floor {prop.floorNumber}/{prop.totalFloors}</span>
                        <span>•</span>
                        <span className="text-slate-500">{prop.furnishing}</span>
                      </div>

                      {/* Price vs AI Valuation Comparison */}
                      <div className="pt-2 border-t border-slate-100 flex items-end justify-between font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Listed Price</span>
                          <span className="text-sm font-bold text-slate-900">
                            {formatCurrencyLakhs(prop.listedPriceInLakhs)}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                            AI Fair Value
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            {formatCurrencyLakhs(prop.aiEstimatedPriceInLakhs || prop.listedPriceInLakhs)}
                          </span>
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

      {/* New Property Creation Modal with live AI price estimation */}
      <NewPropertyModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onPropertyCreated={(newProp) => {
          setProperties((prev) => [newProp, ...prev]);
        }}
      />
    </div>
  );
}
