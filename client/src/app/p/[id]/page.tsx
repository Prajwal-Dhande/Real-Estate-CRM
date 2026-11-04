"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Property } from "@/types";
import { fetchPropertyById, createLead } from "@/lib/api";
import { formatCurrencyLakhs } from "@/lib/utils";
import { calculatePropertyFinancials, formatIndianDenomination, formatInr } from "@/lib/financials";
import { PropertyBrochureModal } from "@/components/properties/PropertyBrochureModal";
import {
  Building2,
  MapPin,
  BedDouble,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Phone,
  MessageSquare,
  Share2,
  Download,
  Calculator,
  Compass,
  ArrowRight,
  Check,
  Star,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
  DollarSign,
  Clock,
  Send
} from "lucide-react";

export default function PublicPropertyPage() {
  const params = useParams();
  const propertyId = (params?.id as string) || "";

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [showBlueprint, setShowBlueprint] = useState<boolean>(false);
  const [isBrochureOpen, setIsBrochureOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // EMI Calculator State
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [isWomanBuyer, setIsWomanBuyer] = useState<boolean>(false);

  // Inbound Site Visit Inquiry Form State
  const [visitorName, setVisitorName] = useState<string>("");
  const [visitorPhone, setVisitorPhone] = useState<string>("");
  const [preferredDay, setPreferredDay] = useState<string>("This Saturday (11:00 AM)");
  const [inquirySubmitted, setInquirySubmitted] = useState<boolean>(false);
  const [submittingInquiry, setSubmittingInquiry] = useState<boolean>(false);

  useEffect(() => {
    if (!propertyId) return;
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchPropertyById(propertyId);
        setProperty(data);
      } catch (err) {
        console.error("Error loading property:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-mono text-slate-300">Loading verified property showcase...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Property Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          The requested listing may have been sold or moved.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-mono font-bold transition-all"
        >
          Return to Portal
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"];

  const currentDisplayImage = images[activeImageIdx] || images[0];

  // Calculate live financial figures
  const financials = calculatePropertyFinancials({
    propertyPriceInLakhs: property.listedPriceInLakhs,
    downPaymentPercent: downPaymentPct,
    interestRateAnnual: interestRate,
    tenureYears,
    isWomanBuyer,
    isUnderConstruction: property.possessionDate !== "Ready to Move"
  });

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getWhatsAppInquiryUrl = () => {
    const text = `Namaste Prajwal! I am viewing "${property.title}" in ${property.locality}, Nagpur on EstateIQ.\n\n💰 Listed: ₹${property.listedPriceInLakhs} Lakhs (${property.bhk} BHK, ${property.carpetAreaSqFt} sq.ft)\n📜 MahaRERA: ${property.reraNumber || "Verified"}\n\nI would like to schedule a private site visit and get the verified cost-sheet.`;
    return `https://wa.me/919822011800?text=${encodeURIComponent(text)}`;
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPhone.trim()) return;

    setSubmittingInquiry(true);
    try {
      await createLead({
        fullName: visitorName.trim(),
        phone: visitorPhone.trim(),
        source: "Website",
        campaignName: `Public Property View - ${property.title}`,
        rawRequirementText: `Interested in ${property.title} (${property.locality}). Requested site visit for: ${preferredDay}`,
        preferredLocalities: [property.locality],
        budgetMinInLakhs: Math.max(10, Math.floor(property.listedPriceInLakhs * 0.9)),
        budgetMaxInLakhs: Math.ceil(property.listedPriceInLakhs * 1.1),
        desiredBhk: property.bhk,
        pipelineStage: "New Inquiry"
      });
      setInquirySubmitted(true);
    } catch (err: any) {
      alert("Failed to submit inquiry: " + err.message);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* ── Top Floating Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-black tracking-wider text-xs shadow-md">
              EQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-slate-950">EstateIQ</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  MahaRERA Certified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">Nagpur Prime Real Estate Advisory</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-mono font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              title="Copy shareable property URL"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
            </button>

            <button
              onClick={() => setIsBrochureOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-mono font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Brochure (PDF)</span>
            </button>

            <a
              href={getWhatsAppInquiryUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all shadow-xs active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Agent</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6">
        {/* Title Bar & Quick Badges */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[11px] font-mono font-bold">
                {property.bhk} BHK Luxury Flat
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-mono">
                {property.furnishing}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                MahaRERA: {property.reraNumber || "P50500028192"}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {property.title}
            </h1>

            <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{property.address || `${property.locality}, Nagpur, Maharashtra`}</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-slate-700">Developer: {property.builderName || "Nagpur Premier Estates"}</span>
            </p>
          </div>

          <div className="shrink-0 md:text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">All-Inclusive Offer Price</span>
            <div className="text-3xl font-black font-mono text-slate-950">
              {formatCurrencyLakhs(property.listedPriceInLakhs)}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              ₹{Math.round((property.listedPriceInLakhs * 100000) / property.carpetAreaSqFt).toLocaleString("en-IN")} / sq.ft • Est. EMI: ₹{Math.round(financials.monthlyEmiInr).toLocaleString("en-IN")}/mo
            </div>
          </div>
        </div>

        {/* ── Photo Gallery & Blueprint Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual Display */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-slate-900 group">
              {showBlueprint ? (
                <iframe
                  src={property.floorPlanUrl || `/api/properties/blueprint/sample?bhk=${property.bhk}&carpetAreaSqFt=${property.carpetAreaSqFt}`}
                  className="w-full h-full border-0"
                  title="CAD Blueprint"
                />
              ) : (
                <img
                  src={currentDisplayImage}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
              )}

              {/* View Switcher Overlay */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <button
                  onClick={() => setShowBlueprint(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md ${
                    !showBlueprint
                      ? "bg-slate-900 text-white"
                      : "bg-white/90 text-slate-800 hover:bg-white"
                  }`}
                >
                  HD Photos ({images.length})
                </button>
                <button
                  onClick={() => setShowBlueprint(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5 ${
                    showBlueprint
                      ? "bg-indigo-600 text-white"
                      : "bg-white/90 text-slate-800 hover:bg-white"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>CAD Floor Plan</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {!showBlueprint && images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIdx === idx
                        ? "border-indigo-600 ring-2 ring-indigo-300 scale-102"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Schedule Site Visit Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Private Showing</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Schedule In-Person Site Visit</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tour this residence with our certified Nagpur real estate specialist. Inspect layout, sunlight, and RERA approvals.
              </p>
            </div>

            {inquirySubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-emerald-900 font-mono">Site Visit Requested!</h4>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Our Managing Broker Prajwal Dhande will confirm your visit over phone or WhatsApp within 15 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98220 XXXXX"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Preferred Timing</label>
                  <select
                    value={preferredDay}
                    onChange={(e) => setPreferredDay(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="This Saturday (11:00 AM)">This Saturday (11:00 AM)</option>
                    <option value="This Sunday (04:00 PM)">This Sunday (04:00 PM)</option>
                    <option value="Weekday Evening (06:00 PM)">Weekday Evening (06:00 PM)</option>
                    <option value="Today (Immediate Showing)">Today (Immediate Showing)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submittingInquiry}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingInquiry ? "Confirming..." : "Confirm Site Visit"}</span>
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Direct Advisor Desk:</span>
              <a href="tel:+919822011800" className="font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1">
                <Phone className="w-3 h-3 text-indigo-600" />
                <span>+91 98220 11800</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── Key Specifications Grid ── */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Architectural &amp; Engineering Specifications</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block uppercase">RERA Carpet Area</span>
              <span className="text-base font-black text-slate-900">{property.carpetAreaSqFt} sq.ft</span>
              <span className="text-[10px] text-slate-500 block">100% Usable Carpet</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block uppercase">Configuration</span>
              <span className="text-base font-black text-slate-900">{property.bhk} BHK + {property.bathrooms || 2} Baths</span>
              <span className="text-[10px] text-slate-500 block">{property.furnishing}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block uppercase">Floor Level</span>
              <span className="text-base font-black text-slate-900">Floor {property.floorNumber} / {property.totalFloors}</span>
              <span className="text-[10px] text-slate-500 block">East-Facing Balcony</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block uppercase">Possession</span>
              <span className="text-base font-black text-emerald-700">{property.possessionDate || "Ready to Move"}</span>
              <span className="text-[10px] text-slate-500 block">NMC Sanctioned</span>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-mono font-semibold text-slate-700 uppercase mb-2">Description &amp; Highlights</h4>
            <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Badges */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-mono font-semibold text-slate-700 uppercase mb-2">Exclusive Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono font-medium border border-slate-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Interactive Financial Suite: EMI & MahaRERA Tax Calculator ── */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-indigo-700 font-mono text-xs font-bold uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>Financial Suite</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Home Loan EMI &amp; MahaRERA Tax Breakdown</h3>
              <p className="text-xs text-slate-500 font-mono">
                Real-time computation based on Nagpur NMC Stamp Duty &amp; SBI/HDFC bank lending guidelines.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-right shrink-0">
              <span className="text-[10px] text-slate-400 block uppercase">Calculated Monthly EMI</span>
              <span className="text-2xl font-black text-emerald-400">
                ₹{Math.round(financials.monthlyEmiInr).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-slate-400 block">for {tenureYears} Years @ {interestRate}%</span>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-600">Down Payment ({downPaymentPct}%)</span>
                <span className="text-slate-900">₹{((property.listedPriceInLakhs * downPaymentPct) / 100).toFixed(2)} Lakhs</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Loan Amount: ₹{((property.listedPriceInLakhs * (100 - downPaymentPct)) / 100).toFixed(2)} Lakhs</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-600">Interest Rate</span>
                <span className="text-slate-900">{interestRate}% p.a.</span>
              </div>
              <input
                type="range"
                min={7.5}
                max={12}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">SBI / HDFC benchmark: 8.50%</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-600">Tenure</span>
                <span className="text-slate-900">{tenureYears} Years</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Total installments: {tenureYears * 12} months</span>
            </div>
          </div>

          {/* Statutory Taxes Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] flex items-center justify-between">
              <span>Government Registration &amp; Tax Estimates (Maharashtra)</span>
              <label className="flex items-center gap-1.5 cursor-pointer font-normal text-slate-600">
                <input
                  type="checkbox"
                  checked={isWomanBuyer}
                  onChange={(e) => setIsWomanBuyer(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <span>Woman Buyer (1% Stamp Duty Rebate)</span>
              </label>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Stamp Duty ({financials.stampDutyPercent}%)</span>
                <span className="font-bold text-slate-900">{formatInr(financials.stampDutyInr)}</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Registration Fee</span>
                <span className="font-bold text-slate-900">{formatInr(financials.registrationFeeInr)}</span>
                <span className="text-[9px] text-slate-400 block">(Capped at ₹30k)</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">GST ({financials.gstPercent}%)</span>
                <span className="font-bold text-slate-900">{formatInr(financials.gstInr)}</span>
                <span className="text-[9px] text-slate-400 block">({property.possessionDate === "Ready to Move" ? "0% for Ready" : "5% Under-Const"})</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Net Deal Value (On-Road)</span>
                <span className="font-black text-indigo-700">{formatInr(financials.netOnRoadPriceInr)}</span>
                <span className="text-[9px] text-emerald-600 block font-semibold">+₹{Math.round(financials.totalTaxesAndFeesInr / 100000 * 100) / 100}L in statutory fees</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Locality & Connectivity Landmarks ── */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-600" />
            <span>Nagpur Strategic Infrastructure &amp; Proximity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-0.5">🚇 Nagpur Metro Station</span>
              <p className="text-[11px] text-slate-500">5-8 minutes drive from {property.locality} corridor</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-0.5">✈️ Dr. Babasaheb Ambedkar Airport</span>
              <p className="text-[11px] text-slate-500">12-15 minutes direct via Wardha Road bypass</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-0.5">🏢 MIHAN SEZ &amp; AIIMS Nagpur</span>
              <p className="text-[11px] text-slate-500">15 minutes direct to major IT &amp; Medical facilities</p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs font-mono">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">EQ</div>
            <span className="text-white font-bold">EstateIQ Private Brokerage</span>
            <span>• Nagpur, Maharashtra</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            MahaRERA Certified Advisory • All documents verified under Section 11 of Real Estate (Regulation and Development) Act.
          </p>
        </div>
      </footer>

      {/* ── Branded PDF Brochure Modal ── */}
      <PropertyBrochureModal
        property={property}
        isOpen={isBrochureOpen}
        onClose={() => setIsBrochureOpen(false)}
      />
    </div>
  );
}
