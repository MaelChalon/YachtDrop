"use client";

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  clearLabel?: string;
};

export function SearchBar({ value, onChange, placeholder = "Rechercher...", clearLabel = "Effacer" }: Props) {
  return (
    <div className="sticky top-0 z-10 pb-3 pt-2">
      <div className="glass flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
          placeholder={placeholder}
        />
        {value ? (
          <button onClick={() => onChange("")} className="text-xs font-semibold text-slate-500">
            {clearLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
