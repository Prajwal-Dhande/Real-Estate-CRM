"use client";

import React, { useState } from "react";
import { Property, PredictPriceResult } from "@/types";
import { createProperty, predictPrice } from "@/lib/api";
import { formatCurrencyLakhs } from "@/lib/utils";
import { X, Building2, Calculator, Check, Cpu } from "lucide-react";

interface NewPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyCreated: (prop: Property) => void;
}

const LOCALITIES = [
  { name: "Vasudev Nagar", lat: 21.1245, lng: 79.0342 },
  { name: "Dharampeth", lat: 21.1418, lng: 79.0682 },
  { name: "MIHAN", lat: 21.0543, lng: 79.0621 },
  { name: "Manish Nagar", lat: 21.0921, lng: 79.0784 },
  { name: "Civil Lines", lat: 21.1534, lng: 79.0729 },
  { name: "Wardha Road", lat: 21.0823, lng: 79.0712 },
  { name: "Hingna", lat: 21.0967, lng: 78.9875 },
  { name: "Sadar", lat: 21.1621, lng: 79.0812 },
  { name: "Laxmi Nagar", lat: 21.1214, lng: 79.0645 },
  { name: "Trimurti Nagar", lat: 21.1182, lng: 79.0432 }
];

const AVAILABLE_AMENITIES = [
  "Parking",
  "Gym",
  "Metro Proximity",
  "Power Backup",
  "Clubhouse",
  "Lift",
  "Security",
  "Swimming Pool",
  "Private Garden"
];

