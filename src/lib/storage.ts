import type { FinanceState } from "./types";
import { sampleState } from "../data/sampleData";

const KEY = "kuber.finance.v1";

export function loadState(): FinanceState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return sampleState();
    return JSON.parse(raw) as FinanceState;
  } catch {
    return sampleState();
  }
}

export function saveState(state: FinanceState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState(): FinanceState {
  const s = sampleState();
  saveState(s);
  return s;
}
