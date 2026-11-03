"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { predictPrice } from "@/lib/api";
import { PredictPriceResult } from "@/types";
import { formatCurrencyLakhs } from "@/lib/utils";
import { 
  BrainCircuit, 
  Sparkles, 
  Calculator, 
  MapPin, 
  BedDouble, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle,
  HelpCircle,
  Cpu,
  BarChart3,
  Sliders
} from "lucide-react";

const LOCALITY_DATA = [
  { name: "Vasudev Nagar", base: "₹5,200 / sq ft", mult: "+10% Metro Corridor" },
  { name: "Dharampeth", base: "₹7,800 / sq ft", mult: "+25% Prime Central" },
  { name: "MIHAN", base: "₹4,500 / sq ft", mult: "+5% IT Corridor" },
  { name: "Manish Nagar", base: "₹5,800 / sq ft", mult: "+12% High Growth" },
  { name: "Civil Lines", base: "₹9,000 / sq ft", mult: "+35% Premium VIP" },
  { name: "Sadar", base: "₹8,500 / sq ft", mult: "+30% Commercial Heritage" },
  { name: "Wardha Road", base: "₹4,000 / sq ft", mult: "Baseline Median" },
  { name: "Hingna", base: "₹3,200 / sq ft", mult: "Industrial Hub" },
  { name: "Laxmi Nagar", base: "₹6,000 / sq ft", mult: "+15% South Nagpur" },
  { name: "Trimurti Nagar", base: "₹5,500 / sq ft", mult: "+8% Residential" }
];

