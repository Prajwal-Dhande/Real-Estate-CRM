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
  HelpCircle
} from "lucide-react";

const LOCALITY_DATA = [
  { name: "Vasudev Nagar", base: "₹5,200 / sq ft", mult: "+10% Metro Corridor" },
  { name: "Dharampeth", base: "₹7,800 / sq ft", mult: "+25% Prime Central" },
  { name: "MIHAN", base: "₹4,500 / sq ft", mult: "+5% IT Corridor" },
  { name: "Manish Nagar", base: "₹5,800 / sq ft", mult: "+12% High Growth" },
  { name: "Civil Lines", base: "₹9,000 / sq ft", mult: "+35% Premium VIP" },
  { name: "Sadar", base: "₹8,500 / sq ft", mult: "+30% Heritage Commercial" },
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <Header
        title="AI Valuation Sandbox"
        subtitle="Interactive property pricing simulator powered by XGBoost & RandomForest ensemble"
      />

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Feature Parameters</h2>
                  <p className="text-xs text-slate-500">Tune property variables to observe valuation impact</p>
                </div>
              </div>

              <span className="text-[11px] font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
                Port 8000 Engine
              </span>
            </div>

            <div className="space-y-4">
              {/* Locality Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Locality (Nagpur Sub-market)
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full text-xs font-semibold p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500"
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
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <label className="font-bold text-slate-700">Carpet Area: {carpetAreaSqFt} sq ft</label>
                  <span className="text-slate-400 font-medium">({(carpetAreaSqFt / 10.764).toFixed(1)} sq m)</span>
                </div>
                <input
                  type="range"
                  min={350}
                  max={3500}
                  step={25}
                  value={carpetAreaSqFt}
                  onChange={(e) => setCarpetAreaSqFt(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* BHK and Bathrooms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                    <BedDouble className="w-3.5 h-3.5 text-indigo-500" /> Bedrooms (BHK)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBhk(num)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                          bhk === num
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Bathrooms</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBathrooms(num)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                          bathrooms === num
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
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
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Floor Level</label>
                  <input
                    type="number"
                    min={0}
                    max={totalFloors}
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(Number(e.target.value))}
                    className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Total Building Floors</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={totalFloors}
                    onChange={(e) => setTotalFloors(Number(e.target.value))}
                    className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Furnishing */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Furnishing Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Unfurnished", "Semi-Furnished", "Fully-Furnished"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFurnishing(f)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        furnishing === f
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
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
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <label className="font-bold text-slate-700">Amenities Count: {amenitiesCount}</label>
                  <span className="text-slate-400 font-medium">Gym, Parking, Power Backup, etc.</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={8}
                  value={amenitiesCount}
                  onChange={(e) => setAmenitiesCount(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handlePredict}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all hover:scale-101 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {loading ? "Evaluating Ensemble Pipeline..." : "Calculate AI Fair Valuation"}
              </button>
            </div>
          </div>

          {/* Output Card Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Main Valuation Result Card */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-7 rounded-2xl text-white shadow-xl border border-indigo-500/20 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Ensemble ML Estimate
                </span>
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Confidence {Math.round(result.confidenceScore * 100)}%
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400">Predicted Market Value</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    ₹{result.estimatedPriceInLakhs.toFixed(2)}
                  </span>
                  <span className="text-lg font-semibold text-indigo-300">Lakhs</span>
                </div>
                <p className="text-xs text-slate-400 pt-1">
                  Rate approx ₹{Math.round((result.estimatedPriceInLakhs * 100000) / carpetAreaSqFt)} / sq ft
                </p>
              </div>

              {/* Confidence Price Range */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Confidence Interval Range</span>
                  <span className="font-bold text-white">±8% market spread</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-slate-200">
                  <span>₹{result.priceRangeMin} L</span>
                  <span className="text-slate-500 text-xs">to</span>
                  <span>₹{result.priceRangeMax} L</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full w-full" />
                </div>
              </div>

              {/* Model Features Log */}
              <div className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-4">
                <span className="font-bold text-white block">Key Factors Influencing Price:</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Locality multiplier for {locality} applied</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Floor level {floorNumber} premium (+{(floorNumber * 0.3).toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{furnishing} status premium included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{amenitiesCount} amenities factor added</span>
                </div>
              </div>
            </div>

            {/* Architecture Info Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs text-slate-600">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Dual-Tier Caching & Fallback
              </h4>
              <p className="leading-relaxed">
                Valuation requests are cached in Redis under <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">valuation:{locality.toLowerCase()}:{bhk}:{carpetAreaSqFt}</code> with 24-hour TTL. Sub-millisecond repeat queries reduce AI compute overhead.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

