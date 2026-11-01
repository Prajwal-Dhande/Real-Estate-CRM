import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyLakhs(amountInLakhs?: number | null): string {
  if (amountInLakhs === undefined || amountInLakhs === null) return "₹0 L";
  if (amountInLakhs >= 100) {
    const cr = amountInLakhs / 100;
    return `₹${cr.toFixed(2)} Cr`;
  }
  return `₹${amountInLakhs.toFixed(2)} L`;
}

export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

