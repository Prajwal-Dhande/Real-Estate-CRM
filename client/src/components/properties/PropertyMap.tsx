"use client";

import React, { useEffect, useRef } from "react";
import { Property } from "@/types";
import { formatCurrencyLakhs } from "@/lib/utils";

interface PropertyMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (prop: Property) => void;
}

export default function PropertyMap({ properties, selectedProperty, onSelectProperty }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let isCancelled = false;

    async function initLeaflet() {
      if (!containerRef.current || mapInstanceRef.current) return;

      try {
        const leafletModule = await import("leaflet");
        const L = leafletModule.default || leafletModule;

        if (isCancelled || !containerRef.current) return;

        // Center map on Nagpur
        const nagpurCoords: [number, number] = [21.1458, 79.0882];
        const map = L.map(containerRef.current, {
          zoomControl: true,
          scrollWheelZoom: true
        }).setView(nagpurCoords, 12);

        mapInstanceRef.current = map;

        // Clean CartoDB Voyager tiles
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19
        }).addTo(map);

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
    };
  }, []);

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

      // Custom HTML Pin
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="
            background-color: ${pinColor};
            width: ${isSelected ? "32px" : "26px"};
            height: ${isSelected ? "32px" : "26px"};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background-color: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: isSelected ? [32, 32] : [26, 26],
        iconAnchor: isSelected ? [16, 32] : [13, 26],
        popupAnchor: [0, -28]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup with financial ratio & specs
      const popupHtml = `
        <div style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 4px; min-width: 190px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; background: ${badgeBg}; color: ${badgeText}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${pinColor}40;">
              ${valuationBadge}
            </span>
            <span style="font-size: 10px; color: #64748b; font-weight: 600;">${prop.bhk} BHK</span>
          </div>
          <h4 style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; line-height: 1.2;">
            ${prop.title}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
            📍 ${prop.locality}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: baseline; border-top: 1px solid #f1f5f9; padding-top: 6px;">
            <div>
              <span style="font-size: 9px; color: #94a3b8; display: block; text-transform: uppercase;">Listed</span>
              <strong style="font-size: 12px; color: #0f172a;">${formatCurrencyLakhs(prop.listedPriceInLakhs)}</strong>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 9px; color: #94a3b8; display: block; text-transform: uppercase;">AI Value</span>
              <strong style="font-size: 12px; color: #475569;">${formatCurrencyLakhs(aiEst)}</strong>
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
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-slate-200/90 shadow-2xs">
      <div ref={containerRef} className="w-full h-full min-h-[400px]" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs p-2.5 rounded-md border border-slate-200 shadow-sm text-xs font-mono space-y-1.5">
        <span className="font-semibold text-slate-800 text-[10px] block uppercase tracking-wider">
          Price vs Valuation
        </span>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1 font-medium text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Undervalued (&lt; -5%)
          </div>
          <div className="flex items-center gap-1 font-medium text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Fair (±5%)
          </div>
          <div className="flex items-center gap-1 font-medium text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Overpriced (&gt; +5%)
          </div>
        </div>
      </div>
    </div>
  );
}
