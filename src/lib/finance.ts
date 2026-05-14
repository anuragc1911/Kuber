import type { FinanceState, Transaction, Category } from "./types";

export function fmtMoney(n: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
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
  days = 30
): { date: string; spending: number; savings: number; income: number }[] {
  const out: { date: string; spending: number; savings: number; income: number }[] = [];
  const base = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const dayTx = state.transactions.filter((t) => t.date === iso);
    out.push({
      date: iso,
      spending: dayTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0),
      savings: dayTx.filter((t) => t.type === "saving").reduce((a, b) => a + b.amount, 0),
      income: dayTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0),
    });
  }
  return out;
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
