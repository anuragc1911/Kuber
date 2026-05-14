import type { FinanceState } from "./types";
import { sampleState } from "../data/sampleData";

const KEY = "kuber.finance.v2";
const LEGACY_KEY = "kuber.finance.v1";

export function loadState(): FinanceState {
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY);
    if (!raw) return sampleState();
    const parsed = JSON.parse(raw) as Partial<FinanceState>;
    return migrate(parsed);
  } catch {
    return sampleState();
  }
}

export function saveState(state: FinanceState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private-mode errors
  }
}

export function resetState(): FinanceState {
  const s = sampleState();
  saveState(s);
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* noop */
  }
  return s;
}

function migrate(p: Partial<FinanceState>): FinanceState {
  const defaults = sampleState();
  return {
    currency: p.currency ?? "INR",
    dailySavingGoal: p.dailySavingGoal ?? defaults.dailySavingGoal,
    monthlyIncome: p.monthlyIncome ?? defaults.monthlyIncome,
    openingBalance: p.openingBalance ?? defaults.openingBalance,
    ownerEmail: p.ownerEmail ?? defaults.ownerEmail,
    transactions: Array.isArray(p.transactions) ? p.transactions : defaults.transactions,
    limits: Array.isArray(p.limits) ? p.limits : defaults.limits,
  };
}
