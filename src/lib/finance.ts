import type { FinanceState, Transaction, Category } from "./types";

export function fmtMoney(n: number, currency = "INR"): string {
  if (currency === "INR") return fmtINR(n);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)}`;
  }
}

export function fmtINR(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}k`;
  return `${sign}₹${abs.toFixed(0)}`;
}

export function fmtCompact(n: number, currency = "INR"): string {
  if (currency === "INR") return fmtINR(n);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  const sym =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "";
  if (abs >= 1_000_000) return `${sign}${sym}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${sym}${(abs / 1_000).toFixed(1)}k`;
  return `${sign}${sym}${abs.toFixed(0)}`;
}

export function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface Totals {
  income: number;
  expenses: number;
  savings: number;
  net: number;
  todaySpending: number;
  todaySavings: number;
}

export function totalsThisMonth(state: FinanceState): Totals {
  const t = state.transactions.filter((x) => isThisMonth(x.date));
  const today = todayISO();
  const income = t.filter((x) => x.type === "income").reduce((a, b) => a + b.amount, 0);
  const expenses = t.filter((x) => x.type === "expense").reduce((a, b) => a + b.amount, 0);
  const savings = t.filter((x) => x.type === "saving").reduce((a, b) => a + b.amount, 0);
  const todaySpending = t
    .filter((x) => x.type === "expense" && x.date === today)
    .reduce((a, b) => a + b.amount, 0);
  const todaySavings = t
    .filter((x) => x.type === "saving" && x.date === today)
    .reduce((a, b) => a + b.amount, 0);
  return {
    income,
    expenses,
    savings,
    net: income - expenses - savings,
    todaySpending,
    todaySavings,
  };
}

export function spendByCategory(state: FinanceState): Record<Category, number> {
  const map = {} as Record<Category, number>;
  for (const t of state.transactions) {
    if (!isThisMonth(t.date) || t.type !== "expense") continue;
    map[t.category] = (map[t.category] || 0) + t.amount;
  }
  return map;
}

export function dailySeries(
  state: FinanceState,
  days = 60
): { date: string; spending: number; savings: number; income: number; balance: number }[] {
  const out: { date: string; spending: number; savings: number; income: number; balance: number }[] = [];
  const base = new Date();

  // Build running balance: start with an arbitrary base, then walk forward
  const initialBalance = computeBalance(state, daysAgoISO(days, base));
  let bal = initialBalance;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const dayTx = state.transactions.filter((t) => t.date === iso);
    const spending = dayTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    const savings = dayTx.filter((t) => t.type === "saving").reduce((a, b) => a + b.amount, 0);
    const income = dayTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    bal += income - spending; // savings stays inside the balance (just earmarked)
    out.push({ date: iso, spending, savings, income, balance: bal });
  }
  return out;
}

function daysAgoISO(days: number, base = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function computeBalance(state: FinanceState, beforeISO: string): number {
  let bal = 0;
  for (const t of state.transactions) {
    if (t.date >= beforeISO) continue;
    if (t.type === "income") bal += t.amount;
    else if (t.type === "expense") bal -= t.amount;
  }
  return bal + (state.openingBalance || 0);
}

export function currentBalance(state: FinanceState): number {
  let bal = state.openingBalance || 0;
  for (const t of state.transactions) {
    if (t.type === "income") bal += t.amount;
    else if (t.type === "expense") bal -= t.amount;
  }
  return bal;
}

export function runwayMonths(state: FinanceState): number {
  const balance = currentBalance(state);
  const burn = avgMonthlyBurn(state);
  if (burn <= 0) return Infinity;
  return balance / burn;
}

export function avgMonthlyBurn(state: FinanceState, months = 3): number {
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months, 1);
  const expenses = state.transactions
    .filter((t) => t.type === "expense" && new Date(t.date) >= cutoff)
    .reduce((a, b) => a + b.amount, 0);
  return expenses / months;
}

export function avgMonthlyIncome(state: FinanceState, months = 3): number {
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months, 1);
  const income = state.transactions
    .filter((t) => t.type === "income" && new Date(t.date) >= cutoff)
    .reduce((a, b) => a + b.amount, 0);
  return income / months;
}

export function deltaPct(curr: number, prev: number): number {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

export function last30VsPrior30(
  state: FinanceState,
  type: "income" | "expense" | "saving"
) {
  const now = new Date();
  const d30 = new Date(now);
  d30.setDate(d30.getDate() - 30);
  const d60 = new Date(now);
  d60.setDate(d60.getDate() - 60);
  const curr = state.transactions
    .filter((t) => t.type === type && new Date(t.date) >= d30)
    .reduce((a, b) => a + b.amount, 0);
  const prev = state.transactions
    .filter((t) => t.type === type && new Date(t.date) >= d60 && new Date(t.date) < d30)
    .reduce((a, b) => a + b.amount, 0);
  return { curr, prev, delta: deltaPct(curr, prev) };
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function newTransaction(partial: Partial<Transaction>): Transaction {
  return {
    id: uid(),
    date: partial.date || todayISO(),
    description: partial.description || "Untitled",
    category: (partial.category || "Other") as Category,
    amount: Number(partial.amount) || 0,
    type: (partial.type || "expense") as Transaction["type"],
    note: partial.note,
  };
}
