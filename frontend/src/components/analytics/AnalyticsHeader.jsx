import React, { memo } from "react";
import { RefreshCw, Download, Calendar } from "lucide-react";
import { Button } from "../ui/Button";

export const AnalyticsHeader = memo(({
  period,
  onPeriodChange,
  onRefresh,
  onExportCSV,
  isRefreshing = false,
  lastUpdated,
}) => {
  const filterOptions = [
    { label: "Last 7 Days", value: "daily" },
    { label: "Last 30 Days", value: "weekly" },
    { label: "Last 90 Days", value: "monthly" },
    { label: "Last Year", value: "yearly" },
  ];

  const formatLastUpdated = (date) => {
    if (!date) return "Never";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-6 select-none" aria-label="Dashboard Header Controls">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Creator Analytics
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2" aria-live="polite">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap sm:justify-end">
        {/* Date Filter selector */}
        <div className="relative flex items-center bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-full px-3 h-10 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all">
          <Calendar size={15} className="text-slate-500 dark:text-slate-400 mr-2 flex-shrink-0" />
          <label htmlFor="period-select" className="sr-only">Choose time period</label>
          <select
            id="period-select"
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 border-none outline-none pr-6 cursor-pointer focus:ring-0 focus:outline-none"
            aria-label="Filter analytics by time period"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh button */}
        <Button
          variant="outline"
          onClick={onRefresh}
          isLoading={isRefreshing}
          className="h-10 text-xs font-semibold px-4 gap-1.5 rounded-full shadow-xs select-none"
          title="Refresh analytics details"
          aria-label="Refresh analytics data"
        >
          {!isRefreshing && <RefreshCw size={14} className="text-slate-500 dark:text-slate-400" />}
          <span>Refresh</span>
        </Button>

        {/* Export CSV button */}
        <Button
          variant="solid"
          onClick={onExportCSV}
          className="h-10 text-xs font-semibold px-4 gap-1.5 rounded-full shadow-xs select-none"
          title="Export statistics summary to CSV"
          aria-label="Export report to CSV"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </Button>
      </div>
    </header>
  );
});

AnalyticsHeader.displayName = "AnalyticsHeader";

export default AnalyticsHeader;
