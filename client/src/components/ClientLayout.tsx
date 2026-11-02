"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {children}
      </main>
    </AuthProvider>
  );
}
