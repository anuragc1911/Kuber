import type { Category, FinanceState, Transaction } from "../lib/types";

const today = new Date();
function daysAgo(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const seedTxns: Omit<Transaction, "id">[] = [
  { date: daysAgo(0), description: "Morning coffee", category: "Food", amount: 4.5, type: "expense" },
  { date: daysAgo(0), description: "Subway ride", category: "Transport", amount: 2.9, type: "expense" },
  { date: daysAgo(1), description: "Grocery — Trader Joe's", category: "Food", amount: 68.21, type: "expense" },
  { date: daysAgo(1), description: "Daily auto-save", category: "Savings", amount: 25, type: "saving" },
  { date: daysAgo(2), description: "Netflix", category: "Entertainment", amount: 15.99, type: "expense" },
  { date: daysAgo(2), description: "Uber", category: "Transport", amount: 18.4, type: "expense" },
  { date: daysAgo(3), description: "Daily auto-save", category: "Savings", amount: 25, type: "saving" },
  { date: daysAgo(3), description: "Pharmacy", category: "Health", amount: 22.15, type: "expense" },
  { date: daysAgo(4), description: "Restaurant — Sushi night", category: "Food", amount: 54.0, type: "expense" },
  { date: daysAgo(5), description: "Electric bill", category: "Utilities", amount: 88.0, type: "expense" },
  { date: daysAgo(6), description: "Amazon order", category: "Shopping", amount: 41.32, type: "expense" },
  { date: daysAgo(7), description: "Salary", category: "Income", amount: 4200, type: "income" },
  { date: daysAgo(8), description: "Rent", category: "Rent", amount: 1450, type: "expense" },
  { date: daysAgo(9), description: "Gym membership", category: "Health", amount: 35, type: "expense" },
  { date: daysAgo(10), description: "Daily auto-save", category: "Savings", amount: 25, type: "saving" },
  { date: daysAgo(11), description: "Coffee shop", category: "Food", amount: 6.75, type: "expense" },
  { date: daysAgo(12), description: "Movie tickets", category: "Entertainment", amount: 28.5, type: "expense" },
  { date: daysAgo(14), description: "Freelance project", category: "Income", amount: 650, type: "income" },
  { date: daysAgo(15), description: "Daily auto-save", category: "Savings", amount: 25, type: "saving" },
  { date: daysAgo(18), description: "Internet bill", category: "Utilities", amount: 49.99, type: "expense" },
  { date: daysAgo(20), description: "Clothes — H&M", category: "Shopping", amount: 76.4, type: "expense" },
  { date: daysAgo(22), description: "Daily auto-save", category: "Savings", amount: 25, type: "saving" },
];

export function sampleState(): FinanceState {
  const transactions: Transaction[] = seedTxns.map((t, i) => ({
    ...t,
    id: `seed-${i}`,
  }));
  const limits: { category: Category; monthly: number }[] = [
    { category: "Food", monthly: 450 },
    { category: "Transport", monthly: 180 },
    { category: "Entertainment", monthly: 120 },
    { category: "Shopping", monthly: 200 },
    { category: "Utilities", monthly: 200 },
    { category: "Health", monthly: 150 },
  ];
  return {
    currency: "USD",
    dailySavingGoal: 25,
    monthlyIncome: 4200,
    transactions,
    limits,
  };
}
