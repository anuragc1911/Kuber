import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload, Check } from "lucide-react";
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
    setStatus("Parsing…");
    const buf = await file.arrayBuffer();
    const txns = parseWorkbook(buf);
    onImport(txns);
    setStatus(`Imported ${txns.length} rows from ${file.name}`);
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-md bg-elev border border-line grid place-items-center">
          <FileSpreadsheet size={14} className="text-accent" />
        </div>
        <div>
          <div className="font-medium text-[14px]">Excel sync</div>
          <div className="text-[11.5px] text-sub">
            Import .xlsx, .xls, .csv. Columns: Date, Description, Category, Type, Amount, Note.
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
        className={`mt-4 rounded-lg border border-dashed p-7 text-center cursor-pointer transition-colors ${
          dragOver ? "border-accent bg-accent/5" : "border-line hover:border-muted bg-elev/30"
        }`}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="mx-auto text-sub" size={20} />
        <div className="mt-2 text-[13px]">Drop your Excel file here</div>
        <div className="text-[11px] text-sub">or click to browse</div>
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
        <div className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-accent-glow">
          <Check size={12} /> {status}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mt-4">
        <button onClick={() => exportToExcel(transactions)} className="btn-ghost justify-center">
          <Download size={13} /> Export
        </button>
        <button onClick={downloadTemplate} className="btn-ghost justify-center">
          <FileSpreadsheet size={13} /> Template
        </button>
      </div>
    </div>
  );
}