export default function ValuationSandboxPage() {
  const [locality, setLocality] = useState("Vasudev Nagar");
  const [carpetAreaSqFt, setCarpetAreaSqFt] = useState<number>(1200);
  const [bhk, setBhk] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [floorNumber, setFloorNumber] = useState<number>(4);
  const [totalFloors, setTotalFloors] = useState<number>(10);
  const [furnishing, setFurnishing] = useState("Semi-Furnished");
  const [amenitiesCount, setAmenitiesCount] = useState<number>(4);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictPriceResult>({
    estimatedPriceInLakhs: 73.67,
    priceRangeMin: 67.78,
    priceRangeMax: 79.56,
    confidenceScore: 0.88
  });

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await predictPrice({
        locality,
        carpetAreaSqFt: Number(carpetAreaSqFt),
        bhk: Number(bhk),
        bathrooms: Number(bathrooms),
        floorNumber: Number(floorNumber),
        totalFloors: Number(totalFloors),
        furnishing,
        amenitiesCount: Number(amenitiesCount)
      });
      setResult(res);
    } catch (err: any) {
      alert("Valuation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
      <Header
        title="AI Valuation Sandbox"
        subtitle="Interactive Regression Ensemble Pipeline (XGBoost + RandomForest)"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 text-slate-800 rounded-md">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">
                    Model Input Vectors
                  </h2>
                  <p className="text-[11px] text-slate-500">Tune spatial and structural parameters to evaluate marginal price sensitivity</p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                Port 8001
              </span>
            </div>

            <div className="space-y-4">
              {/* Locality Selector */}
              <div>
                <label className="text-[11px] font-mono font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" /> Locality (Nagpur Sub-market)
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full text-xs font-mono p-2 border border-slate-200 rounded-md bg-slate-50/70 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white"
                >
                  {LOCALITY_DATA.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name} — {loc.base} ({loc.mult})
                    </option>
                  ))}
                </select>
              </div>

              {/* Carpet Area Slider + Input */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs font-mono">
                  <label className="font-semibold text-slate-700">Carpet Area</label>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {carpetAreaSqFt} sq.ft
                  </span>
                </div>
                <input
                  type="range"
                  min={400}
                  max={4500}
                  step={50}
                  value={carpetAreaSqFt}
                  onChange={(e) => setCarpetAreaSqFt(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>400 sq.ft (Studio/1BHK)</span>
                  <span>4,500 sq.ft (Luxury Penthouse)</span>
                </div>
              </div>

              {/* BHK & Bathrooms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono font-semibold text-slate-700 block mb-1">BHK Configuration</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBhk(num)}
                        className={`flex-1 py-1.5 text-xs font-mono font-semibold rounded-md border transition-colors ${
                          bhk === num
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {num}B
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-semibold text-slate-700 block mb-1">Bathrooms</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBathrooms(num)}
                        className={`flex-1 py-1.5 text-xs font-mono font-semibold rounded-md border transition-colors ${
                          bathrooms === num
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floors & Total Floors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono font-semibold text-slate-700 block mb-1">Floor Level</label>
                  <input
                    type="number"
                    min={0}
                    max={totalFloors}
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(Number(e.target.value))}
                    className="w-full text-xs font-mono p-2 border border-slate-200 rounded-md bg-slate-50/70"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-semibold text-slate-700 block mb-1">Total Floors in Wing</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={totalFloors}
                    onChange={(e) => setTotalFloors(Number(e.target.value))}
                    className="w-full text-xs font-mono p-2 border border-slate-200 rounded-md bg-slate-50/70"
                  />
                </div>
              </div>

              {/* Furnishing */}
              <div>
                <label className="text-[11px] font-mono font-semibold text-slate-700 block mb-1">Furnishing Specification</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Unfurnished", "Semi-Furnished", "Fully-Furnished"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFurnishing(f)}
                      className={`py-1.5 text-xs font-mono font-semibold rounded-md border transition-colors ${
                        furnishing === f
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities Count Slider */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs font-mono">
                  <label className="font-semibold text-slate-700">Premium Amenities ({amenitiesCount}/8)</label>
                  <span className="text-slate-400 text-[11px]">Gym, Covered Parking, Power Backup, Club</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={8}
                  value={amenitiesCount}
                  onChange={(e) => setAmenitiesCount(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handlePredict}
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-mono font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors disabled:opacity-50"
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                {loading ? "Computing Regression Ensemble..." : "Execute ML Valuation"}
              </button>
            </div>
          </div>

          {/* Output Card Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Main Valuation Result Card */}
            <div className="bg-[#0F172A] p-6 rounded-lg text-white shadow-lg border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  Ensemble Valuation Output
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                  Confidence {Math.round(result.confidenceScore * 100)}%
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">Estimated Fair Market Value</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-white tracking-tight">
                    ₹{result.estimatedPriceInLakhs.toFixed(2)}
                  </span>
                  <span className="text-sm font-mono text-emerald-400">Lakhs</span>
                </div>
                <p className="text-xs font-mono text-slate-400 pt-0.5">
                  Implied Rate: ₹{Math.round((result.estimatedPriceInLakhs * 100000) / carpetAreaSqFt).toLocaleString("en-IN")} / sq.ft
                </p>
              </div>

              {/* Confidence Price Range */}
              <div className="p-3.5 rounded-md bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  <span>Confidence Interval Spread</span>
                  <span className="text-slate-400 text-[10px]">±8% standard dev</span>
                </div>
                <div className="flex items-center justify-between text-sm font-mono font-bold text-slate-200">
                  <span>₹{result.priceRangeMin} L</span>
                  <span className="text-slate-500 text-xs font-normal">to</span>
                  <span>₹{result.priceRangeMax} L</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>

              {/* Model Features Log */}
              <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3 font-mono text-[11px]">
                <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Pricing Factors Applied:</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Sub-market baseline multiplier for {locality}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Floor {floorNumber} vertical view adjustment (+{(floorNumber * 0.3).toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{furnishing} fit-out capital expenditure factor</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{amenitiesCount} amenities infrastructure index</span>
                </div>
              </div>
            </div>

            {/* Architecture Info Card */}
            <div className="bg-white p-4 rounded-lg border border-slate-200/90 shadow-2xs space-y-2 text-xs text-slate-600">
              <h4 className="font-semibold text-slate-900 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Redis Cache Layer
              </h4>
              <p className="leading-relaxed">
                Valuation requests are cached with key <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">valuation:{locality.toLowerCase()}:{bhk}:{carpetAreaSqFt}</code> for 24 hours. Duplicate queries bypass ML compute with sub-millisecond response times.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
