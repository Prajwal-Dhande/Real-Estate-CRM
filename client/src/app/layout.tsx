import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "EstateIQ - AI-Driven Real Estate CRM",
  description: "Next.js 14 Real Estate CRM with AI Valuation, Lead Scoring, and Real-time Pipeline",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="font-sans h-full bg-slate-50 flex overflow-hidden text-slate-900">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

