"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, KanbanSquare, Building2, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Pipeline",
    href: "/leads",
    icon: KanbanSquare,
  },
  {
    name: "Inventory",
    href: "/properties",
    icon: Building2,
  },
  {
    name: "AI Engine",
    href: "/valuation",
    icon: BrainCircuit,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on public client view (/p/*) and login
  if (pathname?.startsWith("/p/") || pathname === "/login") {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0B132B]/95 backdrop-blur-md border-t border-slate-800 text-slate-400 select-none shadow-lg">
      <div className="grid grid-cols-4 h-15 items-center px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 transition-all",
                isActive
                  ? "text-indigo-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-xl transition-all",
                  isActive ? "bg-indigo-600/20 text-indigo-400" : ""
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-mono mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
