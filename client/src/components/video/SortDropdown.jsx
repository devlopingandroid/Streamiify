import React, { useState } from "react";
import { ArrowDownAZ, ChevronDown } from "lucide-react";

export const SortDropdown = ({ value, onChange, options = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative select-none">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 text-xs font-semibold hover:border-slate-700 transition-colors cursor-pointer"
        aria-label="Sort options selection dropdown"
      >
        <ArrowDownAZ size={14} className="text-slate-500" />
        <span>{selectedOption?.label || "Sort"}</span>
        <ChevronDown size={12} className="text-slate-500" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+6px)] min-w-[140px] rounded-lg border border-slate-800/80 bg-slate-900 p-1 shadow-2xl z-50 animate-fade-in">
            {options.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-3 py-2 text-2xs rounded-md transition-colors cursor-pointer ${
                  value === opt.value
                    ? "bg-slate-800 text-brand-cyan font-bold"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
export default SortDropdown;
