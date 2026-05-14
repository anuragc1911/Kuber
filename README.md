# Kuber — AI CFO Finance Dashboard

A personal-finance webapp with an "AI CFO" UX:

- **Daily savings tracker** with goals, streak ring, and quick-save
- **Spending limits** per category with budget pacing bars
- **Excel sync** — import `.xlsx` / `.xls` / `.csv` and export your data back to Excel
- **AI CFO panel** — proactive insights (overspend alerts, savings rate, anomalies) and a chat that answers natural-language questions about your money
- Built with Vite + React + TypeScript + Tailwind + Recharts + SheetJS

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Excel format

Columns: `Date`, `Description`, `Category`, `Type` (`expense` / `income` / `saving`), `Amount`, optional `Note`. Use the **Download template** button on the Excel Sync page to get a starter file.

## Data

All data is stored locally in `localStorage`. Use Excel export for backups.
