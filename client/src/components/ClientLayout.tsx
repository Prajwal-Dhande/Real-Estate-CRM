"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  // Resilient chunk recovery: auto-reload when server chunks update or stale cache is detected
  useEffect(() => {
    const handleChunkError = (e: ErrorEvent) => {
      const msg = e.message || "";
      if (
        msg.includes("Loading chunk") ||
        msg.includes("ChunkLoadError") ||
        msg.includes("app-pages-internals") ||
        msg.includes("Failed to load resource")
      ) {
        const lastReload = sessionStorage.getItem("estateiq_chunk_reload");
        const now = Date.now();
        if (!lastReload || now - Number(lastReload) > 10000) {
          sessionStorage.setItem("estateiq_chunk_reload", String(now));
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleChunkError);
    return () => window.removeEventListener("error", handleChunkError);
  }, []);

  return (
    <AuthProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
        {!isLoginPage && <Sidebar />}
        <div className="relative flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Subtle Ambient 3D Aurora Mesh Orbs (Living Background) */}
          {!isLoginPage && (
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
              <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-indigo-200/25 via-purple-100/20 to-transparent blur-[120px] animate-aurora-1" />
              <div className="absolute top-[30%] -right-[15%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl from-cyan-200/20 via-sky-100/20 to-transparent blur-[120px] animate-aurora-2" />
              <div className="absolute -bottom-[20%] left-[25%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-emerald-100/20 via-indigo-100/15 to-transparent blur-[120px] animate-aurora-3" />
            </div>
          )}
          <main className="relative z-10 flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {children}
          </main>
        </div>
        <CommandPalette />
      </div>
    </AuthProvider>
  );
}
