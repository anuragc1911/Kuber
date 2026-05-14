export type Category =
  | "Food"
  | "Transport"
  | "Rent"
  | "Utilities"
  | "Shopping"
  | "Entertainment"
  | "Health"
  | "Savings"
  | "Income"
  | "Other";

export type TxnType = "income" | "expense" | "saving";

export interface Transaction {
  id: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  category: Category;
  amount: number; // positive
  type: TxnType;
  note?: string;
}

export interface SpendingLimit {
  category: Category;
  monthly: number;
}

export interface FinanceState {
  currency: string;
  dailySavingGoal: number;
  monthlyIncome: number;
  openingBalance: number;
  ownerEmail: string;
  transactions: Transaction[];
  limits: SpendingLimit[];
}

export interface AIInsight {
  id: string;
  tone: "positive" | "warning" | "info" | "danger";
  title: string;
  body: string;
}
