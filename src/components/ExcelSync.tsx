import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload, FileCheck2 } from "lucide-react";
import { downloadTemplate, exportToExcel, parseWorkbook } from "../lib/excel";
import type { Transaction } from "../lib/types";

interface Props {
  transactions: Transaction[];
  onImport: (txns: Transaction[]) => void;
}

export default function ExcelSync({ transactions, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    setStatus("Parsing workbook...");
    const buf = await file.arrayBuffer();
    const txns = parseWorkbook(buf);
    onImport(txns);
    setStatus(`Imported ${txns.length} transactions from "${file.name}"`);
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-glow-cyan grid place-items-center">
          <FileSpreadsheet size={18} className="text-ink-950" />
        </div>
        <div>
          <div className="font-semibold">Excel sync</div>
          <div className="text-xs text-slate-400">
            Import .xlsx / .xls / .csv. Columns supported: Date, Description, Category, Type, Amount, Note.
          </div>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`mt-5 rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          dragOver ? "border-accent-500/60 bg-accent-500/5" : "border-white/10 hover:border-white/20 bg-white/[0.02]"
        }`}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="mx-auto text-slate-400" size={28} />
        <div className="mt-2 font-medium">Drop your Excel file here</div>
        <div className="text-xs text-slate-400">or click to browse</div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            if (fileRef.current) fileRef.current.value = "";
          }}
        />
      </div>

      {status && (
        <div className="mt-3 pill bg-accent-500/10 text-accent-400">
          <FileCheck2 size={12} /> {status}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mt-5">
        <button onClick={() => exportToExcel(transactions)} className="btn-ghost justify-center">
          <Download size={15} /> Export current data
        </button>
        <button onClick={downloadTemplate} className="btn-ghost justify-center">
          <FileSpreadsheet size={15} /> Download template
        </button>
      </div>
    </div>
  );
}
