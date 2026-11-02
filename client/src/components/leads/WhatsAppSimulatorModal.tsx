"use client";

import React, { useState } from "react";
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  X, 
  CheckCircle2, 
  MapPin, 
  Flame, 
  Building2, 
  Bot, 
  Smartphone,
  Phone,
  ArrowRight
} from "lucide-react";
import { simulateWhatsAppMessage } from "@/lib/api";
import { Lead } from "@/types";

interface WhatsAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadIngested: (lead: Lead) => void;
}

const PRESET_MESSAGES = [
  {
    title: "3BHK in Manish Nagar (75L)",
    name: "Amit Sharma",
    phone: "+91 98230 44551",
    message: "Need 3BHK in Manish Nagar budget around 75L. East facing preferred with car parking."
  },
  {
    title: "4BHK Luxury Villa in Dharampeth (2.2 Cr)",
    name: "Dr. Sanjay Deshpande",
    phone: "+91 99700 88992",
    message: "Looking for luxury 4BHK villa in Dharampeth under 2.2 Cr with private garden."
  },
  {
    title: "2BHK near Metro in Vasudev Nagar (55L)",
    name: "Pooja Kulkarni",
    phone: "+91 94221 66773",
    message: "Hi, need 2 BHK flat near metro station in Vasudev Nagar under 60 Lakhs."
  },
  {
    title: "2BHK in MIHAN IT Corridor (48L)",
    name: "Nikhil Joshi",
    phone: "+91 97654 33221",
    message: "Looking for modern 2BHK close to IT companies in MIHAN, budget 45L to 50L."
  }
];

export function WhatsAppSimulatorModal({ isOpen, onClose, onLeadIngested }: WhatsAppSimulatorModalProps) {
  const [senderName, setSenderName] = useState("Amit Sharma");
  const [senderPhone, setSenderPhone] = useState("+91 98230 44551");
  const [messageText, setMessageText] = useState("Need 3BHK in Manish Nagar budget around 75L");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_MESSAGES[0]) => {
    setSenderName(preset.name);
    setSenderPhone(preset.phone);
    setMessageText(preset.message);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !senderPhone.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await simulateWhatsAppMessage({
        name: senderName,
        phone: senderPhone,
        message: messageText
      });

      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.lead) {
          onLeadIngested(res.data.lead);
        }
      }
    } catch (err: any) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal WhatsApp-Themed Header */}
        <div className="px-5 py-4 bg-[#075E54] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Meta WhatsApp Cloud API Webhook</h3>
                <span className="text-[10px] font-mono bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded border border-emerald-400/30 font-semibold">
                  Live Ingestion
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80">
                Simulate inbound buyer chat & watch autonomous NLP ingestion + AI scoring in real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-600/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200 text-xs">
          
          {/* Quick Preset Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" /> Quick Real Estate Presets (1-Click Test)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_MESSAGES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 hover:border-emerald-500/50 text-left transition-all group"
                >
                  <p className="text-[11px] font-semibold text-slate-200 group-hover:text-emerald-300 truncate">
                    {p.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{p.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300">Buyer Full Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" /> WhatsApp Phone Number
                </label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+91 98230 XXXXX"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-300">
                Incoming Message Body (Natural Language Requirement)
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={2}
                placeholder="e.g. Need 3BHK in Manish Nagar budget around 75L"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950 font-mono"
            >
              {loading ? (
                <span>AI Ingesting & Scoring...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inbound WhatsApp Webhook (POST /api/webhook/whatsapp)</span>
                </>
              )}
            </button>
          </form>

          {/* Results Display */}
          {result && (
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {result.isNew ? "New Lead Auto-Created & Scored" : "Existing Lead Interaction Logged"}
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  AI SCORE: {result.lead?.aiScore} PTS • {result.lead?.aiPriorityTag}
                </span>
              </div>

              {/* Extracted Details Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Extracted BHK:</span>
                  <strong className="text-white">{result.lead?.desiredBhk} BHK</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Locality:</span>
                  <strong className="text-emerald-400 truncate block">
                    {result.lead?.preferredLocalities?.[0] || "Nagpur"}
                  </strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Budget:</span>
                  <strong className="text-white">
                    ₹{result.lead?.budgetMinInLakhs}L - ₹{result.lead?.budgetMaxInLakhs}L
                  </strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Stage:</span>
                  <strong className="text-blue-400">{result.lead?.pipelineStage}</strong>
                </div>
              </div>

              {/* AI Score Factors */}
              {result.lead?.aiScoreFactors && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    AI Scoring Factors:
                  </span>
                  <div className="space-y-0.5">
                    {result.lead.aiScoreFactors.map((f: string, i: number) => (
                      <p key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        {f}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Outgoing Auto-Reply Preview */}
              {result.autoReply && (
                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Bot className="w-3 h-3" /> Autonomous WhatsApp Auto-Reply (Sent to Buyer):
                    </span>
                    <span>Meta Cloud API</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#005c4b]/30 border border-[#005c4b] text-[11px] text-emerald-100 font-mono whitespace-pre-wrap leading-relaxed">
                    {result.autoReply}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
            Meta WhatsApp Webhook Endpoint: <code className="text-emerald-400">/api/webhook/whatsapp</code>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
