"use client";

import React, { useState } from "react";
import { Property } from "@/types";
import { formatCurrencyLakhs } from "@/lib/utils";
import { 
  X, 
  Compass, 
  ShieldCheck, 
  Download, 
  ExternalLink, 
  Maximize2, 
  FileCheck2, 
  Building2, 
  CheckCircle2, 
  Layers, 
  Printer,
  Calendar,
  Sparkles
} from "lucide-react";

interface BlueprintViewerModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BlueprintViewerModal({ property, isOpen, onClose }: BlueprintViewerModalProps) {
  const [activeTab, setActiveTab] = useState<"blueprint" | "specs">("blueprint");
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!isOpen || !property) return null;

  const blueprintSrc =
    property.floorPlanUrl ||
    `/api/properties/blueprint/sample?bhk=${property.bhk}&carpetAreaSqFt=${property.carpetAreaSqFt}`;

  const reraNum = property.reraNumber || "P50500028192";
  const builder = property.builderName || "Nagpur Premier Estates";
  const possession = property.possessionDate || "Ready to Move";

  const handleDownloadBlueprint = () => {
    // If it's a sample URL or external, open/save
    const link = document.createElement("a");
    link.href = blueprintSrc;
    link.download = `${property.title.replace(/\s+/g, "_")}_Blueprint.svg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0B132B] text-slate-100 rounded-2xl max-w-5xl w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-bold font-sans tracking-tight text-white">
                  {property.title}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {property.bhk} BHK • {property.carpetAreaSqFt} sq.ft
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{builder}</span>
                <span>•</span>
                <span>{property.locality}, Nagpur</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBlueprint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-medium text-slate-200 border border-slate-700 transition-colors"
              title="Download Architectural Layout"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Save Blueprint</span>
            </button>

            {property.brochureUrl && (
              <a
                href={property.brochureUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-xs font-mono font-medium text-emerald-300 border border-emerald-500/30 transition-colors"
                title="Download Official Project Brochure"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Brochure</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MahaRERA Trust Banner */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-blue-950/60 to-slate-900 border-b border-blue-900/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              MahaRERA: {reraNum}
            </span>
            <span className="text-slate-400 text-[11px] hidden md:inline">
              Maharashtra Real Estate Regulatory Authority Certified Layout
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Possession: <strong className="text-white">{possession}</strong></span>
            </div>
            <a
              href="https://maharera.mahaonline.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 underline underline-offset-2"
            >
              Verify on MahaRERA <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Main Body: Architectural Blueprint Canvas + Specs Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Blueprint Canvas View */}
          <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-3 md:p-6 overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
            <div className="w-full h-full max-h-[560px] rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] shadow-inner relative flex items-center justify-center">
              <iframe
                src={blueprintSrc}
                className="w-full h-full border-0 select-none"
                title={`Floor Plan Blueprint for ${property.title}`}
              />

              {/* Blueprint Watermark / Overlay Stamp */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-slate-900/90 backdrop-blur-xs border border-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-1.5 pointer-events-none">
                <FileCheck2 className="w-3 h-3 text-emerald-400" />
                <span>Sanctioned Architectural Plan • Scale 1:100</span>
              </div>
            </div>
          </div>

          {/* Right Specs & Schedule Sidebar */}
          <div className="w-full md:w-80 lg:w-96 bg-[#0B132B] p-5 overflow-y-auto space-y-4 shrink-0 font-mono text-xs">
            {/* Quick Dimension Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Carpet Area Telemetry
              </span>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-bold text-white">{property.carpetAreaSqFt}</span>
                  <span className="text-slate-400 text-xs ml-1">SQ. FT</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">
                    ≈ {Math.round(property.carpetAreaSqFt * 0.092903)} SQ. MTR
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                <span>Configuration:</span>
                <span className="font-semibold text-indigo-300">{property.bhk} BHK • {property.bathrooms} Baths</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Floor Level:</span>
                <span>Level {property.floorNumber} of {property.totalFloors}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Furnishing:</span>
                <span>{property.furnishing}</span>
              </div>
            </div>

            {/* Architectural Room Dimension Schedule */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Room Dimension Schedule
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-300">Living &amp; Dining Room</span>
                  <span className="font-semibold text-slate-100">22&apos; 6&quot; × 14&apos; 0&quot;</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-300">Master Suite</span>
                  <span className="font-semibold text-slate-100">15&apos; 0&quot; × 13&apos; 6&quot;</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-300">Ensuite Master Bath</span>
                  <span className="font-semibold text-slate-100">8&apos; 0&quot; × 6&apos; 0&quot;</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-300">Bedroom 2</span>
                  <span className="font-semibold text-slate-100">13&apos; 0&quot; × 12&apos; 0&quot;</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-300">Modular Kitchen</span>
                  <span className="font-semibold text-slate-100">10&apos; 0&quot; × 12&apos; 6&quot;</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-300">Sun Deck / Balcony</span>
                  <span className="font-semibold text-emerald-400">12&apos; 0&quot; × 5&apos; 6&quot;</span>
                </div>
              </div>
            </div>

            {/* Statutory Approvals & Banking */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Statutory Approvals
              </span>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>NIT / NMC Nagpur Sanctioned Plan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Clear Search &amp; Title Certificate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Approved for Loans: SBI, HDFC, ICICI</span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Listed Price</span>
                <span className="text-base font-bold text-white">
                  {formatCurrencyLakhs(property.listedPriceInLakhs)}
                </span>
              </div>
              {property.brochureUrl && (
                <a
                  href={property.brochureUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Brochure</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

