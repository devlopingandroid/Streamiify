import React, { memo } from "react";
import { AlertCircle, FolderOpen } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";
import { Button } from "../ui/Button";

export const ChartContainer = memo(({
  title,
  subtitle,
  isLoading = false,
  isError = false,
  isEmpty = false,
  onRetry,
  headerActions,
  children,
  className = "",
}) => {
  return (
    <section
      className={`bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 min-h-[360px] flex flex-col relative overflow-hidden transition-all duration-300 shadow-xs hover:shadow-md ${className}`}
      aria-label={title}
    >
      {/* Header section */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap select-none">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </div>

      {/* Body content */}
      <div className="flex-grow flex flex-col justify-center relative w-full h-[280px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col gap-4 justify-between" aria-hidden="true">
            <div className="flex justify-between gap-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/12" />
            </div>
            <Skeleton className="h-[180px] w-full" />
            <div className="flex justify-between gap-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center text-center p-6 animate-fade-in select-none">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
              <AlertCircle size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Failed to load statistics</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[220px] mb-4">
              We had trouble loading the chart metrics from the server.
            </p>
            {onRetry && (
              <Button variant="danger" size="sm" onClick={onRetry} className="h-8 text-[11px] rounded-full">
                Retry Loading
              </Button>
            )}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center text-center p-6 animate-fade-in select-none">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3">
              <FolderOpen size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">No data available</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[220px]">
              No analytics records found for the selected time filter.
            </p>
          </div>
        ) : (
          <div className="w-full h-full animate-fade-in flex flex-col justify-center">
            {children}
          </div>
        )}
      </div>
    </section>
  );
});

ChartContainer.displayName = "ChartContainer";

export default ChartContainer;
