"use client";

import React, { useEffect, useState } from "react";
import { Property } from "@/types";
import { formatCurrencyLakhs } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

interface PropertyMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (prop: Property) => void;
}

export default function PropertyMap({ properties, selectedProperty, onSelectProperty }: PropertyMapProps) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Dynamically import Leaflet on client side
    import("leaflet").then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  useEffect(() => {
    if (!L) return;

    // Center map on Nagpur
    const nagpurCoords: [number, number] = [21.1458, 79.0882];
    const mapContainer = document.getElementById("property-leaflet-map");
    if (!mapContainer) return;

    // Check if map already initialized
    // @ts-ignore
    if (mapContainer._leaflet_map) {
      // @ts-ignore
      mapContainer._leaflet_map.remove();
    }

    const map = L.map("property-leaflet-map").setView(nagpurCoords, 12);
    // @ts-ignore
    mapContainer._leaflet_map = map;

    // CartoDB Positron clean map tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    // Plot each property with colored marker based on Price-to-Valuation ratio
    properties.forEach((prop) => {
      const lat = prop.coordinates?.lat || 21.1458;
      const lng = prop.coordinates?.lng || 79.0882;
      const aiEst = prop.aiEstimatedPriceInLakhs || prop.listedPriceInLakhs;
      const ratio = prop.listedPriceInLakhs / aiEst;

      // Ratio coloring:
      // < 0.95: Undervalued (Green)
      // 0.95 - 1.05: Fair Value (Indigo/Blue)
      // > 1.05: Overpriced (Amber/Red)
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

      // Custom SVG marker pin
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="
            background-color: ${pinColor};
            width: ${isSelected ? "34px" : "28px"};
            height: ${isSelected ? "34px" : "28px"};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background-color: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [isSelected ? 34 : 28, isSelected ? 34 : 28],
        iconAnchor: [isSelected ? 17 : 14, isSelected ? 34 : 28]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup card with details
      const popupHtml = `
        <div style="font-family: inherit; padding: 4px; max-width: 220px;">
          <div style="font-size: 10px; font-weight: 700; background: ${badgeBg}; color: ${badgeText}; display: inline-block; padding: 2px 8px; border-radius: 9999px; margin-bottom: 6px;">
            ${valuationBadge}
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.2;">
            ${prop.title}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
            📍 ${prop.locality} • ${prop.bhk} BHK (${prop.carpetAreaSqFt} sq ft)
          </div>
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: baseline;">
            <div>
              <div style="font-size: 9px; color: #64748b;">Listed Price</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a;">
                ₹${prop.listedPriceInLakhs} L
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 9px; color: #64748b;">AI Estimate</div>
              <div style="font-size: 12px; font-weight: 700; color: #4f46e5;">
                ₹${aiEst} L
              </div>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("click", () => {
        onSelectProperty(prop);
      });
    });

    return () => {
      // @ts-ignore
      if (mapContainer._leaflet_map) {
        // @ts-ignore
        mapContainer._leaflet_map.remove();
        // @ts-ignore
        mapContainer._leaflet_map = null;
      }
    };
  }, [L, properties, selectedProperty]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div id="property-leaflet-map" className="w-full h-full" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-lg text-xs space-y-2">
        <span className="font-bold text-slate-800 text-[11px] block uppercase tracking-wider">
          Price vs AI Valuation
        </span>
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 font-medium text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            Undervalued (&lt; -5%)
          </div>
          <div className="flex items-center gap-1.5 font-medium text-blue-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200" />
            Fair Value (±5%)
          </div>
          <div className="flex items-center gap-1.5 font-medium text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200" />
            Overpriced (&gt; +5%)
          </div>
        </div>
      </div>
    </div>
  );
}

