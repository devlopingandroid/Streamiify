import React, { memo } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "../ui/Button";

export const AnalyticsError = memo(({
  title = "Failed to load Creator Analytics",
  description = "We encountered a network error while connecting to the Streamify analytics microservice. Please check your network connection and try again.",
  onRetry,
  errorInfo,
}) => {
  return (
    <div
      className="glassmorphism rounded-2xl border border-red-500/10 bg-red-500/5 p-8 text-center max-w-lg mx-auto my-12 animate-fade-in select-none"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 mx-auto mb-5 shadow-inner">
        <AlertTriangle size={24} />
      </div>

      <h2 className="text-base font-bold text-slate-200 mb-2">{title}</h2>
      
      <p className="text-xs text-slate-400 leading-relaxed mb-6 max-w-sm mx-auto">
        {errorInfo?.message || description}
      </p>

      {onRetry && (
        <Button
          variant="danger"
          onClick={onRetry}
          className="mx-auto flex items-center gap-2 px-5 py-2.5 text-xs font-semibold h-10 select-none cursor-pointer"
          title="Retry connecting to API"
          aria-label="Retry loading analytics data"
        >
          <RefreshCcw size={14} className="flex-shrink-0" />
          <span>Retry Connection</span>
        </Button>
      )}
    </div>
  );
});

AnalyticsError.displayName = "AnalyticsError";

export default AnalyticsError;
