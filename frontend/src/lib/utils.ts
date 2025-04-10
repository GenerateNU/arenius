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

export function formatISOString(date: string) {
  const dateStr = date.split("T")[0];
  const [, month, day] = dateStr.split("-");
  return `${month}/${day}`;
}

export function formatNumber(number?: number) {
  if (!number) return "";
  return Number(number?.toFixed()).toLocaleString();
}

export const textConstants = {
  scope1: {
    title: "Scope 1",
    body: "Classification for an emission that is from a directly owned/controlled source like company vehicles, fuel combustion, and on-site manufacturing.",
  },
  scope2: {
    title: "Scope 2",
    body: "Classification for an emission that is indirectly related to the company like purchased electricity, heat, steam, and cooling.",
  },
  scope3: {
    title: "Scope 3",
    body: "Classification for all other indirect emissions in a company's value chain like the impact of travel or emissions from manufacturing purchased goods/services.",
  },
  scope: {
    title: "Scope",
    body: "The boundaries or categories established by the Greenhouse Gas Protocol used to classify and organize greenhouse gas emissions for measurement and reporting purposes. This classification system is meant to organize different types of carbon pollution based on where it comes from.",
  },
  offset: {
    title: "Carbon Offset",
    body: "Carbon credits purchased to compensate for emissions that cannot be eliminated. These offset the impact of carbon emissions and contribute positively overall sustainability.",
  },
  reconciled: {
    title: "Reconciled Transactions",
    body: "Emissions data entires that have been verified, matched, and accounted for in your emission tracking system.",
  },
  unreconciled: {
    title: "Unreconciled Transactions",
    body: "Emissions data entries that are pending verification and waiting to be matched with a scope and emissions factor in order to be accounted for.",
  },
  recommendation: {
    title: "Recommendations",
    body: "These are recommendations for reconciliations that are based on the most common emissions factors and scopes from previous reconciled transactions.",
  },
  carbonOffset: {
    title: "CO₂ Emissions",
    body: "The actual amount of CO₂e emissions produced by a particular transaction, measured in kilograms.",
  },
  emissionsFactor: {
    title: "Emissions Factor",
    body: "The category of the emission which correlates with a particular conversion calculation that helps turn a financial transaction ($$) into an amount of carbon pollution (CO₂e kg).",
  },
  contact: {
    title: "Contact",
    body: "The person or company responsible for this carbon emission.",
  },
};
