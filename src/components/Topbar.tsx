import { Search, Plus } from "lucide-react";

interface Props {
  onAdd: () => void;
  ownerEmail: string;
  workspace?: string;
}

export default function Topbar({ onAdd, ownerEmail, workspace = "personal" }: Props) {
  return (
    <header className="flex items-center gap-3 px-6 h-14 border-b border-line bg-bg">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-text font-medium">{workspace}</span>
        <span className="text-sub">·</span>
        <span className="text-dim">{ownerEmail}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sub" />
          <input
            placeholder="Search…"
            className="input pl-7 w-56 h-8 text-[12.5px]"
          />
        </div>
        <button onClick={onAdd} className="btn-primary h-8">
          <Plus size={14} strokeWidth={2.4} /> Add
        </button>
        <div className="w-8 h-8 rounded-full bg-accent text-bg grid place-items-center text-[12px] font-semibold" title={ownerEmail}>
          {ownerEmail.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
