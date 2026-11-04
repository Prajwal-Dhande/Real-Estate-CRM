"use client";

import React, { useState, useMemo } from "react";
import { Property } from "@/types";
import { 
  calculateFinancialBreakdown, 
  formatInr, 
  formatIndianDenomination 
} from "@/lib/financials";
import { formatCurrencyLakhs } from "@/lib/utils";
import { 
  X, 
  Calculator, 
  Building2, 
  Percent, 
  ShieldCheck, 
  Calendar, 
  Coins, 
  Receipt, 
  Share2, 
  FileDown, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Info
} from "lucide-react";

interface FinancialCalculatorModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onOpenBrochure?: () => void;
}

export function FinancialCalculatorModal({
  property,
  isOpen,
  onClose,
  onOpenBrochure
}: FinancialCalculatorModalProps) {
  // Financial inputs state
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [isWomanBuyer, setIsWomanBuyer] = useState<boolean>(false);
  const [isUnderConstruction, setIsUnderConstruction] = useState<boolean>(
    property.possessionDate !== "Ready to Move" && property.status !== "Sold"
  );

  // Memoized financial breakdown
  const financial = useMemo(() => {
    return calculateFinancialBreakdown({
      propertyPriceInLakhs: property.listedPriceInLakhs,
      downPaymentPercent,
      interestRateAnnual: interestRate,
      tenureYears,
      isWomanBuyer,
      isUnderConstruction,
    });
  }, [
    property.listedPriceInLakhs,
    downPaymentPercent,
    interestRate,
    tenureYears,
    isWomanBuyer,
    isUnderConstruction
  ]);

  if (!isOpen) return null;

  // Share cost sheet on WhatsApp
  const handleShareWhatsApp = () => {
    const text = 
`*ESTATEIQ FINANCIAL COST SHEET*
📍 *${property.title}* (${property.locality}, Nagpur)
📐 ${property.bhk} BHK • ${property.carpetAreaSqFt} sq.ft

*1. Base Agreement Price:* ${formatIndianDenomination(financial.propertyPriceInr)}
*2. Govt. Stamp Duty (${financial.stampDutyPercent}%):* ${formatInr(financial.stampDutyInr)}
*3. Registration Fee (Cap ₹30k):* ${formatInr(financial.registrationFeeInr)}
*4. GST (${financial.gstPercent}%):* ${formatInr(financial.gstInr)}
*5. Legal & Vetting:* ${formatInr(financial.legalAndIncidentalInr)}
━━━━━━━━━━━━━━━━━━
💰 *NET ON-ROAD DEAL VALUE:* ${formatIndianDenomination(financial.netOnRoadPriceInr)}
━━━━━━━━━━━━━━━━━━
🏦 *FINANCING SCENARIO (${financial.downPaymentPercent}% Down, ${tenureYears} Yrs @ ${interestRate}%):*
• Downpayment: ${formatIndianDenomination(financial.downPaymentInr)}
• Upfront Cash Needed: ${formatIndianDenomination(financial.totalInitialCashRequiredInr)}
• Bank Loan: ${formatIndianDenomination(financial.loanAmountInr)}
• *Monthly EMI:* ${formatInr(financial.monthlyEmiInr)} / mo

MahaRERA: ${property.reraNumber || "Verified"}
Shared via EstateIQ Nagpur Real Estate Platform`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Financial Suite &amp; Cost Sheet
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold">
                  MahaRERA &amp; NMC Compliant
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {property.title} • {property.locality}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-mono text-slate-500 block mb-0.5">Base Listed Price</span>
              <span className="text-lg font-black font-mono text-slate-900">
                {formatIndianDenomination(financial.propertyPriceInr)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                Agreement Value
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <span className="text-[11px] font-mono text-indigo-600 block mb-0.5">Monthly Home Loan EMI</span>
              <span className="text-lg font-black font-mono text-indigo-700">
                {formatInr(financial.monthlyEmiInr)}
              </span>
              <span className="text-[10px] text-indigo-500 font-mono block mt-0.5">
                for {tenureYears} yrs @ {interestRate}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[11px] font-mono text-emerald-700 block mb-0.5">Net On-Road Price</span>
              <span className="text-lg font-black font-mono text-emerald-800">
                {formatIndianDenomination(financial.netOnRoadPriceInr)}
              </span>
              <span className="text-[10px] text-emerald-600 font-mono block mt-0.5">
                incl. +{financial.taxImpactPercent}% statutory taxes
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
              <span className="text-[11px] font-mono text-amber-700 block mb-0.5">Upfront Cash Needed</span>
              <span className="text-lg font-black font-mono text-amber-800">
                {formatIndianDenomination(financial.totalInitialCashRequiredInr)}
              </span>
              <span className="text-[10px] text-amber-600 font-mono block mt-0.5">
                Down Payment + Govt Taxes
              </span>
            </div>
          </div>

          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Loan & Financing Sliders (6 Cols) */}
            <div className="lg:col-span-6 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                <h3 className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-indigo-600" />
                  Home Loan &amp; Amortization
                </h3>
                <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200/60">
                  Loan: {formatIndianDenomination(financial.loanAmountInr)}
                </span>
              </div>

              {/* Slider 1: Down Payment */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600">Down Payment ({downPaymentPercent}%):</span>
                  <span className="font-bold text-slate-900">{formatIndianDenomination(financial.downPaymentInr)}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>10% (Min)</span>
                  <span>20% (Standard)</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Slider 2: Interest Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600">Annual Interest Rate:</span>
                  <span className="font-bold text-indigo-600">{interestRate}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="7.0"
                  max="12.0"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>7.0%</span>
                  <span>8.5% (Prime)</span>
                  <span>12.0%</span>
                </div>
              </div>

              {/* Slider 3: Loan Tenure */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600">Loan Tenure:</span>
                  <span className="font-bold text-slate-900">{tenureYears} Years ({financial.totalTenureMonths} Months)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>5 Yrs</span>
                  <span>20 Yrs</span>
                  <span>30 Yrs</span>
                </div>
              </div>

              {/* Principal vs Interest Amortization Bar */}
              <div className="pt-2 border-t border-slate-200/70 space-y-2">
                <div className="flex justify-between text-[11px] font-mono text-slate-600">
                  <span>Total Repayment Over {tenureYears} Yrs:</span>
                  <span className="font-bold text-slate-900">{formatIndianDenomination(financial.totalRepaymentInr)}</span>
                </div>

                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    style={{ width: `${Math.round((financial.loanAmountInr / financial.totalRepaymentInr) * 100)}%` }} 
                    className="bg-indigo-600 h-full"
                    title={`Principal: ${formatInr(financial.loanAmountInr)}`}
                  />
                  <div 
                    style={{ width: `${Math.round((financial.totalInterestPayableInr / financial.totalRepaymentInr) * 100)}%` }} 
                    className="bg-amber-500 h-full"
                    title={`Interest: ${formatInr(financial.totalInterestPayableInr)}`}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    Principal: {formatIndianDenomination(financial.loanAmountInr)}
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Interest: {formatIndianDenomination(financial.totalInterestPayableInr)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Maharashtra Govt Taxes & Net Outlay (6 Cols) */}
            <div className="lg:col-span-6 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                <h3 className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                  Govt. Taxes &amp; On-Road Cost Sheet
                </h3>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                  Nagpur NMC
                </span>
              </div>

              {/* Policy Toggles */}
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isWomanBuyer}
                      onChange={(e) => setIsWomanBuyer(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                    />
                    <div>
                      <span className="text-xs font-bold font-mono text-slate-800 block">
                        Female Buyer Concession (1%)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Maharashtra Government 1% rebate on stamp duty
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isWomanBuyer ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                    {financial.stampDutyPercent}% Duty
                  </span>
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isUnderConstruction}
                      onChange={(e) => setIsUnderConstruction(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                    />
                    <div>
                      <span className="text-xs font-bold font-mono text-slate-800 block">
                        Under-Construction Property (GST Liable)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Ready-to-move with CC/OC is exempt from GST (0%)
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isUnderConstruction ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {financial.gstPercent}% GST
                  </span>
                </label>
              </div>

              {/* Line-by-Line Statutory Table */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden text-xs font-mono divide-y divide-slate-100">
                <div className="flex justify-between items-center px-3 py-2 bg-slate-50/50">
                  <span className="text-slate-600">Base Agreement Price</span>
                  <span className="font-bold text-slate-900">{formatInr(financial.propertyPriceInr)}</span>
                </div>

                <div className="flex justify-between items-center px-3 py-2">
                  <span className="text-slate-600 flex items-center gap-1">
                    Stamp Duty ({financial.stampDutyPercent}%)
                    <span title="5% Stamp Duty + 1% Metro Cess/LBT"><Info className="w-3 h-3 text-slate-400" /></span>
                  </span>
                  <span className="font-semibold text-slate-800">{formatInr(financial.stampDutyInr)}</span>
                </div>

                <div className="flex justify-between items-center px-3 py-2">
                  <span className="text-slate-600 flex items-center gap-1">
                    Registration Fee (1% max ₹30,000)
                    <span title="Maharashtra statutory cap is ₹30,000"><Info className="w-3 h-3 text-slate-400" /></span>
                  </span>
                  <span className="font-semibold text-slate-800">{formatInr(financial.registrationFeeInr)}</span>
                </div>

                <div className="flex justify-between items-center px-3 py-2">
                  <span className="text-slate-600 flex items-center gap-1">
                    GST ({financial.gstPercent}%)
                    {financial.gstPercent === 0 && (
                      <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">EXEMPT</span>
                    )}
                  </span>
                  <span className="font-semibold text-slate-800">{formatInr(financial.gstInr)}</span>
                </div>

                <div className="flex justify-between items-center px-3 py-2">
                  <span className="text-slate-600">Legal Vetting &amp; Documentation</span>
                  <span className="font-semibold text-slate-800">{formatInr(financial.legalAndIncidentalInr)}</span>
                </div>

                <div className="flex justify-between items-center px-3 py-2.5 bg-emerald-50 text-emerald-950 font-bold">
                  <span>Net On-Road Total</span>
                  <span className="text-sm font-black text-emerald-700">{formatInr(financial.netOnRoadPriceInr)}</span>
                </div>
              </div>

              {/* Buyer Cash Flow Hint */}
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2 text-xs text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[11px] font-mono">Bank Loan vs Upfront Cash Strategy:</p>
                  <p className="text-[11px] text-indigo-700 font-mono mt-0.5">
                    Bank will fund <span className="font-bold">{formatIndianDenomination(financial.loanAmountInr)}</span>. 
                    The buyer must arrange <span className="font-bold text-indigo-950">{formatIndianDenomination(financial.totalInitialCashRequiredInr)}</span> as initial capital (Downpayment + Statutory Taxes).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Quick Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-500">
              Live amortization algorithm calibrated for 2026 Nagpur SBI/HDFC lending benchmarks
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBrochure && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBrochure();
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold font-mono flex items-center gap-2 transition-all shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-600" />
                Client Brochure (PDF)
              </button>
            )}

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono flex items-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
