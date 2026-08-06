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
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 text-xs font-semibold hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs cursor-pointer"
        aria-label="Sort options selection dropdown"
      >
        <ArrowDownAZ size={14} className="text-slate-500 dark:text-slate-400" />
        <span>{selectedOption?.label || "Sort"}</span>
        <ChevronDown size={12} className="text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+6px)] min-w-[150px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-1.5 shadow-xl z-50 animate-fade-in">
            {options.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                  value === opt.value
                    ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
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
