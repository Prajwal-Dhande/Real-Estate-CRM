"use client";

import React, { useState } from "react";
import { Lead } from "@/types";
import { createLead } from "@/lib/api";
import { X, Plus, Cpu } from "lucide-react";

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: (lead: Lead) => void;
}

export function NewLeadModal({ isOpen, onClose, onLeadCreated }: NewLeadModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState<Lead["source"]>("Website");
  const [desiredBhk, setDesiredBhk] = useState<number>(3);
  const [budgetMin, setBudgetMin] = useState<number>(60);
  const [budgetMax, setBudgetMax] = useState<number>(85);
  const [locality, setLocality] = useState("Vasudev Nagar");
  const [rawText, setRawText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !rawText) return;

    setSubmitting(true);
    try {
      const created = await createLead({
        fullName,
        phone,
        email: email || undefined,
        source,
        desiredBhk: Number(desiredBhk),
        budgetMinInLakhs: Number(budgetMin),
        budgetMaxInLakhs: Number(budgetMax),
        preferredLocalities: [locality],
        rawRequirementText: rawText,
        pipelineStage: "New Inquiry"
      });

      onLeadCreated(created);
      onClose();
      // Reset form
      setFullName("");
      setPhone("");
      setEmail("");
      setRawText("");
    } catch (err: any) {
      alert(`Failed to create lead: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-sm font-mono tracking-tight text-white">Create Buyer Lead</h3>
            <p className="text-[11px] text-slate-400">Triggers live conversion scoring & semantic vector matching</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Ramesh Patil"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50/70"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-mono p-2 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50/70"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                placeholder="client@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-md bg-slate-50/70"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Inquiry Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full text-xs font-mono p-2 border border-slate-200 rounded-md bg-white"
              >
                <option value="Website">Website</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Referral">Referral</option>
                <option value="PropertyPortal">Property Portal (99acres/MagicBricks)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">BHK</label>
              <select
                value={desiredBhk}
                onChange={(e) => setDesiredBhk(Number(e.target.value))}
                className="w-full text-xs font-mono p-2 border border-slate-200 rounded-md bg-white"
              >
                {[1, 2, 3, 4, 5].map((b) => (
                  <option key={b} value={b}>
                    {b} BHK
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Min Budget (L)</label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                className="w-full text-xs font-mono p-2 border border-slate-200 rounded-md bg-slate-50/70"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Max Budget (L)</label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full text-xs font-mono p-2 border border-slate-200 rounded-md bg-slate-50/70"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Target Locality</label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full text-xs font-mono p-2 border border-slate-200 rounded-md bg-white"
            >
              <option value="Vasudev Nagar">Vasudev Nagar</option>
              <option value="Dharampeth">Dharampeth</option>
              <option value="MIHAN">MIHAN</option>
              <option value="Manish Nagar">Manish Nagar</option>
              <option value="Trimurti Nagar">Trimurti Nagar</option>
              <option value="Civil Lines">Civil Lines</option>
              <option value="Wardha Road">Wardha Road</option>
              <option value="Sadar">Sadar</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Requirement Notes *</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Need 3BHK flat near metro station in Vasudev Nagar with covered parking under 85L."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50/70"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs disabled:opacity-50 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>{submitting ? "Scoring..." : "Save & Score Lead"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
