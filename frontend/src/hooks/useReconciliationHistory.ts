import { EmissionsFactor } from "@/types";

const HISTORY_KEY = "emissionsFactorHistory";
const MAX_HISTORY = 10;

export function getHistory(): EmissionsFactor[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
}

export function addToHistory(factor: EmissionsFactor) {
  try {
    const history = getHistory().filter((f) => f.id !== factor.id);
    const newHistory = [factor, ...history].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (e) {
    console.error("Failed to save to history", e);
  }
}
