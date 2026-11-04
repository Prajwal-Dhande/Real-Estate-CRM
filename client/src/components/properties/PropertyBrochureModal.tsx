"use client";

import React, { useRef } from "react";
import { Property } from "@/types";
import { 
  calculateFinancialBreakdown, 
  formatInr, 
  formatIndianDenomination 
} from "@/lib/financials";
import { formatCurrencyLakhs } from "@/lib/utils";
import { 
  X, 
  Printer, 
  Share2, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  BedDouble, 
  Calendar, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Compass, 
  QrCode,
  Sparkles,
  Layers,
  Award
} from "lucide-react";

interface PropertyBrochureModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyBrochureModal({
  property,
  isOpen,
  onClose
}: PropertyBrochureModalProps) {
  const brochureRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const financial = calculateFinancialBreakdown({
    propertyPriceInLakhs: property.listedPriceInLakhs,
    downPaymentPercent: 20,
    interestRateAnnual: 8.5,
    tenureYears: 20,
    isWomanBuyer: false,
    isUnderConstruction: property.possessionDate !== "Ready to Move" && property.status !== "Sold"
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = 
`*ESTATEIQ LUXURY PROPERTY DOSSIER*
📍 *${property.title}*
🏙️ Locality: ${property.locality}, Nagpur
📐 Area: ${property.carpetAreaSqFt} sq.ft (${property.bhk} BHK)
🏗️ Builder: ${property.builderName || "Nagpur Premier Estates"}
📜 MahaRERA: ${property.reraNumber || "P50500028192"}

💰 *Agreement Price:* ${formatIndianDenomination(financial.propertyPriceInr)}
📑 *Net On-Road Cost:* ${formatIndianDenomination(financial.netOnRoadPriceInr)}
🏦 *Indicative EMI:* ${formatInr(financial.monthlyEmiInr)} / mo (80% Loan @ 8.5%)

For confidential private viewing or full architectural blueprints, contact:
Prajwal Dhande • Managing Broker, EstateIQ Nagpur
📞 +91 98220 11800 | 🌐 estateiq.in`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in print:p-0 print:bg-white">
      <div 
        className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:max-h-none print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Client Presentation Brochure • Print &amp; PDF Mode
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Save as PDF / Print
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors ml-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Brochure Canvas */}
        <div 
          ref={brochureRef} 
          className="flex-1 overflow-y-auto p-8 space-y-6 print:p-0 print:overflow-visible bg-white"
        >
          {/* Header Branding */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-sm font-mono tracking-tighter">
                  EQ
                </span>
                <div>
                  <h1 className="text-xl font-black text-slate-950 tracking-tight font-serif uppercase">
                    EstateIQ Private Brokerage
                  </h1>
                  <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                    Nagpur Prime Asset Portfolio • MahaRERA Certified Advisory
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                MahaRERA: {property.reraNumber || "P50500028192"}
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Ref ID: EQ-NGP-{property._id.slice(-6).toUpperCase()} • {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Hero Property Overview */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wide">
                  {property.possessionDate}
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                  {property.title}
                </h2>
                <p className="text-xs text-slate-600 font-mono flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {property.address}, {property.locality}, Nagpur
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-slate-500 block">Agreement Price</span>
                <span className="text-2xl font-black font-mono text-slate-950">
                  {formatIndianDenomination(financial.propertyPriceInr)}
                </span>
                <span className="text-[11px] font-mono text-emerald-600 font-bold block">
                  Net On-Road: {formatIndianDenomination(financial.netOnRoadPriceInr)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans pt-1">
              {property.description}
            </p>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="p-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Configuration</span>
              <span className="text-sm font-black font-mono text-slate-800">{property.bhk} BHK Luxury Flat</span>
            </div>
            <div className="p-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Carpet Area</span>
              <span className="text-sm font-black font-mono text-slate-800">{property.carpetAreaSqFt} sq.ft RERA</span>
            </div>
            <div className="p-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Floor Position</span>
              <span className="text-sm font-black font-mono text-slate-800">Floor {property.floorNumber} of {property.totalFloors}</span>
            </div>
            <div className="p-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Furnishing Level</span>
              <span className="text-sm font-black font-mono text-slate-800">{property.furnishing}</span>
            </div>
          </div>

          {/* Floor Plan Blueprint Preview */}
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Architectural Floor Plan Blueprint
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                100% CAD Scaled Layout
              </span>
            </div>

            {/* Architectural SVG Layout */}
            <div className="w-full h-44 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center p-2 overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" className="w-full h-full">
                {/* Blueprint Grid */}
                <defs>
                  <pattern id="brochure-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#brochure-grid)" />
                {/* Outer Wall */}
                <rect x="20" y="20" width="760" height="260" fill="none" stroke="#38BDF8" strokeWidth="3" rx="4" />
                {/* Living Area */}
                <rect x="30" y="30" width="380" height="150" fill="#0284C7" fillOpacity="0.15" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="50" y="70" fill="#E0F2FE" fontSize="14" fontWeight="bold">LIVING &amp; DINING LOUNGE</text>
                <text x="50" y="95" fill="#7DD3FC" fontSize="11">24' 0" × 14' 6" • Premium Vitrified</text>
                {/* Deck */}
                <rect x="30" y="190" width="200" height="85" fill="#059669" fillOpacity="0.15" stroke="#34D399" strokeWidth="1.5" strokeDasharray="3" />
                <text x="45" y="225" fill="#A7F3D0" fontSize="12" fontWeight="bold">SUN DECK / BALCONY</text>
                <text x="45" y="245" fill="#6EE7B7" fontSize="10">12' × 5' • Airport Runway Facing</text>
                {/* Kitchen */}
                <rect x="240" y="190" width="170" height="85" fill="#D97706" fillOpacity="0.15" stroke="#FBBF24" strokeWidth="1.5" />
                <text x="255" y="225" fill="#FEF3C7" fontSize="12" fontWeight="bold">MODULAR KITCHEN</text>
                <text x="255" y="245" fill="#FDE68A" fontSize="10">10' × 12' • Granite Island</text>
                {/* Master Bedroom */}
                <rect x="420" y="30" width="350" height="150" fill="#6366F1" fillOpacity="0.15" stroke="#818CF8" strokeWidth="1.5" />
                <text x="440" y="70" fill="#EEF2FF" fontSize="14" fontWeight="bold">MASTER SUITE + ATTACHED BATH</text>
                <text x="440" y="95" fill="#C7D2FE" fontSize="11">16' 0" × 13' 0" • Laminated Wooden Flooring</text>
                {/* Bedroom 2 */}
                <rect x="420" y="190" width="350" height="85" fill="#8B5CF6" fillOpacity="0.15" stroke="#A78BFA" strokeWidth="1.5" />
                <text x="440" y="225" fill="#EDE9FE" fontSize="12" fontWeight="bold">BEDROOM 2 / GUEST ROOM</text>
                <text x="440" y="245" fill="#DDD6FE" fontSize="10">13' 0" × 11' 6" • Attached Balcony</text>
              </svg>
            </div>
          </div>

          {/* Complete Statutory Cost Sheet Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              Maharashtra / Nagpur NMC Statutory Cost Sheet
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cost Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs font-mono divide-y divide-slate-100">
                <div className="flex justify-between items-center px-3 py-2 bg-slate-50 font-bold">
                  <span>Base Agreement Value</span>
                  <span>{formatInr(financial.propertyPriceInr)}</span>
                </div>
                <div className="flex justify-between items-center px-3 py-2">
                  <span>Stamp Duty ({financial.stampDutyPercent}% NMC)</span>
                  <span className="font-semibold text-slate-800">{formatInr(financial.stampDutyInr)}</span>
                </div>
                <div className="flex justify-between items-center px-3 py-2">
                  <span>Registration Fee (Cap ₹30k)</span>
                  <span className="font-semibold text-slate-800">{formatInr(financial.registrationFeeInr)}</span>
                </div>
                <div className="flex justify-between items-center px-3 py-2">
                  <span>GST ({financial.gstPercent}%)</span>
                  <span className="font-semibold text-slate-800">{formatInr(financial.gstInr)}</span>
                </div>
                <div className="flex justify-between items-center px-3 py-2">
                  <span>Title Search &amp; Legal Vetting</span>
                  <span className="font-semibold text-slate-800">{formatInr(financial.legalAndIncidentalInr)}</span>
                </div>
                <div className="flex justify-between items-center px-3 py-2.5 bg-emerald-50 text-emerald-950 font-bold">
                  <span>Net On-Road Acquisition Total</span>
                  <span className="text-sm font-black text-emerald-700">{formatInr(financial.netOnRoadPriceInr)}</span>
                </div>
              </div>

              {/* Financing Estimate Box */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs font-mono space-y-2">
                <span className="text-indigo-900 font-bold block uppercase tracking-wide">
                  Indicative Home Loan Structure
                </span>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span>Down Payment (20%):</span>
                    <span className="font-bold text-slate-900">{formatIndianDenomination(financial.downPaymentInr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bank Loan Sanction (80%):</span>
                    <span className="font-bold text-indigo-700">{formatIndianDenomination(financial.loanAmountInr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Indicative Monthly EMI:</span>
                    <span className="font-bold text-emerald-700">{formatInr(financial.monthlyEmiInr)} / mo</span>
                  </div>
                  <div className="flex justify-between border-t border-indigo-200/60 pt-1.5 text-[11px]">
                    <span className="text-slate-500">Upfront Cash Needed:</span>
                    <span className="font-black text-indigo-950">{formatIndianDenomination(financial.totalInitialCashRequiredInr)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic pt-1">
                  *Amortized over 20 years @ 8.5% p.a. subject to individual bank eligibility.
                </p>
              </div>
            </div>
          </div>

          {/* Broker Contact & MahaRERA Advisory Footer */}
          <div className="rounded-2xl bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-4 mt-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold block">
                Exclusive Representation &amp; Advisory
              </span>
              <h4 className="text-sm font-black font-mono text-white">
                Prajwal Dhande • Managing Broker
              </h4>
              <p className="text-xs text-slate-300 font-mono flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> +91 98220 11800
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> broker@estateiq.in
                </span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono pt-1">
                EstateIQ Real Estate HQ • Civil Lines &amp; MIHAN Metro Station, Nagpur
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-slate-900">
                <QrCode className="w-10 h-10" />
              </div>
              <div className="text-[10px] font-mono text-slate-300 max-w-[130px] leading-tight">
                Scan for MahaRERA verification &amp; instant WhatsApp inquiry
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

