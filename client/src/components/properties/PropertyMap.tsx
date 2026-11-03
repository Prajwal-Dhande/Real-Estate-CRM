"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Property } from "@/types";
import { formatCurrencyLakhs } from "@/lib/utils";
import { Layers, Map as MapIcon, Eye, Globe } from "lucide-react";

interface PropertyMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (prop: Property) => void;
}

type MapLayerType = "streets" | "satellite" | "topo";

const TILE_LAYERS: Record<MapLayerType, { url: string; attribution: string; label: string; maxZoom: number }> = {
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    label: "🗺️ Streets",
    maxZoom: 19
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    label: "🛰️ Satellite",
    maxZoom: 18
  },
  topo: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
    label: "🏙️ Topo",
    maxZoom: 19
  }
};

export default function PropertyMap({ properties, selectedProperty, onSelectProperty }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const currentTileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>("streets");

  // Initialize Leaflet Map
  useEffect(() => {
    let isCancelled = false;

    async function initLeaflet() {
      if (!containerRef.current || mapInstanceRef.current) return;

      try {
        const leafletModule = await import("leaflet");
        const L = leafletModule.default || leafletModule;

        if (isCancelled || !containerRef.current) return;

        // Ensure container is clean
        if ((containerRef.current as any)._leaflet_id) {
          delete (containerRef.current as any)._leaflet_id;
        }

        // Center map on Nagpur
        const nagpurCoords: [number, number] = [21.1458, 79.0882];
        const map = L.map(containerRef.current, {
          zoomControl: false, // We'll add custom positioned zoom control
          scrollWheelZoom: true
        }).setView(nagpurCoords, 12);

        L.control.zoom({ position: "topright" }).addTo(map);

        mapInstanceRef.current = map;

        // Add default clean streets tile layer
        const config = TILE_LAYERS["streets"];
        const tileLayer = L.tileLayer(config.url, {
          attribution: config.attribution,
          maxZoom: config.maxZoom,
          subdomains: ["a", "b", "c"]
        }).addTo(map);
        currentTileLayerRef.current = tileLayer;

        // Render markers
        updateMarkers(L, map);
      } catch (err) {
        console.error("Leaflet initialization error:", err);
      }
    }

    initLeaflet();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (containerRef.current) {
        delete (containerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Switch map tiles dynamically
  const switchLayer = (type: MapLayerType) => {
    setActiveLayer(type);
    if (!mapInstanceRef.current) return;

    import("leaflet").then((leafletModule) => {
      const L = leafletModule.default || leafletModule;
      const map = mapInstanceRef.current;

      if (currentTileLayerRef.current) {
        map.removeLayer(currentTileLayerRef.current);
      }

      const config = TILE_LAYERS[type];
      const newLayer = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: config.maxZoom,
        subdomains: ["a", "b", "c"]
      }).addTo(map);

      currentTileLayerRef.current = newLayer;
    });
  };

  // Update markers when properties or selection changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import("leaflet").then((leafletModule) => {
      const L = leafletModule.default || leafletModule;
      if (mapInstanceRef.current) {
        updateMarkers(L, mapInstanceRef.current);
      }
    });
  }, [properties, selectedProperty]);

  const updateMarkers = (L: any, map: any) => {
    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    properties.forEach((prop) => {
      const lat = prop.coordinates?.lat || 21.1458;
      const lng = prop.coordinates?.lng || 79.0882;
      const aiEst = prop.aiEstimatedPriceInLakhs || prop.listedPriceInLakhs;
      const ratio = prop.listedPriceInLakhs / aiEst;

      let pinColor = "#3b82f6"; // Blue
      let valuationBadge = "Fair Value";
      let badgeBg = "#eff6ff";
      let badgeText = "#1d4ed8";

      if (ratio < 0.95) {
        pinColor = "#10b981"; // Emerald
        valuationBadge = `${Math.round((1 - ratio) * 100)}% Undervalued`;
        badgeBg = "#ecfdf5";
        badgeText = "#047857";
      } else if (ratio > 1.05) {
        pinColor = "#ef4444"; // Red
        valuationBadge = `${Math.round((ratio - 1) * 100)}% Overpriced`;
        badgeBg = "#fef2f2";
        badgeText = "#b91c1c";
      }

      const isSelected = selectedProperty?._id === prop._id;

      // Custom 3D Glowing HTML Pin
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${isSelected ? `
              <div style="
                position: absolute;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background-color: ${pinColor};
                opacity: 0.35;
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
            ` : ""}
            <div style="
              background-color: ${pinColor};
              width: ${isSelected ? "34px" : "28px"};
              height: ${isSelected ? "34px" : "28px"};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2.5px solid white;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            ">
              <div style="
                width: 8px;
                height: 8px;
                background-color: white;
                border-radius: 50%;
                box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
              "></div>
            </div>
          </div>
        `,
        iconSize: isSelected ? [34, 34] : [28, 28],
        iconAnchor: isSelected ? [17, 34] : [14, 28],
        popupAnchor: [0, -30]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup with financial ratio & specs
      const popupHtml = `
        <div style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 6px; min-width: 210px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; background: ${badgeBg}; color: ${badgeText}; padding: 3px 8px; border-radius: 6px; border: 1px solid ${pinColor}40;">
              ${valuationBadge}
            </span>
            <span style="font-size: 11px; color: #475569; font-weight: 700; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">
              ${prop.bhk} BHK
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
            ${prop.title}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; font-weight: 500;">
            📍 ${prop.locality}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: baseline; border-top: 1px solid #f1f5f9; padding-top: 6px;">
            <div>
              <span style="font-size: 9px; color: #94a3b8; display: block; text-transform: uppercase; font-weight: 600;">Listed Price</span>
              <strong style="font-size: 13px; color: #0f172a; font-weight: 800;">${formatCurrencyLakhs(prop.listedPriceInLakhs)}</strong>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 9px; color: #94a3b8; display: block; text-transform: uppercase; font-weight: 600;">AI Valuation</span>
              <strong style="font-size: 13px; color: #4338ca; font-weight: 800;">${formatCurrencyLakhs(aiEst)}</strong>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        onSelectProperty(prop);
      });

      markersRef.current.push(marker);

      if (isSelected) {
        map.setView([lat, lng], 14, { animate: true });
        marker.openPopup();
      }
    });
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] bg-slate-100">
      <div ref={containerRef} className="w-full h-full min-h-[420px]" />

      {/* Interactive Layer Switcher Bar (Streets / Satellite / Topo) */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center p-1 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md gap-1">
        {(["streets", "satellite", "topo"] as MapLayerType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => switchLayer(type)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeLayer === type
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {TILE_LAYERS[type].label}
          </button>
        ))}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200/90 shadow-md text-xs font-mono space-y-1.5">
        <span className="font-bold text-slate-800 text-[10px] block uppercase tracking-wider">
          Price vs AI Valuation
        </span>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
            Undervalued (&lt; -5%)
          </div>
          <div className="flex items-center gap-1.5 font-bold text-blue-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-2xs" />
            Fair (±5%)
          </div>
          <div className="flex items-center gap-1.5 font-bold text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs" />
            Overpriced (&gt; +5%)
          </div>
        </div>
      </div>
    </div>
  );
}
