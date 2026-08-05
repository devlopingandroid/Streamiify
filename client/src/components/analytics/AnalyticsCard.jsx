import React, { useEffect, useState, memo } from "react";
import { MetricBadge } from "./MetricBadge";

/**
 * Parses diverse stat strings (durations, percentages, raw counts)
 * to numeric values for transition animation.
 */
const parseStatValue = (val) => {
  if (typeof val === "number") return { numeric: val, type: "number" };
  if (!val) return { numeric: 0, type: "number" };

  // Duration match (e.g., "04:12" or "12:34")
  const durationMatch = String(val).match(/^(\d+):(\d+)$/);
  if (durationMatch) {
    const minutes = parseInt(durationMatch[1], 10);
    const seconds = parseInt(durationMatch[2], 10);
    return { numeric: minutes * 60 + seconds, type: "duration" };
  }

  // Percentage match (e.g., "82.5%")
  if (String(val).endsWith("%")) {
    const parsed = parseFloat(String(val).replace("%", ""));
    return { numeric: parsed, type: "percentage" };
  }

  // Standard float match (e.g. with commas or custom suffixes)
  const cleanStr = String(val).replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleanStr);
  if (!isNaN(parsed)) {
    return { numeric: parsed, type: "number" };
  }

  return { numeric: val, type: "string" };
};

/**
 * Format the animated numeric value back to its original visual type.
 */
const formatStatValue = (current, type) => {
  if (type === "duration") {
    const mins = Math.floor(current / 60);
    const secs = Math.floor(current % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  if (type === "percentage") {
    return `${current.toFixed(1)}%`;
  }
  if (type === "string") {
    return current;
  }
  return current.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

export const AnalyticsCard = memo(({
  title,
  value,
  icon: Icon,
  trend,
  gradientAccent = "from-cyan-500/10 to-indigo-500/10",
  iconBg = "bg-cyan-500/10 text-brand-cyan border-brand-cyan/20",
}) => {
  const [displayValue, setDisplayValue] = useState("0");
  const parsed = parseStatValue(value);

  useEffect(() => {
    if (parsed.type === "string") {
      setDisplayValue(value);
      return;
    }

    let startTimestamp = null;
    const duration = 1000; // 1-second clean transition

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic easing-out formula
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeProgress * parsed.numeric;

      setDisplayValue(formatStatValue(currentVal, parsed.type));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value, parsed.numeric, parsed.type]);

  return (
    <article
      className="glassmorphism rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/50 hover:scale-[1.01] hover:shadow-2xl transition-all duration-300 relative group overflow-hidden select-none"
      aria-label={`${title} statistics card`}
    >
      {/* Dynamic gradient background overlay on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientAccent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0`}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col justify-between h-full gap-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          {Icon && (
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${iconBg} transition-transform duration-300 group-hover:scale-110`}
              aria-hidden="true"
            >
              <Icon size={16} />
            </div>
          )}
        </div>

        {/* Value and Trend row */}
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <span
            className="text-2xl font-bold tracking-tight text-slate-100 font-mono"
            aria-live="polite"
          >
            {displayValue}
          </span>
          {trend !== undefined && trend !== null && (
            <MetricBadge value={trend} />
          )}
        </div>
      </div>
    </article>
  );
});

AnalyticsCard.displayName = "AnalyticsCard";

export default AnalyticsCard;
