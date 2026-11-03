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
      {!isLoginPage && <Sidebar />}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {children}
      </main>
      <CommandPalette />
    </AuthProvider>
  );
}
