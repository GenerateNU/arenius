import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatDate(date: Date, format: "shortMonth" | "year") {
  if (!date) return "";
  date = new Date(date);

  return format === "shortMonth"
    ? date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
    : date.getFullYear();
}
