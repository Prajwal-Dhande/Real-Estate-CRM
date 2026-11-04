"use client";

import React, { useState } from "react";
import { Property, PredictPriceResult } from "@/types";
import { createProperty, predictPrice, uploadPropertyDocument, uploadPropertyImages } from "@/lib/api";
import { formatCurrencyLakhs } from "@/lib/utils";
import { AiMarketingCopyModal } from "@/components/properties/AiMarketingCopyModal";
import { 
  X, 
  Building2, 
  Calculator, 
  Check, 
  Cpu, 
  ShieldCheck, 
  FileText, 
  Compass, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Eye,
  Download,
  Bot,
  ImagePlus,
  Trash2,
  Star,
  Image as ImageIcon
} from "lucide-react";

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

const PRESET_BUILDERS = [
  "Kukreja Infrastructures",
  "Godrej Properties Anandam",
  "Moraj Group Nagpur",
  "Sandesh City Projects",
  "Apex Landmark Developers",
  "Rachana Construction"
];

const PRESET_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
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

  // Priority 3: RERA, Documents & Floor Plan State
  const [builderName, setBuilderName] = useState("Kukreja Infrastructures");
  const [reraNumber, setReraNumber] = useState("P50500028192");
  const [possessionDate, setPossessionDate] = useState("Ready to Move");
  const [floorPlanUrl, setFloorPlanUrl] = useState<string>("");
  const [brochureUrl, setBrochureUrl] = useState<string>("https://maharera.mahaonline.gov.in");
  const [images, setImages] = useState<string[]>([PRESET_IMAGES[0], PRESET_IMAGES[1]]);
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const [showBlueprintPreview, setShowBlueprintPreview] = useState<boolean>(false);
  
  // AI Valuation State
  const [estimating, setEstimating] = useState<boolean>(false);
  const [aiValuation, setAiValuation] = useState<PredictPriceResult | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // GenAI Marketing Copywriter State
  const [isAiCopyModalOpen, setIsAiCopyModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  // Real-time MahaRERA validation regex: P followed by 9 to 12 digits
  const isReraValid = /^P\d{9,12}$/i.test(reraNumber.trim());

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: "floorPlan" | "brochure") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      // Read as data URL
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const res = await uploadPropertyDocument(base64Data, fileType, file.name);
        if (fileType === "floorPlan") {
          setFloorPlanUrl(res.data.url);
        } else {
          setBrochureUrl(res.data.url);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert("File upload failed: " + err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const currentFloorPlan = floorPlanUrl || `/api/properties/blueprint/sample?bhk=${bhk}&carpetAreaSqFt=${carpetAreaSqFt}`;

  // Drag & Drop / Multi-file Photo Upload Handler (Cloudinary / Local Server)
  const handlePhotoUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploadingImages(true);
    try {
      const filesToProcess: { file: string; fileName: string }[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        filesToProcess.push({ file: base64, fileName: file.name });
      }

      const uploaded = await uploadPropertyImages(filesToProcess);
      const newUrls = uploaded.map((u) => u.url);
      setImages((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      alert("Photo upload error: " + err.message);
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCoverPhoto = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
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
        status: "Available",
        builderName: builderName || "Nagpur Premier Estates",
        reraNumber: reraNumber.trim(),
        isReraVerified: isReraValid,
        possessionDate: possessionDate || "Ready to Move",
        floorPlanUrl: currentFloorPlan,
        brochureUrl: brochureUrl || "https://maharera.mahaonline.gov.in",
        images: images.length > 0 ? images : [PRESET_IMAGES[0]]
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
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-[#0B132B] text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm font-sans tracking-tight text-white">List New Property</h3>
              <p className="text-[11px] text-slate-400 font-mono">MahaRERA Verification • Architectural Blueprints • AI Valuation</p>
            </div>
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
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50/70"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Locality (Nagpur) *</label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full text-xs font-mono p-2.5 border border-slate-200 rounded-lg bg-white"
              >
                {LOCALITIES.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Builder & MahaRERA Registration (Priority 3) */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                MahaRERA &amp; Builder Credentials
              </span>
              {isReraValid ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified MahaRERA Format
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertCircle className="w-3 h-3 text-amber-600" /> Enter Valid RERA (e.g. P50500028192)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Builder / Developer Name</label>
                <input
                  type="text"
                  list="builder-presets"
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value)}
                  placeholder="e.g. Kukreja Infrastructures"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                />
                <datalist id="builder-presets">
                  {PRESET_BUILDERS.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">MahaRERA Registration Number</label>
                <input
                  type="text"
                  value={reraNumber}
                  onChange={(e) => setReraNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. P50500028192"
                  className={`w-full text-xs font-mono p-2 border rounded-lg uppercase ${
                    isReraValid
                      ? "border-emerald-300 bg-emerald-50/30 text-emerald-900"
                      : "border-slate-200 bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Possession Timeline */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Possession Timeline</label>
                <select
                  value={possessionDate}
                  onChange={(e) => setPossessionDate(e.target.value)}
                  className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Ready to Move">Ready to Move</option>
                  <option value="Dec 2025">Dec 2025</option>
                  <option value="March 2026">March 2026</option>
                  <option value="June 2026">June 2026</option>
                  <option value="Dec 2026">Dec 2026</option>
                  <option value="Dec 2027">Dec 2027 (Under Construction)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Official Project Brochure Link</label>
                <input
                  type="text"
                  value={brochureUrl}
                  onChange={(e) => setBrochureUrl(e.target.value)}
                  placeholder="https://maharera.mahaonline.gov.in/..."
                  className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Architectural Blueprint & Documents Upload (Priority 3) */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                Floor Plan Blueprint &amp; CAD Layout
              </span>
              <button
                type="button"
                onClick={() => setShowBlueprintPreview(!showBlueprintPreview)}
                className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3 h-3" />
                {showBlueprintPreview ? "Hide Preview" : "Preview CAD Blueprint"}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 block mb-1">CAD Blueprint SVG / URL</label>
                <input
                  type="text"
                  value={floorPlanUrl}
                  onChange={(e) => setFloorPlanUrl(e.target.value)}
                  placeholder="Auto-generated certified blueprint or custom URL"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>

              <div className="shrink-0 pt-4">
                <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors">
                  <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                  <span>{uploadingDoc ? "Uploading..." : "Upload Blueprint"}</span>
                  <input
                    type="file"
                    accept=".svg,.png,.jpg,.jpeg,.pdf"
                    onChange={(e) => handleFileUpload(e, "floorPlan")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {showBlueprintPreview && (
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-900 p-2 text-center">
                <p className="text-[10px] text-slate-400 mb-1.5">Architectural Layout Preview ({bhk} BHK • {carpetAreaSqFt} sq.ft)</p>
                <div className="h-44 w-full bg-slate-950 rounded flex items-center justify-center overflow-hidden">
                  <iframe
                    src={currentFloorPlan}
                    className="w-full h-full border-0 pointer-events-none"
                    title="Blueprint preview"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Address / Landmark</label>
            <input
              type="text"
              placeholder="e.g. Plot 15, Near Metro Pillar 44, Vasudev Nagar"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs font-mono p-2.5 border border-slate-200 rounded-lg bg-slate-50/70"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono font-medium text-slate-700 block">Description *</label>
              <button
                type="button"
                onClick={() => setIsAiCopyModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2 py-0.5 rounded-lg transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>✨ Generate AI Marketing Pitch (WhatsApp / 99acres / IG)</span>
              </button>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Spacious apartment with modular kitchen, private balcony, and covered parking..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/70"
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
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50/70"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">BHK</label>
              <select
                value={bhk}
                onChange={(e) => setBhk(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
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
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50/70"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">Total Floors</label>
              <input
                type="number"
                min={1}
                value={totalFloors}
                onChange={(e) => setTotalFloors(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50/70"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono font-medium text-slate-700 block mb-1">Furnishing</label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value as any)}
                className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg bg-white"
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
                className="w-full text-xs font-mono font-bold text-slate-900 p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50/70"
              />
            </div>
          </div>

          {/* REAL PROPERTY PHOTOS (Cloudinary / Local Uploader) */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                Property Photo Gallery ({images.length} photos)
              </span>
              <span className="text-[10px] text-slate-400">
                Cloudinary &amp; Local Storage Ready
              </span>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handlePhotoUpload(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                dragOver
                  ? "border-indigo-500 bg-indigo-50/50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="file"
                id="property-photo-input"
                multiple
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e.target.files)}
                className="hidden"
              />
              <label
                htmlFor="property-photo-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  {isUploadingImages ? "Uploading photos..." : "Drag & drop photos here, or click to browse"}
                </p>
                <p className="text-[10px] text-slate-400">
                  Supports JPG, PNG, WebP • Auto-optimizes &amp; generates thumbnails
                </p>
              </label>
            </div>

            {/* Thumbnail Previews Grid */}
            {images.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>First photo is the default Cover Photo</span>
                  <button
                    type="button"
                    onClick={() => setImages([...PRESET_IMAGES])}
                    className="text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    Load Nagpur Sample Photos
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                    >
                      <img
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Cover Badge */}
                      {idx === 0 ? (
                        <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          <span>Cover</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCoverPhoto(idx)}
                          className="absolute top-1 left-1 bg-slate-900/70 hover:bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Make Cover Photo"
                        >
                          Set Cover
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Valuation Telemetry</span>
              </div>

              <button
                type="button"
                onClick={handleFetchAiValuation}
                disabled={estimating}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Calculator className="w-3 h-3 text-slate-500" />
                {estimating ? "Estimating..." : "Evaluate Price with ML"}
              </button>
            </div>

            {aiValuation ? (
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
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
              className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{submitting ? "Saving..." : "Save Property"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* GenAI Marketing Copywriter Modal */}
      {isAiCopyModalOpen && (
        <AiMarketingCopyModal
          isOpen={isAiCopyModalOpen}
          onClose={() => setIsAiCopyModalOpen(false)}
          onApplyDescription={(text) => {
            setDescription(text);
          }}
          params={{
            title: title || `${bhk} BHK Luxury Flat in ${locality}`,
            locality,
            bhk,
            carpetAreaSqFt,
            furnishing,
            amenities: selectedAmenities,
            listedPriceInLakhs,
            builderName,
            reraNumber,
            possessionDate
          }}
        />
      )}
    </div>
  );
}
