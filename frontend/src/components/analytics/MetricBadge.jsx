import React, { memo } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export const MetricBadge = memo(({ value, isPercentage = true }) => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numericValue) || numericValue === null || numericValue === undefined) {
    return null;
  }

  const formattedValue = Math.abs(numericValue).toFixed(1);
  const displayString = `${numericValue > 0 ? "+" : ""}${formattedValue}${isPercentage ? "%" : ""}`;

  let colorClasses = "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60";
  let Icon = Minus;
  let label = "Unchanged";

  if (numericValue > 0) {
    colorClasses = "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60 font-bold";
    Icon = ArrowUpRight;
    label = `Increased by ${formattedValue}${isPercentage ? " percent" : ""}`;
  } else if (numericValue < 0) {
    colorClasses = "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60 font-bold";
    Icon = ArrowDownRight;
    label = `Decreased by ${formattedValue}${isPercentage ? " percent" : ""}`;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border select-none ${colorClasses}`}
      aria-label={label}
      role="status"
    >
      <Icon size={12} className="flex-shrink-0" aria-hidden="true" />
      <span>{displayString}</span>
    </span>
  );
});

MetricBadge.displayName = "MetricBadge";

export default MetricBadge;
