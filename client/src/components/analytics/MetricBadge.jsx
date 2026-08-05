import React, { memo } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

/**
 * MetricBadge component displaying trend information with rich dark-theme colors,
 * indicators, and accessibility configurations.
 *
 * @param {Object} props
 * @param {number|string} props.value - The percentage value or trend amount
 * @param {boolean} [props.isPercentage=true] - Appends '%' to the value if true
 */
export const MetricBadge = memo(({ value, isPercentage = true }) => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numericValue) || numericValue === null || numericValue === undefined) {
    return null;
  }

  const formattedValue = Math.abs(numericValue).toFixed(1);
  const displayString = `${numericValue > 0 ? "+" : ""}${formattedValue}${isPercentage ? "%" : ""}`;

  let colorClasses = "text-slate-400 bg-slate-800/40 border-slate-700/50";
  let Icon = Minus;
  let label = "Unchanged";

  if (numericValue > 0) {
    colorClasses = "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
    Icon = ArrowUpRight;
    label = `Increased by ${formattedValue}${isPercentage ? " percent" : ""}`;
  } else if (numericValue < 0) {
    colorClasses = "text-rose-400 bg-rose-500/10 border border-rose-500/20";
    Icon = ArrowDownRight;
    label = `Decreased by ${formattedValue}${isPercentage ? " percent" : ""}`;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border select-none ${colorClasses}`}
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
