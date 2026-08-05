import React, { memo } from "react";

export const AnalyticsFilters = memo(({
  selected,
  onChange,
  className = "",
}) => {
  const options = [
    { label: "Last 7 Days", value: "daily", range: "Past 7 days stats" },
    { label: "Last 30 Days", value: "weekly", range: "Past 30 days stats" },
    { label: "Last 90 Days", value: "monthly", range: "Past 90 days stats" },
    { label: "Last Year", value: "yearly", range: "Past year stats" },
  ];

  return (
    <div
      className={`inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800/80 gap-1 select-none ${className}`}
      role="tablist"
      aria-label="Analytics Time Period Filters"
    >
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isSelected}
            aria-label={opt.range}
            tabIndex={0}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
              isSelected
                ? "bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 font-bold shadow-md shadow-cyan-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
});

AnalyticsFilters.displayName = "AnalyticsFilters";

export default AnalyticsFilters;