export function NewPropertyModal({ isOpen, onClose, onPropertyCreated }: NewPropertyModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locality, setLocality] = useState("Vasudev Nagar");
  const [address, setAddress] = useState("");
  const [carpetAreaSqFt, setCarpetAreaSqFt] = useState<number>(1200);
  const [bhk, setBhk] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [floorNumber, setFloorNumber] = useState<number>(3);
  const [totalFloors, setTotalFloors] = useState<number>(8);
  const [furnishing, setFurnishing] = useState<Property["furnishing"]>("Semi-Furnished");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(["Parking", "Power Backup"]);
  const [listedPriceInLakhs, setListedPriceInLakhs] = useState<number>(75);
  
  // AI Valuation State
  const [estimating, setEstimating] = useState<boolean>(false);
  const [aiValuation, setAiValuation] = useState<PredictPriceResult | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleAmenity = (name: string) => {
    setSelectedAmenities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const handleFetchAiValuation = async () => {
    setEstimating(true);
    try {
      const result = await predictPrice({
        locality,
        carpetAreaSqFt: Number(carpetAreaSqFt),
        bhk: Number(bhk),
        bathrooms: Number(bathrooms),
        floorNumber: Number(floorNumber),
        totalFloors: Number(totalFloors),
        furnishing,
        amenitiesCount: selectedAmenities.length
      });
      setAiValuation(result);
    } catch (err: any) {
      alert("Failed to compute live valuation: " + err.message);
    } finally {
      setEstimating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locality) return;

    setSubmitting(true);
    try {
      const locObj = LOCALITIES.find(l => l.name === locality) || LOCALITIES[0];

      const created = await createProperty({
        title,
        description,
        locality,
        address: address || `${locality}, Nagpur`,
        coordinates: { lat: locObj.lat, lng: locObj.lng },
        carpetAreaSqFt: Number(carpetAreaSqFt),
        bhk: Number(bhk),
        bathrooms: Number(bathrooms),
        floorNumber: Number(floorNumber),
        totalFloors: Number(totalFloors),
        furnishing,
        amenities: selectedAmenities,
        listedPriceInLakhs: Number(listedPriceInLakhs),
        aiEstimatedPriceInLakhs: aiValuation?.estimatedPriceInLakhs || listedPriceInLakhs,
        valuationConfidence: aiValuation?.confidenceScore || 0.88,
        status: "Available"
      });

      onPropertyCreated(created);
      onClose();
    } catch (err: any) {
      alert("Failed to save property: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#0F172A] text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-sm font-mono tracking-tight text-white">List New Property</h3>
            <p className="text-[11px] text-slate-400">Includes live XGBoost fair market price evaluation</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Title & Locality */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Property Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Modern 3BHK East-Facing Apartment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50/70"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Locality (Nagpur) *</label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full text-xs font-mono p-2 border border-slate-200 rounded-md bg-white"
              >
                {LOCALITIES.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Address / Landmark</label>
            <input
              type="text"
              placeholder="e.g. Plot 15, Near Metro Pillar 44, Vasudev Nagar"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs font-mono p-2 border border-slate-200 rounded-md bg-slate-50/70"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Description *</label>
            <textarea
              required
              rows={2}
              placeholder="Spacious apartment with modular kitchen, private balcony, and covered parking..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50/70"
            />
          </div>

          {/* Area, BHK, Floors */}
          <div className="grid grid-cols-4 gap-3 font-mono">
            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">Carpet (sq.ft)</label>
              <input
                type="number"
                min={300}
                max={5000}
                value={carpetAreaSqFt}
                onChange={(e) => setCarpetAreaSqFt(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-200 rounded-md bg-slate-50/70"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">BHK</label>
              <select
                value={bhk}
                onChange={(e) => setBhk(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-200 rounded-md bg-white"
              >
                <option value={1}>1 BHK</option>
                <option value={2}>2 BHK</option>
                <option value={3}>3 BHK</option>
                <option value={4}>4 BHK</option>
                <option value={5}>5 BHK</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">Floor</label>
              <input
                type="number"
                min={0}
                value={floorNumber}
                onChange={(e) => setFloorNumber(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-200 rounded-md bg-slate-50/70"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">Total Floors</label>
              <input
                type="number"
                min={1}
                value={totalFloors}
                onChange={(e) => setTotalFloors(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-200 rounded-md bg-slate-50/70"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Furnishing</label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value as any)}
                className="w-full text-xs font-mono p-2 border border-slate-200 rounded-md bg-white"
              >
                <option value="Unfurnished">Unfurnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully-Furnished">Fully-Furnished</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Listed Price (₹ in Lakhs) *</label>
              <input
                type="number"
                step="0.5"
                min={5}
                required
                value={listedPriceInLakhs}
                onChange={(e) => setListedPriceInLakhs(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold text-slate-900 p-2 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50/70"
              />
            </div>
          </div>

          {/* Amenities Pills */}
          <div>
            <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1.5">Amenities</label>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const selected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-2 py-0.5 rounded border transition-colors ${
                      selected
                        ? "bg-slate-900 text-white border-slate-900 font-medium"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LIVE AI VALUATION SECTION */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Valuation Telemetry</span>
              </div>

              <button
                type="button"
                onClick={handleFetchAiValuation}
                disabled={estimating}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Calculator className="w-3 h-3 text-slate-500" />
                {estimating ? "Estimating..." : "Evaluate Price with ML"}
              </button>
            </div>

            {aiValuation ? (
              <div className="p-3 bg-white rounded-md border border-slate-200 space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider">AI Fair Market Value</span>
                    <span className="text-base font-bold text-slate-900">
                      ₹{aiValuation.estimatedPriceInLakhs.toFixed(2)} Lakhs
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Spread (Conf: {Math.round(aiValuation.confidenceScore * 100)}%)</span>
                    <span className="text-xs font-semibold text-slate-700">
                      ₹{aiValuation.priceRangeMin} L - ₹{aiValuation.priceRangeMax} L
                    </span>
                  </div>
                </div>

                {/* Ratio comparison */}
                {listedPriceInLakhs && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Listed vs AI:</span>
                    {listedPriceInLakhs < aiValuation.estimatedPriceInLakhs * 0.95 ? (
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Undervalued by ₹{(aiValuation.estimatedPriceInLakhs - listedPriceInLakhs).toFixed(2)} L (High Demand)
                      </span>
                    ) : listedPriceInLakhs > aiValuation.estimatedPriceInLakhs * 1.05 ? (
                      <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        Overpriced by ₹{(listedPriceInLakhs - aiValuation.estimatedPriceInLakhs).toFixed(2)} L (High Price)
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        Fair Market Valuation (±5%)
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Click &ldquo;Evaluate Price with ML&rdquo; to benchmark listed price against XGBoost regression models for {locality}.
              </p>
            )}
          </div>

          {/* Footer Submit */}
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
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{submitting ? "Saving..." : "Save Property"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
