"use client";

import React, { useState } from "react";
import { Lead } from "@/types";
import { createLead } from "@/lib/api";
import { X, Sparkles, Plus } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Add New Lead</h3>
              <p className="text-xs text-slate-400">Triggers AI scoring & semantic matching</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patil"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                placeholder="ramesh@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full text-xs p-2.5 border rounded-lg bg-white"
              >
                <option value="Website">Website</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Referral">Referral</option>
                <option value="PropertyPortal">Property Portal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Desired BHK</label>
              <select
                value={desiredBhk}
                onChange={(e) => setDesiredBhk(Number(e.target.value))}
                className="w-full text-xs p-2.5 border rounded-lg bg-white"
              >
                <option value={1}>1 BHK</option>
                <option value={2}>2 BHK</option>
                <option value={3}>3 BHK</option>
                <option value={4}>4 BHK</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Min Budget (L)</label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                className="w-full text-xs p-2.5 border rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Max Budget (L)</label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full text-xs p-2.5 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Locality</label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full text-xs p-2.5 border rounded-lg bg-white"
            >
              <option value="Vasudev Nagar">Vasudev Nagar</option>
              <option value="Dharampeth">Dharampeth</option>
              <option value="MIHAN">MIHAN</option>
              <option value="Manish Nagar">Manish Nagar</option>
              <option value="Civil Lines">Civil Lines</option>
              <option value="Wardha Road">Wardha Road</option>
              <option value="Hingna">Hingna</option>
              <option value="Sadar">Sadar</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Raw Requirement Text *</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Need 3BHK flat near metro station in Vasudev Nagar with covered car parking under 85 Lakhs."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {submitting ? "Analyzing & Saving..." : "Save & Score Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

