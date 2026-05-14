import * as XLSX from "xlsx";
import type { Category, Transaction, TxnType } from "./types";
import { uid } from "./finance";

const CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Rent",
  "Utilities",
  "Shopping",
  "Entertainment",
  "Health",
  "Savings",
  "Income",
  "Other",
];

function normalizeCategory(s: unknown): Category {
  const v = String(s ?? "").trim().toLowerCase();
  const match = CATEGORIES.find((c) => c.toLowerCase() === v);
  return match || "Other";
}

function normalizeType(s: unknown, amount: number, category: Category): TxnType {
  const v = String(s ?? "").trim().toLowerCase();
  if (v === "income" || v === "in" || v === "credit") return "income";
  if (v === "saving" || v === "savings") return "saving";
  if (v === "expense" || v === "out" || v === "debit") return "expense";
  if (category === "Income") return "income";
  if (category === "Savings") return "saving";
  return amount < 0 ? "expense" : "expense";
}

function normalizeDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") {
    // Excel serial date
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(epoch.getTime() + v * 86400000);
    return d.toISOString().slice(0, 10);
  }
  const s = String(v ?? "").trim();
  if (!s) return new Date().toISOString().slice(0, 10);
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

export function parseWorkbook(data: ArrayBuffer): Transaction[] {
  const wb = XLSX.read(data, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
  const txns: Transaction[] = [];
  for (const r of rows) {
    const lower: Record<string, unknown> = {};
    for (const k of Object.keys(r)) lower[k.trim().toLowerCase()] = r[k];
    const amountRaw = lower["amount"] ?? lower["value"] ?? lower["amt"];
    const amount = Math.abs(Number(amountRaw)) || 0;
    if (!amount) continue;
    const category = normalizeCategory(lower["category"]);
    const type = normalizeType(lower["type"], Number(amountRaw), category);
    txns.push({
      id: uid(),
      date: normalizeDate(lower["date"]),
      description: String(lower["description"] || lower["desc"] || lower["note"] || "Imported"),
      category,
      amount,
      type,
      note: lower["note"] ? String(lower["note"]) : undefined,
    });
  }
  return txns;
}

export function exportToExcel(transactions: Transaction[], filename = "kuber-finances.xlsx") {
  const data = transactions.map((t) => ({
    Date: t.date,
    Description: t.description,
    Category: t.category,
    Type: t.type,
    Amount: t.amount,
    Note: t.note || "",
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [{ wch: 12 }, { wch: 32 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 24 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  XLSX.writeFile(wb, filename);
}

export function downloadTemplate() {
  const sample = [
    { Date: "2026-05-10", Description: "Coffee", Category: "Food", Type: "expense", Amount: 4.5, Note: "" },
    { Date: "2026-05-10", Description: "Salary", Category: "Income", Type: "income", Amount: 4200, Note: "" },
    { Date: "2026-05-10", Description: "Auto-save", Category: "Savings", Type: "saving", Amount: 25, Note: "" },
  ];
  const ws = XLSX.utils.json_to_sheet(sample);
  ws["!cols"] = [{ wch: 12 }, { wch: 32 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 24 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  XLSX.writeFile(wb, "kuber-template.xlsx");
}
