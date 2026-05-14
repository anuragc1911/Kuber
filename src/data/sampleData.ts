import type { Category, FinanceState, Transaction } from "../lib/types";

const today = new Date();
function daysAgo(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const seedTxns: Omit<Transaction, "id">[] = [
  // current month
  { date: daysAgo(0), description: "Blue Tokai coffee", category: "Food", amount: 320, type: "expense" },
  { date: daysAgo(0), description: "Auto-save", category: "Savings", amount: 1500, type: "saving" },
  { date: daysAgo(1), description: "Zomato — dinner", category: "Food", amount: 740, type: "expense" },
  { date: daysAgo(1), description: "Uber", category: "Transport", amount: 285, type: "expense" },
  { date: daysAgo(2), description: "Netflix", category: "Entertainment", amount: 649, type: "expense" },
  { date: daysAgo(2), description: "BigBasket", category: "Food", amount: 2840, type: "expense" },
  { date: daysAgo(3), description: "Auto-save", category: "Savings", amount: 1500, type: "saving" },
  { date: daysAgo(3), description: "Apollo Pharmacy", category: "Health", amount: 1120, type: "expense" },
  { date: daysAgo(4), description: "Movie + popcorn", category: "Entertainment", amount: 1300, type: "expense" },
  { date: daysAgo(5), description: "Electricity bill", category: "Utilities", amount: 2450, type: "expense" },
  { date: daysAgo(6), description: "Amazon — headphones", category: "Shopping", amount: 4999, type: "expense" },
  { date: daysAgo(7), description: "Salary — November", category: "Income", amount: 185000, type: "income" },
  { date: daysAgo(7), description: "Monthly SIP", category: "Savings", amount: 25000, type: "saving" },
  { date: daysAgo(8), description: "Rent — November", category: "Rent", amount: 42000, type: "expense" },
  { date: daysAgo(9), description: "Cult Fit", category: "Health", amount: 1499, type: "expense" },
  { date: daysAgo(10), description: "Auto-save", category: "Savings", amount: 1500, type: "saving" },
  { date: daysAgo(11), description: "Starbucks", category: "Food", amount: 410, type: "expense" },
  { date: daysAgo(12), description: "Petrol", category: "Transport", amount: 2200, type: "expense" },
  { date: daysAgo(14), description: "Consulting payout", category: "Income", amount: 35000, type: "income" },
  { date: daysAgo(15), description: "Auto-save", category: "Savings", amount: 1500, type: "saving" },
  { date: daysAgo(18), description: "Internet bill", category: "Utilities", amount: 1199, type: "expense" },
  { date: daysAgo(20), description: "Myntra — clothes", category: "Shopping", amount: 5640, type: "expense" },
  { date: daysAgo(22), description: "Auto-save", category: "Savings", amount: 1500, type: "saving" },
  { date: daysAgo(24), description: "Swiggy — lunch", category: "Food", amount: 460, type: "expense" },
  { date: daysAgo(26), description: "Spotify", category: "Entertainment", amount: 119, type: "expense" },

  // last month
  { date: daysAgo(35), description: "Salary — October", category: "Income", amount: 185000, type: "income" },
  { date: daysAgo(35), description: "Monthly SIP", category: "Savings", amount: 25000, type: "saving" },
  { date: daysAgo(36), description: "Rent — October", category: "Rent", amount: 42000, type: "expense" },
  { date: daysAgo(40), description: "Diwali shopping", category: "Shopping", amount: 18500, type: "expense" },
  { date: daysAgo(42), description: "Electricity bill", category: "Utilities", amount: 2120, type: "expense" },
  { date: daysAgo(45), description: "Family dinner", category: "Food", amount: 4800, type: "expense" },
  { date: daysAgo(48), description: "Consulting payout", category: "Income", amount: 42000, type: "income" },
  { date: daysAgo(52), description: "Flight — Goa", category: "Transport", amount: 8400, type: "expense" },
  { date: daysAgo(55), description: "Hotel — Goa", category: "Other", amount: 14200, type: "expense" },

  // older
  { date: daysAgo(70), description: "Salary — September", category: "Income", amount: 185000, type: "income" },
  { date: daysAgo(70), description: "Monthly SIP", category: "Savings", amount: 25000, type: "saving" },
  { date: daysAgo(71), description: "Rent — September", category: "Rent", amount: 42000, type: "expense" },
];

export function sampleState(): FinanceState {
  const transactions: Transaction[] = seedTxns.map((t, i) => ({ ...t, id: `seed-${i}` }));
  const limits: { category: Category; monthly: number }[] = [
    { category: "Food", monthly: 12000 },
    { category: "Transport", monthly: 5000 },
    { category: "Entertainment", monthly: 3000 },
    { category: "Shopping", monthly: 8000 },
    { category: "Utilities", monthly: 5000 },
    { category: "Health", monthly: 4000 },
  ];
  return {
    currency: "INR",
    dailySavingGoal: 1500,
    monthlyIncome: 185000,
    openingBalance: 1850000, // ~₹18.5L starting balance to make charts feel real
    ownerEmail: "anuragc1911@gmail.com",
    transactions,
    limits,
  };
}
