"use client";

import React, { useState } from "react";
import { 
  MarketingCopyParams, 
  generateMarketingCopies, 
  MarketingCopyResult 
} from "@/lib/genAiCopilot";
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  MessageSquare, 
  Building, 
  Instagram, 
  ArrowRight,
  Bot,
  RefreshCw,
  FileText
} from "lucide-react";

interface AiMarketingCopyModalProps {
  params: MarketingCopyParams;
  isOpen: boolean;
  onClose: () => void;
  onApplyDescription?: (text: string) => void;
}

type TabType = "whatsapp" | "seo" | "instagram";

export function AiMarketingCopyModal({
  params,
  isOpen,
  onClose,
  onApplyDescription
}: AiMarketingCopyModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("whatsapp");
  const [copied, setCopied] = useState<boolean>(false);
  const [copies, setCopies] = useState<MarketingCopyResult>(() => generateMarketingCopies(params));
  const [customEdits, setCustomEdits] = useState<Record<TabType, string>>({
    whatsapp: copies.whatsappTeaser,
    seo: copies.seoDescription,
    instagram: copies.instagramCaption
  });

  if (!isOpen) return null;

  const currentText = customEdits[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    const fresh = generateMarketingCopies(params);
    setCopies(fresh);
    setCustomEdits({
      whatsapp: fresh.whatsappTeaser,
      seo: fresh.seoDescription,
      instagram: fresh.instagramCaption
    });
  };

  const handleTestWhatsApp = () => {
    const encoded = encodeURIComponent(currentText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const handleApply = () => {
    if (onApplyDescription) {
      onApplyDescription(currentText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  GenAI Marketing Copywriter Copilot
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-mono font-bold">
                  3 Target Channels
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {params.bhk} BHK • {params.carpetAreaSqFt} sq.ft • {params.locality} • ₹{params.listedPriceInLakhs}L
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRegenerate}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-mono"
              title="Regenerate all variations"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Channel Selector Tabs */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("whatsapp")}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === "whatsapp"
                ? "bg-white text-emerald-700 border-slate-200 border-b-transparent shadow-xs"
                : "text-slate-500 hover:text-slate-800 border-transparent"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Teaser</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
              High CTR
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === "seo"
                ? "bg-white text-blue-700 border-slate-200 border-b-transparent shadow-xs"
                : "text-slate-500 hover:text-slate-800 border-transparent"
            }`}
          >
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>99acres &amp; MagicBricks</span>
            <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold">
              SEO Keywords
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("instagram")}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === "instagram"
                ? "bg-white text-purple-700 border-slate-200 border-b-transparent shadow-xs"
                : "text-slate-500 hover:text-slate-800 border-transparent"
            }`}
          >
            <Instagram className="w-3.5 h-3.5 text-purple-600" />
            <span>Instagram Luxury Reel</span>
            <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-bold">
              Viral Tags
            </span>
          </button>
        </div>

        {/* Modal Workspace / Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {activeTab === "whatsapp" && "Formatted with bold markers, emojis, and urgency call-to-actions"}
                {activeTab === "seo" && "Vastu keywords, RERA compliance, Nagpur landmark connectivity matrix"}
                {activeTab === "instagram" && "Aspirational lifestyle hooks, luxury design accents, local hashtags"}
              </span>
            </span>

            <span>{currentText.length} characters • {currentText.split(/\s+/).length} words</span>
          </div>

          <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
            <textarea
              rows={11}
              value={currentText}
              onChange={(e) => setCustomEdits({ ...customEdits, [activeTab]: e.target.value })}
              className="w-full text-xs font-mono text-slate-800 p-4 bg-transparent border-none rounded-xl leading-relaxed focus:outline-none focus:ring-0 resize-y"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Text"}</span>
            </button>

            <button
              type="button"
              onClick={handleTestWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Broadcast on WhatsApp</span>
            </button>
          </div>

          {onApplyDescription && (
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Apply to Property Description</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

